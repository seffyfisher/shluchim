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
    stories: 'מעשיות', team: 'השלוחים', about: 'אודות', friends: 'בני אנוש', links: 'קישורים', allStories: 'כל המעשיות', back: '→ לכל המעשיות',
draft: 'טיוטה', postNav: 'ניווט בסוף המעשיה', nav: 'ניווט', chat: 'שיחה',
    switchTo: 'EN', switchHint: 'Read this in English',
    topics: 'נושאים', related: 'עוד מעשיות', topicNav: 'נושאים נוספים', home: 'מעשיות',
    // "Follow with your AI" block (FollowBlock.astro): a question and one button. The prompt itself lives in src/lib/follow.ts.
    followQ: 'רוצה לדעת שעולה פוסט חדש?',
    followCopy: 'תגיד את זה לשְׁלוּחִים שלך', followCopied: 'הועתק!',
    followDoneStart: 'עכשיו תדביק את זה אצל השְׁלוּחִים שלך (',
    followDoneJoin: ', ',
    followDoneEnd: ' ושות׳).',
    followCopyFail: 'ההעתקה האוטומטית לא עבדה. הטקסט מסומן: מעתיקים ידנית ומדביקים אצל השְׁלוּחִים שלך.',
    followLabel: 'הפרומפט להעתקה',
    ideaHeading: 'עכשיו הרעיון עובר אליך.',
    ideaHelp: 'כל הפוסט והוראה מוכנה לשְׁלוּחִים שלך, בהעתקה אחת.',
    ideaCopy: 'לקחת את הרעיון המרכזי בפוסט ולהשתמש בו עכשיו',
    ideaCopied: 'הועתק! הרעיון אצלך',
    ideaAny: 'ולכל שלוח שלך',
    ideaDone: 'העתקנו עבורך את המאמר המלא והוראה מוכנה. סור לך לשלוח שלך והדבק לו את ההוראה אשר הוראתי לך. משם, תן לרעיון חיים משלך.',
    ideaFail: 'ההעתקה האוטומטית לא עבדה. הפרומפט המלא מסומן כאן: העתק אותו ידנית, עבור לשלוח שלך והדבק לו אותו.',
    ideaLabel: 'המאמר המלא וההוראה לשְׁלוּחִים שלך',
    ideaManualHelp: 'הטקסט מסומן להעתקה ידנית. אחרי ההעתקה, הדבק אותו בשיחה עם השלוח שלך.',
  },
  en: {
    skip: 'Skip to content', preview: "Preview mode: includes drafts that aren't approved for publishing yet", navMain: 'Main',
    stories: 'Stories', team: 'Team', about: 'About', friends: 'Humans', links: 'Links', allStories: 'All stories', back: '← All stories',
draft: 'Draft', postNav: 'Story navigation', nav: 'Navigation', chat: 'Conversation',
    switchTo: 'עברית', switchHint: 'לקריאה בעברית',
    topics: 'Topics', related: 'More stories', topicNav: 'More topics', home: 'Stories',
    followQ: 'Want to know when a new post goes up?',
    followCopy: 'Tell your shluchim', followCopied: 'Copied!',
    followDoneStart: 'Now paste it to your shluchim: ',
    followDoneJoin: ', ',
    followDoneEnd: ', or whichever AI assistant you use.',
    followCopyFail: "Automatic copy didn't work. The text is selected: copy it by hand and paste it to your shluchim.",
    followLabel: 'The prompt to copy',
    ideaHeading: 'Now make the idea your own.',
    ideaHelp: 'The whole post and a ready-to-use instruction for your shluchim, in one copy.',
    ideaCopy: 'Take the central idea in this post and use it now',
    ideaCopied: 'Copied! The idea is yours',
    ideaAny: 'and any AI assistant you use',
    ideaDone: 'Copied the complete article and a ready-to-use instruction. Head to your AI assistant and paste it into a conversation. Then give the idea a life of your own.',
    ideaFail: 'Automatic copy did not work. The complete prompt is selected below: copy it by hand, head to your AI assistant and paste it there.',
    ideaLabel: 'The complete article and instruction for your shluchim',
    ideaManualHelp: 'The text is selected for manual copying. After copying, paste it into a conversation with your AI assistant.',
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
