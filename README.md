# סיפורי הצלחה

Static Hebrew (RTL) blog built with Astro 7. Zero client JS, self-hosted Rubik (Hebrew + Latin subsets, 400/700).

```bash
npm ci
npm run dev             # http://localhost:4321/stories/
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

## Deploy target (one spot)
`astro.config.mjs` reads `SITE_URL` and `BASE_PATH` (defaults: `https://seffyfisher.github.io` + `/stories`).
In CI they can be overridden by repo variables `SITE_URL` / `BASE_PATH`.

- **Rename the repo** (e.g. to `wins`): change the `BASE_PATH` default to `/wins` (or set the repo variable).
- **Custom domain later** (e.g. via Cloudflare): add a DNS `CNAME` record `stories.example.com → seffyfisher.github.io` (DNS only / grey cloud, or proxied with SSL "Full"), add `public/CNAME` containing `stories.example.com`, set `SITE_URL=https://stories.example.com` and `BASE_PATH=/`, then set the custom domain in repo Settings → Pages.

GitHub Pages setup: Settings → Pages → Source: **GitHub Actions**. Pushing to `main` runs `.github/workflows/deploy.yml`.
