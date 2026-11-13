/* Hero-Mandala: dasselbe wie im Abschluss (mandala.js), auf Elfenbein aber
   dunkler. Einmal nach dem Zeichnen einfaerben statt per CSS-Filter, der die
   drehende Flaeche in jedem Bild neu rechnen muesste. mandala.js zeichnet bei
   groesseren Groessenaenderungen neu (setzt width): dann erneut einfaerben. */
(function () {
  'use strict';
  var leinwand = document.querySelector('.hh__mandala canvas');
  if (!leinwand || !leinwand.getContext) return;
  function einfaerben() {
    var c = leinwand.getContext('2d');
    c.save();
    c.setTransform(1, 0, 0, 1, 0, 0);
    c.globalCompositeOperation = 'source-in';
    c.fillStyle = '#7D6322';
    c.fillRect(0, 0, leinwand.width, leinwand.height);
    c.restore();
  }
  einfaerben();
  if ('MutationObserver' in window) new MutationObserver(einfaerben).observe(leinwand, { attributes: true, attributeFilter: ['width'] });
})();

/* Variante hell: Die Video-Buehne in der Hero kippt beim Scrollen von schraeg
   nach vorne in die Waagrechte. Nur mit Bewegung, sonst steht sie gerade. */
(function () {
  'use strict';
  var karte = document.querySelector('.hh__karte');
  if (!karte || !document.documentElement.classList.contains('bewegung')) return;
  var ist = 0, soll = 0, laeuft = false;
  function ziel() {
    var r = karte.getBoundingClientRect(), vh = window.innerHeight;
    return Math.max(0, Math.min(1, (vh * 0.95 - r.top) / (vh * 0.55)));
  }
  function bild() {
    ist += (soll - ist) * 0.12;
    if (Math.abs(soll - ist) < 0.001) ist = soll;
    karte.style.setProperty('--kipp', (16 * (1 - ist)).toFixed(2) + 'deg');
    karte.style.setProperty('--sk', (0.94 + 0.06 * ist).toFixed(4));
    if (ist !== soll) requestAnimationFrame(bild); else laeuft = false;
  }
  function weck() { soll = ziel(); if (!laeuft) { laeuft = true; requestAnimationFrame(bild); } }
  window.addEventListener('scroll', weck, { passive: true });
  window.addEventListener('resize', weck);
  weck();
})();

/* Testimonial-Videos: Vorschaubild, Player erst auf Klick (13.11.2026)
   kern.js setzt nach der Zustimmung in jede .testi-video[data-vimeo] sofort
   einen Vimeo-Player. Im Laufband waren das mit den Kopien 24 Player, die
   mitten in der Bewegung luden. Hier bleibt das Vorschaubild stehen; ein
   Klick (oder Enter/Leertaste) stimmt bei Bedarf zu und baut genau diesen
   einen Player, der sofort abspielt. Gilt nur fuer die Testimonials
   (data-laufband), die Live Events bleiben bei kern.js. Laeuft auch bei
   "Bewegung reduzieren". */
