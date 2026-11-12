/* ============================================================
   NOW LP-KERN — MECHANIK
   ============================================================
   Diese Datei wird pro Landingpage NICHT angefasst. Alles, was sich
   von LP zu LP unterscheidet, steht in seite.js im Objekt LP und wird
   hier nur gelesen. Wer hier etwas aendert, aendert es fuer alle LPs —
   also entweder ein echter Fehler oder eine bewusste Verbesserung, die
   dann in den Kern zurueckwandert.
   ============================================================ */

var LP = window.LP || {};

// ============================================================
// TERMIN — eine einzige Quelle fuer Datum, Countdown und Kalender.
// Sommerzeit-sicher: der Offset der Zielzeitzone wird zum Zeitpunkt des
// Termins bestimmt, nicht zum Zeitpunkt des Seitenaufrufs. Sonst geht der
// Kalendereintrag im Winter um eine Stunde daneben.
// ============================================================
var TERMIN = (function() {
  var EVENT = LP.termin || { jahr: 2026, monat: 1, tag: 1, startStunde: 9, endStunde: 17 };
  var ZONE = LP.zeitzone || 'Europe/Vienna';

  function viennaOffsetMin(utcMs) {
    try {
      var parts = new Intl.DateTimeFormat('en-US', {
        timeZone: ZONE, timeZoneName: 'shortOffset'
      }).formatToParts(new Date(utcMs));
      var tz = parts.find(function(p) { return p.type === 'timeZoneName'; }).value;
      var m = tz.match(/GMT([+-])(\d+)(?::?(\d+))?/);
      if (!m) return 60; // fallback CET
      return (m[1] === '-' ? -1 : 1) * (parseInt(m[2], 10) * 60 + parseInt(m[3] || '0', 10));
    } catch (e) { return 60; } // fallback CET
  }

  function viennaToUTC(y, mo, d, h) {
    var naive = Date.UTC(y, mo - 1, d, h, 0, 0);
    return naive - viennaOffsetMin(naive) * 60000;
  }

  function pad(n) { return String(n).padStart(2, '0'); }

  function compute() {
    var now = Date.now();
    var startUtc = viennaToUTC(EVENT.jahr, EVENT.monat, EVENT.tag, EVENT.startStunde);
    var endUtc = viennaToUTC(EVENT.jahr, EVENT.monat, EVENT.tag, EVENT.endStunde);
    var target = new Date(startUtc);
    var endTarget = new Date(endUtc);

    // Vienna-Zeitzone-aware formatierte Strings
    var ddmmyyyy = new Intl.DateTimeFormat('de-DE', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      timeZone: ZONE
    }).format(target);

    var longDE = new Intl.DateTimeFormat('de-DE', {
      weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
      timeZone: ZONE
    }).format(target);

    // YYYYMMDDTHHMMSSZ Format für Kalender-Links
    function icalFmt(d) {
      return d.getUTCFullYear() +
        pad(d.getUTCMonth() + 1) +
        pad(d.getUTCDate()) + 'T' +
        pad(d.getUTCHours()) +
        pad(d.getUTCMinutes()) +
        pad(d.getUTCSeconds()) + 'Z';
    }

    return {
      target: target,
      endTarget: endTarget,
      isLive: now >= startUtc && now < endUtc,
      isOver: now >= endUtc,
      ddmmyyyy: ddmmyyyy,           // "17.10.2026"
      longDE: longDE,                // "Samstag, 17. Oktober 2026"
      // In UTC — deshalb weicht die Stunde von der Ortszeit ab; genau das
      // erwarten Google Kalender und .ics.
      icalStart: icalFmt(target),
      icalEnd: icalFmt(endTarget),
      uidDate: icalFmt(target).slice(0, 8)
    };
  }

  return compute();
})();

// --- Termin in alle DOM-Stellen schreiben ---
// ACHTUNG: Der Ort steht in ZWEI Dateien — seite.js und danke/index.html.
// Bei Aenderung beide nachziehen, sonst weicht der Kalendereintrag der
// Dankesseite von dem der Landingpage ab.
var ORT = LP.ort || '';
var VERANSTALTUNG = LP.veranstaltung || {};

function wendeTerminAn() {
  // 1. Event-Datum in Ticket-Sektion & Final-CTA
  document.querySelectorAll('.js-event-date').forEach(function(el) {
    el.textContent = TERMIN.ddmmyyyy + ' · ' + ORT;
  });

  // 2. Nach dem Event: Verknappungszeilen ausblenden. "Nur noch wenige
  //    Tickets verfuegbar" waere danach schlicht falsch.
  if (TERMIN.isOver) {
    document.querySelectorAll('.ticket__scarcity, .hero__knappheit').forEach(function(el) {
      el.style.display = 'none';
    });
  }

  // 3. Google Calendar Link (alle Vorkommen)
  var calDetails = (VERANSTALTUNG.beschreibung || '') + '\nOrt: ' + ORT;
  var calLinks = document.querySelectorAll('a[href*="calendar.google.com"], #calGoogle');
  calLinks.forEach(function(link) {
    link.href = 'https://calendar.google.com/calendar/render?action=TEMPLATE' +
      '&text=' + encodeURIComponent(VERANSTALTUNG.titel || '') +
      '&dates=' + TERMIN.icalStart + '%2F' + TERMIN.icalEnd +
      '&details=' + encodeURIComponent(calDetails) +
      '&location=' + encodeURIComponent(ORT);
  });

  // 4. Apple Kalender / .ics Download → Blob-Handler
  function buildICS() {
    var lines = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//NOW Consulting//' + (VERANSTALTUNG.titel || 'Event') + '//DE',
      'BEGIN:VEVENT',
      'UID:' + (VERANSTALTUNG.uid || 'now-event') + '-' + TERMIN.uidDate + '@now-consulting.at',
      'DTSTAMP:' + TERMIN.icalStart,
      'DTSTART:' + TERMIN.icalStart,
      'DTEND:' + TERMIN.icalEnd,
      'SUMMARY:' + (VERANSTALTUNG.titel || ''),
      // Komma und Zeilenumbruch muessen im ICS-Format maskiert werden.
      'DESCRIPTION:' + (VERANSTALTUNG.beschreibung || '').replace(/,/g, '\\,').replace(/\n/g, '\\n'),
      'LOCATION:' + ORT.replace(/,/g, '\\,'),
      'END:VEVENT',
      'END:VCALENDAR',
      ''
    ];
    return lines.join('\r\n');
  }

  function downloadICS(e) {
    e.preventDefault();
    var blob = new Blob([buildICS()], { type: 'text/calendar;charset=utf-8' });
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url;
    a.download = (VERANSTALTUNG.dateiname || 'termin') + '.ics';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(function() { URL.revokeObjectURL(url); }, 1000);
  }

  // Statische .ics-Links + alle data:text/calendar Links → Blob-Handler
  document.querySelectorAll('a[href$=".ics"], a[href^="data:text/calendar"]').forEach(function(link) {
    link.addEventListener('click', downloadICS);
  });
}

// Sofort anwenden, sobald DOM verfügbar (Script ist am Body-Ende, also DOM ist ready)
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', wendeTerminAn);
} else {
  wendeTerminAn();
}

// ============================================================
// CONSENT
// Die Seite ist von Anfang an vollstaendig sichtbar und scrollbar.
// Vor der Zustimmung geht kein Request an googletagmanager.com oder
// connect.facebook.net. An player.vimeo.com geht genau einer: das
// Hero-Video laeuft auf Wunsch des Betreibers sofort — die
// Datenschutzerklaerung benennt das ausdruecklich.
// Wer ablehnt oder noch unentschieden ist, kann jedes weitere Video
// einzeln per Klick freischalten; dieser Klick akzeptiert alle Cookies.
// ============================================================

var VIMEO_PARAMS = 'badge=0&autopause=0&player_id=0&app_id=58479&title=0&byline=0&portrait=0&vimeo_logo=0&color=C9A84C';
var vimeoGeladen = false;

// --- iframe bauen. Von Hero und Testimonials genutzt. ---
// extra = zusaetzliche Query-Parameter (Autoplay, Ton, Schleife, dnt).
function baueVimeoIframe(id, titel, lazy, hash, extra) {
  var f = document.createElement('iframe');
  // hash = Privacy-Hash nicht gelisteter Videos (vimeo.com/ID/HASH)
  var h = (hash || '').match(/^[a-z0-9]+$/i);
  f.src = 'https://player.vimeo.com/video/' + id + '?' +
          (h ? 'h=' + h[0] + '&' : '') +
          (extra ? extra + '&' : '') + VIMEO_PARAMS;
  f.setAttribute('frameborder', '0');
  f.setAttribute('allow', 'autoplay; fullscreen; picture-in-picture; clipboard-write; encrypted-media');
  f.setAttribute('allowfullscreen', '');
  f.title = titel || '';
  if (lazy) f.loading = 'lazy';
  return f;
}

