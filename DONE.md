# SEF-263 Phase A: done (PR not opened yet)

- Branch: `feat/arabic-infra`, pushed. Commit 79689aa, based on main @ 668af74.
- PR: **not created.** The token can't open PRs:
  - `gh pr create` failed with GraphQL "Resource not accessible by personal access token".
  - REST `POST /pulls` returned 403.
  - The GitHub connector returned 422 "must be a collaborator".
- Open it by hand: https://github.com/seffyfisher/shluchim/compare/main...feat/arabic-infra?expand=1. Mark it as a draft. The body is in /tmp/pr-body.md, and a copy is below.

## Summary
SEF-263 Phase A: Arabic as a third locale under `/ar/`. Infra only. No posts are translated, and `/ar/` stays noindex until Phase D.

## What changed
- **i18n for N languages:** `LOCALES = he/en/ar`, `LANG_META.ar` (rtl, `ar_AR`, label `العربية`), `UI.ar`, `otherLangs()`, `langOf` by folder prefix. The `content.config` lang enum and glob now include `ar`.
- **Routes:** `src/pages/ar/` covers home, about, team, friends, topics, posts, `.md` and rss. Topic hubs and post pages render only when Arabic content exists (zero today).
- **Language switch:** a three-language `<details>` dropdown with the locked labels `עברית` · `English` · `العربية`. Each label is in its own script, and the dropdown uses no client JS.
- **Font:** Readex Pro variable (OFL, Arabic subset) for Arabic body, headings and UI. `:lang(ar)` turns off letter-spacing and italic.
- **SEO:** `/ar/` pages carry hreflang he/en/ar, x-default=en, and `og:locale` `ar_AR`. The brand stays Latin `Shluchim` in the logo, URL and OG.
- **Pre-launch gate `AR_LAUNCHED=false`** (`src/lib/site-env.mjs`):
  - `/ar/` is `noindex` with no canonical, and is left out of the sitemap and llms.txt.
  - HE/EN pages keep only their he/en hreflang, so nothing points at a noindex page.
  - The SEO guard enforces this staged rule, and a unit test was added.
- **404:** the dropdown sends each language to its home page.

## HE/EN output
I diffed the built HTML against `main` with inline CSS and hashed asset names ignored. The only change on HE/EN pages is that the old one-link language switch became the three-language dropdown. hreflang and og:locale are unchanged.

## Checks
- `npm test`: 111/111 node tests plus the build fixtures pass
- `npm run seo:check`: SEO guard OK, 92 pages
- `npm run build`: OK

## Preview locally
`npm run build && npm run preview` → http://localhost:4321/ar/

Out of scope: Phase B copy polish, Phase C posts, Phase D launch (flip `AR_LAUNCHED`).
