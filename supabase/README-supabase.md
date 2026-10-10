# Feedback backend (Supabase)

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
  --data 'page=/&return_to=https://seffyfisher.github.io/shluchim/&reaction=helped&message=test&website='
# expect: HTTP/2 303, location: https://seffyfisher.github.io/shluchim/#feedback-thanks
```
Then check that the row is in Table Editor → `feedback` with `status = pending`.

## Turn the block on
In `src/config.ts`, set:
```ts
export const FEEDBACK_ENDPOINT: string = process.env.FEEDBACK_ENDPOINT || 'https://<PROJECT_REF>.supabase.co/functions/v1/feedback';
```
While it's empty, the block isn't rendered (that's the main default). For a preview build: `FEEDBACK_ENDPOINT=https://… npm run build`.

## Contract
POST `application/x-www-form-urlencoded`: `page`, `return_to`, `reaction` (`helped` | `not_really`, required), `message` (≤1000), `name` (optional, trimmed, markup stripped, ≤60), `email` (optional, validated), `quote_ok` (`yes`), `website` (honeypot).
- Response: `303` to `return_to` + `#feedback-thanks` | `#feedback-error` | `#feedback-slow`. `return_to` must start with `https://seffyfisher.github.io/shluchim/`, otherwise the site root is used.
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
