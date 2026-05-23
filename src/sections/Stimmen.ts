import { copy, cta } from '../content/copy';
import {
  testimonialsRowOne,
  testimonialsRowTwo,
  vimeoEmbedUrl,
  type Testimonial,
} from '../content/stimmen';

/**
 * Stimmen / Ergebnisse Section — Video-Testimonial-Wall mit 2-Reihen-Marquee.
 *
 * Layout:
 * - Header (Eyebrow "ERGEBNISSE" + Headline mit Italic-Akzent)
 * - Reihe 1: scrollt nach links (Videos kommen von rechts rein)
 * - Reihe 2: scrollt nach rechts (Videos kommen von links rein)
 * - 3 Karten gleichzeitig sichtbar, plus Peek der 4. an der Fade-Edge
 *
 * Pro Karte: 16:9 Vimeo-Video + Name (gold uppercase) + Role (text-dim) zentriert.
 * Keine CTAs.
 *
 * Pause-on-hover: hover auf Karte stoppt die Reihe damit User das Video abspielen kann.
 * Globale Video-Koordination: nur ein Vimeo-Player läuft gleichzeitig (VideoCoordinator).
 */
export class Stimmen {
  readonly root: HTMLElement;
  private revealed = false;

  constructor(container: HTMLElement) {
    const { stimmen } = copy;
    container.innerHTML = `
      <div class="stimmen-wrap">
        <div class="stimmen-header">
          <span class="stimmen-eyebrow">${this.escape(stimmen.eyebrow)}</span>
          <h2 class="stimmen-headline">
            ${this.escape(stimmen.headline.plain)}
            <em>${this.escape(stimmen.headline.italic)}</em>
          </h2>
        </div>

        <div class="stimmen-marquee" data-direction="ltr">
          <div class="stimmen-marquee-track stimmen-marquee-track--ltr">
            ${this.renderRow(testimonialsRowOne)}
            ${this.renderRow(testimonialsRowOne)}
          </div>
        </div>

        <div class="stimmen-marquee" data-direction="rtl">
          <div class="stimmen-marquee-track stimmen-marquee-track--rtl">
            ${this.renderRow(testimonialsRowTwo)}
            ${this.renderRow(testimonialsRowTwo)}
          </div>
        </div>

        <div class="section-cta-wrap">
          <a class="section-cta" href="${cta.primaryHref}"${cta.isCalendly ? ' target="_blank" rel="noopener"' : ''}>
            <span>${this.escape(cta.primaryLabel)}</span>
            <span class="section-cta-arrow">→</span>
          </a>
        </div>
      </div>
    `;
    this.root = container.querySelector('.stimmen-wrap') as HTMLElement;
    this.injectStyles();
    this.observe();
  }

