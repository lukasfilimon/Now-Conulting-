import { copy, cta } from '../content/copy';

const VIMEO_BASE = 'https://player.vimeo.com/video/1192498083?badge=0&autopause=1&player_id=0&app_id=58479&title=0&byline=0&portrait=0&dnt=1&color=c9a84c&playsinline=1';
const VIMEO_INITIAL = `${VIMEO_BASE}&autoplay=1&muted=1&controls=0&loop=1&keyboard=0&pip=0`;
const VIMEO_ENGAGED = `${VIMEO_BASE}&autoplay=1&muted=0&controls=1&loop=0&keyboard=1&pip=1#t=0s`;

export class HeroContent {
  readonly root: HTMLElement;
  private headlineEl: HTMLElement;
  private subEl: HTMLElement;
  private ctaEl: HTMLAnchorElement;
  private ctaTrustEl: HTMLElement;
  private videoColEl: HTMLElement;
  private videoFrameEl: HTMLElement;
  private videoPlayEl: HTMLButtonElement;
  private videoIframeEl: HTMLIFrameElement;
  private revealed = false;

  constructor(container: HTMLElement) {
    container.innerHTML = `
      <div class="hero-overlay">
        <div class="hero-grid">
          <div class="hero-text">
            <h1 class="hero-headline">${this.renderHeadline()}</h1>
            <p class="hero-sub">${copy.hero.sub}</p>
            <div class="hero-cta-group">
              <a class="hero-cta" href="${cta.primaryHref}"${cta.isCalendly ? ' target="_blank" rel="noopener"' : ''}>
                <span class="hero-cta-label">${cta.primaryLabel}</span>
                <span class="hero-cta-arrow">→</span>
              </a>
              <div class="hero-cta-trust">
                <span>Kostenlos</span>
                <span class="hero-cta-trust-dot" aria-hidden="true">·</span>
                <span>Unverbindlich</span>
              </div>
            </div>
          </div>
          <div class="hero-video">
            <div class="hero-video-frame">
              <iframe
                class="hero-video-iframe"
                src="${VIMEO_INITIAL}"
                frameborder="0"
                allow="autoplay; fullscreen; picture-in-picture; clipboard-write; encrypted-media; web-share"
                referrerpolicy="strict-origin-when-cross-origin"
                title="Matrix Trailer"
              ></iframe>
              <button class="hero-video-play" type="button" aria-label="Trailer abspielen">
                <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M8 5v14l11-7z"/>
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    `;
    this.root = container.querySelector('.hero-overlay') as HTMLElement;
    this.headlineEl = container.querySelector('.hero-headline') as HTMLElement;
    this.subEl = container.querySelector('.hero-sub') as HTMLElement;
    this.ctaEl = container.querySelector('.hero-cta') as HTMLAnchorElement;
    this.ctaTrustEl = container.querySelector('.hero-cta-trust') as HTMLElement;
    this.videoColEl = container.querySelector('.hero-video') as HTMLElement;
    this.videoFrameEl = container.querySelector('.hero-video-frame') as HTMLElement;
    this.videoPlayEl = container.querySelector('.hero-video-play') as HTMLButtonElement;
    this.videoIframeEl = container.querySelector('.hero-video-iframe') as HTMLIFrameElement;
    this.injectStyles();
    this.bindMagneticHover();
    this.bindVideoPlay();
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
    let lastTrail = 0;
    const onMove = (e: MouseEvent) => {
      const rect = cta.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;
      cta.style.transform = `translate(${x * strength}px, ${y * strength}px)`;

      // Gold trail: spawn one dot every ~45ms, max ~22/sec
      const now = performance.now();
      if (now - lastTrail > 45) {
        lastTrail = now;
        this.spawnCtaTrailDot(e.clientX - rect.left, e.clientY - rect.top);
      }
    };
    const onLeave = () => {
      cta.style.transform = 'translate(0, 0)';
    };
    cta.addEventListener('mousemove', onMove);
    cta.addEventListener('mouseleave', onLeave);
  }

