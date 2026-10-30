// Topic hubs: /topics/<slug>/ (Hebrew), /en/topics/<slug>/ (English), and /ar/topics/<slug>/ (Arabic).
// Posts opt in with `topics: [slug, ...]` in the frontmatter (keys are language-neutral, validated by the content schema).
// Plain .mjs so astro.config.mjs / the sitemap pairing can read it without the TS toolchain.
//
// Wording rules (see AGENTS.md / PUBLISHING.md):
//  - Hebrew: שְׁלוּחִים always with niqqud in reader-facing text; never סוכנים/בוטים (Grok Bot is a product name).
//  - English / Arabic: no Hebrew niqqud; Arabic keeps Latin Shluchim brand and avoids شلوخيم/رسول.
// `label` = the topic's name (footer links, breadcrumbs, JSON-LD); `chip` = the shorter form shown in a post's meta line; `title` = the hub H1; `seoTitle` / `seoDescription` = <title> / meta description.
export const TOPICS = {
  'grok-bot': {
    he: {
      label: 'Grok Bot',
      chip: 'Grok Bot',
      title: 'גרוקבוט (Grok Bot): מעשיות מהשטח',
      seoTitle: 'גרוקבוט (Grok Bot): מעשיות ושימושים אמיתיים',
      seoDescription: 'איך Grok Bot נראה בעבודה אמיתית: מייל ויומן בלי קונקטור, התראות על מכסה, הודעות בין שני גרוקבוטים וארוחות ערב. מעשיות מהשטח, עם צילומי מסך.',
      intro: [
        'Grok Bot הוא כלי ה־AI שהשְׁלוּחִים שלי עובדים דרכו.',
        'כאן כל המעשיות שבהן הוא הופיע: מה ניסיתי, מה עבד ומה נתקע.',
      ],
    },
    en: {
      label: 'Grok Bot',
      chip: 'Grok Bot',
      title: 'Grok Bot: practical stories from real use',
      seoTitle: 'Grok Bot in practice: real stories and use cases',
      seoDescription: 'How Grok Bot works in real life: Outlook without a connector, quota-reset alerts, two Grok Bots messaging each other, an AI chef. First-hand stories.',
      intro: [
        'Grok Bot is the AI tool my shluchim run on.',
        'These are the stories where it shows up: what I tried, what worked, and what got stuck.',
      ],
    },
    ar: {
      label: 'Grok Bot',
      chip: 'Grok Bot',
      title: 'Grok Bot: حكايات عملية من الاستخدام الفعلي',
      seoTitle: 'Grok Bot في العمل: حكايات واستخدامات حقيقية',
      seoDescription: 'كيف يعمل Grok Bot في الحياة العملية: البريد والتقويم بلا موصل جاهز، تنبيهات الحصة، رسائل بين مساعدين وطاه بالذكاء الاصطناعي. تجارب حقيقية.',
      intro: [
        'Grok Bot هو أداة الذكاء الاصطناعي التي يعمل عبرها مبعوثيّ من المساعدين.',
        'هنا كل الحكايات التي ظهر فيها: ماذا جربت، وماذا نجح، وماذا تعثر.',
      ],
    },
  },
  'ai-at-work': {
    he: {
      label: 'בינה מלאכותית בעבודה',
      chip: 'AI בעבודה',
      title: 'בינה מלאכותית בעבודה: מה עושים איתה בפועל',
      seoTitle: 'בינה מלאכותית בעבודה: מעשיות פרקטיות עם AI',
      seoDescription: 'איך משתמשים בבינה מלאכותית בעבודה היומיומית: ניתוח GA4 ו־Clarity, מרכז עזרה, עיצוב, קוד וטיקטים של לקוחות. דוגמאות אמיתיות, עם מספרים.',
      intro: [
        'אלה המעשיות מהעבודה: אנליטיקס, שירות לקוחות, עיצוב ופיתוח.',
        'בכל מעשיה יש מה ביקשתי, מה השְׁלוּחִים עשו, ומספרים אמיתיים.',
      ],
    },
    en: {
      label: 'AI at work',
      chip: 'AI at work',
      title: 'AI at work: what AI agents actually do',
      seoTitle: 'Practical AI at work: real stories with real numbers',
      seoDescription: 'Practical AI at work: GA4 and Clarity analysis, help-center FAQs, a design process, checkout fixes and support tickets. Real examples with real numbers.',
      intro: [
        'Stories from my job: analytics, customer support, design and development.',
        'Each one shows what I asked, what the AI agents did, and the numbers that came out.',
      ],
    },
    ar: {
      label: 'الذكاء الاصطناعي في العمل',
      chip: 'الذكاء الاصطناعي في العمل',
      title: 'الذكاء الاصطناعي في العمل: ماذا يفعل فعليًا',
      seoTitle: 'الذكاء الاصطناعي في العمل: حكايات وأرقام حقيقية',
      seoDescription: 'الذكاء الاصطناعي العملي في العمل اليومي: تحليل GA4 وClarity، مركز المساعدة، التصميم، البرمجة وتذاكر خدمة العملاء. أمثلة حقيقية مع أرقام فعلية.',
      intro: [
        'هذه حكايات من عملي: التحليلات، خدمة العملاء، التصميم والتطوير.',
        'في كل حكاية ترى ماذا طلبت، وماذا فعل مساعدو الذكاء الاصطناعي، والأرقام الحقيقية التي خرجت.',
      ],
    },
  },
  'everyday-ai': {
    he: {
      label: 'בינה מלאכותית ביומיום',
      chip: 'AI ביומיום',
      title: 'בינה מלאכותית ביומיום: עוזרי AI בבית ובחיים',
      seoTitle: 'בינה מלאכותית ביומיום: דוגמאות מהחיים האמיתיים',
      seoDescription: 'בינה מלאכותית ביומיום, בלי ז׳רגון: שף AI שמתכנן ארוחות ומילא סל קניות, תזכורות שמוחקות את עצמן, אתר אישי שמתעדכן מצ׳אט ותיק לנושא משפחתי.',
      intro: [
        'לא רק עבודה. השְׁלוּחִים עוזרים גם בבית: ארוחות ערב, תזכורות, אתר אישי ונושא משפחתי אחד רגיש.',
        'בלי ז׳רגון, כמו חבר שמראה לך מה הוא עושה.',
      ],
    },
    en: {
      label: 'Everyday AI',
      chip: 'Everyday AI',
      title: 'Everyday AI: AI agents at home and in life',
      seoTitle: 'Everyday AI: practical examples from daily life',
      seoDescription: 'Everyday AI without the jargon: an AI chef that plans dinners and fills the cart, reminders that delete themselves, a personal site updated from chat.',
      intro: [
        'Not only work. My shluchim also help at home: dinners, reminders, a personal website and one sensitive family matter.',
        'No jargon. Just a friend showing you what they do.',
      ],
    },
    ar: {
      label: 'الذكاء الاصطناعي اليومي',
      chip: 'الذكاء الاصطناعي اليومي',
      title: 'الذكاء الاصطناعي اليومي: مساعدون في البيت والحياة',
      seoTitle: 'الذكاء الاصطناعي اليومي: أمثلة من الحياة الواقعية',
      seoDescription: 'الذكاء الاصطناعي اليومي بلا مصطلحات معقدة: طاه يخطط وجبات العشاء ويملأ سلة التسوق، تذكيرات تحذف نفسها، وموقع شخصي يتحدث مباشرة من المحادثة.',
      intro: [
        'ليس للعمل وحده. يساعدني مبعوثيّ من الذكاء الاصطناعي في البيت أيضًا: وجبات العشاء، التذكيرات، موقع شخصي وموضوع عائلي حساس.',
        'بلا مصطلحات معقدة، مثل صديق يريك ما يفعله.',
      ],
    },
  },
  'agent-teamwork': {
    he: {
      label: 'עבודת צוות',
      chip: 'עבודת צוות',
      title: 'איך השְׁלוּחִים עובדים ביחד',
      seoTitle: 'צוות של עוזרי AI: איך הם עובדים ביחד',
      seoDescription: 'איך צוות עוזרי AI עובד ביחד: מנהל צוות שמנתב משימות, מומחים לכל תחום, handoff בין שְׁלוּחִים, שגרות וכללים משותפים. מעשיות מהשטח.',
      intro: [
        'שְׁלוּחִים לא עובדים לבד. יש מנהל צוות, יש מומחים, ויש כללים שכולם מכירים.',
        'המעשיות האלה מראות איך זה נראה מבפנים, כולל הפעמים שזה נתקע.',
      ],
    },
    en: {
      label: 'Teamwork',
      chip: 'Teamwork',
      title: 'How AI agents work together',
      seoTitle: 'How a team of AI agents works together',
      seoDescription: 'How a team of AI agents works together: a manager that routes tasks, specialists, handoffs between agents, routines and shared rules. First-hand stories.',
      intro: [
        "Shluchim don't work alone. There is a team manager, there are specialists, and there are rules everyone follows.",
        'These stories show how it looks from the inside, including the times it got stuck.',
      ],
    },
    ar: {
      label: 'العمل الجماعي',
      chip: 'العمل الجماعي',
      title: 'كيف يعمل مساعدو الذكاء الاصطناعي معًا',
      seoTitle: 'فريق مساعدي الذكاء الاصطناعي: كيف يعملون معًا',
      seoDescription: 'كيف يعمل فريق مساعدي الذكاء الاصطناعي معًا: مدير فريق يوزع المهام، متخصصون لكل مجال، تسليم مهام منظم، وقواعد مشتركة. حكايات وتجارب من الداخل.',
      intro: [
        'لا يعمل مساعدو الذكاء الاصطناعي لدي منفردين. هناك مدير للفريق، وهناك متخصصون، وقواعد يتبعها الجميع.',
        'تُظهر هذه الحكايات كيف يبدو العمل من الداخل، بما في ذلك المرات التي تعثر فيها.',
      ],
    },
  },
};

export const TOPIC_SLUGS = Object.keys(TOPICS);
