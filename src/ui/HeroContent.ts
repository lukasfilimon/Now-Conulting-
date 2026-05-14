import { copy, cta } from '../content/copy';

export class HeroContent {
  readonly root: HTMLElement;
  private headlineEl: HTMLElement;
  private subEl: HTMLElement;
  private ctaEl: HTMLAnchorElement;
  private eyebrowEl: HTMLElement;
  private revealed = false;

  constructor(container: HTMLElement) {
    container.innerHTML = `
      <div class="hero-overlay">
        <div class="hero-eyebrow">
          <span class="hero-eyebrow-mark">◈</span>
          <span class="hero-eyebrow-text">${copy.hero.eyebrow}</span>
        </div>
        <h1 class="hero-headline">${this.renderHeadline()}</h1>
        <p class="hero-sub">${copy.hero.sub}</p>
        <a class="hero-cta" href="${cta.primaryHref}"${cta.isCalendly ? ' target="_blank" rel="noopener"' : ''}>
          <span class="hero-cta-label">${cta.primaryLabel}</span>
          <span class="hero-cta-arrow">→</span>
        </a>
        <div class="hero-scroll-hint">
          <span class="hero-scroll-label">SCROLL</span>
          <span class="hero-scroll-line"></span>
        </div>
      </div>
    `;
    this.root = container.querySelector('.hero-overlay') as HTMLElement;
    this.eyebrowEl = container.querySelector('.hero-eyebrow') as HTMLElement;
    this.headlineEl = container.querySelector('.hero-headline') as HTMLElement;
    this.subEl = container.querySelector('.hero-sub') as HTMLElement;
    this.ctaEl = container.querySelector('.hero-cta') as HTMLAnchorElement;
    this.injectStyles();
    this.bindMagneticHover();
  }

  private renderHeadline(): string {
    return copy.hero.headlineParts
      .map((part) => {
        if (typeof part === 'string') return this.escape(part);
        return `<em class="hero-headline-em">${this.escape(part.text)}</em>`;
      })
      .join('');
  }

  private escape(text: string): string {
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }

  private bindMagneticHover(): void {
    const cta = this.ctaEl;
    const strength = 0.25;
    const onMove = (e: MouseEvent) => {
      const rect = cta.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;
      cta.style.transform = `translate(${x * strength}px, ${y * strength}px)`;
    };
    const onLeave = () => {
      cta.style.transform = 'translate(0, 0)';
    };
    cta.addEventListener('mousemove', onMove);
    cta.addEventListener('mouseleave', onLeave);
  }

  reveal(): void {
    if (this.revealed) return;
    this.revealed = true;
    this.eyebrowEl.classList.add('reveal');
    setTimeout(() => this.headlineEl.classList.add('reveal'), 200);
    setTimeout(() => this.subEl.classList.add('reveal'), 1100);
    setTimeout(() => this.ctaEl.classList.add('reveal'), 1400);
  }

  setProgress(p: number): void {
    // Hero overlay stays full until 0.35, then fades out by 0.85
    const fade = p < 0.35 ? 1 : Math.max(0, 1 - (p - 0.35) / 0.5);
    this.root.style.setProperty('--hero-opacity', fade.toFixed(3));
    this.root.style.setProperty('--hero-shift', `${p * 80}px`);
  }