  private spawnCtaTrailDot(x: number, y: number): void {
    const dot = document.createElement('span');
    dot.className = 'hero-cta-trail-dot';
    dot.style.left = `${x}px`;
    dot.style.top = `${y}px`;
    this.ctaEl.appendChild(dot);
    setTimeout(() => dot.remove(), 760);
  }

  private bindVideoPlay(): void {
    this.videoPlayEl.addEventListener('click', () => {
      // Swap iframe to engaged URL → restarts from 0, sound on, controls visible
      this.videoIframeEl.src = VIMEO_ENGAGED;
      this.videoPlayEl.style.display = 'none';
    });
  }

  reveal(): void {
    if (this.revealed) return;
    this.revealed = true;
    // Straffer als zuvor (0/600/1100/1400/1700) — landet ~400ms
    // schneller in der Endpose ohne den Premium-Pace zu verlieren.
    this.headlineEl.classList.add('reveal');
    setTimeout(() => this.videoColEl.classList.add('reveal'), 450);
    setTimeout(() => this.subEl.classList.add('reveal'), 750);
    setTimeout(() => this.ctaEl.classList.add('reveal'), 1000);
    setTimeout(() => this.ctaTrustEl.classList.add('reveal'), 1300);
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
        min-height: auto;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 12px;
        padding: 128px 0 48px;
        opacity: var(--hero-opacity, 1);
        transform: translateY(calc(var(--hero-shift, 0px) * -1));
        will-change: opacity, transform;
        pointer-events: none;
        isolation: isolate;
      }
      .hero-overlay::before {
        content: '';
        position: absolute;
        inset: 0;
        pointer-events: none;
        z-index: -2;
        background-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160' viewBox='0 0 160 160'><g font-family='monospace' font-size='12' fill='%23c9a84c'><text x='12' y='22' opacity='0.55'>01</text><text x='62' y='40' opacity='0.4'>10</text><text x='110' y='58' opacity='0.5'>01</text><text x='28' y='80' opacity='0.45'>11</text><text x='90' y='100' opacity='0.5'>00</text><text x='14' y='122' opacity='0.4'>10</text><text x='118' y='140' opacity='0.5'>01</text><text x='62' y='150' opacity='0.4'>11</text></g></svg>");
        background-size: 320px 320px;
        background-repeat: repeat;
        opacity: 0.04;
        -webkit-mask-image: linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(0,0,0,1) 20%, rgba(0,0,0,1) 80%, rgba(0,0,0,0) 100%);
        mask-image: linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(0,0,0,1) 20%, rgba(0,0,0,1) 80%, rgba(0,0,0,0) 100%);
      }
      .hero-overlay::after {
        content: '';
        position: absolute;
        inset: 0;
        pointer-events: none;
        z-index: -2;
        background: radial-gradient(60% 55% at 50% 50%, rgba(201, 168, 76, 0.14), transparent 70%);
      }


      .hero-grid {
        display: grid;
        grid-template-columns: minmax(0, 1fr) minmax(0, 1.1fr);
        gap: clamp(32px, 5vw, 80px);
        align-items: center;
        width: 100%;
        max-width: 1280px;
        padding: 0 clamp(24px, 4vw, 64px);
      }
      .hero-text {
        display: flex;
        flex-direction: column;
        align-items: flex-start;
        gap: 24px;
        text-align: left;
      }

      .hero-eyebrow {
        display: inline-flex;
        align-items: center;
        gap: 10px;
        align-self: flex-start;
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
        font-size: clamp(1.49rem, 2.89vw, 2.72rem);
        line-height: 1.15;
        letter-spacing: -0.005em;
        color: var(--color-text);
        margin: 0;
        max-width: 100%;
        text-align: left;
        text-wrap: balance;
        text-shadow: 0 0 60px rgba(201, 168, 76, 0.14);
        opacity: 0;
        transform: translateY(24px);
        transition: opacity 1100ms var(--ease-reveal),
                    transform 1100ms var(--ease-reveal);
      }
      .hero-headline.reveal {
        opacity: 1;
        transform: translateY(0);
      }
      .hero-headline-em {
        font-style: italic;
        font-weight: 600;
        background: linear-gradient(
          100deg,
          var(--color-gold) 0%,
          var(--color-gold) 38%,
          var(--color-gold-light) 48%,
          #fbeec4 52%,
          var(--color-gold-light) 56%,
          var(--color-gold) 66%,
          var(--color-gold) 100%
        );
        background-size: 220% 100%;
        background-position: 220% 0;
        -webkit-background-clip: text;
        background-clip: text;
        color: transparent;
        -webkit-text-fill-color: transparent;
        animation: hero-shimmer 7.5s ease-in-out infinite;
      }
      @keyframes hero-shimmer {
        0%, 12% { background-position: 220% 0; }
        55%, 100% { background-position: -120% 0; }
      }
      @media (prefers-reduced-motion: reduce) {
        .hero-headline-em { animation: none; }
      }

      .hero-sub {
        font-family: var(--font-body);
        font-size: clamp(15px, 1.15vw, 18px);
        font-weight: 400;
        line-height: 1.65;
        color: var(--color-text-muted);
        max-width: none;
        text-align: left;
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
        font-size: 15px;
        font-weight: 500;
        letter-spacing: 0.04em;
        text-decoration: none;
        cursor: pointer;
        box-shadow: 0 0 18px rgba(201, 168, 76, 0.28),
                    0 4px 16px rgba(201, 168, 76, 0.18);
        transition: background 400ms var(--ease-reveal),
                    box-shadow 400ms var(--ease-reveal);
        opacity: 0;
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
        transition: transform 400ms var(--ease-reveal);
        font-weight: 700;
      }
      .hero-cta:hover .hero-cta-arrow {
        transform: translateX(6px);
      }
      .hero-cta { position: relative; }
      .hero-cta-trail-dot {
        position: absolute;
        width: 8px;
        height: 8px;
        border-radius: 50%;
        background: radial-gradient(circle, rgba(255, 235, 165, 0.95), rgba(226, 201, 122, 0.4) 45%, transparent 75%);
        pointer-events: none;
        transform: translate(-50%, -50%);
        animation: hero-cta-trail 760ms var(--ease-reveal) forwards;
      }
      @keyframes hero-cta-trail {
        0%   { opacity: 0.95; transform: translate(-50%, -50%) scale(1); }
        100% { opacity: 0;    transform: translate(-50%, -50%) scale(0.2); }
      }
      @media (prefers-reduced-motion: reduce) {
        .hero-cta-trail-dot { display: none; }
      }

      .hero-cta-group {
        display: inline-flex;
        flex-direction: column;
        align-items: center;
        gap: 10px;
        margin-top: 8px;
      }
      .hero-cta-trust {
        display: inline-flex;
        align-items: center;
        gap: 12px;
        font-family: var(--font-body);
        font-size: 13px;
        font-weight: 400;
        letter-spacing: 0.02em;
        color: rgba(201, 168, 76, 0.72);
        opacity: 0;
        transform: translateY(8px);
        transition: opacity 800ms var(--ease-reveal),
                    transform 800ms var(--ease-reveal);
      }
      .hero-cta-trust.reveal {
        opacity: 1;
        transform: translateY(0);
      }
      .hero-cta-trust-dot { color: rgba(201, 168, 76, 0.3); }

      .hero-video {
        display: flex;
        flex-direction: column;
        gap: 16px;
        opacity: 0;
        transform: translateY(24px);
        transition: opacity 1100ms var(--ease-reveal) 200ms,
                    transform 1100ms var(--ease-reveal) 200ms;
      }
      .hero-video.reveal {
        opacity: 1;
        transform: translateY(0);
      }
      .hero-video-frame {
        position: relative;
        width: 100%;
        aspect-ratio: 16 / 9;
        border: 1px solid rgba(201, 168, 76, 0.35);
        border-radius: 8px;
        overflow: hidden;
        background:
          radial-gradient(120% 80% at 50% 40%, rgba(201, 168, 76, 0.10), transparent 60%),
          linear-gradient(180deg, #1a1612 0%, #0a0806 100%);
        box-shadow:
          0 0 60px rgba(201, 168, 76, 0.18),
          inset 0 0 60px rgba(201, 168, 76, 0.06);
        pointer-events: auto;
      }
      .hero-video-iframe {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        border: 0;
        display: block;
      }
      .hero-video-play {
        position: absolute;
        inset: 0;
        margin: auto;
        width: 108px;
        height: 76px;
        border: 1px solid rgba(201, 168, 76, 0.55);
        border-radius: 14px;
        background: rgba(201, 168, 76, 0.38);
        color: rgba(14, 12, 10, 0.92);
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        box-shadow: 0 10px 36px rgba(0, 0, 0, 0.4),
                    0 0 24px rgba(201, 168, 76, 0.28);
        transition: background 280ms var(--ease-reveal),
                    transform 280ms var(--ease-reveal),
                    box-shadow 280ms var(--ease-reveal),
                    border-color 280ms var(--ease-reveal);
        z-index: 2;
      }
      .hero-video-play:hover {
        background: rgba(201, 168, 76, 0.72);
        border-color: rgba(201, 168, 76, 0.9);
        transform: scale(1.04);
        box-shadow: 0 14px 48px rgba(0, 0, 0, 0.45),
                    0 0 40px rgba(201, 168, 76, 0.5);
      }
      .hero-video-play svg {
        width: 26px;
        height: 26px;
        margin-left: 3px;
      }
      .hero-video-placeholder-label {
        position: absolute;
        bottom: 18px;
        left: 50%;
        transform: translateX(-50%);
        font-family: var(--font-body);
        font-size: 12px;
        font-weight: 400;
        letter-spacing: 0.02em;
        color: rgba(201, 168, 76, 0.55);
        pointer-events: none;
      }
      .hero-video-caption {
        font-family: var(--font-body);
        font-size: 13px;
        font-weight: 400;
        letter-spacing: 0.02em;
        color: var(--color-text-muted);
        margin: 0;
        text-align: center;
      }

      @media (max-width: 960px) {
        .hero-overlay { padding: 112px 0 32px; }
        .hero-grid {
          display: flex;
          flex-direction: column;
          align-items: stretch;
          gap: 32px;
          padding: 0;
        }
        .hero-text {
          display: contents;
        }
        .hero-headline { order: 1; padding: 0 20px; text-align: center; }
        .hero-video    { order: 2; gap: 18px; }
        .hero-sub      { order: 3; padding: 0 20px; text-align: center; }
        .hero-cta-group { order: 4; align-self: center; padding: 0 20px; }
        .hero-video-frame {
          border-radius: 0;
          border-left: none;
          border-right: none;
        }
        .hero-video-caption { padding: 0 20px; }
      }

      @media (max-width: 768px) {
        .hero-overlay { gap: 10px; }
        .hero-headline { font-size: clamp(1.4rem, 6.8vw, 2.04rem); line-height: 1.2; }
        .hero-sub { font-size: 15px; }
        .hero-cta { padding: 16px 32px; font-size: 13px; }
      }
      @media (max-width: 600px) {
        .hero-cta-trust { font-size: 9px; gap: 8px; letter-spacing: 0.28em; }
        .hero-overlay::after { background: radial-gradient(80% 40% at 50% 75%, rgba(201, 168, 76, 0.12), transparent 70%); }
      }
    `;
    document.head.appendChild(style);
  }
}
