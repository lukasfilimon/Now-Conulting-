# CLAUDE.md — NOW Consulting Webseite

Am Anfang jeder Session lesen.

## Grundlage

- Statische Seite auf dem NOW-Kern. Design-Regeln: `NOW-DESIGNSYSTEM.md` im
  Repo `lukasfilimon/now-landingpages`. **Die alten Regeln dieser Datei
  (Inter, JetBrains Mono, Knopf-Stile mit Großbuchstaben) gelten nicht mehr.**
- `kern.css`, `kern.js`, `mandala.js` nie hier ändern, nur aus
  `now-landingpages/kern/` kopieren.
- Ein Knopf-Wortlaut auf der ganzen Seite: „Klarheitsgespräch buchen“ → `/termin/`.
- `main` ist an das Netlify-Projekt `now-consulting` gekoppelt: **jeder Push
  auf `main` geht sofort live.** Arbeiten auf einem Zweig, Vorschau über
  `now-consulting-neu`.
- Vor jedem Deploy `qa/pruefen.mjs`, `qa/ueberlauf.mjs`, `qa/kontrast.mjs`
  (siehe README).

## Inhaltliche Regeln (aus der alten Seite übernommen, gelten weiter)

- **Programme:** keine Programmnamen („Salesforce“, „Leadership Mastery“),
  sondern Phasen: Stabilisierungsphase, Skalierungsphase. Rahmen „Wir holen
  dich dort ab, wo du gerade stehst“, kein „Wähle deinen Pfad“, keine
  Selbst-Diagnose.
- **Cross-Sell** (Money Mind, Dubai Mastermind, Retreat) gehört in
  „Erfahrungen“, nie in Programme. Die Formate verlinken nicht auf alte
  Landingpages, der Knopf führt zum Klarheitsgespräch.
- Abgrenzen: Darko-Sektion = Philosophie, „Wer ist unser Kunde“ =
  Avatar-Spiegel, sieben Schritte = Methodik, Programme = Angebots-Phasen.
- Ton: keine Marketing-Slogans, keine generischen Coaching-Phrasen, konkrete
  Pain-Points, Darkos und Lukas' eigene Vertriebssprache wo möglich. Keine
  Superlative wie „die einzige“ (nicht belegbar).
- Bei Geschmacksfragen offen fragen und eine eigene These nennen, nicht
  vier Optionen zum Anklicken.

## Fehler, die nicht wieder passieren sollen

| Datum | Fehler | Wie vermieden |
|---|---|---|
| 12.11.2026 | Beim Zusammensetzen von `seite.css` ein `/*` ohne `*/` und ein leerer `@media`-Block: alles danach wurde ignoriert, die Seite sah unformatiert aus | Nach jedem Schnitt in CSS: Klammern und Kommentare zählen (Befehl in NOW-DESIGNSYSTEM.md, Abschnitt 12), dann Bildschirmfoto ansehen |
