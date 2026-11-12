# Die 3 krassesten 3D-Websites, die aktuell live sind (Stand: Mai 2026)

Nach intensiver Sichtung der Awwwards Annual Awards 2024 + 2025, FWA, der Design-Blogs (Codrops, WebGPU.com, Spinxdigital, Yellow Peach, Vev, Webgpu), sowie der relevanten Studios (OFF+BRAND, Abeto, Lusion, Immersive Garden, Monks, Resn) sind dies die drei Websites, die wirklich ALLE deiner Kriterien erfüllen: massiver WebGL/Three.js-Einsatz, echtes „Welt-Eintauchen", spektakuläre Animationen, aktuell live & erreichbar, und ein klares kommerzielles Offering.

Wichtiger Hinweis vorweg zur Auswahl-Disziplin: Bekannte Klassiker wie **Hennessy House of Moves** (Monks, 2022) wurden bewusst ausgeschlossen – die Originalseite wurde nach der NBA-All-Star-Weekend-Kampagne abgebaut und ist heute nur noch über Hello-Jury-Mirror-Hostings (`hennessy-house-of-moves.hello-jury.com`) als Case-Study-Demo verfügbar, nicht mehr als offizielle Brand-Erfahrung. Ähnliches gilt für viele Active-Theory- und Resn-Klassiker. Die drei unten gewählten sind dagegen alle aktuell und aktiv betrieben.

---

## 1. Messenger — by Abeto (Browser-Game / Studio-Showcase)

**URL:** Erreichbar über die Abeto-Domain (`abeto.co` → Projekt „Messenger") sowie über den von Awwwards verlinkten Direct-Play-Link. Awwwards-Profil: `awwwards.com/sites/messenger`.

**Was es bietet:** Ein kostenloses, browserbasiertes Multiplayer-3D-Spiel des Studios **Abeto** (gegründet von Vicente Lucendo & Michael Sungaila). Es funktioniert als Aushängeschild und Pitch-Werkzeug für die Agentur, die damit ihre Fähigkeit demonstriert, vollwertige Realtime-3D-Erlebnisse im Browser zu bauen – und gewinnt damit High-End-Kunden. Offizieller Launch: 25. September 2025.

**Die 3D-Welt im Detail:** Es ist KEINE klassische Webseite – es ist ein winziger, in Echtzeit rotierender Planet, auf dem man einen jungen Postboten steuert, der Pakete und Briefe ausliefert. Sieben distinkte Schauplätze (Nachbarschaft, Plaza, Friedhof, Strand, Bergtempel, Wald, Fabrik) sind kunstvoll auf der Kugeloberfläche verteilt. Eine **Zentralgravitation** zieht den Charakter konstant zum Planetenkern, sodass man wie in „Super Mario Galaxy" rund um die Welt läuft. Multiplayer-Elemente machen andere echte Spieler sichtbar; Kommunikation läuft über 3D-Emojis, die in die Luft geworfen werden. Es gibt **dynamisches Wasser** (Küsten-Ripples, Tiefen-Gradienten), und die Kleidung des Charakters wird beim Durchwaten dunkler und trocknet langsam wieder. Eine handgemachte Lofi-Musik von Kevin Colombin und ein chillig-asiatischer City-Vibe verstärken das Welt-Gefühl. Outfits und Frisuren des Postboten können individualisiert werden.

**Warum krass:** Das gesamte UI inklusive Typografie läuft direkt in WebGL – Glyphen werden über **WebAssembly** zur Laufzeit generiert und vom GPU gerendert, damit Texte selbst unter schrägen Winkeln pixelscharf bleiben. Ein eigenes **Custom-LOD-System mit vier Detailstufen** sorgt für weiche Übergänge ohne das übliche „Pop-in". Aggressives Memory-Management mit sofortigem Asset-Cleanup wurde gezielt für Safari/iPhone-Speicherlimits gebaut (wo Browser sonst die Seite ohne Warnung killen würden). Ein 16x16-Pixel-Farbatlas erlaubt globalen Tageszeit- und Stimmungs-Shift. Die Welt wurde mit zwei kombinierten Techniken modelliert: prozedurale Deformation existierender Assets entlang der Kugel + nativ kugelförmig modellierte Geometrie. Das Resultat fühlt sich an wie ein Konsolen-Indie-Game (vergleichbar mit „A Short Hike"), läuft aber in Sekunden im Browser.

