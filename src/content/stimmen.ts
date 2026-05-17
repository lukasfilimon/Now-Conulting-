export interface Testimonial {
  id: string;
  name: string;
  role: string;
  videoId: string;  // Vimeo Video ID
}

const VIMEO_PARAMS = 'badge=0&autopause=0&player_id=0&app_id=58479&title=0&byline=0&portrait=0&vimeo_logo=0&color=c9a84c&quality=1080p';

export function vimeoEmbedUrl(videoId: string): string {
  return `https://player.vimeo.com/video/${videoId}?${VIMEO_PARAMS}`;
}

/**
 * Video-Testimonials für die Stimmen-Section.
 * Aufgeteilt auf 2 Marquee-Reihen (rowOne / rowTwo).
 */
export const testimonialsRowOne: Testimonial[] = [
  { id: 'nenad',    name: 'Nenad Stefanovic', role: 'CEO von Relief Massage',  videoId: '1179332168' },
  { id: 'andrea',   name: 'Andrea Bryda',     role: 'Fitnesstrainerin',        videoId: '1179331518' },
  { id: 'gabriele', name: 'Gabriele Ehm',     role: 'Coachin für Selbstheilung', videoId: '1179331896' },
  { id: 'patrick',  name: 'Patrick Farkas',   role: 'Mentaltrainer',           videoId: '1179332386' },
];

export const testimonialsRowTwo: Testimonial[] = [
  { id: 'elisabeth', name: 'Elisabeth Lick',     role: 'Coachin für Gesundheit', videoId: '1179331719' },
  { id: 'jonathan',  name: 'Jonathan Fischer',   role: 'Mentaltrainer',           videoId: '1179332017' },
  { id: 'nikolay',   name: 'Nikolay Gueorguiev', role: 'Speditionsleiter',        videoId: '1179332282' },
  { id: 'bunyamin',  name: 'Bünyamin Ali Deniz', role: 'Finanzunternehmer',       videoId: '1179331624' },
];
