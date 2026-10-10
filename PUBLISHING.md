# מדריך פרסום לבן

1. צור קובץ חדש: `src/content/posts/YYYY-MM-DD-slug.md` (ה־slug באנגלית, הוא נהיה ה־URL).
2. Frontmatter חובה:
   ```yaml
   ---
   title: "כותרת"
   description: "משפט אחד שמופיע בעמוד הבית וב־RSS"
   date: 2026-10-09
   draft: true
   tags: ["אופציונלי"]
   ---
   ```
3. `draft: true` נשאר עד אישור מפורש של ספי. בלי יוצא מן הכלל.
4. טקסט שנכתב בשם ספי (גוף ראשון) כפוף ל־`/workspace/voice/seffy-voice-profile.md`.
5. תצוגה מקדימה לספי: `export PATH=~/.local/node22/bin:$PATH && npm run build:drafts && npm run preview:drafts`
   (הטיוטות מוצגות עם תג ״טיוטה״), ושלח לו צילום מסך של העמוד.
6. רק אחרי ש־ספי כתב במפורש שהוא מאשר: שנה ל־`draft: false`, הרץ `npm run build` (חייב לעבור),
   ואז `git add -A && git commit -m "post: <slug>" && git push origin main`.
7. ה־push ל־main מפרסם אוטומטית (GitHub Actions). אין לפרסם בשום דרך אחרת.
8. אישור שלא התקבל = לא מפרסמים. תיקון לפוסט שכבר פורסם עובר שוב דרך ספי.

## עריכת פוסט קיים
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
- Hebrew posts: `src/content/posts/he/<slug>.md` (URL unchanged: `/shluchim/posts/<slug>/`).
- English posts: `src/content/posts/en/<same file name>.md` -> `/shluchim/en/posts/<slug>/`. Same file name as the Hebrew one (the CMS, the sitemap alternates and the switcher pair them by it).
- Frontmatter: `title`, `description` (150–160 chars, rewritten for readers abroad), `date` (SAME as the Hebrew post), `draft: true` until Seffy approves, `lang: en`, `translationKey: "<Hebrew file name without .md>"`.
- Chat bubbles: translate the text; add a line `original: <Hebrew text>` right after a message to show a collapsible "Hebrew original" under it.
- No niqqud in English text (only on `original:` lines). The build warns about it, and about Hebrew posts with no English pair.
- About in English: `src/content/pages/en/about.md` (`title`, `description`, `lang: en`, `translationKey: about`). Team: `name_en`, `role_en`, `category_en`, `example_en` in `src/data/shluchim.json`.
- Preview: `npm run build:drafts && npm run preview:drafts`, then open `/shluchim/en/`.