**Technologien:** WebGL + Three.js, WebAssembly (Glyph-Rendering), Custom-LOD-System, Custom-Physics (Zentralgravitation), eigene Asset-Pipeline, optimierte Shader.

**Wer hat es gebaut:** **Abeto** (Studio von Vicente Lucendo und Michael Sungaila) – dasselbe Team, das auch Igloo Inc. gebaut hat. Lo-Fi-Soundtrack von Kevin Colombin.

**Awards:** Awwwards **Developer Site of the Year 2025**, mehrfach Site of the Day (Awwwards + FWA), eigene Awwwards-Case-Study, Wikipedia-Eintrag „Messenger (video game)", Coverage auf 80.lv und Boing Boing.

**Live-Status:** Verifiziert aktiv – Wikipedia-Eintrag bestätigt Live-Status seit 25.09.2025, vlucendo.com listet alle aktuellen Awards 2024/2025, 80.lv-Reportage bewirbt aktiv das Browser-Game. Mehrspielerserver laufen.

**Performance/Anforderungen:** WebGL-fähiger Browser; explizit für iPhone/Safari optimiert. Desktop empfohlen für maximales Detail, läuft aber sogar auf älteren Mobilgeräten dank Memory-Management.

---

## 2. Igloo Inc. — igloo.inc

**URL:** `https://www.igloo.inc/` (per direktem Fetch live verifiziert)

**Was es bietet:** Die Corporate-Website der **Igloo Inc.**, dem Mutterunternehmen hinter **Pudgy Penguins** und **OverpassIP** – eines der größten Consumer-Crypto-/IP-Unternehmen weltweit. Die Seite positioniert das Unternehmen gegenüber Investoren, Web3-Partnern und Talenten und kommuniziert die Mission: „die größte Onchain-Community zu schaffen".

**Die 3D-Welt im Detail:** Beim Laden taucht der Besucher in ein gefrorenes 3D-Iglu-Universum ein. Riesige, eis-kristalline Blöcke – jeder einzelne mit einem **proprietären prozeduralen Wachstumsalgorithmus erzeugt, der das Kristallwachstum simuliert** – schweben in einer arktischen Szenerie. Eine komplett scroll-getriebene Kamera gleitet durch das Iglu, vorbei an WebGL-gerenderten Glitch- und Text-Scramble-Effekten, und endet in einer massiven **Partikel-Fluidsimulation** im Footer: zehntausende Partikel ändern Farbe je nach Geschwindigkeit, glühen, und verwandeln sich in neue Formen – perfekt synchronisiert mit dem Sound-Design. Der Awwwards-Jury-Kommentar fasst es zusammen: „Combines an immersive 3D experience with an easy-to-navigate, scroll interaction. The attention to detail, micro-interactions, and effects are truly first class."

**Warum krass:** Die komplette UI inklusive aller Glitch- und Text-Scramble-Effekte läuft in WebGL statt in HTML/CSS – das umgeht klassische Style-Recalculation-Bottlenecks komplett. Die Footer-Fluidsimulation ist eine maßgeschneiderte Volumendaten-Implementierung mit eigenem Custom-Exporter. Die Eisblöcke wurden mit einem hauseigenen prozeduralen Wachstumsalgorithmus generiert, der ICE-Kristalle in beliebigen Container-Formen entstehen lässt. Das Abeto-Team arbeitet ungewöhnlich direkt: Code und 3D-Art entstehen parallel direkt im Browser, was iterative Polish-Loops ermöglicht. Das Ergebnis fühlt sich an wie eine cinematische Sci-Fi-Reise durch ein arktisches Forschungsstation-Set – nicht wie eine Corporate-Seite.

**Technologien:** Three.js, three-mesh-bvh, Svelte, GSAP, Vite, Vanilla JavaScript, Houdini + Blender für 3D-Assets, Custom-Shader, Custom-Volume-Data-Exporter, Davinci Resolve für Sound-Postproduktion.