  private injectStyles(): void {
    if (document.getElementById('hero-overlay-styles')) return;
    const style = document.createElement('style');
    style.id = 'hero-overlay-styles';
    style.textContent = `
      .hero-overlay {
        position: relative;
        width: 100%;
        min-height: 100vh;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 28px;
        padding: 0 24px;
        text-align: center;
        opacity: var(--hero-opacity, 1);
        transform: translateY(calc(var(--hero-shift, 0px) * -1));
        will-change: opacity, transform;
        pointer-events: none;
      }
      .hero-eyebrow {
        display: inline-flex;
        align-items: center;
        gap: 10px;
        background: rgba(201, 168, 76, 0.10);
        border: 1px solid var(--color-border);
        border-radius: 100px;
        padding: 8px 22px;
        font-family: var(--font-mono);
        font-size: 11px;
        font-weight: 600;
        letter-spacing: 0.32em;
        text-transform: uppercase;
        color: var(--color-gold);
        backdrop-filter: blur(6px);
        opacity: 0;
        transform: translateY(-12px);
        transition: opacity 900ms ease-out, transform 900ms ease-out;
      }
      .hero-eyebrow.reveal { opacity: 1; transform: translateY(0); }
      .hero-eyebrow-mark { font-size: 13px; line-height: 1; }

      .hero-headline {
        font-family: var(--font-display);
        font-weight: 600;
        font-size: clamp(2rem, 4.4vw, 3.9rem);
        line-height: 1.15;
        letter-spacing: -0.005em;
        color: var(--color-text);
        margin: 0;
        max-width: min(1080px, 92vw);
        text-wrap: balance;
        text-shadow: 0 0 60px rgba(201, 168, 76, 0.14);
        opacity: 0;
        transform: translateY(24px);
        transition: opacity 1100ms cubic-bezier(0.16, 1, 0.3, 1),
                    transform 1100ms cubic-bezier(0.16, 1, 0.3, 1);
      }
      .hero-headline.reveal {
        opacity: 1;
        transform: translateY(0);
      }
      .hero-headline-em {
        font-style: italic;
        color: var(--color-gold);
        font-weight: 600;
      }

      .hero-sub {
        font-family: var(--font-body);
        font-size: clamp(15px, 1.15vw, 18px);
        font-weight: 400;
        line-height: 1.65;
        color: var(--color-text-muted);
        max-width: 700px;
        margin: 0;
        opacity: 0;
        transform: translateY(20px);
        transition: opacity 900ms ease-out, transform 900ms ease-out;
      }
      .hero-sub.reveal {
        opacity: 1;
        transform: translateY(0);
      }

      .hero-cta {
        pointer-events: auto;
        display: inline-flex;
        align-items: center;
        gap: 14px;
        padding: 18px 44px;
        border: none;
        border-radius: 4px;
        background: linear-gradient(135deg, var(--color-gold), var(--color-gold-dark));
        color: var(--color-black);
        font-family: var(--font-body);
        font-size: 14px;
        font-weight: 600;
        letter-spacing: 0.18em;
        text-transform: uppercase;
        text-decoration: none;
        cursor: pointer;
        box-shadow: 0 0 18px rgba(201, 168, 76, 0.28),
                    0 4px 16px rgba(201, 168, 76, 0.18);
        transition: background 400ms cubic-bezier(0.16, 1, 0.3, 1),
                    box-shadow 400ms cubic-bezier(0.16, 1, 0.3, 1);
        opacity: 0;
        margin-top: 8px;
        will-change: transform;
      }
      .hero-cta.reveal {
        opacity: 1;
      }
      .hero-cta:hover {
        background: linear-gradient(135deg, var(--color-gold-light), var(--color-gold));
        box-shadow: 0 0 36px rgba(201, 168, 76, 0.55),
                    0 8px 32px rgba(201, 168, 76, 0.35);
      }
      .hero-cta:focus-visible {
        outline: 2px solid var(--color-gold-light);
        outline-offset: 6px;
      }
      .hero-cta-arrow {
        transition: transform 400ms cubic-bezier(0.16, 1, 0.3, 1);
        font-weight: 700;
      }
      .hero-cta:hover .hero-cta-arrow {
        transform: translateX(6px);
      }
      .hero-scroll-hint {
        position: absolute;
        bottom: max(28px, env(safe-area-inset-bottom, 0px) + 20px);
        left: 50%;
        transform: translateX(-50%);
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 12px;
        opacity: 0.5;
      }
      @media (max-height: 760px) {
        .hero-scroll-hint { display: none; }
      }
      .hero-scroll-label {
        font-family: var(--font-mono);
        font-size: 10px;
        letter-spacing: 0.4em;
        color: var(--color-gold);
      }
      .hero-scroll-line {
        width: 1px;
        height: 56px;
        background: linear-gradient(180deg,
          transparent 0%,
          var(--color-gold) 50%,
          transparent 100%);
        animation: scroll-pulse 2.4s ease-in-out infinite;
      }
      @keyframes scroll-pulse {
        0%, 100% { opacity: 0.3; transform: scaleY(0.6); }
        50% { opacity: 1; transform: scaleY(1); }
      }

      @media (max-width: 768px) {
        .hero-overlay { gap: 20px; padding: 0 20px; }
        .hero-headline { font-size: clamp(1.65rem, 8vw, 2.4rem); line-height: 1.2; }
        .hero-sub { font-size: 15px; }
        .hero-cta { padding: 16px 32px; font-size: 13px; }
      }
    `;
    document.head.appendChild(style);
  }
}
