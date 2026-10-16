import { test } from 'node:test';
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { mountOnlineReaders } from './presence.ts';

function browser({ readyState = 'loading', idle = true, visible = true, storage = new Map(), lang = 'he', loader } = {}) {
  const timers = new Map(), idleTasks = new Map(), clients = [], imports = [];
  let sequence = 0;
  const win = Object.assign(new EventTarget(), {
    navigator: { onLine: true }, crypto: { randomUUID },
    localStorage: { getItem: (key) => storage.get(key), setItem: (key, value) => storage.set(key, value) },
    setTimeout: (fn, ms) => { const id = ++sequence; timers.set(id, { fn, ms }); return id; },
    clearTimeout: (id) => timers.delete(id),
  });
  if (idle) {
    win.requestIdleCallback = (fn, options) => { const id = ++sequence; idleTasks.set(id, { fn, options }); return id; };
    win.cancelIdleCallback = (id) => idleTasks.delete(id);
  }
  const doc = Object.assign(new EventTarget(), { defaultView: win, readyState, visibilityState: visible ? 'visible' : 'hidden' });
  const attrs = new Map(), label = { textContent: '' };
  const element = {
    ownerDocument: doc,
    dataset: { url: 'wss://example.supabase.co/realtime/v1', key: 'sb_publishable_test', lang },
    querySelector: (selector) => selector === '[data-readers-label]' ? label : null,
    setAttribute: (key, value) => attrs.set(key, value),
    removeAttribute: (key) => attrs.delete(key),
  };
  class RealtimeClient {
    constructor(url, options) { Object.assign(this, { url, options, state: {}, tracks: [], closed: 0, removed: 0, trackResult: 'ok' }); clients.push(this); }
    channel(name, options) {
      this.name = name; this.config = options.config;
      const channel = {
        on: (_type, _filter, fn) => { this.sync = fn; return channel; },
        subscribe: (fn) => { this.status = fn; return channel; },
        presenceState: () => this.state,
        track: async (payload) => { this.tracks.push(payload); return this.trackResult; },
      };
      return channel;
    }
    async removeAllChannels() { this.removed++; }
    async disconnect() { this.closed++; }
  }
  const cleanup = mountOnlineReaders(element, () => { imports.push(true); return loader ? loader() : Promise.resolve({ RealtimeClient }); });
  const fire = (target, type) => target.dispatchEvent(new Event(type));
  const flush = async () => { await Promise.resolve(); await Promise.resolve(); };
  const delay = (ms) => {
    const entry = [...timers].find(([, timer]) => timer.ms === ms);
    assert.ok(entry, `expected ${ms}ms timer`);
    timers.delete(entry[0]); entry[1].fn();
  };
  const runIdle = async () => {
    for (const [id, task] of idleTasks) { idleTasks.delete(id); task.fn(); }
    await flush();
  };
  const start = async () => { if (idle) await runIdle(); else { delay(3000); await flush(); } };
  const presence = async (others = {}, ownTabs = 1) => {
    const client = clients.at(-1);
    client.state = { ...others, ...(ownTabs ? { [client.config.presence.key]: Array.from({ length: ownTabs }, () => ({})) } : {}) };
    await client.status('SUBSCRIBED'); client.sync();
    return client;
  };
  return { win, doc, attrs, label, imports, clients, timers, idleTasks, cleanup, fire, delay, runIdle, start, presence, flush };
}

test('after the delayed entry loads, waits for idle before importing the SDK, without a timeout', async () => {
  const b = browser();
  assert.equal(b.imports.length, 0);
  assert.equal(b.timers.size, 0);
  assert.equal([...b.idleTasks.values()][0].options, undefined);
  await b.runIdle();
  assert.equal(b.clients.length, 1);
  assert.equal(b.attrs.has('data-ready'), false, 'no guessed count before a successful sync');
});

test('without requestIdleCallback the deferred entry waits another three seconds before the SDK', async () => {
  const b = browser({ readyState: 'complete', idle: false });
  assert.equal(b.imports.length, 0);
  b.delay(3000); await b.flush();
  assert.equal(b.clients.length, 1);
});

test('counts browsers rather than per-tab presence entries, across one shared channel', async () => {
  const b = browser(); await b.start();
  const client = await b.presence({ other: [{}, {}] }, 2);
  assert.equal(client.name, 'shluchim-online');
  assert.equal(client.config.presence.enabled, true);
  assert.deepEqual(client.tracks, [{}], 'sends no personal data or paths');
  assert.equal(b.label.textContent, '2 קוראים כאן עכשיו');
  assert.equal(b.attrs.has('data-ready'), true);
  client.state = { [client.config.presence.key]: [{}] }; client.sync();
  assert.equal(b.label.textContent, '1 קורא כאן עכשיו');
});

