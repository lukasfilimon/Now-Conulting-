precision highp float;

uniform float uTime;
uniform float uOpacity;
uniform vec2  uResolution;

varying vec2 vUv;

// ── Simplex Noise 2D (Ashima Arts / Stefan Gustavson) ─────────────────────
vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec2 mod289(vec2 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec3 permute(vec3 x) { return mod289(((x * 34.0) + 1.0) * x); }

float snoise(vec2 v) {
  const vec4 C = vec4(0.211324865405187, 0.366025403784439,
                     -0.577350269189626, 0.024390243902439);
  vec2 i  = floor(v + dot(v, C.yy));
  vec2 x0 = v -   i + dot(i, C.xx);
  vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
  vec4 x12 = x0.xyxy + C.xxzz;
  x12.xy -= i1;
  i = mod289(i);
  vec3 p = permute( permute( i.y + vec3(0.0, i1.y, 1.0))
                          + i.x + vec3(0.0, i1.x, 1.0));
  vec3 m = max(0.5 - vec3(dot(x0, x0), dot(x12.xy, x12.xy), dot(x12.zw, x12.zw)), 0.0);
  m = m * m;
  m = m * m;
  vec3 x  = 2.0 * fract(p * C.www) - 1.0;
  vec3 h  = abs(x) - 0.5;
  vec3 ox = floor(x + 0.5);
  vec3 a0 = x - ox;
  m *= 1.79284291400159 - 0.85373472095314 * (a0 * a0 + h * h);
  vec3 g;
  g.x  = a0.x  * x0.x  + h.x  * x0.y;
  g.yz = a0.yz * x12.xz + h.yz * x12.yw;
  return 130.0 * dot(m, g);
}

// ── Fractal Brownian Motion ───────────────────────────────────────────────
float fbm(vec2 p) {
  float v = 0.0;
  float a = 0.5;
  vec2  shift = vec2(uTime * 0.025);
  // 3 octaves only — softer, less wallpaper-y
  for (int i = 0; i < 3; i++) {
    v += a * snoise(p + shift);
    p = p * 2.0 + vec2(1.7, 9.2);
    a *= 0.5;
  }
  return v;
}

void main() {
  // Aspect-corrected coordinates. Lower multiplier = zoomed-out, slower waves
  vec2 uv = vUv;
  vec2 p = (uv - 0.5) * vec2(uResolution.x / uResolution.y, 1.0) * 1.1;

  // Domain warping — moves through the noise field at two different rates
  vec2 q = vec2(
    fbm(p),
    fbm(p + vec2(5.2, 1.3))
  );
  vec2 r = vec2(
    fbm(p + 1.5 * q + vec2(1.7, 9.2) + uTime * 0.02),
    fbm(p + 1.5 * q + vec2(8.3, 2.8) + uTime * 0.018)
  );
  float f = fbm(p + 1.5 * r);

  // Brand gold palette (sRGB-linear approximations of CSS tokens)
  vec3 base  = vec3(0.055, 0.047, 0.039);   // #0e0c0a
  vec3 gold1 = vec3(0.627, 0.470, 0.188);   // #a07830
  vec3 gold2 = vec3(0.886, 0.788, 0.478);   // #e2c97a

  // Wider smoothstep ranges → softer transitions, less crisp pattern edges
  vec3 col = mix(base,  gold1, smoothstep(-0.60, 0.70, f));
  col      = mix(col,   gold2, smoothstep( 0.50, 1.20, f) * 0.6);

  // Strong vignette — keeps the action mid-screen, lets edges go dark
  float d = length(uv - 0.5);
  float vignette = smoothstep(0.70, 0.15, d);
  col = mix(col * 0.15, col, vignette);

  // Overall energy dial — keep it whisper-quiet so content stays loudest
  // Subtle ~30s breathing: ±6% intensity drift so the hero feels alive
  float breath = 0.94 + 0.06 * sin(uTime * 0.21);
  col *= 0.42 * breath;

  // Fade out as user scrolls past the hero (controlled from JS)
  gl_FragColor = vec4(col, uOpacity);
}
