// Blog identity — rename here only.
export const SITE = {
  title: 'שלוחים',
  displayTitle: 'שְׁלוּחִים',
  kicker: '',
  tagline: '״שלוחו של אדם כמותו״ | מעשיות על שלוחים מבוססי שפה ואנשים בשר ודם',
  author: 'בן',
  // Footer line, in Seffy's voice.
  footerNote: 'כל הזכויות שמורות לספי פישר ולצוות השְׁלוּחִים שלו שמתעדים את החיים המשותפים',
  lang: 'he',
  dir: 'rtl',
};

// Reading time: Hebrew words per minute (build time only, no client JS).
export const READING_WPM = 180;

// English identity (served under /en/). Tagline + explainer approved by Seffy; other strings from the approved handoff (site-strings.json).
export const SITE_EN = {
  title: 'Shluchim',
  displayTitle: 'Shluchim',
  kicker: '',
  tagline: '"A person\'s emissary is as the person himself" | Tales of language-model emissaries and flesh-and-blood people',
  // One-line explanation of the name, shown under the English masthead.
  explainer: "Shluchim is Hebrew for 'emissaries': the AI helpers who do real work for me.",
  author: 'Ben',
  footerNote: 'All rights reserved to Seffy Fisher and his team of shluchim, who document the life they share.',
  lang: 'en',
  dir: 'ltr',
};

export const SITES = { he: { ...SITE, explainer: '' }, en: SITE_EN } as const;

// Pre-launch: the Hebrew pages show no language switcher until Seffy approves the English launch,
// so the Hebrew site stays visually unchanged. English pages always link back to Hebrew.
// Flip to true at launch.
export const SHOW_SWITCHER_ON_HE = true; // launched 2026-10-10 (nav D1 EN slot)

// GitHub repo (owner/name) — used for the "עריכה" links. Change on rename.
export const REPO = 'seffyfisher/shluchim';

// Preview mode: SHOW_DRAFTS=1 npm run build  -> drafts are built with a "טיוטה" badge.
// Default build (and CI) never includes drafts.
export const SHOW_DRAFTS = process.env.SHOW_DRAFTS === '1';

// Feedback block (Supabase Edge Function URL, e.g. https://<ref>.supabase.co/functions/v1/feedback).
// Empty = the block is not rendered at all. Env FEEDBACK_ENDPOINT overrides for previews.
export const FEEDBACK_ENDPOINT: string = process.env.FEEDBACK_ENDPOINT || 'https://tyzswuffvhxnmtaoaskz.supabase.co/functions/v1/feedback';

// About-page character (sprite sheet + stills), per language.
// he: left-facing set (public/about/, from main). en: the original right-facing set (public/about/en/), for LTR.
// `mirror` is a reserved per-language flag (false for both; nothing flips the character with CSS).
const aboutSet = (dir: string) => ({ sheetLg: `${dir}yawn-lg.webp`, sheetSm: `${dir}yawn-sm.webp`, stillLg: `${dir}still-lg.webp`, stillSm: `${dir}still-sm.webp`, mirror: false });
export const ABOUT_AVATAR = { he: aboutSet('about/'), en: aboutSet('about/en/') } as const;
