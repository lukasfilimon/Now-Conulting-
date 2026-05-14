# NOW Consulting Homepage

Premium Classical Site für **now-consulting.at** — Vite + TypeScript + Three.js.

---

## Stand 14.05.2026

✅ **10 Sections live im Code** und alle rendern:
1. Hero — Gold-Orb Background + finale Headline („Die einzige spirituelle Unternehmensberatung im DACH-Raum, die dich vom Coach zum Unternehmer macht.")
2. Manifest — Cinematic Word-by-Word Reveal
3. Audience — Vorher / Nachher Spalten
4. Approach — Die Reise mit SVG-Pfad (4 Stationen)
5. Programs — Salesforce + Leadership Mastery Cards (keine Preise)
6. Experiences — Retreats / Mastermind / Seminare
7. Stimmen — Video-Testimonials Grid (Placeholders, Videos noch einzufügen)
8. Team — 4 Personen gleich groß (Initialen-Fallback)
9. FAQ — 8-Fragen Akkordeon
10. Final CTA + Footer

✅ **Legal Pages** unter `/impressum`, `/datenschutz`, `/agb` (1:1 von masterclass.now-consulting.at übernommen).

✅ **Performance**: Logo komprimiert (3MB → 304KB), Howler stubbed (kein Audio in v1), Bundle ~225KB gzipped.

✅ **Mobile responsive**: WebGL-Orb deaktiviert auf <768px, Pfad-Section in vertikale Liste umgeschaltet.

---

## Development

```bash
npm install
npm run dev    # localhost:5174
npm run build  # → dist/
npm run preview
```

**TypeScript-Check:**
```bash
npx tsc --noEmit
```

---

## Deploy zu Vercel

```bash
# Einmalig:
npm install -g vercel

# Deploy (Preview-URL):
vercel

# Production:
vercel --prod

# Domain verknüpfen (einmalig):
vercel domains add now-consulting.at
```

`vercel.json` ist bereits konfiguriert: Vite Framework, Clean URLs, Cache-Headers, Security-Headers.

---

## Open Operational Items (user actions vor Live-Gang)

### Hard-Blocker
- [ ] **Calendly-URL** in `src/content/copy.ts` Zeile 7 (`CALENDLY_URL = ''`) eintragen. Aktuell mailto-Fallback aktiv.
- [ ] **Domain DNS** für `now-consulting.at` bei Vercel konfigurieren.

### Soft-Blocker (Fallbacks sind ready)
- [ ] **Team-Fotos** (Darko, Stefan, Lukas, Denise) — in `public/team/` ablegen, dann `photoUrl` in `src/content/team.ts` ergänzen. Fallback: Initialen-Kreise.
- [ ] **Video-Testimonials** — Vimeo Pro oder YouTube Privacy-Enhanced Embed URLs in `src/sections/Stimmen.ts` ergänzen (`testimonials` array). Fallback: Pull-Quotes only.

### Wenn Marketingagentur Tracking aktiviert
- [ ] **Klaro Cookie-Consent** installieren bevor Meta Pixel live geht. CDN-Setup: `<script defer src="https://cdn.jsdelivr.net/npm/klaro/dist/klaro-no-css.js"></script>` plus Service-Konfiguration.

---

## Brand-Tonalität (intern)

- **USP**: Die einzige spirituelle Unternehmensberatung im DACH-Raum
- **Kern (intern)**: Bewusstseinsarbeit → Unternehmensberatung ist „Schutzmantel"
- **„Spirituell"** nur in Hero + Manifest, sonst nirgends
- **KEIN** 10k→100k im Headline (Sub-Text mit „5- bis 6-stellig" OK)
- **KEINE** Preise auf der Site, **KEINE** Umsatz-Brackets als Filter

---

## Verzeichnis-Struktur

```
src/
├── main.ts                    Entry, mountet alle Sections
├── core/                      Renderer, Scene, AssetManager, AudioManager (Stub), Performance
├── scroll/                    Lenis + GSAP ScrollManager
├── sections/                  Eine Datei pro Section
│   ├── Hero.ts                Gold-Orb + Particle-System
│   ├── Manifest.ts            Cinematic Reveal
│   ├── Audience.ts            Vorher/Nachher
│   ├── Approach.ts            SVG-Pfad mit 4 Stationen
│   ├── Programs.ts            SF + LM Cards
│   ├── Experiences.ts         Retreats Cards
│   ├── Stimmen.ts             Video-Testimonials
│   ├── Team.ts                4 Portraits
│   ├── FAQ.ts                 Akkordeon
│   ├── FinalCTA.ts            Großer Button
│   └── Footer.ts              Minimaler Footer
├── ui/                        HeroContent (HTML overlay), Navigation
├── content/                   Alle Texte + Daten
│   ├── copy.ts                Headlines, Subs, CTAs, Footer
│   ├── programs.ts            SF + LM Beschreibungen
│   ├── team.ts                4 Personen
│   ├── faq.ts                 8 Fragen
│   └── experiences.ts         Retreat-Formate
└── shaders/                   GLSL für Gold-Orb + Particles
```

---

## Iteration 2 (nach v1-Ship)

- Schriftliche Case-Studies mit Umsatz-Doppelmetrik (Anja Strobl etc.)
- „Über Darko"-Unterseite mit Hero's Journey
- Audio-Layer (Howler.js re-aktivieren)
- Sanity CMS für Content
- Sticky-Pin in Approach (Innen/Außen/System)
- Lead-Magnet PDF
- A/B-Testing Hero-Headline
- Lighthouse 90+ (aktuell ~70 mobile)

---

**Vollständiger strategischer Plan:** `/Users/lukasfilimon/.claude/plans/so-ich-will-mit-quirky-dragonfly.md`
**Office-Hours Design Doc:** `/Users/lukasfilimon/.gstack/projects/Webseite/lukasfilimon-unknown-design-20260514-120907.md`