test('English uses the same channel and handles singular and plural', async () => {
  const b = browser({ lang: 'en' }); await b.start();
  const client = await b.presence();
  assert.equal(client.name, 'shluchim-online');
  assert.equal(b.label.textContent, '1 reader here now');
  client.state.other = [{}]; client.sync();
  assert.equal(b.label.textContent, '2 readers here now');
});

test('waits for our presence, hides a lost connection, and tracks again on rejoin', async () => {
  const b = browser(); await b.start();
  const client = await b.presence({ other: [{}] }, 0);
  assert.equal(b.attrs.has('data-ready'), false);
  client.state[client.config.presence.key] = [{}]; client.sync();
  assert.equal(b.attrs.has('data-ready'), true);
  await client.status('CHANNEL_ERROR');
  assert.equal(b.attrs.has('data-ready'), false);
  client.sync(); assert.equal(b.attrs.has('data-ready'), false, 'stale sync cannot restore the count');
  await client.status('SUBSCRIBED');
  assert.equal(client.tracks.length, 2);
  assert.equal(b.attrs.has('data-ready'), true);
  client.trackResult = 'timed out'; await client.status('SUBSCRIBED');
  assert.equal(b.attrs.has('data-ready'), false);
});

test('does not load in the background; disconnects when hidden and reconnects when visible', async () => {
  const b = browser({ visible: false }); await b.start();
  assert.equal(b.imports.length, 0);
  b.doc.visibilityState = 'visible'; b.fire(b.doc, 'visibilitychange'); await b.runIdle();
  const client = await b.presence();
  b.doc.visibilityState = 'hidden'; b.fire(b.doc, 'visibilitychange');
  assert.equal(client.closed, 1); assert.equal(client.removed, 1);
  assert.equal(b.attrs.has('data-ready'), false);
  b.doc.visibilityState = 'visible'; b.fire(b.doc, 'visibilitychange'); await b.runIdle();
  assert.equal(b.clients.length, 2);
  assert.equal(b.clients[1].config.presence.key, client.config.presence.key);
  client.sync(); assert.equal(b.attrs.has('data-ready'), false, 'ignores callbacks from the old socket');
});

test('an old tracking acknowledgement cannot reveal a count after the connection fails', async () => {
  const b = browser(); await b.start();
  const client = await b.presence();
  let acknowledge;
  client.trackResult = new Promise(resolve => { acknowledge = resolve; });
  const pending = client.status('SUBSCRIBED');
  await client.status('CHANNEL_ERROR');
  acknowledge('ok'); await pending;
  client.sync();
  assert.equal(b.attrs.has('data-ready'), false);
});

test('offline and bfcache navigation close the socket and resume only when active', async () => {
  const b = browser(); await b.start(); await b.presence();
  b.win.navigator.onLine = false; b.fire(b.win, 'offline');
  assert.equal(b.attrs.has('data-ready'), false);
  b.win.navigator.onLine = true; b.fire(b.win, 'online'); await b.runIdle();
  await b.presence();
  b.fire(b.win, 'pagehide');
  assert.equal(b.clients.at(-1).closed, 1);
  b.fire(b.win, 'pageshow'); await b.runIdle();
  assert.equal(b.clients.length, 3);
  b.cleanup(); b.fire(b.win, 'pageshow'); await b.runIdle();
  assert.equal(b.clients.length, 3, 'cleanup removes all scheduling listeners');
});

test('tabs in one browser reuse the same random key; blocked storage still works', async () => {
  const storage = new Map();
  const a = browser({ storage }), b = browser({ storage });
  await a.start(); await b.start();
  assert.equal(a.clients[0].config.presence.key, b.clients[0].config.presence.key);
  const blocked = browser({ storage: { get: () => { throw new Error('blocked'); } } });
  await blocked.start(); await blocked.presence();
  assert.equal(blocked.attrs.has('data-ready'), true);
});

test('a delayed import cannot open a connection after the page is hidden', async () => {
  let resolveImport;
  const b = browser({ loader: () => new Promise((resolve) => { resolveImport = resolve; }) });
  await b.start();
  b.doc.visibilityState = 'hidden'; b.fire(b.doc, 'visibilitychange');
  resolveImport({ RealtimeClient: class { constructor() { assert.fail('opened a background socket'); } } });
  await b.flush();
  assert.equal(b.attrs.has('data-ready'), false);
});

test('a failed SDK download stays hidden and creates no unhandled rejection', async () => {
  const b = browser({ loader: () => Promise.reject(new Error('network')) });
  await b.start();
  assert.equal(b.clients.length, 0);
  assert.equal(b.attrs.has('data-ready'), false);
});
