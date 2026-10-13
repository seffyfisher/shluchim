# Lighthouse delivery and analytics

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

## Cloudflare changes still required

The origin is **GitHub Pages**. A `_headers` file or HTML meta tag cannot change its HTTP cache headers. The supplied report shows Cloudflare returning only a 4-hour browser TTL. Apply these changes in the existing Cloudflare zone; they are not applied by this repository.

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
