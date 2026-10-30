import type { APIContext } from 'astro';
import { getPosts, postUrl } from '../lib/posts';
import { lurl, type Lang } from '../i18n/ui';
import { AR_LAUNCHED, SEO_KEYWORDS } from '../config';
import { TOPICS, TOPIC_SLUGS } from '../data/topics.mjs';

// llms.txt (https://llmstxt.org): a plain-markdown map of the site for AI agents and answer engines.
// Generated from the content collection, so it never drifts from the real pages.
// Honest expectation: Google says Search ignores it, and no AI vendor has confirmed it ranks or cites anything.
// It is cheap, and coding agents and some retrieval tools do read it, so it stays. Do not hand-edit.
export const GET = async ({ site }: APIContext) => {
  const abs = (p: string) => new URL(p, site).href;
  const [he, en, ar] = await Promise.all([getPosts('he'), getPosts('en'), getPosts('ar')]);
  const showAr = AR_LAUNCHED && ar.length > 0;
  const day = (d: Date) => d.toISOString().slice(0, 10);
  const line = (p: Awaited<ReturnType<typeof getPosts>>[number]) => `- [${p.data.title}](${abs(postUrl(p))}): ${day(p.data.date)}. ${p.data.seoDescription ?? p.data.description}`;
  const topicLines = (lang: Lang) => TOPIC_SLUGS.map((s) => `- [${TOPICS[s as keyof typeof TOPICS][lang].title}](${abs(lurl(lang, `topics/${s}/`))}): ${TOPICS[s as keyof typeof TOPICS][lang].seoDescription}`);
  const arSection = showAr ? `

## مواضيع (العربية)

${topicLines('ar').join('\n')}

## حكايات (العربية)

${ar.map(line).join('\n')}

## صفحات (العربية)

- [عن المدونة](${abs(lurl('ar', 'about/'))}): من هو سيفي فيشر ولماذا وُجدت المدونة. ليست المدونة عن مبعوثي حركة حباد.
- [بشر](${abs(lurl('ar', 'friends/'))}): أشخاص يتابعهم سيفي ويستلهم من أعمالهم في الذكاء الاصطناعي وخارجه.
- [الفريق](${abs(lurl('ar', 'team/'))}): كل مساعد ذكاء اصطناعي في الفريق وماذا يفعل.` : '';
  const arMeta = showAr ? `\n- Arabic topics (مواضيع): ${SEO_KEYWORDS.ar.join(', ')}.` : '';
  const arRss = showAr ? `\n- [RSS, العربية](${abs(lurl('ar', 'rss.xml'))})` : '';

  const body = `# Shluchim (שלוחים)

> Shluchim is a personal blog by Seffy Fisher: first-hand stories about practical, everyday AI. Each story shows what he asked his AI agents to do, which agents took part, and what came out, with real numbers and screenshots. Available in ${showAr ? 'Hebrew, English and Arabic' : 'Hebrew and English'}.

"Shluchim" (Hebrew: שְׁלוּחִים, "emissaries"; singular shaliach) is what Seffy calls his AI agents (Hebrew: עוזרי AI). The blog is not about Chabad emissaries: it borrows the Hebrew word for an emissary, from the saying "a person's emissary is as the person himself". Many stories use Grok Bot (גרוקבוט), the AI-agent product the team runs on.

- Topics covered: ${SEO_KEYWORDS.en.join(', ')}.
- Hebrew topics (נושאים): ${SEO_KEYWORDS.he.join(', ')}.${arMeta}
- Languages: ${showAr ? 'Hebrew (primary, right-to-left), English, and Arabic (right-to-left)' : 'Hebrew (primary, right-to-left) and English'}. Most stories exist in both languages, and a few are Hebrew only; the pages link to each other with hreflang.
- Format: first-person accounts, one story per page, newest first. The archive starts on 2026-09-11.
- Citing: link to the story's own URL and name "Seffy Fisher, Shluchim blog".
- Markdown: every story is also available as plain Markdown at its URL with \`.md\` instead of the trailing slash (for example ${abs(lurl('en', 'posts/grok-bot-guide.md'))}). The full text of all stories is in [llms-full.txt](${abs(lurl('he', 'llms-full.txt'))}).

## Topics (English)

${topicLines('en').join('\n')}

## Stories (English)

${en.map(line).join('\n')}

## Pages (English)

- [About](${abs(lurl('en', 'about/'))}): who Seffy Fisher is and why the blog exists.
- [Humans](${abs(lurl('en', 'friends/'))}): people Seffy follows and finds inspiring, in AI and beyond, with introductions and links.
- [The team](${abs(lurl('en', 'team/'))}): every AI agent on the team and what each one does.

## נושאים (עברית)

${topicLines('he').join('\n')}

## מעשיות (עברית)

${he.map(line).join('\n')}

## עמודים (עברית)

- [אודות](${abs(lurl('he', 'about/'))}): מי זה ספי פישר ולמה הבלוג קיים.
- [בני אנוש](${abs(lurl('he', 'friends/'))}): אנשים שספי עוקב אחריהם ומקבל מהם השראה, עם קשר ובלי קשר ל־AI, עם כמה מילים וקישורים.
- [קישורים נוספים](${abs(lurl('he', 'links/'))}): 25 קישורים לבוטים מוכנים בגיטהאב, עם הסבר קצר בעברית לכל מקור.
- [פידבקים](${abs(lurl('he', 'feedback/'))}): גלויות מהקוראים, משוב שאושר לפרסום על המעשיות. מתעדכן פעם בשבוע.
- [השלוחים](${abs(lurl('he', 'team/'))}): כל עוזרי ה־AI בצוות ומה כל אחד עושה.
- [הפודקסט](${abs(lurl('he', 'podcast/'))}): מעשיות בגרסת שמע בעברית, בקריינות בינה מלאכותית. נגן Spotify וקישורים ל־Apple Podcasts ולפיד הרשמי.${arSection}

## Optional

- [Full text of every story, English and Hebrew](${abs(lurl('he', 'llms-full.txt'))})
- [RSS, English](${abs(lurl('en', 'rss.xml'))})
- [RSS, עברית](${abs(lurl('he', 'rss.xml'))})${arRss}
- [Sitemap](${abs(lurl('he', 'sitemap-index.xml'))})
`;
  return new Response(body, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
};