// --- Player-API einmalig nachladen, Aufrufer werden benachrichtigt ---
var apiWartet = [];
var apiAngefordert = false;
function ladePlayerApi(danach) {
  if (typeof Vimeo !== 'undefined') { if (danach) danach(); return; }
  if (danach) apiWartet.push(danach);
  if (apiAngefordert) return;
  apiAngefordert = true;
  var api = document.createElement('script');
  api.src = 'https://player.vimeo.com/api/player.js';
  api.onload = function() { apiWartet.splice(0).forEach(function(fn) { fn(); }); };
  // Faellt die API aus, bleibt der Rueckfall in heroMitTon: neu laden.
  api.onerror = function() { apiWartet.length = 0; };
  document.head.appendChild(api);
}

// ============================================================
// HERO-VIDEO — laeuft sofort, stumm, in Schleife
// Bewusst VOR der Zustimmung. Das ist eine Entscheidung des Betreibers,
// und die Datenschutzerklaerung benennt sie ausdruecklich. Alle uebrigen
// Videos bleiben hinter der Zustimmung (loadVimeo weiter unten).
// dnt=1 ist Vimeos Do-Not-Track-Schalter: unterbindet Tracking-Cookies
// fuer dieses Embed, ohne am Sichtbaren etwas zu aendern.
//
// Solange das Video im Hintergrund laeuft, liegt unser eigener Knopf
// flaechendeckend darueber und das iframe traegt pointer-events:none —
// Vimeos Bedienelemente sind dadurch nicht erreichbar und blenden sich
// mangels Hover nie ein. Erst der Klick gibt sie frei.
// ============================================================
var VIDEO_TITEL = (LP.video && LP.video.titel) || 'Video';
var HERO_HINTERGRUND = 'autoplay=1&muted=1&loop=1&controls=1&dnt=1';
var HERO_MIT_TON     = 'autoplay=1&muted=0&controls=1&dnt=1';
var heroPlayer = null;

function ladeHeroVideo() {
  var box = document.getElementById('heroVideo');
  if (!box || !/^\d{6,}$/.test(box.dataset.vimeo || '')) return;
  var id = box.dataset.vimeo;
  // Nicht gelistete Videos (vimeo.com/ID/HASH) brauchen den Hash in der
  // Einbettung, sonst antwortet der Player mit "Private video".
  var hash = box.dataset.vimeoHash || null;
  var poster = document.getElementById('hero-video-poster');

  // Der Hinweis "Mit Klick werden Cookies akzeptiert" stimmt fuer dieses
  // Video nicht mehr — es laedt ohnehin.
  var hinweis = box.querySelector('.hero-video__consent');
  if (hinweis) hinweis.remove();

  function starteMitTon() { heroMitTon(box, id, poster); }
  if (poster) poster.addEventListener('click', starteMitTon);

  // Wer Bewegung abbestellt hat, bekommt kein Video, das von selbst losgeht.
  // Dann bleibt das Standbild stehen; der Klick startet es mit Ton.
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  var f = baueVimeoIframe(id, VIDEO_TITEL, false, hash, HERO_HINTERGRUND);
  f.id = 'heroVimeo';
  f.setAttribute('data-player-id', 'heroVimeo');
  f.src = f.src.replace('player_id=0', 'player_id=heroVimeo');
  box.insertBefore(f, box.firstChild);

  // Erst wenn das Video wirklich laeuft, wird der Platzhalter transparent und
  // zum blossen Knopf. Vorher bleibt seine dunkle Flaeche stehen — sonst
  // schwebte der Knopf ueber einem leeren Kasten.
  //
  // Das load-Ereignis des iframes taugt dafuer NICHT allein: Chromium feuert
  // es auch, wenn die Anfrage scheitert — es laedt dann eine Fehlerseite ins
  // iframe. Wer Vimeo blockiert (Firewall, Tracking-Blocker), saehe also einen
  // weissen Kasten. Das verlaessliche Signal ist die Player-API: meldet sie
  // Bereitschaft, laeuft wirklich ein Video.
  var umgeschaltet = false;
  function zeigeAlsLaufend() {
    if (umgeschaltet) return;
    umgeschaltet = true;
    box.classList.add('hero__video--laeuft');
    var hint = box.querySelector('.hero-video__hint');
    if (hint) hint.textContent = 'Mit Ton von vorn ansehen';
    if (poster) poster.setAttribute('aria-label', 'Aftermovie mit Ton von vorn abspielen');
  }

  ladePlayerApi(function() {
    heroPlayer = new Vimeo.Player(f);
    heroPlayer.ready().then(zeigeAlsLaufend).catch(function() {});
    var overlay = document.getElementById('heroReplay');
    var btn = document.querySelector('.hero__video-replay-btn');
    if (!overlay || !btn) return;
    // Im Hintergrundmodus laeuft das Video in Schleife und endet nie —
    // das Overlay erscheint erst, nachdem der Ton-Durchlauf durch ist.
    heroPlayer.on('ended', function() { overlay.classList.add('visible'); });
    btn.addEventListener('click', function() {
      overlay.classList.remove('visible');
      heroPlayer.setCurrentTime(0).then(function() { return heroPlayer.play(); });
    });
  });

  // Rueckhalt: laedt die API nicht (blockiert, langsam), das iframe aber schon,
  // liefe das Video hinter einem dunklen Platzhalter weiter. Nach vier Sekunden
  // wird darum trotzdem umgeschaltet.
  f.addEventListener('load', function() { setTimeout(zeigeAlsLaufend, 4000); });
}

function heroMitTon(box, id, poster) {
  if (poster) poster.style.display = 'none';
  box.classList.remove('hero__video--laeuft');
  box.classList.add('hero__video--ton');

  // Ueber die Player-API: kein Neuladen, kein Schwarz dazwischen.
  if (heroPlayer) {
    heroPlayer.setCurrentTime(0)
      .then(function() { return heroPlayer.setLoop(false); })
      .then(function() { return heroPlayer.setMuted(false); })
      .then(function() { return heroPlayer.play(); })
      .catch(function() { heroNeuLaden(box, id); });
    return;
  }
  heroNeuLaden(box, id);
}

// Rueckfall, wenn die API nicht geladen hat oder ein Aufruf scheitert.
// Ein frisches iframe startet zwangslaeufig bei 0 — dasselbe Ergebnis,
// nur mit kurzem Schwarz.
function heroNeuLaden(box, id) {
  var alt = box.querySelector('iframe');
  var f = baueVimeoIframe(id, VIDEO_TITEL, false, box.dataset.vimeoHash || null, HERO_MIT_TON);
  f.id = 'heroVimeo';
  if (alt) box.replaceChild(f, alt);
  else box.insertBefore(f, box.firstChild);
  heroPlayer = null;
  ladePlayerApi(function() { heroPlayer = new Vimeo.Player(f); });
}

// --- Die uebrigen Videos: erst nach der Zustimmung ---
function loadVimeo() {
  if (vimeoGeladen) return;
  vimeoGeladen = true;

  document.querySelectorAll('.testi-video').forEach(function(fig) {
    var id = (fig.dataset.vimeo || '').match(/\d{6,}/);
    if (!id) return;                       // keine ID -> Platzhalter bleibt stehen
    var f = baueVimeoIframe(id[0], fig.dataset.titel || '', true, fig.dataset.hash, 'dnt=1');
    f.addEventListener('load', function() {
      var ph = fig.querySelector('.testi-video__poster');
      if (ph) ph.remove();
    });
    fig.insertBefore(f, fig.firstChild);
  });

  ladePlayerApi(initVideoReplay);
}

// --- Replay-Overlays der Testimonials, sobald die Player-API da ist ---
function initVideoReplay() {
  if (typeof Vimeo === 'undefined') return;

  document.querySelectorAll('.testi-video iframe').forEach(function(iframe) {
    var wrap = iframe.parentElement;
    wrap.style.position = 'relative';

    var overlay = document.createElement('div');
    overlay.className = 'video-replay';
    overlay.innerHTML = '<button class="video-replay-btn" aria-label="Video erneut abspielen"><svg viewBox="0 0 80 80" fill="none"><circle cx="40" cy="40" r="38" stroke="currentColor" stroke-width="2.5"/><polygon points="33,24 33,56 58,40" fill="currentColor"/></svg></button>';
    wrap.appendChild(overlay);

    var player = new Vimeo.Player(iframe);
    player.on('ended', function() { overlay.classList.add('visible'); });
    overlay.querySelector('.video-replay-btn').addEventListener('click', function() {
      overlay.classList.remove('visible');
      player.setCurrentTime(0).then(function() { player.play(); });
    });
  });
}

