NAME = 'Hell'

CSS = r'''
body { background: var(--elfenbein); color: var(--tinte); }
.b { position: relative; overflow: clip; isolation: isolate; padding: 156px 22px 140px; text-align: center; }
/* Hintergrund in Schichten: Licht, feine Linien, Mandala, Korn */
.b__licht { position: absolute; inset: 0; z-index: -4; pointer-events: none;
  background:
    radial-gradient(48% 38% at 50% 74%, rgba(201, 168, 76, 0.30), transparent 70%),
    radial-gradient(40% 30% at 18% 8%, #FFFFFF 0%, transparent 70%),
    radial-gradient(35% 30% at 88% 22%, rgba(232, 207, 133, 0.22), transparent 70%),
    linear-gradient(180deg, #FBF8F2 0%, var(--elfenbein) 40%, #F1E8D8 100%); }
.bewegt .b__licht { animation: atmen 9s ease-in-out infinite alternate; }
@keyframes atmen { to { filter: brightness(1.03) saturate(1.1); transform: scale(1.04); } }
.b__linien { position: absolute; inset: 0; z-index: -3; pointer-events: none;
  background-image: linear-gradient(to right, rgba(20, 17, 13, 0.055) 1px, transparent 1px);
  background-size: calc((min(1240px, 100vw - 44px)) / 6) 100%;
  background-position: center top;
  -webkit-mask-image: linear-gradient(to bottom, transparent, #000 18%, #000 60%, transparent 92%);
  mask-image: linear-gradient(to bottom, transparent, #000 18%, #000 60%, transparent 92%); }
.b__mandala { position: absolute; z-index: -2; left: 50%; top: 330px; width: min(1500px, 170vw); aspect-ratio: 1; translate: -50% -50%; color: #8A6A1E; opacity: 0.12; pointer-events: none; }
.b__mandala .mandala { width: 100%; height: 100%; animation: drehen 220s linear infinite; }
@keyframes drehen { to { rotate: 360deg; } }
.b__korn { position: absolute; inset: 0; z-index: -1; background-image: var(--korn); opacity: 0.32; mix-blend-mode: multiply; pointer-events: none; }
/* Text */
.b .vertrauen { --rand: #FBF8F2; background: rgba(255, 255, 255, 0.7); color: var(--tinte-2); box-shadow: 0 0 0 1px rgba(138, 106, 30, 0.14), 0 10px 30px -18px rgba(60, 40, 10, 0.4); margin-bottom: 34px; }
.b .titel { max-width: 15ch; margin: 0 auto; font-size: clamp(2.8rem, 6vw, 5.9rem); line-height: 0.98; color: var(--tinte); }
html.schrift-jetzt .b .titel { line-height: 1.02; }
.b .akzent, .b .akzent .wort > span { background: linear-gradient(100deg, #6E5214 0%, #B38F37 40%, #E2C46F 52%, #B38F37 64%, #6E5214 100%) 0 0 / 250% 100%; -webkit-background-clip: text; background-clip: text; color: transparent; }
.bewegt .b .akzent .wort > span { animation: wortAuf 1.1s var(--aus) forwards, glanz 7s ease-in-out infinite; animation-delay: calc(0.15s + var(--i) * 0.06s), 2.6s; }
@keyframes glanz { 0% { background-position: 100% 0; } 40%, 100% { background-position: 0% 0; } }
.b__sub { max-width: 540px; margin: 28px auto 38px; font-size: 1.15rem; line-height: 1.6; color: var(--tinte-2); }
.b__aktion { display: flex; flex-direction: column; justify-content: center; align-items: center; gap: 14px; color: var(--tinte-2); }
/* Buehne: das Video kippt beim Scrollen nach vorne */
.b__buehne { position: relative; max-width: 1120px; margin: 84px auto 0; perspective: 1700px; }
.b__glut { position: absolute; left: 8%; right: 8%; top: 20%; bottom: -6%; z-index: -1; border-radius: 50%; background: radial-gradient(closest-side, rgba(201, 168, 76, 0.55), transparent); filter: blur(40px); }
.b__karte { position: relative; aspect-ratio: 16 / 9; border-radius: 28px; overflow: hidden; background: var(--nacht);
  transform: rotateX(var(--kipp, 16deg)) scale(var(--sk, 0.94)); transform-origin: 50% 0;
  box-shadow: 0 0 0 1px rgba(20, 17, 13, 0.1), 0 0 0 8px rgba(255, 255, 255, 0.5), 0 0 0 9px rgba(138, 106, 30, 0.14), 0 90px 140px -50px rgba(60, 40, 10, 0.6), 0 40px 70px -40px rgba(0, 0, 0, 0.55); }
.b__karte::after { content: ''; position: absolute; inset: 0; z-index: 1; pointer-events: none; background: linear-gradient(to top, rgba(10, 8, 6, 0.75), transparent 45%), radial-gradient(70% 60% at 50% 0%, rgba(255, 240, 200, 0.08), transparent 70%); }
.b__trailer { position: absolute; z-index: 2; left: 50%; top: 50%; translate: -50% -50%; display: grid; place-items: center; width: 104px; height: 104px; border-radius: 50%; border: 0; color: #1A1408; background: radial-gradient(circle at 35% 30%, #F6E2A6, #C9A84C 60%, #A88430); box-shadow: 0 0 0 10px rgba(232, 207, 133, 0.18), 0 0 0 22px rgba(232, 207, 133, 0.08), 0 20px 40px -10px rgba(0, 0, 0, 0.6); transition: transform 0.5s var(--aus); }
.b__trailer:hover { transform: scale(1.07); }
.b__trailer svg { width: 34px; height: 34px; margin-left: 5px; }
.b__trailer-text { position: absolute; z-index: 2; left: 28px; bottom: 24px; color: #F4ECDD; font-size: 0.9rem; letter-spacing: 0.02em; }
.bewegt .b__trailer::before { content: ''; position: absolute; inset: -10px; border-radius: 50%; border: 1px solid rgba(232, 207, 133, 0.7); animation: puls 2.6s ease-out infinite; }
@keyframes puls { from { opacity: 0.9; transform: scale(0.9); } to { opacity: 0; transform: scale(1.5); } }
/* Zahlen schweben als Karten am Rand der Buehne */
.b__chip { position: absolute; z-index: 3; text-align: left; padding: 16px 20px 15px; border-radius: 20px; background: rgba(255, 252, 246, 0.86); -webkit-backdrop-filter: blur(14px); backdrop-filter: blur(14px); box-shadow: 0 0 0 1px rgba(138, 106, 30, 0.14), 0 24px 50px -22px rgba(60, 40, 10, 0.45); }
.b__chip .zahl__wert { display: block; font-family: var(--titel); font-weight: var(--titel-gewicht); letter-spacing: var(--titel-sperrung); font-size: 2rem; line-height: 1.05; color: var(--tinte); font-variant-numeric: tabular-nums lining-nums; }
.b__chip .zahl__label { display: block; margin-top: 3px; font-size: 0.8rem; color: var(--tinte-2); }
.b__chip--1 { left: -70px; top: 14%; } .b__chip--2 { left: -44px; bottom: 16%; }
.b__chip--3 { right: -64px; top: 24%; } .b__chip--4 { right: -36px; bottom: 9%; }
.bewegt .b__chip { animation: schweben 7s ease-in-out infinite alternate; }
.b__chip--2 { animation-delay: -2s !important; } .b__chip--3 { animation-delay: -4s !important; } .b__chip--4 { animation-delay: -1s !important; }
@keyframes schweben { from { translate: 0 -6px; } to { translate: 0 6px; } }
.zahl { display: contents; }
@media (max-width: 1240px) { .b__chip--1, .b__chip--2 { left: -16px; } .b__chip--3, .b__chip--4 { right: -16px; } }
@media (max-width: 760px) {
  .b { padding: 124px 18px 110px; }
  .b .titel { font-size: clamp(2.5rem, 11vw, 3.6rem); }
  .b__buehne { margin-top: 56px; }
  .b__karte { border-radius: 18px; }
  .b__trailer { width: 74px; height: 74px; } .b__trailer svg { width: 24px; height: 24px; }
  .b__zahlen { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-top: 18px; }
  .b__chip { position: static; animation: none !important; }
}
'''

