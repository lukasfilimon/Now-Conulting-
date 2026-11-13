NAME = 'Tag und Nacht'

CSS = r'''
body { background: var(--nacht); }
.a {
  --teil: 50%;
  position: relative;
  min-height: max(calc(100svh - 42px), 720px);
  display: grid;
  grid-template-columns: var(--teil) minmax(0, 1fr);
  transition: grid-template-columns 1.3s var(--aus);
  overflow: clip;
  isolation: isolate;
}
/* --- Tag: Creme mit Papierkorn und warmem Licht --- */
.a__tag {
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 150px clamp(28px, 4vw, 64px) 170px clamp(28px, 6vw, 96px);
  color: var(--tinte);
  background:
    radial-gradient(80% 60% at 0% 0%, #FCF8F0 0%, transparent 60%),
    radial-gradient(70% 60% at 100% 100%, rgba(201, 168, 76, 0.22), transparent 70%),
    var(--creme);
  min-width: 0;
}
.a__tag::after { content: ''; position: absolute; inset: 0; background-image: var(--korn); opacity: 0.38; mix-blend-mode: multiply; pointer-events: none; }
.a__text { position: relative; z-index: 2; max-width: 600px; }
.a__tag .vertrauen { --rand: var(--creme); background: rgba(255, 255, 255, 0.55); box-shadow: inset 0 0 0 1px rgba(138, 106, 30, 0.18); color: var(--tinte-2); margin-bottom: 30px; }
.a__tag .titel { font-size: clamp(2.5rem, 4.1vw, 4.4rem); color: var(--tinte); hyphens: manual; }
.a__tag .akzent, .a__tag .akzent .wort > span { background: linear-gradient(100deg, #6E5214, #B38F37 45%, #8A6A1E); -webkit-background-clip: text; background-clip: text; color: transparent; }
.a__sub { max-width: 470px; margin: 26px 0 36px; font-size: 1.12rem; line-height: 1.6; color: var(--tinte-2); }
.a__aktion { display: flex; flex-wrap: wrap; align-items: center; gap: 16px 22px; color: var(--tinte-2); }
/* --- Nacht: Darkos Video, Licht von rechts --- */
.a__nacht { position: relative; min-width: 0; background: var(--nacht); color: var(--hell-text); }
.a__nacht::before { content: ''; position: absolute; inset: 0; z-index: 1; pointer-events: none;
  background:
    linear-gradient(to right, rgba(13, 11, 9, 0.92) 0%, rgba(13, 11, 9, 0.35) 28%, transparent 55%),
    linear-gradient(to top, rgba(13, 11, 9, 0.95) 0%, rgba(13, 11, 9, 0.2) 40%, transparent 70%),
    radial-gradient(60% 50% at 80% 10%, rgba(232, 207, 133, 0.18), transparent 70%); }
.a__nacht::after { content: ''; position: absolute; inset: 0; z-index: 1; background-image: var(--korn); opacity: 0.25; mix-blend-mode: soft-light; pointer-events: none; }
.a__trailer { position: absolute; z-index: 3; right: clamp(24px, 4vw, 56px); top: 50%; translate: 0 -50%; display: flex; align-items: center; gap: 14px; padding: 8px 22px 8px 8px; border-radius: 999px; border: 0; color: var(--hell-text); background: rgba(20, 17, 13, 0.45); -webkit-backdrop-filter: blur(12px); backdrop-filter: blur(12px); box-shadow: inset 0 0 0 1px rgba(232, 207, 133, 0.35); font-size: 0.92rem; transition: background 0.4s ease; }
.a__trailer:hover { background: rgba(201, 168, 76, 0.25); }
.a__trailer span { display: grid; place-items: center; width: 46px; height: 46px; border-radius: 50%; background: linear-gradient(180deg, #ECD38A, #C9A84C); color: #1A1408; }
.a__trailer svg { width: 18px; height: 18px; margin-left: 2px; }
/* --- Zahlen am Fuss jeder Haelfte --- */
.a__zahlen { position: absolute; z-index: 3; bottom: 38px; left: clamp(28px, 6vw, 96px); right: clamp(24px, 4vw, 56px); display: flex; gap: clamp(24px, 4vw, 56px); }
.a__nacht .a__zahlen { left: clamp(28px, 4vw, 64px); }
.zahl { display: flex; flex-direction: column; gap: 2px; padding-top: 14px; border-top: 1px solid currentColor; border-color: rgba(138, 106, 30, 0.3); min-width: 120px; }
.a__nacht .zahl { border-color: rgba(232, 207, 133, 0.28); }
.zahl__wert { font-family: var(--titel); font-weight: var(--titel-gewicht); letter-spacing: var(--titel-sperrung); font-size: clamp(1.7rem, 2.4vw, 2.3rem); line-height: 1.1; font-variant-numeric: tabular-nums lining-nums; }
.a__nacht .zahl__wert { color: var(--hell-text); }
.zahl__label { font-size: 0.8rem; opacity: 0.7; }
/* --- Die Naht: ein Mandala, halb im Tag, halb in der Nacht --- */
.naht { position: absolute; z-index: 2; top: 50%; left: var(--teil); width: min(86vh, 820px); aspect-ratio: 1; translate: -50% -50%; pointer-events: none; transition: left 1.3s var(--aus); }
.naht__teil { position: absolute; inset: 0; }
.naht__teil--tag { clip-path: inset(0 50% 0 0); color: #8A6A1E; opacity: 0.22; }
.naht__teil--nacht { clip-path: inset(0 0 0 50%); color: #E8CF85; opacity: 0.42; }
.naht .mandala { width: 100%; height: 100%; animation: drehen 160s linear infinite; }
@keyframes drehen { to { rotate: 360deg; } }
.naht__linie { position: absolute; left: 50%; top: 0; bottom: 0; width: 1px; translate: -50% 0; background: linear-gradient(to bottom, transparent, rgba(201, 168, 76, 0.7) 30%, rgba(201, 168, 76, 0.7) 70%, transparent); box-shadow: 0 0 18px rgba(201, 168, 76, 0.6); }
/* --- Auftritt --- */
.bewegt .a__nacht { animation: nachtEin 1.6s var(--aus) both; }
@keyframes nachtEin { from { clip-path: inset(0 0 0 100%); } to { clip-path: inset(0 0 0 0); } }
.bewegt .naht { animation: nahtEin 2.2s var(--aus) 0.4s both; }
@keyframes nahtEin { from { opacity: 0; scale: 0.8; } to { opacity: 1; scale: 1; } }
/* --- Schmal: Tag oben, Nacht darunter --- */
@media (max-width: 900px) {
  .a { grid-template-columns: minmax(0, 1fr); grid-template-rows: auto minmax(64svh, auto); min-height: 0; }
  .a__tag { padding: 120px 22px 150px; }
  .a__tag .titel { font-size: clamp(2.3rem, 9.6vw, 3.4rem); }
  .naht { display: none; }
  .a__nacht { border-top: 1px solid rgba(201, 168, 76, 0.6); box-shadow: 0 -10px 30px -8px rgba(201, 168, 76, 0.5); }
  .a__trailer { top: auto; bottom: 150px; translate: 0 0; left: 22px; right: auto; }
  .a__zahlen { left: 22px; right: 22px; bottom: 30px; gap: 22px; }
  .zahl { min-width: 0; flex: 1; }
  .bewegt .a__nacht { animation: none; }
}
'''

