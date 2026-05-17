import { copy } from '../content/copy';
import { team } from '../content/team';

/**
 * Team section — 4 Personen gleich groß.
 * Initialen-Fallback wenn keine Fotos verfügbar.
 */
export class Team {
  readonly root: HTMLElement;
  private revealed = false;

  constructor(container: HTMLElement) {
    container.innerHTML = `
      <div class="team-wrap">
        <div class="team-header">
          <span class="team-eyebrow">${copy.team.eyebrow}</span>
          <h2 class="team-headline">${this.escape(copy.team.headline)}</h2>
        </div>
        <div class="team-grid">
          ${team
            .map(
              (m, i) => `
            <article class="team-card" data-i="${i}">
              <div class="team-portrait">
                ${
                  m.photoUrl
                    ? `<img src="${this.escape(m.photoUrl)}" alt="${this.escape(m.name)}" loading="lazy" />`
                    : `<span class="team-initials">${this.escape(m.initials)}</span>`
                }
              </div>
              <div class="team-info">
                <h3 class="team-name">${this.escape(m.name)}</h3>
                <span class="team-role">${this.escape(m.role)}</span>
                <p class="team-bio">${this.escape(m.bio)}</p>
              </div>
            </article>
          `,
            )
            .join('')}
        </div>
      </div>
    `;
    this.root = container.querySelector('.team-wrap') as HTMLElement;
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
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  private injectStyles(): void {
    if (document.getElementById('team-styles')) return;
    const style = document.createElement('style');
    style.id = 'team-styles';
    style.textContent = `
      .team-wrap {
        max-width: 1200px;
        margin: 0 auto;
        padding: 0 32px;
      }
      .team-header {
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
      .team-wrap.reveal .team-header {
        opacity: 1;
        transform: translateY(0);
      }
      .team-eyebrow {
        font-family: var(--font-mono);
        font-size: 11px;
        font-weight: 600;
        letter-spacing: 0.32em;
        color: var(--color-gold);
        text-transform: uppercase;
      }
      .team-headline {
        font-family: var(--font-display);
        font-weight: 500;
        font-style: italic;
        font-size: clamp(1.8rem, 3.2vw, 2.8rem);
        line-height: 1.25;
        margin: 0;
        color: var(--color-text);
      }

      .team-grid {
        display: grid;
        grid-template-columns: repeat(4, 1fr);
        gap: 24px;
      }
      .team-card {
        display: flex;
        flex-direction: column;
        gap: 20px;
        opacity: 0;
        transform: translateY(28px);
        transition: opacity 1000ms cubic-bezier(0.16, 1, 0.3, 1),
                    transform 1000ms cubic-bezier(0.16, 1, 0.3, 1);
      }
      .team-wrap.reveal .team-card[data-i="0"] { transition-delay: 150ms; opacity: 1; transform: translateY(0); }
      .team-wrap.reveal .team-card[data-i="1"] { transition-delay: 280ms; opacity: 1; transform: translateY(0); }
      .team-wrap.reveal .team-card[data-i="2"] { transition-delay: 410ms; opacity: 1; transform: translateY(0); }
      .team-wrap.reveal .team-card[data-i="3"] { transition-delay: 540ms; opacity: 1; transform: translateY(0); }

      .team-portrait {
        aspect-ratio: 1 / 1;
        background: linear-gradient(135deg, var(--color-surface) 0%, var(--color-black) 100%);
        border: 1px solid rgba(201, 168, 76, 0.18);
        border-radius: 10px;
        overflow: hidden;
        position: relative;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow:
          0 1px 0 0 rgba(255, 240, 200, 0.05) inset,
          0 18px 36px -18px rgba(0, 0, 0, 0.65);
        transition:
          border-color 400ms ease,
          box-shadow 600ms ease,
          transform 600ms cubic-bezier(0.16, 1, 0.3, 1);
      }
      .team-card:hover .team-portrait {
        border-color: rgba(201, 168, 76, 0.45);
        transform: translateY(-6px);
        box-shadow:
          0 1px 0 0 rgba(255, 240, 200, 0.10) inset,
          0 28px 56px -16px rgba(0, 0, 0, 0.75),
          0 0 36px -10px rgba(201, 168, 76, 0.3);
      }
      .team-portrait img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        object-position: center top;
        display: block;
      }
      .team-initials {
        font-family: var(--font-display);
        font-weight: 300;
        font-style: italic;
        font-size: clamp(3rem, 5vw, 4.5rem);
        color: var(--color-gold);
        line-height: 1;
        text-shadow: 0 0 24px rgba(201, 168, 76, 0.35);
      }

      .team-info {
        display: flex;
        flex-direction: column;
        gap: 6px;
      }
      .team-name {
        font-family: var(--font-display);
        font-weight: 500;
        font-size: 1.2rem;
        line-height: 1.3;
        margin: 0;
        color: var(--color-text);
      }
      .team-role {
        font-family: var(--font-mono);
        font-size: 10px;
        letter-spacing: 0.28em;
        text-transform: uppercase;
        color: var(--color-gold);
      }
      .team-bio {
        font-family: var(--font-body);
        font-size: 13px;
        line-height: 1.6;
        color: var(--color-text-muted);
        margin: 4px 0 0;
      }

      @media (max-width: 900px) {
        .team-wrap { padding: 0 24px; }
        .team-grid {
          grid-template-columns: 1fr 1fr;
          gap: 20px;
        }
      }
      @media (max-width: 520px) {
        .team-grid {
          grid-template-columns: 1fr;
        }
      }
    `;
    document.head.appendChild(style);
  }
}
