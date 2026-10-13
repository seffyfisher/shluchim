---
name: lighthouse-release-guard
description: Check Lighthouse performance before and after every Shluchim site release, and investigate any score below 100 before publishing another version.
---

# Shluchim Lighthouse release guard

Use this skill whenever preparing a PR, merging, pushing to `main`, deploying, or changing assets, templates, analytics, hosting, or Cloudflare settings for the site.

1. Run `npm ci`, `npm test`, `npm run seo:check`, and `npm run build`.
2. Run `npm run perf:check`. This starts a local preview of the production build and audits the Hebrew homepage, English homepage, and a representative Hebrew post three times each with Lighthouse 13.4.1 mobile defaults. The median for each page must score **100 Performance**; three runs limit noise from a single measurement. Inspect `lighthouse-reports/*.json` when one fails, fix the cause, and rerun. Do not lower the threshold, skip a route or audit, block a third-party request, disable analytics for the test, or change throttling to make a score pass.
3. The `Deploy to GitHub Pages` workflow runs the same guard for every PR and every push to `main`. Its build job must pass before GitHub Pages can deploy. Do not bypass a red check. After deployment, its `production-performance` job audits the live site and uploads reports. A live failure requires investigation before the next release.
4. For a manual live check, run `PERF_BASE_URL=https://shluchim.shinlamed.com/ npm run perf:check` and review the reports. Check the real `/_astro/` cache header and Cloudflare RUM injection using the steps in `PERFORMANCE.md`. Local preview cannot prove Cloudflare settings or third-party timing on the live domain.
5. Record the measured scores, Lighthouse version, date, environment, and changed files in the release note or PR. Lighthouse results vary with the browser, device, network, and third parties; a previous 100 is not a permanent guarantee. Keep the guard active and investigate any regression.
