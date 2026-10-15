import test from 'node:test';
import assert from 'node:assert/strict';
import { podcastArchive, podcastDuration } from './podcast-archive.ts';
import { PODCAST } from '../data/podcast.ts';

const entry = {
  guid: 'controlled-fixture-guid', title: 'A fixture title', published: '2026-10-15T12:00:00Z',
  durationSeconds: 314, number: 1, language: 'he', description: 'Plain text.',
  pageUrl: 'https://www.spreaker.com/episode/fixture--123',
  audioUrl: 'https://api.spreaker.com/download/episode/123/fixture.mp3', audioType: 'audio/mpeg',
};
const snapshot = (episodes) => ({ schemaVersion: 1, source: PODCAST.feedUrl, episodes });

test('an archive is sorted by date and keeps separate GUIDs with matching titles', () => {
  const older = { ...entry, guid: 'older', published: '2026-10-14T12:00:00Z' };
  assert.deepEqual(podcastArchive(snapshot([older, entry])).map((e) => e.guid), [entry.guid, older.guid]);
  // No Spotify or post ID is manufactured from either the title or GUID.
  assert.equal(podcastArchive(snapshot([entry]))[0].spotifyId, undefined);
  assert.equal(podcastArchive(snapshot([entry]))[0].postId, undefined);
});

test('a malformed or duplicate snapshot cannot produce a public archive', () => {
  for (const value of [null, snapshot([]), snapshot([entry, entry]),
    snapshot([{ ...entry, guid: '' }]), snapshot([{ ...entry, audioUrl: 'javascript:alert(1)' }]),
    snapshot([{ ...entry, pageUrl: 'javascript:alert(1)' }]),
    snapshot([{ ...entry, durationSeconds: -1 }])]) {
    assert.throws(() => podcastArchive(value));
  }
});

test('optional and hour-long durations are readable', () => {
  assert.equal(podcastDuration(314), '5:14');
  assert.equal(podcastDuration(3723), '1:02:03');
  assert.equal(podcastDuration(null), undefined);
});
