import { copy, cta } from '../content/copy';
import {
  testimonialsRowOne,
  testimonialsRowTwo,
  vimeoEmbedUrl,
  type Testimonial,
} from '../content/stimmen';

/**
 * Stimmen / Ergebnisse Section — Video-Testimonial-Wall, 2 manuell steuerbare Reihen.
 *
 * Mechanik (Umbau von Auto-Marquee → Nutzer-Steuerung):
 * - Pro Reihe ein nativer horizontaler scroll-snap-Container (overflow-x:auto).
 * - Bedienung absichtlich SICHTBAR ("darf nicht untergehen"):
 *     · immer sichtbare Gold-Pfeile links/rechts (am Ende ausgegraut)
 *     · Rand-Peek: nächste Karte lugt rein
 *     · einmaliger Nudge beim Reveal (zeigt Beweglichkeit)
 *     · schlanker Gold-Fortschrittsbalken
 *     · mobiler "wischen"-Hinweis (verschwindet nach erster Interaktion)
 * - KEINE kontinuierliche Auto-Bewegung mehr.
 *
 * Video-Koordination: VideoCoordinator findet die iframes via `.stimme-card-video`
 * (Klasse MUSS bleiben). Sein Scroll-Schutz-Layer ist ein <button>, daher:
 * Tap = Play/Pause, Wisch = Reihe scrollt. Desktop-Maus-Drag wird per
 * click-suppress vom Play/Pause-Toggle getrennt.
 */
export class Stimmen {
  readonly root: HTMLElement;
  private revealed = false;
  private nudgePlayed = false;
  private scrollers: HTMLElement[] = [];
  private rafHandles = new WeakMap<HTMLElement, number>();
  private dragState = new WeakMap<
    HTMLElement,
    { down: boolean; moved: boolean; startX: number; startScroll: number }
  >();

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

        ${this.renderRow(testimonialsRowOne, 1)}
        ${this.renderRow(testimonialsRowTwo, 2)}

        <div class="section-cta-wrap">
          <a class="section-cta" href="${cta.primaryHref}"${cta.isCalendly ? ' target="_blank" rel="noopener"' : ''}>
            <span>${this.escape(cta.primaryLabel)}</span>
            <span class="section-cta-arrow">→</span>
          </a>
        </div>
      </div>
    `;
    this.root = container.querySelector('.stimmen-wrap') as HTMLElement;
    this.scrollers = Array.from(
      container.querySelectorAll<HTMLElement>('.stimmen-scroller'),
    );
    this.injectStyles();
    this.attachEvents();
    this.observeReveal();

    // Initial-Sync: prev-Pfeil sofort disabled, Progress + Pfeil-Position setzen.
    requestAnimationFrame(() => {
      this.scrollers.forEach((s) => {
        this.updateArrows(s);
        this.updateProgress(s);
        this.positionArrows(s);
      });
    });
  }

  private renderRow(items: Testimonial[], rowIndex: number): string {
    const cards = items
      .map(
        (t) => `
        <li class="stimme-card" data-id="${this.escape(t.id)}">
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
        </li>
      `,
      )
      .join('');

    return `
      <div class="stimmen-row" data-row="${rowIndex}" data-scrollable="true">
        <button class="stimmen-arrow stimmen-arrow--prev" type="button" aria-label="Vorherige Stimmen" disabled>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"><path d="M15 6 L9 12 L15 18"/></svg>
        </button>

        <div class="stimmen-scroller" tabindex="0" aria-label="Ergebnisse — Reihe ${rowIndex}, horizontal scrollbar">
          <ul class="stimmen-track" role="list">
            ${cards}
          </ul>
        </div>

        <button class="stimmen-arrow stimmen-arrow--next" type="button" aria-label="Weitere Stimmen">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"><path d="M9 6 L15 12 L9 18"/></svg>
        </button>

        <div class="stimmen-progress" aria-hidden="true">
          <span class="stimmen-progress-thumb"></span>
        </div>

