<div dir="rtl">

# הוספת ערבית (ar) לבלוג שְׁלוּחִים: מחקר ותוכנית יישום

- **Linear:** SEF-263
- **סטטוס:** מחקר ותוכנית בלבד. לא כותבים קוד ולא מתרגמים לפני ש־SEF-197 (הקידום של לורן ברשתות) נסגר.
- **נכתב:** 30 באוקטובר 2026 (שעון ישראל)
- **בסיס הקוד שנבדק:** worktree `/workspace/shluchim-home-who-face`, ענף `home-who-face`, commit `ae1d481` (30.10.2026, ‏13:25 שעון ישראל). לפני תחילת שלב A צריך לעבור שוב על הממצאים מול `origin/main`.
- **אתר חי:** https://shluchim.shinlamed.com/

---

## 0. תקציר מנהלים

1. **אפשר להוסיף ערבית בלי לשבור את העברית, אבל לא מספיק "להוסיף `ar` לרשימה".** המערכת בנויה בכמה מקומות סביב ההנחה שיש בדיוק שתי שפות: `other()`, ‏`langOf()` (כל מה שאינו `en/` נחשב עברית), תנאים בצורה `he ? … : …` ב־24 קבצים, ומבני נתונים כמו `name_en`. בלי ריפקטור, עמודים בערבית יקבלו בשקט טקסט בעברית או באנגלית.
2. **כתובות: `/ar/`** (כמו `/en/`). העברית נשארת בשורש, ו־`x-default` ממשיך להצביע על האנגלית. ‏hreflang: ‏`ar` בלי קוד אזור.
3. **ניב: ערבית ספרותית מודרנית (MSA, فصحى).** זה תוכן אינפורמטיבי לקהל בכל העולם הערבי. גוגל ומנועי ה־AI מבינים ומצטטים MSA בעקביות הגבוהה ביותר, וזו גם השפה שבה כתובים העמודים הערביים של IBM ו־AWS על "وكلاء الذكاء الاصطناعي". את המונחים עצמם בוחרים לפי מה שאנשים באמת מחפשים.
4. **פונט: Readex Pro** לגוף הטקסט, לכותרות ולממשק. הוא נבנה לקריאוּת (שיטת Lexend, בעיצוב ד״ר נדין שאהין), במבנה נסח' עם קו אחיד שמתאים ל־Polin. קובץ variable אחד במשקלים 400–700 שוקל כ־22.9KB בתת־הקבוצה הערבית, פחות משני קובצי Polin שהאתר כבר טוען. בלי פונט כזה הטקסט הערבי ייפול לפונט המערכת: לאף אחד מ־9 הפונטים באתר אין אף גליף ערבי.
5. **הסיכון המיתוגי הגדול: התעתיק "شلوخيم" הוא המונח שבו הוויקיפדיה הערבית (المعرفة) מתארת את שלוחי חב״ד.** תעתיק ישיר של השם יכניס את הבלוג לאותה התנגשות שיש בעברית, ואולי לרגישות גדולה ממנה. ההמלצה: הלוגו נשאר `Shluchim` באותיות לטיניות עם הסבר בערבית. בטקסט עצמו כותבים "مبعوثيّ" בקול של ספי, ו־"وكلاء الذكاء الاصطناعي" בטקסט לחיפוש. ההחלטה הסופית אצל ספי.

---

## 1. מיפוי: איפה he/en קבועים בקוד

מקרא: 🔴 שובר או מציג טקסט בשפה הלא נכונה · 🟡 צריך הרחבה · 🟢 עובד גם לערבית בלי שינוי

### 1.1 ליבה (i18n, תוכן, ניתוב)

| קובץ | מה קבוע | השלכה | שינוי נדרש |
| --- | --- | --- | --- |
| `astro.config.mjs` | `locales: ['he','en']` | 🟡 | ‏`['he','en','ar']`. ‏`prefixDefaultLocale: false` נשאר |
| `src/i18n/ui.ts` | `LOCALES`, ‏`LANG_META` (he/en), ‏`UI` (55 מפתחות בשפה), ‏`other()` בינארי | 🔴 `other('ar')` מחזיר `he`. מתג השפה תומך בשתי שפות בלבד | ‏`LANG_META.ar = { dir:'rtl', og:'ar_AR', label:'العربية', intl:'ar-u-nu-latn', wpm:~150 }`, להוסיף `UI.ar`, ולהחליף את `other()` ב־`otherLangs(lang)` שמחזיר מערך |
| `src/lib/seo.ts` | `export type Lang = 'he' \| 'en'` (שכפול) | 🟡 | לייבא את `Lang` מ־`i18n/ui` כדי שיהיה מקור אמת אחד |
| `src/content.config.ts` | `z.enum(['he','en'])`, ‏glob ‏`{he,en}/**/*.md` (posts ו־pages) | 🔴 קבצים תחת `ar/` לא ייטענו | להוסיף `ar` ל־enum ול־glob |
| `src/lib/posts.ts` | `langOf = id.startsWith('en/') ? 'en' : 'he'`, ‏`slugOf` (`he\|en`), ‏`getTranslation` בינארי, ‏`readingLabel` (`lang==='en' ? EN : HE`) | 🔴 **באג שקט:** כל פוסט בערבית יסווג כעברית. זמן הקריאה יופיע בעברית | ‏`langOf` לפי הקידומת של התיקייה. ‏`getTranslations(p)` שמחזיר מפה לכל השפות. תווית זמן קריאה בערבית ("دقيقة قراءة" / "دقائق قراءة") |
| `src/config.ts` | `SITES = {he, en}`, ‏`PERSON.name/description`, ‏`SEO_HOME`, ‏`SEO_KEYWORDS`, ‏`OG_IMAGE.file/alt`, ‏`ABOUT_AVATAR` | 🟡 | להוסיף `ar` לכולם. ‏`ABOUT_AVATAR.ar` = הסט של העברית (פונה שמאלה, מתאים ל־RTL) 🟢 |
| `src/data/topics.mjs` | `he`/`en` לכל נושא (label, chip, title, seoTitle, seoDescription, intro) | 🟡 4 נושאים × 6 שדות | להוסיף `ar` |
| `src/data/shluchim.json` | שדות `name_en`, ‏`role_en`, ‏`category_en`, ‏`example_en` | 🟡 15 שְׁלוּחִים × 4 שדות | עדיף להמיר למבנה `{he,en,ar}` לכל שדה. לפחות להוסיף `*_ar` |
| `src/data/friends.ts` | `{ he, en, url }` לכל קישור, 16 אנשים | 🟡 | להוסיף `ar` |

### 1.2 Layout ורכיבים

