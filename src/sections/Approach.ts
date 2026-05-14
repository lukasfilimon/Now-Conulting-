import { copy } from '../content/copy';

/**
 * Approach section — „Die Reise: Coach → Unternehmer".
 * Wow-Effekt der Site: vertikaler SVG-Pfad, der beim Scrollen in Gold „füllt",
 * mit 4 Stationen, die alternierend links/rechts angeordnet sind.
 *
 * Implementation: SVG stroke-dashoffset Animation (kein GSAP-MotionPath-Paid-Plugin).
 * Scroll-Update via requestAnimationFrame, gekoppelt an Lenis-Scroll.
 */
export class Approach {
  readonly root: HTMLElement;
  private pathEl!: SVGPathElement;
  private stationsEl: HTMLElement[] = [];
  private pathLength = 0;
  private rafId: number | null = null;
  private observer: IntersectionObserver;
  private inView = false;

  constructor(container: HTMLElement) {
    const { approach } = copy;
    container.innerHTML = `
      <div class="approach-wrap">
        <div class="approach-header">
          <span class="approach-eyebrow">${approach.eyebrow}</span>
          <h2 class="approach-headline">
            ${this.escape(approach.headline.plain)}
            <em>${this.escape(approach.headline.italic)}</em>
          </h2>
        </div>

        <div class="approach-track">
          <svg class="approach-svg" viewBox="0 0 400 1280" preserveAspectRatio="none" aria-hidden="true">
            <defs>
              <linearGradient id="approach-gold" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%"  stop-color="#e2c97a" stop-opacity="0.9"/>
                <stop offset="50%" stop-color="#c9a84c" stop-opacity="1"/>
                <stop offset="100%" stop-color="#a07830" stop-opacity="0.9"/>
              </linearGradient>
              <linearGradient id="approach-bg" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%"  stop-color="#c9a84c" stop-opacity="0.06"/>
                <stop offset="100%" stop-color="#c9a84c" stop-opacity="0.06"/>
              </linearGradient>
            </defs>
            <!-- Background path (very faint) -->
            <path d="M 200 0
                     Q 200 80  90  200
                     L 90  340
                     Q 90  440 310 500
                     L 310 660
                     Q 310 760 90  820
                     L 90  960
                     Q 90  1060 310 1120
                     L 310 1280"
                  stroke="url(#approach-bg)" stroke-width="2" fill="none" stroke-linecap="round" />
            <!-- Animated gold path -->
            <path class="approach-path"
                  d="M 200 0
                     Q 200 80  90  200
                     L 90  340
                     Q 90  440 310 500
                     L 310 660
                     Q 310 760 90  820
                     L 90  960
                     Q 90  1060 310 1120
                     L 310 1280"
                  stroke="url(#approach-gold)" stroke-width="2.5" fill="none" stroke-linecap="round" />
          </svg>

          <div class="approach-stations">
            ${approach.stations
              .map(
                (s, i) => `
              <div class="approach-station approach-station--${i % 2 === 0 ? 'left' : 'right'}" data-i="${i}">
                <span class="approach-station-num">${s.number}</span>
                <h3 class="approach-station-title">${this.escape(s.title)}</h3>
                <p class="approach-station-body">${this.escape(s.body)}</p>
              </div>
            `,
              )
              .join('')}
          </div>
        </div>

        <!-- Mobile fallback: simple vertical list with thin gold line -->
        <div class="approach-mobile">
          ${approach.stations
            .map(
              (s) => `
            <div class="approach-mobile-item">
              <span class="approach-mobile-num">${s.number}</span>
              <div class="approach-mobile-content">
                <h3 class="approach-mobile-title">${this.escape(s.title)}</h3>
                <p class="approach-mobile-body">${this.escape(s.body)}</p>
              </div>
            </div>
          `,
            )
            .join('')}
        </div>
      </div>
    `;

    this.root = container.querySelector('.approach-wrap') as HTMLElement;
    this.pathEl = container.querySelector('.approach-path') as unknown as SVGPathElement;
    this.stationsEl = Array.from(
      container.querySelectorAll<HTMLElement>('.approach-station'),
    );

    this.injectStyles();
    this.initPath();
    this.observer = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          this.inView = e.isIntersecting;
        }
        if (this.inView) this.tick();
      },
      { threshold: 0 },
    );
    this.observer.observe(this.root);

    // Continuous tick while in view
    this.startTick();

    window.addEventListener('resize', () => this.initPath());
  }

  private initPath(): void {
    if (!this.pathEl || typeof this.pathEl.getTotalLength !== 'function') return;
    this.pathLength = this.pathEl.getTotalLength();
    this.pathEl.style.strokeDasharray = `${this.pathLength}`;
    this.pathEl.style.strokeDashoffset = `${this.pathLength}`;
  }

  private startTick(): void {
    const loop = () => {
      if (this.inView) this.tick();
      this.rafId = requestAnimationFrame(loop);
    };
    this.rafId = requestAnimationFrame(loop);
  }

  private tick(): void {
    if (!this.pathLength) return;
    const rect = this.root.getBoundingClientRect();
    const viewH = window.innerHeight;
    // Map scroll: 0 when section just enters from bottom, 1 when fully passed top
    const total = rect.height + viewH;
    const traveled = viewH - rect.top;
    const progress = Math.max(0, Math.min(1, traveled / total));

    // Slight ease curve so the path fills faster in the middle
    const eased = progress;
    this.pathEl.style.strokeDashoffset = `${this.pathLength * (1 - eased)}`;

    // Reveal stations as the path crosses them
    this.stationsEl.forEach((station, i) => {
      // Station thresholds: 0.18, 0.38, 0.58, 0.78
      const threshold = 0.18 + i * 0.2;
      if (eased >= threshold) station.classList.add('reveal');
      else station.classList.remove('reveal');
    });
  }

  dispose(): void {
    if (this.rafId !== null) cancelAnimationFrame(this.rafId);
    this.observer.disconnect();
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
        max-width: 1200px;
        margin: 0 auto;
        padding: 0 32px;
        position: relative;
      }
      .approach-header {
        text-align: center;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 18px;
        margin-bottom: 80px;
      }
      .approach-eyebrow {
        font-family: var(--font-mono);
        font-size: 11px;
        font-weight: 600;
        letter-spacing: 0.32em;
        color: var(--color-gold);
        text-transform: uppercase;
      }
      .approach-headline {
        font-family: var(--font-display);
        font-weight: 500;
        font-size: clamp(2rem, 3.6vw, 3.2rem);
        line-height: 1.2;
        margin: 0;
        color: var(--color-text);
      }
      .approach-headline em {
        font-style: italic;
        color: var(--color-gold);
        font-weight: 500;
        margin-left: 8px;
      }

      /* Desktop track with curved SVG path */
      .approach-track {
        position: relative;
        width: 100%;
        max-width: 800px;
        margin: 0 auto;
        height: 1280px;
      }
      .approach-svg {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        pointer-events: none;
      }
      .approach-path {
        will-change: stroke-dashoffset;
        filter: drop-shadow(0 0 8px rgba(201, 168, 76, 0.45));
      }
      .approach-stations {
        position: relative;
        width: 100%;
        height: 100%;
      }
      .approach-station {
        position: absolute;
        width: 320px;
        max-width: 38vw;
        display: flex;
        flex-direction: column;
        gap: 12px;
        opacity: 0;
        transform: translateY(28px);
        transition: opacity 900ms cubic-bezier(0.16, 1, 0.3, 1),
                    transform 900ms cubic-bezier(0.16, 1, 0.3, 1);
      }
      .approach-station.reveal {
        opacity: 1;
        transform: translateY(0);
      }
      /* Position stations along the path (left side stations: 01, 03 — right: 02, 04) */
      .approach-station[data-i="0"] { top: 160px;  left: -60px;  text-align: right; align-items: flex-end; }
      .approach-station[data-i="1"] { top: 480px;  right: -60px; text-align: left;  align-items: flex-start; }
      .approach-station[data-i="2"] { top: 800px;  left: -60px;  text-align: right; align-items: flex-end; }
      .approach-station[data-i="3"] { top: 1120px; right: -60px; text-align: left;  align-items: flex-start; }

      .approach-station-num {
        font-family: var(--font-display);
        font-size: clamp(2.4rem, 4vw, 3.6rem);
        font-weight: 300;
        font-style: italic;
        line-height: 1;
        color: var(--color-gold);
        text-shadow: 0 0 24px rgba(201, 168, 76, 0.35);
      }
      .approach-station-title {
        font-family: var(--font-display);
        font-weight: 500;
        font-style: italic;
        font-size: clamp(1.5rem, 2.2vw, 2.1rem);
        line-height: 1.2;
        margin: 0;
        color: var(--color-text);
      }
      .approach-station-body {
        font-family: var(--font-body);
        font-size: 15px;
        font-weight: 400;
        line-height: 1.55;
        color: var(--color-text-muted);
        margin: 0;
        max-width: 280px;
      }

      /* Mobile fallback */
      .approach-mobile { display: none; }

      @media (max-width: 900px) {
        .approach-track { display: none; }
        .approach-mobile {
          display: flex;
          flex-direction: column;
          gap: 32px;
          position: relative;
          padding-left: 56px;
          margin-top: 24px;
        }
        .approach-mobile::before {
          content: '';
          position: absolute;
          left: 24px;
          top: 12px;
          bottom: 12px;
          width: 1px;
          background: linear-gradient(180deg,
            transparent,
            var(--color-gold) 10%,
            var(--color-gold) 90%,
            transparent);
          opacity: 0.6;
        }
        .approach-mobile-item {
          position: relative;
          display: flex;
          gap: 20px;
          align-items: flex-start;
        }
        .approach-mobile-item::before {
          content: '';
          position: absolute;
          left: -38px;
          top: 16px;
          width: 9px;
          height: 9px;
          border-radius: 50%;
          background: var(--color-gold);
          box-shadow: 0 0 14px rgba(201, 168, 76, 0.6);
        }
        .approach-mobile-num {
          font-family: var(--font-display);
          font-weight: 300;
          font-style: italic;
          font-size: 2rem;
          line-height: 1;
          color: var(--color-gold);
          min-width: 50px;
        }
        .approach-mobile-content { display: flex; flex-direction: column; gap: 6px; }
        .approach-mobile-title {
          font-family: var(--font-display);
          font-weight: 500;
          font-style: italic;
          font-size: 1.4rem;
          margin: 0;
          color: var(--color-text);
        }
        .approach-mobile-body {
          font-family: var(--font-body);
          font-size: 14px;
          line-height: 1.55;
          color: var(--color-text-muted);
          margin: 0;
        }
        .approach-wrap { padding: 0 24px; }
      }
    `;
    document.head.appendChild(style);
  }
}
