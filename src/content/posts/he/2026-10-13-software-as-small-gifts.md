---
title: "תוכנות כמתנות (קטנות)"
description: "מתנה לקולגה התחילה בטעות בשפת המקלדת. בנינו את TypoSwap למק ולווינדוס, עם הבדיחה שלנו והתקנה שנפתחת כמו מתנה. עדיין בגרסת בדיקה."
listDescription: "טעות בשפת המקלדת הפכה לרעיון למתנה לקולגה: TypoSwap, תיקון להדבקה ועטיפה שנקרעת בהתקנה."
seoTitle: "מתנת תוכנה אישית למק ולווינדוס: TypoSwap"
seoDescription: "TypoSwap הוא מתנת תוכנה ל־2 מערכות, Mac ו־Windows: תיקון עברית־אנגלית מקומי, טקסט מוכן להדבקה והתקנה שנפתחת כמו מתנה. עדיין בגרסת בדיקה."
emoji: "🎁"
topics: ["everyday-ai", "ai-at-work"]
date: 2026-10-18
draft: false
lang: he
translationKey: "2026-10-13-software-as-small-gifts"
---

התרגלנו לתת לאנשים שאנחנו אוהבים ספר, בגד, איזה גאדג׳ט,
ואפילו, רחמנא ליצלן, שובר מתנה.

אני חושב שהגיע הזמן לתת גם תוכנה.
משהו שבנינו במיוחד בשבילם, שפותר בעיה ומחביא בדיחה שרק אנחנו מבינים.

בהמשך לתוכנות החד־פעמיות שבונים, משתמשים וזורקים,
יש מקום גם לתוכנות שבונים לכבוד מישהו.

![ספי ובאשר עם רעיון למתנת תוכנה](/media/posts/software-as-small-gifts/01-personal-gift-1672.webp)

## קודם מוצאים בעיה:

כמו כל מוצר טוב, קודם נמצא בעיה.
אנחנו יהודים, זה לא אמור להיות מסובך.

נוודא שהיא מספיק כואבת, או חוזרת מספיק פעמים,
בשביל האדם שעבורו אנחנו בונים.

מכאן פותחים שיחה עם שלוח הקוד ומקשקשים את עצמנו לדעת.
אפשר בקול, אפשר בתמלול: מה מפריע לו, מה יעזור,
מתי נדע שהתוכנה עשתה את העבודה ואיזו בדיחה פנימית נכניס.

עושים את זה במצב Plan (תכנון לפני ביצוע).
מבקשים לחקור מה כבר קיים, להבין את המגבלות ולהציע תוכנית עבודה.
אם יש ממשק, אפשר לבקש גם כמה סקיצות לפני שבונים.

