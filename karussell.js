/* ============================================================
   KARUSSELL — die sieben Schritte und die zwei Testimonial-Reihen.
   Die Spur ist ein normaler, waagrecht scrollbarer Streifen mit
   scroll-snap (geht also auch per Wischen und ohne JavaScript). Die
   Pfeile blaettern um eine Karte, der Fortschrittsbalken zeigt, wo man
   steht. Am Anfang und Ende wird der jeweilige Pfeil abgeschaltet.
   ============================================================ */
(function () {
  document.querySelectorAll('[data-karussell]').forEach(function (k) {
    var spur = k.querySelector('.karussell__spur');
    var zurueck = k.querySelector('[data-richtung="-1"]');
    var weiter = k.querySelector('[data-richtung="1"]');
    var balken = k.querySelector('.karussell__fortschritt span');
    if (!spur) return;

    function schritt() {
      var karte = spur.children[0];
      if (!karte) return spur.clientWidth;
      var abstand = parseFloat(getComputedStyle(spur).columnGap) || 0;
      return karte.getBoundingClientRect().width + abstand;
    }
    function aktualisieren() {
      var max = spur.scrollWidth - spur.clientWidth;
      var x = spur.scrollLeft;
      if (zurueck) zurueck.disabled = x <= 2;
      if (weiter) weiter.disabled = x >= max - 2;
      k.classList.toggle('karussell--still', max <= 2);
      if (balken) {
        var anteil = spur.clientWidth / spur.scrollWidth;
        balken.style.width = (anteil * 100) + '%';
        balken.style.transform = 'translateX(' + (max > 0 ? (x / max) * (1 / anteil - 1) * 100 : 0) + '%)';
      }
    }
    [zurueck, weiter].forEach(function (b) {
      if (!b) return;
      b.addEventListener('click', function () {
        spur.scrollBy({ left: schritt() * Number(b.getAttribute('data-richtung')), behavior: 'smooth' });
      });
    });
    spur.addEventListener('scroll', aktualisieren, { passive: true });
    window.addEventListener('resize', aktualisieren);
    aktualisieren();
  });
})();
