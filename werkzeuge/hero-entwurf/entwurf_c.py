NAME = 'Nacht mit Insel'

CSS = r'''
body { background: var(--nacht); color: var(--hell-text); }
.c { position: relative; min-height: max(calc(100svh - 42px), 740px); overflow: clip; isolation: isolate; display: flex; flex-direction: column; justify-content: flex-end; }
.c__video { position: absolute; inset: 0; z-index: -4; }
.bewegt .c__video { animation: heranfahren 3.2s var(--aus) both; }
@keyframes heranfahren { from { transform: scale(1.14); filter: brightness(0.4); } to { transform: scale(1); filter: brightness(1); } }
.c__dunkel { position: absolute; inset: 0; z-index: -3; pointer-events: none;
  background:
    linear-gradient(to top, rgba(11, 9, 7, 0.97) 0%, rgba(11, 9, 7, 0.7) 30%, rgba(11, 9, 7, 0.2) 58%, rgba(11, 9, 7, 0.55) 100%),
    linear-gradient(to right, rgba(11, 9, 7, 0.8) 0%, rgba(11, 9, 7, 0.25) 55%, transparent 80%),
    radial-gradient(120% 90% at 50% 40%, transparent 50%, rgba(0, 0, 0, 0.55) 100%); }
.c__licht { position: absolute; inset: 0; z-index: -2; pointer-events: none; background: radial-gradient(45% 40% at 92% 6%, rgba(232, 207, 133, 0.26), transparent 70%), radial-gradient(30% 30% at 8% 100%, rgba(201, 168, 76, 0.14), transparent 70%); mix-blend-mode: screen; }
.c__korn { position: absolute; inset: 0; z-index: -1; background-image: var(--korn); opacity: 0.3; mix-blend-mode: soft-light; pointer-events: none; }
/* Inhalt am unteren Rand */
.c__unten { width: min(1320px, 100%); margin: 0 auto; padding: 150px clamp(22px, 5vw, 72px) 34px; display: grid; grid-template-columns: minmax(0, 1.4fr) minmax(0, 0.8fr); gap: clamp(28px, 4vw, 64px); align-items: end; }
.c .titel { font-size: clamp(2.8rem, 6.2vw, 6.6rem); line-height: 0.98; color: var(--hell-text); max-width: 12.5ch; text-shadow: 0 10px 50px rgba(0, 0, 0, 0.45); }
html.schrift-jetzt .c .titel { line-height: 1.02; }
.c .akzent, .c .akzent .wort > span { background: linear-gradient(100deg, #F6E2A6, #C9A84C 60%, #E8CF85); -webkit-background-clip: text; background-clip: text; color: transparent; }
.c__zahlen { display: flex; flex-wrap: wrap; gap: 0; margin-top: 46px; }
.c .zahl { display: flex; flex-direction: column; gap: 2px; padding: 0 clamp(18px, 2.4vw, 34px); border-left: 1px solid rgba(232, 207, 133, 0.28); }
.c .zahl:first-child { padding-left: 0; border-left: 0; }
.c .zahl__wert { font-family: var(--titel); font-weight: var(--titel-gewicht); letter-spacing: var(--titel-sperrung); font-size: clamp(1.6rem, 2.3vw, 2.2rem); line-height: 1.1; color: var(--hell-text); font-variant-numeric: tabular-nums lining-nums; }
.c .zahl__label { font-size: 0.8rem; color: var(--hell-text-2); }
/* Die helle Insel: Untertitel, Knopf, Vertrauen */
.c__insel { position: relative; padding: 28px 28px 26px; border-radius: 28px; color: var(--tinte); background: radial-gradient(90% 70% at 100% 0%, rgba(232, 207, 133, 0.35), transparent 60%), var(--creme); box-shadow: 0 0 0 1px rgba(255, 245, 220, 0.4), 0 50px 100px -30px rgba(0, 0, 0, 0.85); overflow: hidden; }
.c__insel::after { content: ''; position: absolute; inset: 0; background-image: var(--korn); opacity: 0.35; mix-blend-mode: multiply; pointer-events: none; }
.c__insel > * { position: relative; z-index: 1; }
.c__insel .vertrauen { --rand: var(--creme); padding-left: 0; color: var(--tinte-2); }
.c__sub { margin: 16px 0 24px; font-size: 1.08rem; line-height: 1.6; color: var(--tinte-2); }
.c__insel .knopf { width: 100%; justify-content: space-between; }
.c__insel .hinweis { margin-top: 14px; color: var(--tinte-2); }
.bewegt .c__insel { animation: inselEin 1.4s var(--aus) 0.9s both; }
@keyframes inselEin { from { opacity: 0; transform: translateY(40px) scale(0.97); } to { opacity: 1; transform: none; } }
/* Runder Trailer-Knopf mit umlaufender Schrift */
.c__trailer { position: absolute; z-index: 2; right: clamp(22px, 7vw, 120px); top: max(120px, 20vh); width: 148px; height: 148px; border-radius: 50%; border: 0; padding: 0; color: var(--hell-text); background: rgba(20, 17, 13, 0.35); -webkit-backdrop-filter: blur(10px); backdrop-filter: blur(10px); box-shadow: inset 0 0 0 1px rgba(232, 207, 133, 0.35); transition: transform 0.5s var(--aus), background 0.4s ease; }
.c__trailer:hover { transform: scale(1.06); background: rgba(201, 168, 76, 0.2); }
.c__ring { position: absolute; inset: 0; width: 100%; height: 100%; }
.bewegt .c__ring { animation: drehen 18s linear infinite; }
@keyframes drehen { to { rotate: 360deg; } }
.c__ring text { font-family: var(--sans); font-size: 10.5px; letter-spacing: 3.4px; text-transform: uppercase; fill: currentColor; }
.c__play { position: absolute; left: 50%; top: 50%; translate: -50% -50%; display: grid; place-items: center; width: 64px; height: 64px; border-radius: 50%; color: #1A1408; background: radial-gradient(circle at 35% 30%, #F6E2A6, #C9A84C 60%, #A88430); }
.c__play svg { width: 22px; height: 22px; margin-left: 3px; }
@media (max-width: 900px) {
  .c__unten { grid-template-columns: minmax(0, 1fr); padding-top: 0; }
  .c .titel { font-size: clamp(2.5rem, 11vw, 3.8rem); }
  .c__zahlen { margin-top: 28px; row-gap: 16px; }
  .c .zahl { width: 50%; min-width: 0; padding: 0 0 0 14px; }
  .c .zahl__label { white-space: nowrap; }
  .c .zahl:nth-child(odd) { padding-left: 0; border-left: 0; }
  .c { padding-top: 118px; }
  .c__trailer { position: relative; top: auto; right: auto; align-self: flex-start; margin: 0 0 22px 22px; width: 96px; height: 96px; flex: none; }
  .c__ring text { font-size: 12.5px; letter-spacing: 3px; }
  .c__play { width: 48px; height: 48px; }
}
'''

def koerper(g):
    ring = '<svg class="c__ring" viewBox="0 0 148 148" aria-hidden="true"><defs><path id="kreis" d="M74,74 m-58,0 a58,58 0 1,1 116,0 a58,58 0 1,1 -116,0"/></defs><text><textPath href="#kreis">Trailer ansehen · Trailer ansehen · </textPath></text></svg>'
    return f'''{g.nav('dunkel')}
<main>
<section class="c">
  <div class="c__video">{g.VIDEO}</div>
  <div class="c__dunkel"></div><div class="c__licht"></div><div class="c__korn"></div>
  <button type="button" class="c__trailer einblenden" style="--v:1.4s" data-trailer aria-label="Trailer ansehen">{ring}<span class="c__play">{g.PLAY}</span></button>
  <div class="c__unten">
    <div>
      <h1 class="titel" data-woerter>{g.TITEL}</h1>
      <div class="c__zahlen einblenden" style="--v:1.1s">{''.join(g.Z)}</div>
    </div>
    <aside class="c__insel">
      {g.VERTRAUEN}
      <p class="c__sub">{g.SUB}</p>
      {g.KNOPF}
      <div>{g.HINWEIS}</div>
    </aside>
  </div>
</section>
</main>'''

JS = ''
