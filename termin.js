/* ============================================================
   TERMIN — Calendly-Kalender auf /termin/
   Nach dem NOW-Erstgespraech-Kit (now-anleitungs-hub,
   Erstgespraech-Landingpage/Landingpage-Baukasten: LEKTIONEN.md
   Lektion 3 und 4, TRACKING.md Abschnitt 3 und 5). Aenderungen dort
   hier mitziehen.

   - Vor der Zustimmung laedt NICHTS von calendly.com. Im Kasten steht
     der Platzhalter (.media-consent): "Kalender laden" stimmt zu
     (acceptAll aus kern.js), der Direkt-Link bucht ohne Einbettung.
   - loadCalendly() baut das iframe selbst, ohne widget.js, mit
     embed_domain (sonst schickt Calendly keine Nachrichten), ohne
     eigenen Kasten. Startwert 660 px, danach meldet Calendly die Hoehe.
   - Nach der Buchung (calendly.event_scheduled): NOW_LEAD + Lead mit
     derselben eventID, ohne value/currency, dann weiter auf /danke/.
   ============================================================ */
(function () {
  'use strict';
  var box = document.getElementById('calendly-embed');
  if (!box) return;
  var url = box.getAttribute('data-calendly');
  // Akzentfarbe fuer buchbare Tage und Knoepfe (sechs Hex-Stellen, ohne #).
  // Dunkles Gold: weisse Schrift darauf bleibt gut lesbar.
  var AKZENT = '8a6a1e';
  // Die dunkle Fassung der Webseite faerbt den Kalender dunkel ein; die
  // helle nutzt Calendlys eigene weisse Karte (Kit: nur primary_color).
  var DUNKEL = !document.body.classList.contains('hell');

  function zugestimmt() { try { return localStorage.getItem('consent_v1') === 'all'; } catch (e) { return false; } }

  function loadCalendly() {
    if (!url || box.querySelector('iframe')) return;      // nur einmal
    var ph = box.querySelector('.media-consent');
    if (ph) ph.remove();
    box.style.height = '660px';                           // Startwert UND Rueckfallebene

    var ifr = document.createElement('iframe');
    ifr.src = url
      + '?embed_domain=' + encodeURIComponent(location.host)
      + '&embed_type=Inline'
      + '&hide_event_type_details=1&hide_gdpr_banner=1&primary_color=' + (DUNKEL ? 'c9a84c' : AKZENT)
      + (DUNKEL ? '&background_color=181410&text_color=f2efe9' : '');
    ifr.title = 'Termin für dein Erstgespräch buchen';
    ifr.style.cssText = 'width:100%;height:100%;border:0;display:block;';
    box.appendChild(ifr);
  }

  function daten(e) {
    if (e.origin !== 'https://calendly.com') return null;     // Origin-Check, kein Wildcard
    var d = e.data;
    if (typeof d === 'string') { try { d = JSON.parse(d); } catch (x) { return null; } }
    return d && typeof d.event === 'string' ? d : null;
  }

  // Hoehe von Calendly melden lassen, nicht raten. Beim Laden kommen
  // Zwischenwerte wie 2 px und 26 px: alles unter 300 px ignorieren.
  window.addEventListener('message', function (e) {
    var d = daten(e);
    if (!d || d.event !== 'calendly.page_height') return;
    var h = parseInt(d.payload && d.payload.height, 10);
    if (!h || h < 300) return;
    box.style.height = (h + 8) + 'px';                    // +8 px Puffer (Absenden-Knopf)
  });

  // NOW-Ziel-Event: genau einmal pro Buchung, nur mit geladenem Pixel
  var nowEventFired = false;
  function fireNowConversion() {
    if (nowEventFired) return;
    if (typeof fbq !== 'function') return;
    nowEventFired = true;
    var eventId = (window.crypto && crypto.randomUUID)
      ? crypto.randomUUID()
      : 'now-' + Date.now() + '-' + Math.random().toString(16).slice(2);
    var data = { content_name: 'erstgespraech', content_category: 'now_erstgespraech' };
    fbq('trackCustom', 'NOW_LEAD', data, { eventID: eventId });   // Ziel-Event (Kampagne)
    fbq('track', 'Lead', data, { eventID: eventId });             // Standard-Signal
  }
  window.addEventListener('message', function (e) {
    var d = daten(e);
    if (!d || d.event !== 'calendly.event_scheduled') return;
    fireNowConversion();
    setTimeout(function () { window.location.href = '/danke/'; }, 300);   // erst feuern, dann weiter
  });

  // Ausloeser: Platzhalter-Knopf (stimmt zu), Zustimmung in der Leiste,
  // oder schon gespeicherte Zustimmung
  var knopf = box.querySelector('.media-consent__btn');
  if (knopf) knopf.addEventListener('click', function () {
    if (!zugestimmt() && typeof window.acceptAll === 'function') window.acceptAll();
    loadCalendly();
  });
  var zustimmen = document.getElementById('cookie-accept');
  if (zustimmen) zustimmen.addEventListener('click', loadCalendly);
  if (zugestimmt()) loadCalendly();
})();
