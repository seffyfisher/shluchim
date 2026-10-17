// Run after building. VIDEO_DIR also records desktop/mobile review clips.
import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { readFile, mkdir } from 'node:fs/promises';
import { resolve, extname, sep } from 'node:path';
import puppeteer from 'puppeteer-core';

const dist = resolve('dist');
const mime = { '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'text/javascript', '.woff2': 'font/woff2', '.webp': 'image/webp', '.svg': 'image/svg+xml', '.png': 'image/png' };
const server = createServer(async (req, res) => {
  try {
    const pathname = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
    const path = resolve(dist, `.${pathname}`, pathname.endsWith('/') ? 'index.html' : '');
    assert.ok(path.startsWith(dist + sep));
    res.setHeader('Content-Type', mime[extname(path)] ?? 'application/octet-stream');
    res.end(await readFile(path));
  } catch { res.writeHead(404).end(); }
});
await new Promise(r => server.listen(0, '127.0.0.1', r));
const base = `http://127.0.0.1:${server.address().port}`;
const pause = ms => new Promise(r => setTimeout(r, ms));
let browser;
try {
  browser = await puppeteer.launch({ executablePath: process.env.CHROME_PATH ?? '/usr/bin/chromium', headless: true, args: ['--no-sandbox', '--disable-dev-shm-usage'] });
  if (process.env.VIDEO_DIR) await mkdir(process.env.VIDEO_DIR, { recursive: true });
  for (const [lang, width, dark] of [['he', 1440, false], ['en', 390, true]]) {
    const context = await browser.createBrowserContext();
    const page = await context.newPage();
    await page.setViewport({ width, height: width === 390 ? 844 : 900, deviceScaleFactor: 1, isMobile: width === 390, hasTouch: width === 390 });
    await page.emulateMediaFeatures([{ name: 'prefers-color-scheme', value: dark ? 'dark' : 'light' }]);
    const errors = [];
    page.on('pageerror', e => errors.push(e.message));
    // Observe the real browser transition without adding production listeners.
    await page.evaluateOnNewDocument(() => {
      addEventListener('pagereveal', e => {
        if (!e.viewTransition) return;
        e.viewTransition.ready.then(() => {
          const rows = JSON.parse(sessionStorage.getItem('transition-evidence') ?? '[]');
          rows.push({ path: location.pathname, animations: document.getAnimations().map(a => a.animationName).filter(Boolean) });
          sessionStorage.setItem('transition-evidence', JSON.stringify(rows));
        });
      });
      addEventListener('click', e => {
        if (!e.target.closest('a[href]')) return;
        // Inspect the actual existing GA queue before the document is replaced.
        queueMicrotask(() => sessionStorage.setItem('navigation-events', JSON.stringify(
          (window.dataLayer ?? []).filter(row => row[0] === 'event' && row[1] === 'select_content' && row[2]?.action === 'navigate').map(row => row[2])
        )));
      });
    });
    // Keep review/test traffic local; Lighthouse runs separately without stubs.
    await page.setRequestInterception(true);
    page.on('request', request => request.url().startsWith(base) || request.url().startsWith('data:') ? request.continue() : request.abort());
    const prefix = lang === 'he' ? '/' : '/en/';
    await page.goto(base + prefix, { waitUntil: 'load' });
    await page.evaluate(() => document.fonts.ready);
    const recorder = process.env.VIDEO_DIR ? await page.screencast({ path: resolve(process.env.VIDEO_DIR, `${lang === 'he' ? 'desktop-hebrew' : 'mobile-english-dark'}.webm`), ffmpegPath: '/usr/bin/ffmpeg', fps: 30, quality: 38 }) : null;
    await pause(1200);
    const story = await page.$('.featured-story h3 a, .story h3 a');
    assert.ok(story, 'a real story is available');
    await story.evaluate(a => a.scrollIntoView({ block: 'center', behavior: 'instant' }));
    await pause(900);
    const href = await story.evaluate(a => a.href);
    if (width === 1440) {
      await story.focus();
      await Promise.all([page.waitForNavigation({ waitUntil: 'load' }), page.keyboard.press('Enter')]);
    } else await Promise.all([page.waitForNavigation({ waitUntil: 'load' }), story.tap()]);
    assert.equal(page.url(), href);
    await pause(900);
    const events = await page.evaluate(() => JSON.parse(sessionStorage.getItem('navigation-events')));
    assert.equal(events.length, 1, 'one existing navigation event per activation');
    assert.equal(events[0].item_id, href);
    assert.equal(events[0].site_language, lang);
    assert.equal(events[0].action, 'navigate');
    console.log(`${lang}: story opened; navigation event verified.`);
    await page.evaluate(() => scrollBy({ top: 460, behavior: 'smooth' }));
    await pause(1200);
    await page.goBack({ waitUntil: 'load' });
    console.log(`${lang}: Back completed.`);
    await pause(1000);
    assert.equal(new URL(page.url()).pathname, prefix);
    await page.goForward({ waitUntil: 'load' });
    console.log(`${lang}: Forward completed.`);
    await pause(1000);
    const about = await page.$(`header a[href="${prefix}about/"]`);
    await page.evaluate(() => scrollTo({ top: 0, behavior: 'instant' }));
    await pause(650);
    if (width === 390) await Promise.all([page.waitForNavigation({ waitUntil: 'load' }), about.tap()]);
    else await Promise.all([page.waitForNavigation({ waitUntil: 'load' }), about.click()]);
    await pause(1000);
    assert.equal(new URL(page.url()).pathname, `${prefix}about/`);
    console.log(`${lang}: About opened.`);
    const evidence = await page.evaluate(() => JSON.parse(sessionStorage.getItem('transition-evidence') ?? '[]'));
    assert.ok(evidence.length >= 4, 'story, Back, Forward and About trigger native transitions');
    assert.ok(evidence.every(row => row.animations.includes('page-enter')), JSON.stringify(evidence));
    // The theme control still binds in each newly loaded document.
    await page.$eval('.theme-option input[value="dark"]', input => input.click());
    assert.equal(await page.$eval('html', el => el.dataset.theme), 'dark');
    await page.goBack({ waitUntil: 'load' });
    await pause(900);
    assert.equal(await page.$eval('html', el => el.dataset.theme), 'dark');
    assert.deepEqual(errors, []);
    if (recorder) {
      console.log(`${lang}: navigation checks passed; finishing video encoding.`);
      await recorder.stop();
    }
    console.log(`${lang} ${width}px: native content animation, keyboard/touch navigation, Back/Forward, theme persistence, existing GA navigation payload verified (${evidence.length} transitions).`);
    await page.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'reduce' }]);
    await page.goto(base + prefix, { waitUntil: 'load' });
    await page.evaluate(() => sessionStorage.removeItem('transition-evidence'));
    await Promise.all([page.waitForNavigation({ waitUntil: 'load' }), page.click('.featured-story h3 a, .story h3 a')]);
    await pause(400);
    assert.equal(await page.evaluate(() => sessionStorage.getItem('transition-evidence')), null, 'reduced motion opts out of native transitions');
    console.log(`${lang}: reduced motion navigates without animation.`);
    await context.close();
  }
  const page = await browser.newPage();
  await page.setJavaScriptEnabled(false);
  await page.goto(base, { waitUntil: 'load' });
  await Promise.all([page.waitForNavigation({ waitUntil: 'load' }), page.click('.featured-story h3 a, .story h3 a')]);
  assert.ok(new URL(page.url()).pathname.startsWith('/posts/'));
  console.log('JavaScript disabled: normal story links work. Unsupported browsers ignore the CSS enhancement.');
} finally {
  if (browser) await browser.close();
  await new Promise(r => server.close(r));
}
