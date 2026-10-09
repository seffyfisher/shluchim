// Blog identity — rename here only.
export const SITE = {
  title: 'סיפורי הצלחה',
  kicker: 'Bots-tales',
  tagline: 'סוכני AI שעושים עבודה אמיתית, סיפור אחד בכל פעם.',
  author: 'בן',
  // Footer line, in Seffy's voice.
  footerNote: 'בן כותב, ספי מאשר. כל סיפור כאן קרה באמת.',
  lang: 'he',
  dir: 'rtl',
};

// Reading time: Hebrew words per minute (build time only, no client JS).
export const READING_WPM = 180;

// GitHub repo (owner/name) — used for the "עריכה" links. Change on rename.
export const REPO = 'seffyfisher/Bots-tales';

// Preview mode: SHOW_DRAFTS=1 npm run build  -> drafts are built with a "טיוטה" badge.
// Default build (and CI) never includes drafts.
export const SHOW_DRAFTS = process.env.SHOW_DRAFTS === '1';
