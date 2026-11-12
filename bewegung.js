/* ============================================================
   BEWEGUNG — Premium-Runde 1 der NOW-Webseite (12.11.2026)

   1. Kopfleiste wird nach dem ersten Scrollen dichter
   2. Hero: Headline-Woerter einzeln, Videokarte neigt sich mit der Maus
      und spiegelt Licht, Aura folgt dem Zeiger, magnetischer Knopf
   3. Der Spiegel: Karten drehen sich vom Symptom (Aussen) auf die
      Ursache (Innen), Schalter und Maus drehen mit
   4. Wer ist unser Kunde: Haende oeffnen sich, Karten wachsen aus den
      Pillen (nur mit Platz, sonst ruhige Fassung)
   5. Zwei Welten: Bewusstsein und Business gleiten zusammen
   6. Die 7 Schritte: gepinnte Buehne, ein Schritt pro Scrollabschnitt
   7. Zusammenarbeit: Kachel-Wand mit naechstem Live-Call, Uhr und Chat

   Alles Bewegte haengt an html.bewegung (im <head> gesetzt, fehlt bei
   "Bewegung reduzieren"). Ohne diese Klasse und ohne dieses Skript ist
   jede Sektion vollstaendig und statisch lesbar.

   Eine einzige requestAnimationFrame-Schleife, die nur laeuft, solange
   eine Aufgabe sie braucht. Gelesen wird vor dem Schreiben, bewegt wird
   ausschliesslich ueber transform/opacity/filter.
   ============================================================ */
