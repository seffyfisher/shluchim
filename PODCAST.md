# Podcast: page, RSS archive and publishing (SEF-139)

`/podcast/` shares the blog's Base layout, RTL, Noa Shalev headings, system body
font, monochrome tokens, navigation, theme control, footer and 46rem column.
The first episode is published in Hebrew, with AI narration disclosed on the
page and in the post component. On October 15, 2026 at 13:54 UTC, the user
approved publication and requested more personality. The studio header reuses
the approved Basher and Kinneret stills, with the existing display font and
static decorative audio marks. They do not represent live playback or audio
levels. No new artwork, cover replacement or paid asset was introduced, and
the header has no animation or additional JavaScript.

## Native episode archive and refresh behavior

The official show embed was verified in the cloud browser to display only the
latest single episode, not an archive. `/podcast/` therefore renders a native,
indexable episode list from `src/data/podcast-feed.json`, newest first. The
existing monochrome row design is reused. The first approved episode retains
its verified Spotify link and can open its own click-to-load episode player.

`npm run podcast:sync` fetches only the official Spreaker RSS, parses published
items, and atomically updates the metadata snapshot. It does not download,
generate, upload, transcribe or syndicate audio. The public RSS is the authority
for which episodes have already been published; this is a read-only listing of
those releases, not authorization to create future audio.

- GUID is the identity. Identical duplicates collapse; conflicting duplicates
  reject the refresh. Titles are never used to deduplicate or associate audio.
- A moving RSS window does not erase older entries: known GUIDs are retained,
  while returned GUIDs can update their metadata. To remove an older withdrawn
  episode, review and remove its GUID from the snapshot after it leaves the feed.
- Fetch errors, timeouts, oversized responses, malformed/empty feeds, missing
  GUIDs, invalid dates or audio URLs, and conflicting duplicates fail the job.
  The last good JSON bytes and the existing deployed page remain intact.
- Writes use a same-directory temporary file, fsync, then atomic replacement.
  Semantically unchanged feeds do not create timestamp-only commits.
- Builds consume the checked-in snapshot and make no live RSS request. The
  reader needs no JavaScript to browse episodes and no cross-origin RSS access.

## Spotify enrichment and exact blog-post associations

RSS GUIDs are **not** Spotify episode IDs. Neither is derived from the other.
`EPISODES` in `src/data/podcast.ts` is a small explicit enrichment map for
independently verified Spotify IDs, AI narration disclosure, and optional blog
links. `episodeForGuid` uses the exact `rssGuid`, never the display title.
Entries without verified Spotify enrichment still appear automatically in the
native archive, with a clearly labeled audio-enclosure link and the exact item-page URL
supplied by RSS. An RSS item link may itself be a blog post; it is not assumed
to be a Spreaker listening page. Only an exact canonical URL present among
published blog posts creates a feed-provided archive post link. They do not
receive a guessed Spotify player or a title-based post association.

For each approved release:

1. Publish audio through the separately approved publishing process. Confirm
   that its item is public in the official RSS; record its exact GUID, title,
   publication date/time, duration, episode number, language, item-page URL and
   enclosure URL/type. Refresh imports these fields without manual page edits.
2. When its Spotify episode URL is independently verified, add an `EPISODES`
   entry with a stable internal key, exact `rssGuid`, `spotifyId`, `spotifyUrl`,
   title, publication date, duration and ISO duration, language and AI narration
   disclosure. A separately verified Spreaker page can be recorded as
   `spreakerUrl`; it is never confused with the RSS item link. Add optional approved description and blog path/title only when
   appropriate. The build validates GUID existence/uniqueness and ID/URL agreement.
3. To put a player in a post, add its exact content collection ID, including
   language, to `POST_EPISODES`. The first is
   `he/2026-10-13-wake-up-sky` → `wake-up-sky-1`. RSS synchronization never edits
   this map. An English association requires its own explicit mapping and
   language-appropriate component labels/disclosure; it is not inherited.
4. Include archive appearance, verified Spotify enrichment and the optional
   post association in the release checklist. Run checks and follow the approved
   build/deployment process. Spotify enrichment and post mappings need a rebuild.

## Verified initial RSS seed

The parent read the official feed in the cloud browser on October 15, 2026.
It contained one published episode. The checked-in snapshot uses these exact
verified values, not a guessed GUID:

