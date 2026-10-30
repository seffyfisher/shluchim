// People Seffy follows for inspiration across different fields. Keep his order and personal descriptions.
// Pastel colors were randomly assigned once, then saved to keep each person recognizable.
// Public sources checked 2026-10-11; descriptions reflect the linked creators' work.
import type { Lang } from '../i18n/ui.ts';

export interface FriendLink extends Record<Lang, string> {
  url: string;
}

export interface Friend {
  id: string;
  silhouette: 'male' | 'female';
  pastel: string;
  theme: string;
  themeEn: string;
  themeAr: string;
  name: string;
  nameEn: string;
  nameAr: string;
  text: string;
  textEn: string;
  textAr: string;
  links: FriendLink[];
}

export const friends: Friend[] = [
  { id: 'aviz', silhouette: 'male', pastel: '#B5D2E6', theme: 'ניסויים וכלים', themeEn: 'Experiments & tools', themeAr: 'تجارب وأدوات', name: 'אביץ מאיר', nameEn: 'Avitz Maeir', nameAr: 'أفيتس مئير',
    text: 'משתף ניסויים, כלים ודרכים לעבוד עם AI. הרבה סקרנות, הדגמות ורעיונות שאפשר לקחת ולנסות בעצמכם.',
    textEn: 'Shares AI experiments, tools and ways of working, with plenty of curiosity and ideas you can try yourself.',
    textAr: 'يشارك تجارب وأدوات وطرق عمل مع الذكاء الاصطناعي، مع الكثير من الفضول والأفكار التي يمكنك تجربتها بنفسك.',
    links: [{ he: 'כל הקישורים', en: 'All links', ar: 'كل الروابط', url: 'https://linktr.ee/aviz85' }, { he: 'אינסטגרם', en: 'Instagram', ar: 'إنستغرام', url: 'https://www.instagram.com/aviz.85' }] },
  { id: 'yuval', silhouette: 'male', pastel: '#E6C59E', theme: 'בנייה וקוד', themeEn: 'Building & code', themeAr: 'بناء وبرمجة', name: 'יובל אבידני', nameEn: 'Yuval Avidani', nameAr: 'يوفال أفيداني',
    text: 'בונה עם AI ומשתף את הדרך: קוד, כלים והדגמות. מחבר בין הצד הטכני לבין דברים שאפשר לעשות איתו בפועל.',
    textEn: 'Builds with AI and shares the process through code, tools and demos, connecting the technical details to practical uses.',
    textAr: 'يبني بالذكاء الاصطناعي ويشارك الطريق عبر الكود والأدوات والعروض العملية، رابطًا التفاصيل التقنية بالاستخدام الفعلي.',
    links: [{ he: 'האתר', en: 'Website', ar: 'الموقع', url: 'https://yuv.ai/' }, { he: 'יוטיוב', en: 'YouTube', ar: 'يوتيوب', url: 'https://www.youtube.com/@yuv-ai' }, { he: 'X', en: 'X', ar: 'X', url: 'https://x.com/yuvalav' }] },
  { id: 'amitay', silhouette: 'male', pastel: '#E5BCCE', theme: 'פרויקטים ותהליכים', themeEn: 'Projects & workflows', themeAr: 'مشاريع ومسارات عمل', name: 'אמיתי בונה', nameEn: 'Amitay Boneh', nameAr: 'أميتاي بونيه',
    text: 'כותב על עבודה עם AI מתוך הפרויקטים שהוא בונה. משתף תהליכים, ניסיונות וכלים, עם מקום גם למה שלומדים בדרך.',
    textEn: 'Writes about AI through projects he builds, sharing workflows, experiments, tools and what he learns along the way.',
    textAr: 'يكتب عن العمل مع الذكاء الاصطناعي من خلال المشاريع التي يبنيها، مشاركًا مسارات العمل والتجارب وما يتعلمه في الطريق.',
    links: [{ he: 'הניוזלטר', en: 'Newsletter', ar: 'النشرة البريدية', url: 'https://www.aiwithamitay.com/' }, { he: 'לינקדאין', en: 'LinkedIn', ar: 'لينكدإن', url: 'https://il.linkedin.com/in/amitayboneh' }] },
  { id: 'danny', silhouette: 'male', pastel: '#B5D4C5', theme: 'AI בעבודה', themeEn: 'AI at work', themeAr: 'الذكاء الاصطناعي في العمل', name: 'דני שקט', nameEn: 'Danny Shaket', nameAr: 'داني شاكيت',
    text: '״AI בראש שקט״: מחבר בינה מלאכותית לעבודה, לשיווק ולעסקים. מסביר איך להכניס את הכלים האלה לתהליכים של היומיום.',
    textEn: 'Connects AI to work, marketing and business, explaining how to make these tools part of everyday workflows.',
    textAr: 'يربط الذكاء الاصطناعي بالعمل والتسويق والأعمال، ويشرح كيف تصبح هذه الأدوات جزءًا من مسارات العمل اليومية.',
    links: [{ he: 'האתר', en: 'Website', ar: 'الموقع', url: 'https://www.dannyshaket.com/' }, { he: 'לינקדאין', en: 'LinkedIn', ar: 'لينكدإن', url: 'https://www.linkedin.com/in/dannyshaket' }] },
  { id: 'ben', silhouette: 'male', pastel: '#B9D8D7', theme: 'כלים ואוטומציה', themeEn: 'Tools & automation', themeAr: 'أدوات وأتمتة', name: 'בן רוטנברג', nameEn: 'Ben Rotenberg', nameAr: 'بن روتنبرغ',
    text: 'AI בתוך העבודה עצמה: כלים שהוא בונה, אוטומציות ושימושים לצוותים. משתף דוגמאות שמחברות רעיון לפתרון שימושי.',
    textEn: 'Brings AI into real work through tools he builds, automation and team workflows, sharing examples that turn ideas into useful solutions.',
    textAr: 'يُدخل الذكاء الاصطناعي في صميم العمل عبر الأدوات التي يبنيها والأتمتة ومسارات الفرق، مع أمثلة تحول الفكرة إلى حل عملي.',
    links: [{ he: 'AI for Work', en: 'AI for Work', ar: 'AI for Work', url: 'https://www.aiforwork.ing/' }, { he: 'לינקדאין', en: 'LinkedIn', ar: 'لينكدإن', url: 'https://il.linkedin.com/in/ben-rotenberg' }] },
  { id: 'shachar', silhouette: 'male', pastel: '#D1D5A6', theme: 'למידה ויצירה', themeEn: 'Learning & creativity', themeAr: 'تعلم وإبداع', name: 'שחר גולן', nameEn: 'Shachar Golan', nameAr: 'شاحار غولان',
    text: 'מסביר כלי AI דרך הדגמות ויצירה, ומוביל את קהילת ״לומדים AI״. מקום טוב לפגוש כלים חדשים ולראות מה עושים איתם.',
    textEn: 'Explains AI tools through demos and creative work, and leads the Hebrew community “Learning AI.” A place to discover tools and see them in use.',
    textAr: 'يشرح أدوات الذكاء الاصطناعي عبر العروض والأعمال الإبداعية، ويقود مجتمع «نتعلم الذكاء الاصطناعي» بالعبرية لاكتشاف الأدوات وتجربتها.',
    links: [{ he: 'האתר', en: 'Website', ar: 'الموقع', url: 'https://golanai.co.il/' }, { he: 'כל הקישורים', en: 'All links', ar: 'كل الروابط', url: 'https://linktr.ee/sgolan20' }, { he: 'הקהילה בפייסבוק', en: 'Facebook community', ar: 'مجتمع فيسبوك', url: 'https://www.facebook.com/groups/976255830459659/' }] },
  { id: 'omri', silhouette: 'male', pastel: '#D2C4B3', theme: 'חדשות וסקרנות', themeEn: 'News & curiosity', themeAr: 'أخبار وفضول', name: 'עמרי ברק', nameEn: 'Omri Barak', nameAr: 'عومري باراك',
    text: 'חדשות AI וטכנולוגיה עם סקרנות והומור, בניוזלטר epicNews ובטראשטק. מספר על מה שקורה בתחום בשפה שכיף לקרוא ולשמוע.',
    textEn: 'Covers AI and technology with curiosity and humor in epicNews and the co-hosted TrashTech show, making the news enjoyable to follow.',
    textAr: 'يغطي أخبار الذكاء الاصطناعي والتقنية بفضول وروح مرحة في نشرة epicNews وبرنامج TrashTech، بأسلوب ممتع للمتابعة.',
    links: [{ he: 'epicNews', en: 'epicNews', ar: 'epicNews', url: 'https://www.epicnews.io/' }, { he: 'טראשטק ביוטיוב', en: 'TrashTech on YouTube', ar: 'TrashTech على يوتيوب', url: 'https://www.youtube.com/@TrashTechNews' }] },
  { id: 'eyal', silhouette: 'male', pastel: '#C6C0E8', theme: 'קוד ואמנות', themeEn: 'Code & art', themeAr: 'برمجة وفن', name: 'איל גרוס', nameEn: 'Eyal Gruss', nameAr: 'إيال غروس',
    text: 'קוד, שירה ואמנות חישובית. יוצר ניסויים ועבודות שמראים עוד צד של AI, ומרחיבים את מה שאפשר לדמיין וליצור איתו.',
    textEn: 'Works across code, poetry and computational art, creating experiments that show another side of AI and expand what we can imagine and make.',
    textAr: 'يجمع بين البرمجة والشعر والفن الحاسوبي، ويبتكر تجارب وأعمالًا تُظهر جانبًا آخر للذكاء الاصطناعي وتوسع آفاق الإبداع به.',
    links: [{ he: 'האתר והעבודות', en: 'Website and work', ar: 'الموقع والأعمال', url: 'https://eyalgruss.com/' }, { he: 'X', en: 'X', ar: 'X', url: 'https://x.com/eyaler' }] },
  { id: 'doron', silhouette: 'male', pastel: '#C3CEE9', theme: 'יצירה ווידאו', themeEn: 'Creativity & video', themeAr: 'إبداع وفيديو', name: 'דורון צור', nameEn: 'Doron Tsur', nameAr: 'دورون تسور',
    text: 'תסריטים, דיבוב, מוזיקה ווידאו. משתף איך AI נכנס לעשייה היצירתית שלו, עם ניסויים ודוגמאות מתוך העבודה.',
    textEn: 'Explores scripts, voice, music and video, sharing how AI fits into his creative work through experiments and examples.',
    textAr: 'يستكشف السيناريو والدبلجة والموسيقى والفيديو، ويشارك كيف يدخل الذكاء الاصطناعي في عمله الإبداعي عبر تجارب وأمثلة.',
    links: [{ he: 'לינקדאין', en: 'LinkedIn', ar: 'لينكدإن', url: 'https://il.linkedin.com/in/doron-tsur-3835b86' }, { he: 'הרצאות וסדנאות', en: 'Talks and workshops', ar: 'محاضرات وورش عمل', url: 'https://www.taasiya.pro/speaker/doron-tsur' }] },
  { id: 'tal', silhouette: 'male', pastel: '#E8B9B1', theme: 'עיצוב ומוצר', themeEn: 'Design & product', themeAr: 'تصميم ومنتجات', name: 'טל פלורנטין', nameEn: 'Tal Florentin', nameAr: 'طال فلورنتين',
    text: 'מחבר בין חוויית משתמש, מוצר ו־AI. משתף ידע וכלים שעוזרים לחשוב על מה בונים ועל האנשים שישתמשו בזה.',
    textEn: 'Connects user experience, product and AI, sharing knowledge and tools that help us think about what we build and who will use it.',
    textAr: 'يربط بين تجربة المستخدم والمنتج والذكاء الاصطناعي، مشاركًا معرفة وأدوات تساعد على التفكير فيما نبنيه ومن سيستخدمه.',
    links: [{ he: 'האתר', en: 'Website', ar: 'الموقع', url: 'https://talflorentin.com/' }, { he: 'Product Makers', en: 'Product Makers', ar: 'Product Makers', url: 'https://www.productmakers.co.il/' }] },
  { id: 'eilon', silhouette: 'male', pastel: '#D4BFE1', theme: 'כלים והדגמות', themeEn: 'Tools & demos', themeAr: 'أدوات وعروض', name: 'איילון גרופר', nameEn: 'Eilon Grupper', nameAr: 'إيلون غروبر',
    text: 'בודק כלים חדשים ומשתף איך הוא משתמש ב־AI, מקוד ועד עריכת וידאו. מדריכים והדגמות שנותנים חשק לפתוח כלי ולנסות.',
    textEn: 'Tries new tools and shares how he uses AI, from code to video editing, with tutorials and demos that invite you to experiment.',
    textAr: 'يجرب أدوات جديدة ويشارك كيف يستخدم الذكاء الاصطناعي من البرمجة حتى تحرير الفيديو، مع شروحات تدعوك للتجربة.',
    links: [{ he: 'האתר', en: 'Website', ar: 'الموقع', url: 'https://eilon.co/' }, { he: 'הבלוג', en: 'Blog', ar: 'المدونة', url: 'https://eilon.co/ai-blog/' }] },
  { id: 'daniel', silhouette: 'male', pastel: '#BFCDAF', theme: 'AI ועיצוב', themeEn: 'AI & design', themeAr: 'الذكاء الاصطناعي والتصميم', name: 'דניאל בוארון', nameEn: 'Daniel Boaron', nameAr: 'دانييل بوعارون',
    text: 'מחבר AI לעיצוב ולמוצר דרך Design AI. משתף דוגמאות ודרכי עבודה שמכניסות את הכלים החדשים לתהליך העיצוב.',
    textEn: 'Connects AI to design and product through Design AI, sharing examples and approaches for bringing new tools into the design process.',
    textAr: 'يربط الذكاء الاصطناعي بالتصميم والمنتجات عبر Design AI، مشاركًا أمثلة وأساليب لإدخال الأدوات الجديدة في عملية التصميم.',
    links: [{ he: 'Design AI', en: 'Design AI', ar: 'Design AI', url: 'https://designai.co.il/' }] },
  { id: 'ran', silhouette: 'male', pastel: '#E8CFA4', theme: 'פיתוח ואבטחה', themeEn: 'Development & security', themeAr: 'تطوير وأمن معلومات', name: 'רן בר־זיק', nameEn: 'Ran Bar-Zik', nameAr: 'ران بار-زيك',
    text: 'כותב בעברית על פיתוח, אבטחה ו־AI ב״אינטרנט ישראל״. נכנס לפרטים ומשתף הסברים ודוגמאות שאפשר ללמוד מהם ולעבוד איתם.',
    textEn: 'Writes in Hebrew about development, security and AI on Internet Israel, with detailed explanations and practical examples.',
    textAr: 'يكتب بالعبرية عن التطوير وأمن المعلومات والذكاء الاصطناعي في موقع «إنترنت إسرائيل»، مع شروحات مفصلة وأمثلة عملية.',
    links: [{ he: 'אינטרנט ישראל', en: 'Internet Israel', ar: 'إنترنت إسرائيل', url: 'https://internet-israel.com/' }, { he: 'לינקדאין', en: 'LinkedIn', ar: 'لينكدإن', url: 'https://il.linkedin.com/in/barzik' }] },
  { id: 'tom', silhouette: 'male', pastel: '#DBBCD8', theme: 'עבודת צוות', themeEn: 'Teamwork', themeAr: 'العمل الجماعي', name: 'תום אבן', nameEn: 'Tom Even', nameAr: 'توم إيفن',
    text: 'בונה ועובד עם צוות של עוזרי AI, ומשתף איך זה עובד אצלו בעסק. מלמד מתוך המערכת שהוא משתמש בה בעצמו.',
    textEn: 'Builds and works with a team of AI assistants, sharing how they run in his own business and teaching from the system he uses himself.',
    textAr: 'يبني ويعمل مع فريق من مساعدي الذكاء الاصطناعي، ويشارك كيف يعملون في شركته ويعلم من واقع النظام الذي يستخدمه بنفسه.',
    links: [{ he: 'agents&me', en: 'agents&me', ar: 'agents&me', url: 'https://getagents.today/' }, { he: 'לינקדאין', en: 'LinkedIn', ar: 'لينكدإن', url: 'https://il.linkedin.com/in/tom-even-ai' }] },
  // CLAVE website and blog checked 2026-10-13; the personal recommendation is Seffy's wording.
  { id: 'dorit-singer', silhouette: 'female', pastel: '#E2C7AF', theme: 'סטוריטלינג ושיווק', themeEn: 'Storytelling & marketing', themeAr: 'السرد القصصي والتسويق', name: 'דורית סינגר (CLAVE)', nameEn: 'Dorit Singer (CLAVE)', nameAr: 'دوريت سينغر (CLAVE)',
    text: 'סטוריטלר לשיווק מספר 1, מבחינתי. ב־CLAVE היא כותבת ומשתפת ידע על סטוריטלינג, שיווק ואיקומרס.',
    textEn: 'My number-one marketing storyteller. At CLAVE she writes and shares insights on storytelling, marketing and e-commerce.',
    textAr: 'راوية القصص التسويقية رقم 1 بالنسبة إلي. في CLAVE تكتب وتشارك المعرفة حول السرد القصصي والتسويق والتجارة الإلكترونية.',
    links: [{ he: 'CLAVE', en: 'CLAVE', ar: 'CLAVE', url: 'https://clave.co.il/' }, { he: 'הבלוג', en: 'Blog', ar: 'المدونة', url: 'https://clave.co.il/%D7%91%D7%9C%D7%95%D7%92/' }] },
  // Official biography checked 2026-10-14: https://www.orkantor.com/about-5-1.
  { id: 'or-kantor', silhouette: 'male', pastel: '#BCD8CD', theme: 'יוצרים', themeEn: 'Creators', themeAr: 'مبدعون', name: 'אור קנטור', nameEn: 'Or Kantor', nameAr: 'أور كانتور',
    text: 'אמן רב־תחומי ומקעקע. התחיל את דרכו בקעקועים ומשלב מהם אלמנטים באמנות שלו: ציור באקריליק על קנבס, גואש על נייר, רישום והדפס.',
    textEn: 'A multidisciplinary artist and tattooist. He began in tattooing and brings elements of it into his art: acrylic on canvas, gouache on paper, drawing and printmaking.',
    textAr: 'فنان متعدد التخصصات وفنان وشم. بدأ طريقه في الوشم ويدمج عناصر منه في أعماله الفنية: الأكريليك على القماش، الغواش على الورق، الرسم والطباعة.',
    links: [{ he: 'האתר והעבודות', en: 'Website and work', ar: 'الموقع والأعمال', url: 'https://www.orkantor.com/' }] },
];
