import type { CollectionEntry } from 'astro:content';
import { PERSON } from '../config';
import { getPosts, getTranslation, langOf, postUrl, slugOf, topicsOf } from './posts';
import { isoDate } from './seo';
import { postMarkdown, markdownUrl } from './post-markdown.mjs';
import type { Lang } from '../i18n/ui';

/** Markdown copy of one published story (same rules as the HTML page: drafts never ship). */
export async function storyMarkdown(post: CollectionEntry<'posts'>, site: URL) {
  const lang = langOf(post);
  const abs = (p: string) => new URL(p, site).href;
  const tr = await getTranslation(post);
  const d = post.data;
  return postMarkdown({
    title: d.title, description: d.description, url: abs(postUrl(post)), lang,
    author: lang === 'he' ? `${PERSON.name.he} (${PERSON.name.en})` : `${PERSON.name.en} (${PERSON.name.he})`,
    published: isoDate(d.date), updated: d.updated ? isoDate(d.updated) : undefined,
    topics: topicsOf(post, lang).map((x) => x.label),
    translationUrl: tr ? markdownUrl(abs(postUrl(tr))) : undefined,
    body: post.body ?? '',
  });
}

/** getStaticPaths for /posts/<slug>.md and /en/posts/<slug>.md. */
export const markdownPaths = async (lang: Lang) => (await getPosts(lang)).map((post) => ({ params: { slug: slugOf(post) }, props: { post } }));

export const markdownResponse = (body: string) => new Response(body, { headers: { 'Content-Type': 'text/markdown; charset=utf-8' } });