        <div class="stimmen-hint" aria-hidden="true">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><path d="M14 7 L9 12 L14 17"/></svg>
          <span>wischen</span>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><path d="M10 7 L15 12 L10 17"/></svg>
        </div>
      </div>
    `;
  }

  private attachEvents(): void {
    this.scrollers.forEach((scroller) => {
      const row = scroller.closest('.stimmen-row') as HTMLElement;
      const prev = row.querySelector('.stimmen-arrow--prev') as HTMLElement | null;
      const next = row.querySelector('.stimmen-arrow--next') as HTMLElement | null;

      scroller.addEventListener('scroll', () => this.onScroll(scroller), {
        passive: true,
      });

      // Erste echte Nutzer-Interaktion blendet den mobilen Hinweis aus
      // (NICHT an 'scroll' gekoppelt, damit der programmatische Nudge ihn nicht versteckt).
      const markInteracted = () => row.classList.add('interacted');
      scroller.addEventListener('touchstart', markInteracted, {
        passive: true,
        once: true,
      });

      prev?.addEventListener('click', () => {
        markInteracted();
        this.scrollByCards(scroller, -1);
      });
      next?.addEventListener('click', () => {
        markInteracted();
        this.scrollByCards(scroller, 1);
      });

      this.attachPointerDrag(scroller);
    });

    window.addEventListener('resize', () => this.onResize(), { passive: true });
  }

  private onScroll(scroller: HTMLElement): void {
    const prev = this.rafHandles.get(scroller);
    if (prev) cancelAnimationFrame(prev);
    const handle = requestAnimationFrame(() => {
      this.updateArrows(scroller);
      this.updateProgress(scroller);
    });
    this.rafHandles.set(scroller, handle);
  }

  private updateArrows(scroller: HTMLElement): void {
    const row = scroller.closest('.stimmen-row') as HTMLElement | null;
    if (!row) return;
    const prev = row.querySelector('.stimmen-arrow--prev') as HTMLButtonElement | null;
    const next = row.querySelector('.stimmen-arrow--next') as HTMLButtonElement | null;
    const maxScroll = scroller.scrollWidth - scroller.clientWidth;

    // Reihe passt komplett rein (z.B. sehr breiter Desktop) → Controls verstecken.
    if (maxScroll < 8) {
      row.setAttribute('data-scrollable', 'false');
      return;
    }
    row.setAttribute('data-scrollable', 'true');

    const atStart = scroller.scrollLeft <= 1;
    const atEnd = scroller.scrollLeft >= maxScroll - 1;
    if (prev) prev.disabled = atStart;
    if (next) next.disabled = atEnd;
  }

  private updateProgress(scroller: HTMLElement): void {
    const row = scroller.closest('.stimmen-row') as HTMLElement | null;
    if (!row) return;
    const thumb = row.querySelector('.stimmen-progress-thumb') as HTMLElement | null;
    if (!thumb) return;
    const maxScroll = scroller.scrollWidth - scroller.clientWidth;
    if (maxScroll <= 0) {
      thumb.style.width = '100%';
      thumb.style.left = '0%';
      return;
    }
    const visibleRatio = scroller.clientWidth / scroller.scrollWidth;
    const widthPct = Math.max(0.12, Math.min(1, visibleRatio));
    const progress = scroller.scrollLeft / maxScroll; // 0..1
    thumb.style.width = `${widthPct * 100}%`;
    thumb.style.left = `${progress * (1 - widthPct) * 100}%`;
  }

  /** Pfeile exakt auf die vertikale Mitte des Video-Frames setzen (responsiv robust). */
  private positionArrows(scroller: HTMLElement): void {
    const row = scroller.closest('.stimmen-row') as HTMLElement | null;
    if (!row) return;
    const video = scroller.querySelector('.stimme-card-video') as HTMLElement | null;
    const prev = row.querySelector('.stimmen-arrow--prev') as HTMLElement | null;
    const next = row.querySelector('.stimmen-arrow--next') as HTMLElement | null;
    if (!video || !prev || !next) return;
    const rowRect = row.getBoundingClientRect();
    const vRect = video.getBoundingClientRect();
    const centerY = vRect.top - rowRect.top + vRect.height / 2;
    if (centerY <= 0) return;
    prev.style.top = `${centerY}px`;
    next.style.top = `${centerY}px`;
  }

  private scrollByCards(scroller: HTMLElement, dir: number): void {
    const step = this.measureStep(scroller);
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    scroller.scrollBy({ left: dir * step, behavior: reduce ? 'auto' : 'smooth' });
  }

  private measureStep(scroller: HTMLElement): number {
    const track = scroller.querySelector('.stimmen-track') as HTMLElement | null;
    const card = scroller.querySelector('.stimme-card') as HTMLElement | null;
    if (!card) return scroller.clientWidth * 0.8;
    const cardWidth = card.getBoundingClientRect().width;
    let gap = 28;
    if (track) {
      const cs = getComputedStyle(track);
      gap = parseFloat(cs.columnGap || cs.gap || '28') || 28;
    }
    return cardWidth + gap;
  }

  /** Desktop-Maus/Pen Drag-to-Scroll. Touch nutzt nativen kinetischen Scroll. */
  private attachPointerDrag(scroller: HTMLElement): void {
    this.dragState.set(scroller, { down: false, moved: false, startX: 0, startScroll: 0 });

    scroller.addEventListener('pointerdown', (e) => {
      if (e.pointerType === 'touch') return; // Touch → nativer Scroll
      const st = this.dragState.get(scroller)!;
      st.down = true;
      st.moved = false;
      st.startX = e.clientX;
      st.startScroll = scroller.scrollLeft;
    });

    scroller.addEventListener('pointermove', (e) => {
      const st = this.dragState.get(scroller)!;
      if (!st.down) return;
      const dx = e.clientX - st.startX;
      if (!st.moved && Math.abs(dx) > 4) {
        st.moved = true;
        scroller.classList.add('is-grabbing');
        try {
          scroller.setPointerCapture(e.pointerId);
        } catch {
          /* noop */
        }
      }
      if (st.moved) {
        scroller.scrollLeft = st.startScroll - dx;
        e.preventDefault();
      }
    });

    const endDrag = (e: PointerEvent) => {
      const st = this.dragState.get(scroller)!;
      if (!st.down) return;
      st.down = false;
      if (!st.moved) return;
      scroller.classList.remove('is-grabbing');
      try {
        scroller.releasePointerCapture(e.pointerId);
      } catch {
        /* noop */
      }
      // Den unmittelbar folgenden Klick unterdrücken — sonst togglet das
      // Video-Shield (VideoCoordinator) ungewollt Play/Pause nach dem Drag.
      const suppress = (ev: Event) => {
        ev.preventDefault();
        ev.stopPropagation();
        scroller.removeEventListener('click', suppress, true);
      };
      scroller.addEventListener('click', suppress, true);
      window.setTimeout(() => scroller.removeEventListener('click', suppress, true), 150);
    };
    scroller.addEventListener('pointerup', endDrag);
    scroller.addEventListener('pointercancel', endDrag);
  }

  private observeReveal(): void {
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting && !this.revealed) {
            this.revealed = true;
            this.root.classList.add('reveal');
            this.maybeNudge();
            io.disconnect();
          }
        }
      },
      { threshold: 0.15 },
    );
    io.observe(this.root);
  }

  /** Einmaliger Nudge nach dem Reveal: jede Reihe wackelt kurz an → "ich bewege mich". */
  private maybeNudge(): void {
    if (this.nudgePlayed) return;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce) return;
    this.nudgePlayed = true;

    this.scrollers.forEach((scroller, i) => {
      if (scroller.scrollWidth - scroller.clientWidth < 8) return; // nicht scrollbar
      const delay = 1400 + i * 220; // nach dem Reveal-Fade, Reihen versetzt
      window.setTimeout(() => {
        scroller.scrollBy({ left: 44, behavior: 'smooth' });
        window.setTimeout(() => {
          scroller.scrollBy({ left: -44, behavior: 'smooth' });
        }, 360);
      }, delay);
    });
  }

  private onResize(): void {
    this.scrollers.forEach((s) => {
      this.updateArrows(s);
      this.updateProgress(s);
      this.positionArrows(s);
    });
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
        transition: opacity 900ms var(--ease-reveal), transform 900ms var(--ease-reveal);
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
         REIHE — Wrapper für Scroller + Pfeile + Indikatoren
         ═══════════════════════════════════════════════════════ */
      .stimmen-row {
        position: relative;
        width: 100%;
        opacity: 0;
        transform: translateY(16px);
        transition: opacity 1000ms var(--ease-reveal), transform 1000ms var(--ease-reveal);
      }
      .stimmen-wrap.reveal .stimmen-row { opacity: 1; transform: translateY(0); }
      .stimmen-wrap.reveal .stimmen-row[data-row="1"] { transition-delay: 300ms; }
      .stimmen-wrap.reveal .stimmen-row[data-row="2"] { transition-delay: 500ms; }
      .stimmen-row + .stimmen-row { margin-top: 34px; }

      /* ═══════════════════════════════════════════════════════
         SCROLLER — nativer horizontaler scroll-snap Container
         ═══════════════════════════════════════════════════════ */
      .stimmen-scroller {
        overflow-x: auto;
        overflow-y: hidden;
        scroll-snap-type: x proximity;
        scroll-behavior: smooth;
        scroll-padding-left: 32px;
        touch-action: pan-x;
        cursor: grab;
        -webkit-overflow-scrolling: touch;
        scrollbar-width: none;          /* Firefox */
        -ms-overflow-style: none;       /* alt. Edge */
        /* Schmaler Rand-Fade: lässt die Peek-Karte weich auslaufen.
           Pfeile liegen außerhalb (auf .stimmen-row) → nie gedimmt. */
        -webkit-mask-image: linear-gradient(to right, transparent 0, black 3%, black 97%, transparent 100%);
        mask-image: linear-gradient(to right, transparent 0, black 3%, black 97%, transparent 100%);
      }
      .stimmen-scroller::-webkit-scrollbar { display: none; }   /* Chrome/Safari */
      .stimmen-scroller.is-grabbing { cursor: grabbing; scroll-behavior: auto; }
      .stimmen-scroller:focus-visible {
        outline: 1px solid rgba(201, 168, 76, 0.35);
        outline-offset: 4px;
      }

      .stimmen-track {
        display: flex;
        gap: 28px;
        width: max-content;
        padding: 20px 32px;
        margin: 0;
        list-style: none;
      }

      /* ═══════════════════════════════════════════════════════
         KARTE — Premium Glass mit Video oben
         ═══════════════════════════════════════════════════════ */
      .stimme-card {
        scroll-snap-align: start;
        flex: 0 0 420px;
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
        box-shadow:
          0 1px 0 0 rgba(255, 240, 200, 0.07) inset,
          0 -1px 0 0 rgba(0, 0, 0, 0.4) inset,
          0 24px 48px -24px rgba(0, 0, 0, 0.65),
          0 0 0 1px rgba(201, 168, 76, 0.04);
        transition: border-color var(--dur-base) var(--ease-snap), box-shadow var(--dur-base) var(--ease-snap);
      }
      @media (hover: hover) {
        .stimme-card:hover {
          border-color: rgba(201, 168, 76, 0.4);
          box-shadow:
            0 1px 0 0 rgba(255, 240, 200, 0.12) inset,
            0 -1px 0 0 rgba(0, 0, 0, 0.3) inset,
            0 32px 64px -20px rgba(0, 0, 0, 0.75),
            0 0 0 1px rgba(201, 168, 76, 0.12),
            0 0 32px -10px rgba(201, 168, 76, 0.25);
        }
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
         PFEILE — immer sichtbar (Edge-Floating, Gold-Kreis, Halo)
         vertikale Position wird per JS auf die Video-Mitte gesetzt
         ═══════════════════════════════════════════════════════ */
      .stimmen-arrow {
        position: absolute;
        top: 38%;
        transform: translateY(-50%);
        z-index: 5;
        width: 56px;
        height: 56px;
        border-radius: 50%;
        background:
          linear-gradient(165deg,
            rgba(34, 30, 20, 0.82) 0%,
            rgba(20, 17, 11, 0.72) 100%);
        border: 1px solid rgba(201, 168, 76, 0.32);
        color: rgba(226, 201, 122, 0.92);
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 0;
        backdrop-filter: blur(12px) saturate(130%);
        -webkit-backdrop-filter: blur(12px) saturate(130%);
        box-shadow:
          0 1px 0 0 rgba(255, 240, 200, 0.08) inset,
          0 -1px 0 0 rgba(0, 0, 0, 0.4) inset,
          0 12px 28px -16px rgba(0, 0, 0, 0.7);
        transition:
          border-color var(--dur-fast) var(--ease-snap),
          background var(--dur-fast) var(--ease-snap),
          color var(--dur-fast) var(--ease-snap),
          transform var(--dur-fast) var(--ease-reveal),
          opacity var(--dur-fast) var(--ease-snap),
          box-shadow var(--dur-fast) var(--ease-snap);
      }
      /* Verlauf-Halo hinter dem Button — lesbar über bunten Video-Frames */
      .stimmen-arrow::before {
        content: '';
        position: absolute;
        inset: -18px;
        border-radius: 50%;
        background: radial-gradient(circle,
          rgba(8, 6, 4, 0.55) 0%,
          rgba(8, 6, 4, 0.25) 45%,
          transparent 75%);
        z-index: -1;
        pointer-events: none;
      }
      .stimmen-arrow--prev { left: 18px; }
      .stimmen-arrow--next { right: 18px; }
      @media (hover: hover) {
        .stimmen-arrow:hover:not(:disabled) {
          border-color: rgba(226, 201, 122, 0.7);
          color: #f0d489;
          transform: translateY(calc(-50% - 2px));
          background:
            linear-gradient(165deg,
              rgba(42, 36, 22, 0.88) 0%,
              rgba(26, 22, 14, 0.78) 100%);
          box-shadow:
            0 1px 0 0 rgba(255, 240, 200, 0.14) inset,
            0 -1px 0 0 rgba(0, 0, 0, 0.35) inset,
            0 18px 40px -16px rgba(0, 0, 0, 0.8),
            0 0 24px -8px rgba(201, 168, 76, 0.35);
        }
      }
      .stimmen-arrow:active:not(:disabled) { transform: translateY(-50%); }
      .stimmen-arrow:disabled { opacity: 0.26; cursor: default; pointer-events: none; }
      .stimmen-arrow svg { width: 20px; height: 20px; }

      /* ═══════════════════════════════════════════════════════
         FORTSCHRITTSBALKEN — schlanker Gold-Thumb je Reihe
         ═══════════════════════════════════════════════════════ */
      .stimmen-progress {
        position: relative;
        height: 2px;
        width: min(220px, 42%);
        margin: 20px auto 0;
        background: rgba(201, 168, 76, 0.14);
        border-radius: 2px;
        overflow: hidden;
      }
      .stimmen-progress-thumb {
        position: absolute;
        top: 0;
        left: 0;
        height: 100%;
        width: 30%;
        border-radius: 2px;
        background: linear-gradient(90deg, var(--color-gold), var(--color-gold-light));
        transition: width 200ms ease;
      }

      /* ═══════════════════════════════════════════════════════
         MOBILER "WISCHEN"-HINWEIS — nur Touch, verschwindet nach 1. Nutzung
         ═══════════════════════════════════════════════════════ */
      .stimmen-hint {
        display: none;
        align-items: center;
        justify-content: center;
        gap: 8px;
        margin: 14px auto 0;
        font-family: var(--font-mono);
        font-size: 10px;
        font-weight: 500;
        letter-spacing: 0.28em;
        text-transform: uppercase;
        color: rgba(201, 168, 76, 0.6);
        transition: opacity 500ms var(--ease-reveal);
      }
      .stimmen-hint svg { width: 13px; height: 13px; }
      .stimmen-hint svg:first-of-type { animation: stimmen-hint-l 2.2s var(--ease-smooth) infinite; }
      .stimmen-hint svg:last-of-type { animation: stimmen-hint-r 2.2s var(--ease-smooth) infinite; }
      @keyframes stimmen-hint-l {
        0%, 100% { transform: translateX(0); opacity: 0.5; }
        50% { transform: translateX(-3px); opacity: 1; }
      }
      @keyframes stimmen-hint-r {
        0%, 100% { transform: translateX(0); opacity: 0.5; }
        50% { transform: translateX(3px); opacity: 1; }
      }
      @media (hover: none) {
        .stimmen-row[data-scrollable="true"] .stimmen-hint { display: flex; }
      }
      .stimmen-row.interacted .stimmen-hint { opacity: 0; pointer-events: none; }

      /* Nicht-scrollbare Reihe (passt komplett rein) → Steuerung ausblenden */
      .stimmen-row[data-scrollable="false"] .stimmen-arrow,
      .stimmen-row[data-scrollable="false"] .stimmen-progress,
      .stimmen-row[data-scrollable="false"] .stimmen-hint { display: none; }

      /* ═══════════════════════════════════════════════════════
         MOBILE
         ═══════════════════════════════════════════════════════ */
      @media (max-width: 768px) {
        .stimmen-header { margin-bottom: 44px; padding: 0 20px; }
        .stimmen-track { gap: 16px; padding: 16px 20px; }
        .stimme-card { flex: 0 0 78vw; max-width: 340px; }
        .stimmen-scroller { scroll-padding-left: 20px; }
        .stimmen-arrow { width: 48px; height: 48px; }
        .stimmen-arrow--prev { left: 8px; }
        .stimmen-arrow--next { right: 8px; }
        .stimmen-arrow::before { inset: -14px; }
        .stimmen-row + .stimmen-row { margin-top: 26px; }
      }

      /* ═══════════════════════════════════════════════════════
         REDUCED MOTION
         ═══════════════════════════════════════════════════════ */
      @media (prefers-reduced-motion: reduce) {
        .stimmen-scroller { scroll-behavior: auto; }
        .stimmen-header,
        .stimmen-row { opacity: 1; transform: none; transition: none; }
        .stimmen-hint svg { animation: none; }
      }
    `;
    document.head.appendChild(style);
  }
}