| קובץ | מה קבוע | השלכה |
| --- | --- | --- |
| `src/layouts/Base.astro` | hreflang בלולאה על `['he','en']`, ‏`x-default = alternates.en ?? alternates.he`, ‏`og:locale:alternate` אחד בלבד, ‏`alternateName: PERSON.name[lang==='he'?'en':'he']`, ‏preload של פונט התצוגה לפי `lang==='he'` (אחרת Young Serif), מתג שפה יחיד, פיצול הכותרת סביב "של" מנוקד (רק לעברית) | 🔴 בעמוד ערבי לא יופיע hreflang ל־ar, ייטען פונט לטיני, ובמתג יהיה רק "עברית". **צריך:** לולאה על `LOCALES`, ‏`og:locale:alternate` לכל שפה אחרת, ‏preload לפי מפה (`ar` → Readex Pro), ומתג שפה עם שלוש אפשרויות (שני קישורים ב־CSS בלבד, בלי JS) |
| `HomePage.astro` (11 תנאים), ‏`TeamPage.astro` (11), ‏`FriendsPage.astro` (24), ‏`CollaborateBlock.astro` (8), ‏`FeaturedStories.astro` (4), ‏`ThemeToggle.astro` (4), ‏`AboutPage.astro` (3), ‏`OnlineReaders.astro` (2), ‏`PostPage.astro` (2), ‏`TopicPage.astro` (1) | `const he = lang==='he'` ואז `he ? HE : EN` | 🔴 בערבית יוצג **טקסט באנגלית** בכל מקום כזה. **צריך:** להעביר כל מחרוזת למילון `UI` (או למילון מקומי `Record<Lang,…>`), כך ש־`satisfies Record<Lang,…>` יכשיל את הטייפצ'ק אם חסרה שפה |
| `src/lib/presence.ts` (3), ‏`image-viewer.mjs` (`lang==='en' ? EN : HE`), ‏`remark-chat.mjs` (`L[lang] ?? L.he`), ‏`idea-prompt.ts`, ‏`follow.ts` (`FollowLang = 'he'\|'en'`), ‏`post-md.ts` (author), ‏`featured.mjs` (`lang==='en'`) | | 🔴 ב־image-viewer וב־remark-chat הערבית תקבל עברית, ב־presence אנגלית, ו־featured לא ירש את ה־featured של העברית. כל אלה צריכים מילון ar |
| `remark-chat.mjs` (`chat-he`, ‏`original:`) | בשפה שאינה עברית מוצג "המקור העברי" בתוך `<details>` | 🟢 **אפשר להשתמש בזה כמו שהוא:** גם בפוסט בערבית נשמור את הציטוט העברי המקורי כראיה ממקור ראשון. צריך רק `L.ar` (תוויות: "المحادثة الأصلية بالعبرية") |
| `PostPage.astro` | `lang==='he' && FeedbackBlock`, וגם קריאה ל־WhatsApp רק בעברית | 🟢 בהתחלה הערבית מתנהגת כמו האנגלית: בלי טופס ובלי WA. פתוח להחלטה |
| `ReadyBotsPage`, ‏`FeedbackWallPage`, ‏`PodcastListen`, ‏`podcast.ts` | עברית בלבד | 🟢 נשארים בעברית בלבד, כמו באנגלית |
| `src/pages/404.astro` | ניווט בעברית ואנגלית, בלוק `In English` | 🟡 להוסיף בלוק `بالعربية` עם `lang="ar" dir="rtl"` |
| `src/styles/global.css` | כללי `:root[dir="ltr"]` וברירות מחדל ל־RTL | 🟢 ערבית יורשת את כל פריסת ה־RTL של העברית: גריד, בועות, היפוך אווטרים. 🔴 `letter-spacing: -.01em` (שורה 362) ו־`.04em` (מתג השפה) **שוברים את חיבור האותיות** בערבית ולכן חייבים להתאפס ב־`:lang(ar)` |

### 1.3 SEO, מכונות ובדיקות

| קובץ | מה קבוע | שינוי נדרש |
| --- | --- | --- |
| `src/lib/i18n-check.mjs` | `checkTranslations` בודק רק he→en. ‏`urlPairs` בונה זוגות `[he, en]` ו־`x-default=en`. ‏`lastmods` רץ על `[['he',''],['en','en/']]` | להפוך לקבוצות של N שפות: `{he, en?, ar?}`. כל עמוד מפנה רק לשפות שקיימות בפועל, ו־`x-default` = en אם קיים, אחרת he. להוסיף אזהרה: "X/33 פוסטים בלי ערבית" |
| `src/lib/seo-check.mjs` | `BRAND {he,en}`, ‏`seen {he,en}`, לולאה על `['he','en']`, השוואת topics בין he ל־en בלבד, ובדיקת ניקוד "אם לא עברית" | להוסיף `ar` (`BRAND.ar`). ניקוד עברי בטקסט SEO בערבית = שגיאה (הבדיקה הקיימת כבר תתפוס את זה). להוסיף כלל מותג לערבית (ראו §5.3) ולהשוות topics בין כל השפות |
| `src/lib/list-guard.mjs` | זוגות `[he,index.html]`, ‏`[en,en/index.html]`. ה־regex ‏`(?:en/)?posts`. מספר הפוסטים ב־HE וב־EN חייב להיות זהה | להוסיף `ar/index.html` ולשנות את ה־regex ל־`(?:(?:en\|ar)/)?posts`. עד שהתרגום מלא: שוויון מספרים רק בין he ל־en, ובערבית לבדוק רק שכל מה שפורסם מופיע ברשימה |
| `src/lib/indexnow.mjs` | `PREFIX {he:'',en:'en/'}`, ‏regex ‏`(he\|en)`, לולאות | להוסיף `ar:'ar/'` |
| `src/pages/llms.txt.ts`, ‏`llms-full.txt.ts` | פרקים English + עברית, ו־"Available in Hebrew and English" | להוסיף פרק `## القصص (العربية)` ולעדכן את פסקת השפות |
| `src/pages/rss.xml.ts`, ‏`en/rss.xml.ts`, ‏`lib/feed.ts` | פיד לכל שפה | 🟢 להוסיף `src/pages/ar/rss.xml.ts` (שורה אחת). ‏`<language>ar</language>` |
| `src/pages/en/*` | 7 קבצים (index, about, team, friends, topics/[slug], posts/[...slug], posts/[slug].md, rss) | לשכפל ל־`src/pages/ar/`. אלה עטיפות של שורה אחת שמעבירות `lang` |
| `src/pages/og/posts/[image].jpg.ts`, ‏`media/story-previews` | `getPosts('he')` + `getPosts('en')` | להוסיף `ar` |
| `scripts/og-card/card.html` | `?lang=he\|en` | להוסיף `?lang=ar` עם Readex Pro, ולייצר `public/og/shluchim-ar.jpg` |
| `public/admin/config.yml` (Sveltia/Decap) | `locales: [he, en]`, ורמזים (hints) שמדברים על "באנגלית" | ‏`locales: [he, en, ar]`. לתקן את ההערה "same file name = a pair" (בפועל הזוגות לפי `translationKey`, ושמות הקבצים ב־EN שונים, ראו §4). להוסיף רמזים לערבית |
| `scripts/performance-guard.mjs` | רשימת כתובות ל־Lighthouse (`/`, ‏`/en/`, …) | להוסיף את `/ar/` ופוסט אחד בערבית. **מוסיפים בלבד.** אסור לשנות סף |
| בדיקות: `test-featured-build.mjs`, ‏`test-software-gifts.mjs`, ‏`test-view-transitions.mjs`, ‏`test-idea-copy.py`, ‏`*.test.mjs` | לולאות `['he','en']` | להוסיף `ar` ולבדוק `dir=rtl`, ‏`lang=ar` ו־hreflang |
| `src/pages/robots.txt.ts`, ‏sitemap | | 🟢 אין שינוי. ה־sitemap יקבל את הקבוצות מ־`urlPairs` |

