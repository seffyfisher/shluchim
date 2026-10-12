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

// Google Analytics 4 measurement ID (public by design). Loaded after the page has finished loading and the browser is idle
// (src/lib/analytics.ts), at low download priority, with advertising features disabled. Google's execution still has a cost.
// Empty = no analytics. Never in draft previews or `astro dev`.
export const GA_MEASUREMENT_ID: string = process.env.GA_MEASUREMENT_ID ?? 'G-73TB9SVD19';

// About-page character (sprite sheet + stills), per language.
// he: left-facing set (public/about/, from main). en: the original right-facing set (public/about/en/), for LTR.
// `mirror` is a reserved per-language flag (false for both; nothing flips the character with CSS).
const aboutSet = (dir: string) => ({ sheetLg: `${dir}yawn-lg.webp`, sheetSm: `${dir}yawn-sm.webp`, stillLg: `${dir}still-lg.webp`, stillSm: `${dir}still-sm.webp`, mirror: false });
export const ABOUT_AVATAR = { he: aboutSet('about/'), en: aboutSet('about/en/') } as const;

// ---------------------------------------------------------------------------------------------
// SEO / GEO (search engines and AI answer engines). Nothing here changes what a reader sees.
// ---------------------------------------------------------------------------------------------

// Who the structured data says the author/publisher is. `sameAs` = public profiles linked from the About page
// (adding more, e.g. a LinkedIn URL, helps search and AI engines tie the blog to one person; leave nothing private here).
export const PERSON = {
  name: { he: 'ספי פישר', en: 'Seffy Fisher' },
  sameAs: ['https://instagram.com/shinlamed', 'https://www.facebook.com/shinlamed'],
  description: {
    he: 'ספי פישר כותב על עבודה יומיומית עם בינה מלאכותית: עוזרי AI שהוא קורא להם שְׁלוּחִים.',
    en: 'Seffy Fisher writes about working with AI agents, which he calls shluchim, in everyday life and at work.',
  },
} as const;

// Homepage <title> / description / social alt text. The visible page copy is separate (HomePage.astro).
// Hebrew keeps the standing rule: never סוכנים/בוטים in anything a reader can see, so the Hebrew search copy says
// "בינה מלאכותית", "עוזרי AI" and the product name Grok Bot (גרוקבוט).
export const SEO_HOME = {
  he: {
    title: 'שלוחים: מעשיות על בינה מלאכותית בעבודה אמיתית',
    description: 'מעשיות אמיתיות על בינה מלאכותית בעבודה וביומיום: עוזרי AI שמנתחים נתונים, מעצבים ומתזמנים, עם גרוקבוט (Grok Bot). מה ביקשתי, מה נעשה ומה יצא.',
  },
  en: {
    title: 'Shluchim: practical, everyday AI agent stories',
    description: 'Real stories of practical, everyday AI: AI agents that analyze data, design, write and run reminders for me, built on Grok Bot. What I asked, what came out.',
  },
} as const;

// Machine-readable keywords (JSON-LD `keywords`, llms.txt). Not rendered on the page, so the Hebrew list can name the
// search terms people actually use without touching the reader-facing vocabulary rule.
export const SEO_KEYWORDS = {
  he: ['בינה מלאכותית', 'מעשיות על בינה מלאכותית', 'AI פרקטי', 'AI ביומיום', 'סוכני AI', 'עוזרי AI', 'גרוקבוט', 'Grok Bot', 'שלוחים'],
  en: ['AI agents', 'practical AI', 'everyday AI', 'stories about AI', 'AI bots', 'Grok Bot', 'AI assistants at work', 'shluchim'],
} as const;

// Default social-share image per language (public/og/, 1200x630). A post with a `cover` uses its own cover instead.
export const OG_IMAGE = {
  width: 1200,
  height: 630,
  file: { he: 'og/shluchim-he.jpg', en: 'og/shluchim-en.jpg' },
  alt: {
    he: 'שְׁלוּחִים: מעשיות על בינה מלאכותית בעבודה אמיתית, עם דמויות עוזרי ה־AI של ספי',
    en: "Shluchim: stories of practical AI at work, with the cast of Seffy's AI agents",
  },
} as const;

// Search-console ownership tokens (the "HTML tag" method). Empty = no tag is rendered.
// Paste the token here, or set the repo variables GOOGLE_SITE_VERIFICATION / BING_SITE_VERIFICATION.
export const VERIFY = {
  google: process.env.GOOGLE_SITE_VERIFICATION || '',
  bing: process.env.BING_SITE_VERIFICATION || '',
};
