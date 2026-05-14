import { copy, cta } from '../content/copy';
import { experiences } from '../content/experiences';

/**
 * Experiences section — generische Retreats + Mastermind + Seminare Cards.
 * Keine konkreten Termine auf Site, Details im Erstgespräch.
 */
export class Experiences {
  readonly root: HTMLElement;
  private revealed = false;

  constructor(container: HTMLElement) {
    container.innerHTML = `
      <div class="experiences-wrap">
        <div class="experiences-header">
          <span class="experiences-eyebrow">${copy.experiences.eyebrow}</span>
          <h2 class="experiences-headline">${this.escape(copy.experiences.headline)}</h2>
          <p class="experiences-sub">${this.escape(copy.experiences.sub)}</p>
        </div>
        <div class="experiences-grid">
          ${experiences
            .map(
              (e, i) => `
            <article class="experience-card" data-i="${i}">
              <div class="experience-card-glow"></div>
              <div class="experience-card-content">
                <span class="experience-card-num">${this.escape(String(i + 1).padStart(2, '0'))}</span>
                <h3 class="experience-card-title">${this.escape(e.title)}</h3>
                <span class="experience-card-meta">${this.escape(e.meta)}</span>
                <p class="experience-card-desc">${this.escape(e.description)}</p>
                <a class="experience-card-cta" href="${cta.primaryHref}"${cta.isCalendly ? ' target="_blank" rel="noopener"' : ''}>
                  Mehr erfahren <span>→</span>
                </a>
              </div>
            </article>
          `,
            )
            .join('')}
        </div>
      </div>
    `;
    this.root = container.querySelector('.experiences-wrap') as HTMLElement;
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
    if (document.getElementById('experiences-styles')) return;
    const style = document.createElement('style');
    style.id = 'experiences-styles';
    style.textContent = `
      .experiences-wrap {
        max-width: 1200px;
        margin: 0 auto;
        padding: 0 32px;
      }
      .experiences-header {
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
      .experiences-wrap.reveal .experiences-header {
        opacity: 1;
        transform: translateY(0);
      }
      .experiences-eyebrow {
        font-family: var(--font-mono);
        font-size: 11px;
        font-weight: 600;
        letter-spacing: 0.32em;
        color: var(--color-gold);
        text-transform: uppercase;
      }
      .experiences-headline {
        font-family: var(--font-display);
        font-weight: 500;
        font-style: italic;
        font-size: clamp(1.8rem, 3.2vw, 2.8rem);
        line-height: 1.25;
        margin: 0;
        color: var(--color-text);
        max-width: 760px;
        text-wrap: balance;
      }
      .experiences-sub {
        font-family: var(--font-body);
        font-size: 16px;
        line-height: 1.65;
        color: var(--color-text-muted);
        max-width: 640px;
        margin: 0;
        text-wrap: balance;
      }

      .experiences-grid {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 24px;
      }

      .experience-card {
        position: relative;
        overflow: hidden;
        background: linear-gradient(180deg, var(--color-surface) 0%, var(--color-black) 100%);
        border: 1px solid var(--color-border);
        border-radius: 8px;
        padding: 44px 36px;
        min-height: 380px;
        display: flex;
        flex-direction: column;
        opacity: 0;
        transform: translateY(28px);
        transition: opacity 1000ms cubic-bezier(0.16, 1, 0.3, 1),
                    transform 1000ms cubic-bezier(0.16, 1, 0.3, 1),
                    border-color 400ms ease;
      }
      .experiences-wrap.reveal .experience-card[data-i="0"] { transition-delay: 200ms; opacity: 1; transform: translateY(0); }
      .experiences-wrap.reveal .experience-card[data-i="1"] { transition-delay: 350ms; opacity: 1; transform: translateY(0); }
      .experiences-wrap.reveal .experience-card[data-i="2"] { transition-delay: 500ms; opacity: 1; transform: translateY(0); }

      .experience-card:hover {
        border-color: rgba(201, 168, 76, 0.5);
      }
      .experience-card:hover .experience-card-glow {
        opacity: 1;
      }

      .experience-card-glow {
        position: absolute;
        inset: 0;
        background: radial-gradient(circle at 50% 0%, rgba(201, 168, 76, 0.18) 0%, transparent 60%);
        opacity: 0.4;
        transition: opacity 600ms ease;
        pointer-events: none;
      }
      .experience-card-content {
        position: relative;
        display: flex;
        flex-direction: column;
        gap: 14px;
        flex: 1;
      }
      .experience-card-num {
        font-family: var(--font-display);
        font-style: italic;
        font-weight: 300;
        font-size: 2.4rem;
        line-height: 1;
        color: var(--color-gold);
        text-shadow: 0 0 24px rgba(201, 168, 76, 0.35);
        margin-bottom: 6px;
      }
      .experience-card-title {
        font-family: var(--font-display);
        font-weight: 500;
        font-style: italic;
        font-size: 1.5rem;
        line-height: 1.2;
        color: var(--color-text);
        margin: 0;
      }
      .experience-card-meta {
        font-family: var(--font-mono);
        font-size: 10px;
        letter-spacing: 0.28em;
        text-transform: uppercase;
        color: var(--color-text-dim);
      }
      .experience-card-desc {
        font-family: var(--font-body);
        font-size: 14px;
        line-height: 1.65;
        color: var(--color-text-muted);
        margin: 0;
        flex: 1;
      }
      .experience-card-cta {
        margin-top: 18px;
        display: inline-flex;
        align-items: center;
        gap: 10px;
        font-family: var(--font-body);
        font-size: 12px;
        font-weight: 600;
        letter-spacing: 0.18em;
        text-transform: uppercase;
        color: var(--color-gold);
        text-decoration: none;
        transition: gap 300ms ease;
      }
      .experience-card-cta:hover {
        gap: 14px;
        color: var(--color-gold-light);
      }
      .experience-card-cta span {
        font-weight: 700;
      }

      @media (max-width: 900px) {
        .experiences-wrap { padding: 0 24px; }
        .experiences-grid {
          grid-template-columns: 1fr;
          gap: 20px;
        }
        .experience-card {
          padding: 36px 28px;
          min-height: auto;
        }
      }
    `;
    document.head.appendChild(style);
  }
}
