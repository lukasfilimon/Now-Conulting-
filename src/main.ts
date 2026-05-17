import { Renderer } from './core/Renderer';
import { Scene } from './core/Scene';
import { AssetManager } from './core/AssetManager';
import { AudioManager } from './core/AudioManager';
import { PerformanceMonitor } from './core/PerformanceMonitor';
import { ScrollManager } from './scroll/ScrollManager';
import { BackgroundShader } from './sections/BackgroundShader';
import { HeroParticles } from './sections/HeroParticles';
import { HeroContent } from './ui/HeroContent';
import { Navigation } from './ui/Navigation';
import { StatStrip } from './sections/StatStrip';
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
import { VideoCoordinator } from './core/VideoCoordinator';

class NowApp {
  private renderer: Renderer;
  private scene: Scene;
  private assets: AssetManager;
  private audio: AudioManager;
  private perf: PerformanceMonitor;
  // public — Navigation.ts greift via window.nowApp.scroll auf den Lenis-Instance zu
  readonly scroll: ScrollManager;
  private heroContent: HeroContent | null = null;
  private navigation: Navigation | null = null;
  private audience: Audience | null = null;
  private approach: Approach | null = null;
  private background: BackgroundShader | null = null;
  private particles: HeroParticles | null = null;
  private videoCoordinator: VideoCoordinator | null = null;
  private rafId: number | null = null;
  // Cache aller Content-Sections — beim Mount einmal befüllt, bei Resize re-built.
  // Ersetzt das vorherige querySelectorAll pro Scroll-Frame (~660 reads/sec @ 60fps).
  private sectionCache: HTMLElement[] = [];

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
    this.injectSectionBackgrounds();
    this.navigation = new Navigation();
    this.mountSections();
    this.videoCoordinator = new VideoCoordinator();
    this.videoCoordinator.init();
    this.wireScrollResponse();
    this.start();
    this.hideBoot();

    // Section-Cache befüllen — verzögert damit Audience-GSAP-Pin
    // (wrappt section in pin-spacer) bereits abgeschlossen ist.
    // Re-build bei resize damit neue Section-Positionen erfasst werden.
    requestAnimationFrame(() => this.buildSectionCache());
    setTimeout(() => this.buildSectionCache(), 600);
    window.addEventListener('resize', () => this.buildSectionCache(), { passive: true });

