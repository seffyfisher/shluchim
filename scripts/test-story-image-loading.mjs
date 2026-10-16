// Exercise real Chromium requests: native lazy loading alone can fetch artwork far below the fold.
// Run after `npm run build`; Lighthouse's full, unchanged mobile gate follows this regression check.
import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { createReadStream } from 'node:fs';
import { stat } from 'node:fs/promises';
import { resolve, sep, extname } from 'node:path';
import { createGzip } from 'node:zlib';
import puppeteer from 'puppeteer-core';

const dist = resolve('dist');
const mime = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.webp': 'image/webp', '.woff2': 'font/woff2', '.svg': 'image/svg+xml', '.ico': 'image/x-icon' };
const server = createServer(async (req, res) => {
  try {
    const pathname = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
    const path = resolve(dist, `.${pathname}`, pathname.endsWith('/') ? 'index.html' : '');
    assert.ok(path.startsWith(dist + sep)); assert.ok((await stat(path)).isFile());
    const extension = extname(path); res.setHeader('Content-Type', mime[extension] ?? 'application/octet-stream');
    if (['.html', '.js', '.css', '.svg'].includes(extension) && req.headers['accept-encoding']?.includes('gzip')) {
      res.setHeader('Content-Encoding', 'gzip'); createReadStream(path).pipe(createGzip()).pipe(res);
    } else createReadStream(path).pipe(res);
  } catch { res.writeHead(404).end(); }
});
await new Promise(r => server.listen(0, '127.0.0.1', r));
const base = `http://127.0.0.1:${server.address().port}`;
let browser;
const settle = page => page.evaluate(async () => { await document.fonts.ready; await new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r))); });
const frameSelector = '.featured-art-frame, .story-art-frame';
const imageSelector = '.featured-art, .story-art';
try {
  browser = await puppeteer.launch({ channel: 'chrome', ...(process.env.CHROME_PATH ? { executablePath: process.env.CHROME_PATH } : {}), headless: true, args: ['--no-sandbox', '--disable-dev-shm-usage'] });
  for (const route of ['/en/', '/']) for (const width of [412, 1440]) {
    const context = await browser.createBrowserContext(), page = await context.newPage();
    const requests = [], errors = [];
    page.on('request', r => { if (r.url().includes('/media/story-previews/')) requests.push(r.url()); });
    page.on('pageerror', e => errors.push(e.message));
    await page.setViewport({ width, height: 823, deviceScaleFactor: width === 412 ? 1.75 : 1 });
    await page.goto(base + route, { waitUntil: 'load' }); await settle(page);
    const initial = await page.evaluate(selector => [...document.querySelectorAll(selector)].map(img => {
      const frame = img.closest('[data-story-art-frame]') ?? img, r = frame.getBoundingClientRect();
      const urls = [img.src, ...img.srcset.split(',').map(s => new URL(s.trim().split(' ')[0], location.href).href)];
      return { urls, top: r.top, bottom: r.bottom, displayed: getComputedStyle(frame).display !== 'none', loaded: img.complete && img.naturalWidth > 0 };
    }), imageSelector);
    const unexpected = requests.filter(url => !initial.some(im => im.urls.includes(url) && im.displayed && im.top < 823 + 201 && im.bottom > -201));
    assert.deepEqual(unexpected, [], `${route} ${width}px: artwork more than 200px beyond the viewport must not compete with initial content`);
    const initialFrames = await page.$$eval(frameSelector, frames => frames.map(f => ({ height: f.getBoundingClientRect().height, image: f.querySelector('img').className })));
    const featureCount = await page.$$eval('.featured-art', images => images.length);
    if (width === 412) assert.equal(initial.filter(im => im.displayed).length, featureCount, 'mobile feed thumbnails stay hidden');
    if (featureCount) {
    // Moving within the preload margin loads the original responsive source before it is visible.
    const frame = await page.$('.featured-art-frame');
    if (frame) await frame.evaluate(f => scrollTo(0, f.getBoundingClientRect().top + scrollY - innerHeight - 150));
    else await page.$eval('.featured-art', im => im.scrollIntoView());
    await page.waitForFunction(() => { const im = document.querySelector('.featured-art'); return im.complete && im.naturalWidth > 0; });
    const originalHeight = initialFrames.find(f => f.image === 'featured-art')?.height;
    if (originalHeight) assert.equal(await frame.evaluate(f => f.getBoundingClientRect().height), originalHeight, 'reserved artwork geometry prevents layout shifts');
    await page.$eval('.featured-section', e => e.scrollIntoView()); await settle(page);
    assert.ok(await page.$eval('.featured-art', im => im.naturalWidth > 0 && !!im.currentSrc && im.src.startsWith(location.origin)), 'real image URLs remain in HTML');
    }
    if (width === 1440 && await page.$('.story-art-frame')) {
      await page.$eval('.story-art-frame', f => f.scrollIntoView({ block: 'center' }));
      await page.waitForFunction(() => { const im = document.querySelector('.story-art'); return im.complete && im.naturalWidth > 0; });
    }
    const link = await page.$('.featured-story h3 a, .story h3 a');
    if (link) {
      const article = await link.evaluate(a => a.href);
      await link.focus(); await page.keyboard.press('Enter'); await page.waitForFunction(href => location.href === href, {}, article);
    }
    assert.deepEqual(errors, []); await context.close();
    console.log(`${route} ${width}px: offscreen requests deferred, near-viewport artwork loaded, geometry and article link preserved`);
  }
  for (const mode of ['no-js', 'no-observer', 'failed-observer']) {
    const context = await browser.createBrowserContext(), page = await context.newPage();
    await page.setViewport({ width: 1440, height: 823, deviceScaleFactor: 1 });
    if (mode === 'no-js') await page.setJavaScriptEnabled(false);
    else if (mode === 'no-observer') await page.evaluateOnNewDocument(() => { window.IntersectionObserver = undefined; });
    else await page.evaluateOnNewDocument(() => { window.IntersectionObserver = class { constructor() { throw new Error('Unavailable observer'); } }; });
    await page.goto(base + '/en/', { waitUntil: 'load' });
    const fallbackImage = await page.$(imageSelector);
    if (fallbackImage) {
      await fallbackImage.evaluate(im => (im.parentElement.matches('[data-story-art-frame]') ? im.parentElement : im).scrollIntoView());
      await page.waitForFunction(selector => { const im = document.querySelector(selector); return im.complete && im.naturalWidth > 0; }, {}, imageSelector);
      assert.ok(await fallbackImage.evaluate(im => im.getAttribute('src').startsWith('/media/story-previews/')));
    }
    assert.equal(await page.$eval('html', e => e.classList.contains('story-art-loading')), false);
    await context.close(); console.log(`${mode}: original HTML image and native lazy loading remain available`);
  }
} finally {
  if (browser) await browser.close();
  await new Promise(r => server.close(r));
}
