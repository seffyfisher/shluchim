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
  },
  en: {
    skip: 'Skip to content', preview: "Preview mode: includes drafts that aren't approved for publishing yet", navMain: 'Main',
    stories: 'Stories', team: 'The Shluchim', about: 'About', allStories: 'All stories', back: '← All stories',
    edit: 'Edit on GitHub', draft: 'Draft', postNav: 'Story navigation', nav: 'Navigation', chat: 'Conversation',
    switchTo: 'עברית', switchHint: 'לקריאה בעברית',
  },
} satisfies Record<Lang, Record<string, string>>;

export const t = (lang: Lang) => UI[lang];
export const other = (lang: Lang): Lang => (lang === 'he' ? 'en' : 'he');
export const isLang = (x: unknown): x is Lang => LOCALES.includes(x as Lang);

/** Locale-aware internal URL that respects BASE_PATH: he -> /shluchim/x/, en -> /shluchim/en/x/. */
export function lurl(lang: Lang, path = '') {
  const base = import.meta.env.BASE_URL.replace(/\/$/, '');
  const p = path.replace(/^\//, '');
  const pre = lang === DEFAULT_LANG ? '' : `/${lang}`;
  return p ? `${base}${pre}/${p}` : `${base}${pre}/`;
}
