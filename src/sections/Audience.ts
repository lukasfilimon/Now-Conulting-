import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { copy } from '../content/copy';

gsap.registerPlugin(ScrollTrigger);

/**
 * Audience / Pain section — Twin-Cards mit Scroll-Pin-Reveal-Choreografie.
 * Wenn das Bild zentriert im Viewport ist, pin't die Section.
 * Phase 1: Pain-Card slidet von LINKS rein.
 * Phase 2: Vision-Card slidet von RECHTS rein.
 * Erst danach setzt der normale Scroll fort.
 */
export class Audience {
  readonly root: HTMLElement;
  private revealed = false;
  private scrollTriggerInstance: ScrollTrigger | null = null;

  constructor(container: HTMLElement) {
    const { audience } = copy;
    container.innerHTML = `
      <div class="audience-wrap">
        <div class="audience-header">
          <span class="audience-eyebrow">${audience.eyebrow}</span>
          <h2 class="audience-headline">${this.italicize(audience.headline)}</h2>
          <p class="audience-sub">${this.escape(audience.sub)}</p>
        </div>
        <div class="audience-grid">
          <div class="audience-grid-bg" aria-hidden="true"></div>
          ${this.renderCard('pain', audience.before)}
          ${this.renderCard('vision', audience.after)}
        </div>
      </div>
    `;
    this.root = container.querySelector('.audience-wrap') as HTMLElement;
    this.injectStyles();
    this.observe();

    // Set initial off-screen state synchronously to prevent first-paint flash
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!reduceMotion) {
      const painCard = container.querySelector('.audience-card--pain');
      const visionCard = container.querySelector('.audience-card--vision');
      gsap.set(painCard, { xPercent: -120, opacity: 0 });
      gsap.set(visionCard, { xPercent: 120, opacity: 0 });
      // Setup ScrollTrigger after layout settles
      requestAnimationFrame(() => this.setupPinnedReveal());
    }
  }

  private setupPinnedReveal(): void {
    const section = document.getElementById('section-audience');
    const grid = this.root.querySelector<HTMLElement>('.audience-grid');
    const painCard = this.root.querySelector<HTMLElement>('.audience-card--pain');
    const visionCard = this.root.querySelector<HTMLElement>('.audience-card--vision');
    if (!section || !grid || !painCard || !visionCard) return;

    // Mobile: kein Pin (gestapeltes Layout, anderes Verhalten gewünscht)
    const isMobile = window.matchMedia('(max-width: 768px)').matches;
    if (isMobile) {
      // Auf Mobile: einfacher Reveal via Stagger statt Pin
      gsap.to(painCard, {
        xPercent: 0,
        opacity: 1,
        duration: 0.9,
        ease: 'power2.out',
        scrollTrigger: { trigger: grid, start: 'top 75%' },
      });
      gsap.to(visionCard, {
        xPercent: 0,
        opacity: 1,
        duration: 0.9,
        ease: 'power2.out',
        delay: 0.3,
        scrollTrigger: { trigger: grid, start: 'top 75%' },
      });
      return;
    }

    // Desktop: Pin-Reveal Choreografie
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: grid,
        start: 'center center',  // Pin wenn Bild zentriert ist
        end: '+=1400',           // 1400px virtueller Scroll für beide Cards + Pause
        pin: section,            // ganze Section pinnen für visuelle Kohäsion
        scrub: 1,                // smooth scrub
        anticipatePin: 1,
      },
    });

    // Phase 1 (0 → ~45% des Pin-Scrolls): Pain slidet von links rein
    tl.to(painCard, {
      xPercent: 0,
      opacity: 1,
      duration: 1,
      ease: 'power2.out',
    });

    // Phase 2 (~10% Pause damit Pain "einrasten" kann)
    tl.to({}, { duration: 0.2 });

    // Phase 3 (~45% → 100%): Vision slidet von rechts rein
    tl.to(visionCard, {
      xPercent: 0,
      opacity: 1,
      duration: 1,
      ease: 'power2.out',
    });

    this.scrollTriggerInstance = tl.scrollTrigger || null;
  }

  private renderCard(
    kind: 'pain' | 'vision',
    data: { label: string; items: string[] },
  ): string {
    const dividerClass = kind === 'vision' ? 'audience-divider audience-divider--gold' : 'audience-divider';
    const itemsHtml = data.items
      .map((t) => `<p class="audience-line">${this.escape(t)}</p>`)
      .join(`<div class="${dividerClass}"></div>`);
    return `
      <div class="audience-card audience-card--${kind}">
        <div class="audience-card-head">
          <span class="audience-col-label">${this.escape(data.label)}</span>
        </div>
        <hr class="audience-head-rule" />
        ${itemsHtml}
      </div>
    `;
  }

  private italicize(text: string): string {
    return `<em>${this.escape(text)}</em>`;
  }

  private escape(text: string): string {
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }

  private observe(): void {
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting && !this.revealed) {
            this.revealed = true;
            this.root.classList.add('reveal');
            io.disconnect();
          }
        }
      },
      { threshold: 0.2 },
    );
    io.observe(this.root);
  }

  private injectStyles(): void {
    if (document.getElementById('audience-styles')) return;
    const style = document.createElement('style');
    style.id = 'audience-styles';
    style.textContent = `
      .audience-wrap {
        max-width: 1180px;
        margin: 0 auto;
        padding: 0 32px;
        display: flex;
        flex-direction: column;
        gap: 72px;
      }
      .audience-header {
        text-align: center;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 18px;
        opacity: 0;
        transform: translateY(20px);
        transition: opacity 900ms ease-out, transform 900ms ease-out;
      }
      .audience-wrap.reveal .audience-header {
        opacity: 1;
        transform: translateY(0);
      }
      .audience-eyebrow {
        font-family: var(--font-mono);
        font-size: 11px;
        font-weight: 600;
        letter-spacing: 0.32em;
        color: var(--color-gold);
        text-transform: uppercase;
      }
      .audience-headline {
        font-family: var(--font-display);
        font-weight: 500;
        font-size: clamp(1.8rem, 3.2vw, 2.8rem);
        line-height: 1.25;
        max-width: 820px;
        margin: 0;
        color: var(--color-text);
        text-wrap: balance;
      }
      .audience-headline em {
        font-style: italic;
        font-weight: 500;
      }
      .audience-sub {
        font-family: var(--font-display);
        font-style: italic;
        font-size: 17px;
        line-height: 1.55;
        color: rgba(228, 222, 210, 0.7);
        max-width: 640px;
        margin: 0;
        letter-spacing: 0.005em;
      }
      /* Grid wie vor den Bildern — kein Frame, kein BG, keine Padding */
      .audience-grid {
        position: relative;
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 64px;
        opacity: 0;
        transition: opacity 1200ms cubic-bezier(0.16, 1, 0.3, 1) 300ms;
      }
      .audience-wrap.reveal .audience-grid {
        opacity: 1;
      }

      /* Transparentes SVG-Bild als Layer hinter den Cards — sanfter Ken-Burns */
      .audience-grid-bg {
        position: absolute;
        inset: 0;
        pointer-events: none;
        z-index: 0;
      }
      .audience-grid-bg::before {
        content: '';
        position: absolute;
        inset: 0;
        background: url('/images/Pillen 1.svg') center / contain no-repeat;
        will-change: transform;
        animation: audience-bg-kenburns 42s ease-in-out infinite alternate;
      }
      @keyframes audience-bg-kenburns {
        0%   { transform: scale(1.00) translate( 0.0%,  0.0%); }
        50%  { transform: scale(1.03) translate(-0.8%, -0.5%); }
        100% { transform: scale(1.05) translate( 0.8%,  0.5%); }
      }

      /* Card-Basis — beide Cards haben identische Maße */
      .audience-card {
        position: relative;
        z-index: 1;
        display: flex;
        flex-direction: column;
        gap: 26px;
        padding: 44px 36px;
        border: 1px solid transparent;
        border-radius: 18px;
      }

      /* 2-Tier Header: kleiner Eyebrow + große Display-Italic Subline */
      .audience-card-head {
        display: flex;
        flex-direction: column;
        gap: 12px;
      }

      /* Gradient-Hairline trennt Header von Items */
      .audience-head-rule {
        height: 1px;
        border: none;
        margin: 0;
        background: linear-gradient(90deg, transparent, currentColor, transparent);
        opacity: 0.25;
      }

      /* Pain-Card — Matrix Blau-Pille: kühles Blau-Glas (Verharren in der aktuellen Realität) */
      .audience-card--pain {
        background: rgba(22, 28, 44, 0.55);
        backdrop-filter: blur(14px) saturate(115%);
        -webkit-backdrop-filter: blur(14px) saturate(115%);
        border-color: rgba(110, 130, 170, 0.24);
        box-shadow:
          inset 0 1px 0 rgba(200, 215, 235, 0.10),
          0 6px 14px rgba(0, 0, 0, 0.30),
          0 26px 64px rgba(0, 0, 0, 0.50),
          0 0 70px rgba(70, 110, 180, 0.18);
        transition:
          box-shadow 500ms cubic-bezier(0.16, 1, 0.3, 1),
          border-color 500ms cubic-bezier(0.16, 1, 0.3, 1);
      }
      .audience-card--pain:hover {
        border-color: rgba(130, 165, 210, 0.38);
        box-shadow:
          inset 0 1px 0 rgba(200, 215, 235, 0.16),
          0 8px 18px rgba(0, 0, 0, 0.35),
          0 36px 90px rgba(0, 0, 0, 0.62),
          0 0 100px rgba(90, 140, 205, 0.25);
      }
      .audience-card--pain .audience-col-label {
        color: rgba(155, 175, 200, 0.80);
      }
      .audience-card--pain .audience-head-rule {
        color: rgba(150, 170, 200, 0.5);
      }
      .audience-card--pain .audience-line {
        color: rgba(180, 195, 215, 0.82);
      }
      .audience-card--pain .audience-divider {
        background: rgba(130, 160, 200, 0.16);
      }

      /* Vision-Card — Matrix Rot-Pille: warmes Rot-Glas (Erwachen / Wunsch-Realität).
         Gold-Akzente in Label/Lines/Bullet/Divider bleiben — Brand-Faden erhalten. */
      .audience-card--vision {
        background: rgba(170, 65, 65, 0.10);
        backdrop-filter: blur(14px) saturate(140%);
        -webkit-backdrop-filter: blur(14px) saturate(140%);
        border-color: rgba(190, 85, 80, 0.30);
        box-shadow:
          inset 0 1px 0 rgba(255, 230, 165, 0.24),
          inset 0 0 80px rgba(190, 85, 80, 0.06),
          0 6px 14px rgba(0, 0, 0, 0.25),
          0 26px 64px rgba(0, 0, 0, 0.45),
          0 0 80px rgba(220, 95, 80, 0.18);
        transition:
          box-shadow 500ms cubic-bezier(0.16, 1, 0.3, 1),
          border-color 500ms cubic-bezier(0.16, 1, 0.3, 1);
        will-change: transform, opacity;
      }
      .audience-card--vision:hover {
        border-color: rgba(210, 100, 90, 0.42);
        box-shadow:
          inset 0 1px 0 rgba(255, 230, 165, 0.34),
          inset 0 0 100px rgba(210, 100, 90, 0.08),
          0 8px 18px rgba(0, 0, 0, 0.30),
          0 36px 90px rgba(0, 0, 0, 0.55),
          0 0 110px rgba(225, 105, 90, 0.28);
      }
      .audience-card--vision .audience-col-label {
        color: var(--color-gold);
      }
      .audience-card--vision .audience-head-rule {
        color: rgba(201, 168, 76, 0.6);
      }
      .audience-card--vision .audience-line {
        color: var(--color-gold-light);
      }
      .audience-card--vision .audience-divider--gold {
        background: var(--color-gold);
        opacity: 0.45;
      }

      /* Base-Typografie für Labels und Lines */
      .audience-col-label {
        font-family: var(--font-mono);
        font-size: 11px;
        font-weight: 600;
        letter-spacing: 0.38em;
        text-transform: uppercase;
      }
      .audience-line {
        position: relative;
        padding-left: 24px;
        font-family: var(--font-body);
        font-weight: 400;
        font-size: clamp(1.05rem, 1.3vw, 1.22rem);
        line-height: 1.65;
        letter-spacing: 0.005em;
        margin: 0;
      }
      /* Bullet-Marker vor jedem Satz — Card-spezifisch */
      .audience-line::before {
        content: '';
        position: absolute;
        left: 2px;
        top: 0.62em;
        width: 7px;
        height: 7px;
        border-radius: 50%;
      }
      .audience-card--pain .audience-line::before {
        background: rgba(130, 165, 205, 0.65);
      }
      .audience-card--vision .audience-line::before {
        background: rgba(241, 220, 150, 0.95);
        box-shadow:
          0 0 6px rgba(241, 220, 150, 0.55),
          0 0 12px rgba(201, 168, 76, 0.25);
      }
      .audience-divider {
        width: 56px;
        height: 1px;
      }

      @media (max-width: 768px) {
        .audience-wrap { padding: 0 24px; gap: 40px; }
        .audience-grid {
          grid-template-columns: 1fr;
          gap: 32px;
        }
        .audience-card { padding: 32px 26px; gap: 22px; }
        /* Side-Slide aus auf Mobile — vertical fade stattdessen */
        .audience-card--vision {
          transform: translateY(calc((1 - var(--vision-progress, 0)) * 40px));
        }
        .audience-line { font-size: 1.05rem; }
      }
      @media (prefers-reduced-motion: reduce) {
        /* Cards sind bei reduced-motion direkt sichtbar (GSAP-Setup wird übersprungen) */
        .audience-grid-bg::before {
          animation: none;
        }
      }
    `;
    document.head.appendChild(style);
  }
}
