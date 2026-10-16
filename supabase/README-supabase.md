# Feedback backend (Supabase)

## Online readers (Realtime Presence + Bloub)

A compact, single-row band below the header shows one coloured Bloub character
per connected, visible browser across all Hebrew and English pages. It uses the same project
(`tyzswuffvhxnmtaoaskz`) and the public `shluchim-online` Presence channel;
no table, migration or new Edge Function. Public Realtime channels must be
allowed in the project's Realtime settings.

The public `sb_publishable_...` key provided for this feature is configured in
`src/config.ts`. Override `PRESENCE_PUBLISHABLE_KEY` when building if needed;
an explicit empty value disables the feature. A secret or legacy service-role
key is rejected by the build. There is no counter in `astro dev` or drafts.

Only an inline loader (about 430 bytes gzipped) runs with the initial HTML.
The Astro `deferredReaders` build hook replaces the generated Presence module
tag with this loader; it fails the build if the module tag changes unexpectedly.
The gallery entry and Vite helper download after `load`, 500ms and
`requestIdleCallback`; the Realtime SDK then imports during another idle slot.
Without that API, each idle slot uses a 250ms timer (about one second after
load before connecting, rather than the old eleven-second minimum). There is no idle
timeout forcing work into a busy interval. The SVG sprite is requested
only once actual readers are rendered. The band reserves its full height, so
appearing/disappearing counts and crowds do not move the story. The band is
64px high, including its top spacing, down from the original 132px. Large crowds
scroll left horizontally inside the band using touch, a trackpad or keyboard;
at most 500 decorative avatars are rendered, with a visible `+N` for the rest.
The label keeps the full count of valid browser IDs. This bounds DOM work from
untrusted channel input without silently discarding the crowd size. Keyboard
focus outlines the scroll area.

The artwork is generated with the MIT-licensed Bloub engine from
https://github.com/jeremy-prt/bloub, pinned to commit
`b4bb3c1b5f93c7b87a2e8d620f667c4093d97749`. `npm run readers:avatars`
reproduces the 128 combinations of its eight shapes and sixteen expressions.
The first sixteen readers use different expressions. Each reader keeps its
assigned hue and SVG node across Presence updates; 3,600 hue slots are available
before colours repeat. CSS adjusts the colours for the active light/dark theme.
See `scripts/vendor/bloub/README.md`. No Vue or Bloub animation engine ships to
the browser: the committed SVG is hashed by Vite, and each joining character
gets a short CSS greeting, disabled for reduced motion. Existing characters
retain their DOM nodes and do not replay the greeting on every sync.

The count estimates **visible browsers**, including the current reader. A
random localStorage ID groups tabs; new connections replace it on each new UTC
day. Existing connections retain their current ID until reconnecting; tabs
straddling midnight can briefly be counted separately. Legacy permanent IDs
are replaced. Blocked storage falls back to a tab ID.
Only that random ID and an empty payload are shared on the public channel;
no names, emails or page paths. Presence can be spoofed and is not an
authoritative people count. No history is saved to Postgres. Short visits that
leave before the deferred connection are not counted. Hidden/offline tabs
disconnect and resume on visibility, connectivity or bfcache restore. Failed
or disconnected counts stay hidden. Realtime connection/message quotas apply;
there are no polling API requests. This public channel is not an abuse boundary:
clients can spoof valid IDs or exhaust project quotas. A frontend cap protects
decorative DOM, not the SDK's incoming state or the service's billing limits.
See [the security review](../docs/online-readers-security-review.md) for findings,
remaining server checks and evidence. Do not send private information on it.

Each page reuses one SDK client because Phoenix retains its own page-lifecycle
hooks. Suspension closes the transport before removing channels, waits for
both operations, then disconnects again to invalidate a saved automatic
`pageshow` reconnect. A new subscription waits for that teardown. This prevents
frozen sockets and extra connections when returning from the back/forward cache.

Validation: `node --test --test-isolation=none src/lib/presence.test.mjs
src/lib/reader-avatars.test.mjs src/lib/readers-loader.test.mjs` covers deferral, unique browser counts,
languages, failure/reconnection, background/offline/bfcache, blocked storage,
and 200-character crowds. Run normal tests, SEO, build and Lighthouse checks
with the feature enabled. In a browser, confirm SDK/socket/sprite downloads
start after `load` + 500ms + idle; check two tabs plus another browser,
light/dark/reduced-motion and responsiveness/layout shifts with a large crowd.
An initial Lighthouse pass alone does not verify deferred work or Supabase
connectivity. A local protocol fixture does not verify the live service.

`npm run test:presence-lifecycle` runs the production build in actual Chromium
windows against a local Phoenix/Presence fixture, using the real pinned SDK.
It checks short visits (initial sync within three seconds in the local fixture),
fresh navigation without idle callbacks, native minimize/restore and real bfcache restores, socket
counts, duplicate-browser keys, closure of both windows and uncaught errors.
CI runs it before Lighthouse and deployment. `ws` is a test-only dependency.

