// Laeuft die Seite fluessig? Scrollt einmal gleichmaessig von oben nach
// unten und misst je Sektion die Bildzeiten (haengende Bilder), lange
// Animationsbilder samt bremsendem Skript (Long Animation Frames), Layout-
// Spruenge (CLS) und Konsolenfehler.
//
//   WEB_URL=http://127.0.0.1:8822 node qa/fluessig.mjs            Desktop 1470x713
//   WEB_URL=... GERAET=handy node qa/fluessig.mjs                  iPhone-Groesse
//   WEB_URL=... CPU=4 node qa/fluessig.mjs                         4x langsamere CPU
//
// Achtung: der Testbrowser rendert ohne Grafikkarte. Absolute Bildzeiten
// sind darum schlechter als auf echten Geraeten; aussagekraeftig ist der
// Vergleich der Sektionen untereinander und die Skriptzeit (main thread).
import { chromium } from 'playwright';

const URL = (process.env.WEB_URL || 'http://127.0.0.1:8822').replace(/\/$/, '');
const HANDY = process.env.GERAET === 'handy';
const CPU = +(process.env.CPU || 1);
const TEMPO = +(process.env.TEMPO || 900);          // Pixel pro Sekunde

const b = await chromium.launch();
const ctx = await b.newContext(HANDY
  ? { viewport: { width: 390, height: 844 }, deviceScaleFactor: 3, isMobile: true, hasTouch: true }
  : { viewport: { width: 1470, height: 713 } });
const p = await ctx.newPage();
const fehler = [];
p.on('console', m => { if (m.type() === 'error' || m.type() === 'warning') fehler.push(m.type() + ': ' + m.text().slice(0, 200)); });
p.on('pageerror', e => fehler.push('Skriptfehler: ' + e.message));
p.on('requestfailed', r => { if (!/vimeo|player\.|facebook|google/.test(r.url())) fehler.push('nicht geladen: ' + r.url()); });

await p.addInitScript(() => {
  try { localStorage.setItem('consent_v1', 'declined'); } catch (e) {}
  window.__loaf = []; window.__cls = [];
  try {
    new PerformanceObserver(l => l.getEntries().forEach(e => window.__loaf.push({
      t: e.startTime, d: Math.round(e.duration), blk: Math.round(e.blockingDuration || 0),
      stil: e.styleAndLayoutStart ? Math.round(e.startTime + e.duration - e.styleAndLayoutStart) : 0,
      skripte: (e.scripts || []).map(x => ((x.sourceFunctionName || x.invoker || '?') + '@' + (x.sourceURL || '').split('/').pop() + ' ' + Math.round(x.duration) + 'ms'))
    }))).observe({ type: 'long-animation-frame', buffered: true });
  } catch (e) {}
  try {
    new PerformanceObserver(l => l.getEntries().forEach(e => { if (!e.hadRecentInput && e.value > 0.001) window.__cls.push({ v: +e.value.toFixed(4), t: Math.round(e.startTime), q: (e.sources || []).map(s => s.node ? (s.node.className || s.node.nodeName || '').toString().slice(0, 60) : '?').join(' | ') }); })).observe({ type: 'layout-shift', buffered: true });
  } catch (e) {}
});
if (CPU > 1) { const cdp = await ctx.newCDPSession(p); await cdp.send('Emulation.setCPUThrottlingRate', { rate: CPU }); }

await p.goto(URL + '/', { waitUntil: 'load' });
await p.waitForTimeout(2000);
const ladeCls = await p.evaluate(() => window.__cls.slice());
const ladeLoaf = await p.evaluate(() => window.__loaf.slice());