### 1.4 heOnly

- השדה `heOnly` מוגדר בסכמה ונבדק ב־i18n-check וב־list-guard, אבל **אין היום אף פוסט עם `heOnly: true`**. נבדק עם `rg heOnly src/content`.
- להחלטה: כשמוסיפים ערבית, להחליף אותו בשדה כללי, `languages: ['he','en']` או `skipLangs: ['ar']`, במקום להמציא `noAr`. כדי לא לשבור תוכן קיים, להשאיר את `heOnly` כקיצור דרך.

---

## 2. סכימת URL ו־RTL

### 2.1 ההמלצה: `/ar/`

| אפשרות | יתרון | חיסרון | הכרעה |
| --- | --- | --- | --- |
| **`/ar/` בתיקייה** | אותו דפוס כמו `/en/`. סמכות הדומיין (שעדיין קטנה) משותפת לכל השפות. ‏Astro i18n תומך בזה בלי שום הגדרה. ‏GSC אחד, sitemap אחד | | ✅ |
| `ar.shluchim.shinlamed.com` | | גוגל מתייחס לתת־דומיין כאתר נפרד. האתר הזה כבר תת־דומיין חדש עם סמכות נמוכה, ופיצול נוסף יחליש אותו. צריך גם DNS, Pages ו־GSC נוסף | ❌ |
| `?lang=ar` | | גוגל לא ממליץ על פרמטרים לשפה, ואתר סטטי לא יכול להחליף שפה לפיהם | ❌ |

- **slug:** כמו באנגלית, slug באותיות לטיניות. אפשר להשתמש ב־slug של הפוסט האנגלי (`/ar/posts/2026-10-12-my-shluchim-can-make-phone-calls/`), או ב־slug ייעודי בלטינית. **לא** slug בערבית: כתובת עם percent-encoding ארוכה, נשברת בשיתוף, ואין לה ערך SEO מוכח. ההמלצה: שם הקובץ בערבית = שם הקובץ באנגלית, והזוג מקושר דרך `translationKey`.
- **hreflang:** ‏`ar` בלי אזור. לפי Google Search Central מותר לציין קוד שפה בלבד, וזה מתאים לקהל בכל העולם הערבי. כל עמוד מפרט את עצמו ואת כל הגרסאות האחרות **שקיימות**, והקישורים חייבים להיות הדדיים. הבדיקה הקיימת ב־seo-check כבר אוכפת את זה.
- **x-default:** נשאר האנגלי. זו ברירת המחדל לקורא שהשפה שלו לא נתמכת, ואין סיבה לשנות.

### 2.2 RTL: מה עובד כמו שהוא ומה נשבר

