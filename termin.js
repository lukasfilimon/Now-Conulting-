/* ============================================================
   TERMIN — Calendly-Kalender auf /termin/

   Laedt erst nach Klick auf "Kalender anzeigen". Hat jemand schon allen
   Cookies zugestimmt (consent_v1 = all), laedt er sofort.
   Vorher geht keine Verbindung zu calendly.com hinaus.

   Nach einer fertigen Buchung (calendly.event_scheduled) meldet die
   Seite einmal das Standardereignis Lead an Meta, aber nur, wenn der
   Pixel geladen ist, also nach Zustimmung und auf der echten Domain.
   Die eventID ist fuer eine spaetere Conversions API gedacht: Browser-
   und Server-Ereignis mit derselben ID zaehlt Meta als EINEN Lead.
   ============================================================ */
(function () {
  var box = document.getElementById('kalender');
  var knopf = document.getElementById('kalenderLaden');
  if (!box || !knopf) return;
  var url = box.getAttribute('data-calendly');
  var geladen = false, leadGemeldet = false;

  function laden() {
    if (geladen || !url) return;
    geladen = true;
    var hinweis = document.getElementById('kalenderHinweis');
    if (hinweis) hinweis.remove();
    box.classList.add('kalender--offen');

    var parameter = 'hide_gdpr_banner=1&background_color=181410&text_color=f2efe9&primary_color=c9a84c';
    var widget = document.createElement('div');
    widget.className = 'calendly-inline-widget';
    widget.setAttribute('data-url', url + (url.indexOf('?') < 0 ? '?' : '&') + parameter);
    widget.style.minWidth = '280px';
    widget.style.height = '700px';
    box.appendChild(widget);

    var skript = document.createElement('script');
    skript.src = 'https://assets.calendly.com/assets/external/widget.js';
    skript.async = true;
    document.head.appendChild(skript);

    window.addEventListener('message', function (e) {
      if (e.origin !== 'https://calendly.com') return;
      var d = e.data;
      if (typeof d === 'string') { try { d = JSON.parse(d); } catch (x) { return; } }
      if (!d || typeof d.event !== 'string') return;
      // Der Kalender waechst auf seine Inhaltshoehe, kein Scrollen im Rahmen.
      // Nie unter 650 px: waehrend Calendly laedt, meldet es kurz 26 px und
      // dann 2 px. Uebernommen liess das den Rahmen verschwinden, und in einem
      // 2 px hohen Rahmen baut Calendly den Kalender nie auf (Lukas, 13.11.2026).
      if (d.event === 'calendly.page_height' && d.payload && d.payload.height) {
        var h = parseInt(d.payload.height, 10);
        if (h > 0) widget.style.height = Math.max(650, h) + 'px';
        return;
      }
      if (d.event === 'calendly.event_scheduled' && !leadGemeldet) {
        leadGemeldet = true;
        if (typeof fbq === 'function') {
          var id = (window.crypto && crypto.randomUUID) ? crypto.randomUUID()
                 : 'lead-' + Date.now() + '-' + Math.random().toString(16).slice(2);
          fbq('track', 'Lead', { content_name: 'Erstgespräch', currency: 'EUR', value: 0 }, { eventID: id });
        }
      }
    });
  }

  knopf.addEventListener('click', laden);
  try { if (localStorage.getItem('consent_v1') === 'all') laden(); } catch (x) {}
  // Wer in der Cookie-Leiste zustimmt, bekommt den Kalender gleich mit.
  var zustimmen = document.getElementById('cookie-accept');
  if (zustimmen) zustimmen.addEventListener('click', laden);
})();