ladeHeroVideo();

// --- Banner schliessen ---
function hideCookieBar() {
  var bar = document.getElementById('cookie-bar');
  if (bar) bar.hidden = true;
  document.body.classList.remove('consent-open');
}

// --- Alles akzeptieren. Wird auch von den Video-Platzhaltern aufgerufen. ---
function acceptAll() {
  localStorage.setItem('consent_v1', 'all');
  hideCookieBar();
  if (typeof loadTracking === 'function') loadTracking();
  loadVimeo();
}

// --- Ohne Consent werden die Video-Platzhalter zu Ein-Klick-Einstiegen ---
function armBlockedMedia() {
  // Der Hero ist ausgenommen: sein Video laeuft bereits, sein Knopf startet
  // den Ton und akzeptiert nichts.
  document.querySelectorAll('.testi-video').forEach(function(fig) {
    if (!/\d{6,}/.test(fig.dataset.vimeo || '')) return;   // keine ID -> "Video folgt" bleibt
    var poster = fig.querySelector('.testi-video__poster');
    if (!poster) return;
    var label = poster.querySelector('.testi-video__label');
    if (label) label.textContent = 'Video ansehen';
    if (!poster.querySelector('.testi-video__consent')) {
      var hint = document.createElement('span');
      hint.className = 'testi-video__consent';
      hint.textContent = 'Mit Klick werden Cookies akzeptiert';
      poster.appendChild(hint);
    }
    poster.classList.add('is-blocked');
    poster.setAttribute('role', 'button');
    poster.tabIndex = 0;
    poster.removeAttribute('aria-hidden');
    var go = function(e) { e.preventDefault(); acceptAll(); };
    poster.addEventListener('click', go);
    poster.addEventListener('keydown', function(e) {
      if (e.key === 'Enter' || e.key === ' ') go(e);
    });
  });
}

(function() {
  var KEY = 'consent_v1';
  var bar = document.getElementById('cookie-bar');

  function showCookieBar() {
    if (bar) bar.hidden = false;
    document.body.classList.add('consent-open');
  }

  function decline() {
    var warAlles = localStorage.getItem(KEY) === 'all';
    localStorage.setItem(KEY, 'declined');
    hideCookieBar();
    // War vorher akzeptiert, sind die Skripte schon geladen — nur ein Reload
    // entfernt sie wirklich aus dem Speicher (Widerruf, Art. 7 Abs. 3 DSGVO).
    if (warAlles) location.reload();
  }

  var btnAccept = document.getElementById('cookie-accept');
  if (btnAccept) btnAccept.addEventListener('click', acceptAll);
  var btnDecline = document.getElementById('cookie-decline');
  if (btnDecline) btnDecline.addEventListener('click', decline);
  // Footer-Link holt den Banner zurueck — Zustimmung und Widerruf jederzeit
  // Datenschutz-Link in der Leiste oeffnet dasselbe Modal wie im Footer
  var btnPrivacy = document.getElementById('cookie-privacy');
  if (btnPrivacy) btnPrivacy.addEventListener('click', function() {
    var ov = document.getElementById('datenschutzOverlay');
    if (ov) { ov.classList.add('open'); ov.removeAttribute('aria-hidden'); }
  });
  var btnSettings = document.getElementById('cookie-settings');
  if (btnSettings) btnSettings.addEventListener('click', function(e) {
    e.preventDefault();
    showCookieBar();
  });

  var c = localStorage.getItem(KEY);
  if (c === 'all') {
    if (typeof loadTracking === 'function') loadTracking();
    loadVimeo();
  } else {
    armBlockedMedia();        // unentschieden ODER abgelehnt: Platzhalter klickbar
    if (!c) showCookieBar();  // Banner nur beim ersten Besuch, nach "Ablehnen" nicht wieder
  }
})();

// --- Countdown ---
(function() {
  const target = TERMIN.target; // Auto-berechnet via TERMIN
  const cd = document.getElementById('countdown');
  // Seiten ohne Countdown (z.B. ein Freebie) haben dieses Element nicht.
  // Ohne diesen Ausstieg wirft tick() beim Laden und reisst alles mit,
  // was danach im Kern noch gebunden werden sollte.
  if (!cd) return;
  const liveEl = document.getElementById('countdownLive');
  // Beschriftungen ueber den Countdowns — verschwinden mit ihnen
  const captions = [document.getElementById('countdownCaption'), document.getElementById('countdownCaption2')];
  function hideCaptions() {
    captions.forEach(function(el) { if (el) el.style.display = 'none'; });
  }

  function pad(n) { return String(n).padStart(2, '0'); }

  function setNum(id, val) {
    var el = document.getElementById(id);
    if (el) el.textContent = val;
  }

  function tick() {
    const now = Date.now();
    const cd2 = document.querySelector('.final-cta__countdown');
    // Event vorbei → Countdowns und Live-Zeile ausblenden
    if (now >= TERMIN.endTarget) {
      cd.style.display = 'none';
      if (cd2) cd2.style.display = 'none';
      hideCaptions();
      if (liveEl) liveEl.style.display = 'none';
      return;
    }
    const diff = target - now;
    // Event läuft (09–17 Uhr) → Live-Zeile statt Countdown
    if (diff <= 0) {
      cd.style.display = 'none';
      if (cd2) cd2.style.display = 'none';
      hideCaptions();
      if (liveEl) liveEl.style.display = 'block';
      return;
    }
    const days    = pad(Math.floor(diff / 86400000));
    const hours   = pad(Math.floor((diff % 86400000) / 3600000));
    const minutes = pad(Math.floor((diff % 3600000) / 60000));
    const seconds = pad(Math.floor((diff % 60000) / 1000));
    // Hero-Countdown + Final-CTA-Countdown (IDs mit Suffix "2")
    setNum('cdDays', days);     setNum('cdDays2', days);
    setNum('cdHours', hours);   setNum('cdHours2', hours);
    setNum('cdMinutes', minutes); setNum('cdMinutes2', minutes);
    setNum('cdSeconds', seconds); setNum('cdSeconds2', seconds);
  }

  tick();
  setInterval(tick, 1000);
})();

// --- GA4 Event Tracking ---
function ga4Event(name, params) {
  if (typeof gtag !== 'undefined') gtag('event', name, params || {});
}

// --- Ereignisse an Meta UND GA4 ---
// Eine Stelle fuer beide, damit kein Ereignis nur in einem der zwei Systeme
// landet. Vor der Zustimmung gibt es weder fbq noch gtag, dann passiert
// einfach nichts — kein Puffer, keine Nachsendung.
//
// trackCustom, nicht track: alle NOW_-Ereignisse sind eigene Ereignisse.
// Mit track wuerde Meta sie als unbekanntes Standardereignis stillschweigend
// verwerfen.
//
// Jeder Name feuert pro Seitenaufruf genau einmal. Ohne diese Sperre zaehlt
// ein Nutzer, der im Funnel zurueckgeht oder den Knopf zweimal drueckt,
// mehrfach — und die Abbruchquote zwischen zwei Schritten waere wertlos.
var _gemeldet = {};
function melde(name, daten) {
  if (!name || _gemeldet[name]) return;
  _gemeldet[name] = true;
  var d = daten || {};
  if (typeof fbq !== 'undefined') fbq('trackCustom', name, d);
  if (typeof gtag !== 'undefined') gtag('event', name, d);
}

// Beliebige Elemente koennen ein Ereignis beim Klick ausloesen:
//   <a data-ereignis="NOW_Download" data-ereignis-wert="pdf">
// Damit braucht kein Knopf eigenen Code, und der Kern kennt keinen davon.
document.addEventListener('click', function (e) {
  var ziel = e.target.closest('[data-ereignis]');
  if (!ziel || ziel.classList.contains('funnel-step')) return;
  var daten = {};
  if (ziel.dataset.ereignisWert) daten.wert = ziel.dataset.ereignisWert;
  melde(ziel.dataset.ereignis, daten);
});

