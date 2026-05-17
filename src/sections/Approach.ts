import { copy, cta } from '../content/copy';

/**
 * Approach section — Heartbeat-Style Carousel mit 9 Beratungs-Feldern.
 * Premium-Layout: Visual-Frame oben (60% Höhe) + Content darunter.
 *
 * Mechanik:
 * - Horizontales Carousel mit 9 Karten
 * - Auto-Rotation alle 5 Sekunden (Pause bei Hover)
 * - Infinite loop via clone-trick (erste 4 Karten am Ende dupliziert)
 * - 4 Karten sichtbar Desktop, 1 auf Mobile
 * - Pro Karte: Visual-Frame mit Icon, Number, Title, Im Innen, Im Außen
 */

type IconKey = 'eye' | 'lotus' | 'pyramid' | 'target' | 'stack' | 'handshake' | 'waves' | 'gear' | 'network';

const ICON_SVGS: Record<IconKey, string> = {
  eye: `
    <svg viewBox="0 0 120 120" fill="none" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      <path d="M14 60 Q60 26 106 60 Q60 94 14 60 Z" opacity="0.55"/>
      <path d="M28 60 Q60 38 92 60 Q60 82 28 60 Z" opacity="0.7"/>
      <circle cx="60" cy="60" r="14" opacity="0.95"/>
      <circle cx="60" cy="60" r="5" fill="currentColor" stroke="none"/>
      <line x1="60" y1="6" x2="60" y2="14" opacity="0.5"/>
      <line x1="60" y1="106" x2="60" y2="114" opacity="0.5"/>
      <line x1="6" y1="60" x2="14" y2="60" opacity="0.5"/>
      <line x1="106" y1="60" x2="114" y2="60" opacity="0.5"/>
      <line x1="22" y1="22" x2="28" y2="28" opacity="0.35"/>
      <line x1="92" y1="92" x2="98" y2="98" opacity="0.35"/>
      <line x1="22" y1="98" x2="28" y2="92" opacity="0.35"/>
      <line x1="92" y1="28" x2="98" y2="22" opacity="0.35"/>
    </svg>
  `,
  lotus: `
    <svg viewBox="0 0 120 120" fill="none" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      <path d="M60 20 Q52 50 60 80 Q68 50 60 20 Z" opacity="0.95"/>
      <path d="M30 36 Q26 56 42 80 Q46 56 30 36 Z" opacity="0.7"/>
      <path d="M90 36 Q94 56 78 80 Q74 56 90 36 Z" opacity="0.7"/>
      <path d="M14 56 Q20 72 38 84 Q34 68 14 56 Z" opacity="0.45"/>
      <path d="M106 56 Q100 72 82 84 Q86 68 106 56 Z" opacity="0.45"/>
      <path d="M10 86 Q60 100 110 86" opacity="0.6"/>
      <circle cx="60" cy="86" r="3.5" fill="currentColor" stroke="none"/>
      <line x1="60" y1="6" x2="60" y2="14" opacity="0.5"/>
      <line x1="60" y1="10" x2="56" y2="14" opacity="0.4"/>
      <line x1="60" y1="10" x2="64" y2="14" opacity="0.4"/>
    </svg>
  `,
  pyramid: `
    <svg viewBox="0 0 120 120" fill="none" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      <path d="M60 16 L104 96 L16 96 Z" opacity="0.45"/>
      <path d="M60 36 L92 92 L28 92 Z" opacity="0.7"/>
      <path d="M60 56 L80 88 L40 88 Z" opacity="0.95"/>
      <line x1="60" y1="16" x2="60" y2="56" opacity="0.5"/>
      <circle cx="60" cy="56" r="2.5" fill="currentColor" stroke="none"/>
    </svg>
  `,
  target: `
    <svg viewBox="0 0 120 120" fill="none" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" aria-hidden="true">
      <circle cx="60" cy="60" r="46" opacity="0.3"/>
      <circle cx="60" cy="60" r="32" opacity="0.5"/>
      <circle cx="60" cy="60" r="18" opacity="0.75"/>
      <circle cx="60" cy="60" r="6" opacity="1"/>
      <circle cx="60" cy="60" r="2.5" fill="currentColor" stroke="none"/>
      <line x1="60" y1="4" x2="60" y2="18" opacity="0.55"/>
      <line x1="60" y1="102" x2="60" y2="116" opacity="0.55"/>
      <line x1="4" y1="60" x2="18" y2="60" opacity="0.55"/>
      <line x1="102" y1="60" x2="116" y2="60" opacity="0.55"/>
    </svg>
  `,
  stack: `
    <svg viewBox="0 0 120 120" fill="none" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      <rect x="20" y="22" width="80" height="18" rx="2" opacity="0.45"/>
      <rect x="20" y="50" width="80" height="18" rx="2" opacity="0.7"/>
      <rect x="20" y="78" width="80" height="18" rx="2" opacity="1"/>
      <line x1="32" y1="31" x2="56" y2="31" opacity="0.5"/>
      <line x1="32" y1="59" x2="56" y2="59" opacity="0.5"/>
      <line x1="32" y1="87" x2="64" y2="87" opacity="0.7"/>
      <circle cx="86" cy="87" r="3" fill="currentColor" stroke="none"/>
    </svg>
  `,
  handshake: `
    <svg viewBox="0 0 120 120" fill="none" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      <path d="M10 44 L36 44 L60 60 L36 76 L10 76" opacity="0.7"/>
      <path d="M110 44 L84 44 L60 60 L84 76 L110 76" opacity="0.95"/>
      <circle cx="60" cy="60" r="5" fill="currentColor" stroke="none"/>
      <circle cx="60" cy="60" r="10" opacity="0.6"/>
      <line x1="22" y1="34" x2="22" y2="40" opacity="0.4"/>
      <line x1="98" y1="34" x2="98" y2="40" opacity="0.4"/>
      <line x1="22" y1="80" x2="22" y2="86" opacity="0.4"/>
      <line x1="98" y1="80" x2="98" y2="86" opacity="0.4"/>
    </svg>
  `,
  waves: `
    <svg viewBox="0 0 120 120" fill="none" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" aria-hidden="true">
      <circle cx="60" cy="60" r="10" opacity="1"/>
      <circle cx="60" cy="60" r="4" fill="currentColor" stroke="none"/>
      <path d="M34 60 A26 26 0 0 1 86 60" opacity="0.7"/>
      <path d="M34 60 A26 26 0 0 0 86 60" opacity="0.7"/>
      <path d="M16 60 A44 44 0 0 1 104 60" opacity="0.45"/>
      <path d="M16 60 A44 44 0 0 0 104 60" opacity="0.45"/>
      <path d="M4 60 A56 56 0 0 1 116 60" opacity="0.25"/>
      <path d="M4 60 A56 56 0 0 0 116 60" opacity="0.25"/>
    </svg>
  `,
  gear: `
    <svg viewBox="0 0 120 120" fill="none" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      <circle cx="60" cy="60" r="20" opacity="0.95"/>
      <circle cx="60" cy="60" r="8" opacity="0.7"/>
      <circle cx="60" cy="60" r="3" fill="currentColor" stroke="none"/>
      <path d="M60 8 L60 22 M60 98 L60 112 M8 60 L22 60 M98 60 L112 60" opacity="0.75"/>
      <path d="M23 23 L33 33 M87 87 L97 97 M23 97 L33 87 M87 33 L97 23" opacity="0.55"/>
      <circle cx="60" cy="60" r="44" opacity="0.18"/>
    </svg>
  `,
  network: `
    <svg viewBox="0 0 120 120" fill="none" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" aria-hidden="true">
      <line x1="60" y1="22" x2="22" y2="88" opacity="0.5"/>
      <line x1="60" y1="22" x2="98" y2="88" opacity="0.5"/>
      <line x1="22" y1="88" x2="98" y2="88" opacity="0.5"/>
      <line x1="60" y1="22" x2="60" y2="60" opacity="0.6"/>
      <line x1="22" y1="88" x2="60" y2="60" opacity="0.6"/>
      <line x1="98" y1="88" x2="60" y2="60" opacity="0.6"/>
      <circle cx="60" cy="22" r="7" fill="currentColor" stroke="none"/>
      <circle cx="22" cy="88" r="7" fill="currentColor" stroke="none"/>
      <circle cx="98" cy="88" r="7" fill="currentColor" stroke="none"/>
      <circle cx="60" cy="60" r="5" opacity="0.95"/>
    </svg>
  `,
};

