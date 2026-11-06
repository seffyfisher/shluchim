# תוכנית: גרסה אנגלית לבלוג ״שְׁלוּחִים״

> תוכנית בלבד, בלי שינוי קוד. נבדק מול origin/main ‏(7f49a79). אין שום דבר חדש ב-origin שחסר בצ׳קאאוט המקומי.

## מצב קיים (מה מצאתי)
- Astro סטטי, `base: /shluchim`, ‏`trailingSlash: always`, ‏`@astrojs/sitemap`, ‏`rss.xml.ts` אחד.
- Collections ב-`src/content.config.ts`: ‏`posts` (glob שטוח, 21 פוסטים וטיוטה אחת) ו-`pages` (‏about.md). את הצוות (team) בונה `src/data/shluchim.json` (שם, תפקיד, קטגוריה ודוגמה, הכול בעברית).
- `src/config.ts`: ‏`SITE` עם lang/dir קבועים (`he`/`rtl`), כותרת, תת-כותרת, הערת פוטר ו-`READING_WPM` לעברית.
- `Base.astro`: ‏`<html lang={SITE.lang} dir={SITE.dir}>`. הבועות של WhatsApp ‏(`remark-chat.mjs`) מוגדרות קבוע `dir="rtl"` ו-`aria-label="שיחה"`.
- Decap CMS ‏(`public/admin/config.yml`): תוויות בעברית, ‏`public_folder: /shluchim/images`.
- פונטים: **Noa Shalev**: 109 גליפים, **אפס אותיות לטיניות**. **Miriam Libre**: יש A–Z/a–z, אבל הקובץ מקוצץ (subset) ואין בו סימנים מוטעמים (é וכו׳).
- אנימציית האווטאר ב-about היא CSS טהור (`animation-timeline: scroll(root)`). היא לא תלויה בכיוון הטקסט, אבל צריך לוודא שה-`av-x` לא מתהפך ב-LTR.

## 1. ארכיטקטורה
- **i18n מובנה של Astro**: ‏`i18n: { defaultLocale: 'he', locales: ['he','en'], routing: { prefixDefaultLocale: false } }`. כך העברית נשארת בשורש ולא נשבר אף URL קיים, והאנגלית יושבת תחת `/shluchim/en/`.
- **תוכן**: ממליץ על תיקיות לפי שפה, `src/content/posts/he/` ו-`src/content/posts/en/`, עם שדות `lang` ו-`translationKey` (מזהה הסיפור, למשל `2026-10-10-100-means-go`) שמקשרים בין זוג תרגומים. אותו מבנה גם ל-`pages/{he,en}/about.md`. ל-team: קובץ `shluchim.en.json`, או שדות `name_en`/`role_en`/`example_en` באותו JSON (עדיף, כי אז אווטארים ומזהים לא מוכפלים).
- **מחרוזות ממשק**: ‏`src/i18n/ui.ts` עם מילון he/en (״עריכה״, ״טיוטה״, ״זמן קריאה״, ניווט, aria-labels). ‏`SITE` הופך ל-`SITE[lang]`, עם `lang`/`dir` לכל שפה ו-`READING_WPM` נפרד (בערך 230 לאנגלית).
- **`<html lang dir>`** נקבע לפי `Astro.currentLocale`: ‏he/rtl או en/ltr. בבועות הצ׳אט ה-dir יבוא מה-locale ולא יהיה קבוע. ב-CSS להחליף מאפיינים פיזיים (left/right) בלוגיים (inline-start/end) איפה שעוד יש.
- **hreflang + canonical** ב-Base: ‏`<link rel="alternate" hreflang="he|en|x-default">` רק כשקיים תרגום (x-default מצביע על העברית). canonical עצמי לכל שפה.
- **מחליף שפה בכותרת**: קישור `<a hreflang lang>` רגיל, בלי JS. הוא מוביל לזוג המתורגם, ואם אין תרגום, לדף הבית של השפה השנייה. התווית: ״English״ / ״עברית״.
- **Sitemap**: ‏`sitemap({ i18n: { defaultLocale: 'he', locales: { he: 'he-IL', en: 'en' } } })`, שמייצר alternates אוטומטית.
- **RSS**: ‏`/rss.xml` (עברית, ללא שינוי) ו-`/en/rss.xml`, עם `<language>` מתאים.
- **OG**: ‏`og:locale` ‏(he_IL / en_US) + `og:locale:alternate`, וכותרת ותיאור לפי שפה. תמונות OG משותפות, אלא אם יש עליהן טקסט עברי.
- דפים: ‏`src/pages/en/index.astro`, ‏`en/about.astro`, ‏`en/team.astro`, ‏`en/posts/[...slug].astro`, כעטיפות דקות סביב קומפוננטות משותפות שמקבלות `lang`.

## 2. פונטים
- Noa Shalev לא מכסה לטינית בכלל, אז כותרות באנגלית ייפלו לפונט ברירת המחדל. **צריך פונט תצוגה לטיני לכותרות.** אפשרויות שמתאימות לאופי הידני והחם: **Fraunces** (סריף רך עם אופי), **Instrument Serif** (אלגנטי ודחוס), או **Caveat Brush** אם רוצים מראה כתב-יד. כולם OFL, והייתי מגיש אותם מקומית כ-woff2 עם subset. ב-CSS: ‏`:lang(en) h1 { font-family: 'Fraunces', … }`.
- Miriam Libre לגוף הטקסט: לייצר מחדש את ה-subset כך שיכלול Latin + Latin-1 (גרשיים מסולסלים, é, ü וכו׳). הגרסה המלאה מ-Google Fonts תומכת בזה. אין צורך בפונט גוף נוסף.

