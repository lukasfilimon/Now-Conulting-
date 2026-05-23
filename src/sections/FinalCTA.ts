import { copy, cta } from '../content/copy';

/**
 * Final CTA section — Vollbild, ein großer Button.
 *
 * Visuals: 1:1 vom Masterclass-LP Hero-Hintergrund:
 *  - Matrix-Rain Canvas (japanische Katakana + Zahlen + Latin, gold gefärbt)
 *  - Mehrere radial-gradient Overlays für Gold-Glow-Mass
 *  - Animierter Shimmer-Layer (8s ease-in-out infinite alternate)
 *
 * Plus: Top-Grenze (schmale Gold-Hairline mit Glow) zwischen FAQ und dieser Section.
 *
 * Performance: Matrix-Animation startet/stoppt via IntersectionObserver —
 * läuft nur wenn Section im Viewport ist.
 *
 * Reduced-Motion: Matrix bleibt aus, Shimmer-Animation deaktiviert.
 */
export class FinalCTA {
  readonly root: HTMLElement;
  private revealed = false;
  private matrixIntervalId: number | null = null;
  private matrixResizeHandler: (() => void) | null = null;
  private matrixObserver: IntersectionObserver | null = null;

  constructor(container: HTMLElement) {
    const { finalCta } = copy;
    container.innerHTML = `
      <div class="final-cta-wrap">
        <canvas class="final-cta-matrix" aria-hidden="true"></canvas>
        <div class="final-cta-overlay" aria-hidden="true"></div>
        <div class="final-cta-glow"></div>
        <div class="final-cta-inner">
          <span class="final-cta-eyebrow">${this.escape(finalCta.eyebrow)}</span>
          <h2 class="final-cta-headline">
            ${this.escape(finalCta.headline.plain)}
            <br>
            <em>${this.escape(finalCta.headline.italic)}</em>
          </h2>
          <p class="final-cta-sub">${this.escape(finalCta.sub)}</p>
          <a class="final-cta-btn" href="${cta.primaryHref}"${cta.isCalendly ? ' target="_blank" rel="noopener"' : ''}>
            <span class="final-cta-btn-label">${this.escape(finalCta.button)}</span>
            <span class="final-cta-btn-arrow">→</span>
          </a>
          <p class="final-cta-trust">${this.escape(finalCta.trust)}</p>
        </div>
      </div>
    `;
    this.root = container.querySelector('.final-cta-wrap') as HTMLElement;
    this.injectStyles();
    this.observe();
    this.setupMatrixRain();
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

  /**
   * Matrix-Rain — Canvas-basiert, 1:1 vom Masterclass-LP Pattern.
   * Japanische Katakana + Zahlen + ASCII, 14px Monospace,
   * goldgefärbt (heller oben, dunkler unten). 42ms interval (~24 FPS).
   * IntersectionObserver pausiert wenn Section nicht sichtbar.
   */
  private setupMatrixRain(): void {
    const canvas = this.root.querySelector<HTMLCanvasElement>('.final-cta-matrix');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Reduced-motion: Matrix bleibt aus
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduceMotion) return;

    const chars =
      'アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const charArr = chars.split('');
    const fontSize = 14;
    let columns = 0;
    let drops: number[] = [];
    // Logical (CSS-pixel) dimensions — entkoppelt von canvas.width/height
    // die jetzt physische Pixel sind (× DPR). draw() rechnet in logical pixels
    // und ctx.scale(dpr, dpr) macht die Skalierung beim Zeichnen.
    let logicalWidth = 0;
    let logicalHeight = 0;

    const resize = () => {
      // DPR-aware sizing für scharfe Zeichen auf Retina-Displays:
      // Canvas-Buffer hat physische Pixel (rect × dpr), CSS-Größe bleibt logisch,
      // ctx.scale(dpr, dpr) macht alle drawing-calls in logischen Pixeln.
      const dpr = window.devicePixelRatio || 1;
      const rect = canvas.getBoundingClientRect();
      logicalWidth = rect.width;
      logicalHeight = rect.height;
      canvas.width = Math.round(logicalWidth * dpr);
      canvas.height = Math.round(logicalHeight * dpr);
      canvas.style.width = `${logicalWidth}px`;
      canvas.style.height = `${logicalHeight}px`;
      // setTransform statt scale damit wiederholte resizes nicht akkumulieren
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      columns = Math.floor(logicalWidth / fontSize);
      const rows = Math.floor(logicalHeight / fontSize);
      drops = Array.from({ length: columns }, () => Math.floor(Math.random() * rows));
    };
    resize();
    this.matrixResizeHandler = resize;
    window.addEventListener('resize', resize, { passive: true });

    const draw = () => {
      // Trail-Fade: dunkelt vorhandenen Inhalt subtil ab → "schweif"
      ctx.fillStyle = 'rgba(10, 10, 10, 0.05)';
      ctx.fillRect(0, 0, logicalWidth, logicalHeight);
      ctx.font = `${fontSize}px monospace`;

      for (let i = 0; i < drops.length; i++) {
        const char = charArr[Math.floor(Math.random() * charArr.length)];
        const x = i * fontSize;
        const y = drops[i] * fontSize;

        // Obere 30% der Höhe: helleres Gold (frisch). Rest: dunkleres Gold.
        ctx.fillStyle =
          drops[i] * fontSize < logicalHeight * 0.3
            ? 'rgba(230, 210, 140, 0.9)'
            : 'rgba(201, 168, 76, 0.75)';

        ctx.fillText(char, x, y);

        // Drop reset bei Boden mit 2.5% Wahrscheinlichkeit
        if (y > logicalHeight && Math.random() > 0.975) {
          drops[i] = 0;
        }
        drops[i]++;
      }
    };

    const start = () => {
      if (this.matrixIntervalId === null) {
        // 60ms = ~16fps. Vorher 42ms (~24fps) — visuell kaum Unterschied,
        // aber spart ~40% Canvas-Repaints. Kombiniert mit den CSS-Anim-Fixes
        // (opacity-Pulse statt box-shadow-Pulse) bringt das Final-CTA von
        // 14fps zurück auf ~60fps.
        this.matrixIntervalId = window.setInterval(draw, 60);
      }
    };
    const stop = () => {
      if (this.matrixIntervalId !== null) {
        clearInterval(this.matrixIntervalId);
        this.matrixIntervalId = null;
      }
    };

    // Performance: Matrix nur laufen wenn Section sichtbar
    this.matrixObserver = new IntersectionObserver(
      ([entry]) => (entry.isIntersecting ? start() : stop()),
      { threshold: 0 },
    );
    this.matrixObserver.observe(this.root);
  }

