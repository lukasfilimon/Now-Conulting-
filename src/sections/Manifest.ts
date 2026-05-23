import { copy } from '../content/copy';

/**
 * Manifest section — Darko's personal Manifesto.
 * Layout: 2-Spalten — Darko-Porträt links, Manifest-Text rechts.
 *  - Links: Bild (transparent SVG, freigestellter Darko)
 *  - Rechts: Headline → Body-Paragraphs → Signature
 * Reveal-Choreografie: Bild fadet zuerst rein, dann Spotlight wandert
 * vertikal über den rechten Content (headline → body → signature).
 *
 * Auf Mobile: vertikal gestapelt — Bild oben, Text darunter.
 *
 * Background: shared post-Hero BackgroundShader (in main.ts) + Spotlight-Gradient.
 */
export class Manifest {
  readonly root: HTMLElement;
  private revealed = false;
  private currentLit: HTMLElement | null = null;

  constructor(container: HTMLElement) {
    const paragraphs = copy.manifest.body
      .map((text) => `<p class="manifest-p">${this.escape(text)}</p>`)
      .join('');
    container.innerHTML = `
      <div class="manifest-wrap">
        <div class="manifest-portrait">
          <div class="manifest-portrait-glow" aria-hidden="true"></div>
          <img
            class="manifest-portrait-img"
            src="/images/darko-manifest.jpg"
            alt="Darko Krstic — Gründer NOW Consulting"
            loading="lazy"
            decoding="async"
          />
        </div>
        <div class="manifest-content">
          <h2 class="manifest-headline">${this.escape(copy.manifest.headline)}</h2>
          <div class="manifest-body">${paragraphs}</div>
          <div class="manifest-signature">
            <span class="manifest-sig-line" aria-hidden="true"></span>
            <span class="manifest-sig-name">${this.escape(copy.manifest.signatureName)}</span>
            <span class="manifest-sig-title">${this.escape(copy.manifest.signatureTitle)}</span>
          </div>
        </div>
      </div>
    `;
    this.root = container.querySelector('.manifest-wrap') as HTMLElement;
    this.injectStyles();
    this.observe();
  }

