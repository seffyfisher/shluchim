// Blog identity — rename here only.
export const SITE = {
  title: 'שלוחים',
  kicker: '',
  tagline: 'מעשיות על שלוחים ואנשים והחיים המשותפים שלהם',
  author: 'בן',
  // Footer line, in Seffy's voice.
  footerNote: 'כל הזכויות שמורות לספי פישר ולצוות השלוחים שלו שמתעדים את החיים המשותפים',
  lang: 'he',
  dir: 'rtl',
};

// Reading time: Hebrew words per minute (build time only, no client JS).
export const READING_WPM = 180;

// GitHub repo (owner/name) — used for the "עריכה" links. Change on rename.
export const REPO = 'seffyfisher/shluchim';

// Preview mode: SHOW_DRAFTS=1 npm run build  -> drafts are built with a "טיוטה" badge.
// Default build (and CI) never includes drafts.
export const SHOW_DRAFTS = process.env.SHOW_DRAFTS === '1';
