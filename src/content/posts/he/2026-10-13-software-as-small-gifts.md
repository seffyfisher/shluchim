---
title: "תוכנות כמתנות (קטנות)"
description: "מתנה קטנה לקולגה התחילה בטעות בשפת המקלדת. עם שלוח קוד בניתי את TypoSwap למק ולווינדוס, והפכתי את ההתקנה לפתיחת מתנה. גרסת בדיקה, עם הבדיחה הפרטית שלנו."
listDescription: "טעות בשפת המקלדת הפכה לרעיון למתנה לקולגה: TypoSwap, תיקון להדבקה ועטיפה שנקרעת בהתקנה."
seoTitle: "מתנת תוכנה אישית למק ולווינדוס: TypoSwap"
seoDescription: "TypoSwap הוא מתנת תוכנה ל־2 מערכות, Mac ו־Windows: תיקון עברית־אנגלית מקומי, טקסט מוכן להדבקה והתקנה שנפתחת כמו מתנה. עדיין בגרסת בדיקה."
emoji: "🎁"
topics: ["everyday-ai", "ai-at-work"]
date: 2026-10-13
draft: false
lang: he
translationKey: "2026-10-13-software-as-small-gifts"
---

התרגלנו לתת לאנשים שאנחנו אוהבים מתנות בדמות מוצרים פיזיים. ספר, בגד, איזה גאדג׳ט, ואפילו, רחמנא ליצלן, שובר מתנה. אני חושב שהגיע הזמן להרחיב את היריעה: לתת תוכנה במתנה. משהו שבנינו במיוחד בשביל אדם שאנחנו אוהבים, שפותר בעיה שלו, ואולי מחביא בפנים גם בדיחה שרק שנינו מבינים.

בהמשך לשיח על תוכנות חד־פעמיות, כאלה שבונים, משתמשים וזורקים, אני חושב שיש מקום גם לתוכנות שבונים לכבוד מישהו. כלי קטן, מותאם אישית, שהרעיון שלו מתחיל בזה ששמנו לב לאדם שאנחנו אוהבים.

![ספי ובאשר עם רעיון למתנת תוכנה](/media/posts/software-as-small-gifts/01-personal-gift-1672.webp)

אז בואו נתחיל.

## קודם מוצאים בעיה:

כמו כל מוצר טוב, קודם נמצא בעיה. אנחנו יהודים, זה לא אמור להיות מסובך.

אחרי שמצאנו, נוודא שהיא באמת מספיק כואבת, או חוזרת מספיק פעמים, בשביל האדם שעבורו אנחנו בונים. משהו ששמנו לב שמעצבן אותו, גוזל לו זמן או גורם לו לעשות שוב ושוב את אותה עבודה.

מכאן פותחים שיחה עם שלוח הקוד שאנחנו עובדים איתו: גרוקבוט, Cursor, Codex של ChatGPT, Claude Code ודומיהם. אפשר לדבר בקול, או להעביר לשלוח תמלול, ומקשקשים את עצמנו לדעת. ממש הכול מהכול: מה ראיתי, מה הפריע לו, מה יגרום לו להיות מאושר, ומתי נדע שהתוכנה באמת עשתה את העבודה שלה. וכמובן, איזו בדיחה פנימית שלנו אפשר להכניס פנימה.

את כל זה עושים במצב Plan (מצב תכנון לפני ביצוע). מבקשים לחקור מה כבר קיים, להבין מה אפשרי ומה מורכב, ואז לקבל תוכנית עבודה שאפשר לראות מלמעלה. אם יש לתוכנה ממשק, אפשר גם לבקש כמה פרוטוטייפים ועיצובים לדוגמה, כדי להרגיש את הרעיון לפני שבונים.

