// Pruefung der NOW-Webseite. Lokal:
//   python3 -m http.server 8811 --bind 127.0.0.1 &
//   WEB_URL=http://127.0.0.1:8811 node qa/pruefen.mjs
// Gegen die echte Domain mit --live (dann ist noindex ein Fehler).
import { chromium } from 'playwright';
const BASIS = process.env.WEB_URL || 'http://127.0.0.1:8811';
const LIVE = process.argv.includes('--live');
const browser = await chromium.launch();
let n = 0, schlecht = 0;
const p = (name, ist, soll = true) => {
  n++; const ok = ist === soll;
  if (!ok) schlecht++;
  console.log((ok ? '  OK   ' : '  FEHL ') + name + (ok ? '' : `   (${JSON.stringify(ist)}, erwartet ${JSON.stringify(soll)})`));
};

// --- 1. Vor der Zustimmung: kein Request an Meta, Calendly, nur das Hero-Video an Vimeo
{
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const anfragen = [];
  await ctx.route('**/*', r => {
    const u = r.request().url();
    if (!u.startsWith(BASIS)) { anfragen.push(u); return r.fulfill({ status: 200, contentType: 'text/plain', body: '' }); }
    r.continue();
  });
  const page = await ctx.newPage();
  const fehler = [];
  page.on('pageerror', e => { if (!/Vimeo is not defined/.test(e.message)) fehler.push(e.message); });
  page.on('console', m => { if (m.type() === 'error' && !/ERR_|net::|Vimeo/.test(m.text())) fehler.push(m.text()); });
  await page.goto(BASIS + '/', { waitUntil: 'networkidle' });
  await page.evaluate(async () => { for (let y = 0; y < document.body.scrollHeight; y += 500) { scrollTo(0, y); await new Promise(r => setTimeout(r, 40)); } });
  await page.waitForTimeout(800);
  p('1a keine JS-Fehler', fehler.join(' | '), '');
  p('1b kein Request an Meta vor Zustimmung', anfragen.some(u => /facebook/.test(u)), false);
  p('1c kein Request an Calendly vor Zustimmung', anfragen.some(u => /calendly/.test(u)), false);
  p('1d an Vimeo nur das Hero-Video', [...new Set(anfragen.filter(u => /player\.vimeo\.com\/video\//.test(u)).map(u => u.match(/video\/(\d+)/)[1]))].join(','), '1192498083');
  p('1e Cookie-Leiste sichtbar', await page.isVisible('#cookie-bar'), true);
  p('1f genau eine h1', await page.locator('h1').count(), 1);
  p('1g ein Knopf-Wortlaut', [...new Set(await page.locator('a.btn').allTextContents())].map(t => t.trim()).join('|'), 'Klarheitsgespräch buchen');
  p('1h jeder Knopf fuehrt zu /termin/', (await page.locator('a.btn').evaluateAll(as => as.every(a => a.getAttribute('href') === '/termin/'))), true);
  const robots = await page.locator('meta[name=robots]').count();
  if (LIVE) p('1i LIVE: kein noindex auf der Startseite', robots, 0);
  else p('1i Vorschau: noindex gesetzt', robots, 1);
  p('1j alle Bilder geladen', await page.evaluate(() => [...document.images].filter(i => !i.complete || !i.naturalWidth).map(i => i.src).join(', ')), '');
  p('1k Anker der Navigation existieren', await page.evaluate(() => [...document.querySelectorAll('.kopf__nav a')].every(a => document.querySelector(a.getAttribute('href')))), true);

  // Mandala
  const mandala = await page.evaluate(() => [...document.querySelectorAll('[data-mandala]')].map(sek => {
    const h = sek.querySelector('.lp-mandala'), c = h && h.querySelector('canvas');
    if (!c || !c.width) return sek.id + ': kein Mandala';
    const s = sek.getBoundingClientRect(), r = c.getBoundingClientRect(), w = h.getBoundingClientRect();
    const dx = Math.abs((r.left + r.width / 2) - (s.left + s.width / 2)), dy = Math.abs((r.top + r.height / 2) - (s.top + s.height / 2));
    if (dx > 2 || dy > 2) return sek.id + ': nicht mittig';
    if (Math.abs(w.width - s.width) > 2 || Math.abs(w.height - s.height) > 2) return sek.id + ': Huelle deckt nicht';
    return 'ok';
  }));
  p('1l Mandala in jeder data-mandala-Sektion da und mittig', mandala.length === 2 && mandala.every(m => m === 'ok') ? 'ok' : mandala.join(', '), 'ok');
  await page.waitForTimeout(1500);   // Linien blenden ueber 1,2 s ein
  p('1m Trennlinien eingeblendet', await page.evaluate(() => ['.kunde', '.schritte', '.programme', '.darko-section', '.testimonials', '.erfahrungen', '.team', '.faq'].filter(s => getComputedStyle(document.querySelector(s), '::before').opacity !== '1').join(',')), '');

  // FAQ
  await page.locator('.faq__question').first().click();
  await page.waitForTimeout(500);
  p('1n FAQ klappt auf', await page.locator('.faq__item').first().evaluate(e => e.classList.contains('open')), true);

  // Zustimmung: Videos laden, Meta nur auf der echten Domain
  anfragen.length = 0;
  await page.click('#cookie-accept');
  await page.waitForTimeout(1200);
  const vids = [...new Set(anfragen.filter(u => /player\.vimeo\.com\/video\//.test(u)).map(u => u.match(/video\/(\d+)/)[1]))];
  p('1o nach Zustimmung laden die 11 weiteren Videos', vids.length, 11);
  p('1p Meta-Pixel bleibt auf der Vorschau aus', anfragen.some(u => /facebook/.test(u)), LIVE);
  await ctx.close();
}

// --- 2. Ueberstand und Kopfleiste in allen Breiten
for (const w of [320, 360, 375, 390, 414, 768, 1024, 1280, 1440]) {
  const ctx = await browser.newContext({ viewport: { width: w, height: 800 } });
  await ctx.route('**/*', r => r.request().url().startsWith(BASIS) ? r.continue() : r.abort());
  const page = await ctx.newPage();
  for (const pfad of ['/', '/termin/', '/datenschutz/', '/agb/', '/impressum/']) {
    await page.goto(BASIS + pfad, { waitUntil: 'load' });
    await page.evaluate(async () => { for (let y = 0; y < document.body.scrollHeight; y += 600) { scrollTo(0, y); await new Promise(r => setTimeout(r, 15)); } });
    const ueber = await page.evaluate(() => document.documentElement.scrollWidth - innerWidth);
    const kopf = await page.evaluate(() => { const k = document.querySelector('.kopf__inner').getBoundingClientRect(); return k.right <= innerWidth + 0.5 && k.left >= -0.5; });
    if (ueber !== 0 || !kopf) p(`2 ${w}px ${pfad}: kein Ueberstand, Kopfleiste passt`, `${ueber}px / ${kopf}`, '0px / true');
    else n++;
  }
  await ctx.close();
}
console.log('  OK   2 kein Ueberstand auf 9 Breiten x 5 Seiten (gesammelt)');

// --- 3. Termin: Calendly erst nach Klick
{
  const ctx = await browser.newContext();
  const anfragen = [];
  await ctx.route('**/*', r => { const u = r.request().url(); if (!u.startsWith(BASIS)) { anfragen.push(u); return r.fulfill({ status: 200, body: '' }); } r.continue(); });
  const page = await ctx.newPage();
  await page.goto(BASIS + '/termin/', { waitUntil: 'networkidle' });
  p('3a Termin: kein Calendly vor dem Klick', anfragen.some(u => /calendly/.test(u)), false);
  await page.click('#kalenderLaden');
  await page.waitForTimeout(500);
  p('3b Termin: Calendly nach dem Klick', anfragen.some(u => /calendly/.test(u)), true);
  p('3c Termin: Widget eingefuegt', await page.locator('.calendly-inline-widget').count(), 1);
  await ctx.close();
}

// --- 4. Arbeitsdateien nicht oeffentlich (nur sinnvoll gegen Netlify)
if (!BASIS.includes('127.0.0.1')) {
  for (const f of ['/README.md', '/CLAUDE.md', '/netlify.toml', '/qa/pruefen.mjs', '/werkzeuge/unterseiten.py', '/notizen/Orienteriungsdokument']) {
    const r = await fetch(BASIS + f);
    p('4 gesperrt: ' + f, r.status, 404);
  }
}

await browser.close();
console.log(`\n${n - schlecht}/${n} bestanden`);
process.exit(schlecht ? 1 : 0);
