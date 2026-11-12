/* ============================================================
   BEWEGUNG — Premium-Runde 1 der NOW-Webseite (12.11.2026)

   1. Kopfleiste wird nach dem ersten Scrollen dichter
   2. Hero: Headline-Woerter einzeln, Videokarte neigt sich mit der Maus
      und spiegelt Licht, Aura folgt dem Zeiger, magnetischer Knopf
   3. Laufband: drei Reihen gegenlaeufig, Tempo reagiert aufs Scrollen,
      die Chips in der Bildmitte leuchten
   4. Wer ist unser Kunde: Haende oeffnen sich, Karten wachsen aus den
      Pillen (nur mit Platz, sonst ruhige Fassung)
   5. Die 7 Schritte: gepinnte Buehne, ein Schritt pro Scrollabschnitt

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

  /* ---------- Scrollgeschwindigkeit (fuer das Laufband) ---------- */
  var scrollY = window.scrollY, scrollV = 0, scrollRichtung = 1;
  window.addEventListener('scroll', function () { wecke(); }, { passive: true });
  var tempoMesser = aufgabe(function (dt) {
    var y = window.scrollY;
    var v = (y - scrollY) / dt;
    scrollY = y;
    if (Math.abs(v) > 30) scrollRichtung = v > 0 ? 1 : -1;
    scrollV = folge(scrollV, v, 6, dt);
    return Math.abs(scrollV) > 2;
  });
  tempoMesser.aktiv = true;

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
     3. LAUFBAND
     ============================================================ */
  var laufband = document.querySelector('.laufband');
  if (BEWEGUNG && laufband) {
    var reihen = [];
    laufband.classList.add('laufband--laeuft');
    laufband.querySelectorAll('.laufband__reihe').forEach(function (reihe) {
      var spur = reihe.querySelector('.laufband__spur');
      var original = Array.prototype.slice.call(spur.children);
      reihen.push({
        reihe: reihe, spur: spur, original: original, chips: [],
        richtung: Number(reihe.getAttribute('data-richtung')) || -1,
        tempo: Number(reihe.getAttribute('data-tempo')) || 30,
        x: 0, satz: 0, breite: 0, faktor: 1, faktorSoll: 1, hover: false
      });
      reihe.addEventListener('pointerenter', function () { reihen.forEach(function (r) { if (r.reihe === reihe) r.hover = true; }); });
      reihe.addEventListener('pointerleave', function () { reihen.forEach(function (r) { if (r.reihe === reihe) r.hover = false; }); wecke(); });
    });

    // Spur so oft fortsetzen, dass sie mindestens Reihenbreite + zwei
    // Saetze lang ist. Kopien sind fuer Vorleseprogramme unsichtbar.
    function bauen() {
      reihen.forEach(function (r) {
        Array.prototype.slice.call(r.spur.querySelectorAll('[data-kopie]')).forEach(function (k) { k.remove(); });
        r.breite = r.reihe.clientWidth;
        var letzte = r.original[r.original.length - 1];
        var luecke = parseFloat(getComputedStyle(r.spur).columnGap) || 0;
        r.satz = letzte.offsetLeft + letzte.offsetWidth + luecke - r.original[0].offsetLeft;
        var noetig = Math.ceil((r.breite + r.satz * 2) / Math.max(1, r.satz));
        for (var n = 0; n < noetig; n++) {
          r.original.forEach(function (chip) {
            var k = chip.cloneNode(true);
            k.setAttribute('data-kopie', '');
            k.setAttribute('aria-hidden', 'true');
            r.spur.appendChild(k);
          });
        }
        r.chips = Array.prototype.slice.call(r.spur.children).map(function (c) {
          return { el: c, mitte: c.offsetLeft + c.offsetWidth / 2 };
        });
        if (r.richtung > 0) r.x = -r.satz;
      });
    }
    bauen();
    var warteBauen;
    window.addEventListener('resize', function () { clearTimeout(warteBauen); warteBauen = setTimeout(bauen, 200); });

    var band = aufgabe(function (dt) {
      reihen.forEach(function (r) {
        // Scrollen gibt Schub: schneller, und beim Hochscrollen kehrt sich
        // die Richtung um. Maus darueber haelt die Reihe an.
        var schub = 1 + Math.min(Math.abs(scrollV) / 260, 5);
        r.faktorSoll = r.hover ? 0 : schub * scrollRichtung;
        r.faktor = folge(r.faktor, r.faktorSoll, r.hover ? 6 : 3, dt);
        r.x += r.richtung * r.tempo * r.faktor * dt;
        if (r.x <= -r.satz) r.x += r.satz;
        if (r.x > 0) r.x -= r.satz;
        r.spur.style.transform = 'translate3d(' + r.x.toFixed(2) + 'px,0,0)';
        // Naehe zur Mitte -> --f (0..1)
        var halb = r.breite / 2;
        for (var i = 0; i < r.chips.length; i++) {
          var c = r.chips[i];
          var d = Math.abs(c.mitte + r.x - halb) / halb;
          var f = d > 1 ? 0 : weich(1 - d);
          if (Math.abs((c.f || 0) - f) > 0.004) { c.f = f; c.el.style.setProperty('--f', f.toFixed(3)); }
        }
      });
      return true;
    });
    beobachte(laufband, band, '100px 0px');
  }

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
     5. DIE 7 SCHRITTE
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
})();
