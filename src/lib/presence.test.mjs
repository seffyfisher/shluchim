import { test } from 'node:test';
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { spawnSync } from 'node:child_process';
import { mountOnlineReaders } from './presence.ts';

const OTHER = '00000000-0000-4000-8000-000000000001';

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
  const overflow = { hidden: true, textContent: '', attributes: {}, setAttribute(key, value) { this.attributes[key] = value; } };
  const element = {
    ownerDocument: doc,
    dataset: { url: 'wss://example.supabase.co/realtime/v1', key: 'sb_publishable_test', lang },
    querySelector: (selector) => selector === '[data-readers-label]' ? label : selector === '[data-readers-overflow]' ? overflow : null,
    setAttribute: (key, value) => attrs.set(key, value),
    removeAttribute: (key) => attrs.delete(key),
  };
  class RealtimeClient {
    constructor(url, options) { Object.assign(this, { url, options, state: {}, tracks: [], closed: 0, removed: 0, channelCalls: 0, trackResult: 'ok' }); clients.push(this); }
    channel(name, options) {
      this.channelCalls++;
      this.name = name; this.config = options.config;
      const channel = {
        on: (_type, _filter, fn) => { this.sync = fn; return channel; },
        subscribe: (fn) => { this.status = fn; return channel; },
        presenceState: () => this.state,
        track: async (payload) => { this.tracks.push(payload); return this.trackResult; },
      };
      return channel;
    }
    async removeAllChannels() { this.removed++; return this.cleanupResult; }
    async disconnect() { this.closed++; return this.disconnectResult; }
  }
  const cleanup = mountOnlineReaders(element, () => { imports.push(true); return loader ? loader() : Promise.resolve({ RealtimeClient }); });
  const fire = (target, type) => target.dispatchEvent(new Event(type));
  const flush = () => new Promise(resolve => setImmediate(resolve));
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
  return { win, doc, attrs, label, overflow, imports, clients, timers, idleTasks, cleanup, fire, delay, runIdle, start, presence, flush };
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
  const client = await b.presence({ [OTHER]: [{}, {}] }, 2);
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
  client.state[OTHER] = [{}]; client.sync();
  assert.equal(b.label.textContent, '2 readers here now');
});

test('waits for our presence, hides a lost connection, and tracks again on rejoin', async () => {
  const b = browser(); await b.start();
  const client = await b.presence({ [OTHER]: [{}] }, 0);
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
  const oldSync = client.sync;
  b.doc.visibilityState = 'hidden'; b.fire(b.doc, 'visibilitychange');
  assert.equal(client.closed, 1); assert.equal(client.removed, 1);
  assert.equal(b.attrs.has('data-ready'), false);
  b.doc.visibilityState = 'visible'; b.fire(b.doc, 'visibilitychange'); await b.runIdle();
  assert.equal(b.clients.length, 1, 'reuse the SDK client and its page lifecycle hooks');
  assert.equal(client.channelCalls, 2);
  oldSync(); assert.equal(b.attrs.has('data-ready'), false, 'ignores callbacks from the old channel');
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
  const closes = b.clients[0].closed;
  b.fire(b.win, 'pagehide');
  assert.equal(b.clients.at(-1).closed, closes + 1);
  b.fire(b.win, 'pageshow'); await b.runIdle();
  assert.equal(b.clients.length, 1);
  assert.equal(b.clients[0].channelCalls, 3);
  b.cleanup(); b.fire(b.win, 'pageshow'); await b.runIdle();
  assert.equal(b.clients[0].channelCalls, 3, 'cleanup removes all scheduling listeners');
});

test('waits for transport and channel cleanup before reusing the client', async () => {
  for (const field of ['disconnectResult', 'cleanupResult']) {
    const b = browser(); await b.start(); const client = await b.presence();
    let finish;
    client[field] = new Promise(resolve => { finish = resolve; });
    b.doc.visibilityState = 'hidden'; b.fire(b.doc, 'visibilitychange');
    b.doc.visibilityState = 'visible'; b.fire(b.doc, 'visibilitychange'); await b.runIdle();
    assert.equal(client.channelCalls, 1, `${field} still pending: do not add a channel that old cleanup could disconnect`);
    finish(); await b.flush();
    assert.equal(b.clients.length, 1);
    assert.equal(client.channelCalls, 2);
    b.cleanup(); await b.flush();
  }
});

