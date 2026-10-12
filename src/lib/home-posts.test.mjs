import { test } from 'node:test';
import assert from 'node:assert/strict';
import { featuredFirst } from './home-posts.ts';

const post = (id, featured) => ({ id, data: { ...(featured === undefined ? {} : { featured }) } });
const ids = (posts) => posts.map((p) => p.id);

test('old featured stories precede the newest history; each group retains publication order', () => {
  const history = [post('newest'), post('recent-featured', true), post('regular', false), post('old-featured', true), post('oldest')];
  const result = featuredFirst(history);
  assert.deepEqual(ids(result), ['recent-featured', 'old-featured', 'newest', 'regular', 'oldest']);
  assert.equal(new Set(result).size, history.length);
  assert.deepEqual(ids(history), ['newest', 'recent-featured', 'regular', 'old-featured', 'oldest']);
  assert.equal(result[0], history[1]);
});

test('no featured stories, all featured stories and empty histories retain their order', () => {
  for (const history of [[], [post('a'), post('b', false)], [post('a', true), post('b', true)]]) {
    assert.deepEqual(featuredFirst(history), history);
    assert.notEqual(featuredFirst(history), history);
  }
});

test('same-day order supplied by the dated history is preserved in both groups', () => {
  const history = [post('z-featured', true), post('y-regular'), post('x-featured', true), post('w-regular')];
  assert.deepEqual(ids(featuredFirst(history)), ['z-featured', 'x-featured', 'y-regular', 'w-regular']);
});
