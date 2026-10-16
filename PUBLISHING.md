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

1. בדוק קודם ב־`main` העדכני, בענפים וב־PRs אם הפוסט או ניסיון פרסום שלו כבר קיימים. אם כן, ממשיכים את אותו ענף ו־PR. אחרת פותחים ענף חדש מ־`origin/main`, למשל `feat/<slug>`, ועדיף ב־worktree נפרד כדי לשמור שינויים של עבודה אחרת. צור בו קובץ חדש: `src/content/posts/he/YYYY-MM-DD-slug.md` (ה־slug באנגלית, הוא נהיה ה־URL).
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
   אישורים קיימים נשמרים גם כשמעבירים את העבודה לסביבה אחרת. בשלב הפרסום שנה בשתי השפות ל־`draft: false`.
   הרץ את כל בדיקות השחרור שמפורטות בהמשך, הוסף רק קבצים ששייכים לשינוי, צור commit ודחוף את ענף העבודה. פתח PR ל־`main`; אם הפרסום עדיין לא אושר, הוא נשאר טיוטה.
7. לפני מיזוג, גם `SEO guard` וגם עבודת `build` ב־`Deploy to GitHub Pages` חייבות לעבור על ה־SHA הנוכחי של ה־PR. בזמן PR עבודות הפריסה והבדיקה החיה מדולגות בכוונה. אחרי אישור פרסום ובדיקות ירוקות, מזג את ה־PR עם בדיקת ה־head SHA. המיזוג ל־`main` מפעיל את פריסת GitHub Actions הרגילה. לא דוחפים תוכן ישירות ל־`main`, לא עוקפים בדיקה אדומה ולא מפרסמים בדרך אחרת.
8. אישור שלא התקבל = לא מפרסמים. תיקון לפוסט שכבר פורסם עובר שוב דרך ספי.

## מסלול הפרסום הטכני הקבוע

**ענף → בדיקות מקומיות → PR → בדיקות GitHub → מיזוג → פריסה → בדיקה חיה.**

לפני PR, מיזוג או פריסה, קוראים שוב את
[שער השחרור](.agents/skills/lighthouse-release-guard/SKILL.md).
מריצים ב־worktree של השינוי, עם Node שתואם ל־`package.json`:

```sh
npm ci
npm test
npm run seo:check
npm run build
npm run test:story-loading
npm run perf:check
```

כל כתובת שמוגדרת ב־`scripts/performance-guard.mjs` נבדקת שלוש פעמים עם
Lighthouse 13.4.1 ובהגדרות המובייל הרגילות. החציון בכל כתובת חייב להיות 100.
לא משנים סף, רשימת כתובות, אנליטיקס, בקשות רשת או throttling כדי לקבל ירוק.
בדיקת `test:story-loading` בודקת בדפדפן אמיתי שתמונות רחוקות בדף הבית לא נטענות
עם התוכן הראשוני, שהן נטענות כשמתקרבים אליהן, ושהן זמינות גם בלי JavaScript
ובלי תמיכה במנגנון המשופר. היא רצה אחרי build וגם ב־CI לפני שער הביצועים.
בודקים גם את הפוסט החדש עצמו בעברית ובאנגלית: טקסט, סדר התמונות, חידוד,
RTL/LTR, canonical, hreflang, RSS, sitemap, מובייל ודסקטופ, הגדלת טקסט,
מקלדת וקריאה בלי JavaScript. לא מוסיפים קשר לפודקסט בלי שיוך מפורש של פרק;
הכללים לכך נמצאים ב־[PODCAST.md](PODCAST.md).

אם `npm ci` נכשל בגלל כתיבה ל־cache מחוץ לסביבה המותרת, משתמשים ב־
`npm ci --cache <writable-cache-directory>` ומשאירים את קובץ הנעילה כפי שהוא.
אם כלי הבנייה מנסה לכתוב הגדרות Astro לתיקיית בית שאינה נגישה, אפשר להגדיר
`XDG_CONFIG_HOME` לתיקייה מותרת ו־`ASTRO_TELEMETRY_DISABLED=1` לפקודת הבנייה.
אלה הגדרות מקומיות של כלי הפיתוח; GA4 של האתר ובדיקות Lighthouse נשארים פעילים.

### דחיפה ומיזוג עם החיבור הקיים

משתמשים בהרשאה הקיימת שמורשית ל־`seffyfisher/shluchim`. לא מחליפים credentials,
לא יוצרים token ולא משנים הגדרות אירוח בשביל פרסום תוכן. בודקים את זהות החשבון
ואת הרשאות הריפו לפני כתיבה; הימצאות של `GH_TOKEN` אינה הוכחה שזה החשבון הנכון.

אם ה־CLI אינו מורשה אבל חיבור GitHub הקיים כן מורשה, מסלול Git Data API עבד:
יוצרים blobs של הטקסט והקבצים הבינריים, בונים tree על ה־base tree של `main`,
מוודאים שכל blob SHA וה־tree SHA שווים לעותק המקומי שנבדק, יוצרים commit
וענף עבודה, ואז פותחים PR רגיל. מבצעים read-back של הענף ומשווים שוב לקבצים
שנבדקו. המסלול אינו עוקף את בדיקות ה־PR או את תהליך הפריסה.

אחרי timeout או תשובת `UNKNOWN`, קוראים את מצב הענף, ה־PR, המיזוג וה־workflow
לפני ניסיון נוסף. ממשיכים את מה שכבר נוצר; לא פותחים פוסט, ענף או PR כפול.
לא משתמשים ב־force push ולא משנים branch protection כדי להתקדם.

