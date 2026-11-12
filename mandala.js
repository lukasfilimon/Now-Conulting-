/* ============================================================
   MANDALA — das Mandala aus dem NOW-Logo als Hintergrund einzelner
   Sektionen, wie in der NOW Academy.

   Jede Sektion mit data-mandala bekommt es: data-mandala="voll" etwas
   kraeftiger, "leise" zurueckhaltender. Gezeichnet wird EINMAL auf ein
   Canvas in voller Aufloesung; die langsame Drehung macht CSS
   (.lp-mandala in kern.css). Das kostet auch am Handy kaum Rechenzeit.
   Bei "Bewegung reduzieren" steht es still (ebenfalls in kern.css).
   ============================================================ */
(function () {
  var sektionen = document.querySelectorAll('[data-mandala]');
  if (!sektionen.length) return;

  function polar(r, a) { return [Math.cos(a) * r, Math.sin(a) * r]; }
  function blaetter(c, r1, r2, n, versatz, breite) {
    var schritt = (Math.PI * 2) / n;
    for (var k = 0; k < n; k++) {
      var a = k * schritt + versatz, w = schritt * breite, p;
      c.beginPath();
      p = polar(r1, a - w); c.moveTo(p[0], p[1]);
      var k1 = polar(r2 * 0.92, a - w * 0.9), e1 = polar(r2, a);
      c.quadraticCurveTo(k1[0], k1[1], e1[0], e1[1]);
      var k2 = polar(r2 * 0.92, a + w * 0.9), e2 = polar(r1, a + w);
      c.quadraticCurveTo(k2[0], k2[1], e2[0], e2[1]);
      c.stroke();
      c.beginPath();
      p = polar(r1 + (r2 - r1) * 0.18, a); c.moveTo(p[0], p[1]);
      p = polar(r1 + (r2 - r1) * 0.78, a); c.lineTo(p[0], p[1]);
      c.stroke();
    }
  }
  function kreis(c, r) { c.beginPath(); c.arc(0, 0, r, 0, Math.PI * 2); c.stroke(); }
  function punkte(c, r, n, g) {
    for (var k = 0; k < n; k++) { var p = polar(r, (k / n) * Math.PI * 2); c.beginPath(); c.arc(p[0], p[1], g, 0, Math.PI * 2); c.fill(); }
  }

  function zeichnen(leinwand, groesse) {
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    var S = Math.round(groesse * dpr);
    leinwand.width = leinwand.height = S;
    leinwand.style.width = leinwand.style.height = groesse + 'px';
    var c = leinwand.getContext('2d');
    c.clearRect(0, 0, S, S);
    c.save();
    c.translate(S / 2, S / 2);
    c.strokeStyle = c.fillStyle = 'rgb(214, 182, 98)';
    c.lineWidth = Math.max(1, dpr * 0.9);
    c.lineCap = 'round';
    var r = function (x) { return x * (S / 2); };
    kreis(c, r(0.035)); kreis(c, r(0.06));
    blaetter(c, r(0.06), r(0.13), 8, 0, 0.42);
    blaetter(c, r(0.06), r(0.115), 8, Math.PI / 8, 0.36);
    kreis(c, r(0.14)); punkte(c, r(0.155), 32, dpr * 1.1); kreis(c, r(0.17));
    blaetter(c, r(0.17), r(0.27), 16, 0, 0.44);
    blaetter(c, r(0.17), r(0.24), 16, Math.PI / 16, 0.4);
    kreis(c, r(0.285)); kreis(c, r(0.295));
    blaetter(c, r(0.295), r(0.4), 24, 0, 0.46);
    blaetter(c, r(0.295), r(0.37), 24, Math.PI / 24, 0.42);
    kreis(c, r(0.415)); punkte(c, r(0.43), 96, dpr * 1.0); kreis(c, r(0.445));
    blaetter(c, r(0.445), r(0.56), 32, 0, 0.45);
    blaetter(c, r(0.445), r(0.53), 32, Math.PI / 32, 0.42);
    kreis(c, r(0.575));
    for (var k = 0; k < 144; k++) {
      var a = (k / 144) * Math.PI * 2, p1 = polar(r(0.585), a), p2 = polar(r(k % 2 ? 0.61 : 0.63), a);
      c.beginPath(); c.moveTo(p1[0], p1[1]); c.lineTo(p2[0], p2[1]); c.stroke();
    }
    kreis(c, r(0.64));
    blaetter(c, r(0.64), r(0.78), 48, 0, 0.46);
    blaetter(c, r(0.64), r(0.74), 48, Math.PI / 48, 0.42);
    kreis(c, r(0.8)); punkte(c, r(0.82), 160, dpr * 0.9); kreis(c, r(0.84));
    blaetter(c, r(0.84), r(0.98), 64, 0, 0.46);
    c.restore();
  }

  var alle = [];
  sektionen.forEach(function (sek) {
    var huelle = document.createElement('div');
    huelle.className = 'lp-mandala lp-mandala--' + (sek.getAttribute('data-mandala') || 'leise');
    huelle.setAttribute('aria-hidden', 'true');
    var leinwand = document.createElement('canvas');
    huelle.appendChild(leinwand);
    sek.insertBefore(huelle, sek.firstChild);
    alle.push({ sek: sek, leinwand: leinwand, groesse: 0 });
  });

  function anpassen() {
    alle.forEach(function (m) {
      // So gross, dass es ueber die Sektion hinausragt, aber gedeckelt
      var g = Math.round(Math.min(1500, Math.max(m.sek.offsetWidth * 1.15, m.sek.offsetHeight * 1.1)));
      if (Math.abs(g - m.groesse) > g * 0.15) { m.groesse = g; zeichnen(m.leinwand, g); }
    });
  }
  anpassen();
  var warten;
  window.addEventListener('resize', function () { clearTimeout(warten); warten = setTimeout(anpassen, 200); }, { passive: true });
})();
