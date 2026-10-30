import type { CollectionEntry } from 'astro:content';
import { PERSON } from '../config';
import { getPosts, getTranslations, langOf, postUrl, slugOf, topicsOf } from './posts';
import { isoDate } from './seo';
import { postMarkdown, markdownUrl } from './post-markdown.mjs';
import type { Lang } from '../i18n/ui';

const AUTHOR_LABEL: Record<Lang, () => string> = {
  he: () => `${PERSON.name.he} (${PERSON.name.en})`,
  en: () => `${PERSON.name.en} (${PERSON.name.he})`,
  ar: () => `${PERSON.name.ar} (${PERSON.name.en})`,
};

/** Markdown copy of one published story (same rules as the HTML page: drafts never ship). */
export async function storyMarkdown(post: CollectionEntry<'posts'>, site: URL) {
  const lang = langOf(post);
  const abs = (p: string) => new URL(p, site).href;
  const trs = await getTranslations(post);
  const translations = Object.fromEntries(Object.entries(trs).map(([l, entry]) => [l, markdownUrl(abs(postUrl(entry!)))]));
  const d = post.data;
  return postMarkdown({
    title: d.title, description: d.description, url: abs(postUrl(post)), lang,
    author: AUTHOR_LABEL[lang](),
    published: isoDate(d.date), updated: d.updated ? isoDate(d.updated) : undefined,
    topics: topicsOf(post, lang).map((x) => x.label),
    translations,
    body: post.body ?? '',
  });
}

/** getStaticPaths for /posts/<slug>.md, /en/posts/<slug>.md, and /ar/posts/<slug>.md. */
export const markdownPaths = async (lang: Lang) => (await getPosts(lang)).map((post) => ({ params: { slug: slugOf(post) }, props: { post } }));

export const markdownResponse = (body: string) => new Response(body, { headers: { 'Content-Type': 'text/markdown; charset=utf-8' } });