### אחרי המיזוג

1. שומרים את SHA המיזוג ואת קישור ריצת `Deploy to GitHub Pages` של אותו SHA.
2. ממתינים להצלחת `build` ואז `deploy`. מיזוג לבדו אינו הוכחה שהאתר פורסם.
3. בודקים את שני קישורי הפוסט החיים בדסקטופ ובמובייל: HTTP תקין, כותרת ותאריך,
   כל התמונות במקומות שאושרו, קישורי השפה, SEO, היעדר overflow ותפעול במקלדת.
   תצוגה מקומית אינה בדיקה של הכתובת החיה.
4. קוראים גם את תוצאת `production-performance` ושומרים את הראיות. ייתכן ש־
   `deploy` הצליח, וה־workflow כולו אדום בגלל בדיקה שבאה אחריו. מדווחים בנפרד
   מה פורסם ומה נכשל; לא משווים כשל בדיקה לכישלון פריסה ולא מבטיחים ציון חי 100
   על סמך בדיקה מקומית. כשל חי דורש חקירה לפני שחרור נוסף, בהתאם לשער השחרור.
5. אם הסביבה אינה יכולה לגשת לאתר החי, מדווחים את שגיאת הגישה ואת הבדיקה שעדיין
   חסרה ומעבירים את הכתובות לבדיקה בדפדפן שיכול לגשת אליהן. לא מסמנים אותה כעברה.
   הודעת השגיאה של בדיקת cache אינה מוכיחה מי מנהל את ספק האירוח; שינוי תשתית
   דורש זיהוי של השכבה בפועל ואישור מתאים, ונשאר מחוץ לפרסום התוכן.
6. מחזירים את שני קישורי הפוסט, PR, SHA, קישור פריסה, תוצאות הבדיקות וכל חסימה
   שנותרה. מזכירים לבקש אינדוקס כשצריך. `IndexNow` פועל רק אם הוא כבר מוגדר;
   עבודה שמדולגת אינה הוכחה שכתובות הוגשו למנוע חיפוש.

## העברת טקסט ותמונות מאושרים מ־Library

הסביבה שמפרסמת היא זו שאחראית להשיג קבצים קריאים מקומית. נתיב של קובץ בסביבה
אחרת אינו קובץ מקומי, והצלחה של `prepare_materialize` לבדה אינה הצלחה של ההעברה.

- מתחילים מהמזהים המדויקים של המקור המאושר ב־Library, כולל הגרסה או מזהה הקובץ
  שנמסרו. קוראים את מיומנות Library הנוכחית ומשתמשים במסלול הגישה ובהלפרים
  העדכניים שהיא מספקת. לא שומרים signed URLs, tokens או headers בריפו או בלוגים.
- כשנדרשים bytes מקומיים, משלימים את מסלול ההעברה הנתמך, כולל metadata של Library,
  ואז מוודאים שהקובץ קיים, אינו ריק וניתן לקריאה. בתמונה בודקים גם פענוח, מידות
  ו־SHA-256. אם ההורדה נכשלת, מדווחים זאת; לא מעתיקים נתיב או מסמנים קובץ מדומה.
- מסלול תוכן חלופי שעבד עבור [הפוסט הזה](https://github.com/seffyfisher/shluchim/pull/34):
  קובץ HTML עצמאי שאושר הכיל את כל הטקסט ושלוש תמונות PNG מוטמעות כ־data URIs.
  הורדה ישירה נכשלה, אבל `read` מלא של Library החזיר את כל ה־HTML. לפני חילוץ
  וידאנו ש־`len(text.encode('utf-8'))` שווה בדיוק ל־`size_bytes` של הגרסה המאושרת,
  שאין המשך או קיטוע חסר, ושהתמונות המוטמעות תואמות למזהי התמונות שאושרו.
  שחזרנו את bytes ה־PNG, אימתנו קריאה, מידות וגדלים, ושמרנו את זהות המקור
  והגרסה עם הקבצים. זהו חילוץ נכסים לפרסום מתוך תוכן מאושר שנקרא במלואו;
  לא טענה שההורדה שנכשלה הצליחה, ולא תחליף לתוכן חלקי או לתמונה מקדימה.
- שומרים בדיוק את סדר פסקאות המקור, הכותרות, התמונות וה־alt שאושרו. אין התאמה
  לפי שם תמונה או כותרת בלבד. משווים את רצף בלוקי הגוף גם אחרי בניית האתר.
  מסירים מעטפת עיצוב של מסמך ההדגמה ומשתמשים בתבנית הפוסט הקיימת של האתר.
- מהמקור המאושר יוצרים WebP באיכות 90 ומעלה, ברוחב 1024 וברוחב המקורי כשאפשר,
  עם `srcset` דרך המסלול הקיים. אין crop או upscale כדי להתאים מידה קבועה.
  שומרים את המידות והיחס שאושרו, ואת המקור וה־provenance מחוץ לתיקיית הנכסים הציבוריים.

בפרסום מ־15 באוקטובר 2026 ה־HTML המלא היה 7,587,699 bytes, וכל שלוש התמונות היו
1536×1024. כל 40 בלוקי הגוף בעברית הושוו למקור המאושר. אלה ראיות למקרה הזה,
לא גדלים או כמות בלוקים שצריך להניח בפרסום הבא.

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
