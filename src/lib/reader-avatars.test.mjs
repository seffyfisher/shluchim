import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readerAvatars, MAX_READER_AVATARS } from './reader-avatars.ts';

function gallery() {
  const children = [];
  function node() {
    return { attributes: {}, children: [], setAttribute(key, value) { this.attributes[key] = value; }, append(child) { this.children.push(child); }, remove() { children.splice(children.indexOf(this), 1); } };
  }
  const doc = { createElementNS: () => node(), createDocumentFragment: () => node() };
  const crowd = { ownerDocument: doc, append(fragment) { children.push(...fragment.children); } };
  return { children, update: readerAvatars(crowd, '/_astro/bloub.svg') };
}

test('renders one coloured Bloub per browser, retains colours and nodes, and removes departed readers', () => {
  const galleryState = gallery();
  galleryState.update(['first', 'second', 'third']);
  assert.equal(galleryState.children.length, 3);
  assert.equal(new Set(galleryState.children.map(node => node.children[0].attributes.href)).size, 3);
  const colors = galleryState.children.map(node => node.attributes.style);
  assert.equal(new Set(colors).size, 3);
  const originals = [...galleryState.children];
  galleryState.update(['third', 'first', 'second']);
  assert.deepEqual(galleryState.children, originals, 'sync does not recreate avatars or replay their greeting');
  assert.deepEqual(galleryState.children.map(node => node.attributes.style), colors);
  galleryState.update(['third', 'first']);
  assert.equal(galleryState.children.length, 2);
  assert.ok(galleryState.children.every(node => originals.includes(node)));
  galleryState.update([]);
  assert.equal(galleryState.children.length, 0);
});

test('crowds get 16 expressions before repeating, 128 combinations and individual hues', () => {
  const galleryState = gallery();
  galleryState.update(Array.from({ length: 200 }, (_, i) => `browser-${i}`));
  assert.equal(galleryState.children.length, 200);
  assert.equal(new Set(galleryState.children.slice(0, 128).map(node => node.children[0].attributes.href)).size, 128);
  const expression = node => Math.floor(Number(node.children[0].attributes.href.split('#reader-')[1]) / 8);
  assert.equal(new Set(galleryState.children.slice(0, 16).map(expression)).size, 16);
  const shape = node => Number(node.children[0].attributes.href.split('#reader-')[1]) % 8;
  assert.ok(new Set(galleryState.children.slice(0, 16).map(shape)).size >= 4, 'expression diversity also preserves varied shapes');
  assert.equal(new Set(galleryState.children.map(node => node.attributes.style)).size, 200);
});

test('bounds decorative DOM during a crowd flood and recovers when readers leave', () => {
  const galleryState = gallery();
  const keys = Array.from({ length: 5000 }, (_, i) => `reader-${i}`);
  galleryState.update(keys);
  assert.equal(galleryState.children.length, MAX_READER_AVATARS);
  galleryState.update(keys.slice(500, 1100));
  assert.equal(galleryState.children.length, MAX_READER_AVATARS);
  galleryState.update(keys.slice(700, 702));
  assert.equal(galleryState.children.length, 2);
});

test('malicious keys cannot inject markup, CSS or an external SVG URL', () => {
  const galleryState = gallery();
  galleryState.update(['<img src=x onerror=alert(1)>', '__proto__', 'javascript:alert(1)', '"; background: url(https://evil.invalid)']);
  for (const node of galleryState.children) {
    assert.match(node.attributes.style, /^--reader-hue: [\d.]+$/);
    assert.match(node.children[0].attributes.href, /^\/_astro\/bloub\.svg#reader-\d{1,3}$/);
    assert.equal(node.children.length, 1);
  }
});
