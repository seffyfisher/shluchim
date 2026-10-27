// Ready-bot link directory for /links/ (HE).
// Copy: draft-v4 micro-stories (Kineret polish, Seffy voice) — approved via Yosef 2026-10-27.
// Avatar choice (shared / 4–6 variants / per-link) still pending Seffy. Do not merge until Yosef final OK.
export type ReadyBotLink = {
  id: string;
  button: string; // short HE CTA
  href: string;
  body: string[]; // HE micro-story paragraphs
  avatar: string; // path under src/assets/ (placeholder faces until Seffy decides)
};

export const readyBotIntro = {
  title: "קישורים נוספים",
  subtitle: "בוטים מוכנים בחינם",
  paragraphs: [
    "נכנסתי פעם לסופרמרקט אמריקאי ענק.",
    "שש מאות מטרים של דגני בוקר.",
    "רציתי לברוח.",
    "ואז מצאתי בדיוק את מה שחיפשתי, בשורה השלישית.",
    "ככה גם פה.",
    "ריכזנו המון מקורות השראה, לפתוח את הראש.",
    "לא צריך להילחץ מהשפע.",
    "למטה 25 קישורים.",
    "לכל אחד סיפור קטן למה שווה לפתוח.",
  ],
  closing: [
    "אל תפתחו עשרים קישורים בבת אחת.",
    "בוחרים תפקיד אחד שכבר מכירים טוב.",
    "קוראים את ההתקנה.",
    "מחברים רק מה שצריך.",
    "ובודקים את התוצאה הראשונה לפני שמכניסים לשגרה.",
    "הקישורים עצמם בחינם.",
    "ההרצה עדיין עולה מהתוכנית שלכם, מקריאות לשירותים או משרת.",
    "וכשצוות כבר עובד, תנו להם לשתף מה שמצאו.",
    "מסירות קצרות.",
    "שומרים מה שנגמר.",
    "ולכל משימה שנכשלה יש נקודה שבה היא נעצרת.",
  ],
  suggestCta: "יש לך מקור מעניין נוסף ששווה להכניס?",
};