## 3. טרמינולוגיה (לבחירת ספי)
- **שם הבלוג**:
  א. **Shluchim** + שורת הסבר קצרה (״Shluchim (Hebrew: emissaries)…״), מומלץ: שומר על הזהות והמשחק החסידי.
  ב. **The Emissaries**: ברור מיד, אבל מאבד את הצבע.
  ג. **Shluchim: Emissaries** ככותרת ותת-כותרת.
- **בגוף הטקסט**: ״shaliach / shluchim״ באותיות נטויות, עם הסבר במופע הראשון בכל פוסט או קישור לדף about. או ״agent״ כמילה ניטרלית, אבל זה מטשטש את הקונספט.
- **תת-כותרת (הצעה)**: ״Tales of language-model emissaries and flesh-and-blood people״.
- **פוטר (הצעה)**: ״All rights reserved to Seffy Fisher and his team of shluchim, who document the life we share.״
- **שמות השלוחים**: תעתיק עקבי בטבלה אחת (באשר → Basher, היבא → Hiba, ניצה → Nitza, כנרת → Kinneret, כוכבה → Kochava, בן → Ben…), ופסקה ב-about שמסבירה שהשמות עבריים. ספי מאשר את הטבלה פעם אחת.

## 4. תהליך תרגום
- **טרנסקריאציה, לא תרגום מכונה**: לשמור על הקול של ספי (חם, ישיר, לא פורמלי). משחקי מילים מתחלפים בשווי-ערך אנגלי או מקבלים הסבר קצר. מושגים חסידיים ופולקלור מוסברים בקלילות בשורה או בהערה, בלי הרצאה.
- **ציטוטי WhatsApp**: מתורגמים. ממליץ להוסיף מתחת לכל בועה `<details>` (בלי JS) עם ״Original Hebrew״. החלופה: לתרגם בלבד.
- **ללא שינוי**: כללי הפרטיות (אותם שמות מוסתרים, אותם פרטים מושמטים), התאריך (תאריך הסיפור המקורי, אותו `date`), תמונות.
- **כלל הניקוד** חל רק על עברית. בטקסט האנגלי לא מופיע ניקוד, למעט השם המקורי כשהוא מוצג במכוון.
- **חלוקת עבודה**: **בן** כותב את המקור בעברית ← **כנרת** (שלוחת הכתיבה) עושה טרנסקריאציה לפי פרופיל הקול של ספי ← **כוכבה** מטמיעה (קובץ en, slug, מטא, בדיקת build) ← ספי מאשר כרגיל.
- **workflow קבוע**: פוסט חדש לא מתפרסם עד שיש לו גם זוג אנגלי (או `draft: true` בשתיהן). בדיקה ב-build שמזהירה כשל-`translationKey` חסר אחד מהזוג. ב-Decap: ‏collection נפרד ״Posts (EN)״ על `posts/en`, או `i18n: { structure: multiple_folders, locales: [he, en] }` המובנה של Decap, מומלץ כי הוא מציג את שתי השפות זו לצד זו באותו עורך. ‏`public_folder` נשאר.

## 5. SEO לקהל זר
- **slugs באנגלית**: ‏`/en/posts/2026-10-10-100-means-go/` (אותה תחילית תאריך, slug אנגלי קריא). התרגום מתועד ב-`translationKey`.
- `title`/`description` באנגלית כתובים מחדש לחיפוש בחו״ל, 150–160 תווים, ולא תרגום של התקציר.
- אופציונלי: שדה `summary` קצר בראש הפוסט האנגלי (״Context for non-Israeli readers״), למשל מה זה עברית/בר2גו, למה זה מצחיק.
- שיתוף ראשוני של `/en/` ב-X ובקהילות AI agents, ורישום ב-Search Console עם הסייטמאפ החדש.

## 6. שלבים והערכת מאמץ
1. **תשתית** (כ-1–1.5 יום, כוכבה): i18n config, ‏ui.ts, ‏Base עם lang/dir, ‏hreflang, ‏canonical ו-OG, מחליף שפה, sitemap, ‏RSS ל-en, CSS לוגי, פונטים. דף בית ו-about באנגלית.
2. **תוכן ליבה** (כ-1 יום): about, team (תעתיקים ותפקידים), ו-3–5 פוסטים מובילים (למשל building-the-shluchim-blog, ‏100-means-go, ‏voice-profile).
3. **שאר הארכיון** (בערך 20 דקות לפוסט עם כנרת וכוכבה, כ-1–2 ימים): 16 הפוסטים הנותרים.
4. **CMS ו-workflow** (חצי יום): Decap i18n, בדיקת זוגות ב-build, עדכון הנהלים של בן, כנרת וכוכבה.
5. **השקה**: פרסום `/en/`, ‏Search Console, פוסט השקה דו-לשוני.

## החלטות שספי צריך לקבל
1. שם הבלוג באנגלית (א/ב/ג) ומונח ״shaliach״ בגוף הטקסט.
2. אישור טבלת התעתיקים לשמות השלוחים.
3. פונט תצוגה לטיני (Fraunces / Instrument Serif / Caveat Brush).
4. בועות WhatsApp: עם מקור עברי מתקפל או בלי.
5. האם לתרגם את כל הארכיון או רק מבחר, והאם פוסט חדש חוסם פרסום עד שיש תרגום.
6. ‏Decap: ‏i18n מובנה או collection נפרד.
