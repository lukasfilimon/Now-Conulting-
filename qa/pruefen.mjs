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
  p('1g Knopftexte wie auf der alten Seite', [...new Set((await page.locator('a.btn').allTextContents()).map(t => t.replace(/\s+/g, ' ').trim()))].sort().join('|'), 'Erstgespräch buchen|Termin auswählen');
  p('1h jeder Knopf fuehrt zu /termin/', (await page.locator('a.btn').evaluateAll(as => as.every(a => a.getAttribute('href') === '/termin/'))), true);
  const robots = await page.locator('meta[name=robots]').count();
  if (LIVE) p('1i LIVE: kein noindex auf der Startseite', robots, 0);
  else p('1i Vorschau: noindex gesetzt', robots, 1);
  await page.waitForFunction(() => [...document.images].every(i => i.complete), null, { timeout: 10000 }).catch(() => {});
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
  p('1m Trennlinien eingeblendet', await page.evaluate(() => ['.manifest', '.kunde', '.schritte', '.programme', '.erfahrungen', '.testimonials', '.team', '.faq'].filter(s => getComputedStyle(document.querySelector(s), '::before').opacity !== '1').join(',')), '');

  // Testimonials: Laufband (Variante hell) laeuft und haelt unter der Maus an,
  // sonst blaettert das Karussell mit dem Pfeil weiter
  if (await page.locator('[data-laufband]').count()) {
    const lb = await page.evaluate(async () => {
      const reihen = [...document.querySelectorAll('[data-laufband]')];
      reihen[0].scrollIntoView({ behavior: 'instant', block: 'center' });
      await new Promise(r => setTimeout(r, 400));
      const x = () => reihen.map(r => new DOMMatrix(getComputedStyle(r.querySelector('.karussell__spur')).transform).m41);
      const a = x(); await new Promise(r => setTimeout(r, 1200)); const b = x();
      return reihen.every(r => r.classList.contains('laufband--an')) && b[0] > a[0] && b[1] < a[1] ? 'ok' : `an=${reihen.map(r => r.classList.contains('laufband--an'))} ${a} -> ${b}`;
    });
    p('1q Testimonials-Laufband: oben nach rechts, unten nach links', lb, 'ok');
    const reihe = page.locator('[data-laufband]').first();
    await reihe.hover();
    await page.waitForTimeout(900);
    const h1 = await reihe.evaluate(r => new DOMMatrix(getComputedStyle(r.querySelector('.karussell__spur')).transform).m41);
    await page.waitForTimeout(700);
    const h2 = await reihe.evaluate(r => new DOMMatrix(getComputedStyle(r.querySelector('.karussell__spur')).transform).m41);
    p('1q2 Laufband haelt unter der Maus an', Math.abs(h2 - h1) < 1.5, true);
    await page.mouse.move(2, 2);
  } else {
    const vorher = await page.locator('#testimonials .karussell__spur').first().evaluate(e => e.scrollLeft);
    await page.locator('#testimonials .karussell__pfeil--weiter').first().click();
    await page.waitForTimeout(900);
    p('1q Testimonials-Karussell blaettert weiter', (await page.locator('#testimonials .karussell__spur').first().evaluate(e => e.scrollLeft)) > vorher, true);
  }

  // Spiegel: Karten drehen beim Scrollen auf "Innen", der Schalter dreht zurueck
  const sp = await page.evaluate(async () => {
    const r = document.querySelector('.spiegel__raster');
    scrollTo({ top: r.getBoundingClientRect().top + scrollY - innerHeight * 0.05, behavior: 'instant' });
    await new Promise(res => setTimeout(res, 700));
    return document.querySelectorAll('.spiegel__karte.ist-innen').length;
  });
  p('1s Spiegel: nach dem Scrollen zeigen alle 6 Karten die Innen-Seite', sp, 6);
  await page.locator('.spiegel__seite[data-seite="aussen"]').click();
  await page.waitForTimeout(300);
  p('1t Spiegel: Schalter "Im Aussen" dreht alle zurueck', await page.locator('.spiegel__karte.ist-innen').count(), 0);

  // Zwei Welten: am Ende ist NOW sichtbar und der Satz darunter da
  const wl = await page.evaluate(async () => {
    const sz = document.querySelector('.welten__szene');
    scrollTo({ top: sz.getBoundingClientRect().top + scrollY - innerHeight * 0.1, behavior: 'instant' });
    await new Promise(res => setTimeout(res, 1500));
    const logo = parseFloat(getComputedStyle(document.querySelector('.welten__logo')).opacity);
    const satz = parseFloat(getComputedStyle(document.querySelector('.welten__ergebnis')).opacity);
    return logo > 0.95 && satz > 0.95 ? 'ok' : logo + '/' + satz;
  });
  p('1w Zwei Welten: NOW und Satz am Ende sichtbar', wl, 'ok');

  // Zusammenarbeit: naechster Live-Call eingetragen, Kacheln und Chat-Antwort erscheinen
  const za = await page.evaluate(async () => {
    const sek = document.getElementById('zusammenarbeit');
    for (const k of sek.querySelectorAll('.kachel')) {
      scrollTo({ top: k.getBoundingClientRect().top + scrollY - innerHeight * 0.3, behavior: 'instant' });
      await new Promise(r => setTimeout(r, 250));
    }
    await new Promise(r => setTimeout(r, 5200));
    const naechster = sek.querySelector('[data-naechster]').textContent;
    const tag = sek.querySelectorAll('.kal__tag.ist-naechster').length;
    const kacheln = [...sek.querySelectorAll('.kachel')].filter(k => getComputedStyle(k).opacity === '1').length;
    const antwort = getComputedStyle(sek.querySelector('.blase--berater')).opacity;
    return /^Nächster: (Heute|Morgen|Mo|Mi) · 10:00$/.test(naechster) && tag === 1 && kacheln === 5 && antwort === '1' ? 'ok' : [naechster, tag, kacheln, antwort].join('/');
  });
  p('1x Zusammenarbeit: naechster Live-Call, 5 Kacheln, Chat-Antwort sichtbar', za, 'ok');

  // Runde 2: Ueberschriften, Programme-Pfad, Betraege, gestapelte Live Events
  const r2 = await page.evaluate(async () => {
    const warte = ms => new Promise(r => setTimeout(r, ms));
    const hin = async (el, f) => { scrollTo({ top: el.getBoundingClientRect().top + scrollY - innerHeight * f, behavior: 'instant' }); await warte(300); };
    const fehler = [];
    const pt = document.querySelector('.programme .section__title');
    await hin(pt, 0.3); await warte(1600);
    if (!pt.classList.contains('ist-da') || [...pt.querySelectorAll('.wort__innen')].some(w => getComputedStyle(w).opacity !== '1')) fehler.push('titel');
    const pf = document.querySelector('.pfad');
    await hin(pf, 0.05); await warte(1600);
    if (document.querySelectorAll('.pfad__punkt.ist-erreicht').length !== 3) fehler.push('pfad ' + pf.style.getPropertyValue('--zug'));
    const z = document.querySelectorAll('[data-zaehle]');
    await hin(z[0], 0.5); await warte(300); await hin(z[1], 0.5); await warte(2300);
    if (z[0].textContent !== '10.000' || z[1].textContent !== '100.000') fehler.push('betraege ' + z[0].textContent + '/' + z[1].textContent);
    if (getComputedStyle(document.querySelector('.format-zeile')).position !== 'sticky') fehler.push('live events nicht gestapelt');
    if ([...document.querySelectorAll('.testi-video__bild')].filter(i => !i.closest('[data-klon]')).length !== 11) fehler.push('vorschaubilder');
    return fehler.join(', ') || 'ok';
  });
  p('1y Runde 2: Ueberschrift, Pfad, Betraege, Stapel, Vorschaubilder', r2, 'ok');

  // Team-Galerie: die Person unter der Maus klappt auf
  await page.locator('.person').nth(2).scrollIntoViewIfNeeded();
  await page.locator('.person').nth(2).hover();
  await page.waitForTimeout(1400);
  p('1z Team-Galerie: Person unter der Maus klappt auf', await page.evaluate(() => {
    const p = [...document.querySelectorAll('.person')];
    return p[2].classList.contains('ist-offen') && p[2].offsetWidth > p[0].offsetWidth * 1.8 ? 'ok' : p.map(x => x.offsetWidth).join('/');
  }), 'ok');

  // 7 Schritte: Buehne klebt, Schritt wechselt mit dem Scrollen
  const sch = await page.evaluate(async () => {
    const s = document.querySelector('.schritte');
    if (!s.classList.contains('schritte--gepinnt')) return 'nicht gepinnt';
    const st = document.querySelector('.schritte__strecke');
    const top = st.getBoundingClientRect().top + scrollY;
    const weg = st.offsetHeight - document.querySelector('.schritte__buehne').offsetHeight;
    scrollTo({ top: top + weg * 0.55, behavior: 'instant' }); await new Promise(r => setTimeout(r, 900));
    const b = document.querySelector('.schritte__buehne').getBoundingClientRect().top;
    const aktiv = [...document.querySelectorAll('.schritt')].findIndex(a => a.classList.contains('ist-aktiv'));
    return Math.abs(b) < 2 && aktiv === 3 ? 'ok' : 'buehne ' + b + ', aktiv ' + aktiv;
  });
  p('1u 7 Schritte: Buehne gepinnt, bei 55 % ist Schritt 4 aktiv', sch, 'ok');

  // Wer ist unser Kunde: am Ende der Szene sind beide Karten ganz da
  const kd = await page.evaluate(async () => {
    const k = document.querySelector('.kunde');
    if (!k.classList.contains('kunde--szene')) return 'keine Szene';
    const st = document.querySelector('.kunde__strecke');
    scrollTo({ top: st.getBoundingClientRect().top + scrollY + st.offsetHeight - innerHeight - 5, behavior: 'instant' });
    await new Promise(r => setTimeout(r, 1200));
    const o = [...document.querySelectorAll('.kunde__karten .fw-card')].map(c => parseFloat(getComputedStyle(c).opacity));
    return o.every(v => v > 0.99) ? 'ok' : o.join(',');
  });
  p('1v Kunde-Szene: Karten am Ende sichtbar', kd, 'ok');
  p('1r Originaltexte: Headline', (await page.locator('h1').innerText()).replace(/\u00ad/g, '').replace(/\s+/g, ' ').trim(), 'Die einzige spirituelle Unternehmensberatung im DACH-Raum');

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

