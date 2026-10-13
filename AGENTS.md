# AGENTS.md

## Shluchim posts: required workflow (Seffy, 2026-10-13)

Before writing, revising, illustrating, translating, reviewing or publishing a
Shluchim post, read [.agents/skills/shluchim-blog-post/SKILL.md](.agents/skills/shluchim-blog-post/SKILL.md)
and its required references and checklists. Follow its original-story date, Seffy's voice,
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

