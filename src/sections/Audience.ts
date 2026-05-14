import { copy } from '../content/copy';

/**
 * Audience / Pain section — Vorher / Nachher in zwei Spalten.
 * Spricht den spirituell-unbefriedigten Coach direkt an.
 */
export class Audience {
  readonly root: HTMLElement;
  private revealed = false;

  constructor(container: HTMLElement) {
    const { audience } = copy;
    container.innerHTML = `
      <div class="audience-wrap">
        <div class="audience-header">
          <span class="audience-eyebrow">${audience.eyebrow}</span>
          <h2 class="audience-headline">${this.italicize(audience.headline)}</h2>
        </div>
        <div class="audience-grid">
          <div class="audience-col audience-col--before">
            <span class="audience-col-label">${audience.before.label}</span>
            ${audience.before.items
              .map((t) => `<p class="audience-line">${this.escape(t)}</p>`)
              .join('<div class="audience-divider"></div>')}
          </div>
          <div class="audience-col audience-col--after">
            <span class="audience-col-label">${audience.after.label}</span>
            ${audience.after.items
              .map((t) => `<p class="audience-line">${this.escape(t)}</p>`)
              .join('<div class="audience-divider audience-divider--gold"></div>')}
          </div>
        </div>
      </div>
    `;
    this.root = container.querySelector('.audience-wrap') as HTMLElement;
    this.injectStyles();
    this.observe();
  }

  private italicize(text: string): string {
    // Render the headline in plain Cormorant italic for whole sentence
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
      .audience-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 56px;
      }
      .audience-col {
        display: flex;
        flex-direction: column;
        gap: 24px;
        opacity: 0;
        transform: translateY(28px);
        transition: opacity 1100ms cubic-bezier(0.16, 1, 0.3, 1),
                    transform 1100ms cubic-bezier(0.16, 1, 0.3, 1);
      }
      .audience-wrap.reveal .audience-col--before { transition-delay: 200ms; opacity: 1; transform: translateY(0); }
      .audience-wrap.reveal .audience-col--after  { transition-delay: 500ms; opacity: 1; transform: translateY(0); }

      .audience-col-label {
        font-family: var(--font-mono);
        font-size: 10px;
        font-weight: 600;
        letter-spacing: 0.4em;
        text-transform: uppercase;
        color: var(--color-text-dim);
      }
      .audience-col--after .audience-col-label {
        color: var(--color-gold);
      }
      .audience-line {
        font-family: var(--font-display);
        font-weight: 400;
        font-style: italic;
        font-size: clamp(1.2rem, 1.9vw, 1.6rem);
        line-height: 1.45;
        color: var(--color-text);
        margin: 0;
      }
      .audience-col--after .audience-line {
        color: var(--color-text);
      }
      .audience-divider {
        width: 48px;
        height: 1px;
        background: rgba(201, 168, 76, 0.15);
      }
      .audience-divider--gold {
        background: var(--color-gold);
        opacity: 0.5;
      }

      @media (max-width: 768px) {
        .audience-wrap { padding: 0 24px; gap: 48px; }
        .audience-grid {
          grid-template-columns: 1fr;
          gap: 48px;
        }
        .audience-line { font-size: 1.15rem; }
      }
    `;
    document.head.appendChild(style);
  }
}
