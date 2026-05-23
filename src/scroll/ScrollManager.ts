import Lenis from 'lenis';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export class ScrollManager {
  readonly lenis: Lenis;
  private scrollEndTimeout: number | null = null;
  private listeners = new Set<(progress: number, velocity: number) => void>();

  constructor() {
    this.lenis = new Lenis({
      // 1.2 → 0.9: ~25% schnellere Nav-Click-Scrolls, mehr Tempo-Gefuehl.
      duration: 0.9,
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      wheelMultiplier: 1.0,
      touchMultiplier: 1.2,
      infinite: false,
    });

    this.lenis.on('scroll', (e: { progress: number; velocity: number }) => {
      ScrollTrigger.update();

      // Wichtig: während aktivem Scroll iframes durchlässig schalten.
      // Vimeo-iframes (Erlebnisse, Stimmen, Hero-Trailer) fangen sonst das
      // Wheel-Event ab und Lenis bekommt es nie → ruckelige Scroll-Stopps.
      // Body-Class wird per CSS in index.html ausgewertet: body.is-scrolling iframe { pointer-events: none }
      if (!document.body.classList.contains('is-scrolling')) {
        document.body.classList.add('is-scrolling');
      }
      if (this.scrollEndTimeout !== null) clearTimeout(this.scrollEndTimeout);
      this.scrollEndTimeout = window.setTimeout(() => {
        document.body.classList.remove('is-scrolling');
        this.scrollEndTimeout = null;
      }, 180);

      this.listeners.forEach((cb) => cb(e.progress, e.velocity));
    });

    gsap.ticker.add((time: number) => {
      this.lenis.raf(time * 1000);
    });
    gsap.ticker.lagSmoothing(0);
  }

  scrollTo(target: number | string | HTMLElement, opts?: { duration?: number; offset?: number }): void {
    this.lenis.scrollTo(target, {
      duration: opts?.duration ?? 0.9,
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
    if (this.scrollEndTimeout !== null) clearTimeout(this.scrollEndTimeout);
    this.lenis.destroy();
    ScrollTrigger.killAll();
    this.listeners.clear();
  }
}
