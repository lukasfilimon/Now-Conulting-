/**
 * Persistent brand wordmark + minimal nav.
 * Always visible top-left so brand identity is established before scroll.
 */
export class Navigation {
  readonly root: HTMLElement;

  constructor() {
    const nav = document.createElement('nav');
    nav.className = 'now-nav';
    nav.setAttribute('aria-label', 'Hauptnavigation');
    nav.innerHTML = `
      <a class="now-wordmark" href="/" aria-label="NOW Consulting — zur Startseite">
        <span class="now-wordmark-text">NOW</span>
        <span class="now-wordmark-dot" aria-hidden="true">·</span>
        <span class="now-wordmark-sub">CONSULTING</span>
      </a>
    `;
    document.body.appendChild(nav);
    this.root = nav;
    this.injectStyles();
  }

  private injectStyles(): void {
    if (document.getElementById('now-nav-styles')) return;
    const style = document.createElement('style');
    style.id = 'now-nav-styles';
    style.textContent = `
      .now-nav {
        position: fixed;
        top: 0;
        left: 0;
        z-index: 50;
        padding: 24px 32px;
        pointer-events: none;
      }
      .now-wordmark {
        display: inline-flex;
        align-items: baseline;
        gap: 10px;
        text-decoration: none;
        pointer-events: auto;
        opacity: 0;
        animation: now-wordmark-in 900ms cubic-bezier(0.16, 1, 0.3, 1) 600ms forwards;
      }
      .now-wordmark-text {
        font-family: var(--font-display);
        font-style: italic;
        font-weight: 700;
        font-size: 22px;
        letter-spacing: 0.01em;
        color: var(--color-gold-light);
      }
      .now-wordmark-dot {
        color: var(--color-gold);
        font-size: 16px;
        line-height: 1;
        opacity: 0.55;
      }
      .now-wordmark-sub {
        font-family: var(--font-mono);
        font-size: 10px;
        letter-spacing: 0.32em;
        color: rgba(212, 175, 55, 0.6);
        text-transform: uppercase;
      }
      .now-wordmark:hover .now-wordmark-text { color: var(--color-text); }
      .now-wordmark:hover .now-wordmark-sub { color: var(--color-gold-light); }
      .now-wordmark:focus-visible {
        outline: 2px solid var(--color-gold);
        outline-offset: 4px;
        border-radius: 2px;
      }
      @keyframes now-wordmark-in {
        from { opacity: 0; transform: translateY(-6px); }
        to { opacity: 1; transform: translateY(0); }
      }
      @media (max-width: 600px) {
        .now-nav { padding: 18px 20px; }
        .now-wordmark-sub { display: none; }
      }
    `;
    document.head.appendChild(style);
  }
}