- GUID: `https://api.spreaker.com/episode/75804362`.
- Publication: `2026-10-15T10:06:06Z`; episode 1, Hebrew, full, not explicit.
- RSS duration: **315 seconds (5:15)**. Spotify's verified UI metadata is **5:14**.
  The native archive uses RSS duration; the existing Spotify post component
  retains the verified Spotify duration. This one-second source difference is
  not normalized away.
- Item link: `https://shluchim.shinlamed.com/posts/2026-10-13-wake-up-sky/`.
- Audio: `https://api.spreaker.com/download/episode/75804362/eps1_upload.mp3`,
  `audio/mpeg`, reported enclosure length 7,540,235 bytes. No audio bytes were
  copied or stored by this implementation.
- Separately verified Spreaker page:
  `https://www.spreaker.com/episode/wrw-smyym-prq-1--75804362`.
- Spotify episode ID remains `1Ccf2UKMMvEhrCb4mvnKJt`, explicitly associated
  with that exact RSS GUID. AI narration remains explicitly disclosed.

The parent supplied item metadata rather than the full XML/description. The
seed's description is therefore empty; the already approved first-episode copy
lives in the enrichment map. A real successful refresh can fill the RSS
summary. `scripts/fixtures/podcast-first-item.xml` is a labeled, reconstructed
RSS test wrapper containing the verified fields; it is not represented as a
verbatim feed capture.

## Scheduled refresh/build workflow

`.github/workflows/refresh-podcast.yml` is part of the approved release. It runs
hourly at minute 17, runs when its workflow file is installed/changed on `main`,
and supports a manual run on `main`. GitHub scheduling and
build delays mean new releases appear after the next successful refresh and
deployment, not at a guaranteed publication-time deadline.

The workflow uses the repository's existing `GITHUB_TOKEN`, with only
`contents: write` to persist validated metadata and `actions: write` to request
the guarded deployment. It needs no new credential or repository variable.
Branch protection is respected; a rejected snapshot push fails rather than
forcing or bypassing a rule.

Release verification must include a manual real-feed refresh after the workflow
is on `main`, its resulting commit when metadata changes, the explicitly
requested `Deploy to GitHub Pages` run, and the live archive. Enable normal
Actions failure notifications and check schedule status when maintaining the
site. No new audio-publishing authorization is implied by this read-only RSS
metadata refresh.

The job runs tests, strict SEO, build and the unchanged 100-point Lighthouse
threshold before persisting only `podcast-feed.json`. It uses a normal
non-force push; a concurrent main update rejects the push rather than overwriting
someone's work. GITHUB_TOKEN pushes do not trigger push workflows, so deployment
is requested explicitly with `workflow_dispatch`. On every successful refresh,
it compares main with the last successful deployment run and retries dispatch
when needed, even if a previous dispatch failed and the RSS is now unchanged.
A feed failure exits before either commit or dispatch. The existing site stays
available while Actions reports the failure.

Local builds and manual `npm run podcast:sync` use the same snapshot/parser.
The browser does not fetch RSS or require cross-origin feed access. Workflow
and production execution results are recorded in the release handoff; local
fixture tests alone are not represented as a successful remote refresh.

## Sources for the refresh implementation

