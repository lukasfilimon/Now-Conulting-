import {
  BufferGeometry,
  BufferAttribute,
  Points,
  ShaderMaterial,
  AdditiveBlending,
  IcosahedronGeometry,
  Mesh,
  Color,
  DoubleSide,
  Scene,
} from 'three';
import morphOrbVert from '../shaders/morphOrb.vert.glsl?raw';
import morphOrbFrag from '../shaders/morphOrb.frag.glsl?raw';
import goldVert from '../shaders/goldParticle.vert.glsl?raw';
import goldFrag from '../shaders/goldParticle.frag.glsl?raw';
import { LogoSampler } from '../core/LogoSampler';

export interface HeroOptions {
  particleCount?: number;
  logoText?: string;
  /** Optional URL to a logo PNG. Particles will form this image when it loads. */
  logoImageUrl?: string;
}

export class Hero {
  readonly morphOrbMesh: Mesh;
  readonly particles: Points;
  readonly morphOrbMaterial: ShaderMaterial;
  readonly particleMaterial: ShaderMaterial;
  private startTime = performance.now();
  private transition = 0;

  constructor(scene: Scene, opts: HeroOptions = {}) {
    const count = opts.particleCount ?? 24000;
    const text = opts.logoText ?? 'NOW';

    // ── Morphing Gold Orb ──────────────────────────────────────────────────
    this.morphOrbMaterial = new ShaderMaterial({
      vertexShader:   morphOrbVert,
      fragmentShader: morphOrbFrag,
      transparent: true,
      depthWrite: false,
      blending: AdditiveBlending,
      side: DoubleSide,            // both faces → natural inner glow at centre
      uniforms: {
        uTime:      { value: 0 },
        uDissolve:  { value: 0 },
        // Brand gold palette from masterclass.now-consulting
        uColorCore: { value: new Color(0xe2c97a) },  // gold-light
        uColorEdge: { value: new Color(0xa07830) },  // gold-dark
        uColorRim:  { value: new Color(0xf5e5b0) },  // bright cream highlight
      },
    });

    // IcosahedronGeometry detail=5 → 5120 verts, smooth enough for organic deform
    const orbGeo = new IcosahedronGeometry(1.0, 5);
    this.morphOrbMesh = new Mesh(orbGeo, this.morphOrbMaterial);
    this.morphOrbMesh.frustumCulled = false;
    scene.add(this.morphOrbMesh);

    // ── Gold Particles (form NOW-Logo on scroll) ───────────────────────────
    const stream = LogoSampler.randomStreamPositions(count, {
      x: 22.0,
      y: 14.0,
      z: 4.0,
    });
    const targets = LogoSampler.sample(count, {
      text,
      worldWidth:  5.5,
      worldHeight: 1.8,
      width:  1024,
      height: 320,
    });
    // Lift logo slightly (no vertical offset needed by default)
    const liftY = 0;
    for (let i = 0; i < count; i++) targets[i * 3 + 1] += liftY;

    const seeds = LogoSampler.seeds(count);

    const geo = new BufferGeometry();
    geo.setAttribute('position', new BufferAttribute(stream,   3));
    geo.setAttribute('aTarget',  new BufferAttribute(targets,  3));
    geo.setAttribute('aSeed',    new BufferAttribute(seeds,    3));

    this.particleMaterial = new ShaderMaterial({
      vertexShader:   goldVert,
      fragmentShader: goldFrag,
      transparent: true,
      depthWrite: false,
      blending: AdditiveBlending,
      uniforms: {
        uTime:       { value: 0 },
        uTransition: { value: 0 },
        uVisibility: { value: 0 },
        uPointSize:  { value: 38 },
        uPixelRatio: { value: Math.min(window.devicePixelRatio, 2) },
        // Brand gold tones
        uColorCore: { value: new Color(0xe2c97a) },  // gold-light
        uColorEdge: { value: new Color(0xa07830) },  // gold-dark
      },
    });

    this.particles = new Points(geo, this.particleMaterial);
    this.particles.frustumCulled = false;
    scene.add(this.particles);

    // Optional: upgrade targets from logo image (async). Site keeps working
    // with text fallback if the image fails to load.
    if (opts.logoImageUrl) {
      this.upgradeTargetsFromImage(opts.logoImageUrl, count);
    }

    window.addEventListener('resize', () => this.onResize());
  }

  private async upgradeTargetsFromImage(url: string, count: number): Promise<void> {
    try {
      const imgTargets = await LogoSampler.sampleImage(url, count, {
        worldWidth: 3.2,
      });
      const attr = this.particles.geometry.getAttribute('aTarget') as BufferAttribute;
      (attr.array as Float32Array).set(imgTargets);
      attr.needsUpdate = true;
    } catch (err) {
      // Silent fallback — text targets stay in place.
      console.warn('[Hero] logo image fallback to text:', err);
    }
  }

  /**
   * Overall hero scroll progress 0..1
   * Phase 1 (0..0.55): Gold orb breathes → expands → dissolves
   * Phase 2 (0.30..1.0): Gold particles emerge → fly to NOW-logo
   */
  setProgress(p: number): void {
    this.transition = Math.max(0, Math.min(1, p));

    // Orb explodes and fades out
    const orbDissolve  = this.smoothstep(0.05, 0.55, this.transition);

    // Particles form logo
    const formation  = this.smoothstep(0.35, 1.0,  this.transition);
    const visibility = this.smoothstep(0.25, 0.65, this.transition);

    this.morphOrbMaterial.uniforms.uDissolve.value     = orbDissolve;
    this.particleMaterial.uniforms.uTransition.value   = formation;
    this.particleMaterial.uniforms.uVisibility.value   = visibility;
  }

  private smoothstep(a: number, b: number, x: number): number {
    const t = Math.max(0, Math.min(1, (x - a) / (b - a)));
    return t * t * (3 - 2 * t);
  }

  update(): void {
    const elapsed = (performance.now() - this.startTime) / 1000;
    this.morphOrbMaterial.uniforms.uTime.value   = elapsed;
    this.particleMaterial.uniforms.uTime.value   = elapsed;
  }

  private onResize(): void {
    this.particleMaterial.uniforms.uPixelRatio.value = Math.min(
      window.devicePixelRatio,
      2,
    );
  }

  dispose(scene: Scene): void {
    scene.remove(this.morphOrbMesh);
    scene.remove(this.particles);
    this.morphOrbMesh.geometry.dispose();
    this.morphOrbMaterial.dispose();
    this.particles.geometry.dispose();
    this.particleMaterial.dispose();
  }
}
