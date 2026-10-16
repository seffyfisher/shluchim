# Lighthouse delivery and analytics

## Deferred interaction analytics (October 16, 2026)

The existing GA4 loader now installs passive delegated interaction listeners at
the same delayed idle point as the library download, after load plus five
seconds. All added actions use `select_content` with dynamic parameters; the
tracking plan and GA4 Enhanced Measurement assumptions are in [ANALYTICS.md](ANALYTICS.md).
No new production dependency, navigation wait, scroll listener or DOM scan was
added. Clipboard and feedback components publish outcome-only DOM events after
their UI work. JavaScript is necessary to observe these interactions.

`npm ci`, `npm test`, `npm run seo:check`, `npm run build`, the Chromium browser
checks in `scripts/test-analytics.py`, and the unchanged `npm run perf:check`
passed locally with Node 24.19.0, Chromium 154 and Lighthouse 13.4.1. The browser
test stubs external requests; the separate performance guard does not. All 15
mobile production-build audits scored 100, with TBT 0 ms and CLS 0:

| Route | Performance (three runs) |
| --- | --- |
| `/` | 100, 100, 100 |
| `/en/` | 100, 100, 100 |
| `/posts/2026-10-06-reminders-shaliach/` | 100, 100, 100 |
| `/podcast/` | 100, 100, 100 |
| `/posts/2026-10-13-wake-up-sky/` | 100, 100, 100 |

Changed runtime files: `src/lib/analytics.ts`,
`src/lib/analytics-interactions.mjs`, `IdeaBlock.astro`, `FollowBlock.astro`,
`FeedbackBlock.astro`, `SpotifyPlayer.astro`, and `src/pages/podcast.astro`.
These are local measurements in the cloud workspace's restricted network.
GA4 remains enabled in the audited HTML; its third-party library does not
appear in the first homepage audit's recorded network window. Deferred
third-party execution and real ingestion are not established by this score.
The connected Analytics plugin requires OAuth configuration; account-side
settings remain unverified. No deployment or live audit was performed.


## Editorial homepage: bounded illustration loading (October 16, 2026)

The new featured card uses the guide's actual illustration, and desktop feed
rows use the first real local image from each article. WebP derivatives are
built at quality 90, without upscaling or cropping. Current main's independent
article/illustration update (4530638) is included unchanged.

Native `loading="lazy"` still fetched the offscreen featured illustration before
first paint. In controlled English runs on the original base (818ce86), main
scored 100/100/100 (LCP 1.878–1.880s), while the candidate scored 99/99/99
(1.955–1.957s). Removing that request in a disposable diagnostic build restored
100/100/100. The raw Lighthouse dependency graph showed a 150ms extra RTT in
its pessimistic font-completion estimate, weighted to about 75ms extra LCP.
No chronological-feed illustration was requested in that failing mobile trace.

`StoryArtLoading.astro` now enables a small inline enhancement only on the two
homepages. Reserved image frames reveal their original images within 200px of
the viewport; keyboard focus and printing also reveal them. Original `src`,
`srcset`, sizes and alt text stay in HTML. Without JavaScript, or when the
observer is unavailable/fails, ordinary native image loading remains in place.
The reserved frames keep the approved image geometry and full composition.

This is the narrow exception to the CSS-first rule: CSS cannot configure the
browser's native lazy-loading distance. The [browser loading documentation](https://web.dev/articles/browser-level-image-lazy-loading/)
explains that limitation and that hidden native-lazy images are not requested.
No external image library, analytics, fonts, hosting or credentials changed.

`npm run test:story-loading` drives real Chromium requests. It failed before the
fix when a far-below-fold illustration loaded during initial rendering. It now
passes for HE/EN mobile and desktop, loading before an image reaches the
viewport, stable geometry, article links, and no-JavaScript/unavailable/failed
observer fallbacks. CI runs it after build and before the existing Lighthouse
gate, so the loading contract and the score are checked independently.

Fresh install, 67 Node tests, 15 Python tests, controlled builds, strict SEO,
production build and the loading regression passed on current main plus this
feature. The unchanged Lighthouse 13.4.1 mobile gate passed all 15 final runs
with Node 24.4.0 and Chrome 155.0.8059.40 on this Mac:

