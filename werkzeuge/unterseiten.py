#!/usr/bin/env python3
"""Baut die Unterseiten (termin, impressum, datenschutz, agb, danke) aus
werkzeuge/inhalte/<name>.html und uebernimmt Kopfleiste, Footer und
Cookie-Leiste aus index.html. Nach jeder Aenderung an Kopf oder Footer
der Startseite einmal laufen lassen:

    python3 werkzeuge/unterseiten.py

Die erzeugten Dateien liegen unter <name>/index.html und werden mit
eingecheckt (kein Build-Schritt beim Ausliefern).
"""
import os, re, sys

WURZEL = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
os.chdir(WURZEL)
start = open('index.html', encoding='utf-8').read()

kopf = start[start.index('  <header class="kopf"'):start.index('  </header>') + len('  </header>')]
kopf = kopf.replace('href="#hero"', 'href="/"').replace(
    'aria-label="NOW Consulting, nach oben"', 'aria-label="NOW Consulting, zur Startseite"')
kopf = re.sub(r'href="#([a-z-]+)"', r'href="/#\1"', kopf)
fuss = start[start.index('  <!-- FOOTER'):start.index('  <script src="/seite.js">')]

SEITEN = {
    'termin':      ('Erstgespräch buchen · NOW Consulting', 'Buche dein kostenloses Erstgespräch mit NOW Consulting. 1:1, unverbindlich.', True),
    'impressum':   ('Impressum · NOW Consulting', 'Impressum der NOW Consulting.', False),
    'datenschutz': ('Datenschutz · NOW Consulting', 'Datenschutzerklärung der NOW Consulting.', False),
    'agb':         ('AGB · NOW Consulting', 'Allgemeine Geschäftsbedingungen der NOW Coaching Service FZCO.', False),
    'danke':       ('Termin gebucht · NOW Consulting', 'Dein Erstgespräch mit NOW Consulting ist gebucht.', False),
}

for name, (titel, beschreibung, termin) in SEITEN.items():
    inhalt = open(f'werkzeuge/inhalte/{name}.html', encoding='utf-8').read().rstrip()
    extra = '  <script src="/termin.js"></script>\n' if termin else ''
    mandala = '  <script src="/mandala.js"></script>\n' if name in ('termin', 'danke') else ''
    html = f'''<!DOCTYPE html>
<html lang="de">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover" />
  <title>{titel}</title>
  <meta name="description" content="{beschreibung}" />
  <meta name="robots" content="noindex, nofollow" />
  <meta name="theme-color" content="#0e0c0a" />
  <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32.png" />
  <link rel="icon" type="image/png" sizes="192x192" href="/favicon-192.png" />
  <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
  <script>document.documentElement.className += ' js';</script>
  <link rel="stylesheet" href="/fonts/fonts.css?v=2" />
  <link rel="stylesheet" href="/kern.css" />
  <link rel="stylesheet" href="/seite.css" />
  <script src="/tracking.js"></script>
</head>
<body class="unterseite-body">
  <!-- ERZEUGT von werkzeuge/unterseiten.py — Inhalt in
       werkzeuge/inhalte/{name}.html aendern, nicht hier. -->
  <canvas id="bgShader"></canvas>
{kopf}

  <main class="unterseite unterseite--{name}">
{inhalt}
  </main>

{fuss}  <script src="/seite.js"></script>
{extra}  <script src="/kern.js"></script>
{mandala}</body>
</html>
'''
    os.makedirs(name, exist_ok=True)
    open(f'{name}/index.html', 'w', encoding='utf-8').write(html)
    print('geschrieben:', f'{name}/index.html')
