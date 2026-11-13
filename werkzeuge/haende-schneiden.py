"""Schneidet das Haende-Bild ("Die Wahl zwischen zwei Kapseln.png", von Lukas
in ChatGPT erzeugt) in zwei Haende mit durchsichtigem Hintergrund:
bilder/hand-links.webp und bilder/hand-rechts.webp.

Aufruf:  python3 werkzeuge/haende-schneiden.py <bild.png>
Gibt Groesse und Pillenmitte (in %) je Hand aus; die Prozentwerte gehoeren
als --px/--py in seite.css (.kunde__hand--links / --rechts), die Groesse als
width/height ins <img> in index.html."""
import os, sys
from PIL import Image

WURZEL = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
quelle = Image.open(sys.argv[1]).convert('RGB')
w, h = quelle.size
px = quelle.load()

# Luecke zwischen den Haenden: dunkelste Spalte im mittleren Drittel
def helligkeit(x): return sum(sum(px[x, y]) for y in range(0, h, 3))
mitte = min(range(int(w * 0.4), int(w * 0.6)), key=helligkeit)

def schneiden(x0, x1, ziel, pille):
    teil = quelle.crop((x0, 0, x1, h))
    tw, th = teil.size
    t = teil.load()
    maske = Image.new('L', (tw, th))
    m = maske.load()
    for y in range(th):
        for x in range(tw):
            r, g, b = t[x, y]
            a = (max(r, g, b) - 17) / 22         # Hintergrund ~ (7,3,1) und sein Rauschen werden durchsichtig
            m[x, y] = int(255 * min(1, max(0, a)) ** 0.85)
    box = maske.point(lambda v: 255 if v > 12 else 0).getbbox()
    rand = 14
    box = (max(0, box[0] - rand), max(0, box[1] - rand), min(tw, box[2] + rand), min(th, box[3] + rand))
    bild = teil.convert('RGBA')
    bild.putalpha(maske)
    bild = bild.crop(box)
    bild.save(os.path.join(WURZEL, 'bilder', ziel), 'WEBP', quality=90, method=6)
    # Pillenmitte suchen
    bx, by, n = 0, 0, 0
    b = bild.load()
    for y in range(bild.height):
        for x in range(bild.width):
            r, g, bl, a = b[x, y]
            if a < 200: continue
            if pille(r, g, bl): bx += x; by += y; n += 1
    lage = (round(100 * bx / n / bild.width, 1), round(100 * by / n / bild.height, 1)) if n else None
    print(ziel, bild.size, 'Pille bei', lage, '(%)', n, 'Pixel')

schneiden(0, mitte, 'hand-links.webp', lambda r, g, b: b > r + 25 and b > 110)                       # grau-blau
schneiden(mitte, w, 'hand-rechts.webp', lambda r, g, b: r > 235 and g > 185 and b < 140 and r - b > 120)  # gold