(function () {
  'use strict';
  var bereiche = Array.prototype.slice.call(document.querySelectorAll('[data-laufband]'));
  if (!bereiche.length || typeof window.baueVimeoIframe !== 'function') return;
  function zugestimmt() { try { return localStorage.getItem('consent_v1') === 'all'; } catch (e) { return false; } }

  // Originale zur "Fassade" machen: ohne data-vimeo laesst kern.js sie in Ruhe
  bereiche.forEach(function (r) {
    r.querySelectorAll('.testi-video[data-vimeo]').forEach(function (fig) {
      var p = fig.querySelector('.testi-video__poster');
      if (!p) return;                     // Player laeuft schon: so lassen
      fig.setAttribute('data-video-id', fig.getAttribute('data-vimeo'));
      fig.removeAttribute('data-vimeo');
      fig.querySelectorAll('iframe, .video-replay').forEach(function (x) { x.remove(); });
      p.setAttribute('role', 'button');
      p.tabIndex = 0;
      p.removeAttribute('aria-hidden');
      var t = fig.getAttribute('data-titel');
      p.setAttribute('aria-label', 'Video ansehen' + (t ? ': ' + t : ''));
    });
  });

  // Nach der Zustimmung den Hinweis "Mit Klick werden Cookies akzeptiert" weg
  function freigeben() {
    document.querySelectorAll('[data-laufband] .testi-video__poster.is-blocked').forEach(function (p) {
      p.classList.remove('is-blocked');
      var h = p.querySelector('.testi-video__consent');
      if (h) h.remove();
    });
  }

  function spielen(fig) {
    if (!fig || fig.querySelector('iframe')) return;
    var id = (fig.getAttribute('data-video-id') || '').match(/\d{6,}/);
    if (!id) return;
    if (!zugestimmt() && typeof window.acceptAll === 'function') window.acceptAll();
    freigeben();
    var f = window.baueVimeoIframe(id[0], fig.getAttribute('data-titel') || '', false, fig.getAttribute('data-hash'), 'dnt=1&autoplay=1');
    if (fig.closest('[data-klon]')) f.tabIndex = -1;
    f.addEventListener('load', function () { var ph = fig.querySelector('.testi-video__poster'); if (ph) ph.remove(); });
    fig.insertBefore(f, fig.firstChild);
    fig.dispatchEvent(new CustomEvent('video-start', { bubbles: true, detail: { iframe: f } }));
  }

  bereiche.forEach(function (r) {
    r.addEventListener('click', function (e) {
      var p = e.target.closest('.testi-video__poster');
      if (!p || !r.contains(p)) return;
      e.preventDefault();
      spielen(p.closest('.testi-video'));
    });
    r.addEventListener('keydown', function (e) {
      if (e.key !== 'Enter' && e.key !== ' ') return;
      var p = e.target.closest && e.target.closest('.testi-video__poster');
      if (!p || !r.contains(p)) return;
      e.preventDefault();
      spielen(p.closest('.testi-video'));
    });
  });
  // Zustimmung ueber die Cookie-Leiste oder die Einstellungen
  document.addEventListener('click', function () { setTimeout(function () { if (zugestimmt()) freigeben(); }, 0); }, true);
  if (zugestimmt()) freigeben();
})();

/* Testimonials als Endlos-Laufband (Lukas, 13.11.2026)
   Obere Reihe laeuft nach rechts, untere nach links, ohne Ende. Stehen
   bleibt eine Reihe, solange die Maus darauf ist oder eines ihrer Videos
   laeuft. Am Handy und bei "Bewegung reduzieren": normales Wischen. */
