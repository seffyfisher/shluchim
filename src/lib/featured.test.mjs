import { test } from 'node:test';
import assert from 'node:assert/strict';
import { splitFeaturedPosts } from './featured.mjs';

const post = (lang, key, featured = false) => ({ id: `${lang}/${key}`, data: { translationKey: key, featured } });
const keys = (posts) => posts.map((p) => p.data.translationKey);
const order = ({ latest, featured, history }) => keys([...(latest ? [latest] : []), ...featured, ...history]);

test('newest post comes first, then featured, then history, newest-first inside each group', () => {
  const posts = [post('he', 'new'), post('he', 'middle', true), post('he', 'recent'), post('he', 'old', true), post('he', 'oldest')];
  const split = splitFeaturedPosts(posts, posts, 'he');
  assert.equal(split.latest.data.translationKey, 'new');
  assert.deepEqual(keys(split.featured), ['middle', 'old']);
  assert.deepEqual(keys(split.history), ['recent', 'oldest']);
  assert.deepEqual(order(split), ['new', 'middle', 'old', 'recent', 'oldest']);
});

test('a featured newest post shows only in the latest slot, never again in featured', () => {
  const posts = [post('he', 'new', true), post('he', 'middle', true), post('he', 'old')];
  const split = splitFeaturedPosts(posts, posts, 'he');
  assert.equal(split.latest.data.translationKey, 'new');
  assert.deepEqual(keys(split.featured), ['middle']);
  assert.deepEqual(keys(split.history), ['old']);
  assert.equal(new Set(order(split)).size, posts.length);
});

test('Hebrew controls a paired English post in both directions', () => {
  const he = [post('he', 'latest'), post('he', 'pinned', true), post('he', 'ordinary')];
  const en = [post('en', 'latest'), post('en', 'ordinary', true), post('en', 'pinned', false)];
  const { latest, featured, history } = splitFeaturedPosts(en, he, 'en');
  assert.equal(latest.data.translationKey, 'latest');
  assert.deepEqual(keys(featured), ['pinned']);
  assert.deepEqual(keys(history), ['ordinary']);
});

test('standalone English posts use their own featured flag', () => {
  const en = [post('en', 'latest'), post('en', 'standalone', true), post('en', 'ordinary')];
  const { featured, history } = splitFeaturedPosts(en, [], 'en');
  assert.deepEqual(keys(featured), ['standalone']);
  assert.deepEqual(keys(history), ['ordinary']);
});

test('no selections leaves the existing chronological list unchanged', () => {
  const posts = [post('he', 'new'), post('he', 'old')];
  const split = splitFeaturedPosts(posts, posts, 'he');
  assert.deepEqual(split.featured, []);
  assert.equal(split.latest, posts[0]);
  assert.deepEqual(split.history, posts.slice(1));
  assert.deepEqual(order(split), ['new', 'old']);
});

test('an empty language has no latest post', () => {
  assert.deepEqual(splitFeaturedPosts([], [], 'ar'), { latest: null, featured: [], history: [] });
});
