# CLAUDE.md — NOW Consulting Webseite

**WICHTIG: Diese Datei am Anfang jeder Session lesen. Sie dokumentiert wiederkehrende Fehler die der User nicht nochmal sehen will.**

---

## Projekt

NOW Consulting Webseite. Premium-Beratung im DACH-Raum, Zielgruppe: Coaches und Berater im 5- bis 6-stelligen Monatsumsatz-Bereich. USP: Spiritualität + Business. Tonalität: edel, dunkel, gold, Matrix-Edge, nie kitschig, nie generisch.

- Vanilla TypeScript + Three.js + Vite
- Lenis Smooth Scroll, GSAP für komplexe Animationen
- Source in `src/`, Inhalte in `src/content/`
- Dev-Server läuft im Worktree `/Users/lukasfilimon/Webseite/.claude/worktrees/vibrant-brattain-a0d910/` auf Port 5174
- Worktree-Sync nach jedem File-Change auf `src/` oder `public/` ist Pflicht

---

## 🚫 SCHRIFTARTEN — KRITISCHE REGEL

**Goldene Regel: Schau dir an wie die LIVE-Sections es machen und übernimm DAS, nicht erfinde neue Varianten.** Die etablierten Patterns in Hero, FinalCTA, Programs, Approach sind die Wahrheit. Neue Sketches dürfen die Patterns NUR übernehmen, nicht neu interpretieren.

### Cormorant Garamond (Display Serif, italic-fähig)
**Für alles Emotionale, Erzählerische, Premium-Markante:**
- Section-Headlines
- Card-Titles und Phase-Headlines
- Taglines, Sub-Zeilen (kurze emotionale Sätze)
- "Im Innen / Im Außen" Labels (Approach-Section — Variante B Entscheidung)
- Footer-Texte, Pull-Quotes
- Alle Headline-artigen Stellen wo der User "abgeholt" werden soll

### Inter (Sans-Serif)
**Für Body-Text UND für Buttons/CTAs:**
- Beschreibungs-Absätze (3+ Zeilen)
- Inclusion-Descriptions in Karten
- FAQ-Antworten
- Footer-Legal-Texte
- **CTAs (Inter, uppercase, letter-spacing 0.18em — etabliertes Pattern):**
  - `font-family: var(--font-body)` (= Inter)
  - `font-size: 13px` (Card-CTA) bzw. `14px` (FinalCTA-Button)
  - `font-weight: 600`
  - `letter-spacing: 0.18em`
  - `text-transform: uppercase`
  - `color: var(--color-gold)` (Inline-Text) bzw. solid gold button background (FinalCTA)

### JetBrains Mono (Monospace)
**Für Section-Eyebrows und kompakte Meta-Labels (Indikatoren am Rand der Hauptbotschaft):**
- ✅ Section-Eyebrows wie "PROGRAMME", "UNSER WEG" (klein, weit gesperrt, uppercase)
- ✅ Number-Labels wie "FELD 01", "STATION 01" (Approach-Section)
- ✅ Duration-Indikatoren wie "6 MONATE · 1:1-BEGLEITUNG" (klein, dezent)
- ✅ Daten-Anzeigen wie Umsatzzahlen-Zeilen in Karten ("0 € → 10.000 € MONATSUMSATZ · IN 3 BIS 6 MONATEN")
- ❌ NIE für Headlines, Taglines, fließenden Beschreibungs-Text
- ❌ NIE für emotionale Labels die mitten in der Botschaft sitzen ("Im Innen" → Cormorant Italic, das wurde explizit so entschieden)

### Faustregel beim Bauen
**Vor jeder `font-family`-Entscheidung:**
1. Schau in der nächsten Live-Section nach einem vergleichbaren Element (CTA, Eyebrow, Body-Text, Meta-Label)
2. Übernimm 1:1 den Style — gleiche Schrift, gleiche Größe, gleiches Spacing
3. Nur wenn es WIRKLICH neu ist (kein Vorbild in Live-Sections), eigene Entscheidung treffen

---

## 🚫 BUTTONS / CTAs — Pattern-Familien

Alle Lead-Conversion-CTAs sind **Solid Gold Gradient mit schwarzem Text**. Niemals Cormorant Italic für Buttons (war mein Fehler — sieht aus wie "noch eine Headline"). Solid Gold Buttons sind der etablierte Conversion-Pattern.

Zwei Conversion-Button-Styles (nach Position im Funnel) plus ein Navigations-Style:

### 1) Hero / Card-CTA Style — Solid Gold, NORMAL CASE
**Hero "Erstgespräch buchen" UND alle Card-CTAs (Programs, Experiences, etc.).** Lesbar, eleganter als der FinalCTA.
```css
padding: 18px 44px;
border: none;
border-radius: 4px;
background: linear-gradient(135deg, var(--color-gold), var(--color-gold-dark));
color: var(--color-black);
font-family: var(--font-body);  /* Inter */
font-size: 15px;
font-weight: 500;
letter-spacing: 0.04em;          /* NICHT 0.18em! */
/* NICHT text-transform: uppercase! */
box-shadow: 0 0 18px rgba(201, 168, 76, 0.28),
            0 4px 16px rgba(201, 168, 76, 0.18);
```
Hover: brighter gradient + stärkerer Glow.

### 2) FinalCTA-Hammer Style — Solid Gold, UPPERCASE
**Nur am absoluten Section-Ende, der finale Conversion-Push. Plakativer.**
```css
padding: 20px 52px;
background: linear-gradient(135deg, var(--color-gold), var(--color-gold-dark));
color: var(--color-black);
font-size: 14px;
font-weight: 600;
letter-spacing: 0.18em;
text-transform: uppercase;
box-shadow: 0 0 32px rgba(201, 168, 76, 0.4), 0 6px 24px rgba(201, 168, 76, 0.25);
```
Hover: brighter Gradient + translateY(-2px) + stärkerer Glow.

### 3) Navigation — Dark Glass mit Gold-Border (Approach Carousel-Arrows)
**Für UI-Steuerung wie Carousel-Navigation. Nicht für Lead-Conversion.**
```css
width: 72px; height: 56px;
background: linear-gradient(165deg, rgba(34,30,20,0.78), rgba(20,17,11,0.68));
border: 1px solid rgba(201, 168, 76, 0.28);
border-radius: 4px;
```

### Faustregel
**Conversion-CTA in einer Sektion (Card, Hero, etc.) = Style 1 (Hero-Style).**
**Section-Ende-Hammer = Style 2 (FinalCTA-Style).**
**Funktional / Navigation = Style 3.**

### Was NICHT machen
- ❌ Outlined-Button mit transparentem Background als Card-CTA (wirkt schwach gegen Solid Gold der etabliert ist)
- ❌ Inline-Text-CTA mit Pfeil ohne Background — wirkt nicht wie ein Button
- ❌ Cormorant Italic für CTAs — gehört Headlines, nicht Action-Buttons
- ❌ Hero-Style mit uppercase machen — kopiert den FinalCTA-Hammer und klaut ihm den Punch

---

## 🚫 INHALTLICHE FEHLER

### Programme-Section (Beispiel-Lehre)
- ❌ NICHT die Programmnamen prominent zeigen ("Salesforce", "Leadership Mastery")
- ✅ Stattdessen Phase-Headlines: "Aufbau-Phase", "Skalierung-Phase"
- ❌ NICHT "Wähle deinen Pfad" oder "Selbst-Diagnose" Framing
- ✅ Stattdessen: "Wir holen dich ab" — emotionale Resonanz, keine Entscheidung
- ❌ NICHT Cross-Sell-Produkte hier reinpacken (Dubai Mastermind, Retreats) — die gehören in die Experiences-Section

### Generelle Tonalität-Regeln
- NIE "behindert" wirken — Lukas's direktes Feedback für plakative Sub-Zeilen
- NIE Marketing-Slogan-Sprache ("Dein Erfolg ist unser Antrieb")
- NIE generische Coaching-Phrasen ("Lass uns gemeinsam wachsen")
- ✅ Konkrete Pain-Points der Zielgruppe (z.B. "Du kennst den Weg zum nächsten Level noch nicht")
- ✅ Originale Vertriebs-Sprache von Darko/Lukas übernehmen wenn möglich

---

## 🚫 META-VERHALTEN

### Wenn der User Feedback gibt
- ✅ Fragen ZURÜCK stellen wenn etwas unklar ist — OFFEN, mit Kontext-Einladung
- ❌ NIE Drop-Down / Multiple-Choice / AskUserQuestion mit 4 Optionen für Geschmacks-Entscheidungen
- ✅ Eigene These formulieren, dann offen fragen
- ✅ Mehr Kapazität in Denkprozesse investieren bevor antworten

### Gesamtkontext mitdenken
- ✅ Vor jeder Section-Entscheidung prüfen was die NÄCHSTE und VORHERIGE Section macht
- ✅ Cross-Sell ≠ Programme — Cross-Sell ist Experiences
- ✅ Manifest ≠ Audience — Manifest ist Philosophie, Audience ist Avatar-Spiegel
- ✅ Approach ≠ Programs — Approach ist Methodik, Programs ist Angebot-Phasen

