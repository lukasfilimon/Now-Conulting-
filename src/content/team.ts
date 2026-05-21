export interface TeamMember {
  name: string;
  role: string;
  bio: string;
  initials: string;
  photoUrl?: string; // optional — falls Foto vorhanden
}

export const team: TeamMember[] = [
  {
    name: 'Darko Krstic',
    role: 'Gründer & CEO',
    bio: '2021 hat Darko das Unternehmen mit der Intention gegründet, Selbstständigen zu helfen, emotional und finanziell frei zu leben, indem sie durch Meditation, Bewusstseinsarbeit und authentischen Vertrieb ihre gewünschten Umsätze in Rekordzeit erreichen und dadurch unabhängig von der Matrix sind.',
    initials: 'DK',
    photoUrl: '/images/Darko%20Bild.jpeg',
  },
  {
    name: 'Denise Krstic',
    role: 'Operations & Events',
    bio: 'Sie ist seit ihrem 17. Lebensjahr an der Seite von Darko. Denise hält den Raum, in dem alles passiert. Korrespondenz, administrative Tätigkeiten und Organisation unserer Events.',
    initials: 'DK',
    photoUrl: '/images/Denise%20Bild.jpeg',
  },
  {
    name: 'Stefan Pfeifer',
    role: 'Vertriebsleiter',
    bio: 'Als ehemaliger Profifußballer und Kunde von Darko hat er die Werte von NOW zu 100% integriert. Verkaufen bedeutet für Stefan ausschließlich ehrlich zu kommunizieren, authentisch aufzutreten und das beste Ergebnis für den Kunden zu erschaffen.',
    initials: 'SP',
    photoUrl: '/images/Stefan%20Bild.jpeg',
  },
  {
    name: 'Lukas Filimon',
    role: 'Kundenberater',
    bio: 'Auch er ist ein ehemaliger Kunde von Darko, hat über 5 Jahre Erfahrung als Closer & Vertriebstrainer. Lukas begleitet unsere Kunden in 1-1 Calls und WhatsApp Support zu ihren gewünschten Zielen.',
    initials: 'LF',
    photoUrl: '/images/Lukas%20Bild.jpg',
  },
];