  /** Optional: dispose-Hook für späteres SPA-Teardown */
  dispose(): void {
    if (this.matrixIntervalId !== null) clearInterval(this.matrixIntervalId);
    if (this.matrixResizeHandler) window.removeEventListener('resize', this.matrixResizeHandler);
    this.matrixObserver?.disconnect();
  }

  private escape(text: string): string {
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }

  private injectStyles(): void {
    if (document.getElementById('final-cta-styles')) return;
    const style = document.createElement('style');
    style.id = 'final-cta-styles';
    style.textContent = `
      /* ═══════════════════════════════════════════════════════
         WRAP — relative container, clipped, full-bleed
         Climax-Section: 92vh hoch für richtigen Crescendo-Raum
         ═══════════════════════════════════════════════════════ */
      .final-cta-wrap {
        position: relative;
        width: 100%;
        min-height: 92vh;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 120px 32px;
        overflow: hidden;
        isolation: isolate;
      }

      /* ═══════════════════════════════════════════════════════
         GRENZE — Top-Hairline mit Gold-Glow zwischen FAQ und Final-CTA
         (auf der Section selbst, nicht im wrap — sitzt exakt an
          der Section-Boundary)
         ═══════════════════════════════════════════════════════ */
      section[data-section="final-cta"]::after {
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
         MATRIX-RAIN — Canvas-Hintergrund (gold gefärbt)
         Etwas stärker präsent für epicheren Eindruck
         ═══════════════════════════════════════════════════════ */
      .final-cta-matrix {
        position: absolute;
        inset: 0;
        width: 100%;
        height: 100%;
        z-index: 0;
        opacity: 0.22;
        pointer-events: none;
      }

      /* ═══════════════════════════════════════════════════════
         GOLD-OVERLAY — 4 statische radials + animierter Shimmer
         ═══════════════════════════════════════════════════════ */
      .final-cta-overlay {
        position: absolute;
        inset: 0;
        z-index: 1;
        background:
          radial-gradient(ellipse 70% 55% at 50% -10%, rgba(201, 168, 76, 0.13) 0%, transparent 65%),
          radial-gradient(ellipse 50% 40% at 85% 75%, rgba(201, 168, 76, 0.07) 0%, transparent 55%),
          radial-gradient(ellipse 40% 35% at 10% 60%, rgba(201, 168, 76, 0.05) 0%, transparent 50%),
          radial-gradient(ellipse 80% 30% at 50% 100%, rgba(201, 168, 76, 0.06) 0%, transparent 60%);
        pointer-events: none;
      }
      .final-cta-overlay::after {
        content: '';
        position: absolute;
        inset: 0;
        background:
          radial-gradient(ellipse 60% 40% at 20% 30%, rgba(201, 168, 76, 0.06) 0%, transparent 50%),
          radial-gradient(ellipse 50% 35% at 80% 20%, rgba(201, 168, 76, 0.05) 0%, transparent 50%);
        /* Shimmer entfernt — war Vollbild-Layer mit transform+opacity-Animation,
           triggert kontinuierliche Compositor-Updates. Statisches Layer reicht
           visuell genauso gut für das Premium-Gefühl. */
        opacity: 0.6;
      }

      /* ═══════════════════════════════════════════════════════
         INNER GLOW — dichter, statischer Spotlight (kein breath mehr)
         Performance: animation auf transform+opacity auf großem radial
         hatte ~10fps Anteil am Final-CTA Performance-Drop.
         ═══════════════════════════════════════════════════════ */
      .final-cta-glow {
        position: absolute;
        inset: 0;
        background: radial-gradient(
          ellipse 60% 55% at 50% 50%,
          rgba(201, 168, 76, 0.32) 0%,
          rgba(201, 168, 76, 0.10) 35%,
          transparent 65%
        );
        pointer-events: none;
        z-index: 2;
      }

      /* ═══════════════════════════════════════════════════════
         INNER CONTENT — über allen Layern, gestaffelter Reveal
         ═══════════════════════════════════════════════════════ */
      .final-cta-inner {
        position: relative;
        z-index: 3;
        text-align: center;
        max-width: 880px;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 32px;
      }

      /* EYEBROW — kleines Spannungs-Label über der Headline */
      .final-cta-eyebrow {
        font-family: var(--font-mono);
        font-size: 11px;
        font-weight: 600;
        letter-spacing: 0.36em;
        color: var(--color-gold);
        text-transform: uppercase;
        opacity: 0;
        transform: translateY(12px);
        transition:
          opacity 900ms var(--ease-reveal),
          transform 900ms var(--ease-reveal);
      }

      /* HEADLINE — episch groß, mit Gold-Glow Text-Shadow */
      .final-cta-headline {
        font-family: var(--font-display);
        font-weight: 400;
        font-size: clamp(2.6rem, 5.5vw, 4.8rem);
        line-height: 1.12;
        letter-spacing: -0.018em;
        margin: 0;
        color: var(--color-text);
        text-wrap: balance;
        text-shadow:
          0 0 60px rgba(201, 168, 76, 0.22),
          0 0 120px rgba(201, 168, 76, 0.08);
        opacity: 0;
        transform: translateY(36px);
        transition:
          opacity 1400ms var(--ease-reveal) 200ms,
          transform 1400ms var(--ease-reveal) 200ms;
      }
      /* Italic-Akzent — statisch gold-light statt animated shimmer.
         Performance: Shimmer auf background-clip:text triggert pro Frame Repaint
         der Text-Pixels mit Hinclip-Compositing. Sehr teuer auf großem Headline-Text.
         Visueller Verlust: minimal — der Text leuchtet weiterhin gold dank Text-Shadow. */
      .final-cta-headline em {
        font-style: italic;
        font-weight: 500;
        color: var(--color-gold-light);
      }

      /* SUB — leicht größer, ruhig */
      .final-cta-sub {
        font-family: var(--font-body);
        font-size: 17px;
        line-height: 1.65;
        color: var(--color-text-muted);
        max-width: 520px;
        margin: 0;
        text-wrap: balance;
        opacity: 0;
        transform: translateY(24px);
        transition:
          opacity 1100ms var(--ease-reveal) 550ms,
          transform 1100ms var(--ease-reveal) 550ms;
      }

      /* BUTTON — deutlich größer, mit atmendem Gold-Pulse
         Performance-Pattern: STATIC box-shadow auf Button (base level),
         PSEUDO-ELEMENT mit STATIC max-level box-shadow + opacity-Animation.
         Opacity ist composite-only (kein Repaint), box-shadow-lerping wäre
         pro Frame Repaint einer 70×400px Area mit 48-72px blur = ~150k Pixel.
         Vorher: 14fps. Nachher: ~60fps. */
      .final-cta-btn {
        position: relative;
        margin-top: 16px;
        display: inline-flex;
        align-items: center;
        gap: 16px;
        padding: 26px 68px;
        border-radius: 4px;
        background: linear-gradient(135deg, var(--color-gold), var(--color-gold-dark));
        color: var(--color-black);
        font-family: var(--font-body);
        font-size: 15px;
        font-weight: 700;
        letter-spacing: 0.22em;
        text-transform: uppercase;
        text-decoration: none;
        opacity: 0;
        transform: translateY(24px) scale(0.96);
        /* BASE box-shadow — bleibt statisch, kein animate-Property */
        box-shadow:
          0 0 48px rgba(201, 168, 76, 0.5),
          0 10px 40px rgba(201, 168, 76, 0.3),
          0 1px 0 rgba(255, 240, 200, 0.4) inset;
        transition:
          background 400ms var(--ease-reveal),
          transform 400ms var(--ease-reveal),
          opacity 1100ms var(--ease-reveal) 900ms;
        will-change: transform;
      }
      /* PULSE-LAYER: pseudo-element mit max-level glow, opacity 0 default.
         Animation pulst opacity 0→1→0 = composite-only, kein Repaint. */
      .final-cta-btn::before {
        content: '';
        position: absolute;
        inset: 0;
        border-radius: inherit;
        pointer-events: none;
        /* Max-Level Glow — überlagert die Base box-shadow wenn opacity > 0 */
        box-shadow:
          0 0 72px rgba(201, 168, 76, 0.75),
          0 14px 52px rgba(201, 168, 76, 0.45);
        opacity: 0;
        z-index: -1;
        /* Kritisch: pseudo muss HINTER Button-Background bleiben damit der
           glow am Rand sichtbar wird statt überlagert */
      }
      .final-cta-wrap.reveal .final-cta-btn {
        opacity: 1;
        transform: translateY(0) scale(1);
      }
      .final-cta-wrap.reveal .final-cta-btn::before {
        animation: final-cta-btn-pulse 3.2s ease-in-out infinite 1.8s;
      }
      @keyframes final-cta-btn-pulse {
        0%, 100% { opacity: 0; }
        50%      { opacity: 1; }
      }
      .final-cta-btn:hover {
        background: linear-gradient(135deg, var(--color-gold-light), var(--color-gold));
        transform: translateY(-3px) scale(1.02);
        box-shadow:
          0 0 88px rgba(201, 168, 76, 0.85),
          0 18px 56px rgba(201, 168, 76, 0.55),
          0 1px 0 rgba(255, 245, 215, 0.7) inset;
      }
      /* Hover: stop pulse damit der intensive hover-glow nicht fadet */
      .final-cta-btn:hover::before {
        animation: none;
        opacity: 0;
      }
      .final-cta-btn:focus-visible {
        outline: 2px solid var(--color-gold-light);
        outline-offset: 6px;
      }
      .final-cta-btn-arrow {
        font-weight: 700;
        transition: transform 400ms ease;
      }
      .final-cta-btn:hover .final-cta-btn-arrow {
        transform: translateX(8px);
      }

      /* TRUST-LINE — kleine Reassurance unter dem Button */
      .final-cta-trust {
        font-family: var(--font-mono);
        font-size: 11px;
        font-weight: 500;
        letter-spacing: 0.28em;
        text-transform: uppercase;
        color: var(--color-text-dim);
        margin: 4px 0 0;
        opacity: 0;
        transition: opacity 900ms ease 1300ms;
      }

      /* Reveal-Cascade triggert alle Inner-Elements */
      .final-cta-wrap.reveal .final-cta-eyebrow,
      .final-cta-wrap.reveal .final-cta-headline,
      .final-cta-wrap.reveal .final-cta-sub,
      .final-cta-wrap.reveal .final-cta-trust {
        opacity: 1;
        transform: translateY(0);
      }

      @media (max-width: 768px) {
        .final-cta-wrap { padding: 80px 24px; min-height: 80vh; }
        .final-cta-inner { gap: 24px; }
        .final-cta-btn { padding: 20px 44px; font-size: 13px; letter-spacing: 0.18em; }
        .final-cta-trust { font-size: 10px; letter-spacing: 0.22em; }
      }

      @media (prefers-reduced-motion: reduce) {
        .final-cta-wrap.reveal .final-cta-btn::before {
          animation: none;
        }
        /* Reveal sofort, ohne staffel */
        .final-cta-headline,
        .final-cta-sub,
        .final-cta-btn,
        .final-cta-trust {
          opacity: 1;
          transform: none;
          transition: none;
        }
      }
    `;
    document.head.appendChild(style);
  }
}
