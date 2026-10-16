import { test } from 'node:test';
import assert from 'node:assert';
import vm from 'node:vm';
import { gtagSnippet } from './analytics.ts';

const ID = 'G-TEST123';

/** Runs the snippet in a stub browser and records what it does. */
function run({ readyState = 'loading', idle = true, id = ID } = {}) {
  const appended = [], listeners = {}, interactionListeners = {}, idleQueue = [], timers = [];
  const win = {
    document: { readyState, head: { appendChild: (el) => appended.push(el) }, createElement: () => ({}),
      addEventListener: (type, fn, opts) => { interactionListeners[type] = { fn, opts }; } },
    addEventListener: (type, fn) => { listeners[type] = fn; },
    setTimeout: (fn, ms) => timers.push({ fn, ms }),
  };
  if (idle) win.requestIdleCallback = (fn, opts) => idleQueue.push({ fn, opts });
  win.window = win;
  vm.runInNewContext(gtagSnippet(id), Object.assign(win, { document: win.document, encodeURIComponent, Date }));
  return { win, appended, listeners, interactionListeners, idleQueue, timers };
}

test('gtag.js is not requested while the page is loading', () => {
  const { appended, listeners, idleQueue, timers } = run();
  assert.equal(appended.length, 0);
  assert.equal(idleQueue.length, 0);
  assert.equal(timers.length, 0);
  assert.equal(typeof listeners.load, 'function', 'waits for the load event');
});

test('after load it waits five seconds and then an idle moment before requesting gtag.js', () => {
  const { appended, listeners, idleQueue, timers } = run();
  listeners.load();
  assert.equal(appended.length, 0, 'nothing is appended straight from the load event');
  assert.equal(timers.length, 1);
  assert.equal(timers[0].ms, 5000);
  assert.equal(idleQueue.length, 0);
  timers[0].fn();
  assert.equal(idleQueue.length, 1);
  assert.equal(idleQueue[0].opts?.timeout, undefined, 'never forces the download into a busy interval');
  idleQueue[0].fn();
  assert.equal(appended.length, 1);
  assert.equal(appended[0].async, true);
  assert.equal(appended[0].fetchPriority, 'low');
  assert.equal(appended[0].src, `https://www.googletagmanager.com/gtag/js?id=${ID}`);
});

test('without requestIdleCallback it falls back to a timer, not to loading at once', () => {
  const { appended, listeners, timers } = run({ idle: false });
  listeners.load();
  assert.equal(appended.length, 0);
  assert.equal(timers.length, 1);
  assert.equal(timers[0].ms, 5000);
  timers[0].fn();
  assert.equal(timers.length, 2);
  assert.ok(timers[1].ms >= 1000);
  timers[1].fn();
  assert.equal(appended.length, 1);
});

test('a page that is already complete schedules the settling period without waiting for load', () => {
  const { appended, listeners, idleQueue, timers } = run({ readyState: 'complete' });
  assert.equal(listeners.load, undefined);
  assert.equal(appended.length, 0);
  assert.equal(timers.length, 1);
  timers[0].fn();
  assert.equal(idleQueue.length, 1);
});

test('the dataLayer is queued up front with real arguments objects, in the order gtag.js expects', () => {
  const { win } = run();
  const q = win.dataLayer.map((a) => Array.from(a));
  assert.equal(q.length, 2);
  assert.equal(q[0][0], 'js'); assert.ok(q[0][1] instanceof Date);
  assert.equal(q[1][0], 'config');
  assert.equal(q[1][1], ID);
  assert.equal(typeof win.gtag, 'function', 'window.gtag stays available for custom events');
  win.gtag('event', 'x');
  assert.deepEqual(Array.from(win.dataLayer[2]), ['event', 'x']);
});

test('advertising identifiers and personalization are disabled before gtag.js loads', () => {
  const { win, appended } = run();
  const config = win.dataLayer.find((a) => a[0] === 'config')[2];
  assert.equal(config?.allow_google_signals, false);
  assert.equal(config?.allow_ad_personalization_signals, false);
  assert.equal(appended.length, 0);
});

test('a repeated load notification cannot request the library twice', () => {
  const { appended, listeners, idleQueue, timers } = run();
  listeners.load();
  listeners.load();
  assert.equal(timers.length, 1);
  timers[0].fn();
  for (const task of idleQueue) task.fn();
  assert.equal(appended.length, 1);
});

test('the ID can never close the script tag', () => {
  assert.ok(!gtagSnippet('</script><script>alert(1)</script>').includes('</script>'));
});

test('interaction tracking starts only after load, settling and idle, with passive delegated handlers', () => {
  const { listeners, interactionListeners, timers, idleQueue } = run();
  assert.equal(Object.keys(interactionListeners).length, 0);
  listeners.load();
  timers[0].fn();
  assert.equal(Object.keys(interactionListeners).length, 0);
  idleQueue[0].fn();
  assert.deepEqual(Object.keys(interactionListeners).sort(), ['analytics:result', 'change', 'click', 'ended', 'play', 'submit']);
  for (const handler of Object.values(interactionListeners)) {
    assert.equal(handler.opts.passive, true);
    assert.equal(handler.opts.capture, true);
  }
});
