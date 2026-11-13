/* Hero-Entwuerfe: gemeinsame Bewegung, Schriftschalter, Trailer, Zahlen */
(function () {
  'use strict';
  var html = document.documentElement;
  var RUHIG = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var FEIN = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

  // Schrift: neu (Standard) oder jetzt; gemerkt, gilt fuer alle drei Entwuerfe
  var MERK = 'entwurf-schrift';
  function lies() { try { return localStorage.getItem(MERK); } catch (e) { return null; } }
  function merke(w) { try { localStorage.setItem(MERK, w); } catch (e) {} }
  var param = new URLSearchParams(location.search).get('schrift');
  var schrift = param || lies() || 'neu';
  function setzeSchrift(w) {
    schrift = w;
    html.classList.toggle('schrift-jetzt', w === 'jetzt');
    document.querySelectorAll('[data-schrift]').forEach(function (b) { b.classList.toggle('an', b.getAttribute('data-schrift') === w); });
    merke(w);
  }
  setzeSchrift(schrift);
  document.querySelectorAll('[data-schrift]').forEach(function (b) {
    b.addEventListener('click', function () { setzeSchrift(b.getAttribute('data-schrift')); });
  });

  // Woerter der Ueberschrift einzeln aufsteigen lassen
  if (!RUHIG) html.classList.add('bewegt');
  document.querySelectorAll('[data-woerter]').forEach(function (el) {
    var i = 0;
    (function geh(k) {
      Array.prototype.slice.call(k.childNodes).forEach(function (n) {
        if (n.nodeType === 3) {
          var f = document.createDocumentFragment();
          n.textContent.split(/(\s+)/).forEach(function (t) {
            if (!t) return;
            if (/^\s+$/.test(t)) { f.appendChild(document.createTextNode(t)); return; }
            var w = document.createElement('span'); w.className = 'wort';
            var s = document.createElement('span'); s.style.setProperty('--i', i++); s.textContent = t;
            w.appendChild(s); f.appendChild(w);
          });
          k.replaceChild(f, n);
        } else if (n.nodeType === 1) geh(n);
      });
    })(el);
  });

  // Zahlen zaehlen hoch
  function punkte(n) { return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, '.'); }
  document.querySelectorAll('[data-zaehle]').forEach(function (z) {
    var ziel = +z.getAttribute('data-zaehle'), nach = z.getAttribute('data-nach') || '';
    if (RUHIG) return;
    var t0 = null, dauer = 1800, verzug = +(z.getAttribute('data-verzug') || 900);
    z.textContent = '0' + nach;
    setTimeout(function () {
      requestAnimationFrame(function s(t) {
        if (!t0) t0 = t;
        var p = Math.min(1, (t - t0) / dauer), e = 1 - Math.pow(1 - p, 3);
        z.textContent = punkte(Math.round(ziel * e)) + nach;
        if (p < 1) requestAnimationFrame(s);
      });
    }, verzug);
  });

  // Trailer mit Ton im Grossformat
  var kino = document.createElement('div');
  kino.className = 'kino';
  kino.innerHTML = '<div class="kino__rahmen"></div><button class="kino__zu" type="button" aria-label="Schließen">×</button>';
  document.body.appendChild(kino);
  function zu() { kino.classList.remove('offen'); setTimeout(function () { kino.querySelector('.kino__rahmen').innerHTML = ''; }, 400); }
  kino.addEventListener('click', function (e) { if (e.target === kino || e.target.classList.contains('kino__zu')) zu(); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') zu(); });
  document.querySelectorAll('[data-trailer]').forEach(function (b) {
    b.addEventListener('click', function () {
      kino.querySelector('.kino__rahmen').innerHTML = '<iframe src="https://player.vimeo.com/video/1192498083?autoplay=1&dnt=1&title=0&byline=0&portrait=0" allow="autoplay; fullscreen; picture-in-picture" allowfullscreen title="NOW Consulting Trailer"></iframe>';
      kino.classList.add('offen');
    });
  });

  // Magnetischer Knopf
  if (FEIN && !RUHIG) document.querySelectorAll('.knopf').forEach(function (k) {
    k.addEventListener('pointermove', function (e) {
      var r = k.getBoundingClientRect();
      k.style.translate = ((e.clientX - r.left - r.width / 2) / r.width * 10).toFixed(1) + 'px ' + ((e.clientY - r.top - r.height / 2) / r.height * 6).toFixed(1) + 'px';
    });
    k.addEventListener('pointerleave', function () { k.style.translate = ''; });
  });

  window.ENTWURF = { RUHIG: RUHIG, FEIN: FEIN };
})();
