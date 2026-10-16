# Online readers security review — 2026-10-16

## Conclusion and scope

No confirmed critical/high vulnerability was found in the reviewed reader code.
Two confirmed issues were hardened: unbounded decorative DOM from public-channel
input, and a permanent public browser identifier. **The live Supabase project's
permissions and limits have not been verified; this is not a completed server
security sign-off or a guarantee of no risk.**

Reviewed: the production feature on `main` at
`080a2ae8da8951a080cb5456567ff37239843029`, lifecycle candidate
`110e29267aed2edaaf5ab3d011774c4f24b07415`, and the security changes in PR #50.
The PR's final commit identifies the audited revision. These fixes are not live
until the PR is merged and deployment succeeds.

Scope includes configuration/build output, deferred loader, the real pinned
Realtime SDK and Phoenix transport, Presence rendering and lifecycle, static
Bloub artwork and vendored generator, dependency advisories, and the repository's
feedback migrations because the same project's public key can also reach its APIs.
It is not an audit of every unrelated site feature, Supabase internals, hosting
account security or the deployed feedback implementation.

## Findings

| Finding | Assessment | Result / remaining risk |
| --- | --- | --- |
| Public-channel input created one SVG per arbitrary key without a limit | Medium availability risk; local 5,000-key reproduction accepted all keys. No live service was flooded. | Fixed decorative DOM at 500 SVGs, with an explicit `+N`, full valid-ID count and UUID-v4 filtering. The SDK still receives/parses state before application filtering; this does not stop transport-level floods. |
| Persistent random browser ID was publicly observable across visits | Low privacy risk: pseudonymous tracking, not a login credential. | New connections use a daily UTC ID shared by tabs, replacing legacy IDs; invalid stored values are replaced. Rotation is on connection, not a timer; an uninterrupted connection remains linkable. A public channel can still correlate activity during a connection/day. |
| Anyone with the public key can join/read the public channel and spoof valid IDs or payloads | Inherent integrity limit; confirmed by client configuration and Supabase's authorization documentation. | Still applicable. Count is decorative and approximate; never use it for authorization, billing, analytics accuracy or proof of real people. Filtering does not authenticate readers. |
| Unauthenticated clients can consume shared Realtime connections/messages | Medium availability/cost exposure, amount depends on the unverified plan/settings. | Still applicable. Local rendering limits cannot limit malicious clients. Inspect connection/event/join limits, usage, billing/spend cap and alerts in the project. CORS/origin checks or hiding the public key cannot stop direct clients. |
| Lifecycle transport leak on bfcache restore | Availability/resource issue reproduced against the real SDK before PR #50. | Fixed in the same PR: reuse the client and await teardown, with native Chromium background, bfcache and two-window regression checks. Production remains affected until deployment. |
| Public key might reach improperly protected resources elsewhere in the same project | Unverified server configuration, not a confirmed data leak. Impact could be high if permissions are wrong. | Live project access is required. The key is project-wide, not scoped to Presence. Repository SQL alone does not prove deployed RLS/grants. |

## Checks and evidence

- `npm audit --omit=dev --json` and `npm audit --json`: **0 known advisories**
  in the locked dependency graph on this date. This is an advisory scan, not
  proof that all dependencies are vulnerability-free. Realtime JS is pinned
  to `2.118.0`; Phoenix is locked to `0.4.5`. `ws` is test-only.
- Configuration only accepts `sb_publishable_…` keys or an explicit empty value
  to disable the feature. Regression tests reject secret, service-role and
  legacy JWT-shaped inputs. No service-role credential is imported by reader
  client code. The feedback service-role lookup remains server-only.
  A scan of all 84 final generated HTML/JS/JSON/SVG text assets found no secret-key,
  private-key or JWT-shaped credential. This pattern scan is supplementary
  evidence, not an exhaustive secret detector.
- Remote keys are validated as UUID v4, then hashed into numeric SVG variants
  and hues. Keys/metadata never become HTML, JavaScript, CSS text or fetch URLs.
  Labels use `textContent`; SVG nodes use `createElementNS` and a build-owned
  sprite URL. The feature does not use `innerHTML`, `eval` or third-party code CDNs.
- The tracked application payload is `{}`. No page path, name, email or account
  ID is sent by this feature. The random presence ID is pseudonymous, not
  absolutely anonymous. Supabase also necessarily sees the network connection
  and IP; this review did not inspect its logs or retention settings.
- The real production bundle/SDK was exercised in Chromium against a local
  Phoenix fixture containing 5,000 valid fake UUIDs, HTML/event-handler payloads,
  `__proto__` and `constructor` keys, hostile metadata, and a 100,000-character
  key. Observed: 500 SVGs, a full count and `+N`, no attacker
  requests, no code execution/global prototype pollution, no uncaught errors,
  and recovery after the injected crowd leaves. This is a bounded regression,
  not an exhaustive fuzzing or a live Supabase penetration test.
- Parsed the committed SVG as XML: only static geometry, masks, symbols and
  internal fragment references; no scripts, events, foreign objects, embedded
  images or external links. Regeneration from the pinned MIT Bloub snapshot
  reproduced SHA-256 `a02871b039397e4b3c484e41f42fa4e40b4e20c328d30e264d0c90b6d9982b75`.
  No Vue or Bloub engine is executed in the browser.
  All twelve vendored TypeScript files matched the named upstream commit after
  the documented relative-import `.ts` extensions and trailing-newline
  normalization; no additional source modifications were found.