(function () {
  'use strict';
  var reihen = Array.prototype.slice.call(document.querySelectorAll('[data-laufband]'));
  if (!reihen.length || !document.documentElement.classList.contains('bewegung')) return;
  var BREIT = window.matchMedia('(min-width: 761px)');
  var GESCHWINDIGKEIT = 36;   // Pixel pro Sekunde
  function zugestimmt() { try { return localStorage.getItem('consent_v1') === 'all'; } catch (e) { return false; } }

  // Vorlagen fuer die Kopien: die Karten ohne Player (siehe oben)
  function vorlage(k) {
    var c = k.cloneNode(true);
    c.querySelectorAll('iframe, .video-replay').forEach(function (x) { x.remove(); });
    return c;
  }
  var baender = reihen.map(function (reihe, i) {
    var spur = reihe.querySelector('.karussell__spur');
    var original = Array.prototype.slice.call(spur.children);
    return { reihe: reihe, spur: spur, original: original, vorlagen: original.map(vorlage),
             richtung: i % 2 === 0 ? 1 : -1, x: 0, v: 1, runde: 0, maus: false, spielt: false, sichtbar: false, an: false, klone: null };
  });

  // Player beobachten: laeuft ein Video, steht die Reihe
  function beobachte(b, f) {
    if (f.hasAttribute('data-beobachtet')) return;
    f.setAttribute('data-beobachtet', '');
    function los() {
      try {
        var pl = new window.Vimeo.Player(f);
        pl.on('play', function () { b.spielt = true; });
        pl.on('pause', function () { b.spielt = false; wecke(); });
        pl.on('ended', function () { b.spielt = false; wecke(); });
      } catch (err) {}
    }
    if (window.Vimeo && window.Vimeo.Player) los();
    else if (typeof window.ladePlayerApi === 'function') window.ladePlayerApi(los);
  }

  function messen(b) {
    if (!b.klone) return;
    b.runde = b.klone[0].offsetLeft - b.original[0].offsetLeft;
    if (b.x === 0 && b.richtung > 0) b.x = -b.runde;
  }
  function aufbauen(b) {
    if (b.an) return;
    b.klone = [];
    var frei = zugestimmt();
    for (var r = 0; r < 2; r++) b.vorlagen.forEach(function (k) {
      var c = k.cloneNode(true);
      c.setAttribute('aria-hidden', 'true');
      c.setAttribute('data-klon', '');
      c.querySelectorAll('a, button, [tabindex], [role="button"]').forEach(function (el) { el.tabIndex = -1; });
      if (frei) c.querySelectorAll('.testi-video__poster.is-blocked').forEach(function (p) {
        p.classList.remove('is-blocked');
        var h = p.querySelector('.testi-video__consent');
        if (h) h.remove();
      });
      b.spur.appendChild(c);
      b.klone.push(c);
    });
    b.reihe.classList.add('laufband--an');
    b.reihe.setAttribute('data-zuschnitt', '');
    b.an = true; b.x = 0;
    messen(b);
  }
  function abbauen(b) {
    if (!b.an) return;
    b.klone.forEach(function (c) { c.remove(); });
    b.klone = null; b.an = false;
    b.reihe.classList.remove('laufband--an');
    b.reihe.removeAttribute('data-zuschnitt');
    b.spur.style.transform = '';
  }

  var laeuft = false, letzte = 0;
  function bild(t) {
    var dt = letzte ? Math.min(0.05, (t - letzte) / 1000) : 0;
    letzte = t;
    var weiter = false;
    baender.forEach(function (b) {
      if (!b.an || !b.sichtbar || !b.runde) return;
      var halt = b.maus || b.spielt || document.hidden;
      b.v += ((halt ? 0 : 1) - b.v) * Math.min(1, dt * 5);   // weich anhalten und anfahren
      b.x += b.richtung * GESCHWINDIGKEIT * b.v * dt;
      if (b.x > 0) b.x -= b.runde;
      if (b.x < -b.runde) b.x += b.runde;
      b.spur.style.transform = 'translate3d(' + b.x.toFixed(2) + 'px, 0, 0)';
      weiter = true;
    });
    if (weiter) requestAnimationFrame(bild); else { laeuft = false; letzte = 0; }
  }
  function wecke() { if (!laeuft) { laeuft = true; requestAnimationFrame(bild); } }

  baender.forEach(function (b) {
    b.reihe.addEventListener('pointerenter', function (e) { if (e.pointerType === 'mouse') b.maus = true; });
    b.reihe.addEventListener('pointerleave', function (e) { if (e.pointerType === 'mouse') { b.maus = false; wecke(); } });
    // Ein Video startet (Vorschaubild angeklickt): Reihe steht, bis es pausiert
    b.reihe.addEventListener('video-start', function (e) { b.spielt = true; if (e.detail && e.detail.iframe) beobachte(b, e.detail.iframe); });
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (e) { b.sichtbar = e[0].isIntersecting; if (b.sichtbar) wecke(); }, { rootMargin: '100px 0px' }).observe(b.reihe);
    } else b.sichtbar = true;
  });

  // Laeuft ein Video? Klick ins Video nimmt dem Fenster den Fokus.
  window.addEventListener('blur', function () {
    setTimeout(function () {
      var f = document.activeElement;
      baender.forEach(function (b) { if (f && f.tagName === 'IFRAME' && b.reihe.contains(f)) b.spielt = true; });
    }, 0);
  });
  window.addEventListener('focus', function () { baender.forEach(function (b) { b.spielt = false; }); wecke(); });
  baender.forEach(function (b) { b.spur.querySelectorAll('iframe').forEach(function (f) { beobachte(b, f); }); });

  function pruefe() {
    baender.forEach(function (b) { if (BREIT.matches) aufbauen(b); else abbauen(b); });
    wecke();
  }
  BREIT.addEventListener ? BREIT.addEventListener('change', pruefe) : BREIT.addListener(pruefe);
  window.addEventListener('resize', function () { baender.forEach(messen); });
  window.addEventListener('load', function () { baender.forEach(messen); });
  pruefe();
})();
