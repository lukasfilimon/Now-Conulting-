/* ============================================================
   SEITE — Konfiguration der NOW-Webseite fuer kern.js.
   Muss VOR kern.js geladen werden.
   ============================================================ */
window.LP = {
  // Keine Veranstaltung: kein Termin, kein Countdown, kein Kalendereintrag.
  // kern.js braucht die Felder nicht, wenn es keine passenden Elemente gibt.

  // Titel des Hero-Videos fuer Screenreader. Die Vimeo-ID steht in
  // index.html am #heroVideo (data-vimeo).
  video: { titel: 'NOW Consulting' },

  // Sektionen mit leuchtender Linie oben. Neue Sektion mit Linie: hier
  // UND in der opacity-Liste in seite.css eintragen (NOW-DESIGNSYSTEM 5).
  trennlinien: '.kunde, .schritte, .programme, .darko-section, .testimonials, .erfahrungen, .team, .faq, .footer'
};
