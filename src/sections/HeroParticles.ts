/**
 * Ambient drifting gold particles — Aesop-style "dust in a sunbeam".
 * Tuned subtle on purpose so they layer with the WebGL shader without competing.
 * Fades out with hero scroll progress (mirrored from BackgroundShader).
 */
interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  baseAlpha: number;
  twinklePhase: number;
  twinkleSpeed: number;
}

const PARTICLE_COUNT = 28;

export class HeroParticles {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private particles: Particle[] = [];
  private dpr: number;
  private width = 0;
  private height = 0;
  private opacity = 1;
  private rafId: number | null = null;
  private startTime = performance.now();
  private onResizeBound: () => void;

  constructor() {
    this.dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.canvas = document.createElement('canvas');
    this.canvas.id = 'hero-particles-canvas';
    Object.assign(this.canvas.style, {
      position: 'fixed',
      top: '0',
      left: '0',
      width: '100%',
      height: '100%',
      zIndex: '1',
      pointerEvents: 'none',
    } as CSSStyleDeclaration);
    document.body.appendChild(this.canvas);
    this.ctx = this.canvas.getContext('2d') as CanvasRenderingContext2D;

    this.resize();
    this.spawn();

    this.onResizeBound = this.resize.bind(this);
    window.addEventListener('resize', this.onResizeBound);
    this.start();
  }

  private resize(): void {
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.canvas.width = this.width * this.dpr;
    this.canvas.height = this.height * this.dpr;
    this.ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
  }

  private spawn(): void {
    this.particles.length = 0;
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      this.particles.push({
        x: Math.random() * this.width,
        y: Math.random() * this.height,
        vx: (Math.random() - 0.5) * 0.18,
        vy: (Math.random() - 0.5) * 0.14 - 0.04, // gentle upward bias
        size: 0.8 + Math.random() * 1.8,
        baseAlpha: 0.18 + Math.random() * 0.30,
        twinklePhase: Math.random() * Math.PI * 2,
        twinkleSpeed: 0.6 + Math.random() * 0.8,
      });
    }
  }

  private start(): void {
    const tick = () => {
      this.update();
      this.draw();
      this.rafId = requestAnimationFrame(tick);
    };
    tick();
  }

  private update(): void {
    const w = this.width;
    const h = this.height;
    for (const p of this.particles) {
      p.x += p.vx;
      p.y += p.vy;
      // wrap edges
      if (p.x < -10) p.x = w + 10;
      else if (p.x > w + 10) p.x = -10;
      if (p.y < -10) p.y = h + 10;
      else if (p.y > h + 10) p.y = -10;
    }
  }

  private draw(): void {
    const ctx = this.ctx;
    ctx.clearRect(0, 0, this.width, this.height);

    if (this.opacity < 0.01) return;

    const t = (performance.now() - this.startTime) / 1000;
    for (const p of this.particles) {
      const twinkle = 0.65 + 0.35 * Math.sin(t * p.twinkleSpeed + p.twinklePhase);
      const alpha = p.baseAlpha * twinkle * this.opacity;
      // Soft gold dot with falloff via radial gradient (cached via fillStyle string is fine for 28 dots)
      const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size * 3);
      grad.addColorStop(0, `rgba(241, 220, 150, ${alpha})`);
      grad.addColorStop(0.5, `rgba(226, 201, 122, ${alpha * 0.5})`);
      grad.addColorStop(1, 'rgba(201, 168, 76, 0)');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size * 3, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  /** Hero scroll progress 0..1 — fades particles out as user leaves the hero. */
  setProgress(p: number): void {
    const t = Math.max(0, Math.min(1, p));
    if (t <= 0.30) {
      this.opacity = 1;
    } else {
      this.opacity = Math.max(0, 1 - (t - 0.30) / 0.50);
    }
  }

  dispose(): void {
    if (this.rafId !== null) cancelAnimationFrame(this.rafId);
    window.removeEventListener('resize', this.onResizeBound);
    this.canvas.remove();
  }
}
