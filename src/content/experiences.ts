export interface Experience {
  id: string;
  title: string;
  meta: string;
  description: string;
}

export const experiences: Experience[] = [
  {
    id: 'one',
    title: 'Retreat-Reihe ONE',
    meta: '1 Woche · max. 10 Teilnehmer · vor Ort',
    description:
      'Bewusstseinsarbeit, unternehmerische Strategie und Erlebnis in einem Raum. Konkrete Termine besprechen wir im Erstgespräch.',
  },
  {
    id: 'mastermind',
    title: 'Mastermind',
    meta: 'Premium-Format · ausschließlich für aktive Programm-Teilnehmer',
    description:
      'Geschlossener Kreis. Tiefe Strategie-Arbeit auf höchstem Niveau, in der Energie eines Raumes, der nur durch Bewusstsein entsteht.',
  },
  {
    id: 'seminare',
    title: 'Seminare',
    meta: 'Halbtages- bis Wochenend-Formate · in Salzburg, Wien oder Dubai',
    description:
      'Klar fokussierte Räume zu Vertrieb, Bewusstsein und Skalierung. Eintritt nur über Empfehlung oder Programm-Mitgliedschaft.',
  },
];
