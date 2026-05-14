uniform float uTime;
uniform float uTransition;
uniform float uVisibility;
uniform float uPointSize;
uniform float uPixelRatio;

attribute vec3 aTarget;
attribute vec3 aSeed;

varying float vAlpha;
varying float vGlow;

void main() {
  float t = clamp(uTransition, 0.0, 1.0);
  float ease = t * t * (3.0 - 2.0 * t);

  vec3 swirl = vec3(
    sin(uTime * 0.4 + aSeed.x * 6.28) * 0.6,
    cos(uTime * 0.3 + aSeed.y * 6.28) * 0.4,
    sin(uTime * 0.5 + aSeed.z * 6.28) * 0.3
  );

  vec3 streamPos = position + swirl * (1.0 - ease);
  vec3 finalPos = mix(streamPos, aTarget, ease);

  vec4 mvPos = modelViewMatrix * vec4(finalPos, 1.0);
  gl_Position = projectionMatrix * mvPos;

  float dist = -mvPos.z;
  gl_PointSize = uPointSize * uPixelRatio * (1.0 / max(dist, 0.5));

  vAlpha = uVisibility * mix(0.6, 1.0, ease);
  vGlow = mix(0.45, 1.0, ease) + sin(uTime * 2.0 + aSeed.x * 6.28) * 0.08;
}
