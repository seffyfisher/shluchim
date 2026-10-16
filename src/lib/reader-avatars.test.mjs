import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readerAvatars } from './reader-avatars.ts';

function gallery() {
  const children = [];
  function node() {
    return { attributes: {}, children: [], setAttribute(key, value) { this.attributes[key] = value; }, append(child) { this.children.push(child); }, remove() { children.splice(children.indexOf(this), 1); } };
  }
  const doc = { createElementNS: () => node(), createDocumentFragment: () => node() };
  const crowd = { ownerDocument: doc, append(fragment) { children.push(...fragment.children); } };
  return { children, update: readerAvatars(crowd, '/_astro/bloub.svg') };
}

test('renders one different Bloub per browser, retains existing nodes, and removes departed readers', () => {
  const galleryState = gallery();
  galleryState.update(['first', 'second', 'third']);
  assert.equal(galleryState.children.length, 3);
  assert.equal(new Set(galleryState.children.map(node => node.children[0].attributes.href)).size, 3);
  const originals = [...galleryState.children];
  galleryState.update(['third', 'first', 'second']);
  assert.deepEqual(galleryState.children, originals, 'sync does not recreate avatars or replay their greeting');
  galleryState.update(['third', 'first']);
  assert.equal(galleryState.children.length, 2);
  assert.ok(galleryState.children.every(node => originals.includes(node)));
  galleryState.update([]);
  assert.equal(galleryState.children.length, 0);
});

test('large crowds are not silently capped and use all 128 variants before repeating', () => {
  const galleryState = gallery();
  galleryState.update(Array.from({ length: 200 }, (_, i) => `browser-${i}`));
  assert.equal(galleryState.children.length, 200);
  assert.equal(new Set(galleryState.children.slice(0, 128).map(node => node.children[0].attributes.href)).size, 128);
});
