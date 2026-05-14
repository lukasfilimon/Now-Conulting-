import Lenis from 'lenis';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export class ScrollManager {
  readonly lenis: Lenis;
  private rafId: number | null = null;
  private listeners = new Set<(progress: number, velocity: number) => void>();

  constructor() {
    this.lenis = new Lenis({
      duration: 1.2,
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      wheelMultiplier: 1.0,
      touchMultiplier: 1.2,
      infinite: false,
    });

    this.lenis.on('scroll', (e: { progress: number; velocity: number }) => {
      ScrollTrigger.update();
      this.listeners.forEach((cb) => cb(e.progress, e.velocity));
    });

    gsap.ticker.add((time: number) => {
      this.lenis.raf(time * 1000);
    });
    gsap.ticker.lagSmoothing(0);
  }

  start(): void {
    if (this.rafId !== null) return;
    const tick = () => {
      this.rafId = requestAnimationFrame(tick);
    };
    this.rafId = requestAnimationFrame(tick);
  }

  stop(): void {
    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
  }

  scrollTo(target: number | string | HTMLElement, opts?: { duration?: number; offset?: number }): void {
    this.lenis.scrollTo(target, {
      duration: opts?.duration ?? 1.2,
      offset: opts?.offset ?? 0,
    });
  }

  onScroll(cb: (progress: number, velocity: number) => void): () => void {
    this.listeners.add(cb);
    return () => this.listeners.delete(cb);
  }

  refresh(): void {
    ScrollTrigger.refresh();
  }

  dispose(): void {
    this.stop();
    this.lenis.destroy();
    ScrollTrigger.killAll();
    this.listeners.clear();
  }
}
