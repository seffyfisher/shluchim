# מדריך פרסום לבן

## התהליך המחייב לפוסט

לפני כתיבה, עריכה, איור, תרגום או פרסום, קוראים את
[המיומנות המלאה שספי סיפק](.agents/skills/shluchim-blog-post/SKILL.md)
ואת קובצי הקול, הכתיבה, התמונות והבדיקות שהיא מפנה אליהם.
הם קובעים את הקול, הציטוטים, התאריך ושלבי אישור הטקסט והתמונות.
ההוראות בהמשך מתארות את ההעלאה הטכנית לאתר.

באתר הזה `summary` נשמר בשדה `description`, ו־`status: draft` מיוצג באמצעות
`draft: true`. שומרים גם את שדות ה־SEO והשפה הנדרשים באתר.
ברשימות המעשיות בדף הבית ובעמודי הנושאים התקציר מוגבל לשלוש שורות לכל היותר.
אם `description` ארוך, מוסיפים `listDescription` של משפט או שניים קצרים שמתארים
מה נתקע ומה יצא. הוא מופיע רק ברשימות; `description` המלא נשאר בעמוד הפוסט וב־RSS.
הכלל חל בעברית ובאנגלית, וגם על פוסטים בלי `listDescription`.
להתקנה גלובלית בCodex, מכל checkout של הפרויקט:
`python3 scripts/install-post-workflow.py`.

1. צור קובץ חדש: `src/content/posts/he/YYYY-MM-DD-slug.md` (ה־slug באנגלית, הוא נהיה ה־URL).
2. Frontmatter חובה:
   ```yaml
   ---
   title: "כותרת"
   description: "תקציר של 2–4 משפטים שמופיע בעמוד הפוסט וב־RSS"
   # listDescription: "משפט או שניים קצרים לרשימות, אם התקציר המלא ארוך"
   date: 2026-10-09
   draft: true
   emoji: "אימוג׳י מתאים וייחודי"
   lang: he
   translationKey: "YYYY-MM-DD-slug"
   tags: ["אופציונלי"]
   seoTitle: "מה שאנשים היו מקלידים, עד כ־50 תווים"
   seoDescription: "70 עד 160 תווים. התשובה והמספר האמיתי כבר במשפט הראשון."
   topics: ["ai-at-work"]
   ---
   ```
   `seoTitle`, `seoDescription` ו־`topics` חובה בכל פוסט, בעברית ובאנגלית. הם קובעים מה מופיע בגוגל ובמנועי AI, ולא משנים את מה שהקורא רואה בעמוד. הכללים: [SEO-GEO.md](SEO-GEO.md). `npm run seo:check` חייב לעבור לפני פרסום.
3. `draft: true` נשאר עד אישור מפורש של ספי. בלי יוצא מן הכלל.
4. טקסט שנכתב בשם ספי (גוף ראשון) כפוף ל־`references/voice.md` במיומנות המלאה.
5. תצוגה מקדימה לספי: `export PATH=~/.local/node22/bin:$PATH && npm run build:drafts && npm run preview:drafts`
   (הטיוטות מוצגות עם תג ״טיוטה״), ושלח לו צילום מסך של העמוד.
6. אחרי אישור הטקסט וכל התמונות לפי התהליך, הכן את הגרסה האנגלית באותו שם קובץ.
   בשלב הפרסום שנה בשתי השפות ל־`draft: false`, הרץ `npm test` ו־`npm run seo:check`
   (חייבים לעבור), הוסף רק את הקבצים השייכים לשינוי, צור commit, ודחוף ל־main.
7. ה־push ל־main מפרסם אוטומטית (GitHub Actions). אין לפרסם בשום דרך אחרת.
8. אישור שלא התקבל = לא מפרסמים. תיקון לפוסט שכבר פורסם עובר שוב דרך ספי.

## אימוג׳י לכל פוסט (standing rule from Seffy, 2026-10-12)
- בכל פוסט חדש חובה `emoji: "…"` ב־frontmatter של הפוסט העברי. ברשימת המעשיות (בית ונושאים, עברית ואנגלית) הוא מוצג במקום המספר. האנגלי לוקח אותו מהעברי לפי `translationKey`.
- האימוג׳י צריך להתאים לתוכן של הפוסט, ואסור שיחזור על אימוג׳י של פוסט אחר או יופיע בכותרת של פוסט אחר (למשל 💯 תפוס בכותרת של 100-means-go).
- ה־list guard מפיל את הבילד אם חסר אימוג׳י או שיש כפילות.
- Every new post needs a unique, contextual `emoji` in its HE frontmatter (shown instead of the list number, HE and EN). The build fails on a missing or duplicate emoji.

