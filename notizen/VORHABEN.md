# Vorhaben für die Webseite

**Stand 13.11.2026:** Zwei Webseiten. B „hell“ ist gebaut (siehe CLAUDE.md,
Abschnitt Varianten). Als Nächstes C „Nacht mit Insel“ als eigene Webseite.

Beschlossene Ideen, die noch nicht gebaut sind. **Bei jedem Sessionstart
lesen** und Lukas fragen, ob etwas davon jetzt dran ist. Erledigtes hier
herausnehmen und im Commit erwähnen.

---

## 1. Auge-Zoom in Darkos Pupille (beschlossen 13.11.2026, Bau später)

**Wunsch Lukas, wörtlich:** „Das will ich zu 100 % auch so haben mit dem
Auge — der Zoom geht immer tiefer in die Pupille, bis der Hintergrund nur
noch schwarz ist. Dafür nutzen wir Darkos Auge, und das Video lassen wir
von der KI mit seinem Auge generieren — aber erst später.“

**Vorbild:** monads.ch, Kontaktbereich „Let's talk“ ganz unten auf der
Startseite (Stand 13.11.2026). Dort läuft ein selbst gehostetes Video eines
Auges (`Eye-1-1.mp4`, rund 12 MB) über die volle Breite; je weiter man
scrollt, desto tiefer geht es in die Pupille, bis alles schwarz ist. In der
schwarzen Pupille stehen die Überschrift, ein Satz und ein runder Knopf mit
dem Logo. Nur als Vorbild für die Wirkung — Video, Texte und Code von
Monads werden nicht übernommen.

**Bei NOW:**
- Das Auge ist **Darkos Auge**. Das Video erzeugt eine KI aus einem Foto
  seines Auges. Erst bauen, wenn Lukas es freigibt.
- Vorgeschlagener Platz: der Abschluss „Jetzt ist dein Moment“ vor dem FAQ.
  Die Texte dort bleiben unverändert (Eyebrow, „Wenn du den Ruf spürst,
  melde dich bei uns.“, Untertitel, Knopf „Termin auswählen“,
  „1:1 Gespräch · Unverbindlich · Kostenlos“). Das Mandala in dieser
  Sektion entfällt dann. **Platz mit Lukas bestätigen.**

**Ablauf beim Scrollen:**
1. Die Sektion bleibt stehen (sticky, rund 250 vh Scrollweg).
2. Der Scrollfortschritt (0 bis 1) steuert die Videozeit, nicht ein Timer:
   langsam scrollen = langsam zoomen, zurückscrollen = herauszoomen.
3. Am Ende füllt die Pupille das ganze Bild: reines Schwarz, nahtlos in den
   Grund der Sektion. Das letzte Videobild muss exakt diese Farbe haben.
4. Erst wenn das Schwarz steht (letzte ~25 %), blenden Überschrift,
   Untertitel und Knopf ein.

**Technik (so geplant):**
- Video selbst hosten (nicht Vimeo): kein Consent nötig, und nur so lässt
  sich die Zeit per Scroll exakt steuern.
- Für ruckelfreies Vor- und Zurückspulen das Video mit einem Schlüsselbild
  in jedem Bild kodieren (z. B. `ffmpeg … -g 1`) oder als Bildfolge
  (rund 90 WebP-Bilder) auf ein Canvas zeichnen. Beides testen, das
  flüssigere nehmen.
- Zwei Fassungen: 16:9 für den Rechner, 9:16 für das Handy. Ziel unter
  3 MB pro Fassung (WebM/AV1 plus MP4 als Rückfall).
- Bei „Bewegung reduzieren“ und ohne JavaScript: Standbild des Auges mit
  schwarzer Pupille, Text sofort sichtbar.
- In `bewegung.js` nach dem Muster der Pillen-Szene (gepinnt, geglätteter
  Fortschritt, nur aktiv, solange die Sektion sichtbar ist).

**Was für die KI-Generierung gebraucht wird:**
- Ausgangsfoto von Darkos Auge: Makro, scharf, mindestens 4K, gleichmäßiges
  warmes Licht (Goldtöne passend zur Marke), Iris gut sichtbar.
- Video: ein gleichmäßiger Zoom ohne Schnitt und ohne Blinzeln, von der
  Iris-Nahaufnahme bis vollständig in die schwarze Pupille, 5 bis 8 s,
  30 fps, je 1920×1080 und 1080×1920. Letztes Bild komplett schwarz.
- **Darkos Zustimmung** zur Verwendung seines Auges und zur KI-Bearbeitung.
- In dieser Arbeitsumgebung stehen KI-Videowerkzeuge zur Verfügung; erst
  einsetzen, wenn Lukas es sagt.

---

## 2. Innen und Außen — offene Bausteine (Strategie vom 12./13.11.2026)

Roter Faden der Seite ist **Innen und Außen** (freigegeben). Gebaut als
Entwurf: Der Spiegel, Zwei Welten, Die Zusammenarbeit. Offen:

**„Die Zusammenarbeit“ — gebaut als Entwurf (13.11.2026)**, zwischen
Programme und Live Events. Kachel-Wand mit fünf kleinen NOW-Oberflächen
(1:1-Anruf mit Agenda, Wochenkalender, WhatsApp, Meditations-Player,
Verlauf Woche 1 / ab Woche 2). Fakten von Lukas (13.11.2026):
- **Ausschließlich 1:1** (Überschrift der Sektion)
- Zwei Live-Calls pro Woche mit Darko: **Montag und Mittwoch, 10 Uhr**,
  zusätzlich 1:1 Calls nach Absprache. Die Seite zeigt den nächsten
  Live-Call nach Wiener Zeit an.
- **Täglicher WhatsApp-Support** stimmt („passiert ganz selten, dass mal
  nicht am selben Tag eine Antwort kommt“). Die Formulierung in
  „Programme“ bleibt also.
- Meditationsbibliothek vorhanden
- Kein klassisches Kick-off: Woche 1 ist eine Beratung (Geschäftsmodell,
  Zielgruppe, Angebotsstruktur, Vertriebsweg). Ab Woche 2 Umsetzung, vor
  allem Vertrieb, dazu Content für Marketing und Social Media — „immer
  sehr individuell“.

Noch offen: Wer im Anruf und im Chat als Kundenberater zu sehen ist
(Entwurf: Lukas mit Teamfoto), optional drei bis fünf echte Titel aus der
Meditationsbibliothek für den Player.

**Vergleich „Andere vs. NOW“** — links matt, rechts NOW mit echten Zahlen.

**Texte des Spiegels** — Lukas liefert die Sätze aus seinen Erstgesprächen.

**Inspiration (je ein Prinzip, nichts kopieren):** attio.com und linear.app
(Leistung greifbar machen), monads.ch (Selbstbewusstsein, schwebende
Versprechen), hoshinoya.com und aman.com (Ruhe, Raum, Licht aus der
Dunkelheit). Heartbeat nicht weiter als Vorlage nehmen: zu erkennbar.
