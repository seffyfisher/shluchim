// UI strings per language. Hebrew is the default locale (served at the site root), English lives under /en/.
export const LOCALES = ['he', 'en'] as const;
export type Lang = (typeof LOCALES)[number];
export const DEFAULT_LANG: Lang = 'he';

export const LANG_META: Record<Lang, { dir: 'rtl' | 'ltr'; og: string; label: string; intl: string; wpm: number }> = {
  he: { dir: 'rtl', og: 'he_IL', label: 'עברית', intl: 'he-IL', wpm: 180 },
  en: { dir: 'ltr', og: 'en_US', label: 'English', intl: 'en-US', wpm: 230 },
};

export const UI = {
  he: {
    skip: 'דלג לתוכן', preview: 'מצב תצוגה מקדימה: כולל טיוטות שלא אושרו לפרסום', navMain: 'ראשי',
    stories: 'סיפורים', team: 'השלוחים', about: 'אודות', allStories: 'כל הסיפורים', back: '→ לכל הסיפורים',
    edit: 'עריכה ב־GitHub', draft: 'טיוטה', postNav: 'ניווט בסוף הסיפור', nav: 'ניווט', chat: 'שיחה',
    switchTo: 'EN', switchHint: 'Read this in English',
    topics: 'נושאים', related: 'עוד סיפורים', topicNav: 'נושאים נוספים', home: 'סיפורים',
    // "Follow with your AI" block (FollowBlock.astro). The prompt itself lives in src/lib/follow.ts.
    followTitle: 'תנו ל־AI שלכם לעקוב אחרי הבלוג',
    followLead: 'מעתיקים פרומפט אחד ומדביקים ב־ChatGPT, ב־Claude, בגרוקבוט או בכל עוזר AI אחר. פעם בשבוע הוא בודק את ה־RSS ואומר לכם אם יצא סיפור חדש. בלי אימייל ובלי הרשמה.',
    followCopy: 'העתקת הפרומפט', followCopied: 'הועתק!',
    followCopyFail: 'ההעתקה האוטומטית לא עבדה. הטקסט מסומן, אפשר להעתיק ידנית.',
    followOpen: 'פתיחה ב־{name}', followNewTab: 'בלשונית חדשה',
    followShow: 'מה כתוב בפרומפט?', followLabel: 'הפרומפט לעוזר ה־AI',
  },
  en: {
    skip: 'Skip to content', preview: "Preview mode: includes drafts that aren't approved for publishing yet", navMain: 'Main',
    stories: 'Stories', team: 'Team', about: 'About', allStories: 'All stories', back: '← All stories',
    edit: 'Edit on GitHub', draft: 'Draft', postNav: 'Story navigation', nav: 'Navigation', chat: 'Conversation',
    switchTo: 'עברית', switchHint: 'לקריאה בעברית',
    topics: 'Topics', related: 'More stories', topicNav: 'More topics', home: 'Stories',
    followTitle: 'Let your AI follow this blog for you',
    followLead: "Copy one prompt into ChatGPT, Claude, Grok Bot or any other AI assistant. Once a week it checks the RSS feed and tells you if there's a new story. No email, no signup.",
    followCopy: 'Copy the prompt', followCopied: 'Copied!',
    followCopyFail: "Automatic copy didn't work. The text is selected, so you can copy it by hand.",
    followOpen: 'Open in {name}', followNewTab: 'opens in a new tab',
    followShow: 'What does the prompt say?', followLabel: 'The prompt for your AI assistant',
  },
} satisfies Record<Lang, Record<string, string>>;

export const t = (lang: Lang) => UI[lang];
export const other = (lang: Lang): Lang => (lang === 'he' ? 'en' : 'he');
export const isLang = (x: unknown): x is Lang => LOCALES.includes(x as Lang);

/** Locale-aware internal URL that respects BASE_PATH: he -> /x/, en -> /en/x/ (prefixed with BASE_PATH when the site is served from a sub-path). */
export function lurl(lang: Lang, path = '') {
  const base = import.meta.env.BASE_URL.replace(/\/$/, '');
  const p = path.replace(/^\//, '');
  const pre = lang === DEFAULT_LANG ? '' : `/${lang}`;
  return p ? `${base}${pre}/${p}` : `${base}${pre}/`;
}
