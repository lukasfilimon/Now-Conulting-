precision highp float;

uniform vec3 uColorCore;
uniform vec3 uColorEdge;

varying float vAlpha;
varying float vGlow;

void main() {
  vec2 c = gl_PointCoord - vec2(0.5);
  float d = length(c);
  if (d > 0.5) discard;

  // Both edges must use ascending (edge0 < edge1) to avoid GLSL undefined behavior.
  // core: 1 at center, 0 at boundary → invert smoothstep
  // edge: 1 inside disc, 0 outside → invert smoothstep on the alpha falloff
  float core = 1.0 - smoothstep(0.0, 0.5, d);
  float edge = 1.0 - smoothstep(0.15, 0.5, d);

  vec3 color = mix(uColorEdge, uColorCore, core);
  // Gold-tinted bloom — keeps highlight gold instead of burning to white
  float bloom = pow(core, 2.5) * vGlow * 1.6;
  color += vec3(bloom * 1.0, bloom * 0.7, bloom * 0.22);

  gl_FragColor = vec4(color, edge * vAlpha);
}
