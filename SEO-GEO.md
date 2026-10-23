# SEO and GEO playbook

SEO = being found in Google and Bing. GEO = being found and cited by AI answer engines and agents (ChatGPT, Perplexity, Gemini, Claude, Grok and the like).
This file is the single reference. The rules at the bottom of `AGENTS.md` point here. If you change a rule, change the guard (`src/lib/seo-check.mjs`) and this file together.

## תקציר בעברית

- **מה יש עכשיו:** לכל עמוד כותרת ותיאור לחיפוש (`seoTitle`, `seoDescription`) שנפרדים מהטקסט שהקורא רואה, נתונים מובנים (JSON-LD) לגוגל ולמנועי AI, כרטיס שיתוף, סייטמאפ עם hreflang ו־lastmod, עמודי נושא (גרוקבוט, בינה מלאכותית בעבודה וביומיום, עבודת צוות), "עוד סיפורים" בסוף כל פוסט, `robots.txt` ו־`llms.txt`.
- **מה שומר על זה:** כל build בודק את זה. `npm run seo:check` נכשל אם משהו נשבר, ו־workflow בשם "SEO guard" ב־GitHub מסמן אדום (בלי לחסום פרסום).
- **מה רק ספי יכול לעשות:** לאמת את האתר ב־Google Search Console וב־Bing Webmaster Tools, לשלוח את הסייטמאפ (וגם ל־Brave, שלפי דיווחים Claude נשען עליו), ולהפיץ קישורים מחוץ לאתר. הצעדים בסעיף "Manual steps" למטה. בלי זה, האתר פשוט לא מאונדקס.
- **מה המחקר ברשת שינה (11.10):** נוסף ping אוטומטי ל־Bing אחרי כל פרסום (IndexNow, מופעל רק אם מגדירים מפתח), נוסף דוח ה־AI של Bing כמדד הראשון והיחיד שמראה ציטוטים ב־Copilot, ונוספו כללי כתיבה למנועי תשובות (התוצאה והמספר בפסקה הראשונה, קישור למקור ראשוני, טבלה להשוואה). לא נמצא שום דבר שמצדיק עוד סכמות או עוד קבצי `llms.txt`.
- **החלטה פתוחה לספי:** בטקסט שהקורא רואה, בעברית, נשארנו עם הכלל "בלי סוכנים/בוטים". את המונחים האלה שמנו רק במקומות שהקורא לא רואה (`keywords` ב־JSON-LD, `llms.txt`). אם רוצים לדרג גם על ״סוכני AI״ בעברית, צריך להרשות משפט אחד גלוי. ראו "Hebrew vocabulary" למטה.

## What we found (2026-10-11)

- The site was not visible in search: a `site:` query returned nothing from `seffyfisher.github.io`. (That tool is not Google, so confirm in Search Console. Treat it as unindexed until proven otherwise.) On 2026-10-11 the blog moved to its own domain, `https://shluchim.shinlamed.com/`, so every URL in this file is on that host.
- The brand word collides with Chabad. "שלוחים" and "shluchim" search results are Chabad emissaries (shluchim.org, chabad.org). The bare brand will not rank soon, so every title and description carries the disambiguating meaning (AI, עוזרי AI, Grok Bot).
- None of the target terms existed in the Hebrew copy (`בינה מלאכותית`, `גרוקבוט` appeared zero times) before this work.
- Grok Bot is new (beta from August 2026) and Hebrew content about it is close to nonexistent. This is the best opening: first-hand Hebrew and English stories about a product people are just starting to search for.
- Head terms (`בינה מלאכותית`, `AI agents`, `practical AI`) are owned by large publishers. Do not expect to rank for them in the near term. What can rank is long-tail, first-hand material: "GA4 product_page traffic source", "Clerk pricing MRU", "Outlook connector blocked Grok Bot", "גרוקבוט מייל ויומן", and the topic hubs for the mid-tail.

## What the research says (read 2026-10-11)

Google's, OpenAI's and most other primary pages could not be opened from this environment, so most of this rests on secondary coverage. Evidence levels are marked.