- [GitHub workflow trigger behavior](https://docs.github.com/en/actions/how-tos/write-workflows/choose-when-workflows-run/trigger-a-workflow)
- [Python ElementTree](https://docs.python.org/3/library/xml.etree.elementtree.html)
- The official Spreaker RSS URL in `PODCAST.feedUrl` and the snapshot's `source`.

## Player behavior and verification limits

The player makes no Spotify request until clicked. No autoplay parameter,
autoplay permission, API playback command, audio preload, external thumbnail
or external script is added. The iframe preserves `encrypted-media`, has a
specific accessible title and reserves its layout space. Direct links remain
usable with JavaScript disabled, if Spotify is blocked, or if loading stalls.

The small browser script is necessary to create the third-party iframe only
after consent to load, announce loading and a 15-second timeout, and allow a
retry. CSS handles layout, theming and button states. An iframe `load` event
only confirms that its frame navigated; browser same-origin rules prevent this
site from reliably distinguishing Spotify's internal error/login UI. The
message says exactly that, and direct links stay visible.

Official references checked October 15, 2026:

- [Spotify creator sharing and embedding](https://support.spotify.com/us/creators/article/sharing-embedding-your-show/)
- [Spotify embeds](https://developer.spotify.com/documentation/embeds)
- [Spotify embed troubleshooting](https://developer.spotify.com/documentation/embeds/tutorials/troubleshooting)
- [Verified show oEmbed](https://open.spotify.com/oembed?url=https%3A%2F%2Fopen.spotify.com%2Fshow%2F6ueCCm5YS5Oth66FbwkjO8)

Run `python3 scripts/test-podcast.py` against `npm run preview` after building.
It checks the real local pages, keyboard, responsive layout, direct fallbacks,
JavaScript disabled, third-party click gating and controlled loading outcomes.
Controlled frame responses test local states only, never Spotify playback.
Review screenshots show the real initial click-to-load design.

## Original design review evidence — October 15, 2026

- `npm ci`, `npm test` (59 tests plus the controlled featured build),
  `npm run seo:check`, `npm run build`, `python3 scripts/test-podcast.py`, and
  `git diff --check` passed. Strict SEO checked 71 pages; link checks passed.
- Lighthouse **13.4.1**, Chromium **154.0.8037.57**, Debian 13, Node 24.19.0.
  Mobile defaults, real production build and existing analytics retained.
  `npm run perf:check` scored **100, 100, 100** for each of `/`, `/en/`,
  `/posts/2026-10-06-reminders-shaliach/`, `/podcast/`, and
  `/posts/2026-10-13-wake-up-sky/`. The guard now includes the two added routes
  without removing its original routes or changing its threshold/settings.
- Separate Lighthouse Accessibility / Best Practices / SEO audits scored
  **100 / 100 / 100** on both affected pages before loading the third-party
  player. Those scores do not evaluate a subsequently loaded Spotify iframe.
- Browser checks include 320, 375, 390, 768 and 1440px, light/dark, 200% root
  text size on a 320px viewport, reduced-motion presentation, keyboard entry
  and exit, no-JavaScript fallbacks, no Spotify requests before clicking,
  correct show/episode IDs, timeout/retry, and stable player-stage height.
- Production, Spotify and Spreaker connections from this executor returned
  HTTP 403 / `ERR_TUNNEL_CONNECTION_FAILED`, including the browser. The source
  repository's shared design is verified locally; exact live comparison,
  feed artwork retrieval, real Spotify playback and live delivery/performance
  remain unverified. Web-tool access did verify official documentation and the
  current show oEmbed response. No generated or replacement cover art was used.
- Screenshots: `preview-shots/podcast/` (desktop, mobile, and mobile dark for
  both pages). They show the actual initial click-to-load design, with no
  mocked Spotify player. Screenshot files are deliverables, not website assets.

Astro's own telemetry/config needed writable temporary paths in this sandbox;
checks used `ASTRO_TELEMETRY_DISABLED=1 XDG_CONFIG_HOME=/tmp/shluchim-config`.
Dependency installation used `--cache /tmp/shluchim-npm-cache`. Site analytics
were not disabled, and no production setting was changed.

## RSS archive and studio release checks — October 15, 2026

- The original 59-test design candidate was extended with GUID-based archive
  checks. The release passes 63 Node tests, 15 Python RSS tests, and controlled
  featured/archive production builds. A new GUID with the same title as a known
  episode renders its own row, receives verified feed/audio links, and inherits
  neither a Spotify ID nor a title-based post association.
- A real failed RSS request in this executor returned HTTP 403; SHA-256 comparison
  confirmed that the last-known-good JSON bytes remained unchanged. The seed and
  parser's realistic first-item fixture use the metadata independently verified
  by the parent's cloud browser. Local fixture parsing is not claimed as a
  successful network refresh.
- The static approved character stills and decorative audio marks add no motion
  or new browser script. Browser checks cover 320–1440px, dark/light, 200% text,
  keyboard, no-JavaScript fallbacks, click gating, timeout/retry, native archive
  access and the first episode's separately targeted Spotify player.
- The parent verified the official show and episode embeds playing logged out
  in cloud Chrome after explicit clicks. That does not prove Safari or this
  executor's iframe integration can reach Spotify; this executor still has
  network restrictions. The local player states were tested with controlled
  frame responses, never used in screenshots.
- Workflow YAML and all shell blocks parse successfully. Production execution,
  exact remote commit, CI and the initial real-feed refresh must be recorded
  from GitHub's results after the approved release, without bypassing failures.
