import rss from '@astrojs/rss';
import type { APIContext } from 'astro';
import { SITES } from '../config';
import { getPosts, postUrl, topicsOf } from './posts';
import { lurl, type Lang } from '../i18n/ui';

/** RSS <description> is read as HTML, so a bare `&` (e.g. "Q&As") is an invalid entity there. Escape once more for HTML. */
export const htmlText = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

/** One RSS feed per language: /rss.xml (Hebrew, unchanged) and /en/rss.xml. Each announces itself with atom:link rel="self" (W3C validator). */
export async function feed(lang: Lang, context: APIContext) {
  const posts = await getPosts(lang);
  const SITE = SITES[lang];
  const self = new URL(lurl(lang, 'rss.xml'), context.site).href;
  return rss({
    title: SITE.title,
    description: SITE.tagline,
    site: context.site!,
    items: posts.map((p) => ({
      title: p.data.title,
      description: htmlText(p.data.description),
      pubDate: p.data.date,
      link: postUrl(p),
      categories: topicsOf(p, lang).map((x) => x.label),
    })),
    xmlns: { atom: 'http://www.w3.org/2005/Atom' },
    customData: `<language>${lang}</language><atom:link href="${self}" rel="self" type="application/rss+xml"/>`,
  });
}
