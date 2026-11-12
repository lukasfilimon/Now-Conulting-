/* WCAG-Kontrast an jeder Textstelle — gemessen, nicht geschaetzt.
 *
 * Warum so umstaendlich: der Grund hinter einem Text ist auf dieser Seite
 * oft ein Foto unter mehreren Verlaeufen. Kein CSS-Wert sagt einem, was
 * dort ankommt. Also wird der Text kurz durchsichtig geschaltet und das
 * Pixel darunter aus einem echten Screenshot gelesen.
 *
 * Zwei Fallen, die hier bewusst umgangen werden:
 *  - Nur das Element durchsichtig zu schalten reicht nicht: Kindelemente
 *    mit eigener Farbe bleiben stehen und faelschen die Messung.
 *  - Die Elementbox ist nicht die Glyphenbox. Bei breiten Absaetzen liegt
 *    die Mitte der Box zwischen den Zeilen oder ueber dem Nachbarn. Deshalb
 *    wird ueber einen Range die tatsaechliche Textzeile vermessen.
 *
 * Aufruf:  LP_URL=http://127.0.0.1:8080 node qa/kontrast.mjs
 */
import { chromium } from 'playwright';
import { PNG } from 'pngjs';

const BASIS = process.env.LP_URL || 'http://127.0.0.1:8080';
const SCHWELLE_NORMAL = 4.5;   // WCAG 2.1 AA, normaler Text
const SCHWELLE_GROSS = 3.0;    // >= 24px, oder >= 18.66px und fett

const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
const ctx = await browser.newContext({ viewport: { width: 390, height: 844 } });
await ctx.route('**/*', r => {
  const u = r.request().url();
  if (u.includes('facebook') || u.includes('googletagmanager') || u.includes('vimeo'))
    return r.fulfill({ status: 200, contentType: 'text/plain', body: '' });
  r.continue();
});
await ctx.addInitScript(() => { try { localStorage.setItem('consent_v1', 'declined'); } catch (e) {} });
const page = await ctx.newPage();
await page.goto(BASIS + '/', { waitUntil: 'networkidle' });
await page.addStyleTag({ content: `
  html { scroll-behavior: auto !important; }
  *, *::before, *::after { animation: none !important; transition: none !important; }
  [class*="reveal"] { opacity: 1 !important; transform: none !important; }
  canvas, iframe { visibility: hidden !important; }
  #cookie-bar { display: none !important; }
  .kontrast-messung, .kontrast-messung * {
    color: transparent !important; text-shadow: none !important;
    -webkit-text-fill-color: transparent !important;
  }
` });
await page.evaluate(() => {
  document.querySelectorAll('[class*="reveal"]').forEach(e => e.classList.add('visible'));
  document.querySelectorAll('.section-divider').forEach(e => e.classList.add('section-divider-visible'));
});

const anzahl = await page.evaluate(() => {
  window.__st = [];
  const l = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  const gesehen = new Set();
  let k;
  while ((k = l.nextNode())) {
    if (k.textContent.trim().length < 3) continue;
    const el = k.parentElement;
    if (!el || gesehen.has(el)) continue;
    const s = getComputedStyle(el);
    // Verlaufsschrift: der sichtbare Farbwert steckt im Verlauf, nicht in color.
    const alpha = (s.color.match(/[\d.]+/g) || [])[3];
    if (alpha !== undefined && parseFloat(alpha) < 0.1) continue;
    // Vorfahren mitpruefen — ein geschlossenes Modal ist opacity:0 am Container.
    let sichtbar = true;
    for (let a = el; a && a !== document.body; a = a.parentElement) {
      const as = getComputedStyle(a);
      if (as.visibility === 'hidden' || as.display === 'none' || parseFloat(as.opacity) < 0.1 ||
          a.hidden || a.getAttribute('aria-hidden') === 'true') { sichtbar = false; break; }
    }
    if (!sichtbar) continue;
    gesehen.add(el);
    window.__st.push({ el: el, knoten: k });
  }
  return window.__st.length;
});

function leucht([r, g, b]) {
  const f = v => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); };
  return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
}
const verh = (a, b) => {
  const l1 = leucht(a), l2 = leucht(b);
  return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
};

const treffer = [];
let gemessen = 0;
for (let i = 0; i < anzahl; i++) {
  const vor = await page.evaluate(nr => {
    const { el, knoten } = window.__st[nr];
    const r = document.createRange(); r.selectNodeContents(knoten);
    const kaesten = [...r.getClientRects()].filter(k => k.width > 4 && k.height > 4);
    if (!kaesten.length) return null;
    const k = kaesten[0];
    const ziel = k.top + window.scrollY - window.innerHeight / 2;
    window.scrollTo(0, Math.max(0, ziel));
    const s = getComputedStyle(el);
    const px = parseFloat(s.fontSize), fett = parseInt(s.fontWeight, 10) >= 700;
    // getComputedStyle liefert ein LEBENDES Objekt: nach dem Hinzufuegen der
    // Messklasse gaebe s.color transparent zurueck. Also vorher festhalten.
    const farbe = (s.color.match(/\d+/g) || [255,255,255]).slice(0,3).map(Number);
    const pfad = el.tagName.toLowerCase() + (typeof el.className === 'string' && el.className
              ? '.' + el.className.trim().split(/\s+/).slice(0,2).join('.') : '');
    el.classList.add('kontrast-messung');
    const n = [...r.getClientRects()].filter(x => x.width > 4 && x.height > 4)[0];
    if (!n) { el.classList.remove('kontrast-messung'); return null; }
    return {
      x: Math.round(n.left + n.width / 2), y: Math.round(n.top + n.height / 2),
      farbe: farbe,
      gross: px >= 24 || (px >= 18.66 && fett),
      text: knoten.textContent.trim().slice(0, 42),
      pfad: pfad
    };
  }, i);

  if (!vor || vor.x < 1 || vor.y < 1 || vor.x > 388 || vor.y > 842) {
    await page.evaluate(nr => window.__st[nr].el.classList.remove('kontrast-messung'), i);
    continue;
  }
  const roh = await page.screenshot({ clip: { x: vor.x - 1, y: vor.y - 1, width: 3, height: 3 } });
  await page.evaluate(nr => window.__st[nr].el.classList.remove('kontrast-messung'), i);

  const png = PNG.sync.read(roh);
  const o = ((png.width * 1) + 1) << 2;
  const grund = [png.data[o], png.data[o+1], png.data[o+2]];
  const v = verh(vor.farbe, grund);
  const soll = vor.gross ? SCHWELLE_GROSS : SCHWELLE_NORMAL;
  gemessen++;
  if (v < soll) treffer.push({ ...vor, wert: v, soll, grund });
}

await browser.close();
if (!treffer.length) {
  console.log(`alle ${gemessen} messbaren Textstellen erfuellen WCAG AA`);
  process.exit(0);
}
treffer.sort((a, b) => a.wert - b.wert);
console.log(`${treffer.length} von ${gemessen} Textstellen unter der Schwelle:\n`);
for (const t of treffer)
  console.log(`  ${t.wert.toFixed(2)}:1 (noetig ${t.soll})  ${t.pfad}` +
              `\n      Text rgb(${t.farbe}) auf rgb(${t.grund})  "${t.text}"`);
process.exit(1);
