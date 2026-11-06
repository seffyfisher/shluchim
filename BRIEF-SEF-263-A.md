# SEF-263 Phase A — Arabic infra (do this now)

Workdir: /workspace/shluchim-arabic-infra
Branch: feat/arabic-infra (tracking origin/main @ 668af74)
Repo: seffyfisher/shluchim
Owner: יוסף יצחק · שלוּחִים. Do NOT merge to main. Draft PR only.

## Goal
Add Arabic as third locale under `/ar/`: N-language i18n refactor + 3-language dropdown + Readex Pro + noindex. NO translating 33 posts.

## Must
1. locales: he, en, ar — `/ar/` like `/en/`; Hebrew at root; x-default stays en; hreflang ar; og:locale ar_AR; Latin slug = English slug.
2. Refactor for N langs: `langOf` by folder prefix; `other()` → `otherLangs()`; every `he ? … : …` in ~24 files; content.config enum+glob; `getTranslations`; `UI.ar` + `LANG_META.ar`. Full map: RESEARCH.md §1.
3. Language switch → **dropdown for three languages** (not HE↔EN toggle). Explicit Seffy ask.
4. Font Readex Pro (variable) for ar — body/headings/UI. No letter-spacing, no italic (`:lang(ar)`). Digits 0–9.
5. Brand locked: logo/URL/OG always Latin `Shluchim`. Body: مَبْعُوثِيّ / المبعوثون only as explanation + tech frame. SEO: وكلاء الذكاء الاصطناعي not as brand. Forbidden: رسول, شلوخيم, مرسلون as brand, وكيل as name. See brand-name-research.md + STANDING.md.
6. noindex all `/ar/` until Phase D. Do not publish Arabic post content.
7. Phase A only: infra + dropdown + minimal shell to compile. Minimal/zero ar posts OK (noindex via posts.length===0 is fine).

## Done
- `npm test`, `npm run seo:check`, `npm run build` pass
- `/ar/` builds RTL + Readex + 3-lang dropdown + hreflang ar + noindex
- HE/EN HTML unchanged except ar alternates where needed
- Commit + push `feat/arabic-infra` + open **draft** PR to main with summary (gh as seffyfisher). Do not merge.
- Write DONE.md with: what changed, PR URL, how to preview locally if no Pages preview

## Out of scope
Phase B UI copy polish, Phase C 33 posts, Phase D launch, editing PUBLISHING.md/skills (after A is stable).
