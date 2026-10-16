// Exercise production reader code with the pinned SDK and native Chromium
// lifecycle events. Only the Presence endpoint/key are replaced by a local
// protocol fixture; document.visibilityState and SDK methods stay untouched.
import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { readFile, mkdir, writeFile } from 'node:fs/promises';
import { resolve, sep, extname } from 'node:path';
import { gzipSync } from 'node:zlib';
import puppeteer from 'puppeteer-core';
import { WebSocketServer } from 'ws';
import sharp from 'sharp';

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
let injected = Object.create(null);
const state = () => {
  const value = Object.assign(Object.create(null), injected);
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
const count = (page, n) => page.waitForFunction(n => document.querySelector('[data-online-readers]')?.hasAttribute('data-ready') && document.querySelector('[data-readers-label]')?.textContent.startsWith(`${n.toLocaleString('he-IL')} `), { timeout: 20000 }, n);
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
    const observer = new MutationObserver(() => {
      if (!document.querySelector('[data-online-readers]')?.hasAttribute('data-ready')) return;
      window.presenceFirstReadyMs = performance.now() - performance.getEntriesByType('navigation')[0].loadEventEnd;
      observer.disconnect();
    });
    observer.observe(document, { subtree: true, attributes: true, attributeFilter: ['data-ready'] });
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
  const initialTiming = await Promise.all([first.page, second.page].map(page => page.evaluate(() => window.presenceFirstReadyMs)));
  assert.ok(initialTiming.every(ms => ms >= 450 && ms < 3000), `count short visits after load: ${initialTiming.join(', ')}ms`);
  console.log(`Initial reader sync after load: ${initialTiming.map(ms => Math.round(ms)).join(', ')}ms; both visible within a three-second visit`);
  await first.page.waitForFunction(() => document.querySelector('[data-readers-crowd] [data-blinking]'), { timeout: 5000 });
  const automaticBlink = await first.page.$('[data-readers-crowd] [data-blinking]');
  await first.page.waitForFunction(svg => !svg.hasAttribute('data-blinking'), { timeout: 1000 }, automaticBlink);
  // Pixel checks catch missing SVG eye holes and inert animations; checking
  // only CSS/DOM would accept a moving mask that never reaches the body.
  injected = Object.fromEntries(Array.from({ length: 16 }, (_, i) => [`00000000-0000-4000-8000-${String(i).padStart(12, '0')}`, { metas: [{ phx_ref: `face-${i}` }] }]));
  broadcast(); await count(first.page, 18);
  const bandHeight = await first.page.$eval('[data-online-readers]', el => el.getBoundingClientRect().height);
  const face = (await first.page.evaluateHandle(() => {
    const original = [...document.querySelectorAll('[data-readers-crowd] use')].find(use => /#eye-(?:1[6-9]|2[0-3])-0$/.test(use.getAttribute('href')))?.closest('svg');
    if (!original) return null;
    // Seek CSS on a copy so the real idle scheduler cannot end the gesture
    // while screenshots are captured. Both use the production SVG and CSS.
    const copy = original.cloneNode(true), mask = copy.querySelector('mask');
    mask.id += '-pixel-test';
    copy.querySelector(':scope > use').setAttribute('mask', `url(#${mask.id})`);
    copy.setAttribute('data-moving', '');
    original.parentElement.append(copy);
    return copy;
  })).asElement();
  assert.ok(face, 'the crowd includes the upstream surprised expression');
  await face.scrollIntoView();
  await first.page.waitForFunction(svg => svg.hasAttribute('data-moving'), {}, face);
  await face.evaluate(svg => { svg.setAttribute('data-blinking', ''); svg.setAttribute('data-looking', ''); for (const animation of svg.getAnimations({ subtree: true })) {
    animation.pause(); animation.effect.updateTiming({ delay: 0 }); animation.currentTime = 0;
  } });
  const open = await face.screenshot();
  await face.evaluate(svg => { for (const animation of svg.getAnimations({ subtree: true })) {
    if (animation.animationName === 'reader-blink') animation.currentTime = Number(animation.effect.getTiming().duration) * .45;
  } });
  const blink = await face.screenshot();
  await face.evaluate(svg => { for (const animation of svg.getAnimations({ subtree: true })) {
    animation.currentTime = animation.animationName === 'reader-gaze' ? Number(animation.effect.getTiming().duration) * .26 : 0;
  } });
  const gaze = await face.screenshot();
  const mask = await face.$eval(':scope > use', use => { const mask = use.getAttribute('mask'); use.removeAttribute('mask'); return mask; });
  const solid = await face.screenshot();
  await face.$eval(':scope > use', (use, mask) => use.setAttribute('mask', mask), mask);
  const pixels = async buffer => sharp(buffer).removeAlpha().raw().toBuffer();
  const [openPixels, blinkPixels, gazePixels, solidPixels] = await Promise.all([open, blink, gaze, solid].map(pixels));
  const difference = (a, b) => a.reduce((sum, value, i) => sum + Math.abs(value - b[i]), 0);
  const eyes = difference(openPixels, solidPixels), closedEyes = difference(blinkPixels, solidPixels);
  assert.ok(eyes > 1000, `open eye holes must be visible, pixel difference ${eyes}`);
  assert.ok(closedEyes < eyes * .4, `a blink closes the holes: ${closedEyes} vs ${eyes}`);
  assert.ok(difference(openPixels, gazePixels) > 500, 'the eyes change their gaze, beyond a CSS declaration');
  await first.page.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'reduce' }]);
  await first.page.waitForFunction(() => !document.getAnimations().some(a => a.animationName?.startsWith('reader-')));
  const reducedPixels = await pixels(await face.screenshot());
  assert.ok(difference(reducedPixels, solidPixels) > 1000, 'reduced motion preserves open, visible eyes');
  await face.evaluate(svg => svg.remove());
  await mkdir('preview-shots', { recursive: true });
  await Promise.all([writeFile('preview-shots/reader-eyes-open.png', open), writeFile('preview-shots/reader-eyes-blink.png', blink)]);
  await first.page.$eval('[data-readers-crowd]', crowd => { crowd.scrollLeft = 0; });
  await first.page.screenshot({ path: 'preview-shots/reader-eyes-mobile.png' });
  await first.page.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'no-preference' }, { name: 'prefers-color-scheme', value: 'dark' }]);
  await first.page.screenshot({ path: 'preview-shots/reader-eyes-dark.png' });
  await first.page.evaluate(() => scrollTo(0, 1200));
  await first.page.waitForFunction(() => document.querySelectorAll('[data-readers-crowd] svg[data-moving]').length === 0);
  await first.page.evaluate(() => scrollTo(0, 0));
  await first.page.emulateMediaFeatures([{ name: 'prefers-color-scheme', value: 'light' }]);
  console.log(`Real SVG pixels: visible eyes (${eyes}), blink closes them (${closedEyes}), gaze moves; reduced motion retains eyes, offscreen icons stop, band stays ${bandHeight}px`);
  // A bounded local adversarial fixture, never a flood against the live service.
  const attack = '<img src="https://presence-attacker.invalid/x" onerror="window.presenceAttack=true">';
  const hostileRequests = [];
  first.page.on('request', request => { if (request.url().includes('presence-attacker.invalid')) hostileRequests.push(request.url()); });
  injected = Object.fromEntries(Array.from({ length: 5000 }, (_, i) => [`00000000-0000-4000-8000-${String(i).padStart(12, '0')}`, { metas: [{ phx_ref: `attack-${i}`, html: attack }] }]));
  Object.defineProperties(injected, Object.getOwnPropertyDescriptors(JSON.parse('{"__proto__":{"metas":[{"phx_ref":"proto","__proto__":{"presenceAttack":true}}]},"constructor":{"metas":[{"phx_ref":"constructor"}]}}')));
  injected[attack] = { metas: [{ phx_ref: 'markup' }] };
  injected['x'.repeat(100000)] = { metas: [{ phx_ref: 'long-key' }] };
  broadcast(); await count(first.page, 5002);
  const security = await first.page.evaluate(() => ({
    avatars: document.querySelectorAll('[data-readers-crowd] svg').length,
    overflow: document.querySelector('[data-readers-overflow]').textContent,
    overflowHidden: document.querySelector('[data-readers-overflow]').hidden,
    injected: window.presenceAttack === true || ({}).presenceAttack === true,
    unsafeUses: [...document.querySelectorAll('[data-readers-crowd] use')].filter(use => !/^\/_astro\/[^#]+#(?:body-[0-7]|eye-\d{1,3}-[01])$/.test(use.getAttribute('href'))).length,
  }));
  assert.deepEqual(security, { avatars: 500, overflow: '+4,502', overflowHidden: false, injected: false, unsafeUses: 0 });
  assert.deepEqual(hostileRequests, []);
  await first.page.waitForFunction(() => {
    const moving = document.querySelectorAll('[data-readers-crowd] svg[data-moving]').length;
    return moving > 0 && moving <= 8;
  });
  const maskIds = await first.page.evaluate(() => [...document.querySelectorAll('[data-readers-crowd] mask')].map(mask => mask.id));
  assert.equal(new Set(maskIds).size, 500, 'each reader has an independent eye mask');
  assert.equal(await first.page.$eval('[data-online-readers]', el => el.getBoundingClientRect().height), bandHeight, 'a large crowd does not grow the single row');
  injected = Object.create(null); broadcast();
  await Promise.all([count(first.page, 2), count(second.page, 2)]);
  await first.page.waitForFunction(() => document.querySelectorAll('[data-readers-crowd] svg').length === 2 && document.querySelector('[data-readers-overflow]').hidden);
  console.log('Public-channel attack fixture: 5,000 fake UUIDs, hostile metadata/prototype/markup/long keys; DOM bounded to 500, full count + overflow, no XSS or attacker requests, clean recovery');
  // A fresh page must reconnect quickly too, including the older-browser path.
  await first.page.evaluateOnNewDocument(() => { delete window.requestIdleCallback; delete window.cancelIdleCallback; delete window.IntersectionObserver; });
  await first.page.goto(base + '/en/');
  await count(second.page, 1);
  await Promise.all([count(first.page, 2), count(second.page, 2)]);
  const fallback = await first.page.evaluate(() => ({ ms: window.presenceFirstReadyMs, hasIdle: 'requestIdleCallback' in window }));
  assert.equal(fallback.hasIdle, false);
  assert.ok(fallback.ms >= 950 && fallback.ms < 3000, `older-browser fresh navigation: ${fallback.ms}ms`);
  assert.equal(await first.page.evaluate(() => document.querySelectorAll('[data-readers-crowd] svg[data-moving]').length), 0, 'without IntersectionObserver the counted readers keep static faces');
  console.log(`Fresh navigation without requestIdleCallback: reader returned ${Math.round(fallback.ms)}ms after load; shared Hebrew/English count restored`);
  for (let i = 0; i < 3; i++) for (const [hidden, peer] of [[first, second], [second, first]]) {
    await visibility(hidden, false); await count(peer.page, 1);
    assert.equal(await hidden.page.evaluate(() => document.querySelectorAll('[data-readers-crowd] svg[data-moving]').length), 0, 'background windows do not animate');
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
