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

## Editing a post
Each post page has a subtle "עריכה" link to `https://github.com/<REPO>/edit/main/src/content/posts/<file>.md` (`REPO` in `src/config.ts`). Committing to `main` in the GitHub web editor auto-deploys. Or ask the agent; agent edits still need Seffy's explicit approval before pushing.

## Deploy target (one spot)
The site lives at **https://shluchim.shinlamed.com/**, served at the root of its own domain.
The defaults are in `src/lib/site-env.mjs` (`SITE_URL=https://shluchim.shinlamed.com`, `BASE_PATH=/`). `astro.config.mjs`, the remark plugins, the list guard and `scripts/indexnow.mjs` all read that one file. In CI the repo variables `SITE_URL` / `BASE_PATH` override it, and an empty variable falls back to the defaults. If the variables exist with old values (for example `BASE_PATH=/shluchim`), delete them or update them, otherwise every link on the site breaks.

- Setup: DNS `CNAME` record `shluchim` → `seffyfisher.github.io`, `public/CNAME` containing `shluchim.shinlamed.com` (GitHub ignores it for Actions deploys, it documents the intent), and Settings → Pages → Custom domain with **Enforce HTTPS** on.
- Never hard-code the base path. Page links use `url()` / `lurl()`, post images are written as `/images/...` (the remark plugin adds the base), fonts in CSS as `/fonts/...` (Vite adds the base), the web manifest uses relative URLs. `npm run seo:check` fails on any broken internal link or asset.
- Serving from a sub-path again (for example `https://seffyfisher.github.io/shluchim/`) only needs `SITE_URL=https://seffyfisher.github.io` and `BASE_PATH=/shluchim`.
- The feedback form's Supabase function only accepts a `return_to` on the allowed prefixes (`supabase/functions/feedback/handler.ts`). Changing the domain means changing that list and redeploying the function.

GitHub Pages setup: Settings → Pages → Source: **GitHub Actions**. Pushing to `main` runs `.github/workflows/deploy.yml`.

- Reader-facing text says שלוחים/שלוח, never סוכנים/בוטים, except product names (e.g. Grok Bot).
- SEO / AI discoverability: [SEO-GEO.md](SEO-GEO.md). `npm run seo:check` (strict) and `npm test` must pass before commits that touch content or templates.
- CSS first: anything doable in CSS alone is done in CSS, with no added JavaScript; JS only when truly unavoidable, with the reason in the PR or commit. See AGENTS.md.
