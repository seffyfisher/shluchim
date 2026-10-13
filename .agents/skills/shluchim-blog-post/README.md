# Skill: כתיבת פוסט לבלוג ״שְׁלוּחִים״

חבילת skill ניידת (פורמט Agent Skills) שמלמדת כל סוכן AI לכתוב ולהכין פוסט לבלוג https://shluchim.shinlamed.com מקצה לקצה: מ־💯, דרך טיוטה בקול של ספי, אישור, תמונות, אישור תמונות, גרסה אנגלית ומסירה לפרסום. ההעלאה הטכנית לא כלולה.

## מה יש בפנים
```
SKILL.md            ההוראות הראשיות והתהליך עם שערי האישור
references/         קול, כללי כתיבה, שפה ויזואלית, צילומי מסך, צ׳קליסטים
templates/          תבניות לפוסט בעברית ובאנגלית, פרומפט תמונה, הודעת אישור
examples/           שני פוסטים אמיתיים (עברית+אנגלית), תמונות רפרנס, דוגמת תכנון תמונות
```

## התקנה ב־ChatGPT
**Custom GPT:**
1. Explore GPTs ← Create ← Configure.
2. ב־Instructions מדביקים את כל התוכן של `SKILL.md` (בלי ה־frontmatter זה גם בסדר).
3. ב־Knowledge מעלים את כל הקבצים מ־`references/`, `templates/` ו־`examples/` (כולל התמונות). ChatGPT לא שומר תיקיות, אז השמות של הקבצים מספיקים.
4. מפעילים Image Generation ב־Capabilities.

**Project:** יוצרים Project, מדביקים את `SKILL.md` ב־Instructions, ומעלים את שאר הקבצים כ־Project files.

## התקנה ב־Claude
**Skills (Claude.ai / Claude Code / API):** מעלים את קובץ ה־zip כמו שהוא (Settings ← Capabilities ← Skills ← Upload), או ב־Claude Code מעתיקים את התיקייה ל־`~/.claude/skills/shluchim-blog-post-skill/`. Claude טוען את ה־skill לפי ה־description כשכותבים 💯 או מבקשים פוסט.

**Project:** יוצרים Project, מדביקים את `SKILL.md` ב־Project instructions, ומעלים את שאר הקבצים ל־Project knowledge.

שימו לב: ל־Claude אין מחולל תמונות מובנה. הוא יכין את הפרומפטים המלאים, ואת התמונות מייצרים בכלי אחר.

## Cursor וסוכנים אחרים
- **Cursor:** מעתיקים את התיקייה לפרויקט (למשל `.cursor/skills/shluchim-blog-post-skill/`), או מוסיפים Rule שמפנה ל־`SKILL.md`.
- **כל סוכן אחר שתומך ב־Agent Skills:** שמים את התיקייה בתיקיית ה־skills שלו.
- **סוכן בלי תמיכה ב־skills:** מדביקים את `SKILL.md` כהוראות מערכת, ומצרפים את שאר הקבצים כקבצי ידע או בתחילת השיחה.

## איך משתמשים
כותבים לסוכן 💯 על סיפור, או ״בוא נכתוב פוסט על...״, ומדביקים את השיחה המקורית. הסוכן יעבור את השלבים ויעצור לאישור לפני תמונות ולפני מסירה לפרסום.
