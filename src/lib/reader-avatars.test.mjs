import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readerAvatars, MAX_READER_AVATARS } from './reader-avatars.ts';

function gallery() {
  const children = [];
  function node(name) {
    return { name, attributes: {}, children: [], setAttribute(key, value) { this.attributes[key] = value; }, append(child) { this.children.push(child); }, remove() { children.splice(children.indexOf(this), 1); } };
  }
  const doc = { createElementNS: (_, name) => node(name), createDocumentFragment: () => node('fragment') };
  const crowd = { ownerDocument: doc, append(fragment) { children.push(...fragment.children); } };
  return { children, ...readerAvatars(crowd, '/_astro/bloub.svg') };
}

const descendants = node => [node, ...node.children.flatMap(descendants)];
const face = node => descendants(node).find(node => node.name === 'use' && node.attributes.href.includes('#eye-')).attributes.href;

test('renders one coloured Bloub per browser, retains colours and nodes, and removes departed readers', () => {
  const galleryState = gallery();
  galleryState.update(['first', 'second', 'third']);
  assert.equal(galleryState.children.length, 3);
  assert.equal(new Set(galleryState.children.map(face)).size, 3);
  const colors = galleryState.children.map(node => node.attributes.style.split(';')[0]);
  assert.equal(new Set(colors).size, 3);
  const originals = [...galleryState.children];
  galleryState.update(['third', 'first', 'second']);
  assert.deepEqual(galleryState.children, originals, 'sync does not recreate faces or restart their motion');
  assert.deepEqual(galleryState.children.map(node => node.attributes.style.split(';')[0]), colors);
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
  assert.equal(new Set(galleryState.children.slice(0, 128).map(face)).size, 128);
  const variant = node => Number(face(node).split('#eye-')[1].split('-')[0]);
  const expression = node => Math.floor(variant(node) / 8);
  assert.equal(new Set(galleryState.children.slice(0, 16).map(expression)).size, 16);
  const shape = node => variant(node) % 8;
  assert.ok(new Set(galleryState.children.slice(0, 16).map(shape)).size >= 4, 'expression diversity also preserves varied shapes');
  assert.equal(new Set(galleryState.children.map(node => node.attributes.style.split(';')[0])).size, 200);
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
    const uses = descendants(node).filter(node => node.name === 'use');
    assert.equal(uses.length, 3);
    for (const use of uses) assert.match(use.attributes.href, /^\/_astro\/bloub\.svg#(?:body-[0-7]|eye-\d{1,3}-[01])$/);
    assert.match(uses[2].attributes.mask, /^url\(#online-reader-eyes-\d+\)$/);
  }
});

test('one observer gates motion to visible icons, pauses in the background, and releases removed icons and listeners', () => {
  let callback;
  const observed = new Set(), listeners = new Map(), timers = new Map();
  let time = 0, timerId = 0;
  const doc = {
    visibilityState: 'visible',
    defaultView: { performance: { now: () => time }, setTimeout: fn => { timers.set(++timerId, fn); return timerId; }, clearTimeout: id => timers.delete(id), IntersectionObserver: class {
      constructor(fn) { callback = fn; }
      observe(svg) { observed.add(svg); }
      unobserve(svg) { observed.delete(svg); }
      disconnect() { observed.clear(); }
    } },
    addEventListener: (name, fn) => listeners.set(name, fn),
    removeEventListener: (name, fn) => { assert.equal(listeners.get(name), fn); listeners.delete(name); },
    createElementNS: () => ({ attributes: {}, children: [],
      setAttribute(key, value) { this.attributes[key] = value; },
      removeAttribute(key) { delete this.attributes[key]; },
      toggleAttribute(key, on) { if (on) this.attributes[key] = ''; else delete this.attributes[key]; },
      append(child) { this.children.push(child); }, remove() {},
    }),
    createDocumentFragment: () => ({ append() {} }),
  };
  const avatars = readerAvatars({ ownerDocument: doc, append() {}, addEventListener() {}, removeEventListener() {} }, '/sprite.svg');
  avatars.update(Array.from({ length: 5000 }, (_, i) => `browser-${i}`));
  assert.equal(observed.size, MAX_READER_AVATARS);
  const [first, second, clipped] = observed;
  callback([{ target: first, isIntersecting: true }, { target: second, isIntersecting: true }, { target: clipped, isIntersecting: false }]);
  const isMoving = svg => 'data-moving' in svg.attributes;
  assert.deepEqual([first, second, clipped].map(isMoving), [true, true, false]);
  assert.equal(timers.size, 1, 'one shared timer, even for a large crowd');
  time = 3000;
  const [nextTick] = timers.values(); timers.clear(); nextTick();
  assert.ok('data-blinking' in first.attributes && 'data-blinking' in second.attributes);
  assert.equal(timers.size, 1);
  time = 3200;
  const [finishBlink] = timers.values(); timers.clear(); finishBlink();
  assert.ok(!('data-blinking' in first.attributes) && !('data-blinking' in second.attributes), 'finite gestures end without relying on SVG animation events');
  assert.equal(timers.size, 1);
  doc.visibilityState = 'hidden'; listeners.get('visibilitychange')();
  assert.deepEqual([first, second].map(isMoving), [false, false]);
  assert.equal(timers.size, 0, 'background motion has no active timer');
  doc.visibilityState = 'visible'; listeners.get('visibilitychange')();
  assert.deepEqual([first, second].map(isMoving), [true, true]);
  avatars.update([]);
  assert.equal(observed.size, 0);
  callback([{ target: clipped, isIntersecting: true }]);
  assert.equal(isMoving(clipped), false, 'a queued callback cannot revive a departed reader');
  avatars.update(['new']);
  const [next] = observed;
  callback([{ target: next, isIntersecting: true }]);
  const [staleTick] = timers.values();
  avatars.dispose();
  assert.equal(observed.size, 0);
  assert.equal(listeners.size, 0);
  assert.equal(timers.size, 0);
  assert.equal(isMoving(next), false);
  callback([{ target: next, isIntersecting: true }]);
  staleTick();
  assert.equal(isMoving(next), false, 'a queued callback cannot revive a disposed gallery');
  assert.equal(timers.size, 0);
});
