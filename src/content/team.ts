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
    bio: 'Vom Mentaltrainer zum Unternehmer. Lebt die Integration spiritueller Tiefe und unternehmerischer Schärfe seit über zehn Jahren.',
    initials: 'DK',
    photoUrl: '/images/Darko%20Bild.jpeg',
  },
  {
    name: 'Denise Krstic',
    role: 'Operations & Events',
    bio: 'Hält den Raum, in dem alles passiert. Operative Architektur und Retreat-Organisation.',
    initials: 'DK',
    photoUrl: '/images/Denise%20Bild.jpeg',
  },
  {
    name: 'Stefan Pfeifer',
    role: 'Vertriebsleiter',
    bio: 'Ehemaliger Profisportler. Verkaufen ist für ihn Disziplin und Wahrheit.',
    initials: 'SP',
    photoUrl: '/images/Stefan%20Bild.jpeg',
  },
  {
    name: 'Lukas Filimon',
    role: 'Key-Account-Manager',
    bio: 'Begleitung im Salesforce-Programm. Tiefe in der Beratung, Klarheit im Prozess.',
    initials: 'LF',
    photoUrl: '/images/Lukas%20Bild.jpg',
  },
];
