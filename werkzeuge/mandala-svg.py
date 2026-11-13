"""Das NOW-Mandala aus mandala.js als SVG (gleiche Geometrie), fuer Stellen,
an denen ein kleines Bild statt eines Canvas noetig ist (Meditations-Cover).
Aufruf: python3 werkzeuge/mandala-svg.py  ->  bilder/mandala-linie.svg
Gezeigt wird nur der innere Teil (bis zum dritten Blaetterkranz), damit die
Linien auch klein noch lesbar sind."""
import math, os

WURZEL = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
R = 500                      # Radius in SVG-Einheiten (mandala.js: S/2)
def r(x): return x * R
def p(rad, a): return f'{math.cos(a) * rad:.1f} {math.sin(a) * rad:.1f}'

linien, punkte = [], []
def blaetter(r1, r2, n, versatz, breite):
    s = 2 * math.pi / n
    for k in range(n):
        a = k * s + versatz; w = s * breite
        linien.append(f'M{p(r1, a - w)}Q{p(r2 * 0.92, a - w * 0.9)} {p(r2, a)}Q{p(r2 * 0.92, a + w * 0.9)} {p(r1, a + w)}')
        linien.append(f'M{p(r1 + (r2 - r1) * 0.18, a)}L{p(r1 + (r2 - r1) * 0.78, a)}')
def kreis(rad): linien.append(f'M{rad:.1f} 0A{rad:.1f} {rad:.1f} 0 1 0 {-rad:.1f} 0A{rad:.1f} {rad:.1f} 0 1 0 {rad:.1f} 0')
def tupfen(rad, n, g):
    for k in range(n):
        a = k / n * 2 * math.pi; x, y = math.cos(a) * rad, math.sin(a) * rad
        punkte.append(f'M{x + g:.1f} {y:.1f}a{g} {g} 0 1 0 {-2 * g} 0a{g} {g} 0 1 0 {2 * g} 0')

# exakt die Reihenfolge aus mandala.js
kreis(r(0.035)); kreis(r(0.06))
blaetter(r(0.06), r(0.13), 8, 0, 0.42)
blaetter(r(0.06), r(0.115), 8, math.pi / 8, 0.36)
kreis(r(0.14)); tupfen(r(0.155), 32, 1.6); kreis(r(0.17))
blaetter(r(0.17), r(0.27), 16, 0, 0.44)
blaetter(r(0.17), r(0.24), 16, math.pi / 16, 0.4)
kreis(r(0.285)); kreis(r(0.295))
blaetter(r(0.295), r(0.4), 24, 0, 0.46)
blaetter(r(0.295), r(0.37), 24, math.pi / 24, 0.42)
kreis(r(0.415)); tupfen(r(0.43), 96, 1.4); kreis(r(0.445))

gold = '#B08A30'
svg = (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="-232 -232 464 464">'
       f'<path d="{"".join(linien)}" fill="none" stroke="{gold}" stroke-width="2.6" stroke-linecap="round"/>'
       f'<path d="{"".join(punkte)}" fill="{gold}"/></svg>')
ziel = os.path.join(WURZEL, 'bilder', 'mandala-linie.svg')
open(ziel, 'w').write(svg)
print('gebaut:', os.path.relpath(ziel, WURZEL), len(svg), 'Zeichen')