// --- Ticket-Auswahl ---
// Zwei Kassen, ein Dialog. Die Knoepfe an den Angebotskarten fuehren direkt
// zu ihrer eigenen Kasse (.js-kasse) — dort stehen die Angebote nebeneinander,
// die Wahl ist also schon getroffen. Knoepfe ausserhalb der Karten (Hero,
// Schluss-CTA, Sticky-Leiste) tragen .js-buy: ihr Klick wird abgefangen und
// oeffnet stattdessen diesen Dialog.
//
// Der href des .js-buy-Knopfes zeigt trotzdem auf die Hauptkasse. Ohne
// JavaScript greift er — dann landet man direkt dort statt im Leeren.
// Bei nur EINER Kasse laesst man den Dialog einfach weg: ohne
// #ticketWahlOverlay steigt der Block hier aus und der href gewinnt.
//
// Das Tracking ist bewusst NICHT hier: der Klick auf .js-buy oeffnet nur den
// Dialog. Gemeldet wird erst, wenn eine Kasse gewaehlt ist — siehe .js-kasse.
(function() {
  var overlay = document.getElementById('ticketWahlOverlay');
  if (!overlay) return;

  var letzterAusloeser = null;

  function auf(ausloeser) {
    letzterAusloeser = ausloeser || null;
    overlay.classList.add('open');
    overlay.removeAttribute('aria-hidden');
    // Fokus auf den Dialog selbst, nicht auf die erste Option: sonst legt
    // Chromium beim Oeffnen per Maus einen lauten Fokusring um Option 1, der
    // wie eine Vorauswahl aussieht. Vorleseprogramme kuendigen den Dialog
    // ueber role und aria-labelledby trotzdem an, und mit Tab landet man
    // direkt auf der ersten Option.
    var kasten = overlay.querySelector('.ticket-wahl__box');
    if (kasten) kasten.focus();
  }

  function zu() {
    overlay.classList.remove('open');
    overlay.setAttribute('aria-hidden', 'true');
    // Fokus zurueck auf den Knopf, der den Dialog geoeffnet hat — sonst
    // landet er beim Schliessen am Seitenanfang.
    if (letzterAusloeser) letzterAusloeser.focus();
    letzterAusloeser = null;
  }

  document.querySelectorAll('.js-buy').forEach(function(el) {
    el.addEventListener('click', function(e) {
      e.preventDefault();
      auf(el);
    });
  });

  document.getElementById('ticketWahlClose').addEventListener('click', zu);
  overlay.addEventListener('click', function(e) { if (e.target === overlay) zu(); });

})();

// --- Kassengang melden ---
// Vier Stellen fuehren zur Kasse: die zwei Optionen im Auswahl-Dialog und die
// zwei Knoepfe an den Angebotskarten. Alle vier tragen .js-kasse, damit es
// genau EINEN Ort gibt, an dem ein Kauf beginnt — egal, wo geklickt wurde.
// Produkt und Wert gehen mit, damit sich in Meta der Trichter pro Angebot
// lesen laesst — dieselben Felder wie beim Purchase auf der Danke-Seite.
document.querySelectorAll('.js-kasse').forEach(function(a) {
  a.addEventListener('click', function() {
    var wert  = Number(a.dataset.wert);
    var menge = Number(a.dataset.menge);
    ga4Event('begin_checkout', {
      currency: 'EUR', value: wert, variante: a.dataset.variante
    });
    if (typeof fbq !== 'undefined') {
      fbq('track', 'InitiateCheckout', {
        currency: 'EUR', value: wert,
        content_type: 'product', content_ids: [a.dataset.variante],
        num_items: menge
      });
    }
  });
});


// --- Nachlese gegen schnelles Scrollen ---
// Ein IntersectionObserver meldet nur Schwellenwechsel, die er in einem Frame
// auch misst. Beim Sprung ans Seitenende, beim Anker-Klick oder beim Wischen
// mit Schwung zieht ein kurzes Element zwischen zwei Frames komplett am
// Sichtfeld vorbei: davor unten draussen, danach oben draussen, dazwischen nie
// gemessen. Es bliebe dann fuer immer im Ausgangszustand.
// Reproduzierbar mit 500px-Spruengen — dort blieben ein FAQ-Eintrag, die
// Footer-Trennlinie und alle vier Statistik-Zahlen zurueck.
// Der Wachposten haengt sich selbst wieder aus, sobald nichts mehr offen ist.
function nachleseFuer(elemente, istErledigt, holeNach) {
  var offen = Array.prototype.slice.call(elemente);
  if (!offen.length) return;
  var geplant = false;

  function pruefe() {
    geplant = false;
    // Die Liste steht in Dokumentreihenfolge. Gesucht sind nur Elemente, die
    // oben aus dem Bild gelaufen sind — sobald eines KOMPLETT unterhalb des
    // Sichtfelds liegt, koennen die folgenden es auch nicht sein, und die
    // Messung hoert auf.
    //
    // Vorher wurde in jedem Frame jedes offene Element gemessen. Das waren
    // beim Scrollen durch eine Sektion 1703 erzwungene Layout-Berechnungen
    // gegenueber 198 aus allen uebrigen Handlern zusammen — die Nachlese
    // gegen verpasste Elemente war damit selbst der teuerste Posten im
    // Scroll-Pfad. Der Abbruch aendert nichts an dem, was sie findet.
    var hoehe = window.innerHeight;
    var rest = [];
    for (var i = 0; i < offen.length; i++) {
      var el = offen[i];
      if (istErledigt(el)) continue;
      var r = el.getBoundingClientRect();
      if (r.top > hoehe) {                 // ab hier liegt alles unterhalb
        rest = rest.concat(offen.slice(i));
        break;
      }
      if (r.bottom >= 0) rest.push(el);    // noch nicht vorbei
      else holeNach(el);
    }
    offen = rest;
    if (!offen.length) window.removeEventListener('scroll', plane);
  }

  // Hoechstens eine Messung pro Frame — sonst ist die Nachlese selbst der
  // Grund fuer erzwungenes Layout bei jedem Scroll-Ereignis.
  function plane() {
    if (geplant) return;
    geplant = true;
    requestAnimationFrame(pruefe);
  }

  window.addEventListener('scroll', plane, { passive: true });
}

// --- Scroll Reveal ---
// Ohne IntersectionObserver bliebe jedes Reveal-Element dauerhaft auf opacity:0
// stehen — die Seite waere dann nicht unanimiert, sondern leer. Dieser Helfer
// kapselt beide Faelle: mit Observer wird beobachtet und nach dem ersten
// Treffer abgemeldet, ohne Observer wird sofort alles sichtbar geschaltet.
function beobachteReveal(auswahl, optionen, versatzMs) {
  var elemente = document.querySelectorAll(auswahl);
  if (!elemente.length) return;

  // Geschwister-Stagger: der Versatz wird gedeckelt, sonst liest sich eine
  // laengere Reihe als Warteschlange statt als eine Bewegung.
  function zeigen(el, index) {
    el.style.transitionDelay = Math.min(index * versatzMs, 350) + 'ms';
    el.classList.add('visible');
  }

  if (typeof IntersectionObserver !== 'function') {
    elemente.forEach(function(el) { el.classList.add('visible'); });
    return;
  }

  var beobachter = new IntersectionObserver(function(eintraege) {
    eintraege.forEach(function(eintrag) {
      if (!eintrag.isIntersecting) return;
      var geschwister = eintrag.target.parentElement.querySelectorAll(auswahl);
      zeigen(eintrag.target, Array.prototype.indexOf.call(geschwister, eintrag.target));
      beobachter.unobserve(eintrag.target);
    });
  }, optionen);

  elemente.forEach(function(el) {
    // Der Hero wird weiter unten sofort gezeigt — nicht doppelt beobachten.
    if (!el.classList.contains('visible')) beobachter.observe(el);
  });

  nachleseFuer(elemente,
    function(el) { return el.classList.contains('visible'); },
    function(el) {
      el.classList.add('visible');   // bewusst ohne Versatz: der Moment ist vorbei
      beobachter.unobserve(el);
    });
}

// Hero-Elemente stehen im ersten Sichtfeld und duerfen nicht auf ein
// Scroll-Ereignis warten. Muss VOR den Beobachtern laufen, damit sie
// uebersprungen werden.
document.querySelectorAll('.hero .reveal').forEach(function(el, i) {
  el.style.transitionDelay = Math.min(i * 70, 350) + 'ms';
  el.classList.add('visible');
});

beobachteReveal('.reveal',       { threshold: 0.1,  rootMargin: '0px 0px -40px 0px' }, 70);
beobachteReveal('.reveal-item',  { threshold: 0.1,  rootMargin: '0px 0px -30px 0px' }, 70);
beobachteReveal('.reveal-card',  { threshold: 0.2,  rootMargin: '0px 0px -30% 0px'  }, 90);
beobachteReveal('.reveal-testi', { threshold: 0.15, rootMargin: '0px 0px -50px 0px' }, 70);

