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
    id: 'stabilisierungsphase',
    phaseHeadline: 'Die Stabilisierungsphase',
    startsAt: '0 €',
    targetRevenue: '10.000 €',
    timeframe: 'in 3 bis 6 Monaten',
    tagline:
      'Du möchtest von deiner Selbstständigkeit finanziell stabil leben, deinen Kunden mit vollem Fokus dienen und dir keine Sorgen mehr über anstehende Rechnungen machen.',
    description:
      'Wir bauen mit dir gemeinsam das Fundament, damit du jeden Monat min. 10.000 € Umsatz generierst:',
    inclusions: [
      {
        title: 'Zielgruppe & Positionierung',
        description:
          'Klare Analyse, wer dein Kunde ist, was sein größter Schmerz ist und wie du ihm wirklich weiterhelfen kannst.',
      },
      {
        title: 'Angebotsstruktur',
        description:
          'Premium-Preise, mit einem aufbauenden UpSell System und Cross Sellings, die sich von selbst verkaufen.',
      },
      {
        title: 'Vertriebssystem',
        description:
          'Eine funktionierende Lead-Quelle, aus der du pro Monat min. 3-5 Neukunden generierst und endlich planbaren Umsatz erschaffst.',
      },
      {
        title: 'Mindset & Bewusstsein',
        description:
          'Wöchentliche Live Calls mit Darko, die dein Bewusstsein von der Illusion des Mangels befreien und Meditationen, die dich spüren lassen, wer du wirklich bist.',
      },
      {
        title: '1-zu-1-Begleitung',
        description:
          'Persönliche Betreuung durch deinen eigenen Kundenberater in 1-1 Calls und täglichem WhatsApp Support.',
      },
    ],
  },
  {
    id: 'skalierungsphase',
    phaseHeadline: 'Skalierungsphase',
    startsAt: '10.000 €',
    targetRevenue: '100.000 €',
    timeframe: 'in 12 Monaten',
    tagline:
      'Du möchtest finanziell frei leben, Mitarbeiter einstellen und das kollektive Bewusstsein von der Matrix befreien.',
    description:
      'Wir zeigen dir den Weg vom Selbstständigen, der in seiner eigenen Matrix gefangen ist, zum Unternehmer, der mit seinen Mitarbeitern finanzielle Freiheit erreicht.',
    inclusions: [
      {
        title: 'Mitarbeiter einstellen',
        description:
          'Recruiting ohne Headhunter. Vom Inserat, über das Onboarding bis zur Vertriebsschulung, wir unterstützen dich beim gesamten Bewerbungsprozess.',
      },
      {
        title: 'Leadership',
        description:
          'Führe deine Mitarbeiter aus dem Herzen, mit echten Werten und einer Unternehmenskultur, die auf Loyalität und Integrität beruht.',
      },
      {
        title: 'Neue Vertriebsmechanik',
        description:
          'Du übergibst Schritt für Schritt den Vertriebsprozess an deine Mitarbeiter, um mehr Zeit für deine Kunden & die Entwicklung deines Unternehmens zu haben.',
      },
      {
        title: 'Künstliche Intelligenz',
        description:
          'Automatisierungen und Prozesse werden an die KI abgegeben, die wir selbstverständlich mit dir gemeinsam individuell nach deinen Wünschen einstellen.',
      },
      {
        title: 'Exklusive Events',
        description:
          'Du arbeitest intensiv mit Darko in exklusiven Retreats & Masterminds an deinem Mindset und gehst tiefer in die Lehre der Meditation.',
      },
    ],
  },
];
