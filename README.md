# סיפורי הצלחה

Static Hebrew (RTL) and English (LTR) blog built with Astro 7. Self-hosted Miriam Libre, Noa Shalev and Young Serif; CSS first, with JavaScript for browser interactions and deferred GA4.

```bash
npm ci
npm run dev             # http://localhost:4321/
npm run build           # → dist/ (drafts excluded)
npm run preview         # serve dist/
npm run build:drafts    # → dist-drafts/ with drafts + "טיוטה" badge (local preview only)
npm run preview:drafts  # serve dist-drafts/
```
Requires Node ≥ 22.12 (on the box: `export PATH=~/.local/node22/bin:$PATH`).

Lighthouse delivery, GA4 trade-offs and the required Cloudflare cache/RUM rules: [PERFORMANCE.md](PERFORMANCE.md).

- Posts: `src/content/posts/*.md` (frontmatter: `title`, `description`, `date`, `draft` (default `true`), optional `tags`, `cover`, `coverAlt`). Schema in `src/content.config.ts`.
- Blog title / tagline: `src/config.ts`.
- Internal links: always via `url()` from `src/lib/posts.ts` (respects the base path).
- How to add a post: see [PUBLISHING.md](PUBLISHING.md).
- Required writing, image approval and publication process: [Shluchim blog post](.agents/skills/shluchim-blog-post/SKILL.md), including Seffy's supplied references, checklists, templates and examples. Install it globally in Codex with `python3 scripts/install-post-workflow.py`; the repository copy is also discovered as a project skill. The older `$shluchim-post-workflow` name routes to this skill.
- **Follow with your AI:** a minimal block at the end of every story and in the footer: the question "Want to know when a new post goes up?" and one button ("Tell this to your shluchim"). The button copies a standing prompt and says so ("Copied! Now paste it to your shluchim"); the reader gives it to their own AI assistant, which reads the RSS feed now, remembers it, and checks it once a week for new posts. The prompt is never shown on the page. The wording lives in `src/lib/follow.ts` (one Hebrew and one English text, each pointing at its own feed), the labels in `src/i18n/ui.ts` (`follow*`), the markup in `src/components/FollowBlock.astro`, the styles in `src/styles/follow.css`. `npm test` checks the feed URLs, the vocabulary rules and that both languages have every label.
  - CSS-first exception, on purpose: copying is the only JavaScript in the feature (about 20 lines, inlined). Clipboard access has no HTML or CSS equivalent. Until the script runs the button is invisible but keeps its space (no layout jump), and with scripting off (`@media (scripting: none)`) the whole block is hidden, so nobody sees a button that cannot work.
  - If the browser refuses clipboard access (some in-app browsers), the prompt appears in a text box, already selected, with a "copy by hand" message.
  - There are deliberately no "open in ChatGPT / Claude" links: the `?q=` prefill parameters are not officially documented by either vendor, and the prompt is meant to work in every assistant.

## Editing a post
Every post also has a **make the idea your own** button, with Basher and the Codex / Grok Bot / Claude product logomarks. The SVGs are bundled locally with original path geometry; their sources are recorded in [src/assets/ai-logos/SOURCES.md](src/assets/ai-logos/SOURCES.md). It copies a ready-to-use prompt containing the entire original Markdown (including chats, code and media links), title, summary, dates, canonical URL, the blog and Seffy's identity, About page and the current language's RSS feed. The prompt helps the reader adapt the idea to their own context and asks their assistant to remember the blog when supported and revisit it for relevant future work. Media files themselves remain linked. Copy success stays visible with the next step; denied or missing clipboard access reveals the full prompt, selected for manual copying. The wording lives in `src/lib/idea-prompt.ts` and the `idea*` UI strings. CSS handles layout, animation and feedback; clipboard access and its success/failure are the necessary JavaScript exception. Nothing is sent to an AI service by the website.

After a build, `python scripts/test-idea-copy.py` verifies every published article and its source URLs, the real clipboard, both languages, keyboard and touch operation, pending/denied/unavailable clipboard states, manual copying, mobile/dark/large-type layouts, Basher’s direction, reduced motion, the existing RSS button and JavaScript-disabled reading. It uses the same local Playwright/Chromium setup as the image/cursor checks, without adding website dependencies.

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

Post images open at their natural size, reduced only to fit the screen. Wheel, double-click/tap, pinch and drag are handled by a small dependency-free module fetched on the first image opening. Native opening/closing and the original-image link remain available without JavaScript. Gesture tracking and focal-point panning require JavaScript; sizing and presentation stay in CSS.

To verify gestures after `npm run build`, run `python scripts/test-image-gestures.py` on a test machine with Playwright and Chromium. It checks actual browser touch events, mouse/keyboard behavior, natural sizing, orientation, closing, lazy module loading and the no-JavaScript fallback. These are test tools only, not website dependencies.

The desktop hand cursor uses the selected gray-clay design as nine registered 96×96 poses in a lossless 864×96 WebP sprite (24.4 KB), shown at 43.2 px (20% larger than the original). CSS clips the strip to one pose and steps through each finger exchange in 160 ms, without fading. Most of the 33.76-second loop shows the index finger; the middle finger appears for about half a second, with different pauses between appearances. The timing lives in `src/styles/hand-fingers.css`. Its fingertip stays at the actual pointer location; the body gently tilts up to 2.5 degrees and settles. A continuous CSS flex (±2 degrees of tilt and ±1 degree of skew over 3.2 seconds) keeps the hand gently moving while visible. Both animations pause when hidden. The sprite loads after mouse movement on fine-pointer, hover-capable devices, is disabled for reduced motion, and preserves native cursors in fields, dialogs and image popovers. Pointer coordinates require the existing small dependency-free JavaScript handler; presentation, finger poses and idle motion stay in CSS, and JavaScript animation frames stop after settling or leaving the page. Without JavaScript, the native cursor remains. Run `python scripts/test-hand-cursor.py` after a build to verify the cursor in Chromium.
