import {
  WebGLRenderer,
  PerspectiveCamera,
  Scene,
  NoToneMapping,
  SRGBColorSpace,
  PCFSoftShadowMap,
} from 'three';

export interface RendererOptions {
  canvas: HTMLCanvasElement;
  antialias?: boolean;
  alpha?: boolean;
}

export class Renderer {
  readonly gl: WebGLRenderer;
  readonly camera: PerspectiveCamera;
  private resizeListener: () => void;

  constructor(opts: RendererOptions) {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    this.gl = new WebGLRenderer({
      canvas: opts.canvas,
      antialias: opts.antialias ?? true,
      alpha: opts.alpha ?? false,
      powerPreference: 'high-performance',
      stencil: false,
    });

    this.gl.setPixelRatio(dpr);
    this.gl.setSize(window.innerWidth, window.innerHeight);
    this.gl.outputColorSpace = SRGBColorSpace;
    this.gl.toneMapping = NoToneMapping;
    this.gl.toneMappingExposure = 1.0;
    this.gl.shadowMap.enabled = false;
    this.gl.shadowMap.type = PCFSoftShadowMap;
    this.gl.setClearColor(0x000000, 1);

    this.camera = new PerspectiveCamera(
      45,
      window.innerWidth / window.innerHeight,
      0.1,
      100,
    );
    this.camera.position.set(0, 0, 5);

    this.resizeListener = this.onResize.bind(this);
    window.addEventListener('resize', this.resizeListener);
  }

  render(scene: Scene): void {
    this.gl.render(scene, this.camera);
  }

  private onResize(): void {
    const w = window.innerWidth;
    const h = window.innerHeight;
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
    this.gl.setSize(w, h);
  }

  dispose(): void {
    window.removeEventListener('resize', this.resizeListener);
    this.gl.dispose();
  }
}