// --- Einmaliger Licht-Sweep ueber den Haupt-CTA ---
// Auf Mobil gibt es kein Hover — ohne diesen Anstoss bliebe der Sweep dort
// vollstaendig unsichtbar. Bewusst genau EINMAL kurz nach dem Hero-Einblenden
// statt als Dauerschleife: die Trigger-Hierarchie stellt "beim Laden einmalig"
// ueber "autonom/endlos", und wir nehmen der Seite gerade Dauerbewegung weg.
(function() {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  var cta = document.querySelector('.hero .btn--gold');
  if (!cta) return;
  setTimeout(function() {
    cta.classList.add('is-sheen');
    setTimeout(function() { cta.classList.remove('is-sheen'); }, 900);
  }, 1400);
})();

// --- FAQ Accordion ---
document.querySelectorAll('.faq__item').forEach(item => {
  const question = item.querySelector('.faq__question');
  const answer = item.querySelector('.faq__answer');

  question.addEventListener('click', () => {
    const isOpen = item.classList.contains('open');

    document.querySelectorAll('.faq__item.open').forEach(openItem => {
      if (openItem !== item) {
        openItem.classList.remove('open');
        openItem.querySelector('.faq__question').setAttribute('aria-expanded', 'false');
        openItem.querySelector('.faq__answer').style.maxHeight = '0';
      }
    });

    if (isOpen) {
      item.classList.remove('open');
      question.setAttribute('aria-expanded', 'false');
      answer.style.maxHeight = '0';
    } else {
      item.classList.add('open');
      question.setAttribute('aria-expanded', 'true');
      answer.style.maxHeight = answer.scrollHeight + 'px';
    }
  });
});


// --- Smooth scroll offset for fixed nav ---
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', e => {
    const target = document.querySelector(anchor.getAttribute('href'));
    if (!target) return;
    e.preventDefault();
    const offset = 80;
    const top = target.getBoundingClientRect().top + window.scrollY - offset;
    window.scrollTo({ top, behavior: 'smooth' });
  });
});

// --- Legal Modals (Impressum / Datenschutz / AGB) ---
['impressum', 'datenschutz', 'agb'].forEach(id => {
  const overlay = document.getElementById(id + 'Overlay');
  const openBtn = document.getElementById(id + 'Open');
  const closeBtn = document.getElementById(id + 'Close');
  if (!overlay) return;
  openBtn?.addEventListener('click', () => {
    overlay.classList.add('open');
    overlay.removeAttribute('aria-hidden');
  });
  const close = () => {
    overlay.classList.remove('open');
    overlay.setAttribute('aria-hidden', 'true');
  };
  closeBtn?.addEventListener('click', close);
  overlay.addEventListener('click', e => { if (e.target === overlay) close(); });
});

// Escape schliesst jedes offene Overlay — die Rechtstext-Modals hatten das
// bisher nicht, und mit dem Ticket-Dialog waere die Luecke neu aufgefallen.
document.addEventListener('keydown', function(e) {
  if (e.key !== 'Escape') return;
  document.querySelectorAll('.legal-overlay.open').forEach(function(ov) {
    ov.classList.remove('open');
    ov.setAttribute('aria-hidden', 'true');
  });
});

// --- Matrix Rain Animation ---
// Jedes Canvas mit data-matrix bekommt den Regen. data-matrix-ab nennt die
// Mindestbreite in Pixeln, ab der er laeuft.
//
//   <canvas data-matrix data-matrix-ab="901">   nur ab Desktop
//   <canvas data-matrix data-matrix-ab="0">     auf jedem Geraet
//
// Im Hero gilt 901: dort laufen sonst Regen, Aura und Buchstabenflug
// gleichzeitig, und der Katalog deckelt bei zwei bis drei Dingen in
// Bewegung. Auf einer Seite, die ausser dem Regen nichts bewegt, greift
// dieser Grund nicht — dort steht 0.
document.querySelectorAll('canvas[data-matrix]').forEach(function (canvas) {
  // Endlose Hintergrundbewegung — bei reduzierter Bewegung bleibt das Canvas leer.
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  var abBreite = parseInt(canvas.dataset.matrixAb, 10);
  if (isNaN(abBreite)) abBreite = 901;
  if (window.innerWidth < abBreite) return;

  const ctx = canvas.getContext('2d');
  const chars = 'アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const charArr = chars.split('');
  const fontSize = 14;
  let columns, drops;

  function resize() {
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
    columns = Math.floor(canvas.width / fontSize);
    const rows = Math.floor(canvas.height / fontSize);
    drops = Array.from({ length: columns }, () => Math.floor(Math.random() * rows));
  }

  resize();
  window.addEventListener('resize', resize, { passive: true });

  function draw() {
    ctx.fillStyle = 'rgba(10, 10, 10, 0.05)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.font = fontSize + 'px monospace';

    for (let i = 0; i < drops.length; i++) {
      const char = charArr[Math.floor(Math.random() * charArr.length)];
      const x = i * fontSize;
      const y = drops[i] * fontSize;

      ctx.fillStyle = drops[i] * fontSize < canvas.height * 0.3
        ? 'rgba(230, 210, 140, 0.9)'
        : 'rgba(201, 168, 76, 0.75)';

      ctx.fillText(char, x, y);

      if (y > canvas.height && Math.random() > 0.975) {
        drops[i] = 0;
      }
      drops[i]++;
    }
  }

  // requestAnimationFrame statt setInterval: pausiert von selbst, sobald der
  // Tab in den Hintergrund geht, und liegt auf dem Bildaufbau statt daneben.
  // Der Zeitvergleich haelt die alte Bildrate von rund 24/s.
  let animId = null, letzte = 0;
  function schleife(t) {
    animId = requestAnimationFrame(schleife);
    if (t - letzte < 42) return;
    letzte = t;
    draw();
  }
  // Wachposten gegen doppeltes Starten: zwei Eintritte hintereinander haetten
  // sonst zwei Schleifen erzeugt, von denen nur eine gestoppt wird.
  function start() { if (animId === null) animId = requestAnimationFrame(schleife); }
  function stop()  { if (animId !== null) { cancelAnimationFrame(animId); animId = null; } }

  // Beobachtet wird der Kasten, in dem das Canvas liegt, nicht mehr ein fest
  // verdrahteter #hero: so funktioniert das Modul auf jeder Seite.
  const umgebung = canvas.parentElement || canvas;
  // Ohne Beobachter laufen lassen statt gar nicht — das Canvas liegt hinter
  // dem Inhalt und kostet auch dauerhaft wenig.
  if (typeof IntersectionObserver !== 'function') { start(); return; }
  const beobachter = new IntersectionObserver(
    ([entry]) => entry.isIntersecting ? start() : stop(),
    { threshold: 0 }
  );
  beobachter.observe(umgebung);
});

/* ============================================
   HIGH-END ANIMATIONS
   ============================================ */

// --- 4. Scroll Progress Bar ---
(function() {
  const bar = document.getElementById('scrollProgress');
  if (!bar) return;
  function update() {
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const pct = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
    bar.style.width = pct + '%';
  }
  // Auf einen Frame gedrosselt: Scroll-Ereignisse feuern oefter als der
  // Bildschirm zeichnet, und jedes Setzen von style.width kostet Layout.
  var balkenGeplant = false;
  window.addEventListener('scroll', function() {
    if (balkenGeplant) return;
    balkenGeplant = true;
    requestAnimationFrame(function() { balkenGeplant = false; update(); });
  }, { passive: true });
  update();
})();

