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
    // Start-Höhe; wird gleich per Calendly-Resize-Nachricht an die echte
    // Inhaltshöhe angepasst.
    widget.style.height = '1100px';
    mount.appendChild(widget);

    // EIN Message-Listener für ALLE Calendly-Events (Höhe + Lead-Tracking).
    // Ein einziger Listener + ein Origin-Check → kein Doppelfeuer durch mehrere
    // Listener. Sowohl page_height als auch event_scheduled kommen vom
    // Buchungs-iframe unter https://calendly.com.
    let leadFired = false; // Guard: Lead feuert max. 1x pro Page-Load.
    window.addEventListener('message', (e: MessageEvent) => {
      // Origin-Check exakt auf https://calendly.com — kein Wildcard, nicht umgehbar.
      if (e.origin !== 'https://calendly.com') return;

      let data: { event?: string; payload?: { height?: string } };
      try {
        data = typeof e.data === 'string' ? JSON.parse(e.data) : e.data;
      } catch {
        return;
      }
      if (!data || typeof data.event !== 'string') return;

      // 1) Höhe: Kalender wächst auf Inhaltshöhe (kein Innen-Scroll).
      if (data.event === 'calendly.page_height' && data.payload?.height) {
        widget.style.height = data.payload.height;
        return;
      }

      // 2) Lead: feuert EXAKT bei finaler Buchungs-Bestätigung — nicht bei
      //    PageView, Widget-Öffnen oder Terminauswahl, sondern erst wenn
      //    Calendly die Buchung abgeschlossen meldet. Nur einmal pro Load.
      if (data.event === 'calendly.event_scheduled' && !leadFired) {
        leadFired = true;
        // Eindeutige Event-ID → spätere CAPI-Deduplizierung: Browser-Pixel und
        // Server-Event mit derselben eventID werden von Meta als EIN Lead gewertet.
        const eventId =
          typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
            ? crypto.randomUUID()
            : `lead-${Date.now()}-${Math.random().toString(16).slice(2)}`;

        window.fbq?.(
          'track',
          'Lead',
          { content_name: 'Klarheitsgespräch', currency: 'EUR', value: 0 },
          { eventID: eventId },
        );
      }
    });

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

// Der Meta Pixel wird global via Inline-Script im <head> geladen (window.fbq).
// Hier nur die Typ-Deklaration, damit TypeScript fbq kennt.
declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void;
  }
}
