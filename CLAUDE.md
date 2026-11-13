# CLAUDE.md — NOW Consulting Webseite

Am Anfang jeder Session lesen. Danach `notizen/VORHABEN.md`: dort stehen
beschlossene Vorhaben, die noch gebaut werden (z. B. der Auge-Zoom in
Darkos Pupille) — Lukas fragen, ob eins davon jetzt dran ist.

## Grundlage

- Statische Seite auf dem NOW-Kern. Design-Regeln: `NOW-DESIGNSYSTEM.md` im
  Repo `lukasfilimon/now-landingpages`. **Die alten Regeln dieser Datei
  (Inter, JetBrains Mono, Knopf-Stile mit Großbuchstaben) gelten nicht mehr.**
- `kern.css`, `kern.js`, `mandala.js` nie hier ändern, nur aus
  `now-landingpages/kern/` kopieren.
- **Texte und Anordnung sind die der bisherigen Seite (Entscheidung Lukas,
  12.11.2026).** Neu ist nur das Design. Keine Texte umschreiben, kürzen
  oder "verbessern" und keine Sektionen umstellen, ohne dass Lukas es
  ausdrücklich will. Vorschläge vorher fragen, nie einfach umsetzen.
- Knöpfe: „Erstgespräch buchen“ (vorher „Klarheitsgespräch“, geändert von Lukas 13.11.2026, überall), im Schluss „Termin auswählen“, alle → `/termin/`.
- `main` ist an das Netlify-Projekt `now-consulting` gekoppelt: **jeder Push
  auf `main` geht sofort live.** Arbeiten auf einem Zweig, Vorschau über
  `now-consulting-neu`.
- Vor jedem Deploy `qa/pruefen.mjs`, `qa/ueberlauf.mjs`, `qa/kontrast.mjs`,
  nach Änderungen an Animationen auch `qa/fluessig.mjs` (siehe README).

## Zwei Webseiten: Varianten (Entscheidung Lukas, 13.11.2026)

Lukas lässt zwei vollständige Webseiten bauen und entscheidet danach:
- **B „hell“**: Creme/Elfenbein als Grundton, Schwarz nur als Bühne
  (Manifest, Kunde, Live Events, Abschluss, Footer), Gold nur als Akzent.
  Überschriften Geist eng gesetzt, Akzentwörter Instrument Serif kursiv.
  Vorschau: Netlify-Projekt `now-consulting-hell`.
- **C „Nacht mit Insel“**: kommt als Nächstes (Vorlage: `/entwurf-hero/c/`).

So ist es gebaut:
- `index.html` im Repo-Ordner ist die **eine Textquelle** für alle
  Varianten. Texte nur dort ändern, sie wirken überall.
- `varianten/<name>/`: nur das, was die Variante anders macht (`hero.html`
  mit Platzhaltern, eigenes CSS/JS, Schriften).
- `python3 werkzeuge/variante.py hell` baut die ganze Webseite samt
  Unterseiten nach `_ausgabe/hell/` (nicht im Git). Ausliefern aus diesem
  Ordner, QA mit einem lokalen Server auf diesem Ordner.
- Welche Sektionen dunkle Bühnen sind, steht in `werkzeuge/variante.py`
  (`DUNKEL`).

## Inhaltliche Regeln (aus der alten Seite übernommen, gelten weiter)

- **Programme:** keine Programmnamen („Salesforce“, „Leadership Mastery“),
  sondern Phasen: Stabilisierungsphase, Skalierungsphase. Rahmen „Wir holen
  dich dort ab, wo du gerade stehst“, kein „Wähle deinen Pfad“, keine
  Selbst-Diagnose.
- **Cross-Sell** (Money Mind, Dubai Mastermind, Retreat) gehört in
  „Erfahrungen“, nie in Programme. Die Formate verlinken nicht auf alte
  Landingpages, der Knopf führt zum Erstgespräch.
- Abgrenzen: Darko-Sektion = Philosophie, „Wer ist unser Kunde“ =
  Avatar-Spiegel, sieben Schritte = Methodik, Programme = Angebots-Phasen.
- Ton: keine Marketing-Slogans, keine generischen Coaching-Phrasen, konkrete
  Pain-Points, Darkos und Lukas' eigene Vertriebssprache wo möglich.
- Bei Geschmacksfragen offen fragen und eine eigene These nennen, nicht
  vier Optionen zum Anklicken.

## Fehler, die nicht wieder passieren sollen

| Datum | Fehler | Wie vermieden |
|---|---|---|
| 12.11.2026 | Beim Zusammensetzen von `seite.css` ein `/*` ohne `*/` und ein leerer `@media`-Block: alles danach wurde ignoriert, die Seite sah unformatiert aus | Nach jedem Schnitt in CSS: Klammern und Kommentare zählen (Befehl in NOW-DESIGNSYSTEM.md, Abschnitt 12), dann Bildschirmfoto ansehen |
| 12.11.2026 | Beim Design-Upgrade auch Texte umgeschrieben und Sektionen umgestellt. Gewünscht war nur das Design. | Bei "schöner machen" / "neuer Stand": Texte und Reihenfolge 1:1 übernehmen. Inhaltliche Änderungen nur auf ausdrücklichen Wunsch. |
| 13.11.2026 | Manifest-Titel: Goldverlauf (`background-clip: text`) lag auf der Zeile UND auf jedem Wort; beim Hereinfahren zeichnete Chrome „Dein“ und „Kontostand“ übereinander | Verlauf nur auf einer Ebene. Einblendungen Bild für Bild prüfen (Screenshots im Abstand von 150 ms), nicht nur den Endzustand |
| 13.11.2026 | Ruckler: CSS-Filter und Masken auf drehenden Flächen, Glas-Unschärfe hinter undurchsichtigen Karten, Lichtrand über animierte Farb-Variable, 24 Vimeo-Player im Laufband | Vor jedem Deploy `qa/fluessig.mjs`; Regeln dazu in der README |