**עובד כמו שהוא (🟢):** ‏`dir="rtl"` דרך `LANG_META`. כל כללי ה־CSS המבוססים על `[dir=rtl]` ו־logical properties (`margin-inline-start` וכו'). הסט "פונה שמאלה" של האווטרים. המראה של באשר מול הכפתור (`test-idea-copy`). בלוקי קוד שמוגדרים `direction:ltr`. ‏`unicode-bidi: isolate` על `code`.

**נשבר או דורש תשומת לב (🔴/🟡):**
1. **פונט:** לאף אחד מ־9 קובצי ה־woff2 באתר אין גליפים ערביים. בדקתי את ה־cmap בכולם, ובכל אחד יש 0 תווים בטווח U+0600–06FF. בלי פונט ערבי הדפדפן יציג Tahoma, Geeza Pro או Noto לפי מערכת ההפעלה, והעמוד ייראה אחרת בכל מכשיר. ראו §8.
2. **letter-spacing:** כל ערך שאינו 0 שובר את החיבור בין האותיות. חייבים `:lang(ar) * { letter-spacing: 0 !important }`, או לאפס כל מקום בנפרד (global.css:362 ו־384, ו־podcast.css:4, שלא רלוונטי לערבית).
3. **Italic:** אין לו מקבילה בערבית, והדפדפן מייצר נטייה מלאכותית ומכוערת. ב־`:lang(ar)`: ‏`em, i { font-style: normal; font-weight: 600 }` ו־`font-synthesis: none`.
4. **ספרות:** ב־`Intl` הלוקאל `ar` מציג בחלק מהמנועים ספרות הודיות־ערביות (٠١٢٣). ההמלצה: `ar-u-nu-latn` לתאריכים ולמספרים, כדי שיתאימו למספרים שבגוף הפוסטים, בצילומי המסך ובציטוטים. זו גם הנורמה בלבנט ובצפון אפריקה. פתוח לשינוי אם הקהל העיקרי במפרץ או במצרים.
5. **תוכן מעורב:** שמות מוצרים באנגלית (Grok Bot, Linear, GA4) בתוך משפט ערבי. משתמשים ב־`<bdi>` או `dir="ltr"` רק כשיש פיסוק בקצוות. רכיב ה־chat כבר עוטף בצורה נכונה.
6. **ניקוד מול חרכאת:** בדיקת הניקוד העברי (`[\u0591-\u05C7]`) לא נוגעת בחרכאת הערבית (U+064B–065F), ולכן ניקוד ערבי חלקי (למשל "مبعوثيّ") מותר. בגוף הטקסט ההמלצה היא בלי ניקוד, חוץ מאשר במילים שבלעדיו הן דו־משמעיות.
7. **line-height:** לערבית יש עולים ויורדים גבוהים יותר. ‏`.prose { line-height: 1.8 }` מספיק לגוף הטקסט. בכותרות (1.1–1.3) צריך להעלות ל־1.35–1.45 ב־`:lang(ar)` כדי שנקודות ושִׁין לא ייחתכו.

---

## 3. SEO / GEO בערבית לנישה הזאת

### 3.1 ניב: **MSA (فصحى معاصرة)**. ההכרעה: MSA, לא לבנטינית

- **התוכן אינפורמטיבי ולא מקומי.** סיפורים "מה ביקשתי ומה יצא" הם שאילתות ידע. מדריכי SEO ערביים (RankPearl, Crawl To Click) מסכימים ש־MSA שולטת בשאילתות אינפורמטיביות ופאן־ערביות, וניב מנצח רק בשאילתות מסחריות ומקומיות.
- **גוגל ומנועי ה־AI מבינים MSA הכי טוב.** לפי Crawl To Click, עמוד בניב בלבד יכול לדרג נמוך יותר מעמוד MSA על אותו מושג. מנועי תשובות מצטטים מקורות "סטנדרטיים".
- **השוק המקצועי כותב MSA:** הדפים הערביים של IBM (`/sa-ar/think/ai-agents`) ושל AWS (`/ar/what-is/ai-agents/`), והמילון של SDAIA (רשות הנתונים וה־AI הסעודית, יחד עם אקדמיית המלך סלמאן לשפה הערבית), שקבע את "وكيل" כתרגום האחיד ל־agent.
- **בקרת איכות:** מבקר שפת אם יכול לאשר MSA בכל מדינה. לבנטינית מוגבלת לקוראים מהלבנט, ואין לה כתיב תקני.
- **הקול של ספי:** MSA קלה, בגוף ראשון, במשפטים קצרים. לא ספרותית ולא עיתונאית. ציטוטים מצ'אטים אמיתיים מתורגמים ל־MSA, והמקור העברי מוצג ב־`<details>`.

### 3.2 מילות מפתח (בלי להמציא נתונים)

אין לנו היום נתוני נפח לערבית. הרשימה הזאת היא **השערות לבדיקה**, לא יעדים:

| מושג | מועמדים בערבית | מקור למינוח | הערה |
| --- | --- | --- | --- |
| AI agent(s) | وكيل ذكاء اصطناعي / وكلاء الذكاء الاصطناعي | SDAIA, ‏ETHGlossary, ‏IBM, ‏AWS | המונח המרכזי. "العميل" פירושו לקוח, להימנע |
| AI assistant | مساعد ذكاء اصطناعي / المساعد الذكي | | המקבילה של "עוזרי AI" |
| AI at work | الذكاء الاصطناعي في العمل | | נושא `ai-at-work` |
| everyday AI | الذكاء الاصطناعي في الحياة اليومية | | נושא `everyday-ai` |
| practical AI / use cases | استخدامات عملية للذكاء الاصطناعي / أمثلة حقيقية | | |
| automation | أتمتة المهام | | |
| Grok Bot | Grok Bot (בלטינית) + "غروك بوت" רק במילות מפתח | | אנשים מחפשים שמות מוצרים באנגלית. בדיקה ב־GSC |
| שְׁלוּחִים | مبعوثون / Shluchim | | ראו §7.1 |

**שיטת עבודה (לפי RankPearl, Topical Map ו־muhammadammar):**
1. לפני כתיבת seoTitle בערבית: autocomplete של גוגל בערבית, בהגדרות של ישראל, ירדן, סעודיה, מצרים ואיחוד האמירויות, עם מילות שאלה (`كيف`, ‏`ما هو`, ‏`أفضل`). רושמים מה הופיע בפועל.
2. מאחדים וריאנטים של כתיב (همزة, ة/ه, ى/ي) לאשכול אחד.
3. אחרי 4–8 שבועות: שאילתות אמיתיות מ־GSC (סינון `/ar/`) מחליפות את ההשערות.
4. **אסור** להמציא מספרים, שאלות FAQ או "סטטיסטיקות". זה כבר הכלל של SEO-GEO.md וחל גם בערבית.

### 3.3 מטא־דאטה טכני

| רכיב | ערך לערבית | הערה |
| --- | --- | --- |
| `<html lang dir>` | `lang="ar" dir="rtl"` | |
| hreflang | `ar` | הדדי, ראו §2.1 |
| `og:locale` | `ar_AR` | הלוקאל של Facebook לערבית כללית. בעמודים שיש להם גרסאות אחרות: ‏`og:locale:alternate` = ‏`he_IL`, ‏`en_US` |
| JSON-LD `inLanguage` | `ar` | ‏seo-check כבר דורש ש־`inLanguage` יהיה זהה ל־`html lang` |
| JSON-LD `Person` | `name: "سيفي فيشر"`? | **לבדוק עם ספי** איך הוא רוצה לכתוב את שמו (سيفي / سفي). ‏`alternateName`: ‏`["Seffy Fisher","ספי פישר"]` (כרגע `alternateName` הוא ערך יחיד, ויש להפוך אותו למערך) |
| `WebSite.alternateName` | `["Shluchim","שְׁלוּחִים", <השם הערבי>]` | |
| RSS | `/ar/rss.xml`, ‏`<language>ar</language>` | |
| `llms.txt` | פרק ערבי + פסקת הבהרה: "ليس عن مبعوثي حركة حباد" | ההבהרה הזאת כבר קיימת באנגלית ומתורגמת |
| כרטיס שיתוף | `og/shluchim-ar.jpg` | כרטיס חדש עם Readex Pro |
| IndexNow | `PREFIX.ar = 'ar/'` | ‏Bing ו־Yandex. ל־Yandex יש נוכחות שולית בעולם הערבי, ל־Bing חלקית. ‏Bing מזין את Copilot |
| Search Console | ה־property הקיים (Domain או URL-prefix) כבר מכסה את `/ar/` | לא צריך property חדש. אפשר להוסיף URL-prefix ‏`…/ar/` רק לדוחות נפרדים. להגיש מחדש את ה־sitemap ולבקש אינדוקס ל־`/ar/` ול־5 פוסטים |
| Bing Webmaster | אותו דבר | דוח AI Performance לפי שפה |

### 3.4 GEO: מנועי תשובות

- הכללים הקיימים חלים גם כאן: הפסקה הראשונה עם המספר האמיתי, טבלאות, קישורים למקור ראשוני ו־`updated`.
- **הזדמנות:** בערבית יש מעט תוכן ממקור ראשון על עבודה יומיומית עם סוכני AI ועל Grok Bot. רוב מה שקיים הוא תוכן שיווקי של ספקים. סיפור אמיתי, עם צילומי מסך, במונח "وكلاء الذكاء الاصطناعي", הוא מועמד טבעי לציטוט. זו הערכה ולא נתון.
- בבדיקה החודשית הידנית ב־ChatGPT, ‏Perplexity, ‏Gemini ו־Claude מוסיפים שתי שאלות בערבית, למשל "أمثلة حقيقية على استخدام وكلاء الذكاء الاصطناعي في العمل اليومي".
- הקידום מחוץ לאתר הוא המנוף הגדול: קהילות AI בערבית, ולינקדאין ופייסבוק בערבית. לורן, אחרי SEF-197, בסבב נפרד.

---

## 4. מלאי תוכן לתרגום

**הערת דיוק:** ההנחה שהזוגות עברית/אנגלית חולקים "אותו שם קובץ" לא מדויקת. ב־24 מתוך 33 הזוגות שפורסמו שמות הקבצים שונים (למשל `he/2026-10-12-dial-bot.md` ↔ ‏`en/2026-10-12-my-shluchim-can-make-phone-calls.md`), והזיווג נעשה דרך `translationKey`. ההערה ב־`config.yml` ("same file name = a pair") מטעה, וכדאי לתקן אותה בשלב A.

### 4.1 פוסטים

| | עברית | אנגלית | ערבית (יעד) |
| --- | --- | --- | --- |
| קבצים | 36 (כולל `example-draft` ו־2 טיוטות) | 35 | |
| **פורסמו** (`draft: false`) | **33** | **33** | **33** |
| מילים (`wc -w`, כולל frontmatter) | ‏~20,250 | ‏~27,800 | תרגום מהעברית: ‏~20–23 אלף מילים |
| טיוטות | `work-outlook-browser`, ‏`lighthouse-four-hundreds` | אותן שתיים | מתרגמים רק אחרי שהן מתפרסמות |

**מקור התרגום: העברית, עם האנגלית ככלי בקרה.** העברית היא הטקסט שספי אישר ובקול שלו, ושתי השפות שמיות וקרובות במבנה. האנגלית עוזרת לוודא שהמשמעות לא אבדה, ומוכנה גם בניסוח בינלאומי, בלי הקשר ישראלי מקומי.

### 4.2 עמודים וממשק

| עמוד / רכיב | באנגלית היום? | ערבית? | היקף |
| --- | --- | --- | --- |
| UI chrome (`UI` ב־ui.ts) | ✅ | ✅ | 55 מפתחות |
| מחרוזות שפזורות ברכיבים (§1.2) | ✅ | ✅ | ‏~70 מחרוזות, אחרי שמעבירים אותן למילון |
| בית `/ar/` | ✅ | ✅ | ‏SEO_HOME, תווית "מוצגים", הודעת "בדרך" |
| אודות `/ar/about/` | ✅ (`pages/en/about.md`, ‏7.5KB) | ✅ | ‏`pages/ar/about.md` |
| צוות `/ar/team/` | ✅ | ✅ | 15 שְׁלוּחִים × 4 שדות |
| בני אנוש `/ar/friends/` | ✅ | ✅ | 16 אנשים (תיאור + תוויות קישור) |
| נושאים `/ar/topics/*` | ✅ (4) | ✅ (4) | 4 × 6 שדות |
| RSS, ‏llms, ‏404 | ✅ | ✅ | |
| קישורים `/links/` | ❌ עברית בלבד | ❌ | נשאר בעברית, כמו באנגלית |
| פידבקים `/feedback/` | ❌ | ❌ | נשאר בעברית |
| פודקסט `/podcast/` | ❌ (קישור "Podcast (in Hebrew)") | ❌ | קישור "البودكاست (بالعبرية)" |
| טופס פידבק, ‏CTA לוואטסאפ | ❌ | ❌ בשלב הראשון | פתוח (צריך לבדוק אם ה־Edge Function ‏`feedback` מקבל שפה) |
| כרטיס OG | ✅ | ✅ | כרטיס חדש |
| alt של תמונות בפוסטים | ✅ | ✅ | חלק מהפוסט |
| טקסט בתוך האיורים | | ❌ | לא מחליפים איורים. כמו באנגלית |

---

## 5. תהליך עבודה וכללים קבועים

### 5.1 מי מתרגם (המלצה)

1. **טיוטה:** שליח הכתיבה (כנרת) מתרגם מהעברית ל־MSA לפי מדריך סגנון ערבי (§5.4), ובודק מול האנגלית.
2. **ביקורת של דובר שפת אם (חובה):** מבקר אנושי, דובר ערבית כשפת אם, שמכיר את התחום, למשל ערבי־ישראלי מעולם ההייטק. הוא בודק טבעיות, מונחים ורגישויות. בלי זה אין אישור. ‏~20 אלף מילים בקצב של כ־2,000–2,500 מילים ביום הם 8–10 ימי ביקורת. העלות לא ידועה, וצריך הצעת מחיר.
3. **אישור ספי (חובה, כמו בעברית):** ספי מאשר את **הטקסט הערבי המלא** לפני פרסום. אם ספי לא קורא ערבית, המסלול: (א) תרגום חוזר לעברית, שמכין שליח אחר, מוצג לספי לצד הערבית, (ב) המבקר מאשר בכתב שהערבית נאמנה, (ג) ספי מאשר את שני הדברים יחד. ראו שאלה פתוחה 2.
4. **בלי פרסום חלקי בנושא רגיש:** פוסט שהמבקר מסמן כרגיש, דתית או פוליטית, עובר שוב לספי עם הסימון.

### 5.2 טקסט מוצע ל־PUBLISHING.md (סעיף חדש)

```markdown
## ערבית (standing rule from Seffy, <תאריך האישור>)

- ערבית היא השפה השלישית של הבלוג, תחת `/ar/`. קבצים: `src/content/posts/ar/<slug>.md` עם `lang: ar`
  ו־`translationKey` של הפוסט העברי. שם הקובץ זהה לשם הקובץ האנגלי.
- ניב: ערבית ספרותית מודרנית (MSA), קלה ובגוף ראשון, בקול של ספי. ציטוטי צ'אט מתורגמים, והמקור העברי
  נשמר בבלוק `chat-he` / בשורת `original:`, כמו באנגלית.
- מתרגמים מהעברית המאושרת ובודקים מול האנגלית. לא מוסיפים עובדה, מספר או ציטוט שאין במקור.
- `draft: true` נשאר עד ש: (1) דובר ערבית כשפת אם בדק ואישר בכתב, ו־(2) ספי אישר במפורש את הטקסט הערבי
  המלא (לצד תרגום חוזר לעברית אם צריך). אישור על העברית או על האנגלית אינו אישור על הערבית.
- `seoTitle`, `seoDescription` ו־`topics` חובה גם בערבית. `topics` זהים לעברית. בלי ניקוד עברי בערבית.
- המותג: `Shluchim` באותיות לטיניות. לא כותבים "شلوخيم"/"شلوحيم" בטקסט שהקוראים רואים (זה המונח הערבי
  לשלוחי חב״ד). בגוף הטקסט "مبعوثيّ"/"المبعوثون", ובטקסט לחיפוש "وكلاء الذكاء الاصطناعي".
- בלי `letter-spacing` ובלי italic בערבית. ספרות מערביות (0–9).
- בדיקות לפני פרסום: כמו בעברית ובאנגלית, ובנוסף `/ar/` ופוסט ערבי ב־RTL, ב־hreflang משולש ובפונט Readex Pro.
- פוסט חדש: אחרי אישור העברית והאנגלית, הערבית עוברת תהליך אישור נפרד. מותר לפרסם את העברית
  והאנגלית לפני הערבית. ה־build מזהיר על פוסטים בלי ערבית.
```

### 5.3 טקסט מוצע ל־SEO-GEO.md

```markdown
### Arabic (ar), standing rule from Seffy, <date>

- URLs under `/ar/`, `hreflang="ar"` (no region), `og:locale` `ar_AR`, JSON-LD `inLanguage: "ar"`.
  `x-default` stays English. Every page lists only the language versions that exist, reciprocally.
- Register: Modern Standard Arabic. Search copy uses the terms people actually search
  (`وكلاء الذكاء الاصطناعي`, `مساعد ذكاء اصطناعي`, `الذكاء الاصطناعي في العمل`), verified with
  Arabic autocomplete and, once data exists, Search Console queries for `/ar/`. No invented volumes,
  no FAQ blocks of invented questions.
- Brand: `Shluchim` in Latin script. Never `شلوخيم`/`شلوحيم` in reader-facing or search copy: that
  transliteration is how Arabic reference sites name Chabad emissaries. The guard fails on it.
- `seoTitle` ≤ ~50 chars (Arabic glyphs are wider; check the rendered SERP), `seoDescription` 70–160.
- Keyword map gets an Arabic row per topic. Monthly AI-engine check adds two Arabic questions.
```

**בדיקה נוספת ל־seo-check (מוצעת):** ‏`AR_BRAND_TRANSLIT = /شلوخ|شلوح/` → שגיאה ב־seoTitle או seoDescription בערבית. ‏`NIQQUD` → שגיאה בערבית (קיים כבר כ"לא עברית").

### 5.4 טקסט מוצע למיומנות `shluchim-blog-post` (לא נערך עכשיו)

לשלב 8 ב־SKILL.md (שורה 35), ולשרשרת הסיכום (שורה 39):

```markdown
8. **גרסה אנגלית.** (ללא שינוי)
9. **גרסה ערבית.** מתרגמים מהעברית המאושרת ל־MSA לפי `templates/post-ar.md` ו־`references/arabic-style.md`
   (`lang: ar`, אותו `translationKey`, שם קובץ = שם הקובץ האנגלי), ובודקים מול האנגלית.
   **כאן נדרש אישור נוסף**, בניגוד לאנגלית: 🚦 ביקורת של דובר ערבית כשפת אם → 🚦 אישור ספי על הטקסט הערבי המלא
   (לצד תרגום חוזר לעברית). אסור "شلوخيم"; בגוף הטקסט "مبعوثيّ".
סיכום: 💯 ← טיוטה ← הטקסט העברי המלא ← 🚦 ← תמונות ← 🚦 ← אנגלית ← ערבית ← 🚦 מבקר ← 🚦 ספי ← מסירה לפרסום ← בדיקה ← קישורים.
```

קבצים חדשים במיומנות: `templates/post-ar.md`, ‏`references/arabic-style.md` (מילון מונחים: وكيل، مبعوث، Grok Bot; ‏MSA; בלי letter-spacing ו־italic; ספרות; פיסוק ערבי ، ؛ ؟) ודוגמה אחת מאושרת: `examples/post-2-dial-bot.ar.md`.
צריך לעדכן גם את `AGENTS.md` (סעיף SEO/GEO: "בעברית ובאנגלית" → "בעברית, באנגלית ובערבית"), את `config.yml` ואת `scripts/install-post-workflow.py` אם הוא מעתיק קבצים לפי רשימה.

---

## 6. תוכנית בשלבים והערכת מאמץ

הערכות למימוש בידי שליח קוד, כולל שער ה־Lighthouse. הזמן של ספי וזמן הביקורת האנושית מופיעים בנפרד.

| שלב | מה | תוצר | מאמץ (שליח) | זמן אנושי | תנאי סיום |
| --- | --- | --- | --- | --- | --- |
| **A. תשתית (PR 1)** | `LOCALES`/`Lang` כמקור אחד. ‏`langOf`/`slugOf`/`getTranslations` ל־N שפות. ‏content.config. ‏Base (hreflang N, ‏og alternates, ‏preload לפי מפה, מתג 3 שפות ב־CSS). ‏`urlPairs`/`lastmods`/i18n-check/seo-check/list-guard/indexnow ל־N שפות. ‏`src/pages/ar/*`. פונט Readex Pro (subset, ‏fallback עם metric override). כללי `:lang(ar)` ב־CSS. ‏config.yml. בדיקות | `/ar/` נבנה עם 0 פוסטים, **noindex** (הדפוס הקיים `noindex={posts.length===0}`), בלי קישור בניווט | 2–3 ימים | ‏~0.5 שעה ל־review | ‏`npm test`, ‏`seo:check` ו־Lighthouse 100 על `/`, ‏`/en/` **ללא שינוי בעברית ובאנגלית** (השוואת HTML לפני/אחרי) |
| **B. UI ועמודים סטטיים (PR 2)** | העברת כל `he ? … : …` למילונים. ‏`UI.ar`. ‏topics/team/friends/about/404/SEO_HOME/PERSON/OG card בערבית | כל המעטפת בערבית, עדיין noindex | 1.5–2 ימים | ביקורת דובר שפת אם: ‏~1 יום. אישור ספי: ‏~1 שעה | ‏typecheck נכשל אם חסרה מחרוזת ar. צילומי מסך בדסקטופ ובמובייל, בהיר וכהה |
| **C. תרגום הפוסטים (PRs 3–6)** | 33 פוסטים במנות של 8–9, ‏`draft: true` | ‏`src/content/posts/ar/*.md` | ‏~1–1.5 ימים לטיוטות | **8–10 ימי ביקורת**, ואישור ספי ב־4 מנות (~1 שעה כל אחת) | כל מנה מאושרת. ‏build מזהיר 0/33 חסרים |
| **D. השקה ואימות SEO (PR 7)** | `draft: false` לכולם בבת אחת, הסרת noindex, קישור במתג השפה, הוספת `/ar/` ל־performance-guard, ‏llms, ‏IndexNow | אתר בשלוש שפות | 0.5 יום | ‏GSC/Bing: ‏~30 דק' (ספי). מעקב 4–8 שבועות | בדיקה חיה: hreflang משולש הדדי, ‏sitemap, ‏RSS, ‏Rich Results Test, ‏URL Inspection ל־`/ar/` ול־5 פוסטים |

**סה״כ:** ‏~5–7 ימי עבודה של שליח ו־~10–11 ימי ביקורת אנושית. בפועל 3–4 שבועות קלנדריים, בעיקר בגלל הביקורת והאישורים.

**למה השקה אחת בסוף C (ולא פוסט אחרי פוסט):** ספי ביקש לתרגם "את כל הבלוג במלואו". עמוד בית ערבי עם 3 פוסטים נראה חלקי, ו־list-guard צריך כלל ביניים. התשתית (A ו־B) נכנסת מוקדם בלי לחשוף כלום.

**סדר תלות:** ‏SEF-197 (לורן) ✅ → A → B ↔ C (במקביל, אחרי A) → D.

---

## 7. סיכונים

### 7.1 התנגשות "שלוחים" עם חב״ד, בערבית

- **ממצא:** הוויקיפדיה הערבית/المعرفة, בערך "حباد", קוראת לשלוחי חב״ד **"شلوخيم"** ו"المبعوثون الحباديون". תעתיק ישיר של השם נכנס בדיוק למונח הזה.
- **סיכון נוסף:** בהקשר ערבי, שם עברי־דתי עלול להתקבל כתוכן דתי או פוליטי ולא כבלוג טכנולוגיה. זה יכול לפגוע באמון ובשיתופים.
- **"رسول":** פירושו המילולי שליח, אבל זה גם התואר של הנביא. **לא משתמשים בו.**
- **"وكيل":** המונח הרשמי ל־agent (SDAIA). הוא טוב ל־SEO, אבל כשם מותג הוא גנרי.
- **"مبعوث":** שליח או נציג, ניטרלי יחסית. הוא משמש גם לשלוחי חב״ד בתיאור ("المبعوثين الحباديين"), אבל בשימוש כללי הרבה פחות טעון.
- **ההמלצה:** המותג `Shluchim` בלטינית (כמו באתר האנגלי), עם שורת הסבר מתחת לכותרת. נוסח לבדיקה, לא מאושר: "«Shluchim» كلمة عبرية تعني «المبعوثين»: مساعدو الذكاء الاصطناعي الذين ينجزون عملًا حقيقيًا من أجلي". בגוף הטקסט "مبعوثيّ". ב־SEO "وكلاء الذكاء الاصطناعي". ב־`llms.txt` משפט: "ليست المدونة عن مبعوثي حركة حباد". **החלטה של ספי** (שאלה פתוחה 1).

### 7.2 כללי הניקוד והמותג בעברית לא נפגעים

- כל הבדיקות `HE_BANNED` ו־`HE_BARE_SHLUCHIM` מופעלות רק כש־`lang === 'he'`. ‏`NIQQUD` מופעלת "אם לא עברית", ולכן תכסה את הערבית אוטומטית. זה רצוי.
- **סיכון:** ריפקטור של `he ? :` למילונים עלול לשנות בטעות מחרוזת עברית, למשל לאבד ניקוד. **מיתון:** ב־PR של שלב A ו־B משווים את ה־HTML העברי והאנגלי שנבנה לפני ואחרי (`diff -r dist-before dist-after` על `index.html`, ‏`en/**`). אסור שיהיה שינוי חוץ מתוספת hreflang/og:locale ל־ar אחרי ההשקה.
- פיצול הכותרת סביב "של" ב־Base.astro עובד רק לעברית, ובשפה אחרת מוצג `displayTitle`. לוודא ש־`SITES.ar.displayTitle = 'Shluchim'`.

### 7.3 heOnly ופוסטים חלקיים

- אין היום פוסטים עם `heOnly`. אחרי שתהיה ערבית, פוסט עתידי שספי ירצה רק בעברית ובאנגלית צריך שדה כללי (`skipLangs`), אחרת list-guard ייכשל.
- **פוסט חדש אחרי ההשקה:** העברית והאנגלית יוצאות קודם, ולכן הרשימה בערבית תפגר זמנית. ‏list-guard צריך לאפשר את זה (אזהרה, לא שגיאה, לערבית). אחרת כל פוסט חדש יחכה לביקורת הערבית.

### 7.4 ביצועים (Lighthouse 100)

- פונט נוסף על `/ar/` בלבד (נטען לפי `lang`). בעמודים בעברית ובאנגלית לא משתנה כלום. ‏Readex Pro בתת־קבוצה ערבית שוקל ~22.9KB (variable 400–700), פחות משני קובצי ה־core של Polin (~21KB כל אחד). נדרש fallback עם metric overrides (כמו ב־Noa Shalev) כדי למנוע CLS.

### 7.5 סיכונים נוספים

- **איכות תרגום:** תרגום של מכונה בלי ביקורת יקלקל אמון ויחשוף טעויות. לכן הביקורת האנושית היא חובה.
- **עומס תחזוקה:** כל פוסט חדש הוא עכשיו 3 שפות ו־3 אישורים. צריך החלטה אם הערבית חובה לכל פוסט חדש או "best effort".
- **הקשר ישראלי:** פוסטים עם רמי לוי, בר2גו, וואטסאפ בעברית. מתרגמים כמו שהם, עם הסבר קצר בסוגריים כשצריך. לא "מתאימים" עובדות.

---

## 8. פונטים

### 8.1 מצב קיים

| תפקיד | עברית | אנגלית | ערבית היום |
| --- | --- | --- | --- |
| גוף (`--font`) | Polin Regular/Extrabold (core subset, ‏~21KB לכל משקל) | Polin (לטינית) | ❌ אין גליפים, נופל ל־Arial/מערכת |
| תצוגה (`--font-display`: מאסטהד, ‏h1 בפוסט, ‏h2/h3 ב־prose) | Noa Shalev (12KB) | Young Serif (30KB) | ❌ |
| כותרות UI (`--font-system`: ‏h1–h6 כללי) | system-ui | system-ui | system-ui (Segoe UI / SF Arabic / Roboto, משתנה בכל מכשיר) |

בדיקת cmap: לאף אחד מ־9 קובצי `src/fonts/*.woff2` אין תו בטווח U+0600–06FF.

### 8.2 מועמדים (כולם בגוגל פונטס, רישיון SIL OFL 1.1, אפשר לארח בעצמנו)

הגדלים נמדדו היום מ־Google Fonts API (woff2, תת־קבוצה `arabic` בלבד, משקלים 400–700):

| פונט | סגנון | משקלים / צירים | גודל ערבית | יתרונות לקריאוּת | חסרונות |
| --- | --- | --- | --- | --- | --- |
| **Readex Pro** | נסח' עם קו אחיד ("נסח' גאומטרי") | variable ‏wght 160–700 + ‏HEXP 0–100 | **22.9KB** (קובץ אחד) | נבנה במיוחד לקריאוּת: שיטת Lexend (Shaver-Troup) שתורגמה לערבית בידי ד״ר נדין שאהין, חוקרת קריאוּת ערבית (דוקטורט בליידן). מבנה נסח' של עיתונות, לא כופי. קו אחיד שמתאים ל־Polin. ציר HEXP לריווח נוסף. הקל ביותר | פחות "ספרותי" מנסח' קלאסי. הלטינית שבו היא Lexend (לא בשימוש, כי הלטינית נשארת Polin) |
| IBM Plex Sans Arabic | סאנס הומניסטי | 7 משקלים סטטיים | 87.1KB (2 קבצים: 400+700) | מצוין ל־UI ולטקסט טכני, ונראה מקצועי | פי 4 בגודל. בלי variable. מדריכי קריאה ממליצים עליו ל־UI ולא לטקסט ארוך |
| Noto Naskh Arabic | נסח' קלאסי (עם ניגודיות) | variable ‏wght 400–700 | 94.0KB | נסח' "ספרי" לקריאה ממושכת. כיסוי מלא | פי 4 בגודל. הניגודיות ה"סריפית" לא מתאימה לגוף הסאנס של Polin ותיראה כמו אתר אחר |
| Markazi Text | נסח' עריכתי | variable ‏wght 400–700 | 41.3KB | נסח' חסכוני ונעים לטקסט ארוך. מתאים גם לכותרות | פי 1.8 בגודל. אופי ספרותי, רחוק מ־Polin |
| Vazirmatn | סאנס | variable ‏wght 100–900 | 46.3KB | טוב ל־UI. ערבית ופרסית | מכוון בעיקר לפרסית. לא עוצב במיוחד לקריאוּת |
| (קיים) Polin / Noa Shalev | | | 0 גליפים ערביים | | לא רלוונטי |

### 8.3 ההמלצה: **Readex Pro בכל התפקידים (גוף, כותרות, UI)**

- **קריאוּת:** זה המועמד היחיד שעוצב לקריאוּת לפי מחקר שפורסם. Material Design ו־Google MENA תיעדו שהבסיס הוא שיטת Lexend יחד עם המחקר של שאהין על קריאוּת ערבית. המעצבים בחרו בכוונה במבנה נסח' של עיתונים ולא בכופי, כדי שיתאים לקריאה שוטפת.
- **התאמה לאתר:** קו אחיד בלי ניגודיות, כמו Polin. שלוש השפות ייראו כמו אותו אתר.
- **ביצועים:** ‏22.9KB לקובץ variable אחד שמכסה גוף (400), הדגשה (600–700) וכותרות. אין צורך בקובץ שני, וזה הכי בטוח לשער Lighthouse 100.
- **רישיון:** ‏OFL 1.1, מותר לארח בעצמנו, כמו שאר הפונטים ב־`src/fonts/`.
- **תצוגה (אופציה, לא בהשקה):** אם ספי ירצה כותרת מאסטהד עם יותר אופי, כמו Noa Shalev בעברית, אפשר לבחון אחר כך Markazi Text ל־h1 בלבד (+41KB), ורק אם Lighthouse נשאר 100. בהשקה: Readex Pro ב־600 לכותרות.

### 8.4 מה לשנות (שלב A)

1. **קובץ:** להוריד את Readex Pro variable מהריפו של googlefonts, ולבצע subset עם `pyftsubset` ל־Arabic (U+0600–06FF, ‏U+0750–077F, ‏U+FB50–FDFF, ‏U+FE70–FEFF) + ‏ZWJ/ZWNJ (U+200C–200D) + פיסוק בסיסי. לשמור את ה־features ‏`init medi fina isol rlig liga mark mkmk kern calt`. שם: `src/fonts/readex-pro-arabic-var.woff2`. להוסיף hash ל־manifest כמו ב־`test-polin-fonts.mjs`.
2. **global.css:**
   ```css
   @font-face { font-family: 'Readex Pro'; src: url('../fonts/readex-pro-arabic-var.woff2') format('woff2');
     font-weight: 160 700; font-display: swap; unicode-range: U+0600-06FF, U+0750-077F, U+FB50-FDFF, U+FE70-FEFF, U+200C-200F; }
   @font-face { font-family: 'Readex Arabic Fallback'; src: local('Tahoma'), local('Geeza Pro'), local('Noto Sans Arabic');
     size-adjust: …; ascent-override: …; descent-override: …; /* למדוד כמו ב־Noa Shalev */ }
   :root:lang(ar) {
     --font: 'Readex Pro', 'Readex Arabic Fallback', 'Polin', 'Polin Latin Fallback', Tahoma, sans-serif;
     --font-display: var(--font);
     --font-system: var(--font);
   }
   :lang(ar) { letter-spacing: 0 !important; font-synthesis: none; }
   :lang(ar) :is(em, i, cite) { font-style: normal; font-weight: 600; }
   :root:lang(ar) .prose { line-height: 1.85; }
   :root:lang(ar) :is(h1, h2, h3, .masthead h1, .post-head h1, .page-head h1) { font-weight: 600; line-height: 1.4; }
   ```
   (לטינית בתוך טקסט ערבי, כמו Grok Bot, נופלת ל־Polin לפי ה־unicode-range, וכך המותג נשאר עקבי.)
3. **Base.astro:** ‏`preload` לפי מפה `{ he: heDisplayFontUrl, en: enDisplayFontUrl, ar: arFontUrl }`. ב־`ar` לא לטעון מראש את Polin Extrabold אם אין בו שימוש בעמוד (לבדוק).
4. **כרטיס OG:** ‏`scripts/og-card/card.html?lang=ar` עם Readex Pro.
5. **בדיקה:** צילומי מסך בגדלים 390 ו־1280, בהיר וכהה. הגדלת טקסט ל־200%. ‏Lighthouse על `/ar/`.

---

## 9. שאלות פתוחות לספי (עד 3)

1. **שם המותג בערבית:** האם `Shluchim` בלטינית עם שורת הסבר ("مبعوثيّ" בגוף הטקסט) מקובל עליך, במקום תעתיק "شلوخيم" שמתנגש עם חב״ד? ואיך לכתוב את שמך בערבית (سيفي فيشر)?
2. **מי מאשר את הערבית:** אתה קורא ערבית? אם לא, האם תאשר על סמך תרגום חוזר לעברית ואישור בכתב של מבקר שפת אם? האם יש תקציב או אדם מוכר לביקורת (~8–10 ימי עבודה)?
3. **קהל יעד ופוסטים חדשים:** הקהל העיקרי הוא ערבים בישראל ובלבנט, או העולם הערבי כולו (משפיע על ספרות, קידום ודוגמאות)? והאם כל פוסט חדש אחרי ההשקה חייב גרסה ערבית, או שהערבית מצטרפת "כשאפשר"?

---

## 10. מקורות

- Google Search Central, Localized versions / hreflang: https://developers.google.com/search/docs/specialty/international/localized-versions
- Google, x-default: https://developers.google.com/search/blog/2013/04/x-default-hreflang-for-international-pages
- RankPearl, Arabic dialects and search: https://rankpearl.com/blog/arabic-dialects-and-search
- RankPearl, Arabic keyword research: https://rankpearl.com/blog/arabic-keyword-research-tools
- Crawl To Click, Gulf Arabic vs MSA for SEO: https://crawltoclick.com/gulf-arabic-msa-seo-content/
- muhammadammar.com, Arabic keyword research: https://muhammadammar.com/insights/arabic-keyword-research/
- ITU / SDAIA Arabic data & AI glossary ("agent" = وكيل): https://www.itu.int/hub/2022/04/data-ai-glossary-arabic-sdaia/
- ETHGlossary, AI agent in Arabic: https://glossary.ethereum.org/translations/all/ai-agent
- IBM (ar), وكلاء الذكاء الاصطناعي: https://www.ibm.com/sa-ar/think/ai-agents
- AWS (ar), ما المقصود بوكلاء الذكاء الاصطناعي: https://aws.amazon.com/ar/what-is/ai-agents/
- wakib.ai, AI agent ("العميل" = customer, avoid): https://www.wakib.ai/en/lexicon/ai-agent
- المعرفة, حباد ("شلوخيم"): https://www.marefa.org/حباد
- Material Design, The design of Readex Pro: https://m3.material.io/blog/readex-pro-legibility-arabic-type-design
- Google MENA blog, Readex Pro: https://blog.google/intl/ar-mena/company-news/outreach-initiatives/readex-arabic-accessibility/
- Google Fonts, Readex Pro: https://fonts.google.com/specimen/Readex+Pro · Noto Naskh Arabic: https://fonts.google.com/noto/specimen/Noto+Naskh+Arabic
- moayyadfaris.com, Arabic web font benchmark (Fontsource sizes, role guidance): https://moayyadfaris.com/arabic-web-stats/font-performance
- W3C, Typeface styles (Naskh as default text style): https://www.w3.org/International/articles/typography/fontstyles.en
- גדלי פונטים: מדידה שלי מ־`fonts.googleapis.com/css2` (תת־קבוצה arabic, ‏woff2), 30.10.2026. מטא־דאטה (משקלים, צירים, מעצבים): ‏`fonts.google.com/metadata/fonts`.

**הערה על הכלים:** ניסיתי להריץ את `agy` עם `gemini-4-argon-high` לחלק המחקרי (`/tmp/agy-shluchim-ar.log`). במצב headless הוא נכשל, כי כלי שדרש הרשאת command נדחה אוטומטית. לא הרצתי אותו עם `--dangerously-skip-permissions`. המחקר נעשה ישירות בחיפוש ובקריאת מקורות.

</div>
