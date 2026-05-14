uniform float uTime;
uniform float uDissolve;

varying float vNoise;
varying float vFresnel;

// ---- lightweight value noise ----
float h3(vec3 p) {
  p = fract(p * vec3(443.897, 397.297, 491.187));
  p += dot(p.zxy, p.yxz + 19.19);
  return fract(p.x * p.y * p.z);
}

float vnoise(vec3 p) {
  vec3 i = floor(p);
  vec3 f = fract(p);
  vec3 u = f * f * (3.0 - 2.0 * f);
  return mix(
    mix(mix(h3(i),              h3(i+vec3(1,0,0)), u.x),
        mix(h3(i+vec3(0,1,0)), h3(i+vec3(1,1,0)), u.x), u.y),
    mix(mix(h3(i+vec3(0,0,1)), h3(i+vec3(1,0,1)), u.x),
        mix(h3(i+vec3(0,1,1)), h3(i+vec3(1,1,1)), u.x), u.y),
    u.z
  );
}

// 4-octave FBM for organic surface
float fbm(vec3 p) {
  float v = 0.0, a = 0.5;
  for (int i = 0; i < 4; i++) {
    v += a * vnoise(p);
    p = p * 2.07 + 0.8;
    a *= 0.5;
  }
  return v;
}

void main() {
  vec3 n = normalize(position);

  // --- breathing displacement ---
  float noise = fbm(n * 2.3 + uTime * 0.20);
  float disp  = (noise - 0.5) * 0.44;
  vec3 displaced = n * (1.0 + disp);

  // --- explosion burst on scroll ---
  float burst = uDissolve * uDissolve * 3.2;
  displaced *= (1.0 + burst);

  // --- fresnel (view-space normal z) ---
  vec3 viewN = normalize(normalMatrix * n);
  vFresnel = 1.0 - abs(viewN.z);   // 0 = facing camera, 1 = edge
  vNoise   = noise;

  gl_Position = projectionMatrix * modelViewMatrix * vec4(displaced, 1.0);
}