def koerper(g):
    return f'''{g.nav('dunkel')}
<main>
<section class="a">
  <div class="a__tag">
    <div class="a__text">
      <div class="einblenden" style="--v:.1s">{g.VERTRAUEN}</div>
      <h1 class="titel" data-woerter>{g.TITEL}</h1>
      <p class="a__sub einblenden" style="--v:.7s">{g.SUB}</p>
      <div class="a__aktion einblenden" style="--v:.85s">{g.KNOPF}{g.HINWEIS}</div>
    </div>
    <div class="a__zahlen einblenden" style="--v:1s">{g.Z[0]}{g.Z[1]}</div>
  </div>
  <div class="a__nacht">
    {g.VIDEO}
    <button type="button" class="a__trailer" data-trailer><span>{g.PLAY}</span>Trailer ansehen</button>
    <div class="a__zahlen einblenden" style="--v:1.1s">{g.Z[2]}{g.Z[3]}</div>
  </div>
  <div class="naht" aria-hidden="true">
    <div class="naht__teil naht__teil--tag">{g.MANDALA}</div>
    <div class="naht__teil naht__teil--nacht">{g.MANDALA}</div>
    <span class="naht__linie"></span>
  </div>
</section>
</main>'''

JS = r'''
// Die Seite unter der Maus bekommt mehr Raum: Tag oder Nacht
(function () {
  var a = document.querySelector('.a');
  if (!a || !window.ENTWURF.FEIN || window.ENTWURF.RUHIG) return;
  var tag = a.querySelector('.a__tag'), nacht = a.querySelector('.a__nacht');
  tag.addEventListener('pointerenter', function () { a.style.setProperty('--teil', '56%'); });
  nacht.addEventListener('pointerenter', function () { a.style.setProperty('--teil', '45%'); });
  a.addEventListener('pointerleave', function () { a.style.setProperty('--teil', '50%'); });
})();
'''
