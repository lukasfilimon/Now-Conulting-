import { copy } from '../content/copy';

/**
 * Manifest section — cinematic word-by-word reveal of the brand thesis.
 * Uses a custom word-wrap + IntersectionObserver staggered reveal
 * (GSAP SplitText is a paid plugin, so we hand-roll the split).
 */
export class Manifest {
  readonly root: HTMLElement;
  private revealed = false;

  constructor(container: HTMLElement) {
    container.innerHTML = `
      <div class="manifest-wrap">
        ${copy.manifest.paragraphs
          .map((p) => `<p class="manifest-p">${this.splitWords(p)}</p>`)
          .join('')}
      </div>
    `;
    this.root = container.querySelector('.manifest-wrap') as HTMLElement;
    this.injectStyles();
    this.observe();
  }

  private splitWords(text: string): string {
    return text
      .split(/(\s+)/)
      .map((token, i) => {
        if (/^\s+$/.test(token)) return token;
        const safe = this.escape(token);
        return `<span class="manifest-w" style="--w-i:${i}">${safe}</span>`;
      })
      .join('');
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
            this.root.classList.add('reveal');
            io.disconnect();
          }
        }
      },
      { threshold: 0.25 },
    );
    io.observe(this.root);
  }

  private injectStyles(): void {
    if (document.getElementById('manifest-styles')) return;
    const style = document.createElement('style');
    style.id = 'manifest-styles';
    style.textContent = `
      .manifest-wrap {
        max-width: 920px;
        margin: 0 auto;
        padding: 0 32px;
        color: var(--color-text);
        display: flex;
        flex-direction: column;
        gap: 32px;
      }
      .manifest-p {
        font-family: var(--font-display);
        font-weight: 400;
        font-size: clamp(1.45rem, 2.4vw, 2.2rem);
        line-height: 1.45;
        letter-spacing: -0.005em;
        margin: 0;
        text-wrap: balance;
      }
      .manifest-p:nth-child(2) {
        /* "NOW schließt diese Lücke." — set apart visually */
        font-style: italic;
        color: var(--color-gold);
        font-size: clamp(1.6rem, 2.7vw, 2.5rem);
        font-weight: 500;
      }
      .manifest-w {
        display: inline-block;
        opacity: 0;
        transform: translateY(18px);
        transition: opacity 800ms cubic-bezier(0.16, 1, 0.3, 1),
                    transform 800ms cubic-bezier(0.16, 1, 0.3, 1);
        transition-delay: calc(var(--w-i, 0) * 14ms);
      }
      .manifest-wrap.reveal .manifest-w {
        opacity: 1;
        transform: translateY(0);
      }
      @media (max-width: 768px) {
        .manifest-wrap { padding: 0 24px; gap: 24px; }
        .manifest-p { font-size: 1.25rem; line-height: 1.5; }
        .manifest-p:nth-child(2) { font-size: 1.35rem; }
      }
    `;
    document.head.appendChild(style);
  }
}