export const readyBotLinks: ReadyBotLink[] = [
  {
    id: "link-01",
    button: "הערות שדה",
    href: "https://github.com/unicodef1wn/grokbot-field-notes",
    body: [
      "בניתם צוות שלושה ימים ברצף, ואז שכחתם מה עבד ומה נשבר.",
      "כאן יש חוקים ומדריכים מתוך 72 שעות בנייה חיה, וגם יומן של מה שלא עבד. אפשר להעתיק ולהתחיל ממה שכבר נבדק בפועל.",
    ],
    avatar: "shluchim/basher.webp",
  },
  {
    id: "link-02",
    button: "קטלוג גדול",
    href: "https://github.com/majiayu000/awesome-grok-bot",
    body: [
      "יושבים מול מסך ריק וכותבים הוראות מאפס, בזמן שמישהו כבר בנה את זה אלפי פעמים.",
      "יש כאן יותר מ־6,000 בוטים מוכנים, מסודרים עם חיפוש. שווה להציץ לפני שמתחילים מההתחלה.",
    ],
    avatar: "shluchim/kochava.webp",
  },
  {
    id: "link-03",
    button: "שולחן מסחר",
    href: "https://github.com/galleonlabs/hypergrok-trading-desk",
    body: [
      "רוצים לבדוק רעיון מסחר, בלי לתת לבוט ללחוץ לבד על כפתור הקנייה.",
      "יש כאן שולחן עם מומחים שמכסים מחקר, סיכון וביקורת. קודם מחקר, וכל עסקה דורשת אישור שלך.",
    ],
    avatar: "shluchim/kinneret.webp",
  },
  {
    id: "link-04",
    button: "הרכבי צוות",
    href: "https://github.com/codejunkie99/rosterroom",
    body: [
      "צריך צוות למייסד, לתפעול או לכספים, ואין כוח להמציא תפקידים מאפס.",
      "יש 82 הרכבים מוכנים להדבקה. לכל אחד יש תפקידים, משימה ראשונה, ומה מותר רק אחרי שאישרת.",
    ],
    avatar: "shluchim/ben.webp",
  },
  {
    id: "link-05",
    button: "פרופילים",
    href: "https://github.com/HAEGONG/grok-bot-profiles",
    body: [
      "הבונה סיים שינוי, ואז בדק את עצמו. ניחשתם איך זה נגמר.",
      "כאן יש ארבעה תפקידים, והבודק עובד בצ׳אט נפרד. ככה אף אחד לא בודק את העבודה של עצמו.",
    ],
    avatar: "shluchim/loren.webp",
  },
  {
    id: "link-06",
    button: "מתקין צוות",
    href: "https://github.com/ellelion/botteams",
    body: [
      "רוצים צוות שלם לחברה, בלי לשבת שעה על כל בוט בנפרד.",
      "מעתיקים הוראת התקנה אחת. הוא יוצר את הבוטים, פותח צ׳אט קבוצתי, ומציע שגרות לאישור שלך.",
    ],
    avatar: "shluchim/nitza.webp",
  },
  {
    id: "link-07",
    button: "מדריך הוראות",
    href: "https://github.com/elie222/botdirectory.ai",
    body: [
      "יש תפקיד בראש, ואין מילים להסביר לבוט מה אתם רוצים ממנו.",
      "כאן יש מדריך פתוח של הוראות לפי תפקיד. גולשים, מעתיקים, וממשיכים.",
    ],
    avatar: "shluchim/chef.webp",
  },
  {
    id: "link-08",
    button: "מיומנויות",
    href: "https://github.com/jaskirat1616/grok-skills",
    body: [
      "אומרים לבוט ״תתקן את זה״, והוא מנחש. לפעמים הוא מנחש נכון. לפעמים לא.",
      "יש כאן 195 תהליכים מוכנים לבדיקת קוד, תיקון באגים, מחקר, כתיבה ומשלוח. במקום הוראה מעורפלת, נותנים לו דרך שכבר נוסתה.",
    ],
    avatar: "shluchim/anali.webp",
  },
  {
    id: "link-09",
    button: "בוט שורש",
    href: "https://github.com/MrBekoX/root-agent-skill-framework",
    body: [
      "פתחתם חמישה בוטים בבת אחת, ואז גיליתם שאתם מנהלים את כולם לבד.",
      "בוט שורש מחליט כמה גדול הצוות צריך להיות. יוצר את המומחים, ומעביר את הניהול היומי למי שאחראי.",
    ],
    avatar: "shluchim/hiba.webp",
  },
  {
    id: "link-10",
    button: "הסכם צוות",
    href: "https://github.com/lsj210001/crew-contract",
    body: [
      "הצוות רץ, אבל אף אחד לא זוכר מי אחראי על מה, ומתי מותר לעצור.",
      "יש כאן הסכם הפעלה פשוט. משימות ברורות, שם על כל בעלות, הוכחה בכל מסירה, ועצירה כשהתקציב נגמר.",
    ],
    avatar: "shluchim/dima.webp",
  },
  {
    id: "link-11",
    button: "תבניות",
    href: "https://github.com/cobusgreyling/grok-bot-templates",
    body: [
      "רוצים להתחיל מהר, בלי לבנות הכל מהיסוד.",
      "יש 49 תבניות, צוותים, מיומנויות ושגרות. ויש גם ציון שמראה כמה ההתקנה באמת מוכנה.",
    ],
    avatar: "shluchim/shlomby.webp",
  },
  {
    id: "link-12",
    button: "מחקר מניות",
    href: "https://github.com/jaredtrichard/grok-research",
    body: [
      "רוצים צוות שחוקר מניות, בלי שהוא יתחיל לסחור בשמכם.",
      "יש כאן חוקרים קבועים, דוחות ודעות שנבדקו. המחקר נשאר מופרד ממסחר חי בכוונה.",
    ],
    avatar: "shluchim/shon.webp",
  },
  {
    id: "link-13",
    button: "מערכת מכירות",
    href: "https://github.com/romangojiberryAI/gojiberryai-sales-os",
    body: [
      "הלידים נערמים, והמעקב נשאר בראש של מישהו אחד.",
      "יש 13 תפקידי מכירות, מסימן שמישהו מוכן לקנות ועד מעקב אחרי מה שפתוח. הכול דרך החיבור של GojiberryAI.",
    ],
    avatar: "shluchim/shaltiel.webp",
  },
  {
    id: "link-14",
    button: "פנייה יזומה",
    href: "https://github.com/bcharleson/grokbot-for-gtm",
    body: [
      "רוצים לפנות לאנשים חדשים, בלי לשלוח הודעה אחת בלי עיניים שלכם עליה.",
      "יש מדריך מלא: מחקר, מייל, לינקדאין, תשובות ומעקב אחרי פגישות. כל שליחה עוברת אישור שלך.",
    ],
    avatar: "shluchim/bore.webp",
  },
  {
    id: "link-15",
    button: "התקנות מוכנות",
    href: "https://github.com/PramodDutta/botskills",
    body: [
      "מצאתם בוט נחמד, ואז גיליתם שהוא יכול לעשות דברים שלא ביקשתם.",
      "כאן כל התקנה מפרטת אילו חיבורים היא צריכה. ואיזו פעולה אחת אסור לה לעשות בלי אותך.",
    ],
    avatar: "shluchim/eran.webp",
  },
  {
    id: "link-16",
    button: "חיסכון בעלות",
    href: "https://github.com/Chakhdz/grok-bot-token-saver",
    body: [
      "הצ׳אט התנפח, והחשבון קפץ, כי הבוטים גררו איתם את כל ההיסטוריה.",
      "כאן הראש והעובדים מתחילים מכרטיס תפקיד קצר ומסירה נקייה. בלי לגרור צ׳אטים ישנים קדימה.",
    ],
    avatar: "shluchim/basher.webp",
  },
  {
    id: "link-17",
    button: "קטלוג מאומת",
    href: "https://github.com/kydlikebtc/awesome-grokbot",
    body: [
      "פתחתם קישור יפה, והוא הוביל למקום מת.",
      "כאן כמעט 1,900 בוטים ציבוריים, כל קישור נבדק עם ייחוס למקור. אפשר לחפש לפי תפקיד בלי לנחש.",
    ],
    avatar: "shluchim/kochava.webp",
  },
  {
    id: "link-18",
    button: "כלים ותוספים",
    href: "https://github.com/ZeroPointRepo/awesome-grok-bot",
    body: [
      "הבוט יודע לדבר, אבל הוא לא מחובר לכלום.",
      "יש כאן יותר מ־60 מיומנויות, תוספים וחיבורים שנבדקו. ועוד דרכים להריץ אצלך על המחשב.",
    ],
    avatar: "shluchim/kinneret.webp",
  },
  {
    id: "link-19",
    button: "שורת פקודה",
    href: "https://github.com/ScriptedAlchemy/grok-bot-cli",
    body: [
      "רוצים ליצור בוטים ולשלוח הודעות מתוכנית, בלי להעתיק סיסמאות למקום מוזר.",
      "הכלי הזה עובד מהמחשב שלכם. יוצרים קבוצות, שולחים הודעות, ובודקים שיחות בלי דרך עקומה.",
    ],
    avatar: "shluchim/ben.webp",
  },
  {
    id: "link-20",
    button: "מיומנות לקרסר",
    href: "https://github.com/adamanz/grok-bot-skill",
    body: [
      "אתם כבר בקרסר, ורוצים לרשום עמית ב־Grok Bot בלי לעבור חמישה מסכים.",
      "יש מיומנות שעושה בדיוק את זה. רושמים, שולחים הודעות, ויוצרים עמיתים משם.",
    ],
    avatar: "shluchim/loren.webp",
  },
  {
    id: "link-21",
    button: "בוט מקומי",
    href: "https://github.com/robbin/grokbot-local-agent",
    body: [
      "יש עבודה כבדה מדי לצ׳אט, ואתם לא רוצים לחכות עם העיניים על המסך.",
      "Grok Bot מעביר אותה לבוט על המחשב שלכם. ומתעורר לבד כשהעבודה נגמרת.",
    ],
    avatar: "shluchim/nitza.webp",
  },
  {
    id: "link-22",
    button: "בחירת צוות",
    href: "https://github.com/mergisi/awesome-grokbot",
    body: [
      "יודעים שצריך צוות הנדסה או שיווק, ולא יודעים מאיפה להתחיל.",
      "מדביקים קובץ התחלה ובוחרים צוות מוכן. הנדסה, מכירות, שיווק, תפעול או אישי.",
    ],
    avatar: "shluchim/chef.webp",
  },
  {
    id: "link-23",
    button: "חלופה פתוחה",
    href: "https://github.com/elie222/rakazo",
    body: [
      "אוהבים את הרעיון של Grok Bot, ורוצים לבחור בעצמכם את המודל ואת סביבת ההרצה.",
      "יש חלופה בקוד פתוח. אותו כיוון, עם יותר שליטה בידיים שלכם.",
    ],
    avatar: "shluchim/anali.webp",
  },
  {
    id: "link-24",
    button: "עמיתים מקומיים",
    href: "https://github.com/opencoredev/akeru-bot",
    body: [
      "רוצים עמיתים עם זיכרון משלהם, בלי שההיסטוריה תברח החוצה.",
      "הם רצים אצלכם, עם כלים והוראות משלהם. הפרופילים נשארים על המכונות שלכם.",
    ],
    avatar: "shluchim/hiba.webp",
  },
  {
    id: "link-25",
    button: "סביבת דסקטופ",
    href: "https://github.com/madebywelch/guaca",
    body: [
      "הבוטים עובדים בחלון אחד, ואתם מעבירים ביניהם הודעות ביד.",
      "יש מקום עבודה משותף על המחשב. הם חולקים צ׳אטים, מעבירים משימות, ומשתמשים בכלים ביחד.",
    ],
    avatar: "shluchim/dima.webp",
  },
];