  private renderRow(items: Testimonial[]): string {
    return items
      .map(
        (t) => `
      <article class="stimme-card" data-id="${this.escape(t.id)}">
        <div class="stimme-card-video">
          <iframe
            src="${this.escape(vimeoEmbedUrl(t.videoId))}"
            frameborder="0"
            allow="autoplay; fullscreen; picture-in-picture; clipboard-write; encrypted-media"
            allowfullscreen
            title="${this.escape(t.name)}"
            loading="lazy"
          ></iframe>
        </div>
        <p class="stimme-card-name">${this.escape(t.name)}</p>
        <p class="stimme-card-role">${this.escape(t.role)}</p>
      </article>
    `,
      )
      .join('');
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
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  private injectStyles(): void {
    if (document.getElementById('stimmen-styles')) return;
    const style = document.createElement('style');
    style.id = 'stimmen-styles';
    style.textContent = `
      /* ═══════════════════════════════════════════════════════
         WRAPPER & HEADER
         ═══════════════════════════════════════════════════════ */
      .stimmen-wrap {
        width: 100%;
        margin: 0 auto;
        position: relative;
        z-index: 2;
      }
      .stimmen-header {
        text-align: center;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 18px;
        margin: 0 auto 64px;
        max-width: 760px;
        padding: 0 32px;
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
        font-size: clamp(2rem, 3.4vw, 3rem);
        line-height: 1.2;
        margin: 0;
        color: var(--color-text);
        text-wrap: balance;
        letter-spacing: -0.01em;
      }
      .stimmen-headline em {
        font-style: italic;
        color: var(--color-gold-light);
        font-weight: 500;
        margin-left: 8px;
      }

      /* ═══════════════════════════════════════════════════════
         MARQUEE — 2 Reihen in entgegengesetzte Richtungen
         ═══════════════════════════════════════════════════════ */
      .stimmen-marquee {
        width: 100%;
        overflow: hidden;
        position: relative;
        -webkit-mask-image: linear-gradient(to right, transparent 0%, black 4%, black 96%, transparent 100%);
        mask-image: linear-gradient(to right, transparent 0%, black 4%, black 96%, transparent 100%);
        opacity: 0;
        transition: opacity 1200ms cubic-bezier(0.16, 1, 0.3, 1);
      }
      .stimmen-wrap.reveal .stimmen-marquee {
        opacity: 1;
      }
      .stimmen-wrap.reveal .stimmen-marquee[data-direction="ltr"] {
        transition-delay: 300ms;
      }
      .stimmen-wrap.reveal .stimmen-marquee[data-direction="rtl"] {
        transition-delay: 500ms;
      }
      .stimmen-marquee + .stimmen-marquee {
        margin-top: 28px;
      }

      .stimmen-marquee-track {
        display: flex;
        width: max-content;
        will-change: transform;
      }
      .stimmen-marquee-track--ltr {
        animation: stimmen-marquee-ltr 80s linear infinite;
      }
      .stimmen-marquee-track--rtl {
        animation: stimmen-marquee-rtl 80s linear infinite;
      }

      /* Pause-on-Hover NUR auf Geräten mit echtem Hover (Maus/Trackpad).
         Auf Touch-Geräten ist :hover "sticky" — tippt der User ein Video an
         (um es abzuspielen), bleibt die Karte im Hover-Zustand und die
         Marquee friert ein, läuft nie mehr von selbst weiter. Mit
         @media (hover: hover) sieht Mobile diese Regel gar nicht — die
         Marquee läuft konstant durch, auch nach einem Video-Tap. */
      @media (hover: hover) {
        .stimmen-marquee:hover .stimmen-marquee-track {
          animation-play-state: paused;
        }
      }

      @keyframes stimmen-marquee-ltr {
        from { transform: translateX(0); }
        to   { transform: translateX(-50%); }
      }
      @keyframes stimmen-marquee-rtl {
        from { transform: translateX(-50%); }
        to   { transform: translateX(0); }
      }

      /* ═══════════════════════════════════════════════════════
         CARD — Premium Glass mit Video oben
         ═══════════════════════════════════════════════════════ */
      .stimme-card {
        flex-shrink: 0;
        width: 420px;
        margin-right: 28px;
        display: flex;
        flex-direction: column;
        overflow: hidden;

        background:
          linear-gradient(165deg,
            rgba(34, 30, 20, 0.92) 0%,
            rgba(20, 17, 11, 0.88) 50%,
            rgba(12, 10, 7, 0.82) 100%);
        border: 1px solid rgba(201, 168, 76, 0.16);
        border-radius: 4px;
        /* Kein backdrop-filter — bei 16 sichtbaren Karten + Marquee-Animation
           wäre Blur ein GPU-Killer. Erhöhte Background-Opacity kompensiert. */
        box-shadow:
          0 1px 0 0 rgba(255, 240, 200, 0.07) inset,
          0 -1px 0 0 rgba(0, 0, 0, 0.4) inset,
          0 24px 48px -24px rgba(0, 0, 0, 0.65),
          0 0 0 1px rgba(201, 168, 76, 0.04);
        transition: border-color 400ms ease, box-shadow 400ms ease;
      }
      .stimme-card:hover {
        border-color: rgba(201, 168, 76, 0.4);
        box-shadow:
          0 1px 0 0 rgba(255, 240, 200, 0.12) inset,
          0 -1px 0 0 rgba(0, 0, 0, 0.3) inset,
          0 32px 64px -20px rgba(0, 0, 0, 0.75),
          0 0 0 1px rgba(201, 168, 76, 0.12),
          0 0 32px -10px rgba(201, 168, 76, 0.25);
      }

      .stimme-card-video {
        position: relative;
        width: 100%;
        aspect-ratio: 16 / 9;
        background: #000;
        border-bottom: 1px solid rgba(201, 168, 76, 0.18);
        overflow: hidden;
      }
      .stimme-card-video iframe {
        position: absolute;
        inset: 0;
        width: 100%;
        height: 100%;
        border: 0;
        display: block;
      }

      .stimme-card-name {
        padding: 14px 16px 4px;
        font-family: var(--font-body);
        font-size: 13px;
        font-weight: 600;
        letter-spacing: 0.08em;
        text-transform: uppercase;
        color: var(--color-gold);
        text-align: center;
        margin: 0;
      }
      .stimme-card-role {
        padding: 0 16px 16px;
        font-family: var(--font-body);
        font-size: 11px;
        font-weight: 300;
        letter-spacing: 0.04em;
        color: var(--color-text-dim);
        text-align: center;
        margin: 0;
      }

      /* ═══════════════════════════════════════════════════════
         MOBILE
         ═══════════════════════════════════════════════════════ */
      @media (max-width: 768px) {
        .stimmen-header { margin-bottom: 44px; padding: 0 20px; }
        .stimme-card {
          width: 320px;
          margin-right: 20px;
        }
        .stimmen-marquee-track--ltr,
        .stimmen-marquee-track--rtl {
          animation-duration: 60s;
        }
        .stimmen-marquee + .stimmen-marquee {
          margin-top: 20px;
        }
      }

      @media (prefers-reduced-motion: reduce) {
        .stimmen-marquee-track--ltr,
        .stimmen-marquee-track--rtl {
          animation: none;
        }
        .stimmen-marquee {
          overflow-x: auto;
          -webkit-mask-image: none;
          mask-image: none;
          opacity: 1;
        }
        .stimmen-header {
          opacity: 1;
          transform: none;
        }
      }
    `;
    document.head.appendChild(style);
  }
}