- SDK/entry remain deferred until after load, 500ms and idle; older browsers
  use two 250ms fallbacks, for about one second after load before connecting.
  The earlier five-second delay was shortened to count brief visible visits.
  Failure hides the reader band; the static blog content does not depend on Supabase.
  The 64px band and horizontal scrolling remain in place. No extra service,
  schema, polling request or runtime dependency was introduced by hardening.

Final candidate validation on `main` base `080a2ae`:

- `npm ci`, `npm test` (92 Node tests, 15 Python tests and existing controlled
  build checks), `npm run seo:check`, `npm run build`,
  `npm run test:story-loading`, `npm run test:presence-lifecycle`: passed.
- After shortening the delay, real Chromium with the pinned SDK and local
  protocol fixture synced initial readers 568ms and 561ms after load. Fresh
  navigation without `requestIdleCallback` restored the shared Hebrew/English
  count after 1,021ms. The regression requires initial/fresh-navigation sync
  within a three-second visit in this controlled fixture. Previously, a native
  navigation probe measured an absent reader for 5,056ms after the new page
  loaded. These are local timings, not live Supabase latency guarantees;
  network transfers, load time and busy-page idle scheduling can add delay.
- The unchanged `npm run perf:check` passed with the feature/analytics enabled.
  Lighthouse 13.4.1 mobile defaults, Chromium 154.0.8037.57, Node 24.19.0,
  Linux workspace, 2026-10-16. Three runs per route; 14 runs scored 100 and
  one representative-post run scored 99 (FCP 1.07s, LCP 1.81s, TBT 0ms).
  Routes: `/`, `/en/`, `/posts/2026-10-06-reminders-shaliach/`, `/podcast/`,
  `/posts/2026-10-13-wake-up-sky/`. All five medians: **100**. Initial-load
  performance is not a guarantee of zero deferred CPU or resilience to every
  possible network/payload flood.

  | Route | Runs | Median |
  | --- | --- | --- |
  | `/` | 100, 100, 100 | 100 |
  | `/en/` | 100, 100, 100 | 100 |
  | `/posts/2026-10-06-reminders-shaliach/` | 99, 100, 100 | 100 |
  | `/podcast/` | 100, 100, 100 | 100 |
  | `/posts/2026-10-13-wake-up-sky/` | 100, 100, 100 | 100 |
- Local raw logs: `/tmp/presence-faster-*.log` (current timing revision),
  `/tmp/presence-security-final-*.log` (security baseline); advisory scan JSON:
  `/tmp/presence-security-audit-prod.json` and `-all.json`. These are workspace
  evidence; they are not required runtime assets or a live-project audit.

## Live server verification still required

The connected Supabase account returned `You do not have permission to perform
this action` for project `tyzswuffvhxnmtaoaskz`. The workspace's outbound policy
also excludes its hostname; no alternate route was used. An authorized account
connection is needed; **do not send a secret/service-role key**.

1. Run the Supabase Security Advisor and inspect each result. Review all schemas
   exposed by Data API, table and column grants, RLS policies, views, RPCs
   (especially `SECURITY DEFINER` and their `search_path`), and Storage public
   buckets/policies. [The read-only catalog script](../supabase/presence-security-readonly.sql)
   prepares evidence without selecting feedback, emails, IPs or object contents.
   Extend its function review to any additional API-exposed custom schemas.
2. Specifically confirm `feedback`, `feedback_attempts` and
   `feedback_public_quotes` deny `anon` and `authenticated` access as intended
   by `001_feedback.sql` and `002_hardening.sql`, including inherited `PUBLIC`
   grants and the attempts sequence. Confirm `rls_auto_enable()` is not callable
   through anonymous/authenticated RPC. `003_retention_cron.sql` documents
   feedback retention; its actual schedule was not verified in this session.
   Inspect deployed Edge Functions and their API exposure.
   Confirm the supplied publishable key belongs to this project. No successful
   live authorization/denial check is claimed in this report.
3. Check Realtime public access and limits, the current plan/spend cap, usage
   and alerts. A private channel with a policy allowing all anonymous clients
   still cannot prove that one connection represents one real person. Stronger
   abuse control needs trusted issuance/authentication/rate limiting; it is a
   separate backend design, not a `private: true` frontend toggle.
4. With authorized access, run a small two-browser live join/leave check and
   negative permission checks against disposable/empty resources, without
   downloading private records or load-testing production.

An immediate kill switch already exists: build with
`PRESENCE_PUBLISHABLE_KEY=''` and deploy through the normal release guard.
This removes the counter and its loader from generated pages. It stops the
site's own readers connecting; it does **not** revoke an already-public key
or stop direct malicious clients. Server-side revocation/public-channel
restriction may be needed during active abuse, after checking other clients.

## Primary references

- [Supabase API keys](https://supabase.com/docs/guides/getting-started/api-keys)
- [Securing your data](https://supabase.com/docs/guides/database/secure-data)
- [Realtime authorization](https://supabase.com/docs/guides/realtime/authorization)
- [Realtime quotas](https://supabase.com/docs/guides/realtime/quotas)
- [Realtime settings](https://supabase.com/docs/guides/realtime/settings)
- [Bloub pinned source](https://github.com/jeremy-prt/bloub/tree/b4bb3c1b5f93c7b87a2e8d620f667c4093d97749)
