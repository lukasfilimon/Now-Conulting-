import { Renderer } from './core/Renderer';
import { Scene } from './core/Scene';
import { AssetManager } from './core/AssetManager';
import { AudioManager } from './core/AudioManager';
import { PerformanceMonitor } from './core/PerformanceMonitor';
import { ScrollManager } from './scroll/ScrollManager';
import { Hero } from './sections/Hero';
import { HeroContent } from './ui/HeroContent';
import { Navigation } from './ui/Navigation';
import { Manifest } from './sections/Manifest';
import { Audience } from './sections/Audience';
import { Approach } from './sections/Approach';
import { Programs } from './sections/Programs';
import { Experiences } from './sections/Experiences';
import { Stimmen } from './sections/Stimmen';
import { Team } from './sections/Team';
import { FAQ } from './sections/FAQ';
import { FinalCTA } from './sections/FinalCTA';
import { Footer } from './sections/Footer';

class NowApp {
  private renderer: Renderer;
  private scene: Scene;
  private assets: AssetManager;
  private audio: AudioManager;
  private perf: PerformanceMonitor;
  private scroll: ScrollManager;
  private hero: Hero | null = null;
  private heroContent: HeroContent | null = null;
  private navigation: Navigation | null = null;
  private approach: Approach | null = null;
  private rafId: number | null = null;

  constructor() {
    const canvas = document.getElementById('webgl-canvas') as HTMLCanvasElement;
    if (!canvas) throw new Error('webgl-canvas not found');

    this.renderer = new Renderer({ canvas });
    this.scene = new Scene();
    this.assets = new AssetManager();
    this.audio = new AudioManager();
    this.perf = new PerformanceMonitor('perf');
    this.scroll = new ScrollManager();

    this.renderer.camera.position.set(0, 0, 5);

    if (import.meta.env.DEV) document.body.classList.add('dev');

    this.buildContentScaffold();
    this.navigation = new Navigation();
    this.mountSections();
    this.wireScrollResponse();
    this.start();
    this.hideBoot();

    // Resize Lenis after content is mounted so it picks up real page height
    requestAnimationFrame(() => this.scroll.lenis.resize());
    setTimeout(() => this.scroll.lenis.resize(), 300);
    setTimeout(() => this.scroll.lenis.resize(), 1000);
    window.addEventListener('load', () => this.scroll.lenis.resize());
  }

  private buildContentScaffold(): void {
    const content = document.getElementById('content');
    if (!content) return;

    const sections = [
      { id: 'hero',        kind: 'hero',     minHeight: '100vh' },
      { id: 'manifest',    kind: 'normal',   minHeight: '90vh', pad: '160px 0' },
      { id: 'audience',    kind: 'normal',   minHeight: 'auto', pad: '140px 0' },
      { id: 'approach',    kind: 'normal',   minHeight: 'auto', pad: '160px 0' },
      { id: 'programs',    kind: 'normal',   minHeight: 'auto', pad: '140px 0' },
      { id: 'experiences', kind: 'normal',   minHeight: 'auto', pad: '140px 0' },
      { id: 'stimmen',     kind: 'normal',   minHeight: 'auto', pad: '140px 0' },
      { id: 'team',        kind: 'normal',   minHeight: 'auto', pad: '140px 0' },
      { id: 'faq',         kind: 'normal',   minHeight: 'auto', pad: '140px 0' },
      { id: 'final-cta',   kind: 'normal',   minHeight: '80vh', pad: '0' },
      { id: 'footer',      kind: 'normal',   minHeight: 'auto', pad: '0' },
    ];

    content.innerHTML = sections
      .map((s) => {
        if (s.kind === 'hero') {
          return `<section id="section-${s.id}" data-section="${s.id}" style="min-height: ${s.minHeight};"></section>`;
        }
        return `
          <section
            id="section-${s.id}"
            data-section="${s.id}"
            style="
              min-height: ${s.minHeight};
              padding: ${s.pad};
              position: relative;
            "
          ></section>
        `;
      })
      .join('');
  }

  private mountSections(): void {
    // Hero (WebGL + HTML overlay)
    const heroSection = document.getElementById('section-hero');
    if (heroSection) {
      this.hero = new Hero(this.scene.root, {
        particleCount: 24000,
        logoText: 'NOW',
        logoImageUrl: '/now-logo.png',
      });
      this.heroContent = new HeroContent(heroSection);
      setTimeout(() => this.heroContent?.reveal(), 600);
    }

    // All remaining sections — pure HTML/CSS, mounted into their scaffold containers
    const mount = (id: string, factory: (el: HTMLElement) => unknown) => {
      const el = document.getElementById(`section-${id}`);
      if (el) factory(el);
    };

    mount('manifest',    (el) => new Manifest(el));
    mount('audience',    (el) => new Audience(el));
    mount('approach',    (el) => { this.approach = new Approach(el); });
    mount('programs',    (el) => new Programs(el));
    mount('experiences', (el) => new Experiences(el));
    mount('stimmen',     (el) => new Stimmen(el));
    mount('team',        (el) => new Team(el));
    mount('faq',         (el) => new FAQ(el));
    mount('final-cta',   (el) => new FinalCTA(el));
    mount('footer',      (el) => new Footer(el));
  }

  private wireScrollResponse(): void {
    const getHeroHeight = () =>
      document.getElementById('section-hero')?.offsetHeight || window.innerHeight || 1080;

    this.scroll.onScroll(() => {
      const scrollY = this.scroll.lenis.scroll || window.scrollY;
      const heroHeight = getHeroHeight();
      const heroProgress = Math.min(1, Math.max(0, scrollY / (heroHeight * 0.95)));

      if (this.hero) this.hero.setProgress(heroProgress);
      if (this.heroContent) this.heroContent.setProgress(heroProgress);
    });
  }

  private start(): void {
    this.scroll.start();
    const tick = () => {
      this.perf.tick();
      if (this.hero) this.hero.update();
      this.renderer.render(this.scene.root);
      this.rafId = requestAnimationFrame(tick);
    };
    tick();
  }

  private hideBoot(): void {
    const boot = document.getElementById('boot');
    if (!boot) return;
    setTimeout(() => boot.classList.add('hidden'), 400);
    setTimeout(() => boot.remove(), 1200);
  }

  dispose(): void {
    if (this.rafId !== null) cancelAnimationFrame(this.rafId);
    this.scroll.dispose();
    this.audio.dispose();
    this.hero?.dispose(this.scene.root);
    this.approach?.dispose();
    this.assets.releaseAll();
    this.renderer.dispose();
  }
}

declare global {
  interface Window {
    nowApp?: NowApp;
  }
}

window.nowApp = new NowApp();