const frames = await p.evaluate(async (tempo) => {
  const sek = [...document.querySelectorAll('main > section[id], body > section[id], section[id], footer')];
  const wo = () => { const m = innerHeight / 2; for (const s of sek) { const r = s.getBoundingClientRect(); if (r.top <= m && r.bottom >= m) return s.id || 'footer'; } return '?'; };
  const max = document.documentElement.scrollHeight - innerHeight;
  const out = []; let last = performance.now(), y = 0;
  await new Promise(fertig => {
    function tick(t) {
      const dt = t - last; last = t;
      out.push({ dt, s: wo(), t });
      y = Math.min(max, y + tempo * Math.min(dt, 50) / 1000);
      scrollTo({ top: y, behavior: 'instant' });
      if (y >= max) fertig(); else requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  });
  return out;
}, TEMPO);
await p.waitForTimeout(800);
const loaf = await p.evaluate(() => window.__loaf.slice());
const cls = await p.evaluate(() => window.__cls.slice());

// Auswertung je Sektion
const proSek = new Map();
for (const f of frames.slice(2)) {
  const e = proSek.get(f.s) || { n: 0, dts: [], t0: f.t, t1: f.t };
  e.n++; e.dts.push(f.dt); e.t1 = f.t; proSek.set(f.s, e);
}
const zeile = (s, e) => {
  const d = e.dts.slice().sort((a, b) => a - b);
  const p95 = d[Math.floor(d.length * 0.95)] || 0;
  const haengt = e.dts.filter(x => x > 25).length, stark = e.dts.filter(x => x > 50).length;
  const lang = loaf.filter(l => l.t >= e.t0 - 5 && l.t <= e.t1 + 5);
  return { s, bilder: e.n, mittel: +(e.dts.reduce((a, b) => a + b, 0) / e.n).toFixed(1), p95: +p95.toFixed(1), haengt, stark, lang: lang.length, langMax: Math.max(0, ...lang.map(l => l.d)) };
};
console.log(`\n${HANDY ? 'Handy 390x844' : 'Desktop 1470x713'}${CPU > 1 ? ', CPU ' + CPU + 'x langsamer' : ''} · ${URL}`);
console.log('Sektion'.padEnd(16), 'Bilder', 'Mittel', ' p95', 'haengt', 'stark', 'LoAF', 'max');
for (const [s, e] of proSek) {
  const z = zeile(s, e);
  console.log(z.s.padEnd(16), String(z.bilder).padStart(6), String(z.mittel).padStart(6), String(z.p95).padStart(5), String(z.haengt).padStart(6), String(z.stark).padStart(5), String(z.lang).padStart(4), String(z.langMax).padStart(4));
}
// Die schwersten Animationsbilder mit Skript
const schwer = loaf.filter(l => l.t > 2000).sort((a, b) => b.d - a.d).slice(0, 6);
if (schwer.length) {
  console.log('\nSchwerste Bilder waehrend des Scrollens:');
  for (const l of schwer) {
    const f = frames.reduce((a, b) => Math.abs(b.t - l.t) < Math.abs(a.t - l.t) ? b : a, frames[0]);
    console.log(`  ${l.d}ms in ${f.s} (Stil/Layout ${l.stil}ms) ${l.skripte.join(', ')}`);
  }
}
// Beim Laden: wie lange war der Hauptthread blockiert, wodurch?
const blockiert = ladeLoaf.reduce((a, l) => a + l.blk, 0);
console.log(`\nBeim Laden: ${ladeLoaf.length} lange Bilder, ${blockiert} ms blockiert (TBT-aehnlich)`);
const skripte = {};
ladeLoaf.forEach(l => l.skripte.forEach(x => { const m = x.match(/^(.*) (\d+)ms$/); if (m) skripte[m[1]] = (skripte[m[1]] || 0) + +m[2]; }));
Object.entries(skripte).sort((a, b) => b[1] - a[1]).slice(0, 6).forEach(([k, v]) => console.log(`  ${v} ms  ${k}`));
const clsSumme = cls.reduce((a, c) => a + c.v, 0);
console.log(`\nLayout-Spruenge (CLS): ${clsSumme.toFixed(4)} gesamt, beim Laden ${ladeCls.reduce((a, c) => a + c.v, 0).toFixed(4)}`);
for (const c of cls.sort((a, b) => b.v - a.v).slice(0, 5)) console.log(`  ${c.v} bei ${c.t}ms: ${c.q}`);
console.log(fehler.length ? '\nKonsole:\n  ' + [...new Set(fehler)].join('\n  ') : '\nKonsole: sauber');
await b.close();
