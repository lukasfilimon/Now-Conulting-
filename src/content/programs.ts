export interface Inclusion {
  title: string;
  description: string;
}

export interface Program {
  id: string;
  phaseHeadline: string;        // z.B. "Aufbau-Phase"
  startsAt: string;              // z.B. "0 €"
  targetRevenue: string;         // z.B. "10.000 €"
  timeframe: string;             // z.B. "in 3 bis 6 Monaten"
  tagline: string;               // Pain-zentrierte emotionale Anrede
  description: string;           // Was wir konkret tun
  inclusions: Inclusion[];       // 5 Module mit Title + Description
}

export const programs: Program[] = [
  {
    id: 'aufbau-phase',
    phaseHeadline: 'Aufbau-Phase',
    startsAt: '0 €',
    targetRevenue: '10.000 €',
    timeframe: 'in 3 bis 6 Monaten',
    tagline:
      'Du hast den Drive, vielleicht erste Kunden — aber dir fehlt die Strategie, der klare Weg von der Idee zum funktionierenden System.',
    description:
      'Wir bauen mit dir das Fundament: Positionierung, Angebot, Vertrieb. Du gehst die nächsten Jahre auf solidem Boden.',
    inclusions: [
      {
        title: 'Zielgruppe & Positionierung',
        description:
          'Klare Analyse, wer dein Mensch ist, was er wirklich braucht und warum gerade du.',
      },
      {
        title: 'Angebotsstruktur',
        description:
          'Ein durchdachter Verkaufsprozess mit Premium-Preisen, die du selbstverständlich aussprichst.',
      },
      {
        title: 'Vertriebssystem',
        description:
          'Eine funktionierende Lead-Quelle, mit der du authentisch verkaufst — ohne Pitch, ohne Druck.',
      },
      {
        title: 'Mindset & Bewusstsein',
        description:
          'Die innere Stabilität, die jedes externe System überhaupt erst trägt.',
      },
      {
        title: '1-zu-1-Sparring',
        description:
          'Persönliche Strategie-Calls mit deinem NOW-Berater, abgestimmt auf deinen Stand.',
      },
    ],
  },
  {
    id: 'skalierung-phase',
    phaseHeadline: 'Skalierung-Phase',
    startsAt: '10.000 €',
    targetRevenue: '100.000 €',
    timeframe: 'in 12 Monaten',
    tagline:
      'Du verkaufst schon, du hast eine Marke — aber du bist der Engpass, und du kennst den Weg zum nächsten Level noch nicht.',
    description:
      'Wir öffnen den Hebel: Team, Struktur, neue Vertriebsmechanik. Du wirst Unternehmer — nicht mehr Selbstständiger.',
    inclusions: [
      {
        title: 'Mitarbeiter einstellen',
        description:
          'Recruiting ohne Headhunter. Die richtigen Menschen an den richtigen Platz.',
      },
      {
        title: 'Leadership aus dem Herzen',
        description:
          'Führen ohne Druck, mit Klarheit, Präsenz und einer Kultur, die auch ohne dich trägt.',
      },
      {
        title: 'Neue Vertriebsmechanik',
        description:
          'Upselling, Cross-Selling und ein Closer-Team, das auch ohne dich abschließt.',
      },
      {
        title: 'Systeme & Backoffice',
        description:
          'CRM, Automatisierung und Prozesse, die dir den Kopf freihalten.',
      },
      {
        title: 'Inner Circle',
        description:
          'Kleiner Kreis aus Unternehmern auf demselben Level. Sparring auf Augenhöhe.',
      },
    ],
  },
];
