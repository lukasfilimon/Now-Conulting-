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