  private escape(text: string): string {
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  private observe(): void {
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting && !this.revealed) {
            this.revealed = true;
            void this.runReveal();
            io.disconnect();
          }
        }
      },
      { threshold: 0.15 },
    );
    io.observe(this.root);
  }

  private async runReveal(): Promise<void> {
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const portrait = this.root.querySelector<HTMLElement>('.manifest-portrait');
    const headline = this.root.querySelector<HTMLElement>('.manifest-headline');
    const body = this.root.querySelector<HTMLElement>('.manifest-body');
    const paragraphs = this.root.querySelectorAll<HTMLElement>('.manifest-p');
    const signature = this.root.querySelector<HTMLElement>('.manifest-signature');

    if (reduceMotion) {
      portrait?.classList.add('reveal');
      headline?.classList.add('reveal');
      paragraphs.forEach((p) => p.classList.add('reveal'));
      signature?.classList.add('reveal');
      return;
    }

    // 0. Bild fadet zuerst rein (Gesicht etabliert sich)
    portrait?.classList.add('reveal');
    // Spotlight-Layer einblenden, sobald das Porträt da ist
    this.root.closest('section')?.classList.add('spotlight-on');
    await this.delay(250);

    // 1. Spotlight wandert zur Headline + Headline reveal
    this.moveSpotlightTo(headline);
    await this.delay(150);
    headline?.classList.add('reveal');
    await this.delay(750);

    // 2. Spotlight wandert zum Body, Paragraphs cascaden rein
    this.moveSpotlightTo(body);
    for (const p of Array.from(paragraphs)) {
      p.classList.add('reveal');
      await this.delay(260);
    }
    await this.delay(450);

    // 3. Spotlight settles auf Signature, fade in
    this.moveSpotlightTo(signature);
    await this.delay(200);
    signature?.classList.add('reveal');
  }

  private moveSpotlightTo(el: HTMLElement | null): void {
    if (!el) return;
    const section = el.closest('section');
    if (!section) return;
    const sectionRect = section.getBoundingClientRect();
    const elRect = el.getBoundingClientRect();
    const yPx = elRect.top - sectionRect.top + elRect.height / 2;
    const pct = (yPx / sectionRect.height) * 100;
    (section as HTMLElement).style.setProperty('--spotlight-y', `${pct.toFixed(2)}%`);
    // Text-Backlight: aktuell beleuchtetes Element bekommt dezenten
    // text-shadow, der mit dem Spotlight wandert.
    if (this.currentLit && this.currentLit !== el) {
      this.currentLit.classList.remove('manifest-lit');
    }
    el.classList.add('manifest-lit');
    this.currentLit = el;
  }

  private delay(ms: number): Promise<void> {
    return new Promise((r) => setTimeout(r, ms));
  }

  private injectStyles(): void {
    if (document.getElementById('manifest-styles')) return;
    const style = document.createElement('style');
    style.id = 'manifest-styles';
    style.textContent = `
      /* Manifest wrap — 2-Spalten-Layout: Porträt links, Content rechts */
      .manifest-wrap {
        position: relative;
        z-index: 2;
        max-width: 1180px;
        margin: 0 auto;
        padding: 0 32px;
        display: grid;
        grid-template-columns: 0.85fr 1fr;
        gap: 72px;
        align-items: center;
      }

      /* ═══════════════════════════════════════════════════════
         SPOTLIGHT — sanfter Gold-Schein, der durch JS-gesteuertes
         --spotlight-y vertikal zur jeweils aktuellen Content-Zeile
         wandert (Headline → Body → Signature). Wird ~250 ms nach
         Portrait-Reveal eingeblendet via .spotlight-on.
         ═══════════════════════════════════════════════════════ */
      section[data-section="manifest"] {
        position: relative;
        --spotlight-y: 50%;
      }
      section[data-section="manifest"]::before {
        content: '';
        position: absolute;
        left: 50%;
        top: var(--spotlight-y);
        width: 720px;
        height: 360px;
        margin-left: -360px;
        margin-top: -180px;
        background: radial-gradient(
          ellipse 50% 45% at 50% 50%,
          rgba(201, 168, 76, 0.13) 0%,
          rgba(201, 168, 76, 0.05) 40%,
          transparent 75%
        );
        pointer-events: none;
        z-index: 1;
        opacity: 0;
        transition:
          top 1000ms var(--ease-reveal),
          opacity 800ms ease-out;
      }
      section[data-section="manifest"].spotlight-on::before {
        opacity: 1;
      }

      /* Text-Backlight: das aktuell „beleuchtete" Element bekommt dezenten
         text-shadow synchron mit dem Spotlight. Wandert mit moveSpotlightTo(). */
      .manifest-headline,
      .manifest-body,
      .manifest-signature {
        transition:
          opacity 1000ms var(--ease-reveal),
          transform 1000ms var(--ease-reveal),
          text-shadow 900ms var(--ease-reveal);
      }
      .manifest-lit {
        text-shadow: 0 0 36px rgba(201, 168, 76, 0.22);
      }

      /* ═══════════════════════════════════════════════════════
         PORTRAIT — links, mit subtilem Gold-Glow im Hintergrund
         ═══════════════════════════════════════════════════════ */
      .manifest-portrait {
        position: relative;
        width: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
        opacity: 0;
        transform: translateX(-24px) scale(0.98);
        transition:
          opacity 1200ms var(--ease-reveal),
          transform 1200ms var(--ease-reveal);
      }
      .manifest-portrait.reveal {
        opacity: 1;
        transform: translateX(0) scale(1);
      }
      /* Sanfter Gold-Glow hinter dem Porträt — atmet leicht */
      .manifest-portrait-glow {
        position: absolute;
        inset: -10%;
        background:
          radial-gradient(60% 65% at 50% 55%, rgba(201, 168, 76, 0.16) 0%, transparent 70%);
        filter: blur(28px);
        animation: manifest-portrait-breath 9s ease-in-out infinite alternate;
        pointer-events: none;
        z-index: 0;
      }
      @keyframes manifest-portrait-breath {
        0%   { opacity: 0.82; transform: scale(1); }
        100% { opacity: 1;    transform: scale(1.04); }
      }
      .manifest-portrait-img {
        position: relative;
        z-index: 1;
        width: 100%;
        max-width: 480px;
        height: auto;
        display: block;
        border-radius: 12px;
        filter: drop-shadow(0 30px 60px rgba(0, 0, 0, 0.6));
        /* Sub-Pixel Ken-Burns — gibt dem Porträt leise Bewegung statt
           nach dem Reveal statisch stehen zu bleiben. 18 s Cycle, ~3 %
           Skalierung, sub-pixel Translate. */
        animation: manifest-portrait-drift 18s ease-in-out infinite alternate;
      }
      @keyframes manifest-portrait-drift {
        0%   { transform: scale(1.000) translate(0, 0); }
        100% { transform: scale(1.025) translate(-0.3%, -0.5%); }
      }

      /* ═══════════════════════════════════════════════════════
         CONTENT — rechts: Headline + Body + Signature
         ═══════════════════════════════════════════════════════ */
      .manifest-content {
        display: flex;
        flex-direction: column;
        gap: 36px;
      }

      /* Headline — gold, display italic, prominent */
      .manifest-headline {
        font-family: var(--font-display);
        font-style: italic;
        font-weight: 500;
        font-size: clamp(1.7rem, 3.1vw, 2.6rem);
        line-height: 1.25;
        letter-spacing: -0.015em;
        color: var(--color-gold-light);
        text-wrap: balance;
        margin: 0;
        opacity: 0;
        transform: translateY(14px);
        transition: opacity 1000ms var(--ease-reveal),
                    transform 1000ms var(--ease-reveal);
      }
      .manifest-headline.reveal {
        opacity: 1;
        transform: translateY(0);
      }

      /* Body — readable, 3 paragraphs */
      .manifest-body {
        display: flex;
        flex-direction: column;
        gap: 22px;
      }
      .manifest-p {
        font-family: var(--font-body);
        font-weight: 400;
        font-size: clamp(1.02rem, 1.25vw, 1.18rem);
        line-height: 1.72;
        letter-spacing: 0.005em;
        color: rgba(228, 222, 210, 0.88);
        margin: 0;
        opacity: 0;
        transform: translateY(10px);
        filter: blur(2.5px);
        transition: opacity 850ms var(--ease-reveal),
                    transform 850ms var(--ease-reveal),
                    filter 850ms var(--ease-reveal);
      }
      .manifest-p.reveal {
        opacity: 1;
        transform: translateY(0);
        filter: blur(0);
      }

      /* Signature — name + title, prefixed by a small gold hairline */
      .manifest-signature {
        display: flex;
        flex-direction: column;
        gap: 4px;
        margin-top: 8px;
        opacity: 0;
        transform: translateY(8px);
        transition: opacity 900ms var(--ease-reveal),
                    transform 900ms var(--ease-reveal);
      }
      .manifest-signature.reveal {
        opacity: 1;
        transform: translateY(0);
      }
      .manifest-sig-line {
        display: block;
        width: 56px;
        height: 1px;
        background: linear-gradient(90deg, rgba(201, 168, 76, 0.7), rgba(201, 168, 76, 0));
        margin-bottom: 14px;
        /* Zeichnet sich von links nach rechts beim Signature-Reveal. */
        transform: scaleX(0);
        transform-origin: left center;
        transition: transform 700ms var(--ease-reveal) 150ms;
      }
      .manifest-signature.reveal .manifest-sig-line {
        transform: scaleX(1);
      }
      .manifest-sig-name {
        font-family: var(--font-display);
        font-style: italic;
        font-weight: 500;
        font-size: 1.05rem;
        letter-spacing: 0.005em;
        color: var(--color-gold-light);
      }
      .manifest-sig-title {
        font-family: var(--font-body);
        font-size: 0.82rem;
        font-weight: 400;
        letter-spacing: 0.06em;
        text-transform: uppercase;
        color: rgba(195, 190, 180, 0.6);
      }

      /* ═══════════════════════════════════════════════════════
         RESPONSIVE
         ═══════════════════════════════════════════════════════ */
      @media (max-width: 960px) {
        .manifest-wrap {
          grid-template-columns: 1fr;
          gap: 48px;
          max-width: 640px;
        }
        .manifest-portrait-img {
          max-width: 360px;
        }
      }
      @media (max-width: 768px) {
        .manifest-wrap { padding: 0 24px; gap: 36px; }
        .manifest-content { gap: 28px; }
        .manifest-headline { font-size: 1.5rem; }
        .manifest-body { gap: 18px; }
        .manifest-p { font-size: 1rem; line-height: 1.65; }
        .manifest-sig-line { width: 44px; }
        .manifest-portrait-img { max-width: 280px; }
      }
      @media (prefers-reduced-motion: reduce) {
        .manifest-portrait,
        .manifest-headline,
        .manifest-p,
        .manifest-signature {
          opacity: 1;
          transform: none;
          filter: none;
          transition: none;
        }
        .manifest-lit { text-shadow: none; }
        .manifest-portrait-glow,
        .manifest-portrait-img {
          animation: none;
        }
        .manifest-sig-line {
          transform: scaleX(1);
          transition: none;
        }
        section[data-section="manifest"]::before {
          opacity: 0 !important;
          transition: none;
        }
      }
    `;
    document.head.appendChild(style);
  }
}