(function () {
  'use strict';

  var html = document.documentElement;
  var BEWEGUNG = html.classList.contains('bewegung');
  var FEINER_ZEIGER = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

  function klemme(v, a, b) { return v < a ? a : v > b ? b : v; }
  function mische(a, b, t) { return a + (b - a) * t; }
  function abschnitt(p, von, bis) { return klemme((p - von) / (bis - von), 0, 1); }
  function weich(t) { return t * t * (3 - 2 * t); }
  function ausrollen(t) { return 1 - Math.pow(1 - t, 3); }
  function inOut(t) { return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; }
  // Bildratenunabhaengiges Nachziehen: k = wie schnell (pro Sekunde)
  function folge(ist, soll, k, dt) { return ist + (soll - ist) * (1 - Math.exp(-k * dt)); }

  /* ---------- Eine Schleife fuer alles ---------- */
  var aufgaben = [];
  var laeuft = false, letzte = 0;
  function schleife(t) {
    var dt = letzte ? Math.min(0.05, (t - letzte) / 1000) : 1 / 60;
    letzte = t;
    var weiter = false;
    for (var i = 0; i < aufgaben.length; i++) {
      if (aufgaben[i].aktiv && aufgaben[i].bild(dt, t) !== false) weiter = true;
    }
    if (weiter) requestAnimationFrame(schleife);
    else { laeuft = false; letzte = 0; }
  }
  function wecke() { if (!laeuft) { laeuft = true; requestAnimationFrame(schleife); } }
  function aufgabe(bild) { var a = { aktiv: false, bild: bild }; aufgaben.push(a); return a; }

  // Sichtbarkeit: Aufgaben laufen nur, solange ihre Sektion in der Naehe ist
  function beobachte(el, a, rand) {
    if (!('IntersectionObserver' in window)) { a.aktiv = true; wecke(); return; }
    new IntersectionObserver(function (e) {
      a.aktiv = e[0].isIntersecting;
      if (a.aktiv) wecke();
    }, { rootMargin: rand || '200px 0px' }).observe(el);
  }

  /* ============================================================
     1. KOPFLEISTE
     ============================================================ */
  var kopf = document.getElementById('kopf');
  function kopfZustand() { if (kopf) kopf.classList.toggle('kopf--gescrollt', window.scrollY > 30); }
  window.addEventListener('scroll', kopfZustand, { passive: true });
  kopfZustand();

  /* ============================================================
     2. HERO
     ============================================================ */
  // 2a. Headline in Woerter teilen. Das weiche Trennzeichen in
  // "Unternehmens&shy;beratung" bleibt im Wort, die Leerzeichen bleiben
  // echte Textknoten — Umbruch und Vorlesen funktionieren wie vorher.
  function teileWoerter(el) {
    var nr = 0;
    (function geh(knoten) {
      Array.prototype.slice.call(knoten.childNodes).forEach(function (k) {
        if (k.nodeType === 3) {
          var frag = document.createDocumentFragment();
          k.textContent.split(/(\s+)/).forEach(function (teil) {
            if (!teil) return;
            if (/^\s+$/.test(teil)) { frag.appendChild(document.createTextNode(teil)); return; }
            var wort = document.createElement('span');
            wort.className = 'wort';
            var innen = document.createElement('span');
            innen.className = 'wort__innen';
            innen.style.setProperty('--i', nr++);
            innen.textContent = teil;
            wort.appendChild(innen);
            frag.appendChild(wort);
          });
          knoten.replaceChild(frag, k);
        } else if (k.nodeType === 1) {
          geh(k);
        }
      });
    })(el);
    el.classList.add('ist-geteilt');
  }
  if (BEWEGUNG) document.querySelectorAll('[data-woerter]').forEach(teileWoerter);

  // 2b. Videokarte: Neigung, Lichtreflex, Aura. Nur mit Maus.
  var hero = document.getElementById('hero');
  var buehne = document.querySelector('.hero__buehne');
  var kippe = document.querySelector('[data-kippe]');
  var glanz = document.querySelector('.hero__glanzlicht');
  if (BEWEGUNG && FEINER_ZEIGER && hero && buehne && kippe) {
    var soll = { x: 0, y: 0, an: 0, ax: 72, ay: 38 };
    var ist = { x: 0, y: 0, an: 0, ax: 72, ay: 38 };
    var neigung = aufgabe(function (dt) {
      ist.x = folge(ist.x, soll.x, 7, dt);
      ist.y = folge(ist.y, soll.y, 7, dt);
      ist.an = folge(ist.an, soll.an, 5, dt);
      ist.ax = folge(ist.ax, soll.ax, 4, dt);
      ist.ay = folge(ist.ay, soll.ay, 4, dt);
      kippe.style.setProperty('--rx', (-ist.y * 7).toFixed(2) + 'deg');
      kippe.style.setProperty('--ry', (ist.x * 9).toFixed(2) + 'deg');
      if (glanz) {
        glanz.style.setProperty('--gx', (50 + ist.x * 45).toFixed(1) + '%');
        glanz.style.setProperty('--gy', (40 + ist.y * 55).toFixed(1) + '%');
        glanz.style.setProperty('--go', ist.an.toFixed(3));
      }
      hero.style.setProperty('--ax', ist.ax.toFixed(1) + '%');
      hero.style.setProperty('--ay', ist.ay.toFixed(1) + '%');
      return Math.abs(ist.x - soll.x) + Math.abs(ist.y - soll.y) + Math.abs(ist.an - soll.an) +
             Math.abs(ist.ax - soll.ax) / 100 + Math.abs(ist.ay - soll.ay) / 100 > 0.002;
    });
    neigung.aktiv = true;
    hero.addEventListener('pointermove', function (e) {
      var r = buehne.getBoundingClientRect();
      var h = hero.getBoundingClientRect();
      soll.x = klemme((e.clientX - (r.left + r.width / 2)) / (r.width * 0.75), -1, 1);
      soll.y = klemme((e.clientY - (r.top + r.height / 2)) / (r.height * 0.9), -1, 1);
      var drin = e.clientX > r.left - 80 && e.clientX < r.right + 80 && e.clientY > r.top - 80 && e.clientY < r.bottom + 80;
      soll.an = drin ? 1 : 0.35;
      soll.ax = ((e.clientX - h.left) / h.width) * 100;
      soll.ay = ((e.clientY - h.top) / h.height) * 100;
      wecke();
    });
    hero.addEventListener('pointerleave', function () {
      soll.x = 0; soll.y = 0; soll.an = 0; soll.ax = 72; soll.ay = 38;
      wecke();
    });
  }

  // 2c. Magnetischer Knopf: zieht sich leicht zum Zeiger
  if (BEWEGUNG && FEINER_ZEIGER) {
    document.querySelectorAll('[data-magnet]').forEach(function (knopf) {
      knopf.addEventListener('pointermove', function (e) {
        var r = knopf.getBoundingClientRect();
        var dx = (e.clientX - (r.left + r.width / 2)) / (r.width / 2);
        var dy = (e.clientY - (r.top + r.height / 2)) / (r.height / 2);
        knopf.style.translate = (dx * 7).toFixed(1) + 'px ' + (dy * 5).toFixed(1) + 'px';
      });
      knopf.addEventListener('pointerleave', function () { knopf.style.translate = ''; });
    });
  }

  /* ============================================================
     3. DER SPIEGEL — Aussen und Innen
     Jede Karte dreht sich auf "Innen", sobald ihre Mitte unter etwa 56 %
     der Fensterhoehe steigt (zurueck erst wieder ab 66 %, damit sie an
     der Grenze nicht flackert). Spalten drehen versetzt, so laeuft eine
     Welle durch die Reihe. Der Schalter uebernimmt dann von Hand; Maus
     oder Tippen dreht eine einzelne Karte auf die andere Seite.
     ============================================================ */
  var spiegel = document.querySelector('.spiegel');
  if (BEWEGUNG && spiegel) (function () {
    var raster = spiegel.querySelector('.spiegel__raster');
    var karten = Array.prototype.slice.call(spiegel.querySelectorAll('.spiegel__karte'));
    var schalter = spiegel.querySelector('.spiegel__schalter');
    var knoepfe = Array.prototype.slice.call(schalter.querySelectorAll('.spiegel__seite'));
    var modus = 'auto', vonHand = false;
    var zustand = karten.map(function () { return { auto: false, gedreht: false }; });
    spiegel.classList.add('spiegel--dreht');

    function versatz() {
      var spalten = getComputedStyle(raster).gridTemplateColumns.split(' ').length || 1;
      karten.forEach(function (k, i) { k.style.setProperty('--verzug', ((i % spalten) * 120) + 'ms'); });
    }
    function anwenden() {
      var innen = 0;
      karten.forEach(function (k, i) {
        var basis = modus === 'auto' ? zustand[i].auto : vonHand;
        var ist = zustand[i].gedreht ? !basis : basis;
        k.classList.toggle('ist-innen', ist);
        if (ist) innen++;
      });
      var schalterInnen = modus === 'auto' ? innen * 2 > karten.length : vonHand;
      schalter.classList.toggle('ist-innen', schalterInnen);
      knoepfe.forEach(function (b) {
        var an = (b.getAttribute('data-seite') === 'innen') === schalterInnen;
        b.classList.toggle('ist-an', an);
        b.setAttribute('aria-pressed', an ? 'true' : 'false');
      });
    }
    knoepfe.forEach(function (b) {
      b.addEventListener('click', function () {
        modus = 'hand';
        vonHand = b.getAttribute('data-seite') === 'innen';
        zustand.forEach(function (z) { z.gedreht = false; });
        anwenden();
      });
    });
    karten.forEach(function (k, i) {
      if (FEINER_ZEIGER) {
        k.addEventListener('pointerenter', function () { zustand[i].gedreht = true; anwenden(); });
        k.addEventListener('pointerleave', function () { zustand[i].gedreht = false; anwenden(); });
      } else {
        k.addEventListener('click', function () { zustand[i].gedreht = !zustand[i].gedreht; anwenden(); });
      }
    });
    function pruefeLage() {
      if (modus !== 'auto') return false;
      var vh = window.innerHeight, geaendert = false;
      karten.forEach(function (k, i) {
        var r = k.getBoundingClientRect();
        var mitte = r.top + r.height / 2;
        var soll = zustand[i].auto ? mitte < vh * 0.66 : mitte < vh * 0.56;
        if (soll !== zustand[i].auto) { zustand[i].auto = soll; geaendert = true; }
      });
      if (geaendert) anwenden();
      return false;
    }
    var lauf = aufgabe(pruefeLage);
    window.addEventListener('scroll', function () { if (lauf.aktiv) wecke(); }, { passive: true });
    beobachte(spiegel, lauf, '0px 0px');
    window.addEventListener('resize', versatz);
    versatz();
    pruefeLage();
    anwenden();
  })();

  /* ============================================================
     5. ZWEI WELTEN — Bewusstsein und Business werden NOW
     Nicht gepinnt: der Fortschritt kommt aus der Lage der Szene im
     Fenster (unten rein = 0, bei 20 % von oben = 1). Die Kreise gleiten
     zusammen, die Schnittmenge waechst und leuchtet, die Beschriftungen
     wandern in die Sicheln, zuletzt erscheint NOW und der Satz darunter.
     ============================================================ */
  var welten = document.querySelector('.welten');
  if (BEWEGUNG && welten) (function () {
    var szene = welten.querySelector('.welten__szene');
    var kreisA = welten.querySelector('.welten__kreis--a');
    var kreisB = welten.querySelector('.welten__kreis--b');
    var schnitt = welten.querySelector('.welten__clip');
    var glut = welten.querySelector('.welten__linse-glut');
    var kern = welten.querySelector('.welten__linse-kern');
    var logo = welten.querySelector('.welten__logo');
    var seiten = [welten.querySelector('.welten__seite--links'), welten.querySelector('.welten__seite--rechts')];
    var texte = seiten.map(function (s) { return s.querySelector('p'); });
    var ergebnis = welten.querySelector('.welten__ergebnis');
    var R = 190, MITTE = 500, D0 = 470, D1 = 240;
    var p = 0, pSoll = 0;
    welten.classList.add('welten--lebt');

    function fortschritt() {
      var r = szene.getBoundingClientRect();
      var vh = window.innerHeight;
      return klemme((vh * 0.78 - r.top) / (vh * 0.62), 0, 1);
    }
    function zeichnen() {
      var a = inOut(abschnitt(p, 0.12, 0.78));
      var d = mische(D0, D1, a);
      var ax = MITTE - d / 2, bx = MITTE + d / 2;
      kreisA.setAttribute('cx', ax.toFixed(1));
      schnitt.setAttribute('cx', ax.toFixed(1));
      kreisB.setAttribute('cx', bx.toFixed(1));
      glut.setAttribute('cx', bx.toFixed(1));
      kern.setAttribute('cx', bx.toFixed(1));
      var licht = abschnitt(p, 0.2, 0.85);
      kern.style.opacity = (0.12 + 0.5 * licht).toFixed(3);
      glut.style.opacity = (0.15 + 0.65 * licht).toFixed(3);
      var l = ausrollen(abschnitt(p, 0.6, 0.92));
      logo.style.opacity = l.toFixed(3);
      logo.style.transform = 'scale(' + (0.55 + 0.45 * l).toFixed(3) + ')';
      var breit = window.innerWidth > 760;
      if (breit) {
        // Beschriftung von der Kreismitte in die Mitte der Sichel
        var w = abschnitt(p, 0.3, 0.8);
        var lx = mische(ax, ax - R + d / 2, w), rx = mische(bx, bx + R - d / 2, w);
        seiten[0].style.left = (lx / 10).toFixed(2) + '%';
        seiten[1].style.left = (rx / 10).toFixed(2) + '%';
        // Die Beschreibungen bleiben lesbar und ruecken mit in die Sichel
      } else {
        seiten.forEach(function (s) { s.style.left = ''; });
        texte.forEach(function (el) { el.style.opacity = ''; el.style.transform = ''; });
      }
      var e = ausrollen(abschnitt(p, 0.68, 1));
      ergebnis.style.opacity = e.toFixed(3);
      ergebnis.style.transform = 'translateY(' + ((1 - e) * 18).toFixed(1) + 'px)';
    }
    var lauf = aufgabe(function (dt) {
      pSoll = fortschritt();
      p = folge(p, pSoll, 7, dt);
      if (Math.abs(p - pSoll) < 0.0005) p = pSoll;
      zeichnen();
      return p !== pSoll;
    });
    window.addEventListener('scroll', function () { if (lauf.aktiv) wecke(); }, { passive: true });
    window.addEventListener('resize', function () { zeichnen(); });
    beobachte(welten, lauf, '100px 0px');
    p = pSoll = fortschritt();
    zeichnen();
  })();

  /* ============================================================
     4. WER IST UNSER KUNDE — die Pillen-Szene
     ============================================================ */
  var kunde = document.querySelector('.kunde');
  if (BEWEGUNG && kunde) (function () {
    var strecke = kunde.querySelector('.kunde__strecke');
    var szene = kunde.querySelector('.kunde__szene');
    var haende = [kunde.querySelector('.kunde__hand--blau'), kunde.querySelector('.kunde__hand--rot')];
    var karten = Array.prototype.slice.call(kunde.querySelectorAll('.kunde__karten .fw-card'));
    var punkte = karten.map(function (k) { return Array.prototype.slice.call(k.querySelectorAll('.fw-item')); });
    var pille = [{ x: 0.6, y: 0.545 }, { x: 0.418, y: 0.558 }];
    var VERH = 873 / 900;              // Hoehe/Breite der Handbilder
    var an = false, geo = null, p = 0, pSoll = 0;

    function passt() { return window.innerWidth >= 1000 && window.innerHeight >= 640; }

    function zuruecksetzen() {
      haende.concat(karten).forEach(function (el) { el.style.transform = ''; el.style.opacity = ''; el.style.filter = ''; });
      punkte.forEach(function (liste) { liste.forEach(function (el) { el.style.opacity = ''; el.style.transform = ''; el.style.transition = ''; }); });
      haende.forEach(function (h) { h.style.removeProperty('--glanz'); });
    }

    function messen() {
      zuruecksetzen();
      var w = szene.clientWidth, h = szene.clientHeight;
      var sr = szene.getBoundingClientRect();
      var kartenBox = karten.map(function (k) {
        var r = k.getBoundingClientRect();
        return { x: r.left - sr.left, y: r.top - sr.top, w: r.width, h: r.height };
      });
      // Karten muessen in die Szene passen, sonst ruhige Fassung
      var hoehe = Math.max(kartenBox[0].h, kartenBox[1].h);
      if (hoehe > h - 8) return null;
      var vw = window.innerWidth;
      // Start: beide Haende gross nebeneinander in der Mitte
      var hb = Math.min(w * 0.36, (h * 0.98) / VERH, 470);
      var luecke = w * 0.015;
      var y0 = (h - hb * VERH) / 2;
      // Ende: kleiner, links und rechts neben den Karten, leicht verdeckt
      var s1 = 0.66;
      var he = hb * s1;
      var links = kartenBox[0].x, rechts = kartenBox[1].x + kartenBox[1].w;
      var mitteY = kartenBox[0].y + kartenBox[0].h / 2;
      // Wie weit die Szene links/rechts ueber den Bildschirmrand hinaus darf
      var randL = -sr.left + 10, randR = vw - sr.left - 10;
      var cxL = Math.max(links - he * 0.22, randL + he * 0.42);
      var cxR = Math.min(rechts + he * 0.22, randR - he * 0.42);
      return {
        w: w, h: h, hb: hb, karten: kartenBox,
        start: [{ x: w / 2 - luecke / 2 - hb, y: y0 }, { x: w / 2 + luecke / 2, y: y0 }],
        ende: [{ x: cxL - he / 2, y: mitteY - he * VERH * 0.5 }, { x: cxR - he / 2, y: mitteY - he * VERH * 0.5 }],
        s1: s1
      };
    }

    function anschalten() {
      kunde.classList.add('kunde--szene');
      szene.style.setProperty('--hand-breite', '0px');
      // Die Einblend-Klassen des Kerns wuerden die Bewegung pro Bild mit
      // ihren eigenen Uebergaengen verschmieren.
      punkte.forEach(function (liste) { liste.forEach(function (el) { el.classList.remove('reveal-item'); el.style.transition = 'none'; }); });
      geo = messen();
      if (!geo) { ausschalten(); return; }
      szene.style.setProperty('--hand-breite', geo.hb + 'px');
      an = true;
      pSoll = fortschritt(); p = pSoll;
      zeichnen();
    }
    function ausschalten() {
      an = false;
      kunde.classList.remove('kunde--szene');
      szene.style.removeProperty('--hand-breite');
      zuruecksetzen();
      punkte.forEach(function (liste) { liste.forEach(function (el) { el.style.opacity = '1'; el.style.transform = 'none'; }); });
    }

    function fortschritt() {
      var r = strecke.getBoundingClientRect();
      var weg = strecke.offsetHeight - window.innerHeight;
      return weg > 0 ? klemme(-r.top / weg, 0, 1) : 0;
    }

    function zeichnen() {
      var g = geo;
      var a = inOut(abschnitt(p, 0.04, 0.46));              // Haende oeffnen
      var glut = klemme(weich(abschnitt(p, 0, 0.32)) - 0.55 * weich(abschnitt(p, 0.55, 0.9)), 0, 1);
      var pillen = [];
      haende.forEach(function (hand, i) {
        var s = mische(1, g.s1, a);
        var x = mische(g.start[i].x, g.ende[i].x, a);
        var y = mische(g.start[i].y, g.ende[i].y, a);
        var rot = (i === 0 ? -1 : 1) * 9 * a;
        hand.style.transform = 'translate3d(' + x.toFixed(1) + 'px,' + y.toFixed(1) + 'px,0) scale(' + s.toFixed(4) + ') rotate(' + rot.toFixed(2) + 'deg)';
        hand.style.setProperty('--glanz', glut.toFixed(3));
        // Pillenmitte (ohne Drehung genuegt fuer den Startpunkt der Karte)
        pillen.push({ x: x + pille[i].x * g.hb * s, y: y + pille[i].y * g.hb * VERH * s });
      });
      karten.forEach(function (karte, i) {
        var k = ausrollen(abschnitt(p, 0.3 + i * 0.07, 0.72 + i * 0.07));
        var box = g.karten[i];
        var dx = pillen[i].x - (box.x + box.w / 2);
        var dy = pillen[i].y - (box.y + box.h / 2);
        var s = mische(0.06, 1, k);
        karte.style.transform = 'translate3d(' + (dx * (1 - k)).toFixed(1) + 'px,' + (dy * (1 - k)).toFixed(1) + 'px,0) scale(' + s.toFixed(4) + ')';
        karte.style.opacity = klemme(k * 2.4, 0, 1).toFixed(3);
        karte.style.filter = k < 0.999 ? 'blur(' + ((1 - k) * 14).toFixed(1) + 'px)' : '';
        punkte[i].forEach(function (el, j) {
          var q = ausrollen(abschnitt(p, 0.6 + i * 0.05 + j * 0.06, 0.8 + i * 0.05 + j * 0.06));
          el.style.opacity = q.toFixed(3);
          el.style.transform = 'translate3d(0,' + ((1 - q) * 14).toFixed(1) + 'px,0)';
        });
      });
    }

    var lauf = aufgabe(function (dt) {
      if (!an) return false;
      pSoll = fortschritt();
      p = folge(p, pSoll, 9, dt);
      if (Math.abs(p - pSoll) < 0.0004) p = pSoll;
      zeichnen();
      return p !== pSoll;
    });
    window.addEventListener('scroll', function () { if (an && lauf.aktiv) wecke(); }, { passive: true });
    beobachte(kunde, lauf, '300px 0px');

    function pruefen() {
      if (passt()) { if (!an) anschalten(); else { geo = messen(); if (!geo) ausschalten(); else { szene.style.setProperty('--hand-breite', geo.hb + 'px'); zeichnen(); } } }
      else if (an) ausschalten();
    }
    var warte;
    window.addEventListener('resize', function () { clearTimeout(warte); warte = setTimeout(pruefen, 180); });
    // Erst messen, wenn Schriften und Bilder stehen
    if (document.readyState === 'complete') pruefen();
    else window.addEventListener('load', pruefen);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { if (an) pruefen(); });
  })();

  /* ============================================================
     6. DIE 7 SCHRITTE
     ============================================================ */
  var schritte = document.querySelector('.schritte');
  if (schritte) (function () {
    var strecke = schritte.querySelector('.schritte__strecke');
    var buehne = schritte.querySelector('.schritte__buehne');
    var kopfBlock = schritte.querySelector('.section__header');
    var panel = schritte.querySelector('.schritte__panel');
    var nav = schritte.querySelector('.schritte__nav');
    var liste = schritte.querySelector('.schritte__liste');
    var artikel = Array.prototype.slice.call(schritte.querySelectorAll('.schritt'));
    var N = artikel.length;
    var knoepfe = [];
    var an = false, aktiv = -1, p = 0, pSoll = 0, aufraeumen = null;

    // Liste links aus den Titeln bauen ("1. Bewusstseinsarbeit" -> 1 / Bewusstseinsarbeit)
    var fuell = document.createElement('span');
    fuell.className = 'schritte__nav-fuell';
    nav.appendChild(fuell);
    artikel.forEach(function (art, i) {
      var titel = art.querySelector('.schritt__titel').textContent.replace(/^\s*\d+\.\s*/, '');
      var b = document.createElement('button');
      b.type = 'button';
      b.className = 'schritte__navpunkt';
      b.tabIndex = -1;
      b.innerHTML = '<span class="schritte__navpunkt-nr">' + (i + 1) + '</span><span class="schritte__navpunkt-name"></span>';
      b.querySelector('.schritte__navpunkt-name').textContent = titel;
      b.addEventListener('click', function () { springe(i); });
      nav.appendChild(b);
      knoepfe.push(b);
    });

    function passt() { return BEWEGUNG && window.innerWidth >= 340 && window.innerHeight >= 600; }

    function startUndEnde() {
      var top = parseFloat(getComputedStyle(buehne).top) || 0;
      var streckeTop = strecke.getBoundingClientRect().top + window.scrollY;
      var start = streckeTop - top;
      var ende = streckeTop + strecke.offsetHeight - buehne.offsetHeight - top;
      return { start: start, ende: ende };
    }
    function fortschritt() {
      var se = startUndEnde();
      return se.ende > se.start ? klemme((window.scrollY - se.start) / (se.ende - se.start), 0, 1) : 0;
    }
    function springe(i) {
      var se = startUndEnde();
      var y = se.start + (se.ende - se.start) * ((i + 0.08) / N);
      window.scrollTo({ top: Math.round(y), behavior: 'smooth' });
    }

    function zeige(i, richtung) {
      if (i === aktiv) return;
      var vorher = aktiv;
      aktiv = i;
      liste.setAttribute('data-richtung', richtung < 0 ? '-1' : '1');
      clearTimeout(aufraeumen);
      artikel.forEach(function (a, j) {
        a.classList.toggle('ist-aktiv', j === i);
        a.classList.toggle('ist-vorher', j === vorher);
      });
      knoepfe.forEach(function (b, j) {
        b.classList.toggle('ist-aktiv', j === i);
        b.classList.toggle('ist-erledigt', j < i);
      });
      aufraeumen = setTimeout(function () {
        artikel.forEach(function (a) { a.classList.remove('ist-vorher'); });
      }, 1000);
    }

    // Passt der Text jedes Schritts in die Buehne? Sonst kleiner, sonst
    // ruhige Fassung. Gemessen wird am echten Inhalt, nicht geschaetzt.
    function textPasst() {
      var hoch = liste.clientHeight;
      if (hoch < 120) return false;
      return artikel.every(function (a) {
        var t = a.querySelector('.schritt__text');
        var bild = a.querySelector('.schritt__bild');
        var platz = schritte.classList.contains('schritte--schmal')
          ? hoch - bild.offsetHeight - 16
          : hoch;
        return t.scrollHeight <= platz + 1;
      });
    }

    function anschalten() {
      var schmal = window.innerWidth < 1000;
      schritte.classList.add('schritte--gepinnt');
      schritte.classList.toggle('schritte--schmal', schmal);
      schritte.classList.remove('schritte--kompakt');
      schritte.style.setProperty('--anzahl', N);
      // Auf dem Handy scrollt die Ueberschrift vorher weg, die Buehne
      // klebt erst danach (top: -Ueberschrift).
      var kopfWeg = 0;
      if (schmal) kopfWeg = kopfBlock.offsetHeight + parseFloat(getComputedStyle(kopfBlock).marginBottom || 0);
      schritte.style.setProperty('--kopf-weg', Math.max(0, kopfWeg) + 'px');
      schritte.style.setProperty('--schrittweg', schmal ? '70svh' : '62svh');
      if (!textPasst()) {
        schritte.classList.add('schritte--kompakt');
        if (!textPasst()) { ausschalten(); return; }
      }
      an = true;
      pSoll = fortschritt(); p = pSoll;
      var i = Math.min(N - 1, Math.floor(p * N));
      aktiv = -1;
      zeige(i, 1);
      artikel.forEach(function (a) { a.classList.remove('ist-vorher'); });
      zeichnen();
    }
    function ausschalten() {
      an = false;
      schritte.classList.remove('schritte--gepinnt', 'schritte--schmal', 'schritte--kompakt');
      schritte.style.removeProperty('--kopf-weg');
      artikel.forEach(function (a) { a.classList.remove('ist-aktiv', 'ist-vorher'); });
      aktiv = -1;
    }

    function zeichnen() {
      panel.style.setProperty('--fortschritt', p.toFixed(4));
      var i = Math.min(N - 1, Math.floor(pSoll * N + 0.0001));
      if (i !== aktiv) zeige(i, i > aktiv ? 1 : -1);
    }

    var lauf = aufgabe(function (dt) {
      if (!an) return false;
      pSoll = fortschritt();
      p = folge(p, pSoll, 8, dt);
      if (Math.abs(p - pSoll) < 0.0004) p = pSoll;
      zeichnen();
      return p !== pSoll;
    });
    window.addEventListener('scroll', function () { if (an && lauf.aktiv) wecke(); }, { passive: true });
    beobachte(schritte, lauf, '200px 0px');

    function pruefen() {
      var war = an;
      if (passt()) { if (war) ausschalten(); anschalten(); }
      else if (war) ausschalten();
    }
    var warte, letzteBreite = window.innerWidth;
    window.addEventListener('resize', function () {
      // Auf dem Handy aendert sich die Hoehe beim Ein-/Ausblenden der
      // Adressleiste staendig — nur auf Breitenaenderungen neu aufbauen.
      if (an && window.innerWidth === letzteBreite) return;
      letzteBreite = window.innerWidth;
      clearTimeout(warte); warte = setTimeout(pruefen, 180);
    });
    if (document.readyState === 'complete') pruefen();
    else window.addEventListener('load', pruefen);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { if (an) pruefen(); });
  })();

  /* ============================================================
     7. ZUSAMMENARBEIT: Kachel-Wand
     Der naechste Live-Call (Mo und Mi, 10:00 Wiener Zeit) wird immer
     eingetragen, auch ohne Bewegung: das ist Inhalt, keine Animation.
     Alles andere nur mit html.bewegung: Kacheln steigen gestaffelt auf,
     die Agenda hakt sich ab, die Uhr laeuft, der Chat baut sich auf.
     ============================================================ */
  var kacheln = document.querySelector('.kacheln');
  if (kacheln) (function () {
    // 7a. Naechster Live-Call
    var LIVE_TAGE = [1, 3], LIVE_MINUTE = 10 * 60;
    var KURZ = ['', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'];
    var feld = kacheln.querySelector('[data-naechster]');
    function wienJetzt() {
      try {
        var teile = new Intl.DateTimeFormat('en-GB', { timeZone: 'Europe/Vienna', weekday: 'short', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }).formatToParts(new Date());
        var w = {}, i;
        for (i = 0; i < teile.length; i++) w[teile[i].type] = teile[i].value;
        var tag = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].indexOf(w.weekday) + 1;
        if (!tag) return null;
        return { tag: tag, minute: parseInt(w.hour, 10) * 60 + parseInt(w.minute, 10) };
      } catch (e) { return null; }
    }
    function naechsterCall() {
      var jetzt = wienJetzt();
      if (!feld || !jetzt) return;
      // Bis zu 7 Tage vorausschauen; heute zaehlt nur vor 10:00
      for (var d = 0; d < 8; d++) {
        var tag = ((jetzt.tag - 1 + d) % 7) + 1;
        if (LIVE_TAGE.indexOf(tag) < 0) continue;
        if (d === 0 && jetzt.minute >= LIVE_MINUTE) continue;
        var wann = d === 0 ? 'Heute' : d === 1 ? 'Morgen' : KURZ[tag];
        feld.textContent = 'Nächster: ' + wann + ' · 10:00';
        kacheln.querySelectorAll('[data-tag]').forEach(function (t) {
          t.classList.toggle('ist-naechster', +t.getAttribute('data-tag') === tag);
        });
        return;
      }
    }
    naechsterCall();
    setInterval(naechsterCall, 60000);

    if (!BEWEGUNG) return;

    // 7b. Kacheln erscheinen gestaffelt, jede spielt ihren Ablauf einmal ab
    var liste = Array.prototype.slice.call(kacheln.querySelectorAll('.kachel'));
    kacheln.querySelectorAll('.spieler__welle span').forEach(function (s, i) { s.style.setProperty('--i', i); });
    function staffeln() {
      var spalten = getComputedStyle(kacheln).gridTemplateColumns.split(' ').length || 1;
      var spalte = 0;
      liste.forEach(function (k) {
        k.style.setProperty('--k', spalten > 1 ? spalte : 0);
        spalte = (spalte + (k.classList.contains('kachel--beratung') && spalten > 1 ? 2 : 1)) % spalten;
      });
    }
    staffeln();
    window.addEventListener('resize', staffeln);
    kacheln.classList.add('kacheln--lebt');

    function starte(k) {
      if (k.classList.contains('ist-an')) return;
      k.classList.add('ist-sichtbar', 'ist-an');
      if (k.classList.contains('kachel--chat')) {
        setTimeout(function () { k.classList.add('chat--tippt'); }, 1300);
        setTimeout(function () { k.classList.remove('chat--tippt'); k.classList.add('chat--antwort'); }, 3300);
      }
    }
    if (!('IntersectionObserver' in window)) { liste.forEach(starte); return; }
    var io = new IntersectionObserver(function (eintraege) {
      eintraege.forEach(function (e) {
        if (e.isIntersecting) { starte(e.target); io.unobserve(e.target); }
      });
    }, { threshold: 0.3 });
    liste.forEach(function (k) { io.observe(k); });

    // 7c. Gespraechsuhr laeuft, solange der Anruf im Bild ist
    var uhr = kacheln.querySelector('[data-uhr]');
    if (uhr) {
      var sekunden = 0, takt = null;
      var zeige = function () {
        var m = Math.floor(sekunden / 60), s = sekunden % 60;
        uhr.textContent = (m < 10 ? '0' : '') + m + ':' + (s < 10 ? '0' : '') + s;
      };
      new IntersectionObserver(function (e) {
        if (e[0].isIntersecting && !takt) takt = setInterval(function () { sekunden++; zeige(); }, 1000);
        else if (!e[0].isIntersecting && takt) { clearInterval(takt); takt = null; }
      }).observe(uhr.closest('.kachel'));
    }
  })();
})();
