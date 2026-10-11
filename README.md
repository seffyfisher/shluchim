# סיפורי הצלחה

Static Hebrew (RTL) blog built with Astro 7. Zero client JS, self-hosted Rubik (Hebrew + Latin subsets, 400/700).

```bash
npm ci
npm run dev             # http://localhost:4321/
npm run build           # → dist/ (drafts excluded)
npm run preview         # serve dist/
npm run build:drafts    # → dist-drafts/ with drafts + "טיוטה" badge (local preview only)
npm run preview:drafts  # serve dist-drafts/
```
Requires Node ≥ 22.12 (on the box: `export PATH=~/.local/node22/bin:$PATH`).

- Posts: `src/content/posts/*.md` (frontmatter: `title`, `description`, `date`, `draft` (default `true`), optional `tags`, `cover`, `coverAlt`). Schema in `src/content.config.ts`.
- Blog title / tagline: `src/config.ts`.
- Internal links: always via `url()` from `src/lib/posts.ts` (respects the base path).
- How to add a post: see [PUBLISHING.md](PUBLISHING.md).
- **Follow with your AI:** a block on the home page, at the end of every story and in the footer lets a reader copy one standing prompt (or open it prefilled in ChatGPT / Claude). The prompt tells their assistant to read the RSS feed now, remember it, and check it once a week for new posts. The wording lives in `src/lib/follow.ts` (one Hebrew and one English text, each pointing at its own feed), the labels in `src/i18n/ui.ts` (`follow*`), the markup in `src/components/FollowBlock.astro`, the styles in `src/styles/follow.css`. `npm test` checks the vocabulary rules and that the deep links round-trip the prompt.
  - CSS-first exception, on purpose: the **copy button** is the only JavaScript in the feature (about 15 lines, inlined). Clipboard access has no HTML or CSS equivalent. Everything else (the readable prompt in a `<details>`, the ChatGPT and Claude links, the layout) works with JavaScript off, and the button stays `hidden` until the script runs, so there is never a dead button.
  - The `?q=` prefill links (`chatgpt.com/?q=`, `claude.ai/new?q=`) are not officially documented by either vendor, only reported by third parties, and have changed behaviour before. If one stops prefilling, the link still opens the assistant and the copy button still works. Keep the Hebrew link under about 4 KB (the test enforces 5,000 characters).

## Editing a post
Each post page has a subtle "עריכה" link to `https://github.com/<REPO>/edit/main/src/content/posts/<file>.md` (`REPO` in `src/config.ts`). Committing to `main` in the GitHub web editor auto-deploys. Or ask the agent; agent edits still need Seffy's explicit approval before pushing.

## Deploy target
Live at **https://shluchim.shinlamed.com** (custom domain on GitHub Pages, served at the root).
The defaults are in `src/lib/site-env.mjs` (`SITE_URL=https://shluchim.shinlamed.com`, `BASE_PATH=/`). `astro.config.mjs`, the remark plugins, the list guard and `scripts/indexnow.mjs` all read that one file. In CI the repo variables `SITE_URL` / `BASE_PATH` can override it, and an empty variable falls back to the defaults. Leave them unset: a stale value there silently beats the defaults (for example `BASE_PATH=/shluchim` breaks every link).

- **DNS:** a `CNAME` record `shluchim` → `seffyfisher.github.io` on `shinlamed.com`. The custom domain is set in repo Settings → Pages, with **Enforce HTTPS** on (that setting is what counts with the Actions deploy; `public/CNAME` is kept for completeness).
- **No hard-coded base path.** Page links use `url()` / `lurl()`, post images are written as `/images/...` (the remark plugin adds the base), fonts in CSS as `/fonts/...` (Vite adds the base), the web manifest uses relative URLs. `npm run seo:check` fails on any broken internal link or asset, so serving from a sub-path again (for example `SITE_URL=https://seffyfisher.github.io BASE_PATH=/shluchim`) works without touching content.
- **Feedback form:** `ALLOWED_PREFIX` in `supabase/functions/feedback/handler.ts` must match `SITE_URL`. After changing the domain, redeploy the function (`supabase functions deploy feedback --no-verify-jwt`). Until then `return_to` falls back to the site root.
- The old `https://seffyfisher.github.io/shluchim/` redirects to the custom domain.


GitHub Pages setup: Settings → Pages → Source: **GitHub Actions**. Pushing to `main` runs `.github/workflows/deploy.yml`.

- Reader-facing text says שלוחים/שלוח, never סוכנים/בוטים, except product names (e.g. Grok Bot).
- SEO / AI discoverability: [SEO-GEO.md](SEO-GEO.md). `npm run seo:check` (strict) and `npm test` must pass before commits that touch content or templates.
- CSS first: anything doable in CSS alone is done in CSS, with no added JavaScript; JS only when truly unavoidable, with the reason in the PR or commit. See AGENTS.md.