export class Approach {
  readonly root: HTMLElement;
  private track!: HTMLElement;
  private viewport!: HTMLElement;
  private cards: HTMLElement[] = [];
  private cardWidth = 320;
  private cardGap = 24;
  private originalCount = 0;
  private currentIndex = 0;
  private autoRotateId: number | null = null;
  private isAnimating = false;
  private isHovered = false;
  private rotationInterval = 5000;
  private transitionMs = 800;

  constructor(container: HTMLElement) {
    const { approach } = copy;
    const stations = approach.stations;
    this.originalCount = stations.length;

    // Clone first 4 stations at the end for infinite-loop trick
    const visibleCount = 4;
    const cloneCount = Math.min(visibleCount, stations.length);
    const allCards = [...stations, ...stations.slice(0, cloneCount)];

    container.innerHTML = `
      <div class="approach-wrap">
        <div class="approach-header">
          <span class="approach-eyebrow">${this.escape(approach.eyebrow)}</span>
          <h2 class="approach-headline">
            ${this.escape(approach.headline.plain)}
            <em>${this.escape(approach.headline.italic)}</em>
          </h2>
          <p class="approach-sub">Aus deiner Coaching-Praxis wird ein Unternehmen — Schritt für Schritt, im Innen wie im Außen.</p>
        </div>

        <div class="approach-viewport">
          <div class="approach-track">
            ${allCards
              .map(
                (s, i) => `
              <article class="approach-card" data-idx="${i}" data-orig="${i % this.originalCount}">
                <div class="approach-card-visual">
                  <div class="approach-card-visual-bg" aria-hidden="true"></div>
                  <div class="approach-card-icon">
                    ${ICON_SVGS[s.icon as IconKey] || ''}
                  </div>
                  <span class="approach-card-num">${this.escape(s.number)}</span>
                </div>
                <div class="approach-card-content">
                  <h3 class="approach-card-title">${this.escape(s.title)}</h3>
                  <div class="approach-card-splits">
                    <div class="approach-card-split approach-card-split--inner">
                      <span class="approach-card-label">${this.escape(approach.labels.inner)}</span>
                      <p class="approach-card-text">${this.escape(s.inner)}</p>
                    </div>
                    <div class="approach-card-split approach-card-split--outer">
                      <span class="approach-card-label">${this.escape(approach.labels.outer)}</span>
                      <p class="approach-card-text">${this.escape(s.outer)}</p>
                    </div>
                  </div>
                </div>
              </article>
            `,
              )
              .join('')}
          </div>
        </div>

        <div class="approach-controls">
          <button class="approach-arrow approach-arrow--prev" aria-label="Vorheriges Feld" type="button">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"><path d="M15 6 L9 12 L15 18"/></svg>
          </button>
          <button class="approach-arrow approach-arrow--next" aria-label="Nächstes Feld" type="button">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"><path d="M9 6 L15 12 L9 18"/></svg>
          </button>
        </div>

        <div class="section-cta-wrap">
          <a class="section-cta" href="${cta.primaryHref}"${cta.isCalendly ? ' target="_blank" rel="noopener"' : ''}>
            <span>${this.escape(cta.primaryLabel)}</span>
            <span class="section-cta-arrow">→</span>
          </a>
        </div>
      </div>
    `;

    this.root = container.querySelector('.approach-wrap') as HTMLElement;
    this.viewport = container.querySelector('.approach-viewport') as HTMLElement;
    this.track = container.querySelector('.approach-track') as HTMLElement;
    this.cards = Array.from(container.querySelectorAll<HTMLElement>('.approach-card'));

    this.injectStyles();
    this.measureCard();
    this.attachEvents();
    this.startAutoRotate();

    window.addEventListener('resize', () => {
      this.measureCard();
      this.snapToIndex(this.currentIndex);
    });
  }

