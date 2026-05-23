import { copy, cta } from '../content/copy';

/**
 * Approach section — Heartbeat-Style Carousel mit 7 Schritten.
 * Premium-Layout: Foto-Frame oben + Content darunter.
 *
 * Mechanik:
 * - Horizontales Carousel mit 7 Karten
 * - Auto-Rotation alle 5 Sekunden (Pause bei Hover)
 * - Infinite loop via clone-trick (erste 4 Karten am Ende dupliziert)
 * - 4 Karten sichtbar Desktop, 1 auf Mobile
 * - Pro Karte: Foto-Frame mit Schritt-Nummer, Titel, Beschreibungstext
 */

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
  private isInViewport = false;
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
          <p class="approach-sub">Wir holen dich dort ab, wo du gerade finanziell stehst und führen dich durch diese 7 Schritte zu deinem gewünschten Monatsumsatz:</p>
        </div>

        <div class="approach-viewport">
          <div class="approach-track">
            ${allCards
              .map(
                (s, i) => `
              <article class="approach-card" data-idx="${i}" data-orig="${i % this.originalCount}">
                <div class="approach-card-visual">
                  <img class="approach-card-img" src="${this.escape(s.image)}" alt="${this.escape(s.title)}" style="object-position: ${this.escape(s.focus)}" loading="lazy" decoding="async" />
                  <div class="approach-card-visual-bg" aria-hidden="true"></div>
                </div>
                <div class="approach-card-content">
                  <h3 class="approach-card-title">${parseInt(s.number, 10)}. ${this.escape(s.title)}</h3>
                  <p class="approach-card-text">${this.escape(s.text)}</p>
                </div>
              </article>
            `,
              )
              .join('')}
          </div>
          <div class="approach-controls">
            <button class="approach-arrow approach-arrow--prev" aria-label="Vorheriges Feld" type="button">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"><path d="M15 6 L9 12 L15 18"/></svg>
            </button>
            <button class="approach-arrow approach-arrow--next" aria-label="Nächstes Feld" type="button">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"><path d="M9 6 L15 12 L9 18"/></svg>
            </button>
          </div>
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
    // Initial-Transform anwenden (für Mobile-Centering relevant — Desktop
    // bleibt bei translateX(0) am linken Rand, was korrekt ist).
    this.applyTransform();
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
    // IO-Guard: Auto-Rotation läuft nur, wenn die Carousel-Section im Viewport
    // ist. Spart CPU + Akku während User in anderen Sections scrollt.
    const viewportIO = new IntersectionObserver(
      ([entry]) => { this.isInViewport = entry.isIntersecting; },
      { threshold: 0 },
    );
    viewportIO.observe(this.root);
    this.autoRotateId = window.setInterval(() => {
      if (!this.isInViewport) return;
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
    let translateX = -(this.currentIndex * (this.cardWidth + this.cardGap));
    // Mobile: die aktive Karte horizontal im Viewport zentrieren
    // (Desktop bleibt links-bündig, da dort mehrere Karten gleichzeitig sichtbar sind).
    if (window.matchMedia('(max-width: 768px)').matches) {
      const viewportWidth = this.viewport.clientWidth;
      const paddingLeft = parseFloat(getComputedStyle(this.viewport).paddingLeft) || 0;
      const centerOffset = (viewportWidth - this.cardWidth) / 2 - paddingLeft;
      translateX += centerOffset;
    }
    this.track.style.transform = `translateX(${translateX}px)`;
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
         VISUAL FRAME — Foto edge-to-edge oben (Heartbeat style)
         ═══════════════════════════════════════════════════════════ */
      .approach-card-visual {
        position: relative;
        width: 100%;
        height: 200px;
        border-radius: 3px;
        overflow: hidden;
        background: #0a0805;
        border: 1px solid rgba(201, 168, 76, 0.08);
        box-shadow:
          inset 0 0 60px rgba(0, 0, 0, 0.4),
          inset 0 1px 0 rgba(255, 240, 200, 0.04);
      }

      /* Foto — füllt den Frame, Center-Crop */
      .approach-card-img {
        position: absolute;
        inset: 0;
        width: 100%;
        height: 100%;
        object-fit: cover;
        object-position: center;
        z-index: 0;
        transition: transform 700ms cubic-bezier(0.16, 1, 0.3, 1);
      }
      .approach-card:hover .approach-card-img {
        transform: scale(1.05);
      }

      /* Marken-Overlay über dem Foto — dunkler Scrim oben/unten + Gold-Hauch */
      .approach-card-visual-bg {
        position: absolute;
        inset: 0;
        z-index: 1;
        pointer-events: none;
        background:
          linear-gradient(180deg,
            rgba(8, 6, 4, 0.62) 0%,
            rgba(8, 6, 4, 0.05) 26%,
            rgba(8, 6, 4, 0) 50%,
            rgba(8, 6, 4, 0.28) 80%,
            rgba(8, 6, 4, 0.62) 100%),
          radial-gradient(ellipse at 50% 38%,
            rgba(201, 168, 76, 0.10) 0%,
            transparent 70%);
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
        z-index: 2;
      }


      /* ═══════════════════════════════════════════════════════════
         CONTENT — Title + Beschreibungstext below visual
         ═══════════════════════════════════════════════════════════ */
      .approach-card-content {
        display: flex;
        flex-direction: column;
        gap: 18px;
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
      .approach-card-text {
        font-family: var(--font-body, 'Inter', sans-serif);
        font-size: 14px;
        line-height: 1.65;
        color: rgba(228, 222, 210, 0.82);
        margin: 0;
        letter-spacing: 0.005em;
      }

      /* ═══════════════════════════════════════════════════════════
         CONTROLS — Edge-Floating Pfeile mit Verlauf-Halo
         ═══════════════════════════════════════════════════════════ */
      .approach-controls {
        position: absolute;
        inset: 0;
        pointer-events: none;
        z-index: 5;
      }
      .approach-arrow {
        position: absolute;
        top: 50%;
        transform: translateY(-50%);
        width: 56px;
        height: 56px;
        border-radius: 50%;
        background:
          linear-gradient(165deg,
            rgba(34, 30, 20, 0.78) 0%,
            rgba(20, 17, 11, 0.68) 100%);
        border: 1px solid rgba(201, 168, 76, 0.32);
        color: rgba(226, 201, 122, 0.9);
        cursor: pointer;
        pointer-events: auto;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 0;
        backdrop-filter: blur(12px) saturate(130%);
        -webkit-backdrop-filter: blur(12px) saturate(130%);
        box-shadow:
          0 1px 0 0 rgba(255, 240, 200, 0.08) inset,
          0 -1px 0 0 rgba(0, 0, 0, 0.4) inset,
          0 12px 28px -16px rgba(0, 0, 0, 0.7);
        transition:
          border-color 300ms ease,
          background 300ms ease,
          color 300ms ease,
          transform 300ms cubic-bezier(0.16, 1, 0.3, 1),
          box-shadow 300ms ease;
      }
      /* Verlauf-Halo: weicher dunkler Pad hinter dem Button, damit er
         auch über bunten Foto-Hintergründen sauber lesbar bleibt. */
      .approach-arrow::before {
        content: '';
        position: absolute;
        inset: -18px;
        border-radius: 50%;
        background: radial-gradient(circle,
          rgba(8, 6, 4, 0.55) 0%,
          rgba(8, 6, 4, 0.25) 45%,
          transparent 75%);
        z-index: -1;
        pointer-events: none;
        transition: opacity 300ms ease;
      }
      .approach-arrow--prev { left: 20px; }
      .approach-arrow--next { right: 20px; }
      .approach-arrow:hover {
        border-color: rgba(226, 201, 122, 0.7);
        color: #f0d489;
        transform: translateY(calc(-50% - 2px));
        background:
          linear-gradient(165deg,
            rgba(42, 36, 22, 0.85) 0%,
            rgba(26, 22, 14, 0.75) 100%);
        box-shadow:
          0 1px 0 0 rgba(255, 240, 200, 0.14) inset,
          0 -1px 0 0 rgba(0, 0, 0, 0.35) inset,
          0 18px 40px -16px rgba(0, 0, 0, 0.8),
          0 0 24px -8px rgba(201, 168, 76, 0.35);
      }
      .approach-arrow:active {
        transform: translateY(-50%);
      }
      .approach-arrow svg {
        width: 20px;
        height: 20px;
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
        .approach-card-title { font-size: 22px; }
        .approach-arrow { width: 48px; height: 48px; }
        .approach-arrow--prev { left: 8px; }
        .approach-arrow--next { right: 8px; }
        .approach-arrow::before { inset: -14px; }
      }

      @media (prefers-reduced-motion: reduce) {
        .approach-track { transition: none; }
        .approach-card { transition: none; }
        .approach-card:hover { transform: none; }
        .approach-card-img { transition: none; }
        .approach-card:hover .approach-card-img { transform: none; }
      }
    `;
    document.head.appendChild(style);
  }
}
