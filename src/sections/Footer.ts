import { copy } from '../content/copy';

/**
 * Minimal footer — Wordmark, Tagline, Adresse, Email, Legal-Links, Instagram.
 */
export class Footer {
  readonly root: HTMLElement;

  constructor(container: HTMLElement) {
    const { footer } = copy;
    container.innerHTML = `
      <footer class="footer-wrap">
        <div class="footer-top">
          <a class="footer-wordmark" href="/" aria-label="NOW Consulting — zur Startseite">
            <span class="footer-wordmark-text">NOW</span>
            <span class="footer-wordmark-dot" aria-hidden="true">·</span>
            <span class="footer-wordmark-sub">CONSULTING</span>
          </a>
          <p class="footer-tagline">${this.escape(footer.tagline)}</p>
        </div>
        <div class="footer-grid">
          <div class="footer-col">
            <span class="footer-col-label">Kontakt</span>
            <p class="footer-address">${this.escape(footer.address)}</p>
            <a class="footer-email" href="mailto:${this.escape(footer.email)}">${this.escape(footer.email)}</a>
          </div>
          <div class="footer-col">
            <span class="footer-col-label">Social</span>
            ${footer.social
              .map(
                (s) => `
              <a class="footer-link" href="${this.escape(s.href)}" target="_blank" rel="noopener">${this.escape(s.label)}</a>
            `,
              )
              .join('')}
          </div>
          <div class="footer-col">
            <span class="footer-col-label">Rechtliches</span>
            ${footer.legal
              .map(
                (l) => `
              <a class="footer-link" href="${this.escape(l.href)}">${this.escape(l.label)}</a>
            `,
              )
              .join('')}
          </div>
        </div>
        <div class="footer-bottom">
          <span class="footer-copy">© ${new Date().getFullYear()} NOW Consulting · Alle Rechte vorbehalten</span>
        </div>
      </footer>
    `;
    this.root = container.querySelector('.footer-wrap') as HTMLElement;
    this.injectStyles();
  }

  private escape(text: string): string {
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  private injectStyles(): void {
    if (document.getElementById('footer-styles')) return;
    const style = document.createElement('style');
    style.id = 'footer-styles';
    style.textContent = `
      .footer-wrap {
        max-width: 1200px;
        margin: 0 auto;
        padding: 64px 32px 32px;
        border-top: 1px solid var(--color-border);
        display: flex;
        flex-direction: column;
        gap: 48px;
      }
      .footer-top {
        display: flex;
        justify-content: space-between;
        align-items: flex-end;
        gap: 32px;
        flex-wrap: wrap;
      }
      .footer-wordmark {
        display: inline-flex;
        align-items: baseline;
        gap: 10px;
        text-decoration: none;
      }
      .footer-wordmark-text {
        font-family: var(--font-display);
        font-style: italic;
        font-weight: 600;
        font-size: 28px;
        color: var(--color-gold-light);
      }
      .footer-wordmark-dot {
        color: var(--color-gold);
        font-size: 20px;
        opacity: 0.6;
      }
      .footer-wordmark-sub {
        font-family: var(--font-mono);
        font-size: 11px;
        letter-spacing: 0.32em;
        text-transform: uppercase;
        color: rgba(212, 175, 55, 0.7);
      }
      .footer-tagline {
        font-family: var(--font-display);
        font-style: italic;
        font-size: 1rem;
        color: var(--color-text-muted);
        margin: 0;
        text-align: right;
      }

      .footer-grid {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 32px;
        padding-top: 32px;
        border-top: 1px solid var(--color-border);
      }
      .footer-col {
        display: flex;
        flex-direction: column;
        gap: 10px;
      }
      .footer-col-label {
        font-family: var(--font-mono);
        font-size: 10px;
        font-weight: 600;
        letter-spacing: 0.32em;
        text-transform: uppercase;
        color: var(--color-gold);
        margin-bottom: 6px;
      }
      .footer-address {
        font-family: var(--font-body);
        font-size: 13px;
        line-height: 1.6;
        color: var(--color-text-muted);
        margin: 0;
      }
      .footer-email,
      .footer-link {
        font-family: var(--font-body);
        font-size: 13px;
        color: var(--color-text-muted);
        text-decoration: none;
        transition: color 300ms ease;
      }
      .footer-email:hover,
      .footer-link:hover {
        color: var(--color-gold);
      }
      .footer-bottom {
        padding-top: 24px;
        border-top: 1px solid rgba(201, 168, 76, 0.08);
        text-align: center;
      }
      .footer-copy {
        font-family: var(--font-mono);
        font-size: 10px;
        letter-spacing: 0.24em;
        text-transform: uppercase;
        color: var(--color-text-dim);
      }

      @media (max-width: 768px) {
        .footer-wrap { padding: 48px 24px 24px; gap: 36px; }
        .footer-top {
          flex-direction: column;
          align-items: flex-start;
          gap: 12px;
        }
        .footer-tagline { text-align: left; }
        .footer-grid {
          grid-template-columns: 1fr;
          gap: 28px;
        }
      }
    `;
    document.head.appendChild(style);
  }
}
