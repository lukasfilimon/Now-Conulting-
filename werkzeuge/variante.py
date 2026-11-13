"""Baut eine Variante der Webseite als eigene, vollstaendige Webseite.

    python3 werkzeuge/variante.py hell      ->  _ausgabe/hell/

Grundlage ist immer die Startseite im Repo-Ordner (index.html) mit allen
Texten. Eine Variante tauscht nur die Hero aus (varianten/<name>/hero.html),
markiert die dunklen Buehnen und bringt ihr eigenes CSS/JS mit. Textaenderungen
in index.html wirken dadurch automatisch auch in jeder Variante.
"""
import os, re, shutil, sys

WURZEL = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
NAME = sys.argv[1] if len(sys.argv) > 1 else 'hell'
QUELLE = os.path.join(WURZEL, 'varianten', NAME)
ZIEL = os.path.join(WURZEL, '_ausgabe', NAME)
NICHT = {'.git', 'node_modules', '_ausgabe', 'varianten', 'werkzeuge', 'qa', 'notizen', 'entwurf-hero',
         'README.md', 'CLAUDE.md', 'package.json', 'package-lock.json', '.gitignore', '.netlify'}

# Welche Sektionen in dieser Variante dunkle Buehnen sind
DUNKEL = {
    'hell': ['manifest', 'kunde', 'erfahrungen', 'final-cta'],
}[NAME]

def lies(p): return open(p, encoding='utf-8').read()
def schreib(p, s):
    os.makedirs(os.path.dirname(p), exist_ok=True)
    open(p, 'w', encoding='utf-8').write(s)

def nimm(muster, text, name):
    m = re.search(muster, text, re.S)
    if not m: raise SystemExit(f'nicht gefunden in der Startseite: {name}')
    return m.group(0)

def kopf_und_assets(html):
    """Eigenes CSS/JS der Variante einhaengen, body markieren, dunkle Buehnen setzen."""
    html = html.replace('<link rel="stylesheet" href="/seite.css" />',
                        f'<link rel="stylesheet" href="/seite.css" />\n  <link rel="stylesheet" href="/{NAME}.css" />', 1)
    html = html.replace('<meta name="theme-color" content="#0e0c0a" />', '<meta name="theme-color" content="#F7F2E9" />')
    html = re.sub(r'<body class="([^"]*)"', lambda m: f'<body class="{m.group(1)} {NAME}"', html, count=1)
    html = html.replace('<footer class="footer fuss">', '<footer class="footer fuss buehne-dunkel">')
    return html

# 1. Alles Oeffentliche kopieren
if os.path.exists(ZIEL): shutil.rmtree(ZIEL)
os.makedirs(ZIEL)
for e in os.listdir(WURZEL):
    if e in NICHT or e.startswith('.') and e != '.well-known': continue
    q = os.path.join(WURZEL, e)
    (shutil.copytree if os.path.isdir(q) else shutil.copy2)(q, os.path.join(ZIEL, e))
for e in os.listdir(QUELLE):
    if e in ('hero.html',) or e.endswith('.md'): continue
    q = os.path.join(QUELLE, e)
    (shutil.copytree if os.path.isdir(q) else shutil.copy2)(q, os.path.join(ZIEL, e))

# 2. Startseite: Hero tauschen, Buehnen markieren
start = lies(os.path.join(WURZEL, 'index.html'))
hero_alt = nimm(r'  <!-- 1\. HERO.*?</section>\n', start, 'Hero')
teile = {
    'VERTRAUEN': nimm(r'<a class="vertrauen".*?</a>', hero_alt, 'Vertrauenszeile'),
    'TITEL': nimm(r'<h1 class="hero__headline".*?</h1>', hero_alt, 'Ueberschrift'),
    'SUB': nimm(r'<p class="hero__sub".*?</p>', hero_alt, 'Untertitel'),
    'KNOPF': nimm(r'<a href="/termin/"[^>]*hero__cta.*?</a>', hero_alt, 'Knopf'),
    'HINWEIS': nimm(r'<div class="mini-trust hero__trust">.*?</div>', hero_alt, 'Kostenlos/Unverbindlich'),
    'VIDEO': nimm(r'<div class="hero__video" id="heroVideo".*?</div>\s*</div>', hero_alt, 'Video'),
    'ZAHLEN': ''.join(re.findall(r'<div class="zahlen__eintrag">.*?</div>', hero_alt, re.S)),
    'MANDALA': lies(os.path.join(WURZEL, 'werkzeuge', 'hero-entwurf', 'mandala.svg.txt')),
}
hero_neu = lies(os.path.join(QUELLE, 'hero.html'))
for k, v in teile.items(): hero_neu = hero_neu.replace('{' + k + '}', v)
assert '{' not in re.sub(r'<svg.*?</svg>', '', hero_neu, flags=re.S), 'Platzhalter uebrig'
start = start.replace(hero_alt, hero_neu)
for sek in DUNKEL:
    start, n = re.subn(r'(<section class="section [^"]*?\b' + re.escape(sek) + r'\b)', r'\1 buehne-dunkel', start, count=1)
    assert n == 1, sek
start = start.replace('<script src="/bewegung.js"></script>', f'<script src="/bewegung.js"></script>\n  <script src="/{NAME}.js"></script>')
schreib(os.path.join(ZIEL, 'index.html'), kopf_und_assets(start))

# 3. Unterseiten: gleiche Inhalte, Variante drueber
for seite in ('termin', 'impressum', 'datenschutz', 'agb'):
    p = os.path.join(ZIEL, seite, 'index.html')
    schreib(p, kopf_und_assets(lies(p)))

print('gebaut:', os.path.relpath(ZIEL, WURZEL))