def koerper(g):
    chips = ''.join(f'<div class="b__chip b__chip--{i+1}">{z}</div>' for i, z in enumerate(g.Z))
    return f'''{g.nav('hell')}
<main>
<section class="b">
  <div class="b__licht"></div><div class="b__linien"></div>
  <div class="b__mandala" aria-hidden="true">{g.MANDALA}</div>
  <div class="b__korn"></div>
  <div class="einblenden" style="--v:.1s">{g.VERTRAUEN}</div>
  <h1 class="titel" data-woerter>{g.TITEL}</h1>
  <p class="b__sub einblenden" style="--v:.75s">{g.SUB}</p>
  <div class="b__aktion einblenden" style="--v:.9s">{g.KNOPF}{g.HINWEIS}</div>
  <div class="b__buehne einblenden" style="--v:1s">
    <div class="b__glut"></div>
    <div class="b__karte">
      {g.VIDEO}
      <button type="button" class="b__trailer" data-trailer aria-label="Trailer ansehen">{g.PLAY}</button>
      <span class="b__trailer-text">Trailer ansehen</span>
    </div>
    <div class="b__zahlen">{chips}</div>
  </div>
</section>
</main>'''

JS = r'''
// Die Buehne kippt beim Scrollen nach vorne in die Waagrechte
(function () {
  var karte = document.querySelector('.b__karte');
  if (!karte || window.ENTWURF.RUHIG) { if (karte) { karte.style.setProperty('--kipp', '0deg'); karte.style.setProperty('--sk', '1'); } return; }
  var ist = 0, soll = 0, laeuft = false;
  function ziel() {
    var r = karte.getBoundingClientRect(), vh = innerHeight;
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
  addEventListener('scroll', weck, { passive: true }); addEventListener('resize', weck); weck();
})();
'''
