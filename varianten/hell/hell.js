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

  var baender = reihen.map(function (reihe, i) {
    var spur = reihe.querySelector('.karussell__spur');
    return { reihe: reihe, spur: spur, original: Array.prototype.slice.call(spur.children),
             richtung: i % 2 === 0 ? 1 : -1, x: 0, v: 1, runde: 0, maus: false, spielt: false, sichtbar: false, an: false, klone: null };
  });

  function messen(b) {
    if (!b.klone) return;
    b.runde = b.klone[0].offsetLeft - b.original[0].offsetLeft;
    if (b.x === 0 && b.richtung > 0) b.x = -b.runde;
  }
  function aufbauen(b) {
    if (b.an) return;
    b.klone = [];
    for (var r = 0; r < 2; r++) b.original.forEach(function (k) {
      var c = k.cloneNode(true);
      c.setAttribute('aria-hidden', 'true');
      c.setAttribute('data-klon', '');
      c.querySelectorAll('a, button, [tabindex], [role="button"]').forEach(function (el) { el.tabIndex = -1; });
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
    // Klone haben keine Klick-Handler aus kern.js: Freigabe fuer Videos weiterreichen
    b.spur.addEventListener('click', function (e) {
      var p = e.target.closest('[data-klon] .testi-video__poster.is-blocked');
      if (p && typeof window.acceptAll === 'function') { e.preventDefault(); window.acceptAll(); }
    });
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
  // Genauer mit der Vimeo-Player-API, sobald kern.js sie nach der Zustimmung geladen hat
  var versuche = 0;
  var wache = setInterval(function () {
    if (++versuche > 120) { clearInterval(wache); return; }
    if (!window.Vimeo || !window.Vimeo.Player) return;
    baender.forEach(function (b) {
      b.reihe.querySelectorAll('iframe:not([data-beobachtet])').forEach(function (f) {
        f.setAttribute('data-beobachtet', '');
        try {
          var pl = new window.Vimeo.Player(f);
          pl.on('play', function () { b.spielt = true; });
          pl.on('pause', function () { b.spielt = false; wecke(); });
          pl.on('ended', function () { b.spielt = false; wecke(); });
        } catch (err) {}
      });
    });
  }, 1500);

  function pruefe() {
    baender.forEach(function (b) { if (BREIT.matches) aufbauen(b); else abbauen(b); });
    wecke();
  }
  BREIT.addEventListener ? BREIT.addEventListener('change', pruefe) : BREIT.addListener(pruefe);
  window.addEventListener('resize', function () { baender.forEach(messen); });
  window.addEventListener('load', function () { baender.forEach(messen); });
  pruefe();
})();
