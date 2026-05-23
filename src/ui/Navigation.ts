import { cta } from '../content/copy';

interface NavLink {
  label: string;
  target: string; // CSS selector e.g. '#section-programs'
}

const NAV_LINKS: NavLink[] = [
  { label: 'Inhalte',      target: '#section-approach' },
  { label: 'Programme',    target: '#section-programs' },
  { label: 'Testimonials', target: '#section-stimmen' },
  { label: 'Unser Team',   target: '#section-team' },
  { label: 'FAQ',          target: '#section-faq' },
];

export class Navigation {
  readonly root: HTMLElement;
  private menuOpen = false;
  private scrolled = false;

  constructor() {
    const nav = document.createElement('nav');
    nav.className = 'now-nav';
    nav.setAttribute('aria-label', 'Hauptnavigation');
    nav.innerHTML = `
      <div class="now-nav-inner">
        <a class="now-wordmark" href="/" aria-label="NOW Consulting — zur Startseite">
          <img class="now-wordmark-img" src="/now-logo.webp" alt="" aria-hidden="true" />
          <span class="now-wordmark-text" aria-hidden="true">
            <span class="now-wordmark-text-now">NOW</span> <span class="now-wordmark-text-rest">CONSULTING</span>
          </span>
        </a>
        <ul class="now-nav-links" role="list">
          ${NAV_LINKS.map(
            (l) => `<li><a class="now-nav-link" href="/${l.target}" data-target="${l.target}">${l.label}</a></li>`,
          ).join('')}
        </ul>
        <div class="now-nav-actions">
          <a class="now-nav-cta" href="${cta.primaryHref}"${cta.isCalendly ? ' target="_blank" rel="noopener"' : ''}>
            <span>Klarheitsgespräch buchen</span>
            <span class="now-nav-cta-arrow" aria-hidden="true">→</span>
          </a>
          <button class="now-nav-toggle" type="button" aria-label="Menü öffnen" aria-expanded="false">
            <span></span><span></span><span></span>
          </button>
        </div>
      </div>
      <div class="now-nav-overlay" aria-hidden="true">
        <ul class="now-nav-overlay-links" role="list">
          ${NAV_LINKS.map(
            (l) => `<li><a class="now-nav-overlay-link" href="/${l.target}" data-target="${l.target}">${l.label}</a></li>`,
          ).join('')}
        </ul>
        <a class="now-nav-overlay-cta" href="${cta.primaryHref}"${cta.isCalendly ? ' target="_blank" rel="noopener"' : ''}>
          Klarheitsgespräch buchen →
        </a>
      </div>
    `;
    document.body.appendChild(nav);
    this.root = nav;
    this.injectStyles();
    this.bindLinks();
    this.bindToggle();
    this.bindScroll();
  }

