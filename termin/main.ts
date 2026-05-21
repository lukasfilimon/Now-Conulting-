import { calendlyUrl, fallbackMailto } from '../src/content/copy';

/**
 * Buchungsseite /termin — bettet den Calendly-Kalender ein.
 *
 * Die URL kommt aus src/content/copy.ts (calendlyUrl). Ist sie leer, zeigt die
 * Seite einen Fallback (E-Mail-Anfrage), damit nichts kaputt aussieht, bevor der
 * Link gesetzt ist. Sobald du calendlyUrl in copy.ts einträgst, erscheint hier
 * automatisch der echte Kalender.
 */
const mount = document.getElementById('calendly-mount');

if (mount) {
  if (calendlyUrl) {
    // Calendly-Embed-Parameter: GDPR-Banner aus + Farben an das Branding angleichen.
    // (Farb-Parameter greifen nur in zahlpflichtigen Calendly-Plänen; sonst werden
    //  sie ignoriert und der Standard-Kalender wird im gefassten Rahmen angezeigt.)
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
