import { Navigation } from '../src/ui/Navigation';
import { HeroContent } from '../src/ui/HeroContent';

/**
 * Vorschauseite /vorschau — zeigt NUR den Hero mit der neuen "Luxus-Masthead"-
 * Variante des Schriftzugs "NOW CONSULTING", isoliert von der Live-Homepage.
 *
 * Mountet die ECHTEN Komponenten (Navigation + HeroContent) auf statischem
 * Gold-Glow-Hintergrund — eine isolierte Vorschau des Hero ohne WebGL/Scroll,
 * ideal für künftige Design-Experimente.
 */

// Echte Navigation (fixed, hängt sich selbst an <body>, inkl. NOW-Logo)
new Navigation();

// Echter Hero-Inhalt (Marke + Headline + Video + CTA) in #hero-root
const root = document.getElementById('hero-root');
if (root) {
  const hero = new HeroContent(root);
  hero.reveal();
}

// Keine Overrides mehr — der Masthead-Look lebt jetzt direkt in
// HeroContent.ts. Für künftige Experimente hier ein <style> injizieren.
