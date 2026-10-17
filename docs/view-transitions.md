# Native page transitions

Implemented October 17, 2026, following the browser-native cross-document option
in [Astro's guide](https://docs.astro.build/en/guides/view-transitions/).

The shared layout imports `src/styles/view-transitions.css`. Supporting browsers
animate same-origin document navigation: content fades in over 220 ms with an
8 px upward movement, and the shared header transitions between its layouts.
The browser keeps normal document loading, link behavior, history, focus and
page-script initialization. No client router, dependency or production
JavaScript was added. This does not persist audio playback between documents.
The content group does not interpolate its geometry: moving from a long,
scrolled article to a shorter page cannot stretch or slide the content bounds.

Reduced-motion users opt out of transitions entirely. Browsers without native
cross-document transition support retain normal navigation. Hebrew and English
use the same vertical movement, with light and dark themes inherited normally.

## Verification

After `npm ci`, `npm test`, `npm run seo:check`, and `npm run build` passed:

- `CHROME_PATH=/usr/bin/chromium npm run test:story-loading` passed.
- `python3 scripts/test-analytics.py` passed.
- `node scripts/test-view-transitions.mjs` passed in Chromium 154: Hebrew desktop
  keyboard navigation, English mobile touch navigation, actual native transition
  animations on story/About/Back/Forward navigation, theme persistence,
  reduced-motion opt-out and navigation with JavaScript disabled.
- `CHROME_PATH=/usr/bin/chromium npm run perf:check` passed unchanged. Lighthouse
  13.4.1 mobile: all three runs on all five routes scored 100 Performance
  (Hebrew home, English home, representative post, podcast, podcast post).

To also record the navigation checks:

```sh
VIDEO_DIR=/workspace/artifacts/view-transitions node scripts/test-view-transitions.mjs
```

## Analytics coverage

Questions: which story a reader chooses and whether the destination loads.
Existing `select_content` with `action=navigate` measures the selection attempt;
`item_id` and `link_url` contain the destination URL without query parameters,
with `site_language`, `placement` and `label` describing the source. The normal
destination page view remains owned by GA4. No transition-specific event is
needed: animation is presentation, not a separate reader action or success.

The browser check inspects the actual existing queue before leaving the source
document and verifies one navigation event, the chosen destination and language
for keyboard and touch activation. Production-only, deferred GA loading is
unchanged. UI checks run with external analytics blocked and still navigate.
Real GA4 ingestion and account-side Enhanced Measurement settings remain
unverified; local queue checks do not establish delivery to Google. The existing
short-visit queued-event limitation documented in `ANALYTICS.md` remains.

Changes are held for video review before any merge or deployment. Local
Lighthouse results do not establish live hosting performance.
