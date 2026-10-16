# Site analytics

Updated October 16, 2026. Primary questions: which ideas get copied, whether
copying succeeds, which stories/topics readers choose, how readers use listening
and image controls, and whether feedback is accepted. No new key event or
conversion is configured in the GA4 account.

The existing GA4 property in `src/config.ts` is used; no second SDK or dependency.
Production pages only; development and draft previews do not collect analytics.
The library starts after `window.load`, five seconds, and a browser idle
callback (another three-second timer on older browsers). The interaction
listeners start at once: until the library arrives, `gtag()` only pushes onto
`dataLayer`, and gtag.js replays that queue in order (after the page view).
Actions on a page left before the library loads are still lost. A blocked GA request
never stops copying, form submission or navigation. No delivery callbacks,
navigation delays, DOM scans, mutation observers or pointer/scroll listeners.
Google's downloaded code still has a main-thread cost; this cannot promise zero
impact on later interactions. Run the unchanged Lighthouse release guard.

## Required workflow for features and merges

Standing rule from Seffy, October 16, 2026: every new or changed feature that
affects a meaningful user action or outcome includes analytics as part of the
implementation. This applies to actions such as using/copying an idea, following
new posts, submitting feedback, navigating to content, or using a player. It
also applies when a refactor changes the controls, identifiers or success
conditions of an already measured flow.

### Implementing agent

1. State the questions the data must answer: whether the feature is used,
   which content/control is selected, and whether the intended outcome succeeds
   or fails where the site can observe that outcome. Map every meaningful action
   and outcome in the changed flow; measure business-relevant steps rather than
   every DOM interaction.
2. Inspect existing coverage first. Reuse GA4 Enhanced Measurement or a
   recommended GA4 event and the shared tracker. Existing delegated tracking
   counts as coverage only after verifying its actual payload for the new UI.
   Use stable dynamic identifiers/parameters; add a new event name only when
   existing semantics cannot answer the question, and explain why in the PR.
3. Define triggers and outcomes accurately. A click is an attempt; report success
   only after the operation confirms it. A loaded player frame does not establish
   listening, and copying a follow prompt does not establish a subscription.
   Keep attempts, confirmed outcomes and unavailable observations distinguishable
   in the data. Preserve production-only collection and the shared deferred
   activation boundary: load, settling period and browser idle.
4. Keep measurement passive and independent of feature behavior. The action
   must work when GA is unavailable; sending analytics must not delay rendering,
   navigation, copying or submission. Reuse the shared loader rather than adding
   a feature-specific SDK or eager listener bundle. Collect stable identifiers
   and allowlisted values; exclude email, feedback text, prompts, clipboard
   contents and other free-form/personal data.
5. Verify the affected flow in the production build, in each affected language
   and input mode. Check the actual event name, parameters, trigger timing,
   attempts/results, failures, and duplicate counts, including interaction with
   built-in GA4 events. Check that the UI still works when analytics is blocked.
   Run the applicable verification and performance checks documented below and
   in the release guard. Reuse existing checks where they cover the change.
6. Update the tracking table in this document when coverage or semantics change.
   In the PR, record each data question, event and dynamic parameters, trigger,
   outcome definition and verification evidence. Distinguish browser event/queue
   verification from actual GA4 ingestion and report configuration. If account
   access is unavailable, name the remaining check and the access needed; mark
   ingestion/settings as unverified rather than claiming they passed.

### Merging agent

Before merging the exact PR head, inspect the changed user flow and its analytics
evidence. Confirm every meaningful action/outcome has coverage, parameters allow
the stated questions to be answered, triggers reflect real outcomes, and the
implementation meets privacy and deferred-loading requirements. Confirm the
applicable browser and release checks passed on the candidate being merged.

An applicable feature is not ready to merge while tracking coverage or browser
verification is missing, duplicates or misleading success signals remain, or
measurement blocks the UI or exposes personal content. Request the concrete
missing implementation/evidence and recheck it before merge. A docs-only change
or another change with no effect on user actions may record **Analytics: not
applicable**, with a specific reason. Record any GA4 access/configuration gap
separately so it stays visible after publication.

## Use GA4 defaults first

