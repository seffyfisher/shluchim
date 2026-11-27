# LESSONS

Seffy's five-step rule for every problem: **1** confirm it exists, **2** find the root cause, **3** design the fix, **4** build a rule or check, **5** fix.
Newest first.

## 2026-11-17: podcast episodes 3 and 4 were on /podcast/ but not fully published

1. **Problem seen.** Episode 4 («המחסן של כאילו») and episode 3 («השלוח שדופק בדלת») appeared on `/podcast/` from the RSS, but their blog posts had no on-site player, no Spotify link and no link to the podcast page. Episode 2's post had them only in Hebrew, and episode 1's only in Hebrew too. The English and Arabic versions of every source post had no block at all. Spotify IDs existed (ep 3 `6uNHeTuZMUp2SRauPVPHCV`, ep 4 `0ozEsrv46dmQR80Lnk6RRn`, both verified by oEmbed with the RSS titles) but were never entered.
2. **Root cause.** The player waits for a Spotify ID that only exists after the episode is processed on Spotify. The RSS sync (#146, #157) deliberately imports the episode first, and nothing flagged the gap afterwards: no check compared the feed with `EPISODES` and `POST_EPISODES`, and `POST_EPISODES` was written Hebrew-only by design (no EN/AR component labels existed), so translations were never part of "done".
3. **Design.** One definition of "fully published" (on `/podcast/`, Spotify ID and link, player and links in every language of every source post) and one explicit map line per post version. A localized block for EN/AR that says the audio is in Hebrew.
4. **Guard.** `npm run podcast:verify` (static, `--dist` for the built HTML, `--online` for Spotify oEmbed). It runs at the end of `podcast:sync`, in the `SEO guard` workflow and as the last step of the scheduled refresh, so a gap turns a run red. Unit tests with broken fixtures: `src/lib/podcast-verify.test.mjs`. Details: `PODCAST.md`.
5. **Fix.** Episodes 3 and 4 added to `EPISODES`; the block added to all HE/EN/AR source posts of episodes 1 to 4 (15 post versions); `PodcastListen` and `SpotifyPlayer` localized for EN/AR; `/podcast/` links both source posts of episode 3.