| Route | Performance (three runs) |
| --- | --- |
| `/` | 100, 100, 100 |
| `/en/` | 100, 100, 100 |
| `/posts/2026-10-06-reminders-shaliach/` | 100, 100, 100 |
| `/podcast/` | 100, 100, 100 |
| `/posts/2026-10-13-wake-up-sky/` | 100, 100, 100 |

No threshold, route, audit, request filter, analytics or throttling was changed.
These are local candidate results; deployment and live delivery are verified
separately. The paused office article and all article/font/image source bytes
remain unchanged relative to current main.

## Polin running text: local verification (October 15, 2026)

Running text now uses the supplied Polin Regular (400) and Extrabold (800),
converted locally from OTF to WOFF2 with FontTools 4.67.0. The files are 38,056
and 39,888 bytes. Each retains all 805 glyphs, 729 mapped codepoints, original
names, embedding flags (`OS/2.fsType = 0x0008`) and shaping tables. Round-trip
comparison found identical table bytes except the head checksum and WOFF2 flag.
All Hebrew characters used by the current blog are covered; U+05BD (meteg),
which the current content does not use, is absent from both supplied fonts.
The actual faces are Regular and Extrabold; CSS declares their true weights,
and browser inspection confirms that bold requests select Polin-Extrabold.