  private bindLinks(): void {
    const links = this.root.querySelectorAll<HTMLAnchorElement>('a[data-target]');
    links.forEach((a) => {
      a.addEventListener('click', (e) => {
        const target = a.dataset.target;
        if (!target) return;
        const el = document.querySelector(target) as HTMLElement | null;
        if (!el) return;
        e.preventDefault();
        if (this.menuOpen) this.closeMenu();
        const scroll = window.nowApp?.scroll;
        if (scroll) {
          scroll.scrollTo(el, { offset: -72, duration: 1.1 });
        } else {
          el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      });
    });
  }

  private bindToggle(): void {
    const btn = this.root.querySelector<HTMLButtonElement>('.now-nav-toggle');
    if (!btn) return;
    btn.addEventListener('click', () => {
      this.menuOpen ? this.closeMenu() : this.openMenu();
    });
  }

  private openMenu(): void {
    this.menuOpen = true;
    this.root.classList.add('open');
    const btn = this.root.querySelector<HTMLButtonElement>('.now-nav-toggle');
    btn?.setAttribute('aria-expanded', 'true');
    btn?.setAttribute('aria-label', 'Menü schließen');
    const overlay = this.root.querySelector<HTMLElement>('.now-nav-overlay');
    overlay?.setAttribute('aria-hidden', 'false');
  }

  private closeMenu(): void {
    this.menuOpen = false;
    this.root.classList.remove('open');
    const btn = this.root.querySelector<HTMLButtonElement>('.now-nav-toggle');
    btn?.setAttribute('aria-expanded', 'false');
    btn?.setAttribute('aria-label', 'Menü öffnen');
    const overlay = this.root.querySelector<HTMLElement>('.now-nav-overlay');
    overlay?.setAttribute('aria-hidden', 'true');
  }

  private bindScroll(): void {
    const update = () => {
      const y = window.nowApp?.scroll?.lenis?.scroll ?? window.scrollY;
      const next = y > 20;
      if (next !== this.scrolled) {
        this.scrolled = next;
        this.root.classList.toggle('scrolled', next);
      }
    };
    const attach = () => {
      const lenis = window.nowApp?.scroll?.lenis;
      if (lenis) {
        lenis.on('scroll', update);
        update();
      } else {
        window.addEventListener('scroll', update, { passive: true });
      }
    };
    setTimeout(attach, 50);
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
        right: 0;
        z-index: 50;
        pointer-events: none;
        transition: background 400ms ease-out, border-color 400ms ease-out, backdrop-filter 400ms ease-out;
        border-bottom: 1px solid transparent;
      }
      .now-nav.scrolled {
        background: rgba(14, 12, 10, 0.72);
        backdrop-filter: blur(14px) saturate(140%);
        -webkit-backdrop-filter: blur(14px) saturate(140%);
        border-bottom-color: rgba(201, 168, 76, 0.18);
      }
      .now-nav-inner {
        max-width: 1440px;
        margin: 0 auto;
        padding: 18px clamp(20px, 4vw, 48px);
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 32px;
        pointer-events: auto;
        opacity: 0;
        animation: now-nav-in 900ms var(--ease-reveal) 500ms forwards;
      }
      @keyframes now-nav-in {
        from { opacity: 0; transform: translateY(-6px); }
        to { opacity: 1; transform: translateY(0); }
      }

      .now-wordmark {
        display: inline-flex;
        align-items: center;
        gap: 12px;
        text-decoration: none;
        flex-shrink: 0;
      }
      .now-wordmark-img {
        width: 44px;
        height: 44px;
        object-fit: contain;
        display: block;
        transition: opacity 300ms ease-out, transform 300ms ease-out;
      }
      .now-wordmark:hover .now-wordmark-img { transform: scale(1.05); }
      .now-wordmark-text {
        font-family: var(--font-body);
        font-size: 15px;
        font-weight: 500;
        letter-spacing: 0.2em;
        line-height: 1;
        text-transform: uppercase;
        white-space: nowrap;
        color: var(--color-gold-light);
      }
      .now-wordmark:focus-visible {
        outline: 2px solid var(--color-gold);
        outline-offset: 4px;
        border-radius: 2px;
      }

      .now-nav-links {
        display: flex;
        align-items: center;
        gap: clamp(20px, 2.4vw, 36px);
        list-style: none;
        padding: 0;
        margin: 0;
      }
      .now-nav-link {
        font-family: var(--font-body);
        font-size: 14px;
        font-weight: 400;
        letter-spacing: 0.01em;
        color: var(--color-text-muted);
        text-decoration: none;
        position: relative;
        padding: 8px 2px;
        transition: color 280ms ease-out;
      }
      .now-nav-link::after {
        content: '';
        position: absolute;
        left: 50%;
        bottom: 2px;
        width: 0;
        height: 1px;
        background: var(--color-gold);
        transform: translateX(-50%);
        transition: width 280ms var(--ease-reveal);
      }
      .now-nav-link:hover { color: var(--color-gold-light); }
      .now-nav-link:hover::after { width: 100%; }
      .now-nav-link:focus-visible {
        outline: 2px solid var(--color-gold);
        outline-offset: 4px;
        border-radius: 2px;
      }

      .now-nav-actions {
        display: flex;
        align-items: center;
        gap: 16px;
        flex-shrink: 0;
      }
      .now-nav-cta {
        display: inline-flex;
        align-items: center;
        gap: 10px;
        padding: 11px 20px;
        border: 1px solid rgba(201, 168, 76, 0.45);
        border-radius: 4px;
        background: rgba(201, 168, 76, 0.06);
        color: var(--color-gold-light);
        font-family: var(--font-body);
        font-size: 13px;
        font-weight: 500;
        letter-spacing: 0.02em;
        text-decoration: none;
        transition: background 280ms ease-out, border-color 280ms ease-out, color 280ms ease-out;
      }
      .now-nav-cta:hover {
        background: linear-gradient(135deg, var(--color-gold), var(--color-gold-dark));
        border-color: var(--color-gold);
        color: var(--color-black);
      }
      .now-nav-cta-arrow {
        transition: transform 280ms var(--ease-reveal);
        font-weight: 700;
      }
      .now-nav-cta:hover .now-nav-cta-arrow { transform: translateX(4px); }
      .now-nav-cta:focus-visible {
        outline: 2px solid var(--color-gold-light);
        outline-offset: 3px;
      }

      .now-nav-toggle {
        display: none;
        width: 40px;
        height: 40px;
        background: transparent;
        border: 1px solid rgba(201, 168, 76, 0.35);
        border-radius: 4px;
        padding: 0;
        cursor: pointer;
        position: relative;
      }
      .now-nav-toggle span {
        position: absolute;
        left: 50%;
        width: 18px;
        height: 1.5px;
        background: var(--color-gold-light);
        transform: translateX(-50%);
        transition: transform 280ms var(--ease-reveal), opacity 280ms ease-out, top 280ms ease-out;
      }
      .now-nav-toggle span:nth-child(1) { top: 13px; }
      .now-nav-toggle span:nth-child(2) { top: 19px; }
      .now-nav-toggle span:nth-child(3) { top: 25px; }
      .now-nav.open .now-nav-toggle span:nth-child(1) { top: 19px; transform: translateX(-50%) rotate(45deg); }
      .now-nav.open .now-nav-toggle span:nth-child(2) { opacity: 0; }
      .now-nav.open .now-nav-toggle span:nth-child(3) { top: 19px; transform: translateX(-50%) rotate(-45deg); }

      .now-nav-overlay {
        position: fixed;
        inset: 0;
        z-index: -1;
        background: rgba(14, 12, 10, 0.96);
        backdrop-filter: blur(20px);
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 48px;
        opacity: 0;
        pointer-events: none;
        transition: opacity 320ms ease-out;
      }
      .now-nav.open .now-nav-overlay {
        opacity: 1;
        pointer-events: auto;
      }
      .now-nav-overlay-links {
        list-style: none;
        padding: 0;
        margin: 0;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 24px;
      }
      .now-nav-overlay-link {
        font-family: var(--font-display);
        font-size: 28px;
        font-weight: 600;
        color: var(--color-text);
        text-decoration: none;
        transition: color 280ms ease-out;
      }
      .now-nav-overlay-link:hover { color: var(--color-gold); }
      .now-nav-overlay-cta {
        margin-top: 16px;
        display: inline-flex;
        align-items: center;
        gap: 10px;
        padding: 16px 32px;
        background: linear-gradient(135deg, var(--color-gold), var(--color-gold-dark));
        color: var(--color-black);
        font-family: var(--font-body);
        font-size: 15px;
        font-weight: 500;
        letter-spacing: 0.04em;
        text-decoration: none;
        border-radius: 4px;
        box-shadow: 0 0 24px rgba(201, 168, 76, 0.45);
      }

      @media (max-width: 960px) {
        .now-nav-links { display: none; }
        .now-nav-cta { display: none; }
        .now-nav-toggle { display: flex; align-items: center; justify-content: center; }
      }
      @media (max-width: 600px) {
        .now-nav-inner { padding: 14px 18px; }
        .now-wordmark-img { width: 38px; height: 38px; }
        /* Wordmark bleibt auf Mobile sichtbar — etwas kleiner & enger
           getrackt, damit's auch auf iPhone SE (320px) neben Logo + Burger
           passt. */
        .now-wordmark-text { font-size: 12px; letter-spacing: 0.16em; }
        .now-nav-overlay-link { font-size: 24px; }
      }
    `;
    document.head.appendChild(style);
  }
}
