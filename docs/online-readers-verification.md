# Online readers: verification, October 16, 2026

Branch: `codex/online-readers-bloub`, based on `main` at
`b8c324be7780b467e88a1c8db0643890a8ac5150` (PR #43 included).

The shared header is followed by a stable-height crowd band. Supabase Presence
keys represent visible browsers; duplicate tabs share one random localStorage
ID and one character. Every reader is rendered; large crowds wrap and scroll.
128 monochrome shapes/expressions are generated from the pinned MIT Bloub
engine. Existing characters retain their DOM nodes. Only a joining character
plays a finite 1.6-second CSS greeting, with no animation under reduced motion.
No Vue, animation engine, database migration or new Edge Function is needed.

JavaScript is necessary because this is a static site receiving live Presence
state. A build hook replaces only the generated readers entry tag with a small
inline loader (893 raw bytes, 433 gzip bytes in this build). It fails the build
if Astro changes that tag. The complete module, Vite helper and Realtime library
wait until after `load`, five seconds, and browser idle. The sprite is fetched
only when actual presence is rendered. No third-party endpoint is blocked or
analytics disabled in the release guard, and there are no audit-specific paths.

The initially deferred SDK alone still introduced an eager entry/helper fetch
and gave the representative post 99. Deferring the entire entry restored 100.

## Checks

`npm ci`, `npm test`, `npm run seo:check`, `npm run build`,
`npm run test:story-loading` and the unchanged `npm run perf:check` passed. The additional 17 focused tests cover the loader,
unique-browser counting, old acknowledgements after disconnect, lifecycle,
SVG reconciliation and 200-reader crowds. `npm run readers:avatars` generated
the committed sprite using the original Bloub geometry. The publishable key
is public by design; secret/service-role keys are rejected by the build.

Lighthouse 13.4.1 mobile defaults, Chromium 154.0.8037.57, Node 24.19.0 on the
Linux workspace. Three runs per route, with real production feature flags and
analytics enabled. The initial baseline at main `4530638` also passed every route at 100.
The branch was subsequently rebased on `b8c324b`, retaining PR #43 and its
image-loading regression checks.

| Route | Runs | Median |
| --- | --- | --- |
| `/` | 100, 100, 100 | 100 |
| `/en/` | 100, 100, 100 | 100 |
| `/posts/2026-10-06-reminders-shaliach/` | 100, 100, 100 | 100 |
| `/podcast/` | 100, 100, 100 | 100 |
| `/posts/2026-10-13-wake-up-sky/` | 100, 100, 100 | 100 |

The controlled browser check used the real Realtime JS SDK against a local
Phoenix/Presence protocol fixture. It verified no readers entry, helper, SDK,
sprite or WebSocket before the deferred boundary; two connections sharing a
browser key produced one avatar; another key produced another avatar; and
hiding/re-showing the tab removed/restored its connection. 200 keys produced
200 SVGs, kept within the same 132px band. Light/dark and reduced motion worked,
with no console page errors, horizontal overflow or late layout shifts.

With CPU throttled 4x, the SDK request began 5,066ms after `load`. Four later
long tasks measured 88ms, 52ms, 56ms and 61ms during the synthetic 200-reader
check, scrolling and artwork loading on the combined PR #43 page. These
measurements include the whole page; they do not isolate Presence CPU time.
There were no late layout shifts. These are controlled local measurements,
not a guarantee of zero CPU cost, identical devices or live server latency.

## Still required before merge

The workspace proxy rejects access to
`tyzswuffvhxnmtaoaskz.supabase.co` (CONNECT 403); the connected Supabase account
also does not have access to this project. The public key supplied by the user
is configured, but its association with this project and the public-channel
setting have not been verified remotely. Allow this hostname in the workspace
network policy, then verify two actual browser contexts joining/leaving the
real project. This must remain a draft until that check succeeds. No changes
were deployed or merged into main.
