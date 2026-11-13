/* ============================================================
   BEWEGUNG — Premium-Runde 1 der NOW-Webseite (12.11.2026)

   1. Kopfleiste wird nach dem ersten Scrollen dichter
   2. Hero: Headline-Woerter einzeln, Videokarte neigt sich mit der Maus
      und spiegelt Licht, Aura folgt dem Zeiger, magnetischer Knopf
   3. Der Spiegel: Karten drehen sich vom Symptom (Aussen) auf die
      Ursache (Innen), Schalter und Maus drehen mit
   4. Wer ist unser Kunde: Haende gehen auseinander, unter jeder Hand
      waechst ihre Spalte (nur mit Platz, sonst ruhige Fassung)
   5. Zwei Welten: Bewusstsein und Business gleiten zusammen
   6. Die 7 Schritte: gepinnte Buehne, ein Schritt pro Scrollabschnitt
   7. Zusammenarbeit: Kachel-Wand mit naechstem Live-Call, Uhr und Chat
   8. Runde 2: Ueberschriften Wort fuer Wort, Manifest, Programme-Pfad,
      gestapelte Live Events, Testimonials, Team-Galerie, Abschluss, Footer

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
  // Nur bei einem echten Wechsel ins DOM schreiben (laeuft bei jedem Scroll-Ereignis)
  var kopfOben = null;
  function kopfZustand() {
    var g = window.scrollY > 30;
    if (kopf && g !== kopfOben) { kopfOben = g; kopf.classList.toggle('kopf--gescrollt', g); }
  }
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
     4. WER IST UNSER KUNDE — "Die Wahl"
     Start: Ueberschrift, darunter beide Haende gross und nah beieinander.
     Beim Scrollen weicht die Ueberschrift nach oben, die Haende gehen
     auseinander und setzen sich ueber ihre Spalte, die goldene Pille
     leuchtet auf, dann wachsen Linie, Titel und Punkte jeder Spalte.
     Passt das nicht in den Bildschirm: ruhige Fassung (nur CSS).
     ============================================================ */
  var kunde = document.querySelector('.kunde');
  if (BEWEGUNG && kunde) (function () {
    var strecke = kunde.querySelector('.kunde__strecke');
    var feld = kunde.querySelector('.kunde__buehne > .container');
    var kopfTeile = Array.prototype.slice.call(kunde.querySelectorAll('.section__header > *'));
    var kopf = kunde.querySelector('.section__header');
    var haende = [kunde.querySelector('.kunde__hand--links'), kunde.querySelector('.kunde__hand--rechts')];
    var bilder = haende.map(function (h) { return h.querySelector('img'); });
    var wege = kunde.querySelector('.kunde__wege');
    var spalten = Array.prototype.slice.call(kunde.querySelectorAll('.weg'));
    var titel = spalten.map(function (s) { return s.querySelector('.weg__titel'); });
    var punkte = spalten.map(function (s) { return Array.prototype.slice.call(s.querySelectorAll('.weg__punkt')); });
    var an = false, geo = null, p = 0, pSoll = 0;

    function passt() { return window.innerWidth >= 1000 && window.innerHeight >= 640; }
    // Bildgroesse in Pixeln (beide Haende im selben Massstab) und die Lage
    // der Pille im Bild (--px/--py aus seite.css, in Prozent)
    function bildmass(i) {
      var b = bilder[i];
      return b.naturalWidth ? { b: b.naturalWidth, h: b.naturalHeight } : { b: +b.getAttribute('width') || 1, h: +b.getAttribute('height') || 1 };
    }
    function pille(i) {
      var cs = getComputedStyle(haende[i]);
      return { x: (parseFloat(cs.getPropertyValue('--px')) || 50) / 100, y: (parseFloat(cs.getPropertyValue('--py')) || 50) / 100 };
    }

    function zuruecksetzen() {
      haende.forEach(function (h) { h.style.transform = ''; h.style.width = ''; h.style.removeProperty('--glanz'); });
      kopfTeile.forEach(function (el) { el.style.opacity = ''; el.style.transform = ''; });
      spalten.forEach(function (s) { s.style.removeProperty('--linie'); });
      wege.style.removeProperty('--teiler');
      wege.style.bottom = '';
      titel.forEach(function (t) { t.style.opacity = ''; t.style.transform = ''; });
      punkte.forEach(function (l) { l.forEach(function (el) { el.style.opacity = ''; el.style.transform = ''; }); });
    }

    function messen() {
      zuruecksetzen();
      var fr = feld.getBoundingClientRect();
      var W = fr.width, H = fr.height;
      var kopfUnten = kopf.getBoundingClientRect().bottom - fr.top + 16;
      var wegeOben = wege.getBoundingClientRect().top - fr.top;
      var sp = spalten.map(function (s) { var r = s.getBoundingClientRect(); return { x: r.left - fr.left, w: r.width }; });
      var m = [bildmass(0), bildmass(1)], pl = [pille(0), pille(1)];
      var hMax = Math.max(m[0].h, m[1].h);
      // Start: gross und nah beieinander unter der Ueberschrift, so wie auf
      // dem Foto (die Bilder enden innen an der Luecke zwischen den Haenden)
      var platzStart = H - kopfUnten;
      var s0 = Math.min((platzStart * 0.98) / hMax, (W * 0.78) / (m[0].b + m[1].b + 60), 560 / hMax);
      var luecke = 60 * s0;
      // Ende: Pille ueber der Spaltenmitte, Aermel laufen hinter der Linie aus
      var platzEnde = wegeOben + 12;
      var s1 = Math.min((platzEnde * 0.94) / hMax, (sp[0].w * 0.5) / (pl[0].x * m[0].b), (sp[1].w * 0.5) / ((1 - pl[1].x) * m[1].b), s0);
      if (platzStart < 220 || s1 * hMax < 200) return null;
      // Grosse Bildschirme: Schlussbild (Haende + Spalten) senkrecht mittig
      var hoch = Math.max(0, (platzEnde - s1 * hMax) / 2);
      wege.style.bottom = hoch.toFixed(1) + 'px';
      platzEnde -= hoch;
      return {
        s0: s0,
        k: s1 / s0,
        breite: [m[0].b * s0, m[1].b * s0],
        start: [
          { x: W / 2 - luecke / 2 - m[0].b * s0, y: kopfUnten + (platzStart - m[0].h * s0) / 2 },
          { x: W / 2 + luecke / 2, y: kopfUnten + (platzStart - m[1].h * s0) / 2 }
        ],
        ende: [0, 1].map(function (i) {
          return { x: sp[i].x + sp[i].w / 2 - pl[i].x * m[i].b * s1, y: platzEnde - m[i].h * s1 };
        })
      };
    }

    function anschalten() {
      kunde.classList.add('kunde--szene');
      // Die Einblend-Klassen des Kerns wuerden die Bewegung pro Bild verschmieren
      punkte.forEach(function (l) { l.forEach(function (el) { el.classList.remove('reveal-item'); el.style.transition = 'none'; }); });
      geo = messen();
      if (!geo) { ausschalten(); return; }
      setzeBreite();
      an = true;
      pSoll = fortschritt(); p = pSoll;
      zeichnen();
    }
    function ausschalten() {
      an = false;
      kunde.classList.remove('kunde--szene');
      zuruecksetzen();
      punkte.forEach(function (l) { l.forEach(function (el) { el.style.opacity = '1'; el.style.transform = 'none'; }); });
    }

    function setzeBreite() {
      haende.forEach(function (h, i) { h.style.width = geo.breite[i].toFixed(1) + 'px'; });
    }

    function fortschritt() {
      var r = strecke.getBoundingClientRect();
      var weg = strecke.offsetHeight - window.innerHeight;
      return weg > 0 ? klemme(-r.top / weg, 0, 1) : 0;
    }

    function zeichnen() {
      var g = geo;
      var a = inOut(abschnitt(p, 0.08, 0.5));               // Haende gehen auseinander
      var k = weich(abschnitt(p, 0.1, 0.34));               // Ueberschrift weicht
      kopfTeile.forEach(function (el, j) {
        var kj = klemme(k * 1.25 - j * 0.12, 0, 1);
        el.style.opacity = (1 - kj).toFixed(3);
        el.style.transform = 'translate3d(0,' + (-28 * kj).toFixed(1) + 'px,0)';
      });
      var glanz = weich(abschnitt(p, 0.04, 0.42));
      haende.forEach(function (hand, i) {
        var s = mische(1, g.k, a);
        var x = mische(g.start[i].x, g.ende[i].x, a);
        var y = mische(g.start[i].y, g.ende[i].y, a);
        hand.style.transform = 'translate3d(' + x.toFixed(1) + 'px,' + y.toFixed(1) + 'px,0) scale(' + s.toFixed(4) + ')';
        hand.style.setProperty('--glanz', glanz.toFixed(3));
      });
      wege.style.setProperty('--teiler', weich(abschnitt(p, 0.5, 0.7)).toFixed(3));
      spalten.forEach(function (sp, i) {
        sp.style.setProperty('--linie', ausrollen(abschnitt(p, 0.42 + i * 0.05, 0.62 + i * 0.05)).toFixed(4));
        var t = ausrollen(abschnitt(p, 0.5 + i * 0.05, 0.66 + i * 0.05));
        titel[i].style.opacity = t.toFixed(3);
        titel[i].style.transform = 'translate3d(0,' + ((1 - t) * 12).toFixed(1) + 'px,0)';
        punkte[i].forEach(function (el, j) {
          var q = ausrollen(abschnitt(p, 0.57 + i * 0.04 + j * 0.06, 0.75 + i * 0.04 + j * 0.06));
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
      if (passt()) { if (!an) anschalten(); else { geo = messen(); if (!geo) ausschalten(); else { setzeBreite(); zeichnen(); } } }
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
      // Die Liste links muss in die Karte passen, sonst ragt sie heraus
      if (!schritte.classList.contains('schritte--schmal') && nav && nav.scrollHeight > nav.clientHeight + 1) return false;
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
     Agenda und Aufgaben haken sich ab, die Termine erscheinen, der Chat
     baut sich auf (Frage, "nimmt Audio auf ...", Sprachmemo).
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
        // Frage steht, dann "nimmt Audio auf ...", dann die Sprachmemo
        setTimeout(function () { k.classList.add('chat--tippt'); }, 1500);
        setTimeout(function () { k.classList.remove('chat--tippt'); k.classList.add('chat--antwort'); }, 4300);
      }
    }
    if (!('IntersectionObserver' in window)) { liste.forEach(starte); return; }
    var io = new IntersectionObserver(function (eintraege) {
      eintraege.forEach(function (e) {
        if (e.isIntersecting) { starte(e.target); io.unobserve(e.target); }
      });
    }, { threshold: 0.3 });
    liste.forEach(function (k) { io.observe(k); });

  })();

  /* ---------- Team-Galerie (auch bei reduzierter Bewegung) ----------
     Breite Bildschirme: die Person unter Maus oder Fokus klappt auf.
     Ohne dieses Skript bleibt das normale Raster mit allen Texten. */
  var galerie = document.querySelector('[data-galerie]');
  if (galerie) (function () {
    var leute = Array.prototype.slice.call(galerie.querySelectorAll('.person'));
    function oeffne(p) { leute.forEach(function (x) { x.classList.toggle('ist-offen', x === p); }); }
    leute.forEach(function (p) {
      p.tabIndex = 0;
      p.addEventListener('pointerenter', function (e) { if (e.pointerType === 'mouse') oeffne(p); });
      p.addEventListener('focus', function () { oeffne(p); });
      p.addEventListener('click', function () { oeffne(p); });
    });
    // Verlaesst die Maus die Galerie, steht wieder Darko vorne (Lukas, 13.11.2026)
    galerie.addEventListener('pointerleave', function (e) { if (e.pointerType === 'mouse') oeffne(leute[0]); });
    galerie.classList.add('galerie--an');
  })();

  /* ============================================================
     8. RUNDE 2: Ueberschriften, Manifest, Programme, Live Events,
        Testimonials, Team, Abschluss, Footer
     Alles nur mit html.bewegung. Ohne bleibt jede Sektion, wie sie im
     HTML steht: vollstaendig und ruhig.
     ============================================================ */
  if (BEWEGUNG) (function () {
    var IO = 'IntersectionObserver' in window;
    // Einmal sichtbar = Klasse setzen und nicht mehr beobachten
    function einmal(liste, klasse, schwelle, rand) {
      liste = Array.prototype.slice.call(liste);
      if (!IO) { liste.forEach(function (el) { el.classList.add(klasse); }); return; }
      var io = new IntersectionObserver(function (e) {
        e.forEach(function (x) { if (x.isIntersecting) { x.target.classList.add(klasse); io.unobserve(x.target); } });
      }, { threshold: schwelle || 0.25, rootMargin: rand || '0px 0px -8% 0px' });
      liste.forEach(function (el) { io.observe(el); });
    }
    function nummeriere(liste, max) {
      Array.prototype.forEach.call(liste, function (el, i) { el.style.setProperty('--n', Math.min(i, max || 99)); });
    }
    // Fortschritt einer Sektion durchs Fenster: 0 = kommt unten herein, 1 = oben hinaus
    function durchlauf(el) {
      var r = el.getBoundingClientRect(), vh = window.innerHeight;
      return klemme((vh - r.top) / (vh + r.height), 0, 1);
    }

    // 8a. Ueberschriften Wort fuer Wort
    var titel = document.querySelectorAll('main .section__title, .manifest__titel, .final-cta__title');
    Array.prototype.forEach.call(titel, function (t) {
      if (t.closest('.hero')) return;
      teileWoerter(t);
      t.classList.add('titel-woerter');
    });
    einmal(document.querySelectorAll('.titel-woerter'), 'ist-da', 0.35, '0px 0px -6% 0px');

    // 8b. Manifest: Maske, Parallaxe im Rahmen, Text nacheinander
    var manifest = document.querySelector('.manifest');
    if (manifest) {
      nummeriere(manifest.querySelectorAll('.darko__bio, .manifest__signatur'));
      einmal(manifest.querySelectorAll('.darko__img, .darko__content'), 'ist-da', 0.2);
      var mBild = manifest.querySelector('.manifest__rahmen img');
      var mp = 0;
      var mLauf = aufgabe(function (dt) {
        var soll = durchlauf(manifest);
        mp = folge(mp, soll, 6, dt);
        if (Math.abs(mp - soll) < 0.0005) mp = soll;
        if (mBild) {
          mBild.style.setProperty('--by', mische(-4, 4, mp).toFixed(2) + '%');
          mBild.style.setProperty('--bs', mische(1.14, 1.04, mp).toFixed(4));
        }
        return mp !== soll;
      });
      beobachte(manifest, mLauf);
      window.addEventListener('scroll', function () { if (mLauf.aktiv) wecke(); }, { passive: true });
    }

    // 8c. Programme: Pfad zeichnet sich, Betraege zaehlen, Lichtkegel
    var programme = document.querySelector('.programme');
    if (programme) {
      var pfad = programme.querySelector('.pfad');
      var punkte = pfad ? Array.prototype.slice.call(pfad.querySelectorAll('.pfad__punkt')) : [];
      var stellen = [0.02, 0.5, 0.98];
      var zug = 0;
      if (pfad) {
        pfad.style.setProperty('--zug', 0);
        var pLauf = aufgabe(function (dt) {
          var r = pfad.getBoundingClientRect(), vh = window.innerHeight;
          var soll = klemme((vh * 0.92 - r.top) / (vh * 0.6), 0, 1);
          zug = folge(zug, soll, 5, dt);
          if (Math.abs(zug - soll) < 0.0005) zug = soll;
          pfad.style.setProperty('--zug', zug.toFixed(4));
          punkte.forEach(function (pk, i) { pk.classList.toggle('ist-erreicht', zug >= stellen[i] - 0.01); });
          return zug !== soll;
        });
        beobachte(pfad, pLauf);
        window.addEventListener('scroll', function () { if (pLauf.aktiv) wecke(); }, { passive: true });
      }
      var phasen = programme.querySelectorAll('.phase');
      Array.prototype.forEach.call(phasen, function (ph) { nummeriere(ph.querySelectorAll('.phase__liste li')); });
      einmal(phasen, 'ist-da', 0.2);
      // Betraege zaehlen hoch, sobald die Karte im Bild ist
      function punktiert(n) { return String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, '.'); }
      Array.prototype.forEach.call(programme.querySelectorAll('[data-zaehle]'), function (z) {
        var ziel = +z.getAttribute('data-zaehle');
        var gestartet = false;
        function los() {
          if (gestartet) return; gestartet = true;
          var t0 = performance.now(), dauer = 1800;
          (function schritt(t) {
            var p = klemme((t - t0) / dauer, 0, 1);
            z.textContent = punktiert(ziel * ausrollen(p));
            if (p < 1) requestAnimationFrame(schritt);
          })(t0);
        }
        if (!IO) return;
        z.textContent = '0';
        var io = new IntersectionObserver(function (e) { if (e[0].isIntersecting) { los(); io.disconnect(); } }, { threshold: 1 });
        io.observe(z);
      });
      if (FEINER_ZEIGER) Array.prototype.forEach.call(phasen, function (ph) {
        ph.addEventListener('pointermove', function (e) {
          var r = ph.getBoundingClientRect();
          ph.style.setProperty('--mx', (e.clientX - r.left) + 'px');
          ph.style.setProperty('--my', (e.clientY - r.top) + 'px');
        });
      });
    }

    // 8d. Live Events: die Karten stapeln sich beim Scrollen
    var formate = document.querySelector('.formate[data-stapel]');
    if (formate) {
      var karten = Array.prototype.slice.call(formate.querySelectorAll('.format-zeile'));
      formate.classList.add('formate--stapel');
      karten.forEach(function (k, i) { k.classList.remove('reveal-card'); k.style.setProperty('--k', i); });
      var sLauf = aufgabe(function () {
        if (getComputedStyle(karten[0]).position !== 'sticky') {
          karten.forEach(function (k) { k.style.transform = ''; k.style.removeProperty('--dunkel'); });
          return false;
        }
        for (var i = 0; i < karten.length; i++) {
          var k = karten[i], p = 0;
          if (i < karten.length - 1) {
            var a = k.getBoundingClientRect(), b = karten[i + 1].getBoundingClientRect();
            p = klemme(1 - (b.top - a.top) / Math.max(1, a.height), 0, 1);
          }
          k.style.transform = p ? 'scale(' + (1 - p * 0.06).toFixed(4) + ')' : '';
          k.style.setProperty('--dunkel', (p * 0.55).toFixed(3));
        }
        return false;
      });
      beobachte(formate, sLauf, '100px 0px');
      window.addEventListener('scroll', function () { if (sLauf.aktiv) wecke(); }, { passive: true });
    }

    // 8e. Testimonials: Reihen fahren gestaffelt ein
    var reihen = document.querySelectorAll('.stimmen__reihe');
    Array.prototype.forEach.call(reihen, function (r) { nummeriere(r.querySelectorAll('.testi-card'), 4); });
    einmal(reihen, 'ist-da', 0.15);

    // 8g. Abschluss: Licht waechst aus der Dunkelheit, Mandala dreht mit
    var schluss = document.querySelector('.final-cta');
    if (schluss) {
      var licht = schluss.querySelector('.final-cta__licht');
      var sp = 0;
      var fLauf = aufgabe(function (dt) {
        var soll = durchlauf(schluss);
        sp = folge(sp, soll, 5, dt);
        if (Math.abs(sp - soll) < 0.0005) sp = soll;
        var auf = weich(abschnitt(sp, 0.1, 0.55));
        if (licht) {
          licht.style.setProperty('--licht', mische(0.45, 1.1, auf).toFixed(4));
          licht.style.setProperty('--licht-o', mische(0.2, 1, auf).toFixed(3));
        }
        // Nur die Leinwand drehen: die Huelle muss die Sektion decken
        var m = schluss.querySelector('.lp-mandala canvas');
        if (m) {
          m.style.rotate = (sp * 50 - 25).toFixed(2) + 'deg';
          m.style.scale = mische(0.9, 1, sp).toFixed(4);
        }
        return sp !== soll;
      });
      beobachte(schluss, fLauf);
      window.addEventListener('scroll', function () { if (fLauf.aktiv) wecke(); }, { passive: true });
    }

    // 8h. Footer: der Leitsatz leuchtet Wort fuer Wort auf
    var leitsatz = document.querySelector('.fuss__leitsatz');
    if (leitsatz) {
      nummeriere(leitsatz.querySelectorAll('span'));
      einmal([leitsatz], 'ist-da', 0.6, '0px');
    }
  })();
})();