לעבודה מסודרת יותר, אפשר להיעזר ב[סקילים של מאט פוקוק](<https://github.com/mattpocock/skills>)
או ב־[pstack](<https://github.com/cursor/plugins/tree/main/pstack>), קבצי הנחיות לשלוח הקוד.
אכתוב על זה בהמשך.

## הלו הלו, אתה כותב ביידיש:

יש לי בעבודה קולגה, ראש צוות, שנתקע בטעות שקורית לכולנו:
מקלידים בעברית כשהמקלדת על אנגלית, או להפך.
ואז מישהו לידנו אומר: ״הלו הלו, אתה כותב ביידיש״.

ג׳יבריש, כמובן. אבל אצלנו זו כבר בדיחה פנימית.
כשראיתי כמה זה מעצבן אותו, חשבתי: וואי, איזו אחלה מתנה.

הרעיון היה כלי קטן ל־Windows ול־Mac,
שיושב בשקט ומציע תיקון כשצריך.
ואחרי התיקון, זורק משהו יידישאי בשביל הבדיחה שלנו.

![הלוגו הברור של הסיכה של כוכבה](/media/posts/software-as-small-gifts/02-keyboard-plan-logo-1672.webp)

## מה ביקשתי מהשלוח:

פתחתי שיחה במצב Plan והסברתי מה אני רוצה לבנות.
קודם מחקר ותוכנית מלמעלה: איך מזהים טעות,
מתי מציעים תיקון ומה אפשרי בכל מערכת הפעלה.

בעיצוב כמעט לא התעסקתי.
מבחינתי הכלי צריך להיות שקוף, להופיע כשצריך ולעזור.
את הסיפור על הקולגה והבדיחה הוספתי בתכנון.

### הפרומפט המקורי ל־TypoSwap:

*הפרומפט המקורי, מילה במילה.*

<button type="button" data-gift-copy aria-live="polite" data-done="הועתק" data-fail="סימנתי את הטקסט להעתקה ידנית" data-analytics-content="idea" data-analytics-action="copy" data-analytics-id="software-gift-typoswap" hidden>העתקת הפרומפט</button>

```chat
seffy: אני רוצה לבנות תוכנה שדואגת לי כל פעם שאני מקליד בטעות באנגלית ויצא לי עברית ולהפך, צריך להיות זמין ברמת כל המחשב וזמין למעכת ההפעלה ווינדוס ומק, זה צריך להיות סופר יעיל שכמעט לא משפיעה על הזכרון והאחסון במחשב
והמטרה היא פשוטה, הקלדת משהו באנגלית שרצית בעברית או הקלדת באנגלית שרצית בעברית, יוצא משהו סופר לא ברור, התוכנה אמור לאפשר לך לסמן את הטקסט ובקלות קיצונית על ידי קיצור מקלדת או לחיצה על מקש ימיני ובחירה מאופציה שם שקיימת אחרי שהתקנת את התוכנה זה ישר יעביר לך לעברית או לאנגלית לפי הצורך.
חשוב מאוד שזה באמת יעבוד ממש טוב לפני הכל , כלומר שהזיהוי שהטקסט אכן לא יצא תקין יהיה מעולה כך שזה יכול ישר גם להציע לך האם תרצה להחליף והתכוונת ל... ולא רק משהו שאפשר להשתמש בו בצורה פאסיבית;
```

### לראות את התוכנית מלמעלה:

*שחזור להמחשה על סמך הסיפור · מצב Plan*

<button type="button" data-gift-copy aria-live="polite" data-done="הועתק" data-fail="סימנתי את הטקסט להעתקה ידנית" data-analytics-content="idea" data-analytics-action="copy" data-analytics-id="software-gift-plan" hidden>העתקת הפרומפט</button>

```chat
seffy: החוויה צריכה להיות שקופה כמעט לגמרי. הכלי יושב בשקט, מופיע כשצריך, מתקן בלחיצה וממשיך הלאה. לא ניכנס עכשיו לעיצוב.

בוא תראה לי קודם את תוכנית העבודה מלמעלה.
```

**שלוח הקוד**

> תוכנית מוצעת לפני שמתחילים לבנות:
>
> 1. לחקור זיהוי של טעות בשפת המקלדת ואת המגבלות ב־Windows וב־Mac.
> 2. להגדיר מתי מציעים תיקון ומה קורה כשהזיהוי לא נכון.
> 3. לבנות את ההמרה ולבדוק איך אפשר להחזיר את הטקסט המתוקן לאפליקציה, ואז להוסיף את הבדיחה.
> 4. לבדוק את ההתנהגות ולהכין חבילת מסירה בקובץ ZIP.

## מה השתנה בבנייה:

לכלי קראנו TypoSwap.
המטרה: להפוך `akuo nv akunl` ל־`שלום מה שלומך`, בלי להקליד מחדש.

את המנוע בנינו ב־Rust (שפת תכנות), עם דגש על צריכת משאבים נמוכה.
הוא ממפה את מיקומי המקשים בין עברית לאנגלית ומזהה טעויות לפי שכיחות מילים ורצפי אותיות.
העיבוד מקומי, ללא שמירת היסטוריית הקלדה.

חיברנו את הליבה לרכיבי המערכת של Mac ו־Windows.
הוספנו פעולה על טקסט מסומן, קיצור מקלדת לבחירה והצעה ליד הסמן.

ואז הבדיקות שינו את הפתרון.
הרשאות ב־Mac וחלק מהאפליקציות הקשו על החלפת הטקסט ישירות.

עברנו לזרימת ״מוכן להדבקה״:
הכלי מכין את התיקון בלוח ההעתקה, והמשתמש מסמן ומדביק.

![המחשת השימוש ב־TypoSwap והכנת תיקון להדבקה](/media/posts/software-as-small-gifts/04-typing-workflow-1120.webp)

*המחשת הממשק: TypoSwap מכין את התיקון להדבקה. מסמנים את הטקסט ומדביקים, בלי להקליד מחדש.*

החלונית נעלמת אחרי כמה שניות.
הכנסנו גם ״אוח גוועלד״, בשביל אותה בדיחת יידיש.

כתבנו בדיקות לליבה, להכנת התיקון בלוח ההעתקה ולהתקנה.
ארזנו חבילות בדיקה ל־Mac עם Intel ו־Apple Silicon (מעבדי אפל),
ול־Windows x64 (64 ביט).

אבל זו עדיין גרסת בדיקה.
הניסיון הראשון שלי ב־Windows חשף תקלה בהפעלת ההצעה ליד הסמן.
בדיקות אוטומטיות ובנייה מוצלחת לא מבטיחות שזה עובד בכל אפליקציה.

## מתנה בקובץ ZIP:

עכשיו המתנה עטופה בקובץ ZIP, עם גרסאות בדיקה לשתי המערכות.
אחרי שאוודא שהזרימה עובדת כמו שצריך, אשלח אותה לקולגה היקר שלי.

אני מקווה שהיא תחסוך לו את הרגע המעצבן הזה,
ועל הדרך גם תצחיק אותו.

![השְׁלוּחִים אורזים את התוכנה במתנה](/media/posts/software-as-small-gifts/03-wrapped-software-1672.webp)

### ככה נראית חוויית ההתקנה:

הדמיה של ההתקנה ב־Windows:
מחלצים ZIP, פותחים מתנה, בוחרים קיצור מקלדת ומנסים תיקון.
הסרטון הוא הדמיה, לא הוכחה שהתקלה תוקנה או שההתקנה נבדקה בפועל.

<video class="software-gift-video" controls playsinline preload="none" width="1920" height="1080" poster="/media/posts/software-as-small-gifts/installation-poster.webp" aria-label="הדמיית חוויית ההתקנה של TypoSwap ב־Windows">
<source src="/media/posts/software-as-small-gifts/TypoSwap-Gift-Walkthrough.mp4" type="video/mp4">
<a href="/media/posts/software-as-small-gifts/TypoSwap-Gift-Walkthrough.mp4">קובץ ההדמיה המקורי (MP4)</a>
</video>

[קובץ ההדמיה המקורי (MP4)](/media/posts/software-as-small-gifts/TypoSwap-Gift-Walkthrough.mp4)

### הפרומפט המקורי לחוויית ההתקנה:

*הפרומפט המקורי, מילה במילה.*

<button type="button" data-gift-copy aria-live="polite" data-done="הועתק" data-fail="סימנתי את הטקסט להעתקה ידנית" data-analytics-content="idea" data-analytics-action="copy" data-analytics-id="software-gift-installation" hidden>העתקת הפרומפט</button>

```chat
seffy: איך אפשר לייצר קובץ התקנה שמתקינים אותו מקבלים הרגשה כאילו קיבלת מתנה והתהליך התקנה שלך כולל לפתוח את המתנה(את הזיפ) ממש כמו חווית של קריעת נייר מתנה והסרת הדברים של המתנה ממנה
```

משם בנינו נייר כחול עם אותיות מקלדת בעברית ובאנגלית.
גוררים, הנייר נקרע ומתחתיו מתגלה TypoSwap.
במתקין המקומי ל־Windows, פתיחת המתנה היא חלק מההתקנה.

והשלב הבא שבא לי לבנות:
מתנה דרך קישור, עם עטיפה שפותחים בסווייפ גם בטלפון.

![פתיחת מתנת TypoSwap בעטיפת נייר כחולה](/media/posts/software-as-small-gifts/05-gift-installation-925.webp)

*מסך פתיחת המתנה. בתצוגת הניסיון המוצגת כאן נפתחת העטיפה בלבד, ללא התקנה.*

בינתיים, ממש אשמח שתכתבו לי:
**אילו תוכנות כמתנות הייתם רוצים לראות, ולמי הייתם נותנים אותן?**

אבנה אותן כאן בשקיפות, מהבעיה ועד לתוכנה שאפשר לתת במתנה.

## עוד תוכנות כמתנות:

<div class="gift-apps" data-analytics-label="software-gifts">

<article class="gift-app" aria-labelledby="gift-orbit-windows">
<header class="gift-app-header">
<h3 class="gift-app-name" id="gift-orbit-windows"><a href="https://github.com/seffyfisher/orbit-windows" target="_blank" rel="noopener">Orbit Windows</a></h3>
<span class="gift-app-platform">Windows</span>
</header>
<p class="gift-app-description">תוכנה שמשנה בעיניי את כל הדרך לעבוד עם כמה חלונות במקביל ב־Windows.</p>
<div class="gift-app-visual">

![Orbit Windows עטוף במתנה – מסך ההדגמה המקורי מהריפו](/media/posts/software-as-small-gifts/06-orbit-windows-wrapped-1024.webp)

</div>
</article>

<article class="gift-app" aria-labelledby="gift-kol-chen">
<header class="gift-app-header">
<h3 class="gift-app-name" id="gift-kol-chen"><a href="https://github.com/seffyfisher/kol-chen" target="_blank" rel="noopener">קול-חן</a></h3>
<span class="gift-app-platform">macOS</span>
</header>
<p class="gift-app-description">כלי להקלטת הסאונד של המחשב ב־Mac, במקום כל מיני קומבינות שמאוד לא נוחות.</p>
<div class="gift-app-visual">

![קול-חן עטוף במתנה בנייר עם תמונות קלטות](/media/posts/software-as-small-gifts/07-kol-chen-wrapped-480.webp)

</div>
</article>

</div>

<style>
.prose [data-gift-copy]{display:block;margin-block:1rem .35rem;padding:.5rem .8rem;min-height:44px;border:1px solid var(--line);border-radius:var(--radius);background:var(--surface);color:var(--fg);font:inherit;font-size:.85rem;cursor:pointer}
.prose [data-gift-copy][hidden]{display:none}
.prose [data-gift-copy]:focus-visible{outline:2px solid var(--accent);outline-offset:3px}
.prose .software-gift-video{display:block;width:100%;height:auto;aspect-ratio:16/9;background:var(--surface)}
.prose .gift-apps{--gift-blue:light-dark(#2459e0,#92b3ff);display:grid;grid-auto-rows:1fr;gap:1.5rem;margin-block:1.5rem 2.5rem}
.prose .gift-app{display:grid;grid-template-rows:auto 1fr auto;min-width:0;padding:clamp(1rem,3vw,1.5rem);border:2px solid var(--gift-blue);border-radius:1rem;background:var(--bg)}
.prose .gift-app-header{display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:.6rem 1rem;min-width:0}
.prose .gift-apps .gift-app .gift-app-name{margin:0;font-family:var(--font);font-size:clamp(1.25rem,1rem + 1vw,1.625rem);font-weight:700;line-height:1.3;overflow-wrap:anywhere}
.prose .gift-app-name a{color:var(--gift-blue);text-decoration:none}
.prose .gift-app-name a:hover{text-decoration:underline}
.prose .gift-app-platform{flex:none;border:1px solid color-mix(in srgb,var(--gift-blue) 35%,transparent);border-radius:99px;padding:.2rem .65rem;color:var(--gift-blue);font-size:.75rem;line-height:1.6}
.prose .gift-app-description{margin:.8rem 0 1.2rem;line-height:1.65;white-space:normal}
.prose .gift-app-visual{display:grid;place-items:center;min-width:0;aspect-ratio:4/3;padding:.75rem;border-radius:.625rem;background:light-dark(#eef3ff,#17233d);overflow:hidden}
.prose .gift-app-visual>p{display:grid;place-items:center;width:100%;height:100%;min-width:0;min-height:0;margin:0}
.prose .gift-app-visual .image-enlarge{display:grid;place-items:center;width:100%;height:100%;min-width:0;min-height:0;border-radius:.375rem}
.prose .gift-app-visual .image-enlarge>img{width:auto;height:auto;max-width:100%;max-height:100%;object-fit:contain}
.prose .gift-app :focus-visible{outline-color:var(--gift-blue)}
</style>

<script src="/media/posts/software-as-small-gifts/copy-prompts.js" defer></script>
