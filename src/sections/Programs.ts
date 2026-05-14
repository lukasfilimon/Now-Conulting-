import { copy, cta } from '../content/copy';
import { programs } from '../content/programs';

/**
 * Programs section — 2 Cards (Salesforce + Leadership Mastery).
 * KEINE Preise auf Site. CTAs zum Erstgespräch.
 */
export class Programs {
  readonly root: HTMLElement;
  private revealed = false;

  constructor(container: HTMLElement) {
    container.innerHTML = `
      <div class="programs-wrap">
        <div class="programs-header">
          <span class="programs-eyebrow">PROGRAMME</span>
          <h2 class="programs-headline">
            Zwei Wege. <em>Ein Prinzip.</em>
          </h2>
        </div>
        <div class="programs-grid">
          ${programs
            .map(
              (p) => `
            <article class="program-card" data-id="${p.id}">
              <header class="program-card-head">
                <h3 class="program-card-name">${this.escape(p.name)}</h3>
                <span class="program-card-duration">${this.escape(p.duration)}</span>
              </header>
              <p class="program-card-tagline">${this.escape(p.tagline)}</p>
              <p class="program-card-desc">${this.escape(p.description)}</p>
              <ul class="program-card-inclusions">
                ${p.inclusions
                  .map((inc) => `<li>${this.escape(inc)}</li>`)
                  .join('')}
              </ul>
              <a class="program-card-cta" href="${cta.primaryHref}"${cta.isCalendly ? ' target="_blank" rel="noopener"' : ''}>
                <span>${cta.primaryLabel}</span>
                <span class="program-card-cta-arrow">→</span>
              </a>
            </article>
          `,
            )
            .join('')}
        </div>
      </div>
    `;
    this.root = container.querySelector('.programs-wrap') as HTMLElement;
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
      { threshold: 0.2 },
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
    if (document.getElementById('programs-styles')) return;
    const style = document.createElement('style');
    style.id = 'programs-styles';
    style.textContent = `
      .programs-wrap {
        max-width: 1200px;
        margin: 0 auto;
        padding: 0 32px;
      }
      .programs-header {
        text-align: center;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 18px;
        margin-bottom: 64px;
        opacity: 0;
        transform: translateY(20px);
        transition: opacity 900ms ease-out, transform 900ms ease-out;
      }
      .programs-wrap.reveal .programs-header {
        opacity: 1;
        transform: translateY(0);
      }
      .programs-eyebrow {
        font-family: var(--font-mono);
        font-size: 11px;
        font-weight: 600;
        letter-spacing: 0.32em;
        color: var(--color-gold);
        text-transform: uppercase;
      }
      .programs-headline {
        font-family: var(--font-display);
        font-weight: 500;
        font-size: clamp(2rem, 3.6vw, 3.2rem);
        line-height: 1.2;
        margin: 0;
        color: var(--color-text);
      }
      .programs-headline em {
        font-style: italic;
        color: var(--color-gold);
        font-weight: 500;
        margin-left: 8px;
      }

      .programs-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 32px;
      }
      .program-card {
        background: linear-gradient(180deg, var(--color-surface) 0%, rgba(24, 20, 16, 0.5) 100%);
        border: 1px solid var(--color-border);
        border-radius: 8px;
        padding: 48px 40px;
        display: flex;
        flex-direction: column;
        gap: 20px;
        opacity: 0;
        transform: translateY(28px);
        transition: opacity 1000ms cubic-bezier(0.16, 1, 0.3, 1),
                    transform 1000ms cubic-bezier(0.16, 1, 0.3, 1),
                    border-color 400ms ease, box-shadow 400ms ease;
      }
      .programs-wrap.reveal .program-card:nth-child(1) { transition-delay: 200ms; opacity: 1; transform: translateY(0); }
      .programs-wrap.reveal .program-card:nth-child(2) { transition-delay: 400ms; opacity: 1; transform: translateY(0); }

      .program-card:hover {
        border-color: rgba(201, 168, 76, 0.5);
        box-shadow: 0 16px 40px rgba(0, 0, 0, 0.4),
                    0 0 32px rgba(201, 168, 76, 0.08);
      }

      .program-card-head {
        display: flex;
        flex-direction: column;
        gap: 6px;
        padding-bottom: 20px;
        border-bottom: 1px solid var(--color-border);
      }
      .program-card-name {
        font-family: var(--font-display);
        font-weight: 500;
        font-style: italic;
        font-size: clamp(1.8rem, 2.6vw, 2.4rem);
        line-height: 1.2;
        color: var(--color-gold);
        margin: 0;
      }
      .program-card-duration {
        font-family: var(--font-mono);
        font-size: 11px;
        letter-spacing: 0.2em;
        text-transform: uppercase;
        color: var(--color-text-dim);
      }
      .program-card-tagline {
        font-family: var(--font-display);
        font-style: italic;
        font-size: 1.05rem;
        line-height: 1.5;
        color: var(--color-text);
        margin: 0;
      }
      .program-card-desc {
        font-family: var(--font-body);
        font-size: 15px;
        line-height: 1.65;
        color: var(--color-text-muted);
        margin: 0;
      }
      .program-card-inclusions {
        list-style: none;
        padding: 0;
        margin: 0;
        display: flex;
        flex-direction: column;
        gap: 8px;
      }
      .program-card-inclusions li {
        font-family: var(--font-body);
        font-size: 14px;
        color: var(--color-text);
        padding-left: 22px;
        position: relative;
      }
      .program-card-inclusions li::before {
        content: '◆';
        position: absolute;
        left: 0;
        top: 0;
        color: var(--color-gold);
        font-size: 9px;
        line-height: 1.6;
      }
      .program-card-cta {
        margin-top: auto;
        padding-top: 28px;
        display: inline-flex;
        align-items: center;
        gap: 14px;
        font-family: var(--font-body);
        font-size: 13px;
        font-weight: 600;
        letter-spacing: 0.18em;
        text-transform: uppercase;
        color: var(--color-gold);
        text-decoration: none;
        transition: color 300ms ease, gap 300ms ease;
      }
      .program-card-cta:hover {
        color: var(--color-gold-light);
        gap: 18px;
      }
      .program-card-cta-arrow {
        font-weight: 700;
        transition: transform 300ms ease;
      }
      .program-card-cta:hover .program-card-cta-arrow {
        transform: translateX(4px);
      }

      @media (max-width: 900px) {
        .programs-wrap { padding: 0 24px; }
        .programs-grid {
          grid-template-columns: 1fr;
          gap: 24px;
        }
        .program-card { padding: 36px 28px; }
      }
    `;
    document.head.appendChild(style);
  }
}
