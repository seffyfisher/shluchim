import type { APIContext } from 'astro';
import { getPosts, postUrl } from '../lib/posts';
import { lurl } from '../i18n/ui';
import { SEO_KEYWORDS } from '../config';
import { TOPICS, TOPIC_SLUGS } from '../data/topics.mjs';

// llms.txt (https://llmstxt.org): a plain-markdown map of the site for AI agents and answer engines.
// Generated from the content collection, so it never drifts from the real pages.
// Honest expectation: Google says Search ignores it, and no AI vendor has confirmed it ranks or cites anything.
// It is cheap, and coding agents and some retrieval tools do read it, so it stays. Do not hand-edit.
export const GET = async ({ site }: APIContext) => {
  const abs = (p: string) => new URL(p, site).href;
  const [he, en] = await Promise.all([getPosts('he'), getPosts('en')]);
  const day = (d: Date) => d.toISOString().slice(0, 10);
  const line = (p: Awaited<ReturnType<typeof getPosts>>[number]) => `- [${p.data.title}](${abs(postUrl(p))}): ${day(p.data.date)}. ${p.data.seoDescription ?? p.data.description}`;
  const topicLines = (lang: 'he' | 'en') => TOPIC_SLUGS.map((s) => `- [${TOPICS[s as keyof typeof TOPICS][lang].title}](${abs(lurl(lang, `topics/${s}/`))}): ${TOPICS[s as keyof typeof TOPICS][lang].seoDescription}`);

  const body = `# Shluchim (שלוחים)

> Shluchim is a personal blog by Seffy Fisher: first-hand stories about practical, everyday AI. Each story shows what he asked his AI agents to do, which agents took part, and what came out, with real numbers and screenshots. Available in Hebrew and English.

"Shluchim" (Hebrew: שלוחים, "emissaries"; singular shaliach) is what Seffy calls his AI agents (Hebrew: סוכני AI, עוזרי AI). The blog is not about Chabad emissaries: it borrows the Hebrew word for an emissary, from the saying "a person's emissary is as the person himself". Many stories use Grok Bot (גרוקבוט), the AI-agent product the team runs on.

- Topics covered: ${SEO_KEYWORDS.en.join(', ')}.
- Hebrew topics (נושאים): ${SEO_KEYWORDS.he.join(', ')}.
- Languages: Hebrew (primary, right-to-left) and English. Every story exists in both; the pages link to each other with hreflang.
- Format: first-person accounts, one story per page, newest first. The archive starts on 2026-09-11.
- Citing: link to the story's own URL and name "Seffy Fisher, Shluchim blog".

## Topics (English)

${topicLines('en').join('\n')}

## Stories (English)

${en.map(line).join('\n')}

## Pages (English)

- [About](${abs(lurl('en', 'about/'))}): who Seffy Fisher is and why the blog exists.
- [The team](${abs(lurl('en', 'team/'))}): every AI agent on the team and what each one does.

## נושאים (עברית)

${topicLines('he').join('\n')}

## מעשיות (עברית)

${he.map(line).join('\n')}

## עמודים (עברית)

- [אודות](${abs(lurl('he', 'about/'))}): מי זה ספי פישר ולמה הבלוג קיים.
- [השלוחים](${abs(lurl('he', 'team/'))}): כל עוזרי ה־AI בצוות ומה כל אחד עושה.

## Optional

- [RSS, English](${abs(lurl('en', 'rss.xml'))})
- [RSS, עברית](${abs(lurl('he', 'rss.xml'))})
- [Sitemap](${abs(lurl('he', 'sitemap-index.xml'))})
`;
  return new Response(body, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
};
