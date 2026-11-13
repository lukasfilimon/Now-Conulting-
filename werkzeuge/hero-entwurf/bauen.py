# Baut die drei Hero-Entwuerfe nach /entwurf-hero/{a,b,c}/ aus gemeinsamen Bausteinen.
# Aufruf (im Repo-Ordner): python3 werkzeuge/hero-entwurf/bauen.py
import os
HIER = os.path.dirname(os.path.abspath(__file__))
ZIEL = os.path.join(HIER, '..', '..', 'entwurf-hero')
MANDALA = open(os.path.join(HIER, 'mandala.svg.txt')).read()
PFEIL = '<span class="knopf__pfeil" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg></span>'
PLAY = '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M8 5.5v13l10.5-6.5z"/></svg>'
TITEL = 'Die einzige <span class="akzent">spirituelle</span> Unternehmens&shy;beratung im DACH-Raum'
SUB = 'Für Coaches, Trainer und Berater, die Bewusstsein &amp; Business in einem einheitlichen Kontext vereinen möchten.'
GESICHTER = ''.join(f'<img src="/bilder/kunde-{n}.webp" width="112" height="112" alt="" />' for n in ['gabriele', 'nenad', 'andrea', 'nikolay', 'buenyamin'])
VERTRAUEN = f'<a class="vertrauen" href="/#testimonials"><span class="vertrauen__gesichter">{GESICHTER}</span><span><strong>1.000+</strong> Unternehmer begleitet</span></a>'
KNOPF = f'<a class="knopf" href="/termin/">Erstgespräch buchen {PFEIL}</a>'
HINWEIS = '<span class="hinweis">Kostenlos <i></i> Unverbindlich</span>'
VIDEO = '<div class="video-fuellt"><iframe src="https://player.vimeo.com/video/1192498083?background=1&dnt=1" allow="autoplay; fullscreen" title="NOW Consulting Trailer" loading="eager" tabindex="-1" aria-hidden="true"></iframe></div>'
def zahl(wert, nach, label, verzug=900):
    return f'<div class="zahl"><span class="zahl__wert" data-zaehle="{wert}" data-nach="{nach}" data-verzug="{verzug}">{wert if wert < 1000 else "1.000"}{nach}</span><span class="zahl__label">{label}</span></div>'
Z = [zahl(1000, '+', 'Unternehmer begleitet'), zahl(98, '%', 'Kundenzufriedenheit', 1000), zahl(3, 'M+ €', 'Jahresumsatz', 1100), zahl(7, ' Jahre', 'Erfahrung', 1200)]

def nav(art):
    links = ''.join(f'<a href="/#{a}">{t}</a>' for a, t in [('inhalte', 'Inhalte'), ('programme', 'Programme'), ('testimonials', 'Testimonials'), ('team', 'Unser Team'), ('faq', 'FAQ')])
    return f'<header class="nav nav--{art}"><a class="nav__marke" href="/"><img src="/now-logo.webp" width="240" height="240" alt="" /><span>NOW Consulting</span></a><nav class="nav__links" aria-label="Hauptnavigation">{links}</nav><a class="knopf knopf--klein" href="/termin/">Erstgespräch buchen</a></header>'

def wahl(aktiv):
    namen = {'a': 'Tag &amp; Nacht', 'b': 'Hell', 'c': 'Nacht + Insel'}
    knoepfe = ''.join(f'<a href="/entwurf-hero/{k}/" class="{"an" if k == aktiv else ""}">{k.upper()}<span class="lang"> · {v}</span></a>' for k, v in namen.items())
    return f'<div class="wahl" role="group" aria-label="Entwurf wählen"><span class="wahl__titel">Entwurf</span>{knoepfe}<span class="wahl__trenner"></span><span class="wahl__titel">Schrift</span><button type="button" data-schrift="neu">Neu</button><button type="button" data-schrift="jetzt">Jetzt</button></div>'

def seite(kenn, titel, css, koerper, js=''):
    return f'''<!DOCTYPE html>
<html lang="de">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
<meta name="robots" content="noindex, nofollow" />
<title>Hero-Entwurf {kenn.upper()} · {titel} · NOW Consulting</title>
<link rel="icon" href="/favicon-32.png" />
<link rel="stylesheet" href="/entwurf-hero/gemeinsam.css" />
<style>
{css}
</style>
</head>
<body class="seite-{kenn}">
{koerper}
{wahl(kenn)}
<script src="/entwurf-hero/gemeinsam.js"></script>
<script>
{js}
</script>
</body>
</html>
'''

import importlib.util, sys
for k in ['a', 'b', 'c']:
    spec = importlib.util.spec_from_file_location('e' + k, os.path.join(HIER, f'entwurf_{k}.py'))
    m = importlib.util.module_from_spec(spec); spec.loader.exec_module(m)
    html = seite(k, m.NAME, m.CSS, m.koerper(sys.modules[__name__]), m.JS)
    os.makedirs(os.path.join(ZIEL, k), exist_ok=True)
    open(os.path.join(ZIEL, k, 'index.html'), 'w').write(html)
    print(k, len(html))