- **Solid.** Anthropic's own help page (read directly) lists three crawlers: `ClaudeBot` (training), `Claude-User` (fetches a page when a person asks) and `Claude-SearchBot` (indexes for search results). Blocking the last two can reduce visibility. All honor `robots.txt`.
- **Consistent across secondary sources.** Google's position on AI Overviews and AI Mode is that ordinary SEO applies: the page must be indexed and eligible for a snippet. Reports of its new guide say `llms.txt`, special markup and AI-specific rewrites are not needed. Nothing here argued for more schema or more machine-only files, so none were added.
- **Directional, from vendor studies with conflicting numbers.**
  - Referring domains was the strongest predictor of ChatGPT citations in one 216,000-page study. Third-party mentions (Reddit, Wikipedia, directories) carry weight.
  - The engines disagree: one study found about 11% domain overlap between ChatGPT and Perplexity. Do not tune for one engine.
  - The first third of a page earned a large share of citations (44% in one study), tables were cited more often, and Perplexity favored recent pages.
  - The Princeton GEO paper (KDD 2024), as summarized by others: adding statistics, citations of authoritative sources and expert quotes raised visibility in generated answers by up to about 40% in controlled tests. Keyword stuffing did not help.
- **Reported, not confirmed.** Claude's web search is widely reported to run on Brave's index (Anthropic has not said so publicly). ChatGPT is widely assumed to lean on Bing, and no source seen confirmed it. Bing's AI Performance report (public preview since February 2026) shows Copilot citations and the queries behind them for verified sites. Agencies claim engines behave differently in Hebrew, with no independent data.

What it changed here: the opt-in IndexNow ping, the Bing AI Performance report as a metric, Brave in the manual steps, and the writing guidance below. Our posts already have what the research favors (real numbers, real chat quotes, screenshots), so the lever that is left is mostly off-site.

## Where things live

