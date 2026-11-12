/* ============================================================
   TRACKING — Meta-Pixel der Webseite, erst nach Zustimmung.
   kern.js ruft loadTracking() auf, sobald jemand "Akzeptieren" klickt
   (oder schon frueher zugestimmt hat). Vorher geht kein Request an
   connect.facebook.net. Kein <noscript>-Pixel: der wuerde ohne
   Zustimmung an Meta senden.

   Nur auf der echten Domain. Auf der Vorschau (*.netlify.app) und lokal
   bleibt der Pixel aus, sonst zaehlen Klicks beim Durchschauen als
   echte Besuche.
   ============================================================ */
window.META_PIXEL_ID = '2041971686668161';
window.TRACKING_AKTIV = /(^|\.)now-consulting\.at$/.test(location.hostname);

var trackingGeladen = false;
function loadTracking() {
  if (trackingGeladen || !window.TRACKING_AKTIV) return;
  trackingGeladen = true;
  !function(f,b,e,v,n,t,s)
  {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
  n.callMethod.apply(n,arguments):n.queue.push(arguments)};
  if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
  n.queue=[];t=b.createElement(e);t.async=!0;
  t.src=v;s=b.getElementsByTagName(e)[0];
  s.parentNode.insertBefore(t,s)}(window, document,'script',
  'https://connect.facebook.net/en_US/fbevents.js');
  fbq('init', window.META_PIXEL_ID);
  fbq('track', 'PageView');
}
