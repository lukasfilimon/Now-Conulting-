import { copy } from '../content/copy';
import { faq } from '../content/faq';

/**
 * FAQ section — Akkordeon-Pattern für Einwand-Behandlung.
 *
 * Visuell 1:1 vom Masterclass-LP Stil übernommen.
 * Erste Frage standardmäßig offen, Single-Open-Behavior:
 * wenn ein Item öffnet, schließen alle anderen.
 *
 * Animation: Grid-Template-Rows 0fr → 1fr → smooth height transition.
 * Wurde bewusst NICHT mit nativem <details> gemacht, weil Browser den Inhalt
 * dort via display:none ausblendet → keine Höhen-Animation möglich. Stattdessen
 * <button>+<div> mit aria-expanded für Accessibility.
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
            <div class="faq-item${i === 0 ? ' open' : ''}" data-i="${i}">
              <button class="faq-q" type="button" aria-expanded="${i === 0 ? 'true' : 'false'}" aria-controls="faq-a-${i}">
                <span class="faq-q-text">${this.escape(item.question)}</span>
                <span class="faq-q-icon" aria-hidden="true">+</span>
              </button>
              <div class="faq-a" id="faq-a-${i}" role="region">
                <div class="faq-a-inner">
                  <p>${this.escape(item.answer)}</p>
                </div>
              </div>
            </div>
          `,
            )
            .join('')}
        </div>
      </div>
    `;
    this.root = container.querySelector('.faq-wrap') as HTMLElement;
    this.injectStyles();
    this.observe();
    this.bindAccordion();
  }

  /**
   * Single-Open Accordion. Click auf Frage:
   *  - wenn dieses Item bereits offen → schließe es
   *  - wenn nicht → schließe alle anderen, öffne dieses
   * Setzt sowohl die .open-Klasse (für CSS-Animation) als auch
   * aria-expanded auf dem Button (für Accessibility).
   */
  private bindAccordion(): void {
    const items = this.root.querySelectorAll<HTMLElement>('.faq-item');
    items.forEach((item) => {
      const btn = item.querySelector<HTMLButtonElement>('.faq-q');
      if (!btn) return;
      btn.addEventListener('click', () => {
        const wasOpen = item.classList.contains('open');
        // Alle schließen
        items.forEach((other) => {
          other.classList.remove('open');
          other.querySelector('.faq-q')?.setAttribute('aria-expanded', 'false');
        });
        // Wenn das geklickte vorher nicht offen war → jetzt öffnen
        if (!wasOpen) {
          item.classList.add('open');
          btn.setAttribute('aria-expanded', 'true');
        }
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
      /* ═══════════════════════════════════════════════════════
         TOP-GRENZE — Gold-Hairline mit Glow zwischen Final-CTA und FAQ
         Identisch zu den Hairlines auf Final-CTA und Footer.
         ═══════════════════════════════════════════════════════ */
      section[data-section="faq"]::after {
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
        z-index: 4;
        pointer-events: none;
      }

      /* ═══════════════════════════════════════════════════════
         WRAPPER & HEADER — Masterclass-Pattern
         ═══════════════════════════════════════════════════════ */
      .faq-wrap {
        max-width: 720px;
        margin: 0 auto;
        padding: 0 32px;
      }
      .faq-header {
        text-align: center;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 16px;
        margin-bottom: 64px;
        opacity: 0;
        transform: translateY(20px);
        transition: opacity 900ms ease-out, transform 900ms ease-out;
      }
      .faq-wrap.reveal .faq-header {
        opacity: 1;
        transform: translateY(0);
      }
      .faq-eyebrow {
        font-family: var(--font-body);
        font-size: 0.75rem;
        font-weight: 600;
        letter-spacing: 0.2em;
        color: var(--color-gold);
        text-transform: uppercase;
      }
      .faq-headline {
        font-family: var(--font-display);
        font-weight: 600;
        font-size: clamp(2rem, 4vw, 3rem);
        line-height: 1.2;
        margin: 0;
        color: var(--color-text);
        text-wrap: balance;
      }
      .faq-headline em {
        font-style: italic;
        color: var(--color-gold);
        font-weight: 600;
      }

      /* ═══════════════════════════════════════════════════════
         FAQ-LIST — schlanke Linien, kein box, kein Hintergrund
         ═══════════════════════════════════════════════════════ */
      .faq-list {
        display: flex;
        flex-direction: column;
      }
      .faq-item {
        border-bottom: 1px solid rgba(201, 168, 76, 0.18);
        opacity: 0;
        transform: translateY(16px);
        transition: opacity 900ms ease, transform 900ms ease;
      }
      .faq-item:first-child {
        border-top: 1px solid rgba(201, 168, 76, 0.18);
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

      /* Frage — als <button>, full width, kein default browser styling */
      .faq-q {
        width: 100%;
        cursor: pointer;
        padding: 24px 0;
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 24px;
        font-family: var(--font-body);
        font-size: 1rem;
        font-weight: 500;
        line-height: 1.5;
        color: var(--color-text);
        text-align: left;
        background: none;
        border: none;
        transition: color 300ms ease;
        min-height: 48px;
      }
      .faq-q:hover {
        color: var(--color-gold);
      }
      .faq-q-text {
        flex: 1;
      }
      /* Icon — schlichtes "+" rotiert auf "×" wenn offen */
      .faq-q-icon {
        flex-shrink: 0;
        width: 24px;
        height: 24px;
        font-family: var(--font-body);
        font-size: 1.4rem;
        font-weight: 400;
        line-height: 1;
        color: var(--color-gold);
        display: flex;
        align-items: center;
        justify-content: center;
        transition: transform 400ms cubic-bezier(0.16, 1, 0.3, 1);
      }
      .faq-item.open .faq-q-icon {
        transform: rotate(45deg);
      }

      /* ═══════════════════════════════════════════════════════
         ANTWORT — Smooth Höhen-Animation via Grid-Trick
         ═══════════════════════════════════════════════════════
         Moderne CSS-Technik: grid-template-rows 0fr ↔ 1fr lässt
         sich smooth animieren. Das innere .faq-a-inner hat overflow:
         hidden + min-height: 0 damit der Content sauber clipped wird
         während die Animation läuft. */
      .faq-a {
        display: grid;
        grid-template-rows: 0fr;
        transition: grid-template-rows 450ms cubic-bezier(0.16, 1, 0.3, 1);
      }
      .faq-item.open .faq-a {
        grid-template-rows: 1fr;
      }
      .faq-a-inner {
        overflow: hidden;
        min-height: 0;
      }
      .faq-a-inner p {
        font-family: var(--font-body);
        font-size: 0.95rem;
        font-weight: 400;
        line-height: 1.75;
        color: var(--color-text-muted);
        margin: 0;
        padding-bottom: 24px;
        /* Sanfter Inhalts-Fade — kommt verzögert hinter der Höhe */
        opacity: 0;
        transform: translateY(-4px);
        transition: opacity 350ms ease 100ms, transform 350ms ease 100ms;
      }
      .faq-item.open .faq-a-inner p {
        opacity: 1;
        transform: translateY(0);
      }

      @media (max-width: 768px) {
        .faq-wrap { padding: 0 24px; }
        .faq-header { margin-bottom: 44px; }
        .faq-q { padding: 22px 0; font-size: 0.95rem; gap: 20px; }
        .faq-a-inner p { font-size: 0.9rem; padding-bottom: 22px; }
      }

      @media (prefers-reduced-motion: reduce) {
        .faq-header,
        .faq-item,
        .faq-a,
        .faq-a-inner p {
          transition: none;
        }
        .faq-header,
        .faq-item {
          opacity: 1;
          transform: none;
        }
      }
    `;
    document.head.appendChild(style);
  }
}
