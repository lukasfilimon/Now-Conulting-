/**
 * VideoCoordinator — globaler Vimeo Player Koordinator.
 *
 * Wenn auf der Seite ein Vimeo-Video gestartet wird, pausiert er automatisch
 * alle anderen Vimeo-Videos. Nutzt die Vimeo Player postMessage-API direkt
 * (keine npm dependency).
 *
 * Usage:
 *   import { VideoCoordinator } from './core/VideoCoordinator';
 *   const coordinator = new VideoCoordinator();
 *   coordinator.init();  // scannt alle existierenden Vimeo-iframes
 *
 * Neue iframes können später via coordinator.refresh() registriert werden,
 * oder automatisch bei Scroll-Events (lazy-loaded iframes).
 */
export class VideoCoordinator {
  private iframes = new Set<HTMLIFrameElement>();
  private boundMessageHandler: (e: MessageEvent) => void;

  constructor() {
    this.boundMessageHandler = this.handleMessage.bind(this);
  }

  init(): void {
    window.addEventListener('message', this.boundMessageHandler);
    this.refresh();
    // Erneut scannen wenn neue iframes ins DOM kommen (z.B. nach Section-Mount)
    // 500ms Delay damit verspätete Section-Mounts noch erfasst werden
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
      try {
        iframe.contentWindow?.postMessage(
          JSON.stringify({ method: 'addEventListener', value: 'play' }),
          '*',
        );
      } catch {
        // ignore — iframe possibly not yet ready
      }
    };

    // Versuche sofort (für cached iframes) UND beim load-event
    subscribe();
    iframe.addEventListener('load', subscribe);
  }

  private handleMessage(e: MessageEvent): void {
    // Strict origin check — Vimeo Player iframes nur von genau dieser Origin.
    // Frühere `.includes('vimeo.com')` Variante war durch `malicious-vimeo.com.attacker.de`
    // umgehbar (theoretisch). Defense-in-Depth.
    if (e.origin !== 'https://player.vimeo.com') return;
    let data: { event?: string };
    try {
      data = typeof e.data === 'string' ? JSON.parse(e.data) : e.data;
    } catch {
      return;
    }
    if (data.event !== 'play') return;

    // Vimeo player started playing — pause alle anderen
    this.iframes.forEach((iframe) => {
      if (iframe.contentWindow === e.source) return; // skip the one that started
      try {
        iframe.contentWindow?.postMessage(
          JSON.stringify({ method: 'pause' }),
          '*',
        );
      } catch {
        // ignore
      }
    });
  }

  dispose(): void {
    window.removeEventListener('message', this.boundMessageHandler);
    this.iframes.clear();
  }
}
