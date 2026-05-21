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
  primaryLabel: 'Klarheitsgespräch buchen',
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
    sub: 'Für Coaches, Trainer und Berater, die Bewusstsein & Business in einem einheitlichen Kontext vereinen möchten.',
    cta: 'Klarheitsgespräch buchen',
  },

  manifest: {
    headline: 'Dein Kontostand spiegelt deine Frequenz.',
    body: [
      'Darko Krstic ist Unternehmer, Trainer und Gründer von NOW. Er steht für eine Art von Unternehmensführung, die sich klar, ethisch und kraftvoll anfühlt — weil sie aus dem Bewusstsein kommt, nicht aus der Manipulation.',
      'In den letzten 6 Jahren hat Darko über 1.000 Coaches, Berater und Trainer begleitet — nicht nur zu finanziellen Zielen, sondern zu echter innerer Freiheit. Sein Ansatz: Wer seine energetischen Blockaden rund um Geld, Führung und Kontrolle nicht löst, wird sein Business nie wirklich skalieren.',
      'Darko verbindet Bewusstseinsarbeit mit einem unternehmerischen System. Sein Anspruch ist simpel: Reichtum im Außen beginnt mit Freiheit im Innen. Oder wie er sagt: „Du kannst nicht manifestieren, was du innerlich nicht für möglich hältst."',
      'Darko hat mit der NOW Consulting die einzige Unternehmensberatung im DACH-Raum gegründet, die erfolgreich Unternehmertum & Spiritualität verbindet.',
    ],
    signatureName: 'Darko Krstic',
    signatureTitle: 'Gründer & CEO der NOW Consulting',
  },

  audience: {
    eyebrow: 'FÜR WEN WIR ARBEITEN',
    headline: 'Wer ist unser Kunde?',
    sub: 'Coaches, Trainer und Berater, die dem Licht dienen und finanziell frei leben möchten:',
    before: {
      label: 'Deine momentane Realität',
      items: [
        'Du verkaufst dein Angebot für einen zu niedrigen Preis.',
        'Du weißt nicht, von wo deine nächsten Kunden kommen.',
        'Du hast unbewusst noch eine mentale Blockade gegen Mitarbeiter.',
      ],
    },
    after: {
      label: 'Deine Wunsch Realität',
      items: [
        'Du machst konstant fünf bis sechsstellige Monatsumsätze.',
        'Du hast einen planbaren & skalierbaren Neukunden-Funnel.',
        'Du hast 1-3 Mitarbeiter, die mit dir an deiner Mission arbeiten.',
      ],
    },
  },

  approach: {
    eyebrow: 'UNSERE INHALTE',
    headline: { plain: '7 Schritte zu', italic: 'deiner ersten Million.' },
    stations: [
      {
        number: '01',
        title: 'Bewusstseinsarbeit',
        image: '/images/schritt-1.jpg',
        focus: 'center',
        text: 'Durch wöchentliche Live Calls in einem Inner Circle und geführte Meditationen zeigt dir Darko, wie du einen neuen Bewusstseinszustand aus der Fülle erschaffst, um dir dadurch in Rekordzeit deine gewünschte Realität zu manifestieren.',
      },
      {
        number: '02',
        title: 'Zielgruppe',
        image: '/images/schritt-2.jpg',
        focus: 'center',
        text: 'Du wirst gemeinsam mit deinem persönlichen Kundenberater deine Zielgruppe detaillierter durchleuchten, um den Schmerz, den du mit & für deine Kunden löst, genau zu verstehen und klarer im Marketing zu kommunizieren.',
      },
      {
        number: '03',
        title: 'Angebote',
        image: '/images/schritt-3.jpg',
        focus: 'center 22%',
        text: 'Außerdem baust du in deinen 1-1 Beratungen ein UpSell System auf, das dir helfen wird, langfristig mit deinen Kunden zusammenzuarbeiten und dadurch konstant fünf bzw. sechsstellige Monatsumsätze zu generieren.',
      },
      {
        number: '04',
        title: 'Vertriebsprozess',
        image: '/images/schritt-4.jpg',
        focus: 'center',
        text: 'Das ist der Hauptkern unserer Zusammenarbeit. Wir erstellen mit dir gemeinsam einen individuellen Vertriebsprozess, damit du endlich planbaren Umsatz generierst und dir keine Sorgen mehr machen musst, von wo deine nächsten Kunden kommen.',
      },
      {
        number: '05',
        title: 'Marketing',
        image: '/images/schritt-5.jpg',
        focus: 'center',
        text: 'Des Weiteren unterstützen wir dich bei deinem authentischen Social Media Auftritt. Wir helfen dir beim Aufbau deines Kanals, schalten mit dir ADs und bauen gemeinsam einen Inbound Kanal auf, damit du wöchentlich neue Anfragen erhältst.',
      },
      {
        number: '06',
        title: 'Backoffice',
        image: '/images/schritt-6.jpg',
        focus: 'center 28%',
        text: 'Damit du sauber und ordentlich arbeiten kannst, erstellen wir mit dir dein CRM System, damit du alle Kontaktdaten der Leads, Zahlungseingänge deiner Kunden und alle weiteren Zahlen klar im Überblick hast.',
      },
      {
        number: '07',
        title: 'Mitarbeiter',
        image: '/images/schritt-7.jpg',
        focus: 'center',
        text: 'Sobald du min. 10.000 € pro Monat umsetzt, schalten wir mit dir gemeinsam das Inserat für deinen ersten Vertriebsmitarbeiter, beraten dich im Bewerbungs- und Onboarding-Prozess und sobald dein erster Mitarbeiter im Vertrieb eingestellt ist, übernehmen wir seine Einschulungen und betreuen ihn in individuellen 1-1 Calls.',
      },
    ],
  },

  experiences: {
    eyebrow: 'LIVE EVENTS',
    headline: { plain: 'Erfahrungen, die dich & dein Business', italic: 'transformieren.' },
    sub: '',
  },

  team: {
    eyebrow: 'WER WIR SIND',
    headline: 'Vier Menschen. Eine Mission.',
  },

  stimmen: {
    eyebrow: 'TESTIMONIALS',
    headline: { plain: 'Was sich in der Zusammenarbeit mit NOW verändert hat —', italic: 'in ehrlichen Worten unserer Kunden.' },
  },

  faq: {
    eyebrow: 'HÄUFIGE FRAGEN',
    headline: 'Hier sind die ehrlichen Antworten.',
  },

  finalCta: {
    eyebrow: 'JETZT IST DEIN MOMENT',
    headline: { plain: 'Wenn du den Ruf spürst,', italic: 'melde dich bei uns.' },
    sub: 'Kein manipulativer Pitch. Kein 0815-Skript. Wir hören dich, du hörst uns — danach wissen beide Seiten, ob es passt.',
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
