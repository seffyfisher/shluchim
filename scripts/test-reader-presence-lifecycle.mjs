// Exercise production reader code with the pinned SDK and native Chromium
// lifecycle events. Only the Presence endpoint/key are replaced by a local
// protocol fixture; document.visibilityState and SDK methods stay untouched.
import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { resolve, sep, extname } from 'node:path';
import { gzipSync } from 'node:zlib';
import puppeteer from 'puppeteer-core';
import { WebSocketServer } from 'ws';

const dist = resolve(process.env.PRESENCE_TEST_DIST || 'dist');
const mime = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css', '.svg': 'image/svg+xml', '.woff2': 'font/woff2', '.webp': 'image/webp', '.png': 'image/png', '.jpg': 'image/jpeg' };
let base;
const server = createServer(async (req, res) => {
  try {
    const pathname = new URL(req.url, 'http://localhost').pathname;
    let bytes, extension;
    if (pathname === '/presence-test-left') {
      bytes = Buffer.from('<!doctype html><title>Left the reader page</title>'); extension = '.html';
    } else {
      const path = resolve(dist, `.${decodeURIComponent(pathname)}`, pathname.endsWith('/') ? 'index.html' : '');
      assert.ok(path.startsWith(dist + sep));
      bytes = await readFile(path); extension = extname(path);
      if (extension === '.html') {
        const html = bytes.toString();
        assert.ok(html.includes('data-online-readers'), 'build with online readers enabled');
        bytes = Buffer.from(html.replace(/data-url="[^"]+"/, `data-url="${base.replace('http:', 'ws:')}/realtime/v1"`).replace(/data-key="[^"]+"/, 'data-key="sb_publishable_test"'));
      }
    }
    res.setHeader('Content-Type', mime[extension] ?? 'application/octet-stream');
    if (['.html', '.js', '.css', '.svg'].includes(extension)) {
      res.setHeader('Content-Encoding', 'gzip'); bytes = gzipSync(bytes);
    }
    res.end(bytes);
  } catch { res.writeHead(404).end(); }
});
await new Promise(r => server.listen(0, '127.0.0.1', r));
base = `http://127.0.0.1:${server.address().port}`;
const wss = new WebSocketServer({ server }), sockets = new Set(), browsers = [], errors = [];
let sequence = 0;
const state = () => {
  const value = {};
  for (const ws of sockets) if (ws.tracked) {
    value[ws.key] ??= { metas: [] };
    value[ws.key].metas.push({ phx_ref: String(ws.id) });
  }
  return value;
};
const send = (ws, event, payload, ref = null) => {
  if (ws.readyState === 1) ws.send(JSON.stringify([ws.joinRef ?? null, ref, ws.topic ?? 'phoenix', event, payload]));
};
const broadcast = () => { for (const ws of sockets) if (ws.topic) send(ws, 'presence_state', state()); };
wss.on('connection', ws => {
  sockets.add(ws); ws.id = ++sequence;
  ws.on('message', bytes => {
    const [joinRef, ref, topic, event, payload] = JSON.parse(bytes.toString());
    if (event === 'phx_join') {
      ws.joinRef = joinRef; ws.topic = topic; ws.key = payload.config.presence.key;
      send(ws, 'phx_reply', { status: 'ok', response: { postgres_changes: [] } }, ref);
      send(ws, 'presence_state', state());
    } else if (event === 'presence' && payload.event === 'track') {
      ws.tracked = true; send(ws, 'phx_reply', { status: 'ok', response: {} }, ref); broadcast();
    } else if (event === 'phx_leave') {
      ws.tracked = false; send(ws, 'phx_reply', { status: 'ok', response: {} }, ref); broadcast();
    } else if (event === 'heartbeat') send(ws, 'phx_reply', { status: 'ok', response: {} }, ref);
  });
  ws.on('close', () => { sockets.delete(ws); broadcast(); });
});
const wait = async (predicate, message) => {
  const deadline = Date.now() + 20000;
  while (Date.now() < deadline) {
    if (await predicate()) return;
    await new Promise(r => setTimeout(r, 40));
  }
  assert.fail(`${message}: ${sockets.size} sockets, ${Object.keys(state()).length} browser keys`);
};
const count = (page, n) => page.waitForFunction(n => document.querySelector('[data-online-readers]')?.hasAttribute('data-ready') && document.querySelector('[data-readers-label]')?.textContent.startsWith(`${n} `), { timeout: 20000 }, n);
async function launch() {
  const args = ['--no-sandbox', '--disable-dev-shm-usage'];
  if (process.env.HTTPS_PROXY) args.push(`--proxy-server=${process.env.HTTPS_PROXY}`);
  const browser = await puppeteer.launch({ channel: 'chrome', ...(process.env.CHROME_PATH ? { executablePath: process.env.CHROME_PATH } : {}), headless: true, args });
  browsers.push(browser); return browser;
}
async function prepare(page) {
  page.on('pageerror', e => errors.push(e.message));
  await page.evaluateOnNewDocument(() => {
    window.presencePageShows = [];
    addEventListener('pageshow', e => window.presencePageShows.push(e.persisted));
  });
  await page.setViewport({ width: 390, height: 844 });
  const session = await page.createCDPSession();
  const { windowId } = await session.send('Browser.getWindowForTarget');
  return { page, session, windowId };
}
async function visibility(window, visible) {
  await window.session.send('Browser.setWindowBounds', { windowId: window.windowId, bounds: { windowState: visible ? 'normal' : 'minimized' } });
  if (visible) await window.page.bringToFront();
  await wait(() => window.page.evaluate(visible => document.visibilityState === (visible ? 'visible' : 'hidden'), visible), 'native window visibility did not change');
}
try {
  const a = await launch(), b = await launch();
  const first = await prepare(await a.newPage()), second = await prepare(await b.newPage());
  await Promise.all([first.page.goto(base + '/?presence-window=a'), second.page.goto(base + '/?presence-window=b')]);
  await Promise.all([visibility(first, true), visibility(second, true)]);
  await Promise.all([count(first.page, 2), count(second.page, 2)]);
  for (let i = 0; i < 3; i++) for (const [hidden, peer] of [[first, second], [second, first]]) {
    await visibility(hidden, false); await count(peer.page, 1);
    await wait(() => sockets.size === 1, 'hidden window retained its transport');
    await visibility(hidden, true); await Promise.all([count(first.page, 2), count(second.page, 2)]);
    await wait(() => sockets.size === 2, 'restore created an extra transport');
  }
  console.log('Two independent windows: three native minimize/restore cycles each, correct counts and socket totals');
  for (let i = 0; i < 2; i++) {
    await first.page.goto(base + '/presence-test-left'); await count(second.page, 1);
    await wait(() => sockets.size === 1, 'pagehide retained a frozen transport');
    await first.page.goBack({ waitUntil: 'load' });
    await Promise.all([count(first.page, 2), count(second.page, 2)]);
    assert.ok(await first.page.evaluate(() => window.presencePageShows.includes(true)), 'must exercise a real bfcache restore, not a fresh reload');
    await new Promise(r => setTimeout(r, 500));
    assert.equal(sockets.size, 2, 'bfcache restore must not reconnect a discarded transport');
  }
  await first.page.close(); await count(second.page, 1);
  await wait(() => sockets.size === 1, 'closing the first window retained its transport');
  await second.page.close(); await wait(() => sockets.size === 0, 'closing both windows retained transports');
  await Promise.all([a.close(), b.close()]);
  console.log('Navigation, two real bfcache restores and closing both windows: no orphan sockets or uncaught exceptions');

  const shared = await launch(), sharedFirst = await prepare(await shared.newPage());
  await sharedFirst.page.goto(base + '/?presence-window=shared-a'); await visibility(sharedFirst, true); await count(sharedFirst.page, 1);
  const session = await shared.target().createCDPSession(), marker = 'about:blank#presence-second-window';
  await session.send('Target.createTarget', { url: marker, newWindow: true });
  const target = await shared.waitForTarget(t => t.url() === marker), sharedSecond = await prepare(await target.page());
  await sharedSecond.page.goto(base + '/?presence-window=shared-b'); await visibility(sharedSecond, true);
  assert.equal(await sharedFirst.page.evaluate(() => document.visibilityState), 'visible');
  await Promise.all([count(sharedFirst.page, 1), count(sharedSecond.page, 1)]);
  await wait(() => sockets.size === 2, 'both same-browser windows must connect');
  assert.equal(Object.keys(state()).length, 1, 'same browser key must remain deduplicated');
  await sharedFirst.page.close(); await count(sharedSecond.page, 1);
  await wait(() => sockets.size === 1, 'closing one shared window retained its transport');
  await sharedSecond.page.close(); await wait(() => sockets.size === 0, 'closing the last shared window retained its transport');
  assert.deepEqual(errors, []);
  console.log('Two same-browser windows: one reader, clean closure of the first and last window');
} finally {
  await Promise.allSettled(browsers.map(browser => browser.close()));
  for (const ws of sockets) ws.terminate();
  await new Promise(r => wss.close(r)); await new Promise(r => server.close(r));
}