The font metadata credits Ben Nathan and Mateusz Machalski. The
[official Polin page](https://hafontia.com/family/polin/) identifies the Hebrew
design as Ben Nathan's and the Latin as Mateusz Machalski's. Footer and About
credits now identify Polin; the other font and technology credits are preserved.
Noa Shalev, Young Serif, heading styles and their system fallbacks are unchanged.
Both active body-font URLs are hashed and match their preloads. The feedback
toast uses a public alias of Polin Extrabold. The existing Leon Bold public alias
is retained for previously cached feedback HTML.

Plain Arial caused up to 0.2574 CLS with Polin delayed by 1.5 seconds. Local
Arial fallback faces now match Polin's Hebrew and Latin widths separately for
400 and 800, with CSS metric overrides. Chromium 155.0.8059.40 on this Mac
measured a maximum 0.0031 CLS across the five release routes at 320px, 412px
and 1280px with the same font delay. Those measurements are specific to this
Mac's Arial; device-specific fallback review remains separate.

Hebrew and English homepages were checked at 390px and 1440px, in light and
dark themes, plus 390px without JavaScript. There was no horizontal overflow.
Chrome's platform-font inspection confirmed Polin Regular/Extrabold for pointed
Hebrew and Latin text, and the existing display fonts for the headings.

`npm ci`, `npm test` (63 Node tests, 15 Python tests and the controlled builds),
`npm run seo:check`, `npm run build` and the unchanged `npm run perf:check` passed
locally with Node 24.4.0 and Lighthouse 13.4.1. All 74 pages using the shared
footer contain one localized Polin credit and only the new active body-font URLs.
All 15 Lighthouse runs scored 100, with CLS 0:

| Route | Performance (three runs) |
| --- | --- |
| `/` | 100, 100, 100 |
| `/en/` | 100, 100, 100 |
| `/posts/2026-10-06-reminders-shaliach/` | 100, 100, 100 |
| `/podcast/` | 100, 100, 100 |
| `/posts/2026-10-13-wake-up-sky/` | 100, 100, 100 |

These are local production-build measurements. No publication or live audit was
performed for this change; the existing live cache warning remains separate.

## Font-loading fallback correction (October 15, 2026)

The [first live font audit](https://github.com/seffyfisher/shluchim/actions/runs/38801304141)
confirmed both WOFF2 files returned HTTP 200, but the reminders article shifted
by 0.179 CLS when Leon replaced the system fallback. Delaying the fonts by 1.5
seconds reproduced the same shift at 412px with DejaVu Sans. Arial reduced that
case to 0.0011 CLS and kept the article's vertical position unchanged; it is now
the explicit fallback for running text and the feedback toast. Leon and all
heading fonts remain unchanged. Delayed loading was also checked on the other
four release routes at 320px, 412px and 1280px.

Changed files: `src/styles/global.css`, `public/feedback-toast.html` and this
note. The first live audit also retained the existing 14,400-second asset cache
TTL failure; the font fallback correction does not alter hosting settings.

## Leon Product font verification (October 15, 2026)

Running text uses the supplied Leon Product Regular and Bold, losslessly converted
from OTF to WOFF2 (21,472 and 21,128 bytes). Both weights use hashed asset URLs
and matching preloads. Heading families, weights, sizes and line heights remain
unchanged, checked in Chromium across all 75 non-admin HTML pages. The standalone
feedback toast uses a public alias of the same Bold font.

`npm ci`, `npm test`, `npm run seo:check`, `npm run build` and `npm run perf:check`
passed in the Linux cloud workspace with Node 24.19.0, Chromium 154 and Lighthouse
13.4.1 mobile defaults against the local production preview. Each route scored
100 in all three runs, with cumulative layout shift below 0.005:

| Route | Performance (three runs) |
| --- | --- |
| `/` | 100, 100, 100 |
| `/en/` | 100, 100, 100 |
| `/posts/2026-10-06-reminders-shaliach/` | 100, 100, 100 |
| `/podcast/` | 100, 100, 100 |
| `/posts/2026-10-13-wake-up-sky/` | 100, 100, 100 |

Changed files: `src/fonts/Leon-ProductRegular.woff2`,
`src/fonts/Leon-ProductBold.woff2`, `src/styles/global.css`,
`src/styles/feedback.css`, `src/layouts/Base.astro`,
`src/components/FriendsPage.astro`, `public/feedback-toast.html`,
`astro.config.mjs`, `README.md` and this verification note. These are local
measurements; a live audit follows deployment under the existing release guard.

## Release guard (October 13, 2026)

The uploaded October 13 mobile Lighthouse 13.4.1 report scored **96 / 100 / 100 / 100**. FCP and LCP were 1.8 s; Total Blocking Time was 197 ms. The two long tasks attributed to `gtag.js` (192 ms and 105 ms) account for the blocking time after first paint. The report also shows Cloudflare RUM injected into the page and a four-hour browser TTL on hashed `/_astro/` assets. The previous score of 100 is a measurement, not a guarantee for later runs.

`npm run perf:check` audits the production build on a local preview. Run `npm run build` first. The guard checks the Hebrew and English homepages and a Hebrew post three times each using Lighthouse 13.4.1 mobile defaults and fails if any page's median is below 100 Performance. It saves JSON reports in `lighthouse-reports/`. The GitHub Pages workflow runs it before deploying and audits the live URL after deploying; reports are uploaded as workflow artifacts. For a manual production run, set `PERF_BASE_URL=https://shluchim.shinlamed.com/`. The live mode also fails if Cloudflare RUM is injected or hashed assets lack a one-year browser TTL. The local result cannot prove a live 100 because GitHub Pages, Cloudflare, GA4, and network timing differ.

The uploaded October 12, 2026 mobile Lighthouse 13.4.1 report scored Performance / Accessibility / Best Practices / SEO at **100 / 100 / 77 / 100**. A category score of 100 does not require every diagnostic to disappear.

## Repository changes

- GA4 keeps first-party page and audience measurement, with `allow_google_signals: false` and `allow_ad_personalization_signals: false`. This removes advertising and demographic/interest features. [Google configuration reference](https://developers.google.com/analytics/devguides/collection/ga4/reference/config).
- Its library waits for `window.load`, then a five-second settling period and `requestIdleCallback`, without a forced idle timeout. Browsers without that API wait another 3 seconds. The script is async and has low fetch priority. It is initialized once; custom events stay queued.
- This prioritizes page loading, but Google's library still needs bandwidth and main-thread execution after download. Short visits and persistently busy pages can go uncounted. Deferring cannot promise zero interaction cost or remove Google's unused code.
- Hebrew and English display fonts are preloaded, and fonts and team avatars use Vite's content-hashed `/_astro/` URLs. The same font URL appears in CSS and its preload, avoiding a duplicate fetch.
- Avatars live in `src/assets/shluchim/`; the shared `Avatar.astro` renders them with no client JS. Reduced-motion users still receive a still image. The build also emits the former `/shluchim/*.webp` and display-font URLs from these same source files so cached older HTML keeps working.
- The homepage link's accessible name now includes the exact visible Hebrew title, including niqqud.

## Recurring delivery failure (October 16, 2026)

Production run [38879483519](https://github.com/seffyfisher/shluchim/actions/runs/38879483519)
deployed successfully, then measured a median 98 Performance on each of the five
release routes. Before the hosting correction, the hashed font response had `max-age=14400`,
and the browser's network report contained Cloudflare RUM. These are hosting settings;
the local build's fifteen scores of 100 do not verify them.

The former delivery check missed RUM because a default Node fetch requests
`Accept: */*`: Cloudflare does not inject the beacon into that representation.
Requesting `Accept: text/html` reproduces the browser's injection. The delivery
check now negotiates HTML, with a regression fixture that injects RUM only for
HTML requests. Run it independently with `npm run perf:delivery` (override
`PERF_BASE_URL` to inspect another deployment).

The deployment workflow also checks the current production hosting before
uploading a new version. A missing cache rule or renewed RUM injection therefore
blocks the next deployment. The full local and post-deployment Lighthouse audits
retain the same five routes, three runs, mobile defaults and 100 threshold.
The Cloudflare rules below were applied separately in the existing zone on
October 16. The repository guard detects configuration drift; it does not apply
hosting settings or guarantee a live score of 100. The first live Mac audit after
the hosting fix measured medians 100/100/99/100/100: the reminders page retained
variable text-render timing (LCP 1.3–1.7 s). The delivery check passed. These
measurements are retained separately from the final deployment audit.

The latest shared-module build also extracted Vite's import helper into the
initial article gesture entry. The reminders route measured a local median 99
(100/99/99, LCP 1.9–2.0 s), and the new Chromium regression failed because
`PostPage.*.js` downloaded before an image was opened. `deferredPostImages` now
replaces that entry tag with an inline native-popover listener. Only an actual
image opening downloads the existing entry, helper and gesture module; the
entry also initializes an already-open first image. This applies to every
visitor. HTML/CSS still provide opening and closing without JavaScript. The
small listener is necessary because CSS cannot load a module on `beforetoggle`;
no gesture feature or analytics behavior was added.

The browser regression now checks zero initial gesture-module requests, zoom
on the first opening, Escape closing, and native enlargement without JavaScript.
All existing homepage request, geometry and fallback checks remain active.

## Rejected font-priority experiment (October 16, 2026)

PR 53 tried lowering only the Extrabold preload's priority. All 15 local runs
scored 100, but [production run 38927849241](https://github.com/seffyfisher/shluchim/actions/runs/38927849241)
measured medians 99/98/93/99/100. Two reminders audits shifted by 0.157–0.158 CLS
while the bold face arrived late. This is a real regression despite unchanged
font bytes and styles, so the priority hint is reverted. All three original
font preloads retain their default priority. Hosting checks remain green, and
the reader startup and analytics behavior remain unchanged.

## Smaller reading fonts (October 16, 2026)

The two full Polin faces transfer 77,944 bytes. The common-character copies
transfer 41,832 bytes (46% less): Regular 20,972 and Extrabold 20,860. Both retain
normal preload priority. No font size, weight, fallback metric or startup delay
changes. The original full files remain unchanged.

`src/fonts/polin-core.css` assigns disjoint Unicode ranges to the common copies
and full originals, for each weight. All 729 original codepoints remain covered.
The common copy keeps complete basic Latin, Hebrew/niqqud, Hebrew presentation,
punctuation and currency ranges supported by the original, plus characters in
current source content. Rare text downloads the original face on demand through
CSS; no browser JavaScript is added.

To regenerate, install `fonttools[woff]==4.67.0` and `brotli==1.2.0` in a temporary
Python environment, then run `python scripts/generate-polin-core.py`. The
generator preserves all layout features, hinting and global bounding boxes, compares outlines and
horizontal/vertical metrics, checks name/license metadata, and records byte
hashes and coverage in `src/fonts/polin-core.json`. Never replace the original
faces with a subset or remove the full fallback.

After a build, `npm run test:fonts` checks the validated hashes, initial font
requests, exact Chromium glyph pixels at 18/32px for both weights and all core characters,
real text geometry at 412/1440px across all five audited routes, and actual
rare-character fallback requests before reference fonts are loaded. The unchanged
Lighthouse guard runs separately, with real third parties enabled.

The initial subset prototype recalculated its global bounds. The 18px raster
comparison caught a Hebrew rendering difference that the 32px comparison missed.
Retaining the original `head` and CFF bounding boxes resolves it; both sizes now
match the original pixels. This check stays in CI.

The [rollback's production run](https://github.com/seffyfisher/shluchim/actions/runs/38931917864)
removed the large layout shifts but still measured medians 100/99/99/99/99,
with reading-text LCP around 2.0–2.1s on the failing pages. Hosting checks passed.
This separates the rejected priority change from the remaining download cost;
the smaller-font candidate must pass the same live gate after deployment.

References: [fontTools subsetting and retained layout/hinting](https://fonttools.readthedocs.io/en/latest/subset/index.html),
[CSS unicode-range](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/At-rules/@font-face/unicode-range).

## Cloudflare configuration (applied October 16, 2026)

The origin is **GitHub Pages**. A `_headers` file or HTML meta tag cannot change its HTTP cache headers. The recurring failure came from a missing cache rule: the existing zone had no Cache Rules. Both rules below are now active, scoped only to `shluchim.shinlamed.com`. Live requests negotiated as HTML no longer contain RUM, and the previously failing hashed font returns `max-age=31536000`. HTML retains `max-age=600`. The repository does not control these external settings; keep these rules when changing hosting configuration.

1. **Cache Rule** matching:

   ```text
   (http.host eq "shluchim.shinlamed.com" and starts_with(http.request.uri.path, "/_astro/"))
   ```

   Set Browser TTL to **Override origin: 1 year (31536000 seconds)**. These filenames change when the content changes, so long browser caching is safe. Keep HTML, RSS, sitemaps, the manifest and unversioned public URLs outside this rule. Check that a later rule does not override it. [Cloudflare Cache Rules settings](https://developers.cloudflare.com/cache/how-to/cache-rules/settings/).

2. **Configuration Rule** matching:

   ```text
   (http.host eq "shluchim.shinlamed.com")
   ```

   Enable **Disable Real User Monitoring (RUM)** (`disable_rum: true`). This stops Cloudflare from injecting its legacy beacon on this hostname, removing that beacon's legacy JS, short cache lifetime and `/cdn-cgi/rum` dependency. It sacrifices Cloudflare's browser-side Web Analytics for this hostname; GA4 and Cloudflare's request/security analytics remain. This is a hosting choice, not something a delayed GA loader can fix. [Cloudflare Configuration Rules settings](https://developers.cloudflare.com/rules/configuration-rules/settings/).

## Deliberately retained findings

The user chose to retain both GA4 and the animated homepage avatar:

- `unused-javascript`: Google's library contains code unused on this page. Loading it later does not shrink it, and this audit can remain whenever the library is included in a run.
- `image-delivery-insight`: Basher's 20,800-byte WebP contains six frames. Re-encoding those frames did not materially improve its size without sacrificing quality; the original bytes and animation are preserved. Lighthouse's roughly 18 KiB estimate treats it like a static image. A still image was offered and declined.
- The manifest can still appear in the dependency-tree visualization. It supports installation and is not a render-blocking script; the display-font and Cloudflare-beacon chains are the actionable parts of the supplied finding. Timing metrics and diagnostics are not guarantees that every resource or millisecond can be removed.

## Verification

Run `npm test` and `npm run seo:check` before publication. Recheck Hebrew and English pages, both themes and reduced-motion mode. Confirm legacy asset URLs still return the original bytes.

After deployment and Cloudflare configuration, inspect the actual `/_astro/` response headers for `max-age=31536000` and the served HTML/network panel for the absence of `static.cloudflareinsights.com`. In a normal browser with existing Google cookies, verify GA4 page views arrive while advertising requests/cookie warnings do not. An Incognito-only test is insufficient to reproduce the original report's Google-cookie case.

For a production audit with the same Lighthouse version:

```sh
npx --yes lighthouse@13.4.1 https://shluchim.shinlamed.com/ --only-categories=performance,accessibility,best-practices,seo --output=html --output=json --output-path=/tmp/shluchim-lighthouse
```

Repeat for `/en/` and a representative post. Keep real analytics enabled and record the test settings. Do not hide findings with audit-specific timing, blocked URLs, user-agent checks or skipped audits. Performance varies with CPU, network, server and browser state; report the measured scores and any verification limits.
