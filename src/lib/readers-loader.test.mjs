import { test } from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import { readersLoader, deferReadersHtml } from './readers-loader.mjs';

const URL = '/_astro/OnlineReaders.astro_astro_type_script_index_0_lang.hash.js';
function browser({ readyState = 'loading', idle = true, visible = true } = {}) {
  const appended = [], timers = [], tasks = [], events = {}, documentEvents = {};
  const doc = {
    readyState, visibilityState: visible ? 'visible' : 'hidden',
    head: { appendChild: script => appended.push(script) }, createElement: () => ({}),
    addEventListener: (name, fn) => { documentEvents[name] = fn; },
    removeEventListener: name => { delete documentEvents[name]; },
  };
  const win = {
    document: doc, navigator: { onLine: true },
    setTimeout: (fn, ms) => timers.push({ fn, ms }),
    addEventListener: (name, fn) => { events[name] = fn; },
    removeEventListener: name => { delete events[name]; },
  };
  if (idle) win.requestIdleCallback = (fn, options) => tasks.push({ fn, options });
  win.window = win;
  vm.runInNewContext(readersLoader(URL), win);
  return { appended, timers, tasks, events, documentEvents, doc, win };
}

test('the entire module waits for load, half a second and idle before any script download', () => {
  const b = browser();
  assert.equal(b.appended.length, 0); assert.equal(b.timers.length, 0);
  b.events.load();
  assert.equal(b.timers[0].ms, 500); assert.equal(b.appended.length, 0);
  b.timers[0].fn();
  assert.equal(b.tasks[0].options, undefined); assert.equal(b.appended.length, 0);
  b.tasks[0].fn();
  assert.equal(b.appended.length, 1);
  assert.deepEqual(b.appended[0], { type: 'module', src: URL, fetchPriority: 'low' });
  b.tasks[0].fn(); assert.equal(b.appended.length, 1);
});

test('already-loaded browsers without idle callbacks use delayed timers', () => {
  const b = browser({ readyState: 'complete', idle: false });
  assert.equal(b.timers[0].ms, 500);
  b.timers[0].fn(); assert.equal(b.timers[1].ms, 250);
  assert.equal(b.appended.length, 0);
  b.timers[1].fn(); assert.equal(b.appended.length, 1);
});

test('hidden/offline pages wait, and loading starts when visible and online', () => {
  const b = browser({ readyState: 'complete', visible: false });
  b.timers[0].fn(); assert.equal(b.tasks.length, 0);
  b.doc.visibilityState = 'visible'; b.win.navigator.onLine = false;
  b.documentEvents.visibilitychange(); assert.equal(b.tasks.length, 0);
  b.win.navigator.onLine = true; b.events.online(); assert.equal(b.tasks.length, 1);
  b.tasks[0].fn(); assert.equal(b.appended.length, 1);
});

test('build hook replaces only the Presence entry with a loader and fails if Astro changes its tag', () => {
  const script = `<script type="module" src="${URL}"></script>`;
  const html = `<section data-online-readers></section>${script}<script type="module" src="/unrelated.js"></script>`;
  const deferred = deferReadersHtml(html);
  assert.ok(!deferred.includes(script));
  assert.ok(deferred.includes(readersLoader(URL)));
  assert.ok(deferred.includes('<script type="module" src="/unrelated.js"></script>'));
  assert.equal(deferReadersHtml(script), '', 'no loading code on pages without the feature');
  assert.throws(() => deferReadersHtml('<section data-online-readers></section>'), /cannot guarantee deferred loading/);
  assert.ok(!readersLoader('</script>').includes('</script>'));
});
