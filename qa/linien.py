"""Prueft jede Trennlinie in beiden Zustaenden: unsichtbar beim Laden,
sichtbar nach dem Scrollen. Findet damit beide Listenfallen auf einmal —
eine Sektion, die in der opacity-0-Liste fehlt, blitzt beim Laden auf; eine,
die im Beobachter fehlt, bleibt fuer immer unsichtbar.

    python3 qa/linien.py            # gegen 127.0.0.1:8099
    LP_URL=http://… python3 qa/linien.py
"""
import os
import sys
from playwright.sync_api import sync_playwright
with sync_playwright() as p:
    b = p.chromium.launch(executable_path='/opt/pw-browsers/chromium')
    pg = b.new_page(viewport={'width':1440,'height':900})
    pg.goto((sys.argv[1] if len(sys.argv) > 1 else os.environ.get('LP_URL', 'http://127.0.0.1:8099')),
            wait_until='domcontentloaded')
    pg.wait_for_timeout(400)
    LIES = """() => [...document.querySelectorAll('section, footer')].flatMap(e => {
      const n = [...e.classList].filter(c => c!=='section' && c!=='section-divider-visible')[0] || e.tagName.toLowerCase();
      return ['::before','::after'].map(ps => {
        const cs = getComputedStyle(e, ps);
        if (cs.content === 'none' || cs.display === 'none') return null;
        return {n: n + ps, o: parseFloat(cs.opacity)};
      }).filter(Boolean);
    })"""
    frueh = {x['n']: x['o'] for x in pg.evaluate(LIES)}
    hoehe = pg.evaluate("document.body.scrollHeight")
    print(f'  (Seite {hoehe}px hoch)')
    for y in range(0, hoehe + 900, 300):
        pg.evaluate(f"window.scrollTo(0,{y})"); pg.wait_for_timeout(160)
    pg.wait_for_timeout(2500)
    spaet = {x['n']: x['o'] for x in pg.evaluate(LIES)}
    schlecht = 0
    for k in spaet:
        f, s = frueh.get(k, 0), spaet[k]
        if f > 0.05: print(f'  {k:<26} BLITZT AUF beim Laden (opacity {f})'); schlecht += 1
        elif s < 0.95: print(f'  {k:<26} BLEIBT UNSICHTBAR (opacity {s})'); schlecht += 1
        else: print(f'  {k:<26} ok  0 -> {s}')
    print('  alle Linien in Ordnung' if not schlecht else f'  {schlecht} Problem(e)')
    sys.exit(1 if schlecht else 0)
    b.close()