// --- 5. Bewegung reduziert und ohne JavaScript: alles da, nichts gepinnt
for (const [name, opts] of [['reduzierte Bewegung', { reducedMotion: 'reduce' }], ['ohne JavaScript', { javaScriptEnabled: false }]]) {
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, ...opts });
  await ctx.route('**/*', r => r.request().url().startsWith(BASIS) ? r.continue() : r.abort());
  const page = await ctx.newPage();
  await page.goto(BASIS + '/', { waitUntil: 'load' });
  await page.waitForTimeout(400);
  const z = await page.evaluate(() => ({
    h1: parseFloat(getComputedStyle(document.querySelector('h1')).opacity),
    gepinnt: document.querySelector('.schritte').classList.contains('schritte--gepinnt') || document.querySelector('.kunde').classList.contains('kunde--szene'),
    dreht: document.querySelector('.spiegel').classList.contains('spiegel--dreht') || document.querySelector('.welten').classList.contains('welten--lebt'),
    innen: [...document.querySelectorAll('.spiegel__flaeche--innen')].filter(f => f.getBoundingClientRect().height > 40 && getComputedStyle(f).opacity === '1').length,
    schritte: [...document.querySelectorAll('.schritt')].filter(a => a.getBoundingClientRect().height > 50 && getComputedStyle(a).visibility !== 'hidden').length,
    texte: [...document.querySelectorAll('.schritt__text p')].every(p => getComputedStyle(p).opacity === '1'),
    kacheln: [...document.querySelectorAll('.kachel, .blase--du, .blase--berater, .kal__termin')].every(e => getComputedStyle(e).opacity === '1'),
    runde2: [...document.querySelectorAll('.darko__bio, .manifest__signatur, .phase__liste li, .stimmen .testi-card, .fuss__leitsatz span, .section__title')].every(e => getComputedStyle(e).opacity === '1')
      && [...document.querySelectorAll('[data-zaehle]')].map(z => z.textContent).join('/') === '10.000/100.000'
      && !document.querySelector('.titel-woerter'),
  }));
  p(`5 ${name}: Headline sichtbar, nichts gepinnt/gedreht, alle 6 Innen-Saetze, 7 Schritte, Zusammenarbeit und Runde 2 lesbar`,
    `${z.h1}|${z.gepinnt}|${z.dreht}|${z.innen}|${z.schritte}|${z.texte}|${z.kacheln}|${z.runde2}`, '1|false|false|6|7|true|true|true');
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
