export interface Experience {
  id: string;
  title: string;
  videoUrl: string;       // Vimeo embed URL
  videoTitle: string;     // for iframe accessibility
  tagline: string;        // emotionale Anrede (Cormorant Italic)
  description: string;    // konkrete Beschreibung
  highlights: string[];   // 3-4 Diamond-Bullet Stichworte
}

const VIMEO_PARAMS = 'badge=0&autopause=0&player_id=0&app_id=58479&title=0&byline=0&portrait=0&dnt=1&color=c9a84c&playsinline=1';

export const experiences: Experience[] = [
  {
    id: 'dubai-mastermind',
    title: 'Dubai Mastermind',
    videoUrl: `https://player.vimeo.com/video/1183841506?${VIMEO_PARAMS}`,
    videoTitle: 'Dubai Mastermind',
    tagline: 'Eine Woche Dubai. Fülle leben — nicht nur denken.',
    description:
      'Unternehmerische Strategie auf höchstem Niveau, in einem Umfeld, das deine nächste Identität schon verkörpert. Begrenzte Teilnehmeranzahl, exklusiv für unsere Premium-Kunden.',
    highlights: [
      'Strategie auf 6- und 7-stelligem Level',
      'Community von Gleichgesinnten',
      'Persönlich begleitet von Darko',
      'Dubai als Erfahrungsraum',
    ],
  },
  {
    id: 'retreat',
    title: 'Retreat',
    videoUrl: `https://player.vimeo.com/video/1192952941?${VIMEO_PARAMS}`,
    videoTitle: 'Retreat',
    tagline: 'Ein Raum, in dem du nichts werden musst.',
    description:
      'Bewusstseinsarbeit. Stille. Rückzug zu deinem Kern — raus aus der Matrix, zurück in deine Mitte.',
    highlights: [
      'Meditation als tägliche Praxis',
      'Kleiner, geschützter Kreis',
      'Wieder in Verbindung mit dir selbst',
      'Bewusste Stille statt Performance',
    ],
  },
  {
    id: 'money-mind',
    title: 'Money Mind',
    videoUrl: `https://player.vimeo.com/video/1183850610?${VIMEO_PARAMS}`,
    videoTitle: 'Money Mind',
    tagline: 'Ein Tag. Sofort umsetzbare Hebel.',
    description:
      'Tagesseminar mit Fokus Vertrieb. Transformative Energie und konkrete Inhalte — die du am nächsten Tag anwendest.',
    highlights: [
      'Vertriebs-Hebel zum Mitnehmen',
      'Transformative Praxis',
      'Content für sofortige Umsetzung',
    ],
  },
];
