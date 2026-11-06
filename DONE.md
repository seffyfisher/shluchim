# SEF-263 Phase B: DONE (uncommitted report)

- **Draft PR:** https://github.com/seffyfisher/shluchim/pull/108 (draft, base main, NOT merged)
- **Commit:** c78b6cdfc018f6c3a70b9ae4a2a2f4315d11b158 on `feat/arabic-shell-docs` (from main @ 9bcbb12)

## Files changed
- `src/content/pages/ar/about.md` (new): full MSA About
- `src/components/AboutPage.astro`: Arabic stub removed (ar now renders Content); EN placeholder fallback kept
- `src/i18n/ui.ts`: `LANG_MENU_ORDER = ['he','ar','en']`
- `src/layouts/Base.astro`: both dropdowns use LANG_MENU_ORDER; label `dir` moved to inner `<span>`
- `src/styles/global.css`: `.lang-menu` + items `direction: rtl; text-align: right`, `justify-content: flex-start`
- `PUBLISHING.md`, `SEO-GEO.md`, `AGENTS.md`: Arabic sections
- `.agents/skills/shluchim-blog-post/SKILL.md`, `references/checklist.md`, `references/arabic.md` (new)

## Language dropdown
Order is now עברית → العربية → English. The menu and its items are RTL and right-aligned on every language page. Labels unchanged. LOCALES order unchanged.

## For the Arabic critic (dual pass: arabic-blog-writing + arabic-seo + brand/faithfulness)
1. **All of `src/content/pages/ar/about.md`**: frontmatter title/description/seoTitle/seoDescription plus the whole body.
   Points to check:
   - "لهذا أسميهم Shluchim، أي مبعوثين، وليس «وكلاء» أو «بوتات»": وكلاء is used only in negation, translating "not agents or bots". Keep it or rephrase?
   - The proverb: "«لا تلُمْ حامل الرسالة»… لُمْ مَن أرسله" (I avoided رسول on purpose).
   - Transliterations: حيدر, شليحوت, معسيوت, بَأَشِر هو شام, شلوم بايت, هاف, مسخيت قيدوشين, الربّي, ستيماتسكي, هناسيخ هكاتان.
   - Heading "لا تكن ثقيل الظل" for "Don't be a stinker".
   - Credits: added a "النص العربي: Readex Pro" line.
   - Seffy's name spelled سيفي فيشر (still an open question in STANDING).
2. I added no other new visible Arabic UI strings. The removed stub needs no review.

## Tests
- `npm test`: pass
- `npm run seo:check`: pass (92 pages). The 6 length suggestions are on existing HE/EN posts and were already there.
- `npm run build`: pass. `/ar/about/index.html` is built with `robots=noindex`. No `/ar/` URLs in sitemap-0.xml or llms.txt. No `rel=alternate hreflang=ar` on `/about/` or `/en/about/`.

## Explicit
- noindex is still on (`AR_LAUNCHED = false`, unchanged). No Arabic posts. No merge done. Nobody messaged.
