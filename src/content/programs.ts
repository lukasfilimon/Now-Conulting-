export interface Program {
  id: string;
  name: string;
  duration: string;
  tagline: string;
  description: string;
  inclusions: string[];
}

export const programs: Program[] = [
  {
    id: 'salesforce',
    name: 'Salesforce',
    duration: '6 Monate · 1:1-Begleitung',
    tagline: 'Für Coaches und Berater, die ihre Positionierung und ihren Vertrieb auf ein höheres Niveau heben wollen.',
    description:
      'Sechs Monate intensive Begleitung mit deinem persönlichen Kundenberater. Du baust ein Geschäft, das aus deiner Substanz wächst — mit Vertriebsprozessen, die sich nicht falsch anfühlen.',
    inclusions: [
      'Positionierung & Sichtbarkeit',
      'Premium-Vertrieb & Pricing',
      'Selbstwert-Arbeit',
      'Klare Kommunikation',
      'Unternehmerische Struktur',
    ],
  },
  {
    id: 'leadership-mastery',
    name: 'Leadership Mastery',
    duration: '12 Monate · 1:1-Begleitung mit CEO und Mitarbeiter',
    tagline: 'Für Coaches, Berater und Unternehmer, die führen statt selbst zu coachen — und ihr Geschäft skalieren wollen.',
    description:
      'Zwölf Monate Begleitung auf der Ebene, auf der aus einem Selbstständigen ein Unternehmer wird. Du wirst zur führenden Kraft deines Unternehmens, statt selbst der Engpass zu sein.',
    inclusions: [
      'Unternehmerische Identität',
      'Team-Aufbau & Recruiting',
      'Mitarbeiterführung',
      'Vertriebssystem',
      'Skalierungs-Architektur',
    ],
  },
];
