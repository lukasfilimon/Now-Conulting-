import { chromium } from 'playwright';
const marke = process.argv[2];           // 'vorher' | 'nachher'
const BASIS = process.env.LP_URL || 'http://127.0.0.1:8080';

const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });

// Alles deterministisch machen: keine Animationen, alles sichtbar,
// Canvas aus (rauscht sonst pro Frame), Video-Iframes weg.
const STILL = `
  html { scroll-behavior: auto !important; }
  *, *::before, *::after {
    animation: none !important;
    transition: none !important;
  }
  .reveal, [class*="reveal"] { opacity: 1 !important; transform: none !important; }
  canvas { visibility: hidden !important; }
  iframe { visibility: hidden !important; }
  #cookie-bar { display: none !important; }
  #countdown, #countdownLive, #countdownCaption, #countdownCaption2,
  [class*="countdown"] { visibility: hidden !important; }
`;

for (const [w, h, name] of [[390, 844, 'mobil'], [1440, 900, 'desktop']]) {
  const ctx = await browser.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: 1 });
  await ctx.route('**/*', r => {
    const u = r.request().url();
    if (u.includes('facebook') || u.includes('googletagmanager') || u.includes('vimeo'))
      return r.fulfill({ status: 200, contentType: 'text/plain', body: '' });
    r.continue();
  });
  await ctx.addInitScript(() => { try { localStorage.setItem('consent_v1', 'declined'); } catch (e) {} });
  const page = await ctx.newPage();
  await page.goto(BASIS + '/', { waitUntil: 'networkidle' });
  await page.addStyleTag({ content: STILL });
  // alle Reveal-Elemente hart sichtbar schalten
  await page.evaluate(() => {
    document.querySelectorAll('.reveal, .visible, [class*="reveal"]').forEach(e => e.classList.add('visible'));
    document.querySelectorAll('.section-divider').forEach(e => e.classList.add('section-divider-visible'));
    document.querySelectorAll('.la-word').forEach(e => e.classList.add('la-ready'));
  });
  await page.waitForTimeout(500);
  const hoehe = await page.evaluate(() => document.body.scrollHeight);
  await page.screenshot({ path: `/tmp/qa/shots/${marke}-${name}.png`, fullPage: true });
  console.log(`${marke}-${name}: ${w}px breit, Seite ${hoehe}px hoch`);
  await ctx.close();
}
await browser.close();