כדי לעבוד בצורה יותר מסודרת, אני ממליץ להיעזר בסקילים – קבצי הנחיות שמכוונים את שלוח הקוד לאורך העבודה. אפשר להתחיל ב[סקילים של מאט פוקוק](https://github.com/mattpocock/skills) או ב־[pstack](https://github.com/cursor/plugins/tree/main/pstack). אכתוב בהמשך יותר על שיטות העבודה האלה.

## הלו הלו, אתה כותב ביידיש:

אז הנה מה שאני עשיתי עם הרעיון הזה.

יש לי בעבודה קולגה, ראש צוות, שראיתי אותו לא פעם נתקע בטעות שקורית לכולנו: מתחילים להקליד בעברית כשהמקלדת על אנגלית, או להפך. כותבים וכותבים, ואז מישהו לידנו אומר: ״הלו הלו, אתה כותב ביידיש״.

הכוונה היא כמובן לג׳יבריש. המילים בראש היו בסדר גמור. שפת המקלדת פשוט לא הייתה בכיוון.

זה אחד הדברים ששמתי לב שמרגיזים אותו. ובשלב מסוים אמרתי לעצמי: וואי, איזו אחלה מתנה זה יהיה.

ברעיון הראשוני רציתי כלי קטן שירוץ ברקע ב־Windows וב־Mac. כשיזהה טעות בשפת המקלדת, יציע תיקון בלחיצה אחת. זה היה הכיוון שממנו התחלנו.

ומיד אחרי התיקון, שיזרוק משהו יידישאי בשביל הבדיחה הפנימית שלנו. זה חלק מהמתנה. הוא יפגוש את הבדיחה שלנו בדיוק ברגע שבו היא תמיד עולה.

![הלוגו הברור של הסיכה של כוכבה](/media/posts/software-as-small-gifts/02-keyboard-plan-logo-1672.webp)

## מה עשיתי עם זה:

פתחתי שיחה עם שלוח הקוד והסברתי מה אני רוצה לבנות. הנה הפרומפט המקורי שלי, כמו שכתבתי אותו. את הסיפור על הקולגה ואת הבדיחה הוספתי כחלק מהתכנון.

לא ניסיתי להפוך את זה מיד למסמך אפיון חגיגי. רציתי להעביר את הכיף ואת הרגע שהכלי אמור לעזור בו. אחר כך ביקשתי: בוא נחקור. מה אפשרי, מה לא, ומה המורכבויות של כלי כזה?

נשארתי במצב Plan. קודם תוכנית שאפשר להסתכל עליה מלמעלה, להבין מה אנחנו עומדים לבנות ואיפה עוד צריך לבדוק. איך מזהים טעות כזאת? מתי נכון להציע תיקון? איך זה אמור לעבוד בכל אחת ממערכות ההפעלה?

### הפרומפט המקורי ל־TypoSwap

*הפרומפט המקורי, מילה במילה.*

<button type="button" data-gift-copy data-done="הועתק" data-fail="הטקסט סומן להעתקה" aria-live="polite" hidden>העתקת הפרומפט</button>

```chat
seffy: אני רוצה לבנות תוכנה שדואגת לי כל פעם שאני מקליד בטעות באנגלית ויצא לי עברית ולהפך, צריך להיות זמין ברמת כל המחשב וזמין למעכת ההפעלה ווינדוס ומק, זה צריך להיות סופר יעיל שכמעט לא משפיעה על הזכרון והאחסון במחשב
והמטרה היא פשוטה, הקלדת משהו באנגלית שרצית בעברית או הקלדת באנגלית שרצית בעברית, יוצא משהו סופר לא ברור, התוכנה אמור לאפשר לך לסמן את הטקסט ובקלות קיצונית על ידי קיצור מקלדת או לחיצה על מקש ימיני ובחירה מאופציה שם שקיימת אחרי שהתקנת את התוכנה זה ישר יעביר לך לעברית או לאנגלית לפי הצורך.
חשוב מאוד שזה באמת יעבוד ממש טוב לפני הכל , כלומר שהזיהוי שהטקסט אכן לא יצא תקין יהיה מעולה כך שזה יכול ישר גם להציע לך האם תרצה להחליף והתכוונת ל... ולא רק משהו שאפשר להשתמש בו בצורה פאסיבית;
```

לעיצוב אפילו לא נכנסתי. מבחינתי החוויה האידיאלית של הכלי הזה שקופה כמעט לגמרי: הוא יושב בשקט, מופיע כשצריך אותו, עוזר וממשיך הלאה.

במתנה הזאת, מה שהיה חשוב לי לתכנן הוא מתי הכלי מתערב ואיך הוא עושה את זה. את האנרגיה רציתי להשקיע שם – וגם ברגע הקטן, אחרי התיקון, שיגרום לו לחייך.

### לראות את התוכנית מלמעלה

*שחזור להמחשה על סמך הסיפור · מצב Plan*

<button type="button" data-gift-copy data-done="הועתק" data-fail="הטקסט סומן להעתקה" aria-live="polite" hidden>העתקת הפרומפט</button>

```chat
seffy: החוויה צריכה להיות שקופה כמעט לגמרי. הכלי יושב בשקט, מופיע כשצריך, מתקן בלחיצה וממשיך הלאה. לא ניכנס עכשיו לעיצוב.

בוא תראה לי קודם את תוכנית העבודה מלמעלה.
```

**שלוח הקוד**

> תוכנית מוצעת לפני שמתחילים לבנות:
>
> 1. לחקור זיהוי של טעות בשפת המקלדת ואת המגבלות ב־Windows וב־Mac.
>
> 2. להגדיר מתי מציעים תיקון ומה קורה כשהזיהוי לא נכון.
>
> 3. לבנות את ההמרה ולבדוק איך אפשר להחזיר את הטקסט המתוקן לאפליקציה, ואז להוסיף את הבדיחה.
>
> 4. לבדוק את ההתנהגות ולהכין חבילת מסירה בקובץ ZIP.

## מה השתנה בבנייה:

לכלי קראנו TypoSwap. המטרה הייתה לקחת משפט כמו `akuo nv akunl` ולהפוך אותו ל־`שלום מה שלומך`, בלי להקליד הכול מחדש.

את המנוע בנינו ב־Rust (שפת תכנות), עם דגש על צריכת משאבים נמוכה ומינימום ממשק. ההמרה ממפה את מיקומי המקשים בין עברית לאנגלית.

כדי לזהות טעות בזמן ההקלדה, הוספנו בדיקה של שכיחות מילים ורצפי אותיות. העיבוד מקומי במחשב, ללא שמירת היסטוריית הקלדה.

את הליבה חיברנו ל־Mac ול־Windows באמצעות רכיבי המערכת המקומיים. הוספנו פעולה על טקסט מסומן, קיצור מקלדת שבוחרים בלחיצה על המקשים והצעות ליד הסמן.

ואז הבדיקות שינו את הפתרון. ב־Mac היה צריך לטפל בהרשאות. בחלק מהאפליקציות הצלחנו לקרוא את הטקסט, אבל היה קשה להחליף אותו ישירות.

עברנו לזרימה פשוטה: מזהים טעות, מכינים את התיקון בלוח ההעתקה ומציגים ״מוכן להדבקה״. המשתמש מסמן את הטקסט ומדביק את התיקון. הבקשה המקורית הייתה לתיקון ישיר, והבדיקות הובילו אותנו לפתרון הזה.

![המחשת השימוש ב־TypoSwap והכנת תיקון להדבקה](/media/posts/software-as-small-gifts/04-typing-workflow-1120.webp)

*המחשת הממשק: TypoSwap מכין את התיקון להדבקה. מסמנים את הטקסט ומדביקים, בלי להקליד מחדש.*

החלונית קטנה ונעלמת אחרי כמה שניות. הכנסנו גם ביטויים כמו ״אוח גוועלד״, בשביל אותה בדיחת יידיש שלנו.

ארזנו חבילות ל־Mac עם מעבדי Intel ו־Apple Silicon (המעבדים של אפל), ומתקין ל־Windows במחשבי x64 (64 ביט). כתבנו בדיקות לליבה, להכנת הטקסט בלוח ההעתקה ולמנגנוני ההתקנה.

אבל זאת עדיין גרסת בדיקה. בדיקות אוטומטיות ובנייה מוצלחת לא אומרות שהכול עובד בכל אפליקציה. הניסיון הראשון שלי ב־Windows חשף תקלה בהפעלת ההצעה ליד הסמן, ויש עוד מה לבדוק לפני שהמתנה מוכנה למסירה.

## מתנה בקובץ ZIP:

עכשיו יש לי מתנה עטופה בקובץ ZIP, עם גרסאות בדיקה לשתי המערכות. אחרי שאוודא שהזרימה עובדת כמו שצריך, אשלח אותה לקולגה היקר שלי. אני מקווה שהיא תחסוך לו את הרגע המעצבן הזה, ועל הדרך גם תצחיק אותו.

![השְׁלוּחִים אורזים את התוכנה במתנה](/media/posts/software-as-small-gifts/03-wrapped-software-1672.webp)

### ככה נראית חוויית ההתקנה

הדמיה של חוויית ההתקנה ב־Windows: מחלצים את ה־ZIP, פותחים את המתנה, בוחרים קיצור מקלדת ואז מנסים את התיקון.

<video class="software-gift-video" controls playsinline preload="none" poster="/media/posts/software-as-small-gifts/installation-poster.webp" width="1920" height="1080" aria-label="הדמיית חוויית ההתקנה של TypoSwap">
<source src="/media/posts/software-as-small-gifts/TypoSwap-Gift-Walkthrough.mp4" type="video/mp4">
</video>

[TypoSwap – חוויית פתיחת המתנה וההתקנה](/media/posts/software-as-small-gifts/TypoSwap-Gift-Walkthrough.mp4)

עצם ה־ZIP גרם לי לחשוב גם על האריזה. רציתי שההתקנה עצמה תרגיש כמו לפתוח מתנה.

### הפרומפט המקורי לחוויית ההתקנה

*הפרומפט המקורי, מילה במילה.*

<button type="button" data-gift-copy data-done="הועתק" data-fail="הטקסט סומן להעתקה" aria-live="polite" hidden>העתקת הפרומפט</button>

```chat
seffy: איך אפשר לייצר קובץ התקנה שמתקינים אותו מקבלים הרגשה כאילו קיבלת מתנה והתהליך התקנה שלך כולל לפתוח את המתנה(את הזיפ) ממש כמו חווית של קריעת נייר מתנה והסרת הדברים של המתנה ממנה
```

משם בנינו נייר כחול עם אותיות מקלדת בעברית ובאנגלית. גוררים, הנייר נקרע, ומתחתיו מתגלה TypoSwap. במתקין המקומי ל־Windows, פתיחת המתנה היא חלק מתהליך ההתקנה.

ועכשיו אני חושב על השלב הבא: לקבל מתנה דיגיטלית דרך קישור, ולפתוח את העטיפה גם בטלפון. לעשות סווייפ, ועוד סווייפ, עד שמגלים מה יש בפנים.

![פתיחת מתנת TypoSwap בעטיפת נייר כחולה](/media/posts/software-as-small-gifts/05-gift-installation-925.webp)

*מסך פתיחת המתנה. בתצוגת הניסיון המוצגת כאן נפתחת העטיפה בלבד, ללא התקנה.*

את חוויית פתיחת העטיפה אפשר לנסות גם כאן. זאת הדגמה בתוך הפוסט: משכו את הסרט, ואז קלפו את הנייר, בעכבר או באצבע, עד שמגלים מה יש בפנים.

<style>
#gift-unwrapping{--p:0;--paper:light-dark(#f5f0e5,#d9d1c2);--paper-edge:light-dark(#ded5c4,#a79c87);--ink:light-dark(#34312c,#eee8de);--secondary:light-dark(#776f63,#bfb5a5);--ribbon:light-dark(#8b293c,#ad4054);--ribbon-light:light-dark(#b74c60,#cb6476);--ribbon-dark:light-dark(#581625,#702237);color:var(--ink);font-family:Arial,sans-serif;text-align:center;padding:22px 16px 20px;overflow:hidden}
#gift-unwrapping *{box-sizing:border-box}
#gift-unwrapping .instruction{margin:0;min-height:30px;font-weight:500;padding-inline:70px}
#gift-unwrapping .scene{height:340px;display:grid;place-items:center;perspective:1000px;direction:ltr}
#gift-unwrapping .gift{position:relative;width:min(340px,calc(100% - 38px));height:242px;transform:rotate(-4deg);transition:transform .7s cubic-bezier(.16,1,.3,1)}
#gift-unwrapping .archive{position:absolute;inset:0;border-radius:12px;background:light-dark(#272b29,#202522);color:#eee9df;display:flex;flex-direction:column;align-items:center;justify-content:center;transform:scale(.95);transition:transform .7s;box-shadow:0 15px 28px light-dark(#50423320,#00000035)}
#gift-unwrapping .archive:before{content:"";position:absolute;top:0;bottom:0;left:24px;width:11px;background:repeating-linear-gradient(0deg,#beb9af 0 3px,#2b2d2b 3px 6px);border-inline:3px solid #444744}
#gift-unwrapping .zip-pull{position:absolute;left:20px;top:27px;width:19px;height:29px;border:3px solid #b7b1a6;border-radius:5px}
#gift-unwrapping .zip-word{font:500 48px ui-monospace,monospace;letter-spacing:7px;margin-bottom:12px}
#gift-unwrapping .filename{font-family:ui-monospace,monospace;direction:ltr;margin:0}
#gift-unwrapping .inside-note{margin:10px 0 0;direction:rtl;color:#d4cec2}
#gift-unwrapping .paper{position:absolute;inset:0;z-index:2;background:var(--paper);border:1px solid var(--paper-edge);transition:transform .65s cubic-bezier(.16,1,.3,1),opacity .5s;box-shadow:inset 0 1px 0 #ffffff60}
#gift-unwrapping .paper-left{right:49.9%;border-radius:9px 0 0 9px;transform-origin:right center;background:linear-gradient(145deg,var(--paper),var(--paper-edge))}
#gift-unwrapping .paper-right{left:49.9%;border-radius:0 9px 9px 0;transform-origin:left center;background:linear-gradient(215deg,var(--paper),var(--paper-edge))}
#gift-unwrapping .paper:after{content:"";position:absolute;inset:0;background:linear-gradient(33deg,transparent 48%,#77684a12 49%,#ffffff35 50%,transparent 51%)}
#gift-unwrapping .ribbon{position:absolute;inset:0;z-index:4;pointer-events:none}
#gift-unwrapping .strip{position:absolute;background:linear-gradient(90deg,var(--ribbon-dark),var(--ribbon-light) 42%,var(--ribbon) 75%,var(--ribbon-dark));box-shadow:2px 3px 5px #00000018;transition:transform .65s cubic-bezier(.16,1,.3,1),opacity .5s;will-change:transform}
#gift-unwrapping .vertical-top{width:27px;height:116px;left:calc(50% - 13.5px);top:0;transform-origin:50% 0}
#gift-unwrapping .vertical-bottom{width:27px;height:130px;left:calc(50% - 13.5px);top:112px;transform-origin:50% 100%}
#gift-unwrapping .horizontal-left,#gift-unwrapping .horizontal-right{height:25px;top:101px;width:50%;background:linear-gradient(180deg,var(--ribbon-dark),var(--ribbon-light) 35%,var(--ribbon));}
#gift-unwrapping .horizontal-left{left:0;transform-origin:left center}
#gift-unwrapping .horizontal-right{right:0;transform-origin:right center}
#gift-unwrapping .bow{position:absolute;left:50%;top:113px;width:0;height:0}
#gift-unwrapping .loop{position:absolute;width:60px;height:39px;top:-27px;border:10px solid var(--ribbon);box-shadow:inset 0 2px 2px #ffffff35,0 3px 3px #00000018;transition:transform .35s,opacity .35s;will-change:transform}
#gift-unwrapping .loop-left{right:-5px;border-radius:75% 80% 18% 80%;transform-origin:right bottom}
#gift-unwrapping .loop-right{left:-5px;border-radius:80% 75% 80% 18%;transform-origin:left bottom}
#gift-unwrapping .knot{position:absolute;width:24px;height:21px;left:-12px;top:-10px;border-radius:6px;background:linear-gradient(90deg,var(--ribbon-dark),var(--ribbon-light),var(--ribbon-dark));box-shadow:0 3px 5px #00000025;transition:transform .4s,opacity .4s}
#gift-unwrapping .tail{position:absolute;width:21px;height:67px;top:116px;left:calc(50% - 11px);background:linear-gradient(90deg,var(--ribbon-dark),var(--ribbon-light) 45%,var(--ribbon));clip-path:polygon(0 0,100% 0,100% 100%,50% 87%,0 100%);transform-origin:center top;transition:transform .4s,opacity .4s;will-change:transform}
#gift-unwrapping .tail-fixed{left:calc(50% - 28px);height:48px;transform:rotate(22deg)}
#gift-unwrapping .handle{position:absolute;z-index:7;border:0;font:inherit;touch-action:none;user-select:none;-webkit-tap-highlight-color:transparent}
#gift-unwrapping .ribbon-handle{width:64px;height:72px;left:calc(50% - 32px);top:132px;background:transparent;transform:translate(var(--hand-x,0px),var(--hand-y,0px));}
#gift-unwrapping .ribbon-handle:active{cursor:grabbing}
#gift-unwrapping .paper-handle{width:50px;height:68px;top:87px;background:var(--paper);border:1px solid var(--paper-edge);color:#655d50;border-radius:4px;box-shadow:0 2px 7px #00000015;transition:transform .65s}
#gift-unwrapping .right-handle{right:-12px;transform:rotate(5deg)}
#gift-unwrapping .left-handle{left:-12px;transform:rotate(-5deg)}
#gift-unwrapping .outcome{min-height:24px;margin:0 0 8px;color:var(--secondary)}
#gift-unwrapping .fallback{color:var(--secondary);margin:8px 0 0}
#gift-unwrapping .replay{font:inherit;border:1px solid var(--paper-edge);border-radius:6px;padding:8px 14px;background:var(--paper);color:#34312c}
#gift-unwrapping .dragging .strip,#gift-unwrapping .dragging .loop,#gift-unwrapping .dragging .knot,#gift-unwrapping .dragging .tail,#gift-unwrapping .dragging .paper,#gift-unwrapping .dragging .handle{transition:none}
#gift-unwrapping[data-stage="1"] .paper-right{transform:translateX(calc(var(--p)*160px)) rotateY(calc(var(--p)*-65deg)) rotate(calc(var(--p)*16deg));opacity:calc(1 - var(--p)*.85)}
#gift-unwrapping[data-stage="1"] .right-handle{transform:translateX(calc(var(--p)*100px)) rotate(calc(5deg + var(--p)*25deg))}
#gift-unwrapping[data-stage="2"] .paper-right,#gift-unwrapping[data-stage="3"] .paper-right{transform:translateX(250px) rotateY(-80deg) rotate(22deg);opacity:0}
#gift-unwrapping[data-stage="2"] .paper-left{transform:translateX(calc(var(--p)*-160px)) rotateY(calc(var(--p)*65deg)) rotate(calc(var(--p)*-16deg));opacity:calc(1 - var(--p)*.85)}
#gift-unwrapping[data-stage="2"] .left-handle{transform:translateX(calc(var(--p)*-100px)) rotate(calc(-5deg - var(--p)*25deg))}
#gift-unwrapping[data-stage="3"] .paper-left{transform:translateX(-250px) rotateY(80deg) rotate(-22deg);opacity:0}
#gift-unwrapping[data-stage="3"] .gift{transform:rotate(0)}
#gift-unwrapping[data-stage="3"] .archive{transform:scale(1)}
#gift-unwrapping [hidden]{display:none!important}
@media(max-width:500px){#gift-unwrapping{padding:20px 10px}#gift-unwrapping .scene{height:315px}#gift-unwrapping .instruction{padding-inline:12px}}
@media(prefers-reduced-motion:reduce){#gift-unwrapping *,#gift-unwrapping *:before,#gift-unwrapping *:after{transition:none!important}}
</style>
<div id="gift-unwrapping" dir="rtl" data-stage="0" aria-label="פתיחת עטיפת מתנה">
  <p class="instruction" aria-live="polite">משכו את קצה הסרט למטה.</p>
  <div class="scene">
    <div class="gift">
      <div class="archive" aria-hidden="true"><span class="zip-pull" aria-hidden="true"></span><div class="zip-word">ZIP</div><p class="filename">yiddish.zip</p><p class="inside-note">משהו קטן. במיוחד בשבילך.</p></div>
      <div class="paper paper-left" aria-hidden="true"></div>
      <div class="paper paper-right" aria-hidden="true"></div>
      <div class="ribbon" aria-hidden="true">
        <div class="strip vertical-top"></div><div class="strip vertical-bottom"></div>
        <div class="strip horizontal-left"></div><div class="strip horizontal-right"></div>
        <div class="tail tail-fixed"></div>
        <div class="bow"><div class="loop loop-left"></div><div class="loop loop-right"></div><div class="knot"></div></div>
        <div class="tail tail-pull"></div>
      </div>
      <button type="button" class="handle ribbon-handle cursor-interaction" data-step="0" aria-label="משכו את קצה הסרט למטה כדי להתיר את הקשר. אפשר גם ללחוץ."></button>
      <button type="button" class="handle paper-handle right-handle cursor-interaction" data-step="1" aria-label="משכו את העטיפה ימינה או לחצו כדי לקלף" hidden>למשוך<br>כאן</button>
      <button type="button" class="handle paper-handle left-handle cursor-interaction" data-step="2" aria-label="משכו את העטיפה שמאלה או לחצו כדי לסיים" hidden>עוד<br>קצת</button>
    </div>
  </div>
  <p class="outcome" aria-live="polite">קודם הקשר, אחר כך העטיפה.</p>
  <button type="button" class="replay cursor-interaction" hidden>לעטוף מחדש</button>
  <p class="fallback">אפשר גם ללחוץ או להשתמש במקש Enter.</p>
</div>
<script>
(()=>{
const root=document.getElementById("gift-unwrapping");
const q=s=>root.querySelector(s);
const handles=[...root.querySelectorAll(".handle")];
const instruction=q(".instruction"),outcome=q(".outcome"),replay=q(".replay");
const parts={left:q(".loop-left"),right:q(".loop-right"),knot:q(".knot"),pull:q(".tail-pull"),fixed:q(".tail-fixed"),top:q(".vertical-top"),bottom:q(".vertical-bottom"),hleft:q(".horizontal-left"),hright:q(".horizontal-right")};
let stage=0,unthread=0,drag=null,suppress=false,busy=false,animation=0,generation=0;
const clamp=v=>Math.max(0,Math.min(1,v));
const segment=(v,a,b)=>clamp((v-a)/(b-a));
const ease=v=>v*v*(3-2*v);
const instructions=["משכו את קצה הסרט למטה.","עכשיו, קלפו את הנייר מהצד.","עוד משיכה קטנה, וזה שלכם.","הלו הלו, אתה כותב ביידיש."];
const outcomes=["קודם הקשר, אחר כך העטיפה.","הסרט בחוץ. נותרה העטיפה.","כבר אפשר להציץ פנימה.","המתנה נפתחה."];
function ribbon(p,side=0){
 const a=ease(segment(p,0,.46)),b=ease(segment(p,.32,.72)),c=ease(segment(p,.62,1));
 parts.left.style.transform=`rotate(${-18-a*48}deg) scale(${1-a*.92},${1-a*.75})`;
 parts.right.style.transform=`rotate(${18+b*48}deg) scale(${1-b*.94},${1-b*.8})`;
 parts.left.style.opacity=1-a;parts.right.style.opacity=1-b;
 parts.knot.style.transform=`translateY(${b*13+c*38}px) rotate(${a*9}deg) scale(${1-b*.35},${1-a*.2})`;
 parts.knot.style.opacity=1-c;
 parts.pull.style.transform=`translate(${side}px,${p*104}px) rotate(${-8-p*10}deg) scaleY(${1+a*.52})`;
 parts.pull.style.opacity=1-c;
 parts.fixed.style.transform=`translate(${-b*24-c*28}px,${b*29+c*67}px) rotate(${22+b*33+c*20}deg)`;
 parts.fixed.style.opacity=1-c;
 parts.top.style.transform=`rotateX(${c*100}deg) rotate(${-c*19}deg)`;
 parts.bottom.style.transform=`rotateX(${-c*105}deg) rotate(${c*16}deg)`;
 parts.hleft.style.transform=`rotateY(${-c*100}deg) rotate(${-c*17}deg)`;
 parts.hright.style.transform=`rotateY(${c*100}deg) rotate(${c*17}deg)`;
 for(const part of [parts.top,parts.bottom,parts.hleft,parts.hright])part.style.opacity=1-c;
 root.style.setProperty("--hand-x",side+"px");
 root.style.setProperty("--hand-y",p*104+"px");
}
function paint(){
 root.dataset.stage=stage;
 instruction.textContent=instructions[stage];outcome.textContent=outcomes[stage];
 handles.forEach(h=>{h.hidden=Number(h.dataset.step)!==stage;h.disabled=busy;});
 replay.hidden=stage!==3;q(".fallback").hidden=stage===3;
 q(".archive").setAttribute("aria-hidden",stage===3?"false":"true");
}
function save(){
 const api=window.openai;
 if(api&&api.setWidgetState)api.setWidgetState({modelContent:{giftStage:stage,ribbonUntied:stage>0},privateContent:{stage,unthread}}).catch(()=>{});
}
function animateRibbon(target,done){
 cancelAnimationFrame(animation);
 const from=unthread,start=performance.now(),reduced=matchMedia("(prefers-reduced-motion: reduce)").matches;
 function tick(now){
  const t=reduced?1:clamp((now-start)/520);
  unthread=from+(target-from)*ease(t);ribbon(unthread);
  if(t<1)animation=requestAnimationFrame(tick);else{animation=0;if(done)done();}
 }
 animation=requestAnimationFrame(tick);
}
function advance(focus=false){
 if(busy||stage>=3)return;
 if(stage===0){
  busy=true;handles[0].disabled=true;
  animateRibbon(1,()=>{busy=false;stage=1;root.classList.remove("dragging");root.style.setProperty("--p",0);paint();save();if(focus)handles[1].focus({preventScroll:true});});
 }else{
  stage++;root.classList.remove("dragging");root.style.setProperty("--p",0);paint();save();
  if(focus)(stage===3?replay:handles[stage]).focus({preventScroll:true});
 }
}
handles.forEach(handle=>{
 handle.addEventListener("pointerdown",e=>{
  if(busy||drag||Number(handle.dataset.step)!==stage||e.button!==0)return;
  cancelAnimationFrame(animation);suppress=false;
  drag={id:e.pointerId,x:e.clientX,y:e.clientY,base:unthread,distance:0,p:0};
  handle.setPointerCapture(e.pointerId);root.classList.add("dragging");
 });
 handle.addEventListener("pointermove",e=>{
  if(!drag||drag.id!==e.pointerId)return;
  const dx=e.clientX-drag.x,dy=e.clientY-drag.y;
  drag.distance=Math.max(drag.distance,Math.hypot(dx,dy));
  if(stage===0){
   const travel=Math.max(0,dy)+Math.max(0,Math.abs(dx)-22)*.18;
   unthread=clamp(drag.base+travel/165);
   ribbon(unthread,Math.max(-28,Math.min(28,dx*.2)));
  }else{
   drag.p=clamp((stage===1?dx:-dx)/Math.min(130,q(".gift").clientWidth*.4));
   root.style.setProperty("--p",drag.p);
  }
 });
 function finish(e){
  if(!drag||drag.id!==e.pointerId)return;
  const d=drag;drag=null;
  suppress=d.distance>5||e.type!=="pointerup";
  if(handle.hasPointerCapture(e.pointerId))handle.releasePointerCapture(e.pointerId);
  root.classList.remove("dragging");
  if(stage===0){
   if(e.type==="pointerup"&&unthread>=.84){advance();return;}
   unthread=e.type==="pointerup"?Math.max(d.base,unthread):d.base;
   ribbon(unthread);
   if(unthread>.03){outcome.textContent=unthread<.45?"הקשר מתחיל להשתחרר. עוד משיכה.":"הלולאה נפתחת. המשיכו למשוך.";save();}
  }else if(e.type==="pointerup"&&d.p>=.72)advance();
  else root.style.setProperty("--p",0);
 }
 handle.addEventListener("pointerup",finish);
 handle.addEventListener("pointercancel",finish);
 handle.addEventListener("lostpointercapture",e=>{if(drag&&drag.id===e.pointerId)finish({pointerId:e.pointerId,type:"pointercancel"});});
 handle.addEventListener("click",e=>{
  if(suppress&&e.detail!==0){suppress=false;return;}
  suppress=false;if(Number(handle.dataset.step)===stage)advance(true);
 });
});
replay.addEventListener("click",()=>{
 generation++;cancelAnimationFrame(animation);animation=0;busy=false;drag=null;suppress=false;stage=0;unthread=0;
 root.classList.remove("dragging");root.style.setProperty("--p",0);ribbon(0);paint();save();handles[0].focus({preventScroll:true});
});
function restore(state){
 const data=state&&state.privateContent;
 if(!data||!Number.isInteger(data.stage)||data.stage<0||data.stage>3)return;
 generation++;cancelAnimationFrame(animation);animation=0;drag=null;busy=false;suppress=false;
 stage=data.stage;unthread=stage>0?1:Math.min(.83,clamp(Number(data.unthread)||0));
 root.classList.remove("dragging");root.style.setProperty("--p",0);ribbon(unthread);paint();
}
ribbon(0);paint();
restore(window.openai&&window.openai.widgetState);
window.addEventListener("openai:set_globals",e=>{
 const globals=e.detail&&e.detail.globals;
 if(globals&&Object.prototype.hasOwnProperty.call(globals,"widgetState"))restore(globals.widgetState);
});
})();
</script>

<noscript><p>זאת הדגמה של עטיפת ZIP. אפשר לצפות בסרטון ההתקנה למעלה גם בלי JavaScript.</p></noscript>

איזה כיף זה יכול להיות: גם תוכנה שבנו במיוחד בשבילכם, וגם הרגע הזה של לפתוח מתנה.

בינתיים, ממש ממש אשמח שתכתבו לי כאן: **אילו תוכנות כמתנות הייתם רוצים לראות, ולמי הייתם נותנים אותן?**

אבנה אותן כאן בצורה שקופה, מהבעיה ומהשיחות עם השלוח ועד לתוכנה שאפשר לתת במתנה.

<style>
.prose [data-gift-copy]{display:block;margin-block:1rem .35rem;padding:.5rem .8rem;min-height:44px;border:1px solid var(--line);border-radius:var(--radius);background:var(--surface);color:var(--fg);font:inherit;font-size:.85rem;cursor:pointer}
.prose [data-gift-copy][hidden]{display:none}
.prose [data-gift-copy]:focus-visible{outline:2px solid var(--accent);outline-offset:3px}
.prose .software-gift-video{display:block;width:100%;height:auto;aspect-ratio:16/9;background:var(--surface)}
</style>

<script src="/media/posts/software-as-small-gifts/copy-prompts.js" defer></script>
