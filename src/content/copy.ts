/**
 * Brand voice content for NOW Consulting.
 * Update only here — sections read these constants.
 */

// CTA destination: Calendly URL fills in later. Auto-fallback to mailto.
const CALENDLY_URL = ''; // ← Wenn URL kommt, hier eintragen
const FALLBACK_MAILTO =
  'mailto:office@now-academy.at?subject=Erstgespr%C3%A4ch%20buchen&body=Hallo%20NOW-Team%2C%20ich%20m%C3%B6chte%20ein%20Erstgespr%C3%A4ch%20buchen.';

export const cta = {
  primaryHref: CALENDLY_URL || FALLBACK_MAILTO,
  primaryLabel: 'Erstgespräch buchen',
  isCalendly: Boolean(CALENDLY_URL),
};

export const copy = {
  hero: {
    eyebrow: 'NOW CONSULTING',
    // Italic em-tag marks the key word in gold
    headlineParts: [
      'Die einzige spirituelle Unternehmensberatung im DACH-Raum, die dich vom ',
      { italic: true, text: 'Coach' },
      ' zum Unternehmer macht.',
    ],
    sub: 'Für Coaches und Berater im 5- bis 6-stelligen Bereich, die ihre innere Arbeit und ihren unternehmerischen Erfolg nicht länger trennen wollen.',
    cta: 'Erstgespräch buchen',
  },

  manifest: {
    paragraphs: [
      'Die meisten Coaches scheitern nicht an Skills, nicht an Funnels, nicht an Werbeanzeigen. Sie scheitern an der Trennung zwischen dem, was sie ihren Kunden predigen, und dem, was sie in ihrem eigenen Business leben.',
      'NOW schließt diese Lücke.',
      'Wir verbinden tiefe Bewusstseinsarbeit mit den klarsten Vertriebs- und Skalierungs-Systemen im DACH-Raum. Das Ergebnis ist nicht nur „mehr Umsatz". Das Ergebnis ist ein Unternehmen, das deinem Wesen entspricht — und genau deshalb wächst.',
    ],
  },

  audience: {
    eyebrow: 'FÜR WEN WIR ARBEITEN',
    headline: 'Du weißt, dass beides zusammen gehört. Dein Geschäft weiß es noch nicht.',
    before: {
      label: 'Heute',
      items: [
        'Du predigst Fülle und schaust nervös auf dein Bankkonto.',
        'Dein Coaching hat Substanz — aber dein Business hat keine Struktur.',
        'Du verkaufst dich unter Wert, weil Verkaufen sich für dich falsch anfühlt.',
      ],
    },
    after: {
      label: 'Mit NOW',
      items: [
        'Du führst dein Unternehmen aus deiner Mitte.',
        'Du verkaufst aus Klarheit, nicht aus Druck.',
        'Deine Zahlen spiegeln dein Inneres — nicht deinen Wert.',
      ],
    },
  },

  approach: {
    eyebrow: 'UNSER WEG',
    headline: { plain: 'Vier Stationen.', italic: 'Eine Reise.' },
    stations: [
      {
        number: '01',
        title: 'Bewusstsein',
        body: 'Identität, Selbstwert, Mindset über Preise. Hier beginnt alles.',
      },
      {
        number: '02',
        title: 'Vertrieb',
        body: 'Premium-Pricing, Verkauf als Wahrheit, tägliche Praxis.',
      },
      {
        number: '03',
        title: 'Struktur',
        body: 'Team, Prozesse, Mitarbeiter einstellen und führen.',
      },
      {
        number: '04',
        title: 'Manifestation',
        body: 'Reichweite, Wirkung, Freiheit. Die äußere Form.',
      },
    ],
  },

  experiences: {
    eyebrow: 'ERLEBNISSE',
    headline: 'Die Räume, in denen Coaches zu Unternehmern werden.',
    sub: 'Eine Woche. Maximal zehn Teilnehmer. Bewusstseinsarbeit, Strategie und Erlebnis in einem Raum. Die nächste Retreat-Reihe ONE startet bald — Details im Erstgespräch.',
  },

  team: {
    eyebrow: 'WER WIR SIND',
    headline: 'Vier Menschen. Eine Mission.',
  },

  stimmen: {
    eyebrow: 'ERGEBNISSE',
    headline: 'Was sich verändert hat — in den Worten unserer Kunden.',
  },

  faq: {
    eyebrow: 'HÄUFIGE FRAGEN',
    headline: 'Bevor du ein Erstgespräch buchst.',
  },

  finalCta: {
    headline: { plain: 'Wenn du spürst,', italic: 'dass dieser Schritt deiner ist.' },
    sub: 'Buche dein kostenloses Erstgespräch. 15 Minuten. Ehrlich. Ohne Verkaufs-Theater.',
    button: 'Erstgespräch buchen',
  },

  footer: {
    tagline: 'Bewusstsein. Unternehmertum. Ein Weg.',
    address: 'NOW Coaching Service FZCO · Dubai Silicon Oasis, Building A2 · Dubai',
    email: 'office@now-academy.at',
    legal: [
      { label: 'Impressum', href: '/impressum' },
      { label: 'Datenschutz', href: '/datenschutz' },
      { label: 'AGB', href: '/agb' },
    ],
    social: [
      { label: 'Instagram', href: 'https://www.instagram.com/darko_krstic_/' },
    ],
  },
};
