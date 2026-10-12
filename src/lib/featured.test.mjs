import { test } from 'node:test';
import assert from 'node:assert/strict';
import { splitFeaturedPosts } from './featured.mjs';

const post = (lang, key, featured = false) => ({ id: `${lang}/${key}`, data: { translationKey: key, featured } });
const keys = (posts) => posts.map((p) => p.data.translationKey);

test('featured posts precede history, preserving newest-first order inside each group', () => {
  const posts = [post('he', 'new'), post('he', 'middle', true), post('he', 'old', true)];
  const { featured, history } = splitFeaturedPosts(posts, posts, 'he');
  assert.deepEqual(keys(featured), ['middle', 'old']);
  assert.deepEqual(keys(history), ['new']);
  assert.deepEqual(keys([...featured, ...history]), ['middle', 'old', 'new']);
});

test('Hebrew controls a paired English post in both directions', () => {
  const he = [post('he', 'pinned', true), post('he', 'ordinary')];
  const en = [post('en', 'ordinary', true), post('en', 'pinned', false)];
  const { featured, history } = splitFeaturedPosts(en, he, 'en');
  assert.deepEqual(keys(featured), ['pinned']);
  assert.deepEqual(keys(history), ['ordinary']);
});

test('standalone English posts use their own featured flag', () => {
  const en = [post('en', 'standalone', true), post('en', 'ordinary')];
  const { featured, history } = splitFeaturedPosts(en, [], 'en');
  assert.deepEqual(keys(featured), ['standalone']);
  assert.deepEqual(keys(history), ['ordinary']);
});

test('no selections leaves the existing chronological list unchanged', () => {
  const posts = [post('he', 'new'), post('he', 'old')];
  const { featured, history } = splitFeaturedPosts(posts, posts, 'he');
  assert.deepEqual(featured, []);
  assert.deepEqual(history, posts);
});
