import {
  Mesh,
  PlaneGeometry,
  RawShaderMaterial,
  Scene,
  Vector2,
} from 'three';
import bgVert from '../shaders/background.vert.glsl?raw';
import bgFrag from '../shaders/background.frag.glsl?raw';

/**
 * Fullscreen flowing-gold WebGL background.
 * Renders at the back of the depth buffer (z=0.99 in vertex shader) so all
 * other scene content (mandalas etc.) draws on top automatically.
 */
export class BackgroundShader {
  readonly mesh: Mesh;
  readonly material: RawShaderMaterial;
  private startTime = performance.now();
  private currentOpacity = 1;
  private targetOpacity = 1;
  private onResizeBound: () => void;

  constructor(scene: Scene) {
    const geo = new PlaneGeometry(2, 2);
    this.material = new RawShaderMaterial({
      vertexShader: bgVert,
      fragmentShader: bgFrag,
      uniforms: {
        uTime: { value: 0 },
        uOpacity: { value: 1 },
        uResolution: {
          value: new Vector2(window.innerWidth, window.innerHeight),
        },
      },
      depthTest: false,
      depthWrite: false,
      transparent: true,
    });
    this.mesh = new Mesh(geo, this.material);
    this.mesh.frustumCulled = false;
    this.mesh.renderOrder = -1;
    scene.add(this.mesh);

    this.onResizeBound = this.onResize.bind(this);
    window.addEventListener('resize', this.onResizeBound);
  }

  update(): void {
    this.material.uniforms.uTime.value =
      (performance.now() - this.startTime) / 1000;

    // Smooth lerp current opacity → target. ~0.06 ≈ 400ms zum Annähern @ 60fps.
    const LERP_RATE = 0.06;
    this.currentOpacity += (this.targetOpacity - this.currentOpacity) * LERP_RATE;
    if (Math.abs(this.targetOpacity - this.currentOpacity) < 0.001) {
      this.currentOpacity = this.targetOpacity;
    }
    this.material.uniforms.uOpacity.value = this.currentOpacity;
    this.mesh.visible = this.currentOpacity > 0.001;
  }

  /**
   * Set the desired opacity (0..1) for the current section. Shader smooth-lerpt
   * dorthin im nächsten update()-Tick. Wird aus main.ts wireScrollResponse() basierend
   * auf der gerade dominanten Section gerufen (data-shader-opacity Attribut).
   */
  setTargetOpacity(o: number): void {
    this.targetOpacity = Math.max(0, Math.min(1, o));
  }

  private onResize(): void {
    this.material.uniforms.uResolution.value.set(
      window.innerWidth,
      window.innerHeight,
    );
  }

  dispose(scene: Scene): void {
    window.removeEventListener('resize', this.onResizeBound);
    scene.remove(this.mesh);
    this.mesh.geometry.dispose();
    this.material.dispose();
  }
}
