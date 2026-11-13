"""Baut /entwurf-kacheln/: drei Vorschlaege fuer die Kacheln der Sektion
"Zusammenarbeit" auf der hellen Seite (Lukas, 13.11.2026).
Ausgabe: varianten/hell/entwurf-kacheln/index.html (CSS daneben, von Hand)."""
import math, os, random

WURZEL = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
ZIEL = os.path.join(WURZEL, 'varianten', 'hell', 'entwurf-kacheln', 'index.html')
MANDALA = open(os.path.join(WURZEL, 'werkzeuge', 'hero-entwurf', 'mandala.svg.txt')).read().strip()

TEXTE = {
    'beratung': ('1:1 Beratung', 'Kein Kick-off, keine Gruppe. Vom ersten Tag an sitzt du mit Darko und deinem Kundenberater an deinem Geschäftsmodell, deiner Zielgruppe, deiner Angebotsstruktur und deinem Vertriebsweg.'),
    'kalender': ('Zwei Live-Calls pro Woche', 'Montag um 10 Uhr der Mindset-Call mit Darko, Mittwoch um 10 Uhr der Vertriebscall mit Lukas. Beide im Inner Circle, zusätzlich zu deinen 1:1 Calls.'),
    'chat': ('Täglicher WhatsApp-Support', 'Für Fragen, die nicht bis zum nächsten Call warten können.'),
    'meditation': ('Meditationsbibliothek', 'Geführte Meditationen, die dich aus dem Mangel in die Fülle bringen. Jederzeit abrufbar.'),
    'umsetzung': ('Umsetzung nach jedem Call', 'Nach jedem Call weißt du, was als Nächstes zu tun ist: vor allem im Vertrieb, dazu Content für Marketing und Social Media. Immer individuell.'),
}
FRAGE = 'Ich hatte gerade einen Sales-Call, in dem die Kundin keine Entscheidung treffen konnte. Kannst du in die Aufzeichnung hineinhören und mir Feedback geben?'
AGENDA = ['Geschäftsmodell', 'Zielgruppe', 'Angebotsstruktur', 'Vertriebsweg']
AUFGABEN = [('Preis für dein Angebot neu festlegen', 'Angebot', True),
            ('Leitfaden fürs Erstgespräch schärfen', 'Vertrieb', True),
            ('3 Reels aus Kundenfragen drehen', 'Content', False)]

random.seed(11)
def welle(n=30):
    h = []
    for i in range(n):
        x = i / n
        v = 0.35 + 0.4 * abs(math.sin(x * 9.1)) * (0.6 + 0.4 * math.sin(x * 2.3 + 1)) + random.random() * 0.3
        h.append(max(3, min(22, round(v * 22))))
    return '<span class="wa__welle">' + ''.join(f'<i style="--h:{v}px"></i>' for v in h) + '</span>'

ICON = {
    'play': '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M7 4.8v14.4L19 12z"/></svg>',
    'mikro': '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 14a3 3 0 0 0 3-3V5a3 3 0 0 0-6 0v6a3 3 0 0 0 3 3zm5-3a5 5 0 0 1-10 0H5a7 7 0 0 0 6 6.9V21h2v-3.1A7 7 0 0 0 19 11z"/></svg>',
    'haken2': '<svg viewBox="0 0 18 11" fill="none" stroke="#53BDEB" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M1 6l3.2 3.2L11 1.5M7.5 8.4l.9.8L15.2 1.5"/></svg>',
    'video': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"><rect x="3" y="6" width="13" height="12" rx="2.5"/><path d="M16 10.5l5-3v9l-5-3z"/></svg>',
    'tel': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"><path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2z"/></svg>',
    'zurueck15': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M4 12a8 8 0 1 0 2.4-5.7"/><path d="M4 4v4h4"/><text x="12" y="15.2" font-size="7" text-anchor="middle" fill="currentColor" stroke="none" font-family="Geist, sans-serif" font-weight="600">15</text></svg>',
    'vor15': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M20 12a8 8 0 1 1-2.4-5.7"/><path d="M20 4v4h-4"/><text x="12" y="15.2" font-size="7" text-anchor="middle" fill="currentColor" stroke="none" font-family="Geist, sans-serif" font-weight="600">15</text></svg>',
}