  private measureCard(): void {
    const first = this.cards[0];
    if (!first) return;
    const rect = first.getBoundingClientRect();
    this.cardWidth = rect.width;
    const trackStyle = window.getComputedStyle(this.track);
    const gapValue = trackStyle.gap || trackStyle.columnGap || '28';
    this.cardGap = parseFloat(gapValue) || 28;
  }

  private attachEvents(): void {
    this.viewport.addEventListener('mouseenter', () => {
      this.isHovered = true;
    });
    this.viewport.addEventListener('mouseleave', () => {
      this.isHovered = false;
    });

    this.root.querySelector('.approach-arrow--prev')?.addEventListener('click', () => this.goToPrev());
    this.root.querySelector('.approach-arrow--next')?.addEventListener('click', () => this.goToNext());

    let touchStartX = 0;
    let touchEndX = 0;
    this.viewport.addEventListener('touchstart', (e) => {
      touchStartX = e.changedTouches[0].screenX;
    }, { passive: true });
    this.viewport.addEventListener('touchend', (e) => {
      touchEndX = e.changedTouches[0].screenX;
      const diff = touchStartX - touchEndX;
      if (Math.abs(diff) > 40) {
        if (diff > 0) this.goToNext();
        else this.goToPrev();
      }
    }, { passive: true });
  }

