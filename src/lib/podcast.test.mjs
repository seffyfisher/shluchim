import test from 'node:test';
import assert from 'node:assert/strict';
import { readdirSync } from 'node:fs';
import { EPISODES, episodeForPost, episodeForGuid, validatePodcastAssociations, validateEpisodeEnrichment } from '../data/podcast.ts';

test('audio belongs only to the explicitly associated post ID', () => {
  const episode = episodeForPost('he/2026-10-13-wake-up-sky');
  assert.equal(episode.spotifyId, '1Ccf2UKMMvEhrCb4mvnKJt');
  assert.equal(episode.durationIso, 'PT5M14S');
  assert.equal(episode.aiNarrated, true);
  // A title or partial slug never silently acquires Hebrew audio. Translations need their own explicit mapping.
  for (const id of ['עורו, שמיים.', '2026-10-13-wake-up-sky', 'he/unrelated', 'en/unrelated']) {
    assert.equal(episodeForPost(id), undefined);
  }
  for (const lang of ['en', 'ar']) assert.equal(episodeForPost(`${lang}/2026-10-13-wake-up-sky`).spotifyId, '1Ccf2UKMMvEhrCb4mvnKJt');
});

test('a mistyped or removed associated post fails validation', () => {
  assert.throws(() => validatePodcastAssociations(['he/unrelated']), /unknown post he\/2026-10-13-wake-up-sky/);
  const postIds = ['he', 'en', 'ar'].flatMap((lang) => readdirSync(new URL(`../content/posts/${lang}/`, import.meta.url))
    .filter((name) => name.endsWith('.md')).map((name) => `${lang}/${name.slice(0, -3)}`));
  assert.doesNotThrow(() => validatePodcastAssociations(postIds));
});

test('Spotify enrichment requires the separately verified exact RSS GUID', () => {
  const guid = 'https://api.spreaker.com/episode/75804362';
  assert.equal(episodeForGuid(guid).spotifyId, '1Ccf2UKMMvEhrCb4mvnKJt');
  assert.equal(episodeForGuid('עורו, שמיים. | פרק 1'), undefined);
  assert.equal(episodeForGuid('https://api.spreaker.com/episode/other'), undefined);
  assert.throws(() => validateEpisodeEnrichment(['another-guid']), /verified RSS GUID missing/);
  assert.doesNotThrow(() => validateEpisodeEnrichment(Object.values(EPISODES).map((episode) => episode.rssGuid)));
});