    // Resize Lenis after content is mounted so it picks up real page height
    requestAnimationFrame(() => this.scroll.lenis.resize());
    setTimeout(() => this.scroll.lenis.resize(), 300);
    setTimeout(() => this.scroll.lenis.resize(), 1000);
    window.addEventListener('load', () => this.scroll.lenis.resize());
  }

  /**
   * Findet alle Content-Sections im DOM und cached die Referenzen.
   * `main#content section[data-section]` (descendant, kein direct-child `>`):
   * GSAP-Pin wrappt Audience in einen pin-spacer, deshalb würde `>` sie verlieren.
   */
  private buildSectionCache(): void {
    this.sectionCache = Array.from(
      document.querySelectorAll<HTMLElement>('main#content section[data-section]'),
    );
  }

  private buildContentScaffold(): void {
    const content = document.getElementById('content');
    if (!content) return;

    // shaderOpacity: Target-Opacity des Hero-WebGL-Shaders wenn diese Section dominant ist.
    // 1.0 = full (Hero), 0.35 = sanfter Hintergrund-Modus, 0 = Shader aus.
    // Einheitliches Spacing-System: alle Content-Sections haben pad: '80px 0'.
    // Zwei aneinandergrenzende Sections ergeben daher eine sichtbare Lücke
    // von 160px — kompakt aber mit klarer Trennung.
    // Hero, Stat-Strip, Final-CTA und Footer haben ihr eigenes Layout-Konzept
    // (Vollbild / Inset-Klimax) und behalten daher pad: '0'.
    const sections = [
      { id: 'hero',        kind: 'hero',     minHeight: 'auto',                       shaderOpacity: 1.0 },
      { id: 'stat-strip',  kind: 'normal',   minHeight: 'auto', pad: '0',             shaderOpacity: 0.35 },
      { id: 'manifest',    kind: 'normal',   minHeight: 'auto', pad: '80px 0',        shaderOpacity: 0 },
      { id: 'audience',    kind: 'normal',   minHeight: 'auto', pad: '80px 0',        shaderOpacity: 0.35 },
      { id: 'approach',    kind: 'normal',   minHeight: 'auto', pad: '80px 0',        shaderOpacity: 0.35 },
      { id: 'programs',    kind: 'normal',   minHeight: 'auto', pad: '80px 0',        shaderOpacity: 0.35 },
      { id: 'experiences', kind: 'normal',   minHeight: 'auto', pad: '80px 0',        shaderOpacity: 0.35 },
      { id: 'stimmen',     kind: 'normal',   minHeight: 'auto', pad: '80px 0',        shaderOpacity: 0.35 },
      { id: 'team',        kind: 'normal',   minHeight: 'auto', pad: '80px 0',        shaderOpacity: 0.35 },
      { id: 'final-cta',   kind: 'normal',   minHeight: '80vh', pad: '0',             shaderOpacity: 0 },
      { id: 'faq',         kind: 'normal',   minHeight: 'auto', pad: '80px 0',        shaderOpacity: 0.35 },
      { id: 'footer',      kind: 'normal',   minHeight: 'auto', pad: '0',             shaderOpacity: 0.35 },
    ];

    content.innerHTML = sections
      .map((s) => {
        if (s.kind === 'hero') {
          return `<section id="section-${s.id}" data-section="${s.id}" data-shader-opacity="${s.shaderOpacity}" style="min-height: ${s.minHeight};"></section>`;
        }
        return `
          <section
            id="section-${s.id}"
            data-section="${s.id}"
            data-shader-opacity="${s.shaderOpacity}"
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

  private injectSectionBackgrounds(): void {
    if (document.getElementById('section-bg-styles')) return;
    const style = document.createElement('style');
    style.id = 'section-bg-styles';
    style.textContent = `
      main#content > section[data-section] {
        position: relative;
        isolation: isolate;
      }
      main#content > section[data-section]::before {
        content: '';
        position: absolute;
        inset: 0;
        pointer-events: none;
        z-index: -1;
        /* Fließender Übergang zwischen Section-Hintergründen:
           jeder ::before fadet an Top und Bottom auf 0 → Sections
           gehen nahtlos ineinander über, keine sichtbare horizontale Cut-Kante. */
        -webkit-mask-image: linear-gradient(to bottom, transparent 0%, black 12%, black 88%, transparent 100%);
        mask-image: linear-gradient(to bottom, transparent 0%, black 12%, black 88%, transparent 100%);
      }
      /* Final-CTA: Ausnahme. Der Climax-Glow MUSS am Bottom-Rand kleben
         (übergang zu Footer als finales Crescendo) — kein Fade. */
      main#content > section[data-section="final-cta"]::before {
        -webkit-mask-image: none;
        mask-image: none;
      }

      /* Stat-Strip — leiser Spotlight im Zentrum */
      section[data-section="stat-strip"]::before {
        background: radial-gradient(60% 140% at 50% 50%, rgba(201, 168, 76, 0.05), transparent 75%);
      }

      /* CSS-Variable als typed-property — ermöglicht smoothe Transition */
      @property --spotlight-y {
        syntax: '<percentage>';
        inherits: false;
        initial-value: 50%;
      }

      /* Manifest — Bild-Hintergrund + atmender Spotlight, vertikal zentriert */
      section[data-section="manifest"] {
        display: flex;
        align-items: center;
        justify-content: center;
        --spotlight-y: 50%;
        transition: --spotlight-y 900ms cubic-bezier(0.16, 1, 0.3, 1);
        overflow: hidden;
      }
      /* Layer 1 — Spotlight-Gradient, folgt aktiver Frage via --spotlight-y */
      section[data-section="manifest"]::after {
        content: '';
        position: absolute;
        inset: 0;
        background:
          radial-gradient(55% 60% at 50% var(--spotlight-y), rgba(201, 168, 76, 0.18), transparent 70%),
          radial-gradient(80% 100% at 50% var(--spotlight-y), rgba(201, 168, 76, 0.07), transparent 80%);
        animation: manifest-spotlight-breath 32s ease-in-out infinite;
        z-index: -1;
        pointer-events: none;
      }
      @keyframes manifest-spotlight-breath {
        0%, 100% { opacity: 0.88; }
        50%      { opacity: 1; }
      }
      @media (max-width: 768px) {
        section[data-section="manifest"]::after {
          background:
            radial-gradient(85% 50% at 50% var(--spotlight-y), rgba(201, 168, 76, 0.20), transparent 70%);
        }
      }
      @media (prefers-reduced-motion: reduce) {
        section[data-section="manifest"] {
          transition: none;
        }
        section[data-section="manifest"]::after {
          animation: none;
          opacity: 1;
        }
      }

      /* Audience — kein statisches Overlay mehr (Shader läuft drunter durch) */

      /* Approach — 4 Milestone-Hairlines (vertikal, sehr dezent) */
      section[data-section="approach"]::before {
        background: linear-gradient(90deg,
          transparent 19.7%, rgba(201, 168, 76, 0.06) 20%, transparent 20.3%,
          transparent 39.7%, rgba(201, 168, 76, 0.06) 40%, transparent 40.3%,
          transparent 59.7%, rgba(201, 168, 76, 0.06) 60%, transparent 60.3%,
          transparent 79.7%, rgba(201, 168, 76, 0.06) 80%, transparent 80.3%);
      }

      /* Programs — Spotlight hinter den Karten */
      section[data-section="programs"]::before {
        background: radial-gradient(55% 80% at 50% 50%, rgba(201, 168, 76, 0.07), transparent 70%);
      }

      /* Experiences — leichte obere Wärme */
      section[data-section="experiences"]::before {
        background: linear-gradient(180deg, rgba(201, 168, 76, 0.04), transparent 40%);
      }

      /* Stimmen — dezente Vignette */
      section[data-section="stimmen"]::before {
        background: radial-gradient(80% 100% at 50% 50%, transparent 55%, rgba(0, 0, 0, 0.45));
      }

      /* Team — sanfter Top-Glow */
      section[data-section="team"]::before {
        background: linear-gradient(180deg, rgba(201, 168, 76, 0.05), transparent 30%);
      }

      /* FAQ — minimal, schmaler Glow-Streifen mittig */
      section[data-section="faq"]::before {
        background: radial-gradient(40% 80% at 50% 50%, rgba(201, 168, 76, 0.03), transparent 70%);
      }

      /* Final-CTA — KEIN ::before Background.
         Die Section bringt ihren eigenen Hintergrund mit (Matrix-Rain + Gold-Overlays
         + Shimmer) in FinalCTA.ts. Der frühere Climax-Bottom-Glow wurde entfernt
         damit er nicht mit dem neuen Matrix-Layer kollidiert.
         Auch shaderOpacity ist für diese Section 0 (siehe section config oben) —
         der globale Three.js BackgroundShader läuft hier nicht durch. */

      /* ═══════════════════════════════════════════════════════════
         GLOBALE SECTION-CTA — Solid Gold, Hero-Pattern
         ═══════════════════════════════════════════════════════════
         Wird in Audience, Approach, Experiences, Stimmen genutzt.
         Identischer Stil wie program-cta für visuelle Konsistenz.
         Sections wrappen den CTA in einen Container der initial
         transparent ist und mit der .reveal-Klasse einfadet. */
      .section-cta-wrap {
        display: flex;
        justify-content: center;
        margin-top: 64px;
        opacity: 0;
        transform: translateY(16px);
        transition:
          opacity 900ms cubic-bezier(0.16, 1, 0.3, 1),
          transform 900ms cubic-bezier(0.16, 1, 0.3, 1);
        transition-delay: 700ms;
      }
      .approach-wrap.reveal .section-cta-wrap,
      .experiences-wrap.reveal .section-cta-wrap,
      .stimmen-wrap.reveal .section-cta-wrap {
        opacity: 1;
        transform: translateY(0);
      }
      .section-cta {
        display: inline-flex;
        align-items: center;
        gap: 14px;
        padding: 18px 44px;
        border: none;
        border-radius: 4px;
        background: linear-gradient(135deg, var(--color-gold), var(--color-gold-dark));
        color: var(--color-black);
        font-family: var(--font-body);
        font-size: 15px;
        font-weight: 500;
        letter-spacing: 0.04em;
        text-decoration: none;
        cursor: pointer;
        box-shadow:
          0 0 18px rgba(201, 168, 76, 0.28),
          0 4px 16px rgba(201, 168, 76, 0.18);
        transition:
          background 400ms cubic-bezier(0.16, 1, 0.3, 1),
          box-shadow 400ms cubic-bezier(0.16, 1, 0.3, 1),
          transform 400ms cubic-bezier(0.16, 1, 0.3, 1);
      }
      .section-cta:hover {
        background: linear-gradient(135deg, var(--color-gold-light), var(--color-gold));
        box-shadow:
          0 0 36px rgba(201, 168, 76, 0.55),
          0 8px 32px rgba(201, 168, 76, 0.35);
        transform: translateY(-2px);
      }
      .section-cta-arrow {
        font-weight: 600;
      }
      @media (prefers-reduced-motion: reduce) {
        .section-cta-wrap {
          opacity: 1;
          transform: none;
          transition: none;
        }
      }
    `;
    document.head.appendChild(style);
  }

  private mountSections(): void {
    // Background — flowing gold light WebGL shader, behind all scene content
    this.background = new BackgroundShader(this.scene.root);
    // Drifting gold particles — ambient layer above shader, fades with hero scroll
    this.particles = new HeroParticles();

    // Hero (HTML overlay only — WebGL orb/particles removed)
    const heroSection = document.getElementById('section-hero');
    if (heroSection) {
      this.heroContent = new HeroContent(heroSection);
      setTimeout(() => this.heroContent?.reveal(), 600);
    }

    // All remaining sections — pure HTML/CSS, mounted into their scaffold containers
    const mount = (id: string, factory: (el: HTMLElement) => unknown) => {
      const el = document.getElementById(`section-${id}`);
      if (el) factory(el);
    };

    mount('stat-strip',  (el) => new StatStrip(el));
    mount('manifest',    (el) => new Manifest(el));
    mount('audience',    (el) => { this.audience = new Audience(el); });
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

    const handleScroll = () => {
      const scrollY = this.scroll.lenis.scroll || window.scrollY;
      const heroHeight = getHeroHeight();
      const heroProgress = Math.min(1, Math.max(0, scrollY / (heroHeight * 0.95)));

      if (this.heroContent) this.heroContent.setProgress(heroProgress);
      if (this.particles) this.particles.setProgress(heroProgress);

      // Shader-Opacity: Section mit Center am nächsten zum Viewport-Center gewinnt.
      // (Robust gegen kurze Sections wie Stat-Strip, deren Center selten exakt
      //  am Viewport-Center liegt.) BackgroundShader.update() lerpt smooth zum Target.
      // Section-Liste kommt aus this.sectionCache (gebaut in buildSectionCache,
      // re-built bei resize) — kein DOM-Query pro Frame mehr.
      if (this.background && this.sectionCache.length > 0) {
        const viewportH = window.innerHeight;
        const viewportCenter = viewportH * 0.5;
        let bestDist = Infinity;
        let target = 1.0;
        for (const sec of this.sectionCache) {
          const rect = sec.getBoundingClientRect();
          const sectionCenter = (rect.top + rect.bottom) / 2;
          const dist = Math.abs(sectionCenter - viewportCenter);
          if (dist < bestDist) {
            bestDist = dist;
            const val = parseFloat(sec.dataset.shaderOpacity || '0.35');
            if (!Number.isNaN(val)) target = val;
          }
        }
        this.background.setTargetOpacity(target);
      }

      // Audience: ehemalige Vision-Card-Progress-Logik entfernt.
      // Reveal-Choreografie läuft jetzt via GSAP ScrollTrigger (Pin-basiert)
      // direkt in Audience.ts. Siehe setupPinnedReveal() dort.
    };

    this.scroll.onScroll(handleScroll);
    // Initial-Fire: für Deep-Link / Reload mit gespeicherter Scroll-Position
    handleScroll();
  }

  private start(): void {
    // ScrollManager braucht keinen eigenen RAF — Lenis läuft via gsap.ticker.
    const tick = () => {
      this.perf.tick();
      if (this.background) this.background.update();
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
    this.background?.dispose(this.scene.root);
    this.particles?.dispose();
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
