import { copy } from '../content/copy';

/**
 * Stimmen unserer Kunden — Video-Testimonials Grid.
 * In v1: Placeholder-Cards die das Format kommunizieren.
 * Video-Files werden über `/public/testimonials/` geladen sobald verfügbar.
 */
interface VideoTestimonial {
  name: string;
  role: string;
  videoUrl?: string; // YouTube/Vimeo embed URL (Privacy-Enhanced Mode)
  pullQuote?: string;
}

// TODO: Replace with real testimonial data once videos are uploaded
const testimonials: VideoTestimonial[] = [
  {
    name: 'Premium-Kunde',
    role: 'Coaching · Wien',
    pullQuote: 'Ich verkaufe heute aus Klarheit, nicht aus Druck.',
  },
  {
    name: 'Premium-Kunde',
    role: 'Beratung · Salzburg',
    pullQuote: 'Mein Geschäft und meine innere Arbeit sind dasselbe geworden.',
  },
  {
    name: 'Premium-Kunde',
    role: 'Coaching · München',
    pullQuote: 'Ich führe heute ein Team, statt selbst zu coachen.',
  },
];

export class Stimmen {
  readonly root: HTMLElement;
  private revealed = false;

  constructor(container: HTMLElement) {
    container.innerHTML = `
      <div class="stimmen-wrap">
        <div class="stimmen-header">
          <span class="stimmen-eyebrow">${copy.stimmen.eyebrow}</span>
          <h2 class="stimmen-headline">${this.escape(copy.stimmen.headline)}</h2>
        </div>
        <div class="stimmen-grid">
          ${testimonials
            .map(
              (t, i) => `
            <article class="stimme-card" data-i="${i}">
              <div class="stimme-thumb">
                <div class="stimme-thumb-bg"></div>
                <button class="stimme-play" type="button" aria-label="Video abspielen" data-video="${this.escape(t.videoUrl ?? '')}">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <path d="M8 5v14l11-7z" fill="currentColor"/>
                  </svg>
                </button>
              </div>
              ${t.pullQuote ? `<blockquote class="stimme-quote">„${this.escape(t.pullQuote)}"</blockquote>` : ''}
              <footer class="stimme-meta">
                <span class="stimme-name">${this.escape(t.name)}</span>
                <span class="stimme-role">${this.escape(t.role)}</span>
              </footer>
            </article>
          `,
            )
            .join('')}
        </div>
      </div>
    `;
    this.root = container.querySelector('.stimmen-wrap') as HTMLElement;
    this.injectStyles();
    this.bindClicks();
    this.observe();
  }

  private bindClicks(): void {
    this.root.querySelectorAll<HTMLButtonElement>('.stimme-play').forEach((btn) => {
      btn.addEventListener('click', () => {
        const videoUrl = btn.dataset.video;
        if (!videoUrl) {
          // No video file yet — soft no-op, brand stays intact
          return;
        }
        // Modal/iframe player implementation deferred until real videos exist
        window.open(videoUrl, '_blank', 'noopener');
      });
    });
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
    if (document.getElementById('stimmen-styles')) return;
    const style = document.createElement('style');
    style.id = 'stimmen-styles';
    style.textContent = `
      .stimmen-wrap {
        max-width: 1200px;
        margin: 0 auto;
        padding: 0 32px;
      }
      .stimmen-header {
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
      .stimmen-wrap.reveal .stimmen-header {
        opacity: 1;
        transform: translateY(0);
      }
      .stimmen-eyebrow {
        font-family: var(--font-mono);
        font-size: 11px;
        font-weight: 600;
        letter-spacing: 0.32em;
        color: var(--color-gold);
        text-transform: uppercase;
      }
      .stimmen-headline {
        font-family: var(--font-display);
        font-weight: 500;
        font-size: clamp(1.8rem, 3.2vw, 2.8rem);
        line-height: 1.25;
        margin: 0;
        color: var(--color-text);
        max-width: 760px;
        text-wrap: balance;
      }

      .stimmen-grid {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 28px;
      }
      .stimme-card {
        display: flex;
        flex-direction: column;
        gap: 18px;
        opacity: 0;
        transform: translateY(28px);
        transition: opacity 1000ms cubic-bezier(0.16, 1, 0.3, 1),
                    transform 1000ms cubic-bezier(0.16, 1, 0.3, 1);
      }
      .stimmen-wrap.reveal .stimme-card[data-i="0"] { transition-delay: 200ms; opacity: 1; transform: translateY(0); }
      .stimmen-wrap.reveal .stimme-card[data-i="1"] { transition-delay: 350ms; opacity: 1; transform: translateY(0); }
      .stimmen-wrap.reveal .stimme-card[data-i="2"] { transition-delay: 500ms; opacity: 1; transform: translateY(0); }

      .stimme-thumb {
        position: relative;
        aspect-ratio: 16 / 10;
        background: linear-gradient(135deg, var(--color-surface) 0%, var(--color-black) 100%);
        border: 1px solid var(--color-border);
        border-radius: 6px;
        overflow: hidden;
        cursor: pointer;
        transition: border-color 400ms ease, transform 400ms ease;
      }
      .stimme-thumb:hover {
        border-color: rgba(201, 168, 76, 0.5);
        transform: translateY(-2px);
      }
      .stimme-thumb-bg {
        position: absolute;
        inset: 0;
        background: radial-gradient(ellipse at 50% 40%, rgba(201, 168, 76, 0.18) 0%, transparent 65%);
      }
      .stimme-play {
        position: absolute;
        inset: 0;
        margin: auto;
        width: 64px;
        height: 64px;
        border-radius: 50%;
        background: rgba(201, 168, 76, 0.95);
        border: 0;
        display: flex;
        align-items: center;
        justify-content: center;
        color: var(--color-black);
        cursor: pointer;
        transition: transform 400ms cubic-bezier(0.16, 1, 0.3, 1),
                    box-shadow 400ms ease;
        box-shadow: 0 0 30px rgba(201, 168, 76, 0.35);
      }
      .stimme-thumb:hover .stimme-play {
        transform: scale(1.08);
        box-shadow: 0 0 48px rgba(201, 168, 76, 0.55);
      }
      .stimme-quote {
        font-family: var(--font-display);
        font-style: italic;
        font-weight: 400;
        font-size: 1.15rem;
        line-height: 1.5;
        color: var(--color-text);
        margin: 0;
        text-wrap: balance;
      }
      .stimme-meta {
        display: flex;
        flex-direction: column;
        gap: 4px;
      }
      .stimme-name {
        font-family: var(--font-body);
        font-size: 14px;
        font-weight: 600;
        color: var(--color-text);
      }
      .stimme-role {
        font-family: var(--font-mono);
        font-size: 10px;
        letter-spacing: 0.24em;
        text-transform: uppercase;
        color: var(--color-text-dim);
      }

      @media (max-width: 900px) {
        .stimmen-wrap { padding: 0 24px; }
        .stimmen-grid {
          grid-template-columns: 1fr;
          gap: 24px;
        }
      }
    `;
    document.head.appendChild(style);
  }
}
