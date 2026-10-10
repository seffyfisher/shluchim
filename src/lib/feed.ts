import rss from '@astrojs/rss';
import type { APIContext } from 'astro';
import { SITES } from '../config';
import { getPosts, postUrl } from './posts';
import type { Lang } from '../i18n/ui';

/** One RSS feed per language: /rss.xml (Hebrew, unchanged) and /en/rss.xml. */
export async function feed(lang: Lang, context: APIContext) {
  const posts = await getPosts(lang);
  const SITE = SITES[lang];
  return rss({
    title: SITE.title,
    description: SITE.tagline,
    site: context.site!,
    items: posts.map((p) => ({
      title: p.data.title,
      description: p.data.description,
      pubDate: p.data.date,
      link: postUrl(p),
    })),
    customData: `<language>${lang}</language>`,
  });
}