## Feedback

Plain HTML form (zero client JS) → Supabase Edge Function `feedback` → Postgres table `public.feedback`.
Moderation: in the Supabase dashboard (Table Editor → `feedback`), change `status` from `pending` to `approved` or `rejected`.
Notifications: a Grok Bot routine polls for new `pending` rows (read with the service role). No email, no domain.

## Files
- `migrations/001_feedback.sql`: `feedback` + `feedback_attempts` (rate limit), RLS on with **no policies** (only `service_role` can read or write), the future view `feedback_public_quotes`, and retention SQL in comments.
- `functions/feedback/index.ts`: the entry (`Deno.serve`). `handler.ts`: the logic. `handler.test.ts`: unit tests (`deno test`, DB mocked).

## Deploy (once, by Seffy or with Seffy's access token)
```bash
npm i -g supabase            # or: brew install supabase/tap/supabase
supabase login               # or: export SUPABASE_ACCESS_TOKEN=sbp_...
cd <repo>                    # this repo root (contains supabase/)
supabase link --project-ref <PROJECT_REF>        # asks for the DB password
supabase db push                                  # applies migrations/ (001_feedback, 002_hardening)
supabase secrets set FEEDBACK_IP_SALT="$(openssl rand -hex 32)"
supabase functions deploy feedback --no-verify-jwt   # a form POST cannot send a JWT
```
`SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` are injected into Edge Functions automatically. Don't set them, and never put the service key in the site or the repo.

## Smoke test
```bash
curl -i -X POST "https://<PROJECT_REF>.supabase.co/functions/v1/feedback" \
  -H 'content-type: application/x-www-form-urlencoded' \
  --data 'page=/&return_to=https://shluchim.shinlamed.com/&reaction=helped&message=test&website='
# expect: HTTP/2 303, location: https://shluchim.shinlamed.com/#feedback-thanks
```
Then check that the row is in Table Editor → `feedback` with `status = pending`.

## Turn the block on
In `src/config.ts`, set:
```ts
export const FEEDBACK_ENDPOINT: string = process.env.FEEDBACK_ENDPOINT || 'https://<PROJECT_REF>.supabase.co/functions/v1/feedback';
```
While it's empty, the block isn't rendered (that's the main default). For a preview build: `FEEDBACK_ENDPOINT=https://… npm run build`.

## Contract
The site's form sends only `page`, `return_to`, `reaction`, `message`, `email` and the honeypot (since 2026-10-11: two submit buttons, everything else behind a closed `<details>`). `name` is no longer sent. `quote_ok=yes` is always sent as a hidden field: the small print under the buttons says that submitting the form approves publishing what was written, without a name or other personal details. Nothing is public until a row's `status` is set to `approved`, and the `feedback_public_quotes` view never shows `name` for these rows.

POST `application/x-www-form-urlencoded`: `page`, `return_to`, `reaction` (`helped` | `not_really`, required), `message` (≤1000), `name` (optional, trimmed, markup stripped, ≤60), `email` (optional, validated), `quote_ok` (`yes`), `website` (honeypot).
- Response: `303` to `return_to` + `#feedback-thanks` | `#feedback-error` | `#feedback-slow`. `return_to` must start with `https://shluchim.shinlamed.com/`, otherwise the site root is used.
- Honeypot filled: fake `#feedback-thanks`, nothing stored. Rate limit: 5 attempts per IP (salted SHA-256) per 10 minutes → `#feedback-slow`.
- With `Accept: application/json`: `{"status":"ok"|"error"|"slow"}` (200 / 400 / 429).

## Public quotes (later)
A quote shows `name` only if a name was given and `quote_ok`, otherwise it's anonymous. Email is never shown. Read `feedback_public_quotes` at build time with a server-side key (never in the client).

## Retention (suggested)
Live: pg_cron job `feedback-retention-daily` (01:15 UTC daily) deletes emails after 90 days, rejected rows after 30 days and attempts after 1 day. See `migrations/003_retention_cron.sql`.

## Deployed (2026-10-10)
- Project ref `tyzswuffvhxnmtaoaskz`. Endpoint: `https://tyzswuffvhxnmtaoaskz.supabase.co/functions/v1/feedback` (set in `src/config.ts`).
- `supabase db push` couldn't reach the pooler from the build box (connection timeout), so 001 and 002 were applied through the Management API (`POST /v1/projects/{ref}/database/query`) and recorded in `supabase_migrations.schema_migrations`.
- Security audit: `/workspace/blog-feedback-spec/security-audit.md`. Routine query: `routine-pending-query.md`.
- The rate limit uses `cf-connecting-ip`, which Supabase's edge sets and clients can't spoof.