## עריכת פוסט קיים
- `featured: true` בפוסט עברי מציג אותו פעם אחת בראש עמודי הבית בעברית ובאנגלית, אם יש תרגום מפורסם. פוסטים נבחרים מסודרים מהחדש לישן ואחריהם שאר המעשיות מהחדש לישן. אין שינוי בעמודי הנושא או ב־RSS. בפוסט אנגלי ללא מקור עברי אפשר להגדיר `featured: true` משלו. השדה ״בראש עמוד הבית״ זמין גם ב־CMS; כבוי כברירת מחדל. להסרה, מחקו את השדה או הגדירו `featured: false`.
- בתחתית כל פוסט יש קישור ״עריכה״ לעורך של GitHub. commit ל־main מהעורך מפרסם אוטומטית.
- או לבקש משלוח לערוך את הקובץ ב־`src/content/posts/`. עריכה של שלוח עדיין דורשת אישור מפורש של ספי לפני push.

- טקסט לקוראים: תמיד שלוחים/שלוח, אף פעם לא סוכנים/בוטים (חוץ משמות מוצרים כמו Grok Bot).

## Post dates (standing rule from Seffy, 2026-10-10)
The post date is the date of Seffy's ORIGINAL message where the story happened (the original ask), not the date he approved or asked to publish. Never give batch-published posts consecutive dates.
`date` in the frontmatter must always be that original-request date, and Ben supplies it with each post. Keep the slug (file name) unchanged when a date is corrected, so links don't break.

## Real chat screenshots (standing rule from Seffy, 2026-10-10)
Add real Grok Bot chat screenshots to posts now and then, only where they genuinely help the content. Follow the skill "Grok Bot chat screenshots" (/home/box/agent-data/workflows/grok-bot-chat-screenshots/SKILL.md): sharp, tight crops, privacy-safe, and Seffy approves every shot before it goes into a published post.

## ניקוד במילה שְׁלוּחִים (standing rule from Seffy, 2026-10-10)
In all reader-facing text (posts, pages, headings, summaries), every occurrence of the word שלוחים, including prefixed forms (השלוחים, לשלוחים, ושלוחים, משלוחים...), is written with the exact niqqud of the site header title: `שְׁלוּחִים` (copy it from `SITE.displayTitle` in `src/config.ts`, rendered in `src/layouts/Base.astro`). Prefix letters stay unpointed and are attached as-is: השְׁלוּחִים, לשְׁלוּחִים. Singular forms (שלוח, שלוחו) and the code/config `title` field are not affected.

Exception (Seffy, 2026-10-10): the header nav and footer link labels (`src/layouts/Base.astro`) stay plain, `השלוחים`, without niqqud. Everything else keeps `שְׁלוּחִים`.

Exception (Seffy, 2026-10-10): the site tagline (`tagline` in `src/config.ts`) is written exactly as ״שלוחו של אדם כמותו״ | מעשיות על שלוחים מבוססי שפה ואנשים בשר ודם, with no niqqud on שלוחים.

## English translations (/en/)
- Hebrew posts: `src/content/posts/he/<slug>.md` (URL: `/posts/<slug>/`).
- English posts: `src/content/posts/en/<same file name>.md` -> `/en/posts/<slug>/`. Same file name as the Hebrew one (the CMS, the sitemap alternates and the switcher pair them by it).
- Frontmatter: `title`, `description` (150–160 chars, rewritten for readers abroad), optional short `listDescription` for the story lists, `seoTitle`, `seoDescription` (70–160 chars) and `topics` (same topics as the Hebrew post), `date` (SAME as the Hebrew post), `draft: true` until Seffy approves, `lang: en`, `translationKey: "<Hebrew file name without .md>"`. Search-copy rules: [SEO-GEO.md](SEO-GEO.md).
- Chat bubbles: translate the text; add a line `original: <Hebrew text>` right after a message to show a collapsible "Hebrew original" under it.
- No niqqud in English text (only on `original:` lines). The build warns about it, and about Hebrew posts with no English pair.
- About in English: `src/content/pages/en/about.md` (`title`, `description`, `lang: en`, `translationKey: about`). Team: `name_en`, `role_en`, `category_en`, `example_en` in `src/data/shluchim.json`.
- Preview: `npm run build:drafts && npm run preview:drafts`, then open `/en/`.