// --- 1. Letter Assemble (Hero Headline Only) ---
(function() {
  var el = document.querySelector('.letter-assemble');
  if (!el) return;

  function assembleLetters() {
    if (el.dataset.assembled) return;
    el.dataset.assembled = '1';

    var walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT, null, false);
    var textNodes = [];
    var node;
    while (node = walker.nextNode()) {
      if (node.textContent.trim()) textNodes.push(node);
    }

    var totalChars = 0;
    textNodes.forEach(function(tn) {
      for (var i = 0; i < tn.textContent.length; i++) {
        if (tn.textContent[i] !== ' ' && tn.textContent[i] !== '\n') totalChars++;
      }
    });

    var charIndex = 0;
    var baseDelay = 300; // 20% later start (300ms pause before first letter)
    var maxDelay = 1800; // 20% slower spread (was 1500)

    textNodes.forEach(function(textNode) {
      var original = textNode.textContent;
      var parent = textNode.parentNode;
      var fragment = document.createDocumentFragment();

      // Nur an echten Leerzeichen trennen, NICHT am geschuetzten Leerzeichen.
      // \s wuerde U+00A0 mitnehmen: "10.000&nbsp;€" zerfiele in zwei Woerter,
      // und zwischen zwei inline-block-Woertern darf die Zeile brechen — genau
      // das, was das geschuetzte Leerzeichen verhindern soll. So bleibt es Teil
      // des Wortes und faellt unter dessen white-space: nowrap.
      var words = original.split(/([ \t\n\r]+)/);
      words.forEach(function(word) {
        if (/^\s+$/.test(word) || word === '') {
          fragment.appendChild(document.createTextNode(word));
          return;
        }

        var wordWrap = document.createElement('span');
        wordWrap.className = 'la-word';

        for (var i = 0; i < word.length; i++) {
          var span = document.createElement('span');
          span.className = 'la-char';
          span.textContent = word[i];

          var angle = Math.random() * Math.PI * 2;
          var dist = 60 + Math.random() * 120;
          var x = Math.cos(angle) * dist;
          var y = Math.sin(angle) * dist;
          var rot = (Math.random() - 0.5) * 90;

          span.style.setProperty('--la-x', x + 'px');
          span.style.setProperty('--la-y', y + 'px');
          span.style.setProperty('--la-r', rot + 'deg');

          var delay = baseDelay + (charIndex / totalChars) * (maxDelay - 720);
          span.style.animationDelay = delay + 'ms';

          wordWrap.appendChild(span);
          charIndex++;
        }

        fragment.appendChild(wordWrap);
      });

      parent.replaceChild(fragment, textNode);
    });
    // All chars wrapped — make headline visible
    el.classList.add('la-ready');
  }

  // Trigger when hero headline becomes visible — but wait for cookie banner first
  function startWhenVisible() {
    // Ohne Beobachter sofort aufloesen. Wichtig: ein Wurf an dieser Stelle
    // haette die Sicherung weiter unten nie registriert — die Headline steht
    // unter .js auf visibility:hidden und waere dauerhaft unsichtbar geblieben.
    if (typeof IntersectionObserver !== 'function') { assembleLetters(); return; }
    var observer = new IntersectionObserver(function(entries) {
      if (entries[0].isIntersecting) {
        setTimeout(assembleLetters, 300);
        observer.disconnect();
      }
    }, { threshold: 0.3 });
    observer.observe(el);
  }

  // Die Seite wird nicht mehr gesperrt — die Animation startet sofort,
  // unabhaengig davon, ob der Cookie-Hinweis noch offen ist.
  startWhenVisible();

  // Sicherung: Die Headline darf nie dauerhaft unsichtbar bleiben, egal was
  // mit Cookie-Banner oder Observer passiert.
  setTimeout(function() {
    if (!el.dataset.assembled) assembleLetters();
  }, 3000);
})();

// --- Hochzaehlende Statistik-Zahlen ---
// Frueher lief hier ein setInterval(…, 500) ueber die gesamte Lebensdauer der
// Seite und rief zweimal pro Sekunde getBoundingClientRect auf jeder Kachel auf —
// ein erzwungenes Layout im Dauerbetrieb, lange nachdem alle Zahlen fertig
// gezaehlt hatten. Ausserdem wurde pro Frame innerHTML neu geparst, 120-mal je
// Zahl. Jetzt: ein Beobachter, der sich nach dem Treffer abmeldet, und ein
// Textknoten, der beschrieben statt neu gebaut wird.
(function() {
  var ziele = document.querySelectorAll('[data-count]');
  if (!ziele.length) return;

  var reduziert = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Struktur einmalig aufbauen: Praefix und Suffix als eigene Knoten in Gold,
  // die Ziffern als reiner Textknoten dazwischen.
  function aufbauen(el) {
    var zahl = document.createTextNode('0');
    el.textContent = '';
    if (el.dataset.prefix) {
      var p = document.createElement('span');
      p.className = 'gold';
      p.textContent = el.dataset.prefix;
      el.appendChild(p);
    }
    el.appendChild(zahl);
    if (el.dataset.suffix) {
      var sfx = document.createElement('span');
      sfx.className = 'gold';
      sfx.textContent = el.dataset.suffix;
      el.appendChild(sfx);
    }
    return zahl;
  }

  function zaehlen(el, sofort) {
    if (el._counted) return;
    el._counted = true;
    var zahl = aufbauen(el);
    var ziel = parseFloat(el.dataset.count);
    if (isNaN(ziel)) return;

    // Bei reduzierter Bewegung steht sofort der Endwert da — keine leere Kachel.
    if (sofort || reduziert) {
      zahl.nodeValue = ziel.toLocaleString('de-DE');
      return;
    }

    var DAUER = 1500;
    var t0 = null;
    requestAnimationFrame(function tick(t) {
      if (t0 === null) t0 = t;
      var fortschritt = Math.min((t - t0) / DAUER, 1);
      var eased = 1 - Math.pow(1 - fortschritt, 3);
      zahl.nodeValue = Math.round(eased * ziel).toLocaleString('de-DE');
      if (fortschritt < 1) requestAnimationFrame(tick);
    });
  }

  if (typeof IntersectionObserver !== 'function') {
    ziele.forEach(function(el) { zaehlen(el, true); });
    return;
  }

  var beobachter = new IntersectionObserver(function(eintraege) {
    eintraege.forEach(function(eintrag) {
      if (!eintrag.isIntersecting) return;
      zaehlen(eintrag.target, false);
      beobachter.unobserve(eintrag.target);
    });
  }, { threshold: 0.6 });

  ziele.forEach(function(el) { beobachter.observe(el); });

  // Wurde die Kachel im Sprung uebersprungen, steht sofort der Endwert da —
  // eine Zahl, die erst hochzaehlt, nachdem man laengst vorbeigescrollt ist,
  // hilft niemandem.
  nachleseFuer(ziele,
    function(el) { return !!el._counted; },
    function(el) { zaehlen(el, true); beobachter.unobserve(el); });
})();

// --- 5. 3D Tilt on Module Cards ---
(function() {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  // Nur bei echtem Zeiger: auf Touch feuert mousemove teils einmalig beim
  // Tippen, und die Karte bliebe danach verdreht stehen.
  if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;

  document.querySelectorAll('.tilt-card').forEach(card => {
    // Add glare element
    const glare = document.createElement('div');
    glare.className = 'tilt-glare';
    card.appendChild(glare);

    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;

      // 2 Grad statt 8. Der Katalog verbietet Rotation eigentlich ganz; bei
      // diesem Ausschlag liest es sich als Materialreaktion, nicht als Kunststueck.
      const rotateX = ((y - centerY) / centerY) * -2;
      const rotateY = ((x - centerX) / centerX) * 2;

      card.style.transform = `perspective(800px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-3px)`;

      // Move glare to follow cursor
      glare.style.background = `radial-gradient(circle at ${x}px ${y}px, rgba(201, 168, 76, 0.12), transparent 60%)`;
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
      glare.style.background = '';
    });
  });
})();

// --- 9. (entfallen) Parallax der Sektions-Hintergruende ---
// Der Effekt hat beim Scrollen die background-position der Sektionen um bis
// zu 20 px verschoben. Da ein CSS-Hintergrund standardmaessig kachelt, rutschte
// dabei das untere Ende des Verlaufs oben wieder herein — an jeder
// Sektionsgrenze erschien ein dunkler Streifen, dessen Hoehe sich beim
// Scrollen aenderte. Die 20 px Bewegung waren den Fehler nicht wert.

// --- 10. Section Divider Glow Animation ---
(function() {
  // Welche Sektionen eine leuchtende Trennlinie bekommen, ist LP-Sache.
  const dividerSections = document.querySelectorAll(
    LP.trennlinien || 'section, footer');
  // Ohne Observer blieben alle Trennlinien fuer immer auf opacity:0.
  if (typeof IntersectionObserver !== 'function') {
    dividerSections.forEach(s => s.classList.add('section-divider-visible'));
    return;
  }
  const dividerObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('section-divider-visible');
        dividerObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });
  dividerSections.forEach(s => dividerObserver.observe(s));
  nachleseFuer(dividerSections,
    function(el) { return el.classList.contains('section-divider-visible'); },
    function(el) { el.classList.add('section-divider-visible'); dividerObserver.unobserve(el); });
})();

