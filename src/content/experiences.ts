export interface Experience {
  id: string;
  title: string;
  videoUrl: string;       // Vimeo embed URL
  videoTitle: string;     // for iframe accessibility
  tagline: string;        // emotionale Anrede (Cormorant Italic)
  description: string;    // konkrete Beschreibung
}

const VIMEO_PARAMS = 'badge=0&autopause=0&player_id=0&app_id=58479&title=0&byline=0&portrait=0&dnt=1&color=c9a84c&playsinline=1';

export const experiences: Experience[] = [
  {
    id: 'money-mind',
    title: 'NOW Money Mind',
    videoUrl: `https://player.vimeo.com/video/1183850610?${VIMEO_PARAMS}`,
    videoTitle: 'NOW Money Mind',
    tagline: 'Ein Tag. Energie von einer anderen Dimension.',
    description:
      'Tagesseminar mit Fokus auf Vertrieb & Mindset. Unser einziges öffentliches Event mit max. 100 Teilnehmern voller Input und Umsetzungen, damit du endlich den Umsatz erreichst, den du verdienst.',
  },
  {
    id: 'dubai-mastermind',
    title: 'NOW Dubai Mastermind',
    videoUrl: `https://player.vimeo.com/video/1183841506?${VIMEO_PARAMS}`,
    videoTitle: 'NOW Dubai Mastermind',
    tagline: 'Eine Woche. Fülle pur.',
    description:
      '7 Tage in denen wir dir zeigen, wie der Weg zu 1 Million Jahresumsatz ausschaut, Aktivitäten wie Safari Tour, VIP Yacht, luxuriöses Abendessen beim Burj Khalifa und ein Netzwerk von bewussten Unternehmern, die wirklich finanziell frei leben wollen.',
  },
  {
    id: 'retreat',
    title: 'NOW Retreat',
    videoUrl: `https://player.vimeo.com/video/1192952941?${VIMEO_PARAMS}`,
    videoTitle: 'NOW Retreat',
    tagline: 'Ein zeitloser Raum. Heilung auf allen Ebenen.',
    description:
      'Tägliche Meditationen. Lebensverändernde Bewusstseinsarbeit. Begegnung mit der Stille. Rückzug zu deinem Kern. Diese Woche heilt deine emotionalen Wunden. Eine Experience mit Gott und deiner Seele.',
  },
];
