import { copy, cta } from '../content/copy';

/**
 * Final CTA section — Vollbild, ein großer Button.
 * Letzte Chance den Visitor in die Calendly-Buchung zu führen.
 */
export class FinalCTA {
  readonly root: HTMLElement;
  private revealed = false;

  constructor(container: HTMLElement) {
    const { finalCta } = copy;
    container.innerHTML = `
      <div class="final-cta-wrap">
        <div class="final-cta-glow"></div>
        <div class="final-cta-inner">
          <h2 class="final-cta-headline">
            ${this.escape(finalCta.headline.plain)}
            <br>
            <em>${this.escape(finalCta.headline.italic)}</em>
          </h2>
          <p class="final-cta-sub">${this.escape(finalCta.sub)}</p>
          <a class="final-cta-btn" href="${cta.primaryHref}"${cta.isCalendly ? ' target="_blank" rel="noopener"' : ''}>
            <span class="final-cta-btn-label">${this.escape(finalCta.button)}</span>
            <span class="final-cta-btn-arrow">→</span>
          </a>
        </div>
      </div>
    `;
    this.root = container.querySelector('.final-cta-wrap') as HTMLElement;
    this.injectStyles();
    this.observe();
  }

  private observe(): void {
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting && !this.revealed) {
            this.revealed = true;
            this.root.classList.add('reveal');
            io.disconnect();
          }
        }
      },
      { threshold: 0.25 },
    );
    io.observe(this.root);
  }

  private escape(text: string): string {
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }

  private injectStyles(): void {
    if (document.getElementById('final-cta-styles')) return;
    const style = document.createElement('style');
    style.id = 'final-cta-styles';
    style.textContent = `
      .final-cta-wrap {
        position: relative;
        width: 100%;
        min-height: 80vh;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 96px 32px;
        overflow: hidden;
      }
      .final-cta-glow {
        position: absolute;
        inset: 0;
        background: radial-gradient(ellipse at 50% 50%, rgba(201, 168, 76, 0.22) 0%, transparent 60%);
        pointer-events: none;
      }
      .final-cta-inner {
        position: relative;
        text-align: center;
        max-width: 760px;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 28px;
        opacity: 0;
        transform: translateY(24px);
        transition: opacity 1200ms cubic-bezier(0.16, 1, 0.3, 1),
                    transform 1200ms cubic-bezier(0.16, 1, 0.3, 1);
      }
      .final-cta-wrap.reveal .final-cta-inner {
        opacity: 1;
        transform: translateY(0);
      }

      .final-cta-headline {
        font-family: var(--font-display);
        font-weight: 400;
        font-size: clamp(2rem, 4.2vw, 3.6rem);
        line-height: 1.2;
        margin: 0;
        color: var(--color-text);
        text-wrap: balance;
      }
      .final-cta-headline em {
        font-style: italic;
        font-weight: 500;
        color: var(--color-gold);
      }
      .final-cta-sub {
        font-family: var(--font-body);
        font-size: 16px;
        line-height: 1.65;
        color: var(--color-text-muted);
        max-width: 560px;
        margin: 0;
        text-wrap: balance;
      }
      .final-cta-btn {
        margin-top: 16px;
        display: inline-flex;
        align-items: center;
        gap: 14px;
        padding: 20px 52px;
        border-radius: 4px;
        background: linear-gradient(135deg, var(--color-gold), var(--color-gold-dark));
        color: var(--color-black);
        font-family: var(--font-body);
        font-size: 14px;
        font-weight: 600;
        letter-spacing: 0.18em;
        text-transform: uppercase;
        text-decoration: none;
        box-shadow: 0 0 32px rgba(201, 168, 76, 0.4),
                    0 6px 24px rgba(201, 168, 76, 0.25);
        transition: background 400ms cubic-bezier(0.16, 1, 0.3, 1),
                    box-shadow 400ms cubic-bezier(0.16, 1, 0.3, 1),
                    transform 400ms cubic-bezier(0.16, 1, 0.3, 1);
      }
      .final-cta-btn:hover {
        background: linear-gradient(135deg, var(--color-gold-light), var(--color-gold));
        box-shadow: 0 0 56px rgba(201, 168, 76, 0.65),
                    0 12px 36px rgba(201, 168, 76, 0.45);
        transform: translateY(-2px);
      }
      .final-cta-btn:focus-visible {
        outline: 2px solid var(--color-gold-light);
        outline-offset: 6px;
      }
      .final-cta-btn-arrow {
        font-weight: 700;
        transition: transform 400ms ease;
      }
      .final-cta-btn:hover .final-cta-btn-arrow {
        transform: translateX(6px);
      }

      @media (max-width: 768px) {
        .final-cta-wrap { padding: 72px 24px; min-height: 70vh; }
        .final-cta-btn { padding: 16px 36px; font-size: 13px; }
      }
    `;
    document.head.appendChild(style);
  }
}