// --- WebGL Background Shader ---
(function() {
  var canvas = document.getElementById('bgShader');
  if (!canvas) return;
  // Auf schmalen Screens abschalten: der Dauer-Renderer kostet auf
  // Mittelklasse-Android Framerate und Akku, ohne sichtbaren Gewinn.
  if (window.matchMedia('(max-width: 900px)').matches) {
    canvas.style.display = 'none';
    return;
  }

  var gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
  if (!gl) return; // Graceful fallback — page works without shader

  // Vertex shader — fullscreen quad
  var vertSrc = [
    'attribute vec2 a_pos;',
    'void main() { gl_Position = vec4(a_pos, 0.0, 1.0); }'
  ].join('\n');

  // Fragment shader — subtle gold energy flow on dark background
  var fragSrc = [
    'precision mediump float;',
    'uniform float u_time;',
    'uniform vec2 u_res;',
    'uniform float u_scroll;',
    '',
    '// Simplex-style noise',
    'vec3 mod289(vec3 x) { return x - floor(x * (1.0/289.0)) * 289.0; }',
    'vec2 mod289(vec2 x) { return x - floor(x * (1.0/289.0)) * 289.0; }',
    'vec3 permute(vec3 x) { return mod289(((x*34.0)+1.0)*x); }',
    '',
    'float snoise(vec2 v) {',
    '  const vec4 C = vec4(0.211324865405187, 0.366025403784439,',
    '                     -0.577350269189626, 0.024390243902439);',
    '  vec2 i = floor(v + dot(v, C.yy));',
    '  vec2 x0 = v - i + dot(i, C.xx);',
    '  vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);',
    '  vec4 x12 = x0.xyxy + C.xxzz;',
    '  x12.xy -= i1;',
    '  i = mod289(i);',
    '  vec3 p = permute(permute(i.y + vec3(0.0, i1.y, 1.0)) + i.x + vec3(0.0, i1.x, 1.0));',
    '  vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);',
    '  m = m*m; m = m*m;',
    '  vec3 x = 2.0 * fract(p * C.www) - 1.0;',
    '  vec3 h = abs(x) - 0.5;',
    '  vec3 ox = floor(x + 0.5);',
    '  vec3 a0 = x - ox;',
    '  m *= 1.79284291400159 - 0.85373472095314 * (a0*a0 + h*h);',
    '  vec3 g;',
    '  g.x = a0.x * x0.x + h.x * x0.y;',
    '  g.yz = a0.yz * x12.xz + h.yz * x12.yw;',
    '  return 130.0 * dot(m, g);',
    '}',
    '',
    'void main() {',
    '  vec2 uv = gl_FragCoord.xy / u_res;',
    '  float aspect = u_res.x / u_res.y;',
    '  vec2 p = vec2(uv.x * aspect, uv.y);',
    '',
    '  // Scroll offset — shader flows with the page',
    '  float scrollOff = u_scroll * 0.0003;',
    '',
    '  // Layered noise for organic movement',
    '  float t = u_time * 0.08;',
    '  float n1 = snoise(p * 1.5 + vec2(t * 0.3, scrollOff + t * 0.2)) * 0.5 + 0.5;',
    '  float n2 = snoise(p * 3.0 + vec2(-t * 0.2, scrollOff - t * 0.15)) * 0.5 + 0.5;',
    '  float n3 = snoise(p * 5.0 + vec2(t * 0.4, scrollOff + t * 0.3)) * 0.5 + 0.5;',
    '',
    '  // Combine layers',
    '  float flow = n1 * 0.6 + n2 * 0.3 + n3 * 0.1;',
    '',
    '  // Gold color palette',
    '  vec3 darkGold = vec3(0.12, 0.09, 0.02);',
    '  vec3 midGold = vec3(0.35, 0.28, 0.08);',
    '  vec3 brightGold = vec3(0.78, 0.65, 0.30);',
    '',
    '  // Very subtle color — mostly dark with faint gold wisps',
    '  float intensity = smoothstep(0.45, 0.75, flow) * 0.12;',
    '  intensity += smoothstep(0.7, 0.95, flow) * 0.06;',
    '',
    '  // Occasional brighter veins',
    '  float vein = smoothstep(0.85, 0.92, flow) * 0.08;',
    '',
    '  vec3 col = mix(vec3(0.02, 0.02, 0.02), darkGold, intensity * 2.0);',
    '  col = mix(col, midGold, intensity);',
    '  col += brightGold * vein;',
    '',
    '  // Darken edges (vignette)',
    '  float vig = 1.0 - smoothstep(0.3, 1.4, length(uv - 0.5) * 1.8);',
    '  col *= 0.7 + vig * 0.3;',
    '',
    '  gl_FragColor = vec4(col, 1.0);',
    '}'
  ].join('\n');

  function compile(type, src) {
    var s = gl.createShader(type);
    gl.shaderSource(s, src);
    gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
      console.warn('Shader error:', gl.getShaderInfoLog(s));
      return null;
    }
    return s;
  }

  var vs = compile(gl.VERTEX_SHADER, vertSrc);
  var fs = compile(gl.FRAGMENT_SHADER, fragSrc);
  if (!vs || !fs) return;

  var prog = gl.createProgram();
  gl.attachShader(prog, vs);
  gl.attachShader(prog, fs);
  gl.linkProgram(prog);
  if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return;
  gl.useProgram(prog);

  // Fullscreen quad
  var buf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1, 1,-1, -1,1, 1,1]), gl.STATIC_DRAW);
  var aPos = gl.getAttribLocation(prog, 'a_pos');
  gl.enableVertexAttribArray(aPos);
  gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

  var uTime = gl.getUniformLocation(prog, 'u_time');
  var uRes = gl.getUniformLocation(prog, 'u_res');
  var uScroll = gl.getUniformLocation(prog, 'u_scroll');

  var scrollY = 0;
  window.addEventListener('scroll', function() { scrollY = window.scrollY; }, { passive: true });

  function resize() {
    var dpr = Math.min(window.devicePixelRatio || 1, 1.5); // Cap for performance
    canvas.width = window.innerWidth * dpr;
    canvas.height = window.innerHeight * dpr;
    gl.viewport(0, 0, canvas.width, canvas.height);
  }
  resize();
  window.addEventListener('resize', resize);

  // Reduce motion support
  var reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  var start = performance.now();
  function frame() {
    var t = (performance.now() - start) / 1000;
    gl.uniform1f(uTime, t);
    gl.uniform2f(uRes, canvas.width, canvas.height);
    gl.uniform1f(uScroll, scrollY);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    if (!reducedMotion) requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
})();

// --- Dauerhafte Kaufleiste (mobil) ---
// Erscheint, sobald der Hero durchgescrollt ist, und ersetzt damit die
// Inline-CTAs, die aus den mittleren Sektionen entfernt wurden.
(function() {
  var bar = document.getElementById('stickyCta');
  var hero = document.getElementById('hero');
  if (!bar || !hero) return;

  var sichtbar = false;

  // Grosse Inline-Kauf-Buttons (Hero, Final-CTA). Die Knoepfe an den
  // Angebotskarten tragen .js-kasse statt .js-buy und stehen darum nicht in
  // dieser Liste — pruefen() deckt sie ueber imBild(ticket) fuer die ganze
  // Sektion ab.
  var inlineCtas = [].slice.call(document.querySelectorAll('.js-buy.btn--large'));

  function imBild(el) {
    var r = el.getBoundingClientRect();
    return r.top < window.innerHeight && r.bottom > 0;
  }

  // Die Hero-Hoehe aendert sich beim Scrollen nicht. Einmal lesen statt in
  // jedem Frame — offsetHeight erzwingt sonst jedes Mal Layout.
  var heroHoehe = hero.offsetHeight;
  var ticket = document.getElementById('ticket');

  function pruefen() {
    // erst ab Hero-Ende — und nie, solange ein echter Kauf-Button im Bild steht
    var unterHero = window.scrollY > heroHoehe - 80;
    var ctaImBild = (ticket && imBild(ticket)) || inlineCtas.some(imBild);
    var soll = unterHero && !ctaImBild;
    if (soll === sichtbar) return;
    sichtbar = soll;
    bar.classList.toggle('visible', soll);
    bar.setAttribute('aria-hidden', soll ? 'false' : 'true');
    // aria-hidden allein nimmt den Knopf nur aus dem Vorlesebaum — mit der
    // Tabulatortaste war er weiter erreichbar und der Fokus landete auf etwas,
    // das niemand sieht.
    var knopf = bar.querySelector('a, button');
    if (knopf) {
      if (soll) knopf.removeAttribute('tabindex');
      else knopf.setAttribute('tabindex', '-1');
    }
    document.body.classList.toggle('has-sticky-cta', soll);
  }

  // Ebenfalls auf einen Frame gedrosselt. pruefen() liest hero.offsetHeight
  // und mehrere getBoundingClientRect — pro Scroll-Ereignis statt pro Frame
  // waere das mehrfach erzwungenes Layout ohne sichtbaren Gewinn.
  var leisteGeplant = false;
  function planeLeiste() {
    if (leisteGeplant) return;
    leisteGeplant = true;
    requestAnimationFrame(function() { leisteGeplant = false; pruefen(); });
  }
  window.addEventListener('scroll', planeLeiste, { passive: true });
  window.addEventListener('resize', function() {
    heroHoehe = hero.offsetHeight;   // nur hier neu messen
    planeLeiste();
  }, { passive: true });
  pruefen();
})();


