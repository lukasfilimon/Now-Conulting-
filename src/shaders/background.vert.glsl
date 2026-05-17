attribute vec3 position;
varying vec2 vUv;

void main() {
  vUv = position.xy * 0.5 + 0.5;
  // z = 0.99 keeps the quad behind everything else in the scene
  gl_Position = vec4(position.xy, 0.99, 1.0);
}
