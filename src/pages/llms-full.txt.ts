import type { APIContext } from 'astro';
import { getCollection } from 'astro:content';
import { AR_LAUNCHED } from '../config';
import { getPosts, langOf } from '../lib/posts';
import { storyMarkdown } from '../lib/post-md';
import { absolutizeMarkdown, demoteHeadings } from '../lib/post-markdown.mjs';
import { lurl, type Lang } from '../i18n/ui';

// llms-full.txt (https://llmstxt.org): the full text of every published story, English then Hebrew (and Arabic once launched), as one Markdown file.
// The short map is /llms.txt; each story also has its own /posts/<slug>.md copy. Generated from the content collection, never hand-edit.
export const GET = async ({ site }: APIContext) => {
  const abs = (p: string) => new URL(p, site).href;
  const [he, en, ar] = await Promise.all([getPosts('he'), getPosts('en'), getPosts('ar')]);
  const showAr = AR_LAUNCHED && ar.length > 0;
  const pages = await getCollection('pages');
  const about = (lang: Lang) => {
    const p = pages.find((x) => langOf(x) === lang && x.id.endsWith('about'));
    if (!p?.body) return [];
    const url = abs(lurl(lang, 'about/'));
    // The about body opens with its own `# <title>`; keep it as the section heading and add the URL under it.
    const body = absolutizeMarkdown(p.body.trim(), url).replace(/^#\s+[^\n]*\n?/, '');
    return [`## ${p.data.title}\n\n- URL: ${url}\n\n${demoteHeadings(body.trim(), 1)}`];
  };
  const stories = async (list: typeof he) => Promise.all(list.map(async (p) => demoteHeadings(await storyMarkdown(p, site!), 1)));
  const sep = '\n\n---\n\n';
  const sections = [
    `# Shluchim (שלוחים): full text\n\n> Full text of every published story on ${abs(lurl('he'))}, a personal blog by Seffy Fisher (ספי פישר) about practical, everyday AI, in ${showAr ? 'English, Hebrew and Arabic' : 'English and Hebrew'}. The short map of the site is ${abs(lurl('he', 'llms.txt'))}. Each story is also available on its own as Markdown: its URL with \`.md\` instead of the trailing slash.`,
    `# English\n\n${[...about('en'), ...(await stories(en))].join(sep)}`,
    `# עברית\n\n${[...about('he'), ...(await stories(he))].join(sep)}`,
    ...(showAr ? [`# العربية\n\n${[...about('ar'), ...(await stories(ar))].join(sep)}`] : []),
  ];
  return new Response(sections.join(sep) + '\n', { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
};
