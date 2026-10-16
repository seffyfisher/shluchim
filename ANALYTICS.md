# Site analytics

Updated October 16, 2026. Primary questions: which ideas get copied, whether
copying succeeds, which stories/topics readers choose, how readers use listening
and image controls, and whether feedback is accepted. No new key event or
conversion is configured in the GA4 account.

The existing GA4 property in `src/config.ts` is used; no second SDK or dependency.
Production pages only; development and draft previews do not collect analytics.
The library and interaction listeners start after `window.load`, five seconds,
and a browser idle callback (another three-second timer on older browsers).
Actions before that point are deliberately not recorded. A blocked GA request
never stops copying, form submission or navigation. No delivery callbacks,
navigation delays, DOM scans, mutation observers or pointer/scroll listeners.
Google's downloaded code still has a main-thread cost; this cannot promise zero
impact on later interactions. Run the unchanged Lighthouse release guard.

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
| Copy idea / follow prompt | `idea` / `follow` | `copy`, then `result` | Button class; `result=success/error` |
| Internal links / same-page anchors | `a` (or enclosing content group) | `navigate` | Destination without query; fragment for same-page anchors |
| Image open, close, reset; dialog dismiss | `button` | `click` | Popover target or button class |
| Expand/collapse transcript or podcast | `summary` | `open/close` | Summary or explicit identifier |
| Theme choice | `theme` | `change` | `light/dark/system` |
| Feedback choice | `feedback` | `change` | `helped/not_really` |
| Valid feedback submission | `feedback` | `submit` | `post/about` |
| Feedback server response | `feedback` | `result` | `post/about`; `result=success/error/slow` |
| Load Spotify frame (including retries) | `podcast` | `load_player` | Spotify episode/show ID |
| Native audio/video | `audio/video` | `play/complete` | Source URL without query |

`placement` is `header`, `main`, `footer` or `page`; `language` is the document
language. Copy clicks and copy outcomes are distinct rows: count `action=copy`
for attempts, or `action=result,result=success` for successful copies.
Submitting does not mean the server accepted the feedback; use the result row.
Spotify frame loading is not proof of listening. Interactions inside the
cross-origin Spotify frame cannot be observed by this tracker. Native playback
resumption generates another `play`; no progress timers or percentage events.

No feedback text, email, clipboard content, prompt, arbitrary input value or
visible label is read by the tracker. It ignores mailto/tel links. Custom link
and media parameters strip query strings. GA4's own automatic URL collection
remains governed by the web stream settings.

New links, buttons and disclosures are covered by delegation. Use
`data-analytics-content` on a container and `data-analytics-id` /
`data-analytics-action` on a control when a stable identifier is needed.
Components publish a bubbling `analytics:result` CustomEvent with only an
allowlisted outcome after finishing their normal UI work. No GA dependency
is imported into those components.

For reports, `content_type` is standard; register event-scoped custom dimensions
for `action`, `result`, `placement`, and `item_id` if needed in Explore.
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
It verifies deferred activation, keyboard/nested clicks, successful and failed
clipboard writes, feedback result/privacy, navigation, outbound/download
deduplication, native media and the Spotify load control. The Lighthouse guard
runs separately, without request stubs or analytics overrides.

The connected Analytics plugin currently reports `configuration_required`
(Google Cloud OAuth setup is incomplete), so account-side Enhanced Measurement
settings and real ingestion have not been verified by this change.
