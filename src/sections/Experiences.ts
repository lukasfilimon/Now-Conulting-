import { copy, cta } from '../content/copy';
import { experiences } from '../content/experiences';

/**
 * Experiences section — 3 Erlebnis-Karten (Dubai Mastermind / Retreat / Money Mind).
 * Job: Aspiration + Community + Status. Cross-Sell-Welt zeigen, nicht entscheiden lassen.
 *
 * Layout:
 * - Header (Eyebrow + Headline + Sub)
 * - 3 Karten untereinander, Premium-Glass, im Zickzack: Video links/rechts/links (Desktop)
 * - Pro Karte: Video (16:9, 50%) neben Headline/Tagline/Description (50%)
 * - Mobil: Karten stapeln (Video oben, Text darunter)
 * - KEINE CTAs in den Karten (Aspiration-Section, Entscheidung kommt im Erstgespräch)
 */
export class Experiences {
  readonly root: HTMLElement;
  private revealed = false;

  constructor(container: HTMLElement) {
    const headline = copy.experiences.headline;
    container.innerHTML = `
      <div class="experiences-wrap">
        <div class="experiences-header">
          <span class="experiences-eyebrow">${this.escape(copy.experiences.eyebrow)}</span>
          <h2 class="experiences-headline">
            ${this.escape(headline.plain)}
            <em>${this.escape(headline.italic)}</em>
          </h2>
          <p class="experiences-sub">${this.escape(copy.experiences.sub)}</p>
        </div>

        <div class="experiences-grid">
          ${experiences
            .map(
              (e, i) => `
            <article class="experience-card" data-i="${i}" data-id="${this.escape(e.id)}">
              <div class="experience-card-video">
                <iframe
                  src="${this.escape(e.videoUrl)}"
                  frameborder="0"
                  allow="autoplay; fullscreen; picture-in-picture; clipboard-write; encrypted-media; web-share"
                  referrerpolicy="strict-origin-when-cross-origin"
                  title="${this.escape(e.videoTitle)}"
                  loading="lazy"
                ></iframe>
              </div>
              <div class="experience-card-content">
                <h3 class="experience-card-headline">${this.escape(e.title)}</h3>
                <div class="experience-card-body">
                  <p class="experience-card-tagline">${this.escape(e.tagline)}</p>
                  <p class="experience-card-desc">${this.escape(e.description)}</p>
                </div>
              </div>
            </article>
          `,
            )
            .join('')}
        </div>

        <div class="section-cta-wrap">
          <a class="section-cta" href="${cta.primaryHref}"${cta.isCalendly ? ' target="_blank" rel="noopener"' : ''}>
            <span>${this.escape(cta.primaryLabel)}</span>
            <span class="section-cta-arrow">→</span>
          </a>
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
      /* ═══════════════════════════════════════════════════════
         WRAPPER & HEADER
         ═══════════════════════════════════════════════════════ */
      .experiences-wrap {
        max-width: 1320px;
        margin: 0 auto;
        padding: 0 32px;
        position: relative;
        z-index: 2;
      }
      .experiences-header {
        text-align: center;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 18px;
        margin-bottom: 72px;
        max-width: 720px;
        margin-left: auto;
        margin-right: auto;
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
        font-size: clamp(2rem, 3.4vw, 3rem);
        line-height: 1.2;
        margin: 0;
        color: var(--color-text);
        text-wrap: balance;
        letter-spacing: -0.01em;
      }
      .experiences-headline em {
        font-style: italic;
        color: var(--color-gold-light);
        font-weight: 500;
        margin-left: 8px;
      }
      .experiences-sub {
        font-family: var(--font-display);
        font-style: italic;
        font-size: 17px;
        line-height: 1.55;
        color: rgba(228, 222, 210, 0.7);
        max-width: 560px;
        margin: 0;
        letter-spacing: 0.005em;
      }

      /* ═══════════════════════════════════════════════════════
         GRID — 3 Karten untereinander (Zickzack)
         ═══════════════════════════════════════════════════════ */
      .experiences-grid {
        display: flex;
        flex-direction: column;
        gap: 44px;
        max-width: 1120px;
        margin: 0 auto;
      }

      /* ═══════════════════════════════════════════════════════
         CARD — Premium Glass mit Video edge-to-edge oben
         ═══════════════════════════════════════════════════════ */
      .experience-card {
        position: relative;
        padding: 0;
        display: flex;
        flex-direction: row;
        align-items: stretch;
        overflow: hidden;

        background:
          linear-gradient(165deg,
            rgba(34, 30, 20, 0.92) 0%,
            rgba(20, 17, 11, 0.88) 50%,
            rgba(12, 10, 7, 0.82) 100%);

        border: 1px solid rgba(201, 168, 76, 0.16);
        border-radius: 4px;

        /* Backdrop-blur weggelassen — die 3 Karten mit Videos + Background-Shader
           würden den GPU-Layer überfordern und das Scroll-Erlebnis stocken lassen.
           Erhöhte Background-Opacity (0.92/0.88/0.82) hält die Premium-Optik. */

        box-shadow:
          0 1px 0 0 rgba(255, 240, 200, 0.07) inset,
          0 -1px 0 0 rgba(0, 0, 0, 0.4) inset,
          0 32px 64px -28px rgba(0, 0, 0, 0.75),
          0 0 0 1px rgba(201, 168, 76, 0.04);

        opacity: 0;
        transform: translateY(28px);
        transition:
          opacity 1000ms cubic-bezier(0.16, 1, 0.3, 1),
          transform 1000ms cubic-bezier(0.16, 1, 0.3, 1),
          border-color 600ms ease,
          box-shadow 600ms ease;
      }
      .experience-card::before {
        content: '';
        position: absolute;
        inset: 0;
        background:
          radial-gradient(
            ellipse 80% 50% at 50% 0%,
            rgba(226, 201, 122, 0.09) 0%,
            transparent 65%
          );
        pointer-events: none;
        opacity: 0.85;
        transition: opacity 600ms ease;
        z-index: 0;
      }
      .experience-card > * {
        position: relative;
        z-index: 1;
      }
      .experiences-wrap.reveal .experience-card[data-i="0"] {
        transition-delay: 200ms;
        opacity: 1;
        transform: translateY(0);
      }
      .experiences-wrap.reveal .experience-card[data-i="1"] {
        transition-delay: 350ms;
        opacity: 1;
        transform: translateY(0);
      }
      .experiences-wrap.reveal .experience-card[data-i="2"] {
        transition-delay: 500ms;
        opacity: 1;
        transform: translateY(0);
      }
      .experience-card:hover {
        transform: translateY(-6px);
        border-color: rgba(201, 168, 76, 0.4);
        box-shadow:
          0 1px 0 0 rgba(255, 240, 200, 0.12) inset,
          0 -1px 0 0 rgba(0, 0, 0, 0.3) inset,
          0 44px 88px -24px rgba(0, 0, 0, 0.85),
          0 0 0 1px rgba(201, 168, 76, 0.12),
          0 0 40px -10px rgba(201, 168, 76, 0.3);
      }
      .experience-card:hover::before { opacity: 1; }

      /* Zickzack: Karte 2 spiegelt die Anordnung (Video rechts, Text links) */
      .experience-card[data-i="1"] { flex-direction: row-reverse; }

      /* ═══════════════════════════════════════════════════════
         VIDEO — edge-to-edge oben, 16:9 aspect
         ═══════════════════════════════════════════════════════ */
      .experience-card-video {
        flex: 0 0 50%;
        max-width: 50%;
        aspect-ratio: 16 / 9;
        background: #000;
        position: relative;
        overflow: hidden;
      }
      .experience-card-video iframe {
        width: 100%;
        height: 100%;
        border: 0;
        display: block;
      }

      /* ═══════════════════════════════════════════════════════
         CONTENT — innerhalb der Card unter dem Video
         ═══════════════════════════════════════════════════════ */
      .experience-card-content {
        flex: 1 1 50%;
        padding: 40px 44px;
        display: flex;
        flex-direction: column;
        justify-content: center;
        gap: 22px;
      }

      .experience-card-headline {
        font-family: var(--font-display);
        font-style: italic;
        font-weight: 500;
        font-size: clamp(28px, 2.6vw, 34px);
        line-height: 1.1;
        color: var(--color-gold-light);
        letter-spacing: -0.012em;
        margin: 0;
        padding-bottom: 18px;
        border-bottom: 1px solid rgba(201, 168, 76, 0.14);
      }

      .experience-card-body {
        display: flex;
        flex-direction: column;
        gap: 12px;
      }
      .experience-card-tagline {
        font-family: var(--font-display);
        font-style: italic;
        font-weight: 400;
        font-size: 17px;
        line-height: 1.5;
        color: var(--color-text);
        letter-spacing: 0.005em;
        margin: 0;
      }
      .experience-card-desc {
        font-family: var(--font-body);
        font-size: 13.5px;
        line-height: 1.65;
        color: var(--color-text-muted);
        letter-spacing: 0.005em;
        margin: 0;
      }

      /* ═══════════════════════════════════════════════════════
         MOBILE
         ═══════════════════════════════════════════════════════ */
      /* Tablet/Mobile — Karten stapeln: Video oben, Text darunter (alle gleich,
         Zickzack-Spiegelung wird aufgehoben) */
      @media (max-width: 900px) {
        .experiences-grid { max-width: 560px; gap: 28px; }
        .experience-card,
        .experience-card[data-i="1"] {
          flex-direction: column;
          align-items: stretch;
        }
        .experience-card-video {
          flex: none;
          width: 100%;
          max-width: 100%;
          border-bottom: 1px solid rgba(201, 168, 76, 0.18);
        }
        .experience-card-content {
          justify-content: flex-start;
          padding: 28px 32px 32px;
        }
      }
      @media (max-width: 768px) {
        .experiences-wrap { padding: 0 20px; }
        .experiences-header { margin-bottom: 48px; }
        .experience-card-content { padding: 24px 24px 28px; gap: 20px; }
        .experience-card-headline { font-size: 26px; padding-bottom: 14px; }
      }

      @media (prefers-reduced-motion: reduce) {
        .experiences-header,
        .experience-card {
          opacity: 1;
          transform: none;
          transition: none;
        }
      }
    `;
    document.head.appendChild(style);
  }
}