def karte(art, ui, breit=False):
    titel, text = TEXTE[art]
    return (f'<li class="karte karte--{art}{" karte--breit" if breit else ""}">{ui}'
            f'<h3>{titel}</h3><p class="text">{text}</p></li>')

def wa_fenster(muster='wa--hell'):
    return (f'<div class="wa {muster}">'
            f'<div class="wa__kopf"><img src="/now-logo.webp" alt="" width="240" height="240" /><span class="wa__wer"><b>NOW Kundenberater</b><small>online</small></span><span class="wa__icons">{ICON["video"]}{ICON["tel"]}</span></div>'
            f'<div class="wa__verlauf">{wa_blasen()}</div></div>')

def wa_blasen():
    return (f'<p class="wa__blase wa__blase--aus">{FRAGE}<span class="wa__zeit">14:05 {ICON["haken2"]}</span></p>'
            f'<div class="wa__blase wa__blase--ein wa__memo"><span class="wa__play">{ICON["play"]}</span>'
            f'<span class="wa__spur"><span class="wa__punkt"></span>{welle()}</span>'
            f'<span class="wa__bild"><img src="/now-logo.webp" alt="" width="240" height="240" /><span class="wa__mikro">{ICON["mikro"]}</span></span>'
            f'<span class="wa__dauer">10:23</span><span class="wa__zeit wa__zeit--memo">14:38</span></div>')

def agenda(cls, erledigt=3):
    return (f'<ul class="{cls}">' + ''.join(
        f'<li class="{"ok" if i < erledigt else ("jetzt" if i == erledigt else "")}"><span class="haken"></span>{a}</li>'
        for i, a in enumerate(AGENDA)) + '</ul>')

def aufgaben(cls):
    return (f'<ul class="{cls}">' + ''.join(
        f'<li class="{"ok" if ok else ""}"><span class="haken"></span><span class="aufgabe">{t}</span><em>{tag}</em></li>'
        for t, tag, ok in AUFGABEN) + '</ul>')

# ------------------------------------------------------------------ V1
v1 = [
    karte('beratung', '<div class="ui v1-ui v1-anruf" aria-hidden="true">'
          '<div class="v1-anruf__kopf"><span class="rec"></span>1:1 Beratung<span class="v1-anruf__wer">Darko · Kundenberater · du</span></div>'
          '<div class="v1-anruf__bilder">'
          '<figure><img src="/bilder/team-darko.webp" alt="" width="640" height="648" /><figcaption>Darko · Gründer</figcaption></figure>'
          '<figure><img src="/bilder/team-lukas.webp" alt="" width="640" height="853" /><figcaption>Lukas · Kundenberater</figcaption></figure>'
          '</div>'
          f'<div class="v1-fl v1-agenda"><p class="v1-klein">Heute im Call</p>{agenda("v1-liste")}</div>'
          '</div>', breit=True),
    karte('kalender', '<div class="ui v1-ui" aria-hidden="true"><div class="v1-fl v1-kal">'
          '<div class="v1-kal__kopf"><b>Deine Woche</b><span>Als Nächstes: Mo</span></div>'
          '<div class="v1-kal__tage">' + ''.join(f'<span class="{c}">{t}</span>' for t, c in [('Mo', 'an heute'), ('Di', ''), ('Mi', 'an'), ('Do', ''), ('Fr', '')]) + '</div>'
          '<div class="v1-termin"><i></i><span class="zeit">10:00</span><b>Mindset-Call</b><span class="tag">Mo</span></div>'
          '<div class="v1-termin"><i></i><span class="zeit">10:00</span><b>Vertriebscall</b><span class="tag">Mi</span></div>'
          '<p class="v1-kal__fuss">1:1 Calls nach Absprache</p>'
          '</div></div>'),
    karte('chat', f'<div class="ui v1-ui" aria-hidden="true">{wa_fenster()}</div>'),
    karte('meditation', '<div class="ui v1-ui" aria-hidden="true"><div class="v1-fl v1-spieler">'
          f'<div class="v1-spieler__oben"><span class="v1-cover">{MANDALA}</span><span class="v1-spieler__info"><span class="v1-klein">Bibliothek</span><b>Vom Mangel in die Fülle</b><span>Darko · 18 Min</span></span></div>'
          '<div class="v1-zeitleiste"><span class="v1-zeitleiste__spur"><span></span></span><span class="v1-zeitleiste__zeiten"><span>6:08</span><span>−11:52</span></span></div>'
          f'<div class="v1-tasten"><span>{ICON["zurueck15"]}</span><span class="v1-tasten__play">{ICON["play"]}</span><span>{ICON["vor15"]}</span></div>'
          '</div></div>'),
    karte('umsetzung', '<div class="ui v1-ui" aria-hidden="true"><div class="v1-fl v1-todo">'
          f'<div class="v1-todo__kopf"><b>Nach deinem letzten Call</b><span class="v1-chip">Beispiel</span></div>{aufgaben("v1-aufgaben")}'
          '</div></div>'),
]

