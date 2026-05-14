uniform float uDissolve;
uniform vec3  uColorCore;   // gold-light  #e2c97a
uniform vec3  uColorEdge;   // gold-dark   #a07830
uniform vec3  uColorRim;    // bright cream #f5e5b0

varying float vNoise;
varying float vFresnel;

void main() {
  // --- base gold from noise ---
  vec3 color = mix(uColorEdge, uColorCore, smoothstep(0.30, 0.72, vNoise));

  // --- rim glow (additive blending means rim fragments stack up naturally,
  //     but we also push colour toward the bright cream at edges) ---
  float rim = pow(vFresnel, 1.9);
  color = mix(color, uColorRim, rim * 0.55);

  // --- sparkle highlights in high-noise spots ---
  float sparkle = pow(max(0.0, vNoise - 0.60), 2.4) * 3.6;
  color += uColorCore * sparkle;

  // --- alpha: uniform with softness at rim, fades with dissolve ---
  // rim fades faster so the orb "shell" thins as it explodes
  float dissolveRim = uDissolve + vFresnel * 0.35;
  float alpha = 0.52 * (1.0 - smoothstep(0.0, 1.0, dissolveRim));

  gl_FragColor = vec4(color, clamp(alpha, 0.0, 1.0));
}
