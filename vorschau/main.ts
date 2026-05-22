import { Navigation } from '../src/ui/Navigation';
import { HeroContent } from '../src/ui/HeroContent';

/**
 * Vorschauseite /vorschau — zeigt NUR den Hero mit der neuen "Luxus-Masthead"-
 * Variante des Schriftzugs "NOW CONSULTING", isoliert von der Live-Homepage.
 *
 * Die echte Homepage (index.html, src/ui/HeroContent.ts) bleibt unverändert.
 * Hier werden die ECHTEN Komponenten (Navigation + HeroContent) gemountet, damit
 * die Vorschau 1:1 dem späteren Ergebnis entspricht — der Masthead-Look kommt
 * ausschließlich aus dem Override-<style> unten (kein WebGL/Scroll nötig).
 */

// Echte Navigation (fixed, hängt sich selbst an <body>, inkl. NOW-Logo)
new Navigation();

// Echter Hero-Inhalt (Marke + Headline + Video + CTA) in #hero-root
const root = document.getElementById('hero-root');
if (root) {
  const hero = new HeroContent(root);
  hero.reveal();
}

// ── Masthead-Override (NUR Vorschau) ──────────────────────────────────────
// Wird NACH HeroContent.injectStyles() an <head> angehängt → gewinnt bei
// gleicher Spezifität ohne !important.
// PORT ME → diese Deklarationen 1:1 in die .hero-brand-Regeln in
// src/ui/HeroContent.ts übertragen, sobald du den Look abgenommen hast.
const masthead = document.createElement('style');
masthead.id = 'vorschau-masthead-override';
masthead.textContent = `
  .hero-brand {
    font-weight: 400;
    letter-spacing: 0.5em;
    text-indent: 0.5em;
    font-size: clamp(1.5rem, 2.6vw, 2.1rem);
    margin-bottom: clamp(16px, 2vw, 26px);
  }
  .hero-brand-rest { color: var(--color-gold-light); }
  .hero-brand::after { width: min(18em, 58%); }
  @media (max-width: 768px) {
    .hero-brand {
      font-size: clamp(1.15rem, 5vw, 1.6rem);
      letter-spacing: 0.3em;
      text-indent: 0.3em;
    }
  }
`;
document.head.appendChild(masthead);
