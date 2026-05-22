import { Navigation } from '../src/ui/Navigation';
import { Footer } from '../src/sections/Footer';
import { calendlyUrl, fallbackMailto } from '../src/content/copy';

/**
 * Buchungsseite /termin — bettet den Calendly-Kalender ein.
 *
 * Nutzt 1:1 dieselbe Navigation und denselben Footer (Impressum/Datenschutz/AGB)
 * wie die Hauptseite, indem die echten Komponenten wiederverwendet werden — keine
 * Three.js/GSAP-Abhängigkeit, daher lädt die Seite schnell.
 *
 * Die Calendly-URL kommt aus src/content/copy.ts (calendlyUrl). Ist sie leer, zeigt
 * die Seite einen Fallback (E-Mail-Anfrage), damit nichts kaputt aussieht. Sobald du
 * calendlyUrl in copy.ts einträgst, erscheint hier automatisch der echte Kalender.
 */

// 1:1 Navigation (hängt sich selbst an <body>, fixed oben). Nav-Links zeigen auf
// /#section-x → führen von hier zurück auf die Hauptseite zur jeweiligen Section.
new Navigation();

// 1:1 Footer in die Footer-Section (gold Hairline + Glow greifen via [data-section="footer"]).
const footerSection = document.getElementById('footer-section');
if (footerSection) new Footer(footerSection);

// Calendly-Einbettung
const mount = document.getElementById('calendly-mount');

if (mount) {
  if (calendlyUrl) {
    // GDPR-Banner aus + Farben an das Branding angleichen (Farb-Parameter greifen nur
    // in zahlpflichtigen Calendly-Plänen; sonst Standard-Kalender im gefassten Rahmen).
    const sep = calendlyUrl.includes('?') ? '&' : '?';
    const params = 'hide_gdpr_banner=1&background_color=0e0c0a&text_color=f2efe9&primary_color=c9a84c';
    const url = `${calendlyUrl}${sep}${params}`;

    const widget = document.createElement('div');
    widget.className = 'calendly-inline-widget';
    widget.setAttribute('data-url', url);
    widget.style.minWidth = '320px';
    widget.style.width = '100%';
    widget.style.height = '100%';
    mount.style.height = getComputedStyle(mount).minHeight;
    mount.appendChild(widget);

    const script = document.createElement('script');
    script.src = 'https://assets.calendly.com/assets/external/widget.js';
    script.async = true;
    document.head.appendChild(script);
  } else {
    mount.innerHTML = `
      <div class="termin-fallback">
        <p>Der Online-Kalender wird in Kürze aktiviert.</p>
        <a class="termin-fallback-cta" href="${fallbackMailto}">Termin per E-Mail anfragen</a>
      </div>
    `;
  }
}