### Sketches vs. echte Implementation
- Bei größeren Visual-Entscheidungen erst Sketch in `public/[name]-sketch.html` bauen
- Echte src/ Files erst nach Visual-Approval anfassen
- Standalone HTML mit Google Fonts CDN ist OK für Sketches

### Worktree-Sync
- Nach JEDEM File-Change in `src/` oder `public/`:
  ```bash
  cp <path-in-main-repo> <same-path-in-worktree>
  ```
- Worktree-Pfad: `/Users/lukasfilimon/Webseite/.claude/worktrees/vibrant-brattain-a0d910/`
- Dev-Server läuft NUR im Worktree, Main-Repo-Files werden nicht serviert

---

## ✅ ETABLIERTE DESIGN-ENTSCHEIDUNGEN

### Farbpalette (Gold)
- `#c9a84c` — Gold Base
- `#e2c97a` — Gold Light (für Italic-Akzente, Hover-States)
- `#d9b96a` — Gold Accent
- `rgba(201, 168, 76, 0.16)` — Card-Border (subtle)
- `rgba(201, 168, 76, 0.08)` — Subtle Glow

### Premium-Glass-Card-Pattern (etabliert in Approach-Section)
```css
background:
  linear-gradient(165deg,
    rgba(34, 30, 20, 0.78) 0%,
    rgba(20, 17, 11, 0.68) 50%,
    rgba(12, 10, 7, 0.58) 100%);
border: 1px solid rgba(201, 168, 76, 0.16);
border-radius: 4px;
backdrop-filter: blur(18px) saturate(135%);
box-shadow:
  0 1px 0 0 rgba(255, 240, 200, 0.07) inset,
  0 -1px 0 0 rgba(0, 0, 0, 0.4) inset,
  0 32px 64px -28px rgba(0, 0, 0, 0.75);
```
Plus `::before` mit radial gold-tint glow oben.

### Section-Eyebrows
- Mono, 11px, weight 600, letter-spacing 0.32em, uppercase, color gold
- Etabliertes Pattern in Approach, Audience, Manifest, Programs

### Reveal-Pattern
- IntersectionObserver mit threshold 0.2-0.25
- Cascading reveal mit `nth-child` transition-delays
- `prefers-reduced-motion` Fallback (statische Vollversion)

### Bullets in Listen
- ◆ (Diamond) in Gold für emotionale/spirituelle Listen
- ▸ (Pfeil) für neutrale Action-Listen
- — (Em-Dash) für Editorial-Style

---

## 🔧 WIEDERKEHRENDE FEHLER (DOKUMENTIERT)

Wenn ich einen dieser Fehler nochmal mache, ist das ein klares Signal, dass ich diese Datei nicht gelesen habe.

| Datum | Fehler | Wie vermieden |
|-------|--------|---------------|
| 2026-05-17 | Cormorant Italic für CTA "Erstgespräch buchen" und Phase-Meta-Zeile verwendet — falsch, etabliertes Pattern ist Inter uppercase (CTA) bzw. Mono uppercase (Meta-Label) | Vor jeder font-family Entscheidung in der nächsten Live-Section vergleichbares Element nachschlagen und 1:1 übernehmen. |
| 2026-05-17 | Card-CTA als Outlined-Button mit transparent background gestyled — falsch, etabliertes Pattern ist Solid Gold wie Hero-CTA (Inter 15px, NORMAL case, letter-spacing 0.04em) | Card-CTAs IMMER Solid Gold Gradient mit schwarzem Text. Hero-CTA-Style ist die Referenz für alle Lead-Conversion-Buttons außer FinalCTA. |
| 2026-05-17 | "Selbst-Diagnose" Frame in Programme-Sub-Zeile | Emotionale Abholung statt Diagnose-/Entscheidungs-Frame |
| 2026-05-17 | Programmnamen "Salesforce/Leadership Mastery" als Karten-Titel | Phase-Headlines stattdessen ("Aufbau-Phase", "Skalierung-Phase") |
| 2026-05-17 | Cross-Sell-Produkte in Programme-Section vorgeschlagen | Cross-Sell gehört in Experiences-Section. Gesamtkontext beachten. |
| 2026-05-17 | 4-Optionen-AskUserQuestion für Geschmacks-Entscheidungen | Offene Fragen mit Kontext-Einladung |

---

## Dokumentations-Pflicht

Wenn der User einen neuen Fehler kritisiert:
1. SOFORT die Fehler-Tabelle oben ergänzen
2. Wenn der Fehler eine Schriftart/CSS-Entscheidung ist: Regel in die entsprechende Sektion eintragen
3. Erst dann fixen