# ------------------------------------------------------------------ V2
def foto(src, pos='center', extra=''):
    return f'<img class="ui__foto" src="/bilder/{src}" alt="" style="object-position:{pos}{extra}" />'

v2 = [
    karte('beratung', '<div class="ui v2-ui" aria-hidden="true">' + foto('schritt-1.webp', '50% 40%') +
          '<div class="glas v2-wer"><span class="v2-avatare"><img src="/bilder/team-darko.webp" alt="" /><img src="/bilder/team-lukas.webp" alt="" /></span><span><b>1:1 Beratung</b><small>Darko &amp; dein Kundenberater</small></span><span class="v2-live">Live</span></div>'
          f'<div class="glas v2-agenda"><p class="v2-klein">Heute im Call</p>{agenda("v2-liste")}</div>'
          '</div>', breit=True),
    karte('kalender', '<div class="ui v2-ui" aria-hidden="true">' + foto('schritt-4.webp', '45% 30%') +
          '<span class="glas v2-pille">Deine Woche</span>'
          '<div class="glas v2-kal">'
          '<div class="v2-termin"><span class="v2-tag">Mo</span><span><b>Mindset-Call</b><small>10:00 · Inner Circle</small></span></div>'
          '<div class="v2-termin"><span class="v2-tag">Mi</span><span><b>Vertriebscall</b><small>10:00 · Inner Circle</small></span></div>'
          '</div></div>'),
    karte('chat', '<div class="ui v2-ui v2-chat" aria-hidden="true">' + foto('schritt-7.webp', '50% 35%') +
          '<span class="glas v2-pille v2-pille--wa"><img src="/now-logo.webp" alt="" />NOW Kundenberater</span>'
          f'<div class="v2-blasen">{wa_blasen()}</div></div>'),
    karte('meditation', '<div class="ui v2-ui" aria-hidden="true"><img class="ui__foto v2-retreat" src="/bilder/poster-retreat.webp" alt="" />'
          f'<div class="glas v2-spieler"><span class="v2-spieler__play">{ICON["play"]}</span><span class="v2-spieler__info"><b>Vom Mangel in die Fülle</b><small>Darko · 18 Min</small><span class="v2-spur"><span></span></span></span></div>'
          '</div>'),
    karte('umsetzung', '<div class="ui v2-ui" aria-hidden="true">' + foto('schritt-2.webp', '50% 30%') +
          f'<div class="glas v2-todo"><div class="v2-todo__kopf"><b>Nach deinem letzten Call</b><span>Beispiel</span></div>{aufgaben("v2-aufgaben")}</div>'
          '</div>'),
]

