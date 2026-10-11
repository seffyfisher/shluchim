import { test } from 'node:test';
import assert from 'node:assert';
import vm from 'node:vm';
import { gtagSnippet } from './analytics.ts';

const ID = 'G-TEST123';

/** Runs the snippet in a stub browser and records what it does. */
function run({ readyState = 'loading', idle = true, id = ID } = {}) {
  const appended = [], listeners = {}, idleQueue = [], timers = [];
  const win = {
    document: { readyState, head: { appendChild: (el) => appended.push(el) }, createElement: () => ({}) },
    addEventListener: (type, fn) => { listeners[type] = fn; },
    setTimeout: (fn, ms) => timers.push({ fn, ms }),
  };
  if (idle) win.requestIdleCallback = (fn, opts) => idleQueue.push({ fn, opts });
  win.window = win;
  vm.runInNewContext(gtagSnippet(id), Object.assign(win, { document: win.document, encodeURIComponent, Date }));
  return { win, appended, listeners, idleQueue, timers };
}

test('gtag.js is not requested while the page is loading', () => {
  const { appended, listeners, idleQueue, timers } = run();
  assert.equal(appended.length, 0);
  assert.equal(idleQueue.length, 0);
  assert.equal(timers.length, 0);
  assert.equal(typeof listeners.load, 'function', 'waits for the load event');
});

test('after load it still waits for an idle moment, then appends one async script', () => {
  const { appended, listeners, idleQueue } = run();
  listeners.load();
  assert.equal(appended.length, 0, 'nothing is appended straight from the load event');
  assert.equal(idleQueue.length, 1);
  assert.ok(idleQueue[0].opts.timeout >= 1000, 'bounded wait so a busy page still reports');
  idleQueue[0].fn();
  assert.equal(appended.length, 1);
  assert.equal(appended[0].async, true);
  assert.equal(appended[0].src, `https://www.googletagmanager.com/gtag/js?id=${ID}`);
});

test('without requestIdleCallback it falls back to a timer, not to loading at once', () => {
  const { appended, listeners, timers } = run({ idle: false });
  listeners.load();
  assert.equal(appended.length, 0);
  assert.equal(timers.length, 1);
  assert.ok(timers[0].ms >= 1000);
  timers[0].fn();
  assert.equal(appended.length, 1);
});

test('a page that is already complete schedules the idle load without waiting for load', () => {
  const { appended, listeners, idleQueue } = run({ readyState: 'complete' });
  assert.equal(listeners.load, undefined);
  assert.equal(appended.length, 0);
  assert.equal(idleQueue.length, 1);
});

test('the dataLayer is queued up front with real arguments objects, in the order gtag.js expects', () => {
  const { win } = run();
  const q = win.dataLayer.map((a) => Array.from(a));
  assert.equal(q.length, 2);
  assert.equal(q[0][0], 'js'); assert.ok(q[0][1] instanceof Date);
  assert.deepEqual(q[1], ['config', ID]);
  assert.equal(typeof win.gtag, 'function', 'window.gtag stays available for custom events');
  win.gtag('event', 'x');
  assert.deepEqual(Array.from(win.dataLayer[2]), ['event', 'x']);
});

test('the ID can never close the script tag', () => {
  assert.ok(!gtagSnippet('</script><script>alert(1)</script>').includes('</script>'));
});