// ============================================================
// FUNNEL — mehrstufiges Formular als Vollbild-Overlay
//
// Stammt aus den Recruiting-Landingpages, dort seit August produktiv.
// Hier generisch: was der Funnel fragt und welches Feld eine Antwort
// fuellt, steht ausschliesslich im Markup. Diese Datei kennt keine
// einzige Frage.
//
//   <div class="funnel-overlay" id="funnelOverlay">
//     <div class="funnel-progress" id="funnelProgress"></div>
//     <div class="funnel-step active" data-step="1" data-feld="rolle">
//       <button class="funnel-option" data-value="Coach">…</button>
//     </div>
//     <div class="funnel-step" data-step="2" data-kontakt>…Formular…</div>
//   </div>
//
// data-feld nennt das versteckte Eingabefeld, in das die Antwort geht.
// Der letzte Schritt traegt data-kontakt und enthaelt das echte Formular.
// ============================================================
(function () {
  var overlay = document.getElementById('funnelOverlay');
  if (!overlay) return;

  var balken = document.getElementById('funnelProgress');
  var schritte = [].slice.call(overlay.querySelectorAll('.funnel-step'));
  var formular = overlay.querySelector('form');
  if (!schritte.length) return;

  var anzahl = schritte.length;
  var aktuell = 1;
  var tAus = null, tEin = null;

  function fortschritt() {
    if (balken) balken.style.width = (aktuell / anzahl) * 100 + '%';
  }

  function zeige(nr) {
    var jetzt = overlay.querySelector('.funnel-step.active');
    var naechst = overlay.querySelector('.funnel-step[data-step="' + nr + '"]');
    if (!naechst) return;
    // Laufende Uebergaenge abbrechen, sonst stapeln sich die Timer und ein
    // schnell geklickter Schritt bleibt halb sichtbar stehen.
    if (tAus) clearTimeout(tAus);
    if (tEin) clearTimeout(tEin);
    if (jetzt) {
      jetzt.classList.remove('active');
      jetzt.classList.add('exit-left');
      tAus = setTimeout(function () { jetzt.classList.remove('exit-left'); }, 500);
    }
    tEin = setTimeout(function () {
      naechst.classList.add('active');
      var erstes = naechst.querySelector('input, textarea, select');
      if (erstes && window.matchMedia('(min-width: 901px)').matches) erstes.focus();
    }, 80);
    aktuell = nr;
    fortschritt();
  }

  function auf() {
    schritte.forEach(function (s) { s.classList.remove('active', 'exit-left'); });
    var erster = overlay.querySelector('.funnel-step[data-step="1"]');
    if (erster) erster.classList.add('active');
    aktuell = 1;
    overlay.classList.add('open');
    document.body.style.overflow = 'hidden';
    fortschritt();
    // Startpunkt des Funnels. Alles Weitere wird dagegen gerechnet: wer
    // hier zaehlt und bei Frage 2 fehlt, ist bei Frage 1 abgesprungen.
    melde(overlay.dataset.ereignisStart);
    if (erster) melde(erster.dataset.ereignis);
  }

  function zu() {
    overlay.classList.remove('open');
    document.body.style.overflow = '';
    // Erst nach dem Ausblenden zuruecksetzen, sonst blitzt Schritt 1 auf.
    setTimeout(function () {
      schritte.forEach(function (s) { s.classList.remove('active', 'exit-left'); });
      aktuell = 1;
    }, 500);
  }

  document.querySelectorAll('.js-funnel').forEach(function (b) {
    b.addEventListener('click', function (e) { e.preventDefault(); auf(); });
  });
  var schliessen = document.getElementById('funnelClose');
  if (schliessen) schliessen.addEventListener('click', zu);
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && overlay.classList.contains('open')) zu();
  });

  // --- Antwortknoepfe ---
  overlay.querySelectorAll('.funnel-option').forEach(function (btn) {
    btn.addEventListener('click', function () {
      if (btn.disabled) return;
      var schritt = btn.closest('.funnel-step');
      var alle = schritt.querySelectorAll('.funnel-option');
      // Sofort sperren: sonst waehlt ein Doppelklick zwei Antworten und
      // ueberspringt einen Schritt.
      alle.forEach(function (o) { o.disabled = true; });
      alle.forEach(function (o) { o.classList.remove('selected'); });
      btn.classList.add('selected');

      var feld = schritt.getAttribute('data-feld');
      var antwort = btn.getAttribute('data-value') || '';
      if (feld && formular) {
        var ziel = formular.querySelector('[name="' + feld + '"]');
        if (ziel) ziel.value = antwort;
      }

      setTimeout(function () {
        alle.forEach(function (o) { o.disabled = false; });
        var naechsteNr = parseInt(schritt.getAttribute('data-step'), 10) + 1;
        // Das Ereignis des erreichten Schritts, mit der Antwort des
        // vorigen als Merkmal. So ist in der Auswertung sichtbar, WER
        // abspringt, nicht nur wie viele.
        var naechst = overlay.querySelector('.funnel-step[data-step="' + naechsteNr + '"]');
        if (naechst) {
          var daten = {};
          if (feld) daten[feld] = antwort;
          melde(naechst.dataset.ereignis, daten);
        }
        zeige(naechsteNr);
      }, 220);
    });
  });

  // --- Kontaktschritt absenden ---
  if (!formular) return;

  function meckern(el, hinweisId, schlecht) {
    var hinweis = hinweisId ? document.getElementById(hinweisId) : null;
    var huelle = el.closest('.form__phone-wrap') || el;
    huelle.classList.toggle('error', schlecht);
    if (hinweis) hinweis.classList.toggle('visible', schlecht);
    return !schlecht;
  }

  formular.querySelectorAll('input').forEach(function (el) {
    el.addEventListener('input', function () {
      (el.closest('.form__phone-wrap') || el).classList.remove('error');
      var h = el.getAttribute('data-fehler');
      if (h && document.getElementById(h)) document.getElementById(h).classList.remove('visible');
    });
  });

  function pruefe() {
    var ok = true;
    formular.querySelectorAll('[data-pflicht]').forEach(function (el) {
      var wert = (el.value || '').trim();
      var art = el.getAttribute('data-pflicht');
      var schlecht =
        art === 'email' ? !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(wert) :
        art === 'tel'   ? wert.replace(/\D/g, '').length < 6 :
                          wert.length < 2;
      if (!meckern(el, el.getAttribute('data-fehler'), schlecht)) ok = false;
    });
    return ok;
  }

  formular.addEventListener('submit', function (e) {
    e.preventDefault();
    if (!pruefe()) return;

    var knopf = formular.querySelector('[type="submit"]');
    if (knopf) { knopf.disabled = true; knopf.dataset.text = knopf.textContent; knopf.textContent = 'Wird gesendet …'; }

    // Vorwahl und Nummer zu einem Feld zusammenfuehren, damit in Airtable
    // eine anrufbare Nummer steht und nicht zwei Bruchstuecke.
    var vorwahl = formular.querySelector('[name="vorwahl"]');
    var telefon = formular.querySelector('[name="telefon"]');
    if (vorwahl && telefon && telefon.value.indexOf('+') !== 0) {
      telefon.value = vorwahl.value + ' ' + telefon.value.trim();
    }

    // Kennung fuer die Dankesseite: sie meldet den Lead genau einmal und
    // nur, wenn wirklich abgeschickt wurde. Ein blosser Aufruf von /danke/
    // zaehlt dadurch nicht mit.
    var kennung = 'lead-' + Date.now() + '-' + Math.random().toString(36).slice(2, 10);
    try { localStorage.setItem('lead_offen', kennung); } catch (err) {}

    var ziel = formular.getAttribute('data-weiter') || '/danke/';
    fetch('/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams(new FormData(formular)).toString()
    }).then(function () {
      window.location.href = ziel;
    }).catch(function () {
      // Netlify nicht erreichbar: der Nutzer hat seine Daten eingegeben und
      // soll nicht im Nichts stehen. Er bekommt den Guide, die Einsendung
      // ist aber verloren — deshalb hier KEINE Lead-Kennung stehen lassen.
      try { localStorage.removeItem('lead_offen'); } catch (err) {}
      window.location.href = ziel;
    });
  });
})();
