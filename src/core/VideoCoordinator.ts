/**
 * VideoCoordinator — globaler Vimeo Player Koordinator.
 *
 * Aufgaben:
 * 1. Single-Play: startet ein Vimeo-Video, pausieren alle anderen.
 * 2. Scroll-Shield: legt über jedes Card-Video einen transparenten Button.
 *    Das cross-origin Vimeo-iframe frisst sonst das erste wheel/touch-Event
 *    sobald der Cursor drüber ist (bevor `is-scrolling` greifen kann) → der
 *    Scroll "bleibt am Video hängen". Der Shield ist ein normales Seiten-
 *    Element: wheel-Events blubbern zu Lenis durch (Scroll hakt nie), ein
 *    Klick spielt/pausiert das Video via postMessage.
 *
 * Nutzt die Vimeo Player postMessage-API direkt (keine npm dependency).
 *
 * Usage:
 *   const coordinator = new VideoCoordinator();
 *   coordinator.init();  // scannt alle existierenden Vimeo-iframes
 */
export class VideoCoordinator {
  private iframes = new Set<HTMLIFrameElement>();
  private boundMessageHandler: (e: MessageEvent) => void;
  // iframe → setzt den Play-State seines Shields (Sync mit echten Vimeo-Events)
  private shieldSync = new WeakMap<HTMLIFrameElement, (playing: boolean) => void>();
  private playing = new WeakMap<HTMLIFrameElement, boolean>();

  constructor() {
    this.boundMessageHandler = this.handleMessage.bind(this);
  }

  init(): void {
    this.injectShieldStyles();
    window.addEventListener('message', this.boundMessageHandler);
    this.refresh();
    // Erneut scannen wenn neue iframes ins DOM kommen (z.B. nach Section-Mount)
    setTimeout(() => this.refresh(), 500);
    setTimeout(() => this.refresh(), 2000);
  }

  /**
   * Findet alle Vimeo-iframes im DOM und registriert sie.
   * Kann mehrfach aufgerufen werden — duplicates werden ignoriert.
   */
  refresh(): void {
    const found = document.querySelectorAll<HTMLIFrameElement>(
      'iframe[src*="player.vimeo.com"]',
    );
    found.forEach((iframe) => this.register(iframe));
  }

  private register(iframe: HTMLIFrameElement): void {
    if (this.iframes.has(iframe)) return;
    this.iframes.add(iframe);

    const subscribe = () => {
      ['play', 'pause', 'ended'].forEach((value) => {
        try {
          iframe.contentWindow?.postMessage(
            JSON.stringify({ method: 'addEventListener', value }),
            '*',
          );
        } catch {
          // ignore — iframe possibly not yet ready
        }
      });
    };

    // Versuche sofort (für cached iframes) UND beim load-event
    subscribe();
    iframe.addEventListener('load', subscribe);

    this.attachShield(iframe);
  }

  /**
   * Transparenter Klick-Shield über Card-Videos (Experiences/Stimmen).
   * Der Hero-Trailer bleibt unberührt (eigene Logik).
   */
  private attachShield(iframe: HTMLIFrameElement): void {
    const container = iframe.closest<HTMLElement>(
      '.experience-card-video, .stimme-card-video',
    );
    if (!container) return;
    if (container.querySelector('.video-scroll-shield')) return;

    const shield = document.createElement('button');
    shield.type = 'button';
    shield.className = 'video-scroll-shield';
    shield.setAttribute('aria-label', 'Video abspielen oder pausieren');

    this.playing.set(iframe, false);
    this.shieldSync.set(iframe, (p: boolean) => {
      this.playing.set(iframe, p);
      shield.classList.toggle('is-playing', p);
    });

    shield.addEventListener('click', () => {
      const method = this.playing.get(iframe) === true ? 'pause' : 'play';
      try {
        iframe.contentWindow?.postMessage(JSON.stringify({ method }), '*');
      } catch {
        // ignore
      }
      // Play-State wird ausschließlich durch echte Vimeo 'play'/'pause'/'ended'
      // Events gesetzt (shieldSync) — kein optimistisches Toggle, das sonst mit
      // den asynchronen Events racen würde. Vimeos eigenes Poster/Playing-UI
      // (durch den transparenten Shield sichtbar) ist das visuelle Feedback.
    });

    container.appendChild(shield);
  }

  private handleMessage(e: MessageEvent): void {
    // Strict origin check — Vimeo Player iframes nur von genau dieser Origin.
    if (e.origin !== 'https://player.vimeo.com') return;
    let data: { event?: string };
    try {
      data = typeof e.data === 'string' ? JSON.parse(e.data) : e.data;
    } catch {
      return;
    }
    const ev = data.event;
    if (ev !== 'play' && ev !== 'pause' && ev !== 'ended') return;

    // Quelle-iframe finden
    let source: HTMLIFrameElement | null = null;
    for (const iframe of this.iframes) {
      if (iframe.contentWindow === e.source) {
        source = iframe;
        break;
      }
    }

    if (ev === 'play') {
      if (source) this.shieldSync.get(source)?.(true);
      // Vimeo player started playing — pause alle anderen + deren Shield-State zurück
      this.iframes.forEach((iframe) => {
        if (iframe === source) return;
        try {
          iframe.contentWindow?.postMessage(JSON.stringify({ method: 'pause' }), '*');
        } catch {
          // ignore
        }
        this.shieldSync.get(iframe)?.(false);
      });
    } else {
      // pause / ended
      if (source) this.shieldSync.get(source)?.(false);
    }
  }

  private injectShieldStyles(): void {
    if (document.getElementById('video-shield-styles')) return;
    const style = document.createElement('style');
    style.id = 'video-shield-styles';
    style.textContent = `
      .video-scroll-shield {
        position: absolute;
        inset: 0;
        z-index: 3;
        display: block;
        width: 100%;
        height: 100%;
        margin: 0;
        padding: 0;
        border: 0;
        background: transparent;
        cursor: pointer;
        -webkit-appearance: none;
        appearance: none;
      }
      .video-scroll-shield:focus-visible {
        outline: 2px solid var(--color-gold, #c9a84c);
        outline-offset: -2px;
      }
    `;
    document.head.appendChild(style);
  }

  dispose(): void {
    window.removeEventListener('message', this.boundMessageHandler);
    this.iframes.clear();
  }
}