test('becoming hidden while cleanup is pending cancels the queued resume', async () => {
  const b = browser(); await b.start(); const client = await b.presence();
  let finish;
  client.cleanupResult = new Promise(resolve => { finish = resolve; });
  b.doc.visibilityState = 'hidden'; b.fire(b.doc, 'visibilitychange');
  b.doc.visibilityState = 'visible'; b.fire(b.doc, 'visibilitychange'); await b.runIdle();
  b.doc.visibilityState = 'hidden'; b.fire(b.doc, 'visibilitychange');
  finish(); await b.flush();
  assert.equal(client.channelCalls, 1);
  assert.equal(b.attrs.has('data-ready'), false);
  b.doc.visibilityState = 'visible'; b.fire(b.doc, 'visibilitychange'); await b.runIdle();
  assert.equal(client.channelCalls, 2);
  assert.equal(b.clients.length, 1);
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

test('rejects hostile channel keys and ignores their payloads, while disclosing avatar overflow', async () => {
  const b = browser(); await b.start();
  const hostile = JSON.parse('{"__proto__":[{"polluted":true}],"constructor":[{}],"<img src=x onerror=alert(1)>":[{}]}');
  hostile['x'.repeat(100000)] = [{}];
  const readers = Object.fromEntries(Array.from({ length: 1000 }, (_, i) => [`00000000-0000-4000-8000-${String(i).padStart(12, '0')}`, [{ page: '/secret', html: '<script>alert(1)</script>' }]]));
  const client = await b.presence({ ...hostile, ...readers });
  assert.equal(b.label.textContent, '1,001 קוראים כאן עכשיו');
  assert.equal(b.overflow.hidden, false);
  assert.equal(b.overflow.textContent, '+501');
  assert.equal(Object.prototype.polluted, undefined);
  client.state = { [client.config.presence.key]: [{}] }; client.sync();
  assert.equal(b.overflow.hidden, true);
  assert.equal(b.overflow.textContent, '');
});

test('replaces legacy or malformed stored IDs and rotates the public ID on a new UTC day', async ({ mock }) => {
  mock.timers.enable({ apis: ['Date'], now: Date.UTC(2026, 9, 16, 12) });
  for (const stored of [OTHER, '2026-10-16:------------------------------------', `2026-10-15:${OTHER}`]) {
    const storage = new Map([['shluchim-presence-id', stored]]);
    const b = browser({ storage }); await b.start();
    assert.notEqual(b.clients[0].config.presence.key, OTHER);
    assert.match(storage.get('shluchim-presence-id'), /^2026-10-16:[\da-f-]{36}$/);
    b.cleanup();
  }
  const storage = new Map();
  const first = browser({ storage }); await first.start();
  const sameDay = browser({ storage }); await sameDay.start();
  assert.equal(first.clients[0].config.presence.key, sameDay.clients[0].config.presence.key);
  mock.timers.tick(24 * 60 * 60 * 1000);
  const tomorrow = browser({ storage }); await tomorrow.start();
  assert.notEqual(first.clients[0].config.presence.key, tomorrow.clients[0].config.presence.key);
  assert.match(storage.get('shluchim-presence-id'), /^2026-10-17:/);
  first.cleanup(); sameDay.cleanup(); tomorrow.cleanup();
});

test('build configuration rejects secret/service-role/JWT keys and accepts disable or publishable', () => {
  for (const key of ['sb_secret_security_test', 'service_role', 'eyJhbGciOiJIUzI1NiJ9.test.signature', '', 'sb_publishable_security_test']) {
    const result = spawnSync(process.execPath, ['--experimental-strip-types', '--no-warnings', '--input-type=module', '-e', `await import(${JSON.stringify(new URL('../config.ts', import.meta.url).href)})`], {
      env: { ...process.env, PRESENCE_PUBLISHABLE_KEY: key }, encoding: 'utf8',
    });
    assert.ifError(result.error);
    assert.equal(result.status, key === '' || key.startsWith('sb_publishable_') ? 0 : 1);
    if (result.status) assert.match(result.stderr, /must be a public sb_publishable_ key/);
  }
});
