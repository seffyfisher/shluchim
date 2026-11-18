import test from 'node:test';
import assert from 'node:assert/strict';
import { verifyPodcast, sourceSlugs, distPathForPost } from './podcast-verify.mjs';

const ID = 'AbCdEfGhIjKlMnOpQrStUv';
const feedEpisodes = [{
  guid: 'g1', title: 'פרק בדיקה | פרק 1', number: 1, pageUrl: 'https://www.spreaker.com/episode/x--1',
  description: 'הפוסט: https://shluchim.shinlamed.com/posts/2026-01-01-demo/',
}];
const episodes = { demo: { rssGuid: 'g1', spotifyId: ID, spotifyUrl: `https://open.spotify.com/episode/${ID}` } };
const posts = ['he', 'en', 'ar'].map((lang) => ({
  id: `${lang}/${lang === 'he' ? '2026-01-01-demo' : `2026-01-01-demo-${lang}`}`, lang,
  slug: lang === 'he' ? '2026-01-01-demo' : `2026-01-01-demo-${lang}`, translationKey: '2026-01-01-demo', draft: false,
}));
const full = Object.fromEntries(posts.map((p) => [p.id, 'demo']));
const block = `<aside class="podcast-listen"><div data-src="https://open.spotify.com/embed/episode/${ID}?x"></div><a href="https://open.spotify.com/episode/${ID}">s</a><a href="/podcast/">p</a></aside>`;
const dist = (over = {}) => (rel) => {
  const files = {
    'podcast/index.html': `<article data-episode-guid="g1"><a href="https://open.spotify.com/episode/${ID}">s</a> embed/episode/${ID}</article>`,
    ...Object.fromEntries(posts.map((p) => [distPathForPost(p.id), block])),
    ...over,
  };
  return rel in files ? files[rel] : null;
};
const run = (over = {}) => verifyPodcast({ feedEpisodes, episodes, postEpisodes: full, posts, ...over });

test('a fully published episode passes (static and built)', () => {
  assert.deepEqual(run(), []);
  assert.deepEqual(run({ readDist: dist() }), []);
});

test('fails when the feed episode has no Spotify enrichment', () => {
  const problems = run({ episodes: {}, postEpisodes: {} });
  assert.match(problems.join('\n'), /no Spotify enrichment/);
});

test('fails on a malformed Spotify id or url mismatch', () => {
  assert.match(run({ episodes: { demo: { ...episodes.demo, spotifyId: 'short' } } }).join('\n'), /spotifyId is missing or malformed/);
  assert.match(run({ episodes: { demo: { ...episodes.demo, spotifyUrl: 'https://open.spotify.com/episode/other' } } }).join('\n'), /spotifyUrl does not match/);
});

test('fails when a translation of the source post has no podcast block mapping', () => {
  for (const lang of ['he', 'en', 'ar']) {
    const post = posts.find((p) => p.lang === lang);
    const { [post.id]: _omit, ...rest } = full;
    assert.match(run({ postEpisodes: rest }).join('\n'), new RegExp(`post ${post.id} has no podcast block`));
  }
});

test('draft translations are not required to carry the block', () => {
  const withDraft = posts.map((p) => (p.lang === 'ar' ? { ...p, draft: true } : p));
  const { [posts[2].id]: _omit, ...rest } = full;
  assert.deepEqual(run({ posts: withDraft, postEpisodes: rest }), []);
});

test('fails when the source post cannot be determined or does not exist', () => {
  const noPost = [{ ...feedEpisodes[0], description: 'no link' }];
  assert.match(run({ feedEpisodes: noPost }).join('\n'), /no source post found/);
  assert.match(run({ posts: posts.filter((p) => p.lang !== 'he') }).join('\n'), /source post he\/2026-01-01-demo does not exist/);
});

test('fails on stale map entries and enrichment that left the feed', () => {
  assert.match(run({ postEpisodes: { ...full, 'he/gone': 'demo' } }).join('\n'), /unknown post he\/gone/);
  assert.match(run({ postEpisodes: { ...full, [posts[0].id]: 'nope' } }).join('\n'), /unknown episode nope/);
  assert.match(run({ episodes: { ...episodes, old: { ...episodes.demo, rssGuid: 'gone' } } }).join('\n'), /not in podcast-feed.json/);
});

test('built output: episode missing from /podcast/ or without Spotify link/player', () => {
  assert.match(run({ readDist: dist({ 'podcast/index.html': '<article data-episode-guid="other"></article>' }) }).join('\n'), /missing from \/podcast\//);
  assert.match(run({ readDist: dist({ 'podcast/index.html': '<article data-episode-guid="g1">no links</article>' }) }).join('\n'), /no Spotify link/);
  assert.match(run({ readDist: () => null }).join('\n'), /dist\/podcast\/index.html is missing/);
});

test('built output: a post page without the player or links fails in each language', () => {
  for (const post of posts) {
    const file = distPathForPost(post.id);
    assert.match(run({ readDist: dist({ [file]: '<main>no block</main>' }) }).join('\n'), new RegExp(`${post.id} lacks the podcast block`));
    assert.match(run({ readDist: dist({ [file]: block.replace(`embed/episode/${ID}`, 'x') }) }).join('\n'), /lacks the Spotify player/);
    assert.match(run({ readDist: dist({ [file]: block.replace('href="/podcast/"', '') }) }).join('\n'), /lacks the link to the podcast page/);
  }
  assert.match(run({ readDist: (rel) => (rel === distPathForPost('en/2026-01-01-demo-en') ? null : dist()(rel)) }).join('\n'), /not built/);
});

test('source slugs come from RSS links and the enrichment post paths', () => {
  const ep = { pageUrl: 'https://shluchim.shinlamed.com/posts/a-1/', description: 'https://shluchim.shinlamed.com/posts/b-2/ and https://example.com/posts/zzz/' };
  assert.deepEqual(sourceSlugs(ep, { postPath: 'posts/c-3/', morePosts: [{ path: 'posts/d-4/' }] }).sort(), ['a-1', 'b-2', 'c-3', 'd-4']);
});
