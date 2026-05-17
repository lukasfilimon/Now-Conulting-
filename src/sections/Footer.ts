import { copy, cta } from '../content/copy';

/**
 * Footer — 1:1 vom Masterclass-LP Pattern.
 *
 * Layout:
 *  - Top: Logo links + Tagline + CTA-Button rechts (footer-inner)
 *  - Bottom: Copyright links + Legal-Links rechts (footer-bottom)
 *  - Top-Hairline (Gold mit Glow) — Grenze zwischen Final-CTA und Footer
 *
 * Legal-Links (Impressum, Datenschutz, AGB) sind echte Links auf eigene Seiten
 * unter /impressum, /datenschutz, /agb (siehe public/{name}/index.html).
 */
export class Footer {
  readonly root: HTMLElement;

  constructor(container: HTMLElement) {
    const { footer } = copy;
    container.innerHTML = `
      <footer class="footer-wrap">
        <div class="footer-inner">
          <div class="footer-brand">
            <img src="/now-logo.png" alt="NOW Consulting" class="footer-logo" loading="lazy" decoding="async" />
            <p class="footer-tagline">${this.escape(footer.tagline)}</p>
          </div>
          <div class="footer-right">
            <a class="footer-cta" href="${cta.primaryHref}"${cta.isCalendly ? ' target="_blank" rel="noopener"' : ''}>${this.escape(cta.primaryLabel)}</a>
          </div>
        </div>
        <div class="footer-bottom">
          <p class="footer-copy">© ${new Date().getFullYear()} NOW Consulting</p>
          <div class="footer-legal">
            <a class="footer-legal-link" href="/impressum">Impressum</a>
            <a class="footer-legal-link" href="/datenschutz">Datenschutz</a>
            <a class="footer-legal-link" href="/agb">AGB</a>
          </div>
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
      /* ═══════════════════════════════════════════════════════
         FOOTER WRAP — Masterclass-Pattern
         ═══════════════════════════════════════════════════════ */
      .footer-wrap {
        position: relative;
        max-width: 1200px;
        margin: 0 auto;
        padding: 56px 32px 24px;
      }

      /* Top-Hairline mit Gold-Glow — Grenze zwischen Final-CTA und Footer */
      section[data-section="footer"] {
        position: relative;
        background:
          radial-gradient(ellipse 70% 50% at 50% 0%, rgba(201, 168, 76, 0.08) 0%, transparent 55%),
          var(--color-black);
      }
      section[data-section="footer"]::after {
        content: '';
        position: absolute;
        left: 8%;
        right: 8%;
        top: 0;
        height: 1px;
        background: linear-gradient(
          to right,
          transparent,
          rgba(201, 168, 76, 0.45) 30%,
          rgba(201, 168, 76, 0.45) 70%,
          transparent
        );
        box-shadow:
          0 0 10px rgba(201, 168, 76, 0.3),
          0 0 24px rgba(201, 168, 76, 0.12);
        z-index: 2;
        pointer-events: none;
      }

      /* ═══════════════════════════════════════════════════════
         INNER — Logo + Tagline links, CTA rechts
         ═══════════════════════════════════════════════════════ */
      .footer-inner {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding-bottom: 40px;
        border-bottom: 1px solid rgba(201, 168, 76, 0.18);
        gap: 24px;
        flex-wrap: wrap;
      }
      .footer-brand {
        display: flex;
        flex-direction: column;
        gap: 10px;
      }
      .footer-logo {
        height: 32px;
        width: auto;
        object-fit: contain;
        display: block;
      }
      .footer-tagline {
        font-family: var(--font-body);
        font-size: 0.85rem;
        color: var(--color-text-dim);
        margin: 0;
      }

      /* Footer-CTA: gold Hero-Pattern Button */
      .footer-cta {
        display: inline-flex;
        align-items: center;
        padding: 14px 32px;
        border-radius: 4px;
        background: linear-gradient(135deg, var(--color-gold), var(--color-gold-dark));
        color: var(--color-black);
        font-family: var(--font-body);
        font-size: 0.95rem;
        font-weight: 600;
        letter-spacing: 0.04em;
        text-decoration: none;
        text-transform: uppercase;
        cursor: pointer;
        box-shadow:
          0 0 18px rgba(201, 168, 76, 0.28),
          0 4px 16px rgba(201, 168, 76, 0.18);
        transition:
          background 400ms cubic-bezier(0.16, 1, 0.3, 1),
          box-shadow 400ms cubic-bezier(0.16, 1, 0.3, 1),
          transform 400ms cubic-bezier(0.16, 1, 0.3, 1);
      }
      .footer-cta:hover {
        background: linear-gradient(135deg, var(--color-gold-light), var(--color-gold));
        box-shadow:
          0 0 36px rgba(201, 168, 76, 0.55),
          0 8px 32px rgba(201, 168, 76, 0.35);
        transform: translateY(-2px);
      }

      /* ═══════════════════════════════════════════════════════
         BOTTOM — Copyright links, Legal-Links rechts
         ═══════════════════════════════════════════════════════ */
      .footer-bottom {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 20px 0;
        flex-wrap: wrap;
        gap: 12px;
      }
      .footer-copy {
        font-family: var(--font-body);
        font-size: 0.8rem;
        color: var(--color-text-dim);
        margin: 0;
      }
      .footer-legal {
        display: flex;
        gap: 24px;
      }
      .footer-legal-link {
        font-family: var(--font-body);
        font-size: 0.8rem;
        color: var(--color-text-dim);
        text-decoration: none;
        cursor: pointer;
        transition: color 300ms ease;
      }
      .footer-legal-link:hover {
        color: var(--color-gold);
      }

      @media (max-width: 768px) {
        .footer-wrap { padding: 44px 24px 20px; }
        .footer-inner {
          flex-direction: column;
          align-items: flex-start;
          padding-bottom: 28px;
        }
        .footer-bottom { flex-direction: column; align-items: flex-start; }
      }
    `;
    document.head.appendChild(style);
  }
}