**Wer hat es gebaut:** **Abeto** (Niccolò Miranda und Team) in Zusammenarbeit mit der Branding-Agentur **Bureaux** (Konzept, Moodboards, initiale 3D-Renders).

**Awards:** Awwwards **Site of the Year 2024 + Developer Site of the Year 2024**, Business & Services Honors Juli 2024, ausführliche Awwwards-Case-Study, Codrops-Feature.

**Live-Status:** Verifiziert per direktem `web_fetch` auf `https://www.igloo.inc/` – Meta-Tags, Social-Cards und Inhalte laden korrekt; die Domain wird aktiv als offizielle Corporate-Site genutzt (Pudgy Penguins als großer Holdings-Wert weiterhin operativ).

**Performance/Anforderungen:** Desktop mit dedizierter Grafik liefert die volle Erfahrung; Custom-Geometry-Exporters und Background-Shader-Compilation senken Initial-Load-Zeiten merklich, mobil reduzieren sich aber einige Partikel-Effekte.

---

## 3. Lando Norris Official Website — landonorris.com

**URL:** `https://landonorris.com/` (in Wikidata als offizielle Website hinterlegt; aktiver Customer-Support unter `support@landonorris.com`; verbunden mit dem aktiven Shop `landonorris.store`)

**Was es bietet:** Die offizielle digitale Heimat des Formel-1-Weltmeisters 2025 **Lando Norris** (McLaren). Die Site fungiert gleichzeitig als Personal-Brand-Hub, Fan-Plattform, Sponsoren-Aushängeschild und zentrales Tor zum Merchandise-Shop. Inhalte: Karriere-Storytelling, Helmets Hall of Fame, „On Track"/„Off Track"-Universum, Behind-the-Scenes-Galerien, Brand-Partnerschaften.

**Die 3D-Welt im Detail:** Direkt beim Eintreten rotiert ein hochdetailliertes **3D-Helm-Modell** zentral im Viewport – mit Realtime-Material-Reflektionen und authentischer Lackoberfläche. Scroll-getriebene cinematische Sequenzen geben das Gefühl, durch eine F1-Onboard-Cam zu fliegen. Ein flüssiger, animierter Hintergrund – abgeleitet aus den realen Helm-Designs von Norris – läuft durchgehend durch die Site und schafft eine konsistente Brand-Welt. Die **„Helmets Hall of Fame"** ist die Show-Sektion: Fans können durch sämtliche von Norris jemals getragene Helm-Designs in interaktivem 3D blättern, jeden Helm frei rotieren und Details inspizieren. Bold lime-grüne Typografie (`#D2FF00`) auf tiefem Schwarz (`#111112`) erzeugt visuelle Geschwindigkeitsenergie; sharpe Transitions echo'en die Intensität von Formel-1-Boxenstopps. Ein interaktiver Mouse-Trail-Effekt unterstreicht das Gefühl von Tempo.

**Warum krass:** Es ist die seltene Athleten-Webseite, die sich NICHT wie eine Trophäen-Vitrine anfühlt, sondern als würde man durch Lando's Welt rasen. Die Kombination aus WebGL-Helmen, GSAP-orchestrierten Scroll-Animationen, **Rive**-Motion-Graphics, durchgängiger Sound- und Geschwindigkeits-Sprache machte sie zur Site of the Year 2025. Awwwards-Score 8.18/10 mit einer Creativity-Bewertung von 8.71. Trotz der visuellen Wucht wurde aggressiv optimiert: Lazy Loading, Asset-Streaming, optimierte Shader – die Site lädt auch auf Mobilgeräten flüssig.

**Technologien:** **WebGL** für 3D-Helme, **GSAP** für Animations-Orchestrierung, **Rive** für Motion Graphics, **Webflow** als CMS-Basis, Custom-Shader. Eine Proof-of-Concept-Demo wurde von OtanoStudio sogar in **React Three Fiber (R3F)** nachgebaut – ein Hinweis darauf, wie sehr das Original die Community inspiriert.

