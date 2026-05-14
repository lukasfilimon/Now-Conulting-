import { copy } from '../content/copy';
import { faq } from '../content/faq';

/**
 * FAQ section — Akkordeon-Pattern für Einwand-Behandlung.
 * Erste Frage standardmäßig offen, alle anderen geschlossen.
 */
export class FAQ {
  readonly root: HTMLElement;
  private revealed = false;

  constructor(container: HTMLElement) {
    container.innerHTML = `
      <div class="faq-wrap">
        <div class="faq-header">
          <span class="faq-eyebrow">${copy.faq.eyebrow}</span>
          <h2 class="faq-headline">${this.escape(copy.faq.headline)}</h2>
        </div>
        <div class="faq-list">
          ${faq
            .map(
              (item, i) => `
            <details class="faq-item" ${i === 0 ? 'open' : ''}>
              <summary class="faq-q">
                <span class="faq-q-text">${this.escape(item.question)}</span>
                <span class="faq-q-icon" aria-hidden="true">
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <path d="M3.5 5.25L7 8.75L10.5 5.25" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                </span>
              </summary>
              <div class="faq-a">
                <p>${this.escape(item.answer)}</p>
              </div>
            </details>
          `,
            )
            .join('')}
        </div>
      </div>
    `;
    this.root = container.querySelector('.faq-wrap') as HTMLElement;
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
      { threshold: 0.15 },
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
    if (document.getElementById('faq-styles')) return;
    const style = document.createElement('style');
    style.id = 'faq-styles';
    style.textContent = `
      .faq-wrap {
        max-width: 900px;
        margin: 0 auto;
        padding: 0 32px;
      }
      .faq-header {
        text-align: center;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 18px;
        margin-bottom: 56px;
        opacity: 0;
        transform: translateY(20px);
        transition: opacity 900ms ease-out, transform 900ms ease-out;
      }
      .faq-wrap.reveal .faq-header {
        opacity: 1;
        transform: translateY(0);
      }
      .faq-eyebrow {
        font-family: var(--font-mono);
        font-size: 11px;
        font-weight: 600;
        letter-spacing: 0.32em;
        color: var(--color-gold);
        text-transform: uppercase;
      }
      .faq-headline {
        font-family: var(--font-display);
        font-weight: 500;
        font-size: clamp(1.8rem, 3.2vw, 2.8rem);
        line-height: 1.25;
        margin: 0;
        color: var(--color-text);
      }

      .faq-list {
        display: flex;
        flex-direction: column;
        gap: 0;
        border-top: 1px solid var(--color-border);
      }
      .faq-item {
        border-bottom: 1px solid var(--color-border);
        opacity: 0;
        transform: translateY(16px);
        transition: opacity 900ms ease, transform 900ms ease;
      }
      .faq-wrap.reveal .faq-item {
        opacity: 1;
        transform: translateY(0);
      }
      .faq-wrap.reveal .faq-item:nth-child(1) { transition-delay: 150ms; }
      .faq-wrap.reveal .faq-item:nth-child(2) { transition-delay: 220ms; }
      .faq-wrap.reveal .faq-item:nth-child(3) { transition-delay: 290ms; }
      .faq-wrap.reveal .faq-item:nth-child(4) { transition-delay: 360ms; }
      .faq-wrap.reveal .faq-item:nth-child(5) { transition-delay: 430ms; }
      .faq-wrap.reveal .faq-item:nth-child(6) { transition-delay: 500ms; }
      .faq-wrap.reveal .faq-item:nth-child(7) { transition-delay: 570ms; }
      .faq-wrap.reveal .faq-item:nth-child(8) { transition-delay: 640ms; }

      .faq-q {
        cursor: pointer;
        list-style: none;
        padding: 26px 0;
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 32px;
        font-family: var(--font-display);
        font-weight: 500;
        font-size: clamp(1.1rem, 1.6vw, 1.35rem);
        line-height: 1.4;
        color: var(--color-text);
        transition: color 300ms ease;
      }
      .faq-q::-webkit-details-marker { display: none; }
      .faq-q:hover {
        color: var(--color-gold);
      }
      .faq-q-text {
        flex: 1;
      }
      .faq-q-icon {
        flex-shrink: 0;
        width: 32px;
        height: 32px;
        border-radius: 50%;
        background: rgba(201, 168, 76, 0.1);
        border: 1px solid var(--color-border);
        display: flex;
        align-items: center;
        justify-content: center;
        color: var(--color-gold);
        transition: transform 400ms cubic-bezier(0.16, 1, 0.3, 1),
                    background 400ms ease;
      }
      .faq-item[open] .faq-q-icon {
        transform: rotate(180deg);
        background: var(--color-gold);
        color: var(--color-black);
      }
      .faq-a {
        padding: 0 0 28px;
        max-width: 740px;
      }
      .faq-a p {
        font-family: var(--font-body);
        font-size: 15px;
        line-height: 1.7;
        color: var(--color-text-muted);
        margin: 0;
      }

      @media (max-width: 768px) {
        .faq-wrap { padding: 0 24px; }
        .faq-q { padding: 22px 0; font-size: 1rem; gap: 20px; }
        .faq-a { padding-bottom: 22px; }
        .faq-a p { font-size: 14px; }
      }
    `;
    document.head.appendChild(style);
  }
}
