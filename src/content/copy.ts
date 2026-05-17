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
      'Die einzige ',
      { italic: true, text: 'spirituelle' },
      ' Unternehmensberatung im DACH-Raum',
    ],
    sub: 'Für Coaches und Berater im 5- bis 6-stelligen Bereich, die ihre innere Arbeit und ihren unternehmerischen Erfolg nicht länger trennen wollen.',
    cta: 'Erstgespräch buchen',
  },

  manifest: {
    headline: 'Erfolg im Außen beginnt mit Freiheit im Innen.',
    body: [
      'Ich glaube nicht an Hustle. Ich glaube nicht an Performance auf Kosten der Seele. Und ich glaube auch nicht an „nur Energie" ohne Strategie.',
      'Wir führen zwei Welten zusammen, die sonst getrennt bleiben: Bewusstsein und Business. Spiritualität und Unternehmertum. Energie und Zahlen.',
      'Weil das eine ohne das andere nicht trägt. Geld ohne Bewusstsein macht leer. Bewusstsein ohne Geld macht abhängig. Wir machen beides — gleichzeitig.',
    ],
    signatureName: 'Darko Krstic',
    signatureTitle: 'Gründer NOW Consulting',
  },

  audience: {
    eyebrow: 'FÜR WEN WIR ARBEITEN',
    headline: 'Du weißt, dass beides zusammen gehört. Dein Geschäft weiß es noch nicht.',
    before: {
      label: 'Vor der Zusammenarbeit',
      subline: 'Was du heute spürst.',
      items: [
        'Du predigst Fülle und schaust nervös auf dein Bankkonto.',
        'Dein Coaching hat Substanz — aber dein Business hat keine Struktur.',
        'Du verkaufst dich unter Wert, weil Verkaufen sich für dich falsch anfühlt.',
      ],
    },
    after: {
      label: 'Nach der Zusammenarbeit',
      subline: 'Was möglich wird.',
      items: [
        'Du führst dein Unternehmen aus deiner Mitte.',
        'Du verkaufst aus Klarheit, nicht aus Druck.',
        'Deine Zahlen spiegeln dein Inneres — nicht deinen Wert.',
      ],
    },
  },

  approach: {
    eyebrow: 'UNSER WEG',
    headline: { plain: 'Neun Felder.', italic: 'Zwei Welten.' },
    labels: { inner: 'Im Innen', outer: 'Im Außen' },
    stations: [
      {
        number: '01',
        title: 'Bewusstseinsarbeit',
        icon: 'eye',
        inner: 'Identität klären. Glaubenssätze über Geld, Wert und Verkauf auflösen.',
        outer: 'Aus Hustle wird Klarheit. Entscheidungen aus deiner Mitte statt aus Angst.',
      },
      {
        number: '02',
        title: 'Meditation',
        icon: 'lotus',
        inner: 'Stille als tägliche Praxis. Zugang zur eigenen Klarheit und Quelle.',
        outer: 'Fokus-Reset. Du führst aus Energie und Klarheit, nicht aus Erschöpfung.',
      },
      {
        number: '03',
        title: 'Geschäftsmodell',
        icon: 'pyramid',
        inner: 'Klarheit über das, was du wirklich willst — und warum.',
        outer: 'Skalierbares Setup. Recurring Revenue. Premium statt Stundensatz.',
      },
      {
        number: '04',
        title: 'Positionierung',
        icon: 'target',
        inner: 'Mut zur Nische. Polarisieren statt gefallen wollen.',
        outer: 'Definierter Avatar. Sichtbare Differenzierung am Markt.',
      },
      {
        number: '05',
        title: 'Angebot',
        icon: 'stack',
        inner: 'Selbstwert vor Preis. Was du wirklich wert bist.',
        outer: 'Premium-Pricing. Klare Pakete. Hochpreis-Architektur.',
      },
      {
        number: '06',
        title: 'Vertrieb',
        icon: 'handshake',
        inner: 'Verkauf als Wahrheit. Kein Druck. Keine Manipulation.',
        outer: 'Reproduzierbarer Sales-Prozess. Akquise. Closing-Praxis.',
      },
      {
        number: '07',
        title: 'Marketing',
        icon: 'waves',
        inner: 'Mut zur Sichtbarkeit. Mission verkörpern statt vermarkten.',
        outer: 'Content, Funnel und Reichweite, die qualifizierte Anfragen produziert.',
      },
      {
        number: '08',
        title: 'Backoffice',
        icon: 'gear',
        inner: 'Loslassen können. Vertrauen in das System.',
        outer: 'Tools, Prozesse, KI. Automation der wiederkehrenden Aufgaben.',
      },
      {
        number: '09',
        title: 'Mitarbeiter',
        icon: 'network',
        inner: 'Führung aus Klarheit. Verantwortung teilen, nicht abgeben.',
        outer: 'Recruiting, Onboarding, Leadership-Struktur — ohne dich.',
      },
    ],
  },

  experiences: {
    eyebrow: 'ERLEBNISSE',
    headline: { plain: 'Drei Räume jenseits', italic: 'der Beratung.' },
    sub: 'Wo unsere Kunden sich begegnen, wachsen und auftanken.',
  },

  team: {
    eyebrow: 'WER WIR SIND',
    headline: 'Vier Menschen. Eine Mission.',
  },

  stimmen: {
    eyebrow: 'ERGEBNISSE',
    headline: { plain: 'Was sich verändert hat —', italic: 'in den Worten unserer Kunden.' },
  },

  faq: {
    eyebrow: 'HÄUFIGE FRAGEN',
    headline: 'Hier sind die ehrlichen Antworten.',
  },

  finalCta: {
    eyebrow: 'DEIN MOMENT',
    headline: { plain: 'Du hast bis hier gelesen.', italic: 'Das ist kein Zufall.' },
    sub: 'Kein Pitch. Kein Skript. Wir hören dich, du hörst uns — danach wissen beide, ob es passt.',
    button: 'Termin auswählen',
    trust: '1:1 Gespräch · Unverbindlich · Kostenlos',
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