In the web stream's Enhanced Measurement settings, keep page views, scrolls,
outbound clicks, file downloads and form interactions enabled. These settings
live in GA4 and cannot be verified from this repository. The site does not send
duplicates of `page_view`, `scroll`, `click`, `file_download`, `form_start` or
`form_submit`. GA4's supported download extensions and outbound HTTP(S) links
are excluded from the site's delegated click tracker. Internal navigation and
in-page links use the recommended `select_content` event.

## One event for site interactions

All added measurements use Google's recommended `select_content` event and
its standard `content_type` and `item_id` parameters. GA4 automatically supplies
the page, device and other common dimensions; no separate event per post,
language, button, topic or podcast episode.

| Interaction | `content_type` | `action` | `item_id` / extra |
| --- | --- | --- | --- |
| Copy idea / follow prompt | `idea` / `follow` | `copy`, then `result` | Button class; `result=success/error`; `post_slug` on post pages |
| Internal links / same-page anchors | `a` (or enclosing content group) | `navigate` | Destination without query; fragment for same-page anchors; `label` = link group |
| Email link (e.g. /about/) | `a` | `email` | `mailto` (never the address); `label` |
| Image open, close, reset; dialog dismiss | `button` | `click` | Popover target or button class |
| Expand/collapse transcript or podcast | `summary` | `open/close` | Summary or explicit identifier |
| Theme choice | `theme` | `change` | `light/dark/system` |
| Feedback choice | `feedback` | `change` | `helped/not_really`; `post_slug` on post pages |
| Valid feedback submission | `feedback` | `submit` | `post/about`; `post_slug` on post pages |
| Feedback server response | `feedback` | `result` | `post/about`; `result=success/error/slow`; `post_slug` on post pages |
| Load Spotify frame (including retries) | `podcast` | `load_player` | Spotify episode/show ID |
| Native audio/video | `audio/video` | `play/complete` | Source URL without query |

`placement` is `header`, `main`, `footer` or `page`; `language` is the document
language. `post_slug` is the URL slug of the post page. `label` is the nearest
`data-analytics-label`, else the first class of the nearest classed
`nav`/`aside`/`ol`/`ul`, `.prose` or `.meta` (e.g. `related`, `stories`,
`site-nav`, `post-foot`, `footer_topics`, `footer_links`, `site_title`), else `other`. Copy clicks and copy outcomes are distinct rows: count `action=copy`
for attempts, or `action=result,result=success` for successful copies.
Submitting does not mean the server accepted the feedback; use the result row.
Spotify frame loading is not proof of listening. Interactions inside the
cross-origin Spotify frame cannot be observed by this tracker. Native playback
resumption generates another `play`; no progress timers or percentage events.

No feedback text, email, clipboard content, prompt, arbitrary input value or
visible label is read by the tracker. Email links send only `mailto`, never the
address; tel links are ignored. Custom link
and media parameters strip query strings. GA4's own automatic URL collection
remains governed by the web stream settings.

New links, buttons and disclosures are covered by delegation. Use
`data-analytics-content` on a container and `data-analytics-id` /
`data-analytics-action` on a control when a stable identifier is needed.
Components publish a bubbling `analytics:result` CustomEvent with only an
allowlisted outcome after finishing their normal UI work. No GA dependency
is imported into those components.

For reports, `content_type` is standard; register event-scoped custom dimensions
for `action`, `result`, `placement`, `item_id`, `post_slug` and `label` if needed in Explore.
Do not create a custom dimension for each button or post. In DebugView (with
debug mode enabled for the test browser), verify one event per action/outcome
in both languages after the deferred activation. Actual ingestion and Enhanced
Measurement configuration require access to GA4; a local queue test alone
does not establish either.

## Verification

Run `npm test`, `npm run seo:check`, `npm run build`, then
`python3 scripts/test-analytics.py` and `npm run perf:check`.
The browser test checks the real production HTML in both languages with external
requests stubbed to avoid submitting feedback or polluting production analytics.
It verifies deferred library loading with early events queued, `post_slug`,
link `label`, the /about/ email link, keyboard/nested clicks, successful and failed
clipboard writes, feedback result/privacy, navigation, outbound/download
deduplication, native media and the Spotify load control. The Lighthouse guard
runs separately, without request stubs or analytics overrides.

The connected Analytics plugin currently reports `configuration_required`
(Google Cloud OAuth setup is incomplete), so account-side Enhanced Measurement
settings and real ingestion have not been verified by this change.