  private startAutoRotate(): void {
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduceMotion) return;
    this.autoRotateId = window.setInterval(() => {
      if (!this.isHovered && !this.isAnimating) this.goToNext();
    }, this.rotationInterval);
  }

  private goToNext(): void {
    if (this.isAnimating) return;
    this.currentIndex++;
    this.animateTo(this.currentIndex);

    if (this.currentIndex >= this.originalCount) {
      window.setTimeout(() => {
        this.track.style.transition = 'none';
        this.currentIndex = 0;
        this.applyTransform();
        void this.track.offsetHeight;
        this.track.style.transition = '';
      }, this.transitionMs + 30);
    }
  }

  private goToPrev(): void {
    if (this.isAnimating) return;
    if (this.currentIndex === 0) {
      this.track.style.transition = 'none';
      this.currentIndex = this.originalCount;
      this.applyTransform();
      void this.track.offsetHeight;
      this.track.style.transition = '';
    }
    this.currentIndex--;
    this.animateTo(this.currentIndex);
  }

  private goToIndex(i: number): void {
    if (this.isAnimating) return;
    this.currentIndex = Math.max(0, Math.min(this.originalCount - 1, i));
    this.animateTo(this.currentIndex);
  }

  private animateTo(_index: number): void {
    this.isAnimating = true;
    this.applyTransform();
    window.setTimeout(() => {
      this.isAnimating = false;
    }, this.transitionMs);
  }

  private applyTransform(): void {
    const offset = this.currentIndex * (this.cardWidth + this.cardGap);
    this.track.style.transform = `translateX(-${offset}px)`;
  }

  private snapToIndex(i: number): void {
    this.track.style.transition = 'none';
    this.currentIndex = i;
    this.applyTransform();
    void this.track.offsetHeight;
    this.track.style.transition = '';
  }

  dispose(): void {
    if (this.autoRotateId !== null) clearInterval(this.autoRotateId);
  }

  private escape(text: string): string {
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }

  private injectStyles(): void {
    if (document.getElementById('approach-styles')) return;
    const style = document.createElement('style');
    style.id = 'approach-styles';
    style.textContent = `
      .approach-wrap {
        max-width: 1480px;
        margin: 0 auto;
        padding: 0 32px;
        position: relative;
        z-index: 2;
      }
      .approach-header {
        text-align: center;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 18px;
        margin-bottom: 72px;
        max-width: 720px;
        margin-left: auto;
        margin-right: auto;
      }
      .approach-eyebrow {
        font-family: var(--font-mono, 'JetBrains Mono', monospace);
        font-size: 11px;
        font-weight: 600;
        letter-spacing: 0.32em;
        color: #c9a84c;
        text-transform: uppercase;
      }
      .approach-headline {
        font-family: var(--font-display, 'Cormorant Garamond', serif);
        font-weight: 500;
        font-size: clamp(2rem, 3.4vw, 3rem);
        line-height: 1.2;
        margin: 0;
        color: rgba(238, 232, 220, 0.95);
        text-wrap: balance;
      }
      .approach-headline em {
        font-style: italic;
        color: #e2c97a;
        font-weight: 500;
        margin-left: 8px;
      }
      .approach-sub {
        font-family: var(--font-body, 'Inter', sans-serif);
        font-size: 15px;
        line-height: 1.6;
        color: rgba(195, 190, 180, 0.6);
        margin: 0;
        max-width: 560px;
        letter-spacing: 0.005em;
      }

      /* Viewport — clips overflow */
      .approach-viewport {
        position: relative;
        width: 100%;
        overflow: hidden;
        padding: 20px 4px 24px;
      }

      /* Track — horizontal flex with smooth transform */
      .approach-track {
        display: flex;
        gap: 28px;
        will-change: transform;
        transition: transform 800ms cubic-bezier(0.4, 0, 0.2, 1);
      }

      /* ═══════════════════════════════════════════════════════════
         CARD — Premium glass with depth, gold edges, multi-layer
         ═══════════════════════════════════════════════════════════ */
      .approach-card {
        flex: 0 0 340px;
        min-height: 540px;
        padding: 18px 18px 30px;
        position: relative;
        display: flex;
        flex-direction: column;
        gap: 24px;

        background:
          linear-gradient(165deg,
            rgba(34, 30, 20, 0.78) 0%,
            rgba(20, 17, 11, 0.68) 50%,
            rgba(12, 10, 7, 0.58) 100%);

        border: 1px solid rgba(201, 168, 76, 0.16);
        border-radius: 4px;

        backdrop-filter: blur(18px) saturate(135%);
        -webkit-backdrop-filter: blur(18px) saturate(135%);

        box-shadow:
          /* Inner glass highlight (top) */
          0 1px 0 0 rgba(255, 240, 200, 0.07) inset,
          /* Inner bottom vignette */
          0 -1px 0 0 rgba(0, 0, 0, 0.4) inset,
          /* Ambient drop */
          0 32px 64px -28px rgba(0, 0, 0, 0.75),
          /* Subtle gold edge */
          0 0 0 1px rgba(201, 168, 76, 0.04);

        transition:
          transform 650ms cubic-bezier(0.16, 1, 0.3, 1),
          border-color 600ms ease,
          box-shadow 600ms ease;
      }

      /* Top atmospheric glow */
      .approach-card::before {
        content: '';
        position: absolute;
        inset: 0;
        background:
          radial-gradient(
            ellipse 80% 50% at 50% 0%,
            rgba(226, 201, 122, 0.09) 0%,
            transparent 65%
          );
        border-radius: inherit;
        pointer-events: none;
        opacity: 0.85;
        transition: opacity 600ms ease;
      }

      /* Corner brackets — architectural premium accent (top-right) */
      .approach-card::after {
        content: '';
        position: absolute;
        top: 12px;
        right: 12px;
        width: 14px;
        height: 14px;
        border-top: 1px solid rgba(201, 168, 76, 0.5);
        border-right: 1px solid rgba(201, 168, 76, 0.5);
        pointer-events: none;
        transition: border-color 600ms ease;
        z-index: 3;
      }

      .approach-card > * {
        position: relative;
        z-index: 1;
      }

      /* Hover state — drama */
      .approach-card:hover {
        transform: translateY(-8px);
        border-color: rgba(201, 168, 76, 0.4);
        box-shadow:
          0 1px 0 0 rgba(255, 240, 200, 0.12) inset,
          0 -1px 0 0 rgba(0, 0, 0, 0.3) inset,
          0 44px 88px -24px rgba(0, 0, 0, 0.85),
          0 0 0 1px rgba(201, 168, 76, 0.12),
          /* Gold ambient glow on hover */
          0 0 40px -10px rgba(201, 168, 76, 0.3);
      }
      .approach-card:hover::before { opacity: 1; }
      .approach-card:hover::after {
        border-color: rgba(226, 201, 122, 0.85);
      }

      /* ═══════════════════════════════════════════════════════════
         VISUAL FRAME — Large image-like area on top (Heartbeat style)
         ═══════════════════════════════════════════════════════════ */
      .approach-card-visual {
        position: relative;
        width: 100%;
        height: 200px;
        border-radius: 3px;
        overflow: hidden;
        display: flex;
        align-items: center;
        justify-content: center;
        background:
          linear-gradient(180deg,
            rgba(8, 6, 4, 0.7) 0%,
            rgba(4, 3, 2, 0.5) 100%);
        border: 1px solid rgba(201, 168, 76, 0.08);
        box-shadow:
          inset 0 0 60px rgba(0, 0, 0, 0.6),
          inset 0 1px 0 rgba(255, 240, 200, 0.04);
      }

      /* Visual ambient — subtle gold gradient mass behind icon */
      .approach-card-visual-bg {
        position: absolute;
        inset: 0;
        background:
          radial-gradient(
            ellipse at 50% 60%,
            rgba(201, 168, 76, 0.14) 0%,
            rgba(201, 168, 76, 0.04) 35%,
            transparent 70%
          );
        pointer-events: none;
      }

      /* Visual grid pattern — very subtle premium texture */
      .approach-card-visual::before {
        content: '';
        position: absolute;
        inset: 0;
        background-image:
          linear-gradient(rgba(201, 168, 76, 0.04) 1px, transparent 1px),
          linear-gradient(90deg, rgba(201, 168, 76, 0.04) 1px, transparent 1px);
        background-size: 24px 24px;
        opacity: 0.6;
        mask-image: radial-gradient(ellipse at center, black 40%, transparent 80%);
        -webkit-mask-image: radial-gradient(ellipse at center, black 40%, transparent 80%);
        pointer-events: none;
      }

      /* Top scan-line — premium tech feel */
      .approach-card-visual::after {
        content: '';
        position: absolute;
        top: 0;
        left: 8%;
        right: 8%;
        height: 1px;
        background: linear-gradient(90deg, transparent, rgba(226, 201, 122, 0.6), transparent);
        pointer-events: none;
      }

      /* Number — top-left of visual frame */
      .approach-card-num {
        position: absolute;
        top: 14px;
        left: 16px;
        font-family: var(--font-mono, 'JetBrains Mono', monospace);
        font-size: 10px;
        font-weight: 600;
        letter-spacing: 0.22em;
        color: rgba(226, 201, 122, 0.75);
        z-index: 2;
      }
      .approach-card-num::before {
        content: 'FELD ';
        opacity: 0.55;
      }

      /* Icon inside visual frame */
      .approach-card-icon {
        width: 120px;
        height: 120px;
        color: #d9b96a;
        position: relative;
        z-index: 1;
        filter: drop-shadow(0 0 16px rgba(201, 168, 76, 0.25));
        transition: transform 700ms cubic-bezier(0.16, 1, 0.3, 1);
      }
      .approach-card:hover .approach-card-icon {
        transform: scale(1.04);
      }
      .approach-card-icon svg {
        width: 100%;
        height: 100%;
      }

      /* ═══════════════════════════════════════════════════════════
         CONTENT — Title + Splits below visual
         ═══════════════════════════════════════════════════════════ */
      .approach-card-content {
        display: flex;
        flex-direction: column;
        gap: 22px;
        flex: 1;
        padding: 4px 12px 0;
      }
      .approach-card-title {
        font-family: var(--font-display, 'Cormorant Garamond', serif);
        font-weight: 500;
        font-style: italic;
        font-size: 26px;
        line-height: 1.15;
        margin: 0;
        color: rgba(240, 234, 222, 0.97);
        letter-spacing: -0.008em;
        padding-bottom: 16px;
        border-bottom: 1px solid rgba(201, 168, 76, 0.14);
      }

      /* Splits — Innen / Außen */
      .approach-card-splits {
        display: flex;
        flex-direction: column;
        gap: 18px;
      }
      .approach-card-split {
        display: flex;
        flex-direction: column;
        gap: 7px;
      }
      .approach-card-label {
        font-family: var(--font-display, 'Cormorant Garamond', serif);
        font-size: 18px;
        font-weight: 500;
        font-style: italic;
        letter-spacing: 0.005em;
        display: inline-flex;
        align-items: center;
        gap: 10px;
      }
      .approach-card-split--inner .approach-card-label {
        color: #d9b96a;
      }
      .approach-card-split--inner .approach-card-label::before {
        content: '';
        display: inline-block;
        width: 22px;
        height: 1px;
        background: #d9b96a;
        opacity: 0.8;
      }
      .approach-card-split--outer .approach-card-label {
        color: rgba(228, 222, 210, 0.65);
      }
      .approach-card-split--outer .approach-card-label::before {
        content: '';
        display: inline-block;
        width: 22px;
        height: 1px;
        background: rgba(195, 190, 180, 0.5);
      }
      .approach-card-text {
        font-family: var(--font-body, 'Inter', sans-serif);
        font-size: 13.5px;
        line-height: 1.6;
        color: rgba(228, 222, 210, 0.82);
        margin: 0;
        letter-spacing: 0.005em;
      }

      /* ═══════════════════════════════════════════════════════════
         CONTROLS — zwei Pfeil-Buttons
         ═══════════════════════════════════════════════════════════ */
      .approach-controls {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 16px;
        margin-top: 52px;
      }
      .approach-arrow {
        width: 72px;
        height: 56px;
        border-radius: 4px;
        background:
          linear-gradient(165deg,
            rgba(34, 30, 20, 0.78) 0%,
            rgba(20, 17, 11, 0.68) 100%);
        border: 1px solid rgba(201, 168, 76, 0.28);
        color: rgba(226, 201, 122, 0.9);
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 0;
        position: relative;
        backdrop-filter: blur(12px) saturate(130%);
        -webkit-backdrop-filter: blur(12px) saturate(130%);
        box-shadow:
          0 1px 0 0 rgba(255, 240, 200, 0.06) inset,
          0 -1px 0 0 rgba(0, 0, 0, 0.4) inset,
          0 12px 28px -16px rgba(0, 0, 0, 0.7);
        transition:
          border-color 300ms ease,
          background 300ms ease,
          color 300ms ease,
          transform 300ms cubic-bezier(0.16, 1, 0.3, 1),
          box-shadow 300ms ease;
      }
      .approach-arrow:hover {
        border-color: rgba(226, 201, 122, 0.7);
        color: #f0d489;
        transform: translateY(-2px);
        background:
          linear-gradient(165deg,
            rgba(42, 36, 22, 0.85) 0%,
            rgba(26, 22, 14, 0.75) 100%);
        box-shadow:
          0 1px 0 0 rgba(255, 240, 200, 0.12) inset,
          0 -1px 0 0 rgba(0, 0, 0, 0.35) inset,
          0 18px 40px -16px rgba(0, 0, 0, 0.8),
          0 0 24px -8px rgba(201, 168, 76, 0.35);
      }
      .approach-arrow:active {
        transform: translateY(0);
      }
      .approach-arrow svg {
        width: 22px;
        height: 22px;
      }

      /* Approach hat keine eigene reveal-Choreografie (Carousel ist sofort sichtbar) —
         daher muss die globale .section-cta-wrap-Hide-Logik explizit überschrieben werden. */
      .approach-wrap > .section-cta-wrap {
        opacity: 1;
        transform: none;
        transition: none;
        margin-top: 48px;
      }

      /* ═══════════════════════════════════════════════════════════
         MOBILE
         ═══════════════════════════════════════════════════════════ */
      @media (max-width: 768px) {
        .approach-wrap { padding: 0 20px; }
        .approach-header { margin-bottom: 44px; gap: 14px; }
        .approach-headline { font-size: clamp(1.6rem, 6vw, 2.2rem); }
        .approach-sub { font-size: 14px; }
        .approach-card {
          flex: 0 0 calc(100vw - 80px);
          max-width: 340px;
          min-height: 500px;
        }
        .approach-card-visual { height: 180px; }
        .approach-card-icon { width: 100px; height: 100px; }
        .approach-card-title { font-size: 22px; }
        .approach-controls { gap: 14px; margin-top: 36px; }
        .approach-arrow { width: 64px; height: 52px; }
      }

      @media (prefers-reduced-motion: reduce) {
        .approach-track { transition: none; }
        .approach-card { transition: none; }
        .approach-card:hover { transform: none; }
        .approach-card-icon { transition: none; }
      }
    `;
    document.head.appendChild(style);
  }
}
