/**
 * Stat-Strip — 4 Beweis-Zahlen direkt unter dem Hero.
 * Premium-Glass-Card mit Counter-Animation beim Reveal und Hover-Lift pro Item.
 */
interface Stat {
  target: number;
  prefix?: string;
  suffix?: string;
  label: string;
}

const STATS: Stat[] = [
  { target: 1000, suffix: '+',      label: 'Unternehmer begleitet' },
  { target: 98,   suffix: '%',      label: 'Kundenzufriedenheit' },
  { target: 2,    suffix: 'M+ €',   label: 'Jahresumsatz' },
  { target: 6,    suffix: ' Jahre', label: 'Erfahrung' },
];

export class StatStrip {
  readonly root: HTMLElement;
  private revealed = false;

  constructor(container: HTMLElement) {
    const items = STATS.map((s) => {
      const prefix = s.prefix ?? '';
      const suffix = s.suffix ?? '';
      return `
        <div class="stat-strip-item">
          <span class="stat-strip-value"
                data-target="${s.target}"
                data-prefix="${this.escape(prefix)}"
                data-suffix="${this.escape(suffix)}">${this.escape(prefix)}0${this.escape(suffix)}</span>
          <span class="stat-strip-label">${this.escape(s.label)}</span>
        </div>
      `;
    }).join('<div class="stat-strip-sep" aria-hidden="true"></div>');

    container.innerHTML = `<div class="stat-strip">${items}</div>`;
    this.root = container.querySelector('.stat-strip') as HTMLElement;
    this.injectStyles();
    this.observe();
  }

  private escape(text: string): string {
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  private observe(): void {
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting && !this.revealed) {
            this.revealed = true;
            this.root.classList.add('reveal');
            this.animateCounters();
            io.disconnect();
          }
        }
      },
      { threshold: 0.15 },
    );
    io.observe(this.root);
  }

  private animateCounters(): void {
    const reduceMotion =
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const elements = this.root.querySelectorAll<HTMLElement>('.stat-strip-value');
    elements.forEach((el, i) => {
      const target = Number(el.dataset.target ?? '0');
      const prefix = el.dataset.prefix ?? '';
      const suffix = el.dataset.suffix ?? '';

      if (reduceMotion) {
        el.textContent = `${prefix}${target}${suffix}`;
        return;
      }

      const duration = 1100;
      const delay = i * 120;
      const startAt = performance.now() + delay;

      const tick = (now: number) => {
        const t = (now - startAt) / duration;
        if (t < 0) {
          requestAnimationFrame(tick);
          return;
        }
        if (t >= 1) {
          el.textContent = `${prefix}${target}${suffix}`;
          return;
        }
        // ease-out cubic
        const eased = 1 - Math.pow(1 - t, 3);
        const current = Math.floor(eased * target);
        el.textContent = `${prefix}${current}${suffix}`;
        requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    });
  }

  private injectStyles(): void {
    if (document.getElementById('stat-strip-styles')) return;
    const style = document.createElement('style');
    style.id = 'stat-strip-styles';
    style.textContent = `
      .stat-strip {
        max-width: 1180px;
        width: calc(100% - 48px);
        margin: 32px auto 0;
        padding: 18px clamp(24px, 4vw, 56px);
        box-sizing: border-box;
        display: grid;
        grid-template-columns: 1fr auto 1fr auto 1fr auto 1fr;
        align-items: center;
        gap: 0;
        border: 1px solid rgba(201, 168, 76, 0.32);
        border-radius: 18px;
        background: linear-gradient(180deg,
          rgba(201, 168, 76, 0.14) 0%,
          rgba(201, 168, 76, 0.06) 100%);
        box-shadow:
          0 18px 48px rgba(0, 0, 0, 0.42),
          0 0 36px rgba(201, 168, 76, 0.16),
          inset 0 1px 0 rgba(255, 230, 165, 0.28),
          inset 0 -1px 0 rgba(0, 0, 0, 0.22);
        opacity: 0;
        transform: translateY(12px);
        transition: opacity 800ms var(--ease-reveal),
                    transform 800ms var(--ease-reveal);
      }
      .stat-strip.reveal {
        opacity: 1;
        transform: translateY(0);
      }
      .stat-strip-item {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 6px;
        padding: 4px 0;
        text-align: center;
        cursor: default;
        transition: transform 320ms var(--ease-reveal);
      }
      .stat-strip-item:hover {
        transform: translateY(-3px);
      }
      .stat-strip-item:hover .stat-strip-value {
        color: #f1dc96;
        text-shadow: 0 0 18px rgba(241, 220, 150, 0.55);
      }
      .stat-strip-value {
        font-family: var(--font-display);
        font-size: clamp(1.5rem, 2.4vw, 2.1rem);
        font-weight: 500;
        font-variant-numeric: tabular-nums;
        line-height: 1;
        color: var(--color-gold-light);
        letter-spacing: -0.012em;
        transition: color 320ms ease-out, text-shadow 320ms ease-out;
      }
      .stat-strip-label {
        font-family: var(--font-body);
        font-size: 13px;
        font-weight: 400;
        letter-spacing: 0.03em;
        color: rgba(220, 213, 200, 0.78);
      }
      .stat-strip-sep {
        width: 1px;
        height: 28px;
        background: linear-gradient(180deg, transparent, rgba(201, 168, 76, 0.3), transparent);
      }
      @media (prefers-reduced-motion: reduce) {
        .stat-strip { transition: none; opacity: 1; transform: none; }
        .stat-strip-item { transition: none; }
        .stat-strip-item:hover { transform: none; }
      }
      @media (max-width: 768px) {
        .stat-strip {
          grid-template-columns: 1fr 1fr;
          gap: 16px 16px;
          padding: 18px 20px;
        }
        .stat-strip-sep { display: none; }
        .stat-strip-value { font-size: 1.4rem; }
        .stat-strip-label { font-size: 12px; }
      }
    `;
    document.head.appendChild(style);
  }
}