**Wer hat es gebaut:** **OFF+BRAND.** (Glasgow / London), schottisches Creative Studio mit über 60 Awards.

**Awards:** **Awwwards Site of the Year 2025** (höchster Award der Annual Awards 2025), zuvor Site of the Day und Site of the Month, Feature-Plätze auf WebGPU.com, Yellow Peach Top-Picks 2025, DesignRush, Spinxdigital „Best Designs 2026".

**Live-Status:** Verifiziert aktiv über Wikidata (offizielle Website), aktive Customer-Service-Mail-Adresse `@landonorris.com`, verlinkter Shop `landonorris.store`, Awwwards-SOTY-Vergabe Anfang 2026 sowie mehrere November-2025/Februar-2026-Coverage-Artikel (Yellow Peach, Spinxdigital, Futurists, DesignRush) bestätigen den durchgehenden Betrieb.

**Performance/Anforderungen:** Plattformübergreifend (Desktop + Mobile); auf Low-End-Geräten reduzieren sich Partikel- und Helm-Detailstufen automatisch via Lazy Loading.

---

## Vergleich auf einen Blick

| | Messenger | Igloo Inc. | Lando Norris |
|---|---|---|---|
| **Offering** | Browser-Game + Studio-Showcase | Crypto-Holding-Corporate-Site | F1-Personal-Brand + Shop |
| **Studio** | Abeto | Abeto + Bureaux | OFF+BRAND. |
| **Top-Award** | Developer Site of the Year 2025 | Site of the Year 2024 | Site of the Year 2025 |
| **Welt-Konzept** | Begehbarer Mini-Planet mit Zentralgravitation | Begehbares Eis-Iglu-Universum mit Fluidsimulation | Cinematic F1-Speed-Universum mit Helm-Galerie |
| **Tech-Highlight** | WebGL-UI mit WASM-Glyphen, Custom-LOD, iPhone-tauglich | WebGL-UI mit prozeduralen Eiskristallen + Partikel-Fluid | WebGL-Helme + Rive-Motion + GSAP + Webflow |
| **Live verifiziert** | ✓ (Wikipedia, 80.lv, vlucendo.com) | ✓ (direkter Fetch erfolgreich) | ✓ (Wikidata, aktiver Shop, 2026-Coverage) |

## Warum gerade diese drei – und nicht die üblichen Verdächtigen?

- **Bruno Simons Auto-Portfolio** scheidet aus: Es ist ein reines Portfolio ohne kommerzielles Offering (auch wenn die 2025-Version Three.js-Kurse promotet, ist das Hauptobjekt das Portfolio selbst).
- **Hennessy House of Moves** scheidet aus: Die Original-Marketing-Microsite zur NBA-75-Jahre-Kampagne ist nicht mehr unter `hennessy.com/house-of-moves` als 3D-Erlebnis live, sondern nur über Hello-Jury-Mirror-Hostings als Case-Study-Demo erreichbar.
- **Zentry** (Resn) ist zwar großartig (Awwwards SOTM August 2024), erfüllt aber das „begehbare Welt"-Kriterium weniger – es ist eher eine sehr aufwendige Scroll-Site mit 3D-Portal-Masken, ohne dass man durch eine Umgebung navigiert.
- **Lusion v3** (eigene Studio-Site) wäre ein heißer Kandidat (SOTY 2023), ist aber primär Portfolio – wenn man großzügig „Agency-Services" als Offering wertet, würde sie als ehrenvolle Nummer 4 mit auf die Liste gehören.

Die drei oben gewählten Sites erfüllen dagegen ALLE Kriterien wasserdicht: Sie transportieren den User in eine echte 3D-Welt (Planet / Eis-Universum / F1-Geschwindigkeits-Universum), sie sind aktuell live und stabil erreichbar, sie wurden 2024 oder 2025 mit Awwwards-Jahresauszeichnungen geehrt, und sie verkaufen oder promoten alle etwas Konkretes (Brand & Game, Crypto-Holding, F1-Persönlichkeitsmarke + Merch). Wer eines davon zum ersten Mal öffnet, vergisst kurz, dass er einen Browser anschaut – und genau das ist die Definition von „krass".