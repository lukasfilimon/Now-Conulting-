# NOW Consulting — Webseite (now-consulting.at)

Statische Seite auf dem NOW-Kern. Kein Build, kein npm im Auslieferungspfad.
Seit 12.11.2026 im neuen Design; die alte Vite/Three.js-Seite liegt in der
Git-Historie von `main` (Stand b791a47). **Texte und Anordnung der Sektionen
sind 1:1 die der alten Seite**, neu ist nur das Design.

**Wie eine NOW-Seite aussieht** (Farben, Schriften, Glas, Knöpfe, Mandala,
Sprache) steht in `NOW-DESIGNSYSTEM.md` im Repo
`lukasfilimon/now-landingpages`. `kern.css`, `kern.js` und `mandala.js` sind
**unverändert** aus dessen Ordner `kern/` kopiert. Was dort geändert wird,
hier per `cp` nachziehen, nie hier allein ändern.

## Dateien

| Datei | Rolle |
|---|---|
| `index.html` | Startseite, alle Sektionen |
| `seite.css` | Layout der Webseite (Kopfleiste, Hero mit Zahlenleiste, Manifest, Karussells, Programme, Live Events, Team, Footer, Unterseiten) |
| `karussell.js` | Pfeile und Fortschrittsbalken der Testimonials |
| `bewegung.js` | Premium-Bewegung: Hero (Wort-Einstieg, 3D-Videokarte, Magnet-Knopf), Spiegel (Aussen/Innen-Karten), Pillen-Szene, Zwei Welten, gepinnte 7 Schritte. Alles hängt an `html.bewegung`, ohne JS oder bei reduzierter Bewegung ist alles statisch lesbar |
| `seite.js` | Konfiguration für kern.js (Trennlinien, Videotitel) |
| `tracking.js` | Meta-Pixel, nur nach Zustimmung und nur auf now-consulting.at |
| `termin.js` | Calendly auf /termin/, lädt erst nach Klick, meldet Lead nach Buchung |
| `termin/`, `impressum/`, `datenschutz/`, `agb/` | **erzeugt** von `werkzeuge/unterseiten.py` |
| `werkzeuge/inhalte/*.html` | Inhalt der Unterseiten — hier ändern |
| `bilder/` | WebP, aus den alten Fotos skaliert |
| `qa/` | Prüfskripte |
| `notizen/` | `VORHABEN.md` (beschlossen, noch nicht gebaut: Auge-Zoom, offene Bausteine), Recherche und Orientierungsdokument der alten Seite; nicht ausgeliefert |

Kopfleiste und Footer stehen in `index.html`. Nach jeder Änderung daran:

    python3 werkzeuge/unterseiten.py

## Prüfen

    python3 -m http.server 8811 --bind 127.0.0.1 &
    WEB_URL=http://127.0.0.1:8811 node qa/pruefen.mjs        # 66 Prüfungen
    LP_URL=http://127.0.0.1:8811 node qa/ueberlauf.mjs       # 7 Breiten
    LP_URL=http://127.0.0.1:8811 node qa/kontrast.mjs        # WCAG AA
    WEB_URL=http://127.0.0.1:8811 node qa/fluessig.mjs       # Ruckler je Sektion

(`playwright` und für kontrast.mjs `pngjs` müssen auffindbar sein.)

`fluessig.mjs` scrollt die Seite gleichmäßig durch und zeigt je Sektion
hängende Bilder, bremsende Skripte, Layout-Sprünge und Konsolenfehler
(`GERAET=handy`, `CPU=4` für ein langsames Handy). Der Testbrowser rechnet
ohne Grafikkarte: aussagekräftig ist der Vergleich der Sektionen, nicht der
absolute Wert. Gelernt am 13.11.2026: drehende Flächen nie mit CSS-Filter
oder Maske belegen, keine Glas-Unschärfe hinter undurchsichtigen Karten,
Lichtränder per `transform` drehen statt per Farb-Variable.

## Vorschau und Livegang

Die neue Fassung liegt auf dem Zweig `claude/nifty-albattani-3of2i7` und
läuft zur Ansicht im eigenen Netlify-Projekt `now-consulting-neu`
(now-consulting-neu.netlify.app). Live (`now-consulting`, gekoppelt an
`main`) ist weiter die alte Seite.

**Umschalten auf now-consulting.at**, in dieser Reihenfolge:

1. In `index.html` die Zeile `<meta name="robots" content="noindex, nofollow" />`
   entfernen (Kommentar "VORSCHAU" darüber). Die Unterseiten behalten ihr noindex.
2. Datenschutzerklärung rechtlich prüfen lassen (neu: Vimeo, Calendly, Hosting).
3. Zweig nach `main` mergen. `netlify.toml` stellt den Build automatisch von
   `npm run build` auf "kein Build" um.
4. Nach dem Deploy: `WEB_URL=https://now-consulting.at node qa/pruefen.mjs --live`
   — prüft dann auch, dass noindex weg ist, der Pixel nach Zustimmung lädt
   und Arbeitsdateien 404 liefern.
5. Netlify-Projekt `now-consulting-neu` löschen.