# ------------------------------------------------------------------ V3
v3 = [
    karte('beratung', '<div class="ui v3-ui v3-anruf" aria-hidden="true">'
          '<div class="v3-paar">'
          '<figure><span class="v3-medaillon"><img src="/bilder/team-darko.webp" alt="" /></span><figcaption><b>Darko</b><span>Gründer</span></figcaption></figure>'
          '<span class="v3-und">&amp;</span>'
          '<figure><span class="v3-medaillon"><img src="/bilder/team-lukas.webp" alt="" /></span><figcaption><b>Lukas</b><span>Kundenberater</span></figcaption></figure>'
          '</div>'
          f'<div class="v3-papier v3-agenda"><p class="v3-kopf">Heute im Call</p>{agenda("v3-liste")}</div>'
          '</div>', breit=True),
    karte('kalender', '<div class="ui v3-ui" aria-hidden="true"><div class="v3-papier v3-kal">'
          '<p class="v3-kopf">Deine Woche</p>'
          '<div class="v3-kal__tage">'
          '<div class="v3-tag v3-tag--call"><span class="v3-tag__name">Mo</span><span class="v3-folie"><b>10:00</b>Mindset-Call</span></div>'
          '<div class="v3-tag"><span class="v3-tag__name">Di</span></div>'
          '<div class="v3-tag v3-tag--call"><span class="v3-tag__name">Mi</span><span class="v3-folie"><b>10:00</b>Vertriebscall</span></div>'
          '<div class="v3-tag"><span class="v3-tag__name">Do</span></div>'
          '<div class="v3-tag"><span class="v3-tag__name">Fr</span></div>'
          '</div><p class="v3-kal__fuss">dazwischen deine 1:1 Calls, nach Absprache</p>'
          '</div></div>'),
    karte('chat', f'<div class="ui v3-ui" aria-hidden="true">{wa_fenster("wa--sand")}</div>'),
    karte('meditation', '<div class="ui v3-ui v3-med" aria-hidden="true">'
          f'<span class="v3-med__mandala">{MANDALA}</span><span class="v3-med__play">{ICON["play"]}</span>'
          '<span class="v3-med__titel"><b>Vom Mangel in die Fülle</b><span>Darko · 18 Min</span></span>'
          '</div>'),
    karte('umsetzung', '<div class="ui v3-ui" aria-hidden="true"><div class="v3-papier v3-todo">'
          f'<p class="v3-kopf">Nach deinem letzten Call <span>Beispiel</span></p>{aufgaben("v3-aufgaben")}'
          '</div></div>'),
]

VORSCHLAEGE = [
    ('v1', 'Hell wie echte Apps', 'Die Oberflächen sehen aus wie die Apps, die dein Kunde jeden Tag benutzt, nur in Hell: weiße Karten auf Sand, feine Linien, Gold nur für Haken und Termine. WhatsApp so, wie es am Handy wirklich aussieht. Wirkt am glaubwürdigsten.', v1),
    ('v2', 'Bild & Glas', 'Wie die Testimonials: Jede Kachel lebt von einem echten Foto, darüber schwebt ein heller Glas-Baustein. Emotionaler, mehr Mensch. Die Fotos hier sind Platzhalter aus „Unsere Inhalte“, für die echte Seite bräuchten wir eigene Bilder.', v2),
    ('v3', 'Sand & Gold', 'Ganz in den warmen Tönen der Hero: Papier auf Sand, Goldfolie statt Schwarz, Überschriften in Instrument Serif. Die Meditation wird zum langsam drehenden Mandala. Am meisten Marke, am wenigsten App.', v3),
]

nav = ''.join(f'<a href="#{k}">{i + 1} · {t}</a>' for i, (k, t, _, _) in enumerate(VORSCHLAEGE))
teile = []
for i, (k, titel, text, karten) in enumerate(VORSCHLAEGE):
    teile.append(f'<section class="vorschlag {k}" id="{k}"><div class="vorschlag__kopf"><span class="vorschlag__nr">Vorschlag {i + 1}</span><h2>{titel}</h2><p>{text}</p></div>'
                 f'<ul class="raster">{"".join(karten)}</ul></section>')

html = f'''<!DOCTYPE html>
<html lang="de">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<meta name="robots" content="noindex, nofollow" />
<title>Zusammenarbeit · 3 Vorschläge · NOW Consulting</title>
<link rel="icon" href="/favicon-32.png" />
<link rel="stylesheet" href="/fonts/fonts.css?v=2" />
<link rel="stylesheet" href="/schriften/schriften.css" />
<link rel="stylesheet" href="/entwurf-kacheln/kacheln.css" />
</head>
<body>
<nav class="leiste"><span>Zusammenarbeit</span>{nav}<a class="zurueck" href="/#zusammenarbeit">zur Webseite</a></nav>
{"".join(teile)}
</body>
</html>
'''
open(ZIEL, 'w').write(html)
print('gebaut:', os.path.relpath(ZIEL, WURZEL))
