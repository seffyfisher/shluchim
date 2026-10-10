import { getCollection, type CollectionEntry } from 'astro:content';
import { SHOW_DRAFTS } from '../config';
import { LANG_META, lurl, type Lang } from '../i18n/ui';

type Entry = CollectionEntry<'posts'> | CollectionEntry<'pages'>;
/** Language of an entry: from its folder (he/ or en/). */
export const langOf = (e: Entry): Lang => (e.id.startsWith('en/') ? 'en' : 'he');
/** URL slug: the entry id without the language folder (same as before the he/en split). */
export const slugOf = (e: Entry) => e.id.replace(/^(he|en)\//, '');
/** Pairs a Hebrew entry with its English translation. */
export const keyOf = (e: Entry) => e.data.translationKey ?? slugOf(e);

/**
 * Published posts of one language, newest first. Drafts only when SHOW_DRAFTS=1.
 * English posts take their `date` from the Hebrew counterpart (same translationKey) at build time, so the two
 * lists can never drift; the English frontmatter date is only a fallback when there is no Hebrew pair.
 * Same-day ties break by translationKey descending, identically in both languages.
 */
export async function getPosts(lang: Lang = 'he') {
  const all = await getCollection('posts');
  const heDate = new Map(all.filter((p) => langOf(p) === 'he').map((p) => [keyOf(p), p.data.date] as const));
  const posts = all
    .filter((p) => langOf(p) === lang && (p.data.draft !== true || (SHOW_DRAFTS && slugOf(p) !== 'example-draft')))
    .map((p) => (lang === 'he' || !heDate.has(keyOf(p)) ? p : { ...p, data: { ...p.data, date: heDate.get(keyOf(p))! } }));
  return posts.sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf() || (keyOf(a) < keyOf(b) ? 1 : keyOf(a) > keyOf(b) ? -1 : 0));
}

export const postUrl = (p: CollectionEntry<'posts'>) => lurl(langOf(p), `posts/${slugOf(p)}/`);

/** The published (or, in preview, draft) counterpart of a post in the other language, if any. */
export async function getTranslation(p: CollectionEntry<'posts'>) {
  const target: Lang = langOf(p) === 'he' ? 'en' : 'he';
  return (await getPosts(target)).find((x) => keyOf(x) === keyOf(p));
}

/** Build an internal URL that respects BASE_PATH. Always use this for links. */
export function url(path = '') {
  return lurl('he', path);
}

const fmts = new Map<string, Intl.DateTimeFormat>();
const fmt = (lang: Lang, month: 'long' | 'short') => {
  const k = lang + month;
  if (!fmts.has(k)) fmts.set(k, new Intl.DateTimeFormat(LANG_META[lang].intl, { day: 'numeric', month, year: 'numeric', timeZone: 'UTC' }));
  return fmts.get(k)!;
};
export const formatDate = (d: Date, lang: Lang = 'he') => fmt(lang, 'long').format(d);
export const formatDateShort = (d: Date, lang: Lang = 'he') => fmt(lang, 'short').format(d);

/** Reading time in minutes from the raw markdown body, computed at build time. */
export function readingMinutes(body = '', lang: Lang = 'he') {
  const text = body
    .replace(/```[\s\S]*?```/g, ' ')          // code blocks
    .replace(/!\[[^\]]*\]\([^)]*\)/g, ' ')     // images
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')   // links -> text
    .replace(/[#>*_`|~-]/g, ' ');
  const words = text.split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / LANG_META[lang].wpm));
}
export const readingLabel = (min: number, lang: Lang = 'he') =>
  lang === 'en' ? `${min} min read` : min === 1 ? 'דקת קריאה' : `${min} דקות קריאה`;
