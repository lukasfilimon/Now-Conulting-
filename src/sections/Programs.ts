import { cta } from '../content/copy';
import { programs } from '../content/programs';

/**
 * Programs section — 2 Karten (Aufbau-Phase + Skalierung-Phase).
 * Job: Beide Avatare emotional abholen — keine Selbst-Diagnose, keine Entscheidung.
 * Die Entscheidung trifft NOW im Erstgespräch.
 *
 * Layout:
 * - Header (Eyebrow PROGRAMME + Headline "Wir holen dich da ab, wo du gerade stehst.")
 * - 2 Karten Premium-Glass mit Phase-Headline + Umsatz-Meta + Tagline + Description + Inclusions + CTA
 * - Footer-Text "Beide Wege haben dasselbe Fundament. Nur der Hebel ist ein anderer."
 *
 * KEINE Preise (Premium-Strategie), KEINE Programmnamen (Identifikation über Themen).
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
            Wir holen dich dort ab, <em>wo du gerade stehst.</em>
          </h2>
        </div>

        <div class="programs-grid">
          ${programs
            .map(
              (p) => `
            <article class="program-card" data-id="${this.escape(p.id)}">
              <div class="program-phase">
                <h3 class="program-phase-headline">${this.escape(p.phaseHeadline)}</h3>
                <div class="program-phase-meta">
                  <span class="program-phase-revenue">${this.escape(p.startsAt)}</span><span class="program-phase-arrow">→</span><span class="program-phase-revenue">${this.escape(p.targetRevenue)}</span> Monatsumsatz <span class="program-phase-sep">·</span> ${this.escape(p.timeframe)}
                </div>
              </div>

              <div class="program-body">
                <p class="program-tagline">${this.escape(p.tagline)}</p>
                <p class="program-desc">${this.escape(p.description)}</p>
              </div>

              <ul class="program-inclusions">
                ${p.inclusions
                  .map(
                    (inc) => `
                  <li class="program-inclusion">
                    <span class="program-inclusion-title">${this.escape(inc.title)}</span>
                    <span class="program-inclusion-desc">${this.escape(inc.description)}</span>
                  </li>
                `,
                  )
                  .join('')}
              </ul>
            </article>
          `,
            )
            .join('')}
        </div>

        <div class="programs-cta-center">
          <a class="program-cta" href="${cta.primaryHref}"${cta.isCalendly ? ' target="_blank" rel="noopener"' : ''}>
            <span>${this.escape(cta.primaryLabel)}</span>
            <span class="program-cta-arrow">→</span>
          </a>
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
      /* ═══════════════════════════════════════════════════════
         WRAPPER & HEADER
         ═══════════════════════════════════════════════════════ */
      .programs-wrap {
        max-width: 1240px;
        margin: 0 auto;
        padding: 0 32px;
        position: relative;
        z-index: 2;
      }
      .programs-header {
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
        font-size: clamp(2rem, 3.4vw, 3rem);
        line-height: 1.2;
        margin: 0;
        color: var(--color-text);
        text-wrap: balance;
        letter-spacing: -0.01em;
      }
      .programs-headline em {
        font-style: italic;
        color: var(--color-gold-light);
        font-weight: 500;
        margin-left: 8px;
      }

      /* ═══════════════════════════════════════════════════════
         GRID — 2 Karten side-by-side
         ═══════════════════════════════════════════════════════ */
      .programs-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 32px;
      }

      /* ═══════════════════════════════════════════════════════
         CARD — Premium Glass (kongruent zu Approach-Section)
         ═══════════════════════════════════════════════════════ */
      .program-card {
        position: relative;
        padding: 36px 36px 32px;
        display: flex;
        flex-direction: column;
        gap: 24px;

        background:
          linear-gradient(165deg,
            rgba(34, 30, 20, 0.78) 0%,
            rgba(20, 17, 11, 0.68) 50%,
            rgba(12, 10, 7, 0.58) 100%);

        border: 1px solid rgba(201, 168, 76, 0.16);
        border-radius: 4px;

        backdrop-filter: blur(18px) saturate(135%);
        -webkit-backdrop-filter: blur(18px) saturate(135%);

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
      .program-card::before {
        content: '';
        position: absolute;
        inset: 0;
        background:
          radial-gradient(
            ellipse 80% 50% at 50% 0%,
            rgba(226, 201, 122, 0.09) 0%,
            transparent 65%
          );
        border-radius: inherit;
        pointer-events: none;
        opacity: 0.85;
        transition: opacity 600ms ease;
      }
      .program-card > * {
        position: relative;
        z-index: 1;
      }
      .programs-wrap.reveal .program-card:nth-child(1) {
        transition-delay: 200ms;
        opacity: 1;
        transform: translateY(0);
      }
      .programs-wrap.reveal .program-card:nth-child(2) {
        transition-delay: 400ms;
        opacity: 1;
        transform: translateY(0);
      }
      .program-card:hover {
        border-color: rgba(201, 168, 76, 0.4);
        box-shadow:
          0 1px 0 0 rgba(255, 240, 200, 0.12) inset,
          0 -1px 0 0 rgba(0, 0, 0, 0.3) inset,
          0 44px 88px -24px rgba(0, 0, 0, 0.85),
          0 0 0 1px rgba(201, 168, 76, 0.12),
          0 0 40px -10px rgba(201, 168, 76, 0.3);
      }
      .program-card:hover::before { opacity: 1; }

      /* ═══════════════════════════════════════════════════════
         PHASE BLOCK — Headline + Umsatz-Meta
         ═══════════════════════════════════════════════════════ */
      .program-phase {
        display: flex;
        flex-direction: column;
        gap: 10px;
        padding-bottom: 22px;
        border-bottom: 1px solid rgba(201, 168, 76, 0.14);
      }
      .program-phase-headline {
        font-family: var(--font-display);
        font-style: italic;
        font-weight: 500;
        font-size: clamp(30px, 3vw, 38px);
        line-height: 1.1;
        color: var(--color-gold-light);
        letter-spacing: -0.012em;
        margin: 0;
      }
      .program-phase-meta {
        font-family: var(--font-mono);
        font-size: 11px;
        font-weight: 600;
        letter-spacing: 0.18em;
        text-transform: uppercase;
        color: var(--color-text-muted);
        line-height: 1.6;
      }
      .program-phase-revenue {
        color: var(--color-gold-light);
      }
      .program-phase-arrow {
        color: var(--color-gold);
        opacity: 0.65;
        margin: 0 6px;
        font-weight: 400;
      }
      .program-phase-sep {
        color: var(--color-text-dim);
        opacity: 0.6;
        margin: 0 6px;
      }

      /* ═══════════════════════════════════════════════════════
         BODY — Tagline + Description
         ═══════════════════════════════════════════════════════ */
      .program-body {
        display: flex;
        flex-direction: column;
        gap: 14px;
      }
      .program-tagline {
        font-family: var(--font-display);
        font-style: italic;
        font-weight: 400;
        font-size: 17px;
        line-height: 1.5;
        color: var(--color-text);
        letter-spacing: 0.005em;
        margin: 0;
      }
      .program-desc {
        font-family: var(--font-body);
        font-size: 14px;
        line-height: 1.65;
        color: var(--color-text-muted);
        letter-spacing: 0.005em;
        margin: 0;
      }

      /* ═══════════════════════════════════════════════════════
         INCLUSIONS — 5 Module mit Title + Description
         ═══════════════════════════════════════════════════════ */
      .program-inclusions {
        list-style: none;
        display: flex;
        flex-direction: column;
        gap: 18px;
        padding: 0;
        margin: 4px 0 0;
      }
      .program-inclusion {
        position: relative;
        padding-left: 22px;
        display: flex;
        flex-direction: column;
        gap: 4px;
      }
      .program-inclusion::before {
        content: '◆';
        position: absolute;
        left: 0;
        top: 4px;
        color: var(--color-gold);
        font-size: 9px;
        line-height: 1;
      }
      .program-inclusion-title {
        font-family: var(--font-body);
        font-size: 13px;
        font-weight: 600;
        color: var(--color-text);
        letter-spacing: 0.005em;
      }
      .program-inclusion-desc {
        font-family: var(--font-body);
        font-size: 13px;
        font-weight: 400;
        line-height: 1.55;
        color: var(--color-text-muted);
        letter-spacing: 0.005em;
      }

      /* ═══════════════════════════════════════════════════════
         CTA — Solid Gold wie Hero-Button, mittig zentriert
         ═══════════════════════════════════════════════════════ */
      .program-cta {
        display: inline-flex;
        align-items: center;
        gap: 14px;
        padding: 18px 44px;
        border: none;
        border-radius: 4px;
        background: linear-gradient(135deg, var(--color-gold), var(--color-gold-dark));
        color: var(--color-black);
        font-family: var(--font-body);
        font-size: 15px;
        font-weight: 500;
        letter-spacing: 0.04em;
        text-decoration: none;
        cursor: pointer;
        box-shadow:
          0 0 18px rgba(201, 168, 76, 0.28),
          0 4px 16px rgba(201, 168, 76, 0.18);
        transition:
          background 400ms cubic-bezier(0.16, 1, 0.3, 1),
          box-shadow 400ms cubic-bezier(0.16, 1, 0.3, 1);
      }
      .program-cta:hover {
        background: linear-gradient(135deg, var(--color-gold-light), var(--color-gold));
        box-shadow:
          0 0 36px rgba(201, 168, 76, 0.55),
          0 8px 32px rgba(201, 168, 76, 0.35);
      }
      .program-cta-arrow {
        font-weight: 600;
      }

      /* ═══════════════════════════════════════════════════════
         ZENTRALER CTA — ein Button mittig unter beiden Programmen
         ═══════════════════════════════════════════════════════ */
      .programs-cta-center {
        display: flex;
        justify-content: center;
        margin-top: 56px;
        opacity: 0;
        transform: translateY(16px);
        transition: opacity 900ms ease-out, transform 900ms ease-out;
        transition-delay: 600ms;
      }
      .programs-wrap.reveal .programs-cta-center {
        opacity: 1;
        transform: translateY(0);
      }

      /* ═══════════════════════════════════════════════════════
         MOBILE
         ═══════════════════════════════════════════════════════ */
      @media (max-width: 900px) {
        .programs-wrap { padding: 0 20px; }
        .programs-header { margin-bottom: 48px; }
        .programs-grid {
          grid-template-columns: 1fr;
          gap: 24px;
        }
        .program-card { padding: 28px 26px 26px; gap: 22px; }
        .program-phase-headline { font-size: 26px; }
        .programs-cta-center { margin-top: 44px; }
      }

      @media (prefers-reduced-motion: reduce) {
        .programs-header,
        .program-card,
        .programs-cta-center {
          opacity: 1;
          transform: none;
          transition: none;
        }
      }
    `;
    document.head.appendChild(style);
  }
}
