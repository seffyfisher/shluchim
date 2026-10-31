# AGENTS.md

## Analytics for user-facing functionality (Seffy, 2026-10-16)

When implementing, reviewing or merging a feature that adds or changes a meaningful user action or outcome, read and follow the [required analytics workflow in ANALYTICS.md](ANALYTICS.md#required-workflow-for-features-and-merges). Measurement is part of the feature's completion criteria. The implementing agent supplies the tracking plan and evidence; the merging agent checks them before merge. Use the PR template to record coverage or a specific not-applicable reason.

## Lighthouse release gate (standing rule from Seffy, 2026-10-13)

Before any PR, merge, push to `main`, or deployment, read [.agents/skills/lighthouse-release-guard/SKILL.md](.agents/skills/lighthouse-release-guard/SKILL.md) and run its checks. The deployment workflow must not publish a build unless mobile Lighthouse Performance scores 100 on the checked pages. Check the live score after deployment and investigate any drop. Never weaken the guard to make a release pass.

## Shluchim posts: required workflow (Seffy, 2026-10-13)

Before writing, revising, illustrating, translating, reviewing or publishing a
Shluchim post, read [.agents/skills/shluchim-blog-post/SKILL.md](.agents/skills/shluchim-blog-post/SKILL.md)
and its required references and checklists. Follow its publish-day date rule, Seffy's voice,
real quotations, full Hebrew review, text approval, image approval, English,
publication and live verification stages. An explicit request to write a post
also starts the workflow. Keep the skill, reference, installer and this pointer
when changing the project; update them together when Seffy changes the process.
The complete uploaded skill, including examples and image references, is preserved
in that directory. `shluchim-post-workflow` routes older invocations to it.
Technical publishing conventions remain in [PUBLISHING.md](PUBLISHING.md).

## CSS first, no added JavaScript (standing rule from Seffy, 2026-10-10)

- כל מה שאפשר לעשות ב־CSS בלבד, עושים ב־CSS, בלי להוסיף JavaScript. מוסיפים JS רק כשאין באמת ברירה, ומסבירים למה ב־PR או בקומיט.
- Anything that can be done with CSS alone is done in CSS, with no added JavaScript. JS is added only when truly unavoidable, and the reason is explained in the PR or commit.

## תקצירים ברשימות המעשיות (standing rule from Seffy, 2026-10-13)

- בדף הבית ובעמודי הנושאים, בעברית ובאנגלית, תקציר של פוסט מוגבל תמיד לשלוש שורות לכל היותר.
- לפוסט חדש עם `description` ארוך כותבים גם `listDescription`: משפט או שניים קצרים שמספרים מה נתקע ומה יצא. `description` המלא נשאר בעמוד הפוסט וב־RSS. אם אין `listDescription`, הרשימה מציגה את `description` ומגבילה אותו לשלוש שורות.
- The shared `StoryList` component and its CSS enforce this for every list; keep the authoring guidance in `PUBLISHING.md`, the CMS and the post skill in sync.

## External links open in a new tab (standing rule from Seffy, 2026-10-13)

- כל קישור לאתר חיצוני, בעברית ובאנגלית ובדף ״בני אנוש״, חייב `target="_blank"` ו־`rel="noopener"`. קישורים לאותו האתר, כולל כתובות מלאות וקישורי עוגן, נפתחים באותו טאב. משמרים ערכי `rel` נוספים כמו `nofollow`.
- Every link to another site, in Hebrew and English and on the Humans page, must have `target="_blank"` and `rel="noopener"`. Links to this site, including absolute URLs and fragments, open in the same tab. Preserve other `rel` tokens such as `nofollow`.
- Astro templates set external-link attributes explicitly; `src/lib/links.mjs` uses the configured `SITE_URL` host to apply the rule to Markdown and raw HTML and fails every build if any rendered link violates it. Keep enforcement at build time, without browser JavaScript.

## Arabic (/ar/) work (SEF-263, 2026-10-30)

- `/ar/` is launched (Phase D, 2026-10-31): `AR_LAUNCHED = true`, so `/ar/` is indexable, in the sitemap, `llms.txt` / `llms-full.txt`, IndexNow and HE/EN hreflang. Don't flip it back without Seffy's decision via Yosef.
- New Arabic posts start as `draft: true` and go live only after the Arabic critic gate below.
- Brand: Latin **Shluchim** in logo/titles/URL/`og:site_name`; never شلوخيم / رسول / مرسلون, never وكيل as a name. Visible copy says مساعد; only `SEO_KEYWORDS.ar` may use وكلاء. MSA, digits 0–9. Dropdown labels stay `עברית · العربية · English` in that order, RTL-aligned.
- Any new or changed visible Arabic text needs the Arabic critic's written dual-pass (`arabic-blog-writing` + `arabic-seo`) before merge. Open such PRs as drafts and list the strings for review. Details: `PUBLISHING.md` ("Arabic (/ar/)") and `SEO-GEO.md`.
- When adding any per-language branch, handle all of `LOCALES` (he, en, ar); never `he ? … : …` that silently treats ar as en.

## SEO / GEO: ממשיכים לקדם את הבלוג (standing rule from Seffy, 2026-10-11)

המטרה: שהבלוג, בעברית ובאנגלית, יימצא בגוגל, בבינג ובמנועי AI, ושזה לא יתפרק עם הזמן. המדריך המלא: [SEO-GEO.md](SEO-GEO.md). הכללים כאן מחייבים כל מי שנוגע בתוכן או בתבניות.

- **פוסט חדש או עריכה:** בכל קובץ, עברית ואנגלית, חובה `seoTitle` (עד כ־50 תווים, מה שאנשים היו מקלידים), `seoDescription` (70 עד 160 תווים, התשובה והמספר האמיתי כבר במשפט הראשון) ו־`topics` (1 עד 3, זהים בשתי השפות). כותבים כל שפה לעצמה, לא תרגום מילה במילה, ורק עובדות שכתובות בפוסט. הכותרת והתקציר שהקורא רואה לא משתנים בגלל SEO, הם בקול של ספי.
- **אוצר מילים בעברית בטקסט לחיפוש:** בלי סוכנים/בוטים (שם המוצר Grok Bot / גרוקבוט מותר), ו־שְׁלוּחִים עם ניקוד. באנגלית בלי ניקוד.
- **לא מורידים ולא מחלישים:** JSON-LD, canonical, hreflang, כרטיס השיתוף, הסייטמאפ, `llms.txt`, `robots.txt`, עמודי הנושא ו״עוד סיפורים״. לא מוסיפים `noindex` ולא `Disallow` לבוטים של חיפוש או AI בלי החלטה מפורשת של ספי.
- **נושא חדש:** מוסיפים ל־`src/data/topics.mjs` (עברית ואנגלית) ולרשימת האפשרויות ב־`public/admin/config.yml`.
- **לפני כל commit שנוגע בתוכן, בתבניות או בהגדרות:** `npm test` ו־`npm run seo:check` חייבים לעבור. השער נכשל עם שם הקובץ ומה לתקן. לא משתיקים אותו כדי לקבל ירוק, מתקנים את העמוד. ה־workflow ״SEO guard״ מריץ אותו על כל PR וכל push ל־main.
- **Push:** דוחפים עם env `GITHUB_TOKEN_SEFFY` (credential helper מקומי בריפו קורא אותו; לא שומרים טוקן על הדיסק).
- **כתיבה למנועי תשובות (מומלץ, לא נאכף):** הפסקה הראשונה אומרת מה יצא, עם המספר האמיתי. קישור למקור ראשוני כשהפוסט נשען עליו. השוואה בטבלה. `updated` כשמשנים פוסט באופן שחשוב. כותבים בשתי השפות ומקדמים גם את הכתובת באנגלית. פירוט ומקורות: SEO-GEO.md.
- **JS:** נתונים מובנים הם `application/ld+json` שנבנה בזמן build, לא JavaScript שרץ אצל הקורא. ממשיכים לפי הכלל ״CSS first״ למעלה.
- **מה שהריפו לא יכול לעשות** (Search Console, Bing, דומיין, קישורים מבחוץ) מפורט ב־SEO-GEO.md. כשפוסט עולה, מזכירים לספי לבקש אינדוקס לכתובת החדשה.

Standing rule (Seffy, 2026-10-11): the blog must keep being found by Google, Bing and AI answer engines, in Hebrew and English. Full playbook: [SEO-GEO.md](SEO-GEO.md).

- **New post or edit:** every file, Hebrew and English, needs `seoTitle` (about 50 chars, what people would type), `seoDescription` (70-160 chars, the answer and a real number up front) and `topics` (1-3, identical in both languages). Write each language on its own, use only facts that are in the post. The visible `title` / `description` stay Seffy's voice and do not change for SEO.
- **Hebrew vocabulary in search copy:** no סוכנים/בוטים (the product name Grok Bot / גרוקבוט is fine), and שְׁלוּחִים with niqqud. No niqqud in English.
- **Never remove or weaken:** JSON-LD, canonical, hreflang, the share card, the sitemap, `llms.txt`, `robots.txt`, the topic hubs and "more stories". No `noindex`, and no `Disallow` for search or AI bots, without Seffy's explicit decision.
- **New topic:** add it to `src/data/topics.mjs` (both languages) and to the option list in `public/admin/config.yml`.
- **Before any commit that touches content, templates or config:** `npm test` and `npm run seo:check` must pass. The guard names the file and the fix. Do not silence it to get green, fix the page. The "SEO guard" workflow runs it on every PR and push to main.
- **Push:** pushes use env `GITHUB_TOKEN_SEFFY` (a repo-local credential helper reads it; never store the token on disk).
- **Writing for answer engines (recommended, not enforced):** the first paragraph says what came out, with the real number. Link the primary source when the post leans on one. Put comparisons in a table. Set `updated` when a post changes in a way that matters. Write both languages and promote the English URL too. Details and sources: SEO-GEO.md.
- **JS:** structured data is `application/ld+json` generated at build time, not client JavaScript. The CSS-first rule above still holds.
- **What the repo cannot do** (Search Console, Bing, domain, off-site links) is in SEO-GEO.md. When a post ships, remind Seffy to request indexing for the new URL.

