/* Findet zwei Fehler, die auf schmalen Geraeten auftreten und die man auf
 * dem Entwicklerrechner nie sieht:
 *
 *  1. Waagerechter Ueberlauf — irgendetwas ist breiter als der Bildschirm,
 *     die ganze Seite laesst sich seitlich schieben. Achtung: sobald
 *     irgendwo overflow-x: hidden steht, meldet scrollWidth am <html>
 *     nichts mehr. Nachgemessen: ein 600px breites Element bei 390px
 *     Viewport ergibt dort 0. Nur die Pruefung je Element findet es.
 *  2. Abgeschnittener Text — das Element bleibt IN der Seite, aber sein
 *     Inhalt passt nicht hinein. Ein Ueberlauftest an <html> sieht davon
 *     nichts, weil abgeschnittener Text keine Breite erzeugt. Haeufigste
 *     Ursache: &nbsp; macht eine Zeile unumbrechbar.
 *
 * Aufruf:  LP_URL=http://127.0.0.1:8080 node qa/ueberlauf.mjs
 */
import { chromium } from 'playwright';
const BASIS = process.env.LP_URL || 'http://127.0.0.1:8080';
const BREITEN = [320, 360, 390, 430, 768, 1024, 1440];

const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
let schlecht = 0;

for (const breite of BREITEN) {
  const ctx = await browser.newContext({ viewport: { width: breite, height: 800 } });
  await ctx.route('**/*', r => {
    const u = r.request().url();
    if (u.includes('facebook') || u.includes('googletagmanager') || u.includes('vimeo'))
      return r.fulfill({ status: 200, contentType: 'text/plain', body: '' });
    r.continue();
  });
  await ctx.addInitScript(() => { try { localStorage.setItem('consent_v1', 'declined'); } catch (e) {} });
  const page = await ctx.newPage();
  await page.goto(BASIS + '/', { waitUntil: 'networkidle' });
  await page.evaluate(() => {
    document.querySelectorAll('[class*="reveal"]').forEach(e => e.classList.add('visible'));
  });

  const b = await page.evaluate(bw => {
    const raus = { seite: 0, breiter: [], beschnitten: [] };
    raus.seite = Math.max(0, document.documentElement.scrollWidth - bw);

    for (const el of document.querySelectorAll('body *')) {
      const s = getComputedStyle(el);
      if (s.display === 'none' || s.visibility === 'hidden' || parseFloat(s.opacity) < 0.1) continue;
      if (el.closest('[aria-hidden="true"], [hidden]')) continue;
      const r = el.getBoundingClientRect();
      if (r.width < 1 || r.height < 1) continue;

      const name = el.tagName.toLowerCase() +
        (typeof el.className === 'string' && el.className
          ? '.' + el.className.trim().split(/\s+/).slice(0, 2).join('.') : '');

      if (r.right > bw + 1 || r.left < -1)
        raus.breiter.push({ name, links: Math.round(r.left), rechts: Math.round(r.right) });

      // Beschnitten: Inhalt breiter als der Kasten, und der Kasten schneidet ab.
      const schneidet = s.overflowX === 'hidden' || s.overflowX === 'clip' ||
                        s.textOverflow === 'ellipsis' || s.overflow === 'hidden';
      if (schneidet && el.scrollWidth > el.clientWidth + 1 && el.clientWidth > 0)
        raus.beschnitten.push({ name, inhalt: el.scrollWidth, kasten: el.clientWidth,
                                text: (el.textContent || '').trim().slice(0, 40) });
    }
    // Doppelte zusammenfassen
    const eindeutig = a => [...new Map(a.map(x => [x.name, x])).values()];
    raus.breiter = eindeutig(raus.breiter).slice(0, 8);
    raus.beschnitten = eindeutig(raus.beschnitten).slice(0, 8);
    return raus;
  }, breite);

  const ok = b.seite === 0 && !b.breiter.length && !b.beschnitten.length;
  if (!ok) schlecht++;
  console.log(`${ok ? '  OK  ' : ' FEHL '} ${String(breite).padStart(4)}px` +
              (b.seite ? `  Seite ${b.seite}px zu breit` : '') +
              (b.breiter.length ? `  ${b.breiter.length} Element(e) ausserhalb` : '') +
              (b.beschnitten.length ? `  ${b.beschnitten.length} beschnitten` : ''));
  for (const e of b.breiter)
    console.log(`         ausserhalb: ${e.name}  (${e.links} .. ${e.rechts})`);
  for (const e of b.beschnitten)
    console.log(`         beschnitten: ${e.name}  Inhalt ${e.inhalt}px in ${e.kasten}px\n            "${e.text}"`);
  await ctx.close();
}
await browser.close();
console.log('\n' + (schlecht ? schlecht + ' von ' + BREITEN.length + ' Breiten mit Befund'
                              : 'alle ' + BREITEN.length + ' Breiten sauber'));
process.exit(schlecht ? 1 : 0);