| What | Where |
| --- | --- |
| Search copy per post (what appears in results) | frontmatter `seoTitle`, `seoDescription`. The visible `title` / `description` stay Seffy's voice and are not touched. |
| Topics (hubs, "more stories", related) | frontmatter `topics: [..]`, defined in `src/data/topics.mjs` (+ the option list in `public/admin/config.yml`) |
| Optional last-modified date | frontmatter `updated` (feeds `dateModified` and sitemap `lastmod`; default is `date`) |
| `<head>`: robots, canonical, hreflang, Open Graph, Twitter, verification tags, JSON-LD | `src/layouts/Base.astro` |
| JSON-LD builders (pure, unit-tested) | `src/lib/seo.ts`, `src/lib/seo.test.mjs` |
| Post JSON-LD (BlogPosting, breadcrumbs), topic chips, related stories | `src/components/PostPage.astro` |
| Homepage / site-wide copy, keywords, author, share image, verification tokens | `src/config.ts` (`SEO_HOME`, `SEO_KEYWORDS`, `PERSON`, `OG_IMAGE`, `VERIFY`) |
| Topic hub pages | `src/components/TopicPage.astro`, `src/pages/topics/`, `src/pages/en/topics/` |
| Sitemap: hreflang pairs (he, en, x-default) and `lastmod` | `astro.config.mjs` + `src/lib/i18n-check.mjs` |
| `/robots.txt`, `/llms.txt`, `/llms-full.txt` | `src/pages/robots.txt.ts`, `src/pages/llms.txt.ts`, `src/pages/llms-full.txt.ts` (generated, never hand-edit) |
| Markdown copy of each story (`/posts/<slug>.md`, `/en/posts/<slug>.md`, announced by `<link rel="alternate" type="text/markdown">`) | `src/pages/posts/[slug].md.ts`, `src/pages/en/posts/[slug].md.ts`, `src/lib/post-md.ts`, `src/lib/post-markdown.mjs` (the post's own Markdown, links made absolute) |
| Share cards (1200x630) | `public/og/`, source in `scripts/og-card/` |
| The guard | `src/lib/seo-check.mjs`, `npm run seo:check`, `.github/workflows/seo-guard.yml` |

## Writing the search copy for a post

Do this in both languages. Write each language on its own, do not translate word for word.

1. **`seoTitle`**: up to about 50 characters (the brand is appended: `title · שלוחים`, total 65 max). Write what a person would type or ask, with one concrete fact. Examples: `Clerk pricing by MRU: why login events mislead`, `1.2k לחיצות מתות על תיבת תנאים: באג או לא?`. No clickbait, no ending period.
2. **`seoDescription`**: 70 to 160 characters. First sentence is the answer or the outcome, with a real number from the post. Every number and claim must be in the post itself. Never invent.
3. **`topics`**: one to three of `grok-bot`, `ai-at-work`, `everyday-ai`, `agent-teamwork`. Identical in both languages. Tag `grok-bot` only when the post really uses Grok Bot.
4. Leave `title` and `description` alone. They are Seffy's voice and the on-page headline and lede.
5. First paragraph of the post should answer the question the title asks. Headings that say what the section is (`איך זה עבד`, `מה כדאי לקחת מזה`) already work well for AI engines that lift passages. Keep them.
6. Images keep a meaningful `alt`. Screenshots of real chats are good, they are the first-hand evidence these engines prefer.
7. After the post ships (manual): Search Console, URL Inspection, paste the new URL, Request indexing.

### Writing for answer engines (guidance, not enforced by the guard)

- The first paragraph says what came out, with the real number. The first third of a page is what gets quoted.
- Keep what the research favors and we already have: concrete numbers, real chat quotes as text, screenshots with alt text.
- Link to the primary source when a post leans on one (the official help page, the vendor docs, the original post). The "מקורות" section of the Grok Bot email post is the model.
- A comparison goes in a Markdown table, not in prose.
- Set `updated` when a post changes in a way that matters. Some engines favor recent pages.
- Write both languages and promote the English URL abroad. Most engines quote English sources more.
- No keyword stuffing, and no FAQ blocks of invented questions.

### Hebrew vocabulary (standing rule, `PUBLISHING.md`)

- Reader-facing Hebrew never says `סוכנים` or `בוטים`. The product name is fine: `Grok Bot`, `גרוקבוט`.
- Every `שלוחים` (and prefixed forms) in reader-facing Hebrew is `שְׁלוּחִים` with the exact niqqud of the site title. Not affected: the site title in config, nav and footer labels, the tagline, singular `שלוח`.
- English search copy may say "AI agents" (the English site already does). No niqqud in English.
- Because of that rule, the search terms `סוכני AI` and `בוטים` live only in places a reader does not see: JSON-LD `keywords` and `llms.txt` (`SEO_KEYWORDS` in `src/config.ts`). Search engines mostly ignore `keywords`, so this does not make the blog rank for them. **If Seffy wants to rank for `סוכני AI` in Hebrew, it needs one visible sentence, for example on the team page or in a topic hub intro. That is his call, and an exception to record in `PUBLISHING.md` like the earlier ones.**

## Keyword map

| Term people use | Where it is covered | Realistic target |
| --- | --- | --- |
| גרוקבוט, Grok Bot | topic hub `grok-bot` (he + en), 6 posts tagged, footer link, homepage copy, share card | rank for long-tail and "Grok Bot use cases / examples"; best opportunity |
| בינה מלאכותית, סיפורים על בינה מלאכותית | homepage `<title>` and description, hubs `ai-at-work` and `everyday-ai`, footer links, JSON-LD | mid-tail only, with a qualifier ("בעבודה", "ביומיום", "סיפורים") |
| AI agents, practical AI, everyday AI | English homepage title and description, hubs `ai-at-work`, `everyday-ai`, `agent-teamwork`, every English `seoTitle` | long-tail ("AI agent weekly Clarity report") and the hubs |
| שלוחים (as AI helpers) | niqqud form in copy, "עוזרי AI" next to it, `llms.txt` disambiguation, `WebSite.alternateName` | "שלוחים בינה מלאכותית", "Shluchim AI agents blog". The bare word belongs to Chabad |
| סוכני AI, בוטים (Hebrew) | JSON-LD `keywords`, `llms.txt` only (see the vocabulary decision above) | not targeted in visible copy |

## What the guard checks

It runs on every build. A normal build and the deploy only warn and never stop publishing. `SEO_STRICT=1` (`npm run seo:check`, and the "SEO guard" workflow on every PR and push to main) fails on errors.

Errors: a published post or page without `seoTitle` / `seoDescription`; duplicate search copy within a language; unknown topic; Hebrew search copy with `סוכנים`/`בוטים` or `שלוחים` without niqqud; niqqud in English search copy; a built page without title, description, canonical, Open Graph or Twitter card, or with `noindex`; not exactly one `<h1>`; JSON-LD that does not parse, or a post without a complete `BlogPosting`; hreflang that is not reciprocal; an `og:image` file that does not exist; a broken internal link or asset; no sitemap, `robots.txt` or `llms.txt`.

Warnings: `<title>` over 65 characters; description outside 70 to 160; a post with no topics; different topics in the Hebrew and English versions.

When it fails, the message names the file and the fix. Do not silence the guard to get green. Fix the page.

## Manual steps (cannot be done from the repo)

1. **Google Search Console.** Two ways, pick one (the old `github.io` address redirects here and is not ours to verify). (a) **Domain property** `shinlamed.com`: verify once with a DNS TXT record at the registrar, and it covers every subdomain, including this one and the main `shinlamed.com` site. (b) **URL-prefix property** `https://shluchim.shinlamed.com/`: choose the "HTML tag" method, copy the `content` value, set it as the repo variable `GOOGLE_SITE_VERIFICATION` (Settings, Secrets and variables, Actions, Variables), or paste it into `VERIFY.google` in `src/config.ts`, run "Deploy to GitHub Pages", then press Verify. Then Sitemaps, add `sitemap-index.xml`. Then URL Inspection on the homepage and the topic hubs, Request indexing.
2. **Bing Webmaster Tools.** Import the site from Search Console (fastest), or use the same method with `BING_SITE_VERIFICATION`. Submit the sitemap. Bing's index is widely assumed to feed Copilot and ChatGPT search (not confirmed). Once verified, open the AI Performance report: it is the one first-party view of AI citations.
3. **`robots.txt` and the domain.** The blog now has its own host, so `/robots.txt` is the file crawlers read, and it announces the sitemap. Google treats a subdomain as a separate site from `shinlamed.com`, so the new site starts with its own authority. **Link to the blog from the main `shinlamed.com` site** (a footer or an "about" link). It is an immediate, real link from an established site, and the cheapest one available. Check that the old `seffyfisher.github.io/shluchim/` addresses redirect to the new domain and that every canonical points to it.
4. **Off-site mentions and links.** This is the largest lever for both Google and AI answers, and the repo cannot do it. Share each new post where the audience already is: Hebrew and English AI and Grok Bot communities, LinkedIn, Facebook groups, X. For the English posts consider a cross-post that sets a canonical link back to the original. Mentions on third-party pages are what answer engines tend to cite.
5. **Add public profiles** (LinkedIn, X, GitHub) to `PERSON.sameAs` in `src/config.ts`. It helps search and AI engines tie the blog to one person. Only profiles Seffy is happy to link publicly.
6. **Brave Search.** Claude's web search is widely reported to use Brave's index. Brave has no full webmaster console. Community posts point to `https://search.brave.com/submit-url` for submitting a URL (not confirmed against Brave's own docs). Submit the homepage and the Grok Bot hubs.
7. **IndexNow (opt-in).** Pings Bing, Yandex, Naver and Seznam (not Google, not Brave) with the stories that changed, right after a deploy. Only public URLs are sent. To switch it on: pick a key (8 to 128 characters of a-z, A-Z, 0-9 and `-`), add `public/<key>.txt` containing exactly the key, set the repo variable `INDEXNOW_KEY` to the key. The `indexnow` job in `deploy.yml` then runs after each push to `main`. Try it first with `INDEXNOW_KEY=<key> node scripts/indexnow.mjs --dry --before <sha>`. The key file sits at the root of the host, so every submitted URL is inside its directory (the strictest reading of the protocol; the official page could not be opened here).
8. **Search Console's AI report.** Google announced generative AI performance reports in Search Console in June 2026, rolling out to a subset of sites. Check whether the property has it.

## Measuring

- Bing Webmaster Tools, AI Performance report: citations in Copilot and Bing's AI summaries, and the grounding queries behind them. No click data and no API yet, and the numbers are volatile (one analysis found a single page holding 69% of citations). Check it monthly.
- Search Console, Performance: filter queries by `גרוקבוט`, `Grok Bot`, `בינה מלאכותית`, `AI agents`, compare weekly, and look for the generative AI report if it is available. Expect weeks, not days.
- Once a month, ask ChatGPT, Perplexity, Gemini and Claude the same five questions (for example "what are AI agents doing in everyday work, real stories", "גרוקבוט מייל ויומן בלי קונקטור") and note whether the blog is cited. Manual, and the only way to see the engines that publish no report.

## Honest limits

- No on-site change makes a brand-new blog on a brand-new domain rank for `בינה מלאכותית`. This setup gets pages indexed correctly, understood, and eligible for long-tail and Grok Bot queries.
- `llms.txt` is generated and kept because it is cheap. Coverage of Google's guide says Search ignores it, and no AI vendor has confirmed using it. We could not open the primary pages to check. Do not expect a measurable effect. On 2026-10-23 Seffy asked for full LLM readiness, so `llms-full.txt` and a Markdown copy of every story were added: both are generated from the same Markdown at build time and cost nothing to keep. Do not add further machine-only files without a reason.
- Structured data makes pages eligible for rich results such as breadcrumbs. It does not raise rankings by itself. JSON-LD `keywords` is ignored by Google.
- `lastmod` is the post date (or `updated`). It is only as accurate as those fields, so set `updated` when a post changes in a way that matters.

## Regenerating the share cards

See `scripts/og-card/README.md`. Change them when the cast, the headline (`SEO_HOME`) or the fonts change.
