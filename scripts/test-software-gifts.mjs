// Browser publication QA, also run against the deployed canonical host.
// Only these functional checks stub external analytics; the separate Lighthouse gate never does.
import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { readFile, mkdir, writeFile } from 'node:fs/promises';
import { resolve, sep, extname } from 'node:path';
import puppeteer from 'puppeteer-core';
import { createHash } from 'node:crypto';

const expected = JSON.parse(await readFile('docs/post-sources/2026-10-13-software-as-small-gifts/publication-checks.json', 'utf8'));
const dist = resolve('dist');
const report = resolve('publication-reports');
await mkdir(report, { recursive: true });
const mime = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css', '.svg': 'image/svg+xml', '.webp': 'image/webp', '.woff2': 'font/woff2', '.mp4': 'video/mp4' };
const server = createServer(async (req, res) => {
  try {
    const pathname = new URL(req.url, 'http://localhost').pathname;
    const file = resolve(dist, `.${decodeURIComponent(pathname)}`, pathname.endsWith('/') ? 'index.html' : '');
    assert.ok(file.startsWith(dist + sep));
    const bytes = await readFile(file);
    res.setHeader('Content-Type', mime[extname(file)] ?? 'application/octet-stream');
    res.setHeader('Accept-Ranges', 'bytes');
    const range = /bytes=(\d+)-(\d*)/.exec(req.headers.range ?? '');
    if (range) {
      const start = +range[1], end = range[2] ? Math.min(+range[2], bytes.length - 1) : bytes.length - 1;
      res.writeHead(206, { 'Content-Range': `bytes ${start}-${end}/${bytes.length}`, 'Content-Length': end - start + 1 });
      res.end(bytes.subarray(start, end + 1));
    } else { res.setHeader('Content-Length', bytes.length); res.end(bytes); }
  } catch { res.writeHead(404).end(); }
});
let browser;
const results = [];
try {
  if (!process.env.PERF_BASE_URL) await new Promise(r => server.listen(0, '127.0.0.1', r));
  const base = (process.env.PERF_BASE_URL ?? `http://127.0.0.1:${server.address().port}`).replace(/\/$/, '');
  const videoBytes = Buffer.from(await (await fetch(base + '/media/posts/software-as-small-gifts/TypoSwap-Gift-Walkthrough.mp4')).arrayBuffer());
  assert.equal(videoBytes.length, 1171789);
  assert.equal(createHash('sha256').update(videoBytes).digest('hex'), '950892c6214cb892c060b0d3fca47bce246ddec3c2a90c45b82a29850d2ed31d', 'serve the approved original MP4 byte for byte');
  browser = await puppeteer.launch({ channel: 'chrome', ...(process.env.CHROME_PATH ? { executablePath: process.env.CHROME_PATH } : {}), headless: true, args: ['--no-sandbox', '--disable-dev-shm-usage'] });
  for (const lang of ['he', 'en']) for (const width of [390, 1280]) {
    const data = expected.languages[lang];
    const context = await browser.createBrowserContext();
    await context.overridePermissions(base, ['clipboard-read', 'clipboard-write', 'clipboard-sanitized-write']);
    const page = await context.newPage(), errors = [];
    page.on('pageerror', e => errors.push(e.message));
    await page.setViewport({ width, height: 844, deviceScaleFactor: 1, isMobile: width === 390, hasTouch: width === 390 });
    await page.setRequestInterception(true);
    page.on('request', request => {
      if (new URL(request.url()).origin === new URL(base).origin) request.continue();
      else request.abort(); // No test traffic is sent to GA or reader-presence services.
    });
    const route = `${lang === 'en' ? '/en' : ''}/posts/${expected.slug}/`;
    const response = await page.goto(base + route, { waitUntil: 'load' });
    console.log(`Checking ${route} ${width}px`);
    assert.equal(response.status(), 200, route);
    await page.evaluate(() => document.fonts.ready);
    assert.equal(await page.$eval('html', e => e.lang), lang);
    assert.equal(await page.$eval('html', e => e.dir), lang === 'he' ? 'rtl' : 'ltr');
    assert.equal(await page.$eval('h1', e => e.textContent.trim()), lang === 'he' ? 'תוכנות כמתנות (קטנות)' : 'Software as (small) gifts');
    assert.equal(await page.$eval('link[rel="canonical"]', e => e.href), 'https://shluchim.shinlamed.com' + route);
    assert.ok(await page.$('link[hreflang="he"]'));
    assert.ok(await page.$('link[hreflang="en"]'));
    assert.equal(await page.$eval('time', e => e.dateTime.slice(0, 10)), '2026-10-13');
    const plainQuotes = text => text.replace(/[‘’]/g, "'").replace(/[“”]/g, '"');
    assert.deepEqual((await page.$$eval('.prose h2,.prose h3', es => es.map(e => e.textContent.trim()))).map(plainQuotes), data.headings.map(plainQuotes));
    assert.equal(await page.$('#gift-unwrapping,linear-image,linear-embed'), null);
    assert.equal(await page.$eval('.prose', e => /openai:set_globals|gift-replay/.test(e.innerHTML)), false);
    const images = await page.$$('.prose .image-enlarge img');
    assert.equal(images.length, 7);
    for (let i = 0; i < images.length; i++) {
      await images[i].evaluate(async im => { im.scrollIntoView({ block: 'center', behavior: 'instant' }); await im.decode(); });
      const actual = await images[i].evaluate(im => ({ src: new URL(im.src).pathname, alt: im.alt, width: +im.getAttribute('width'), height: +im.getAttribute('height'), displayedWidth: im.getBoundingClientRect().width, naturalWidth: im.naturalWidth }));
      assert.deepEqual({ src: actual.src, alt: plainQuotes(actual.alt), width: actual.width, height: actual.height }, { ...data.images[i], alt: plainQuotes(data.images[i].alt) });
      assert.ok(actual.displayedWidth <= data.images[i].width + 1, 'never upscale an original image');
      assert.ok(actual.naturalWidth > 0);
    }
    await page.screenshot({ path: `${report}/${lang}-${width}-final-gifts.png` });
    console.log('Original images decoded at their reserved dimensions');
    for (const repository of ['orbit-windows', 'kol-chen']) {
      const link = await page.$(`.prose a[href="https://github.com/seffyfisher/${repository}"]`);
      assert.ok(link);
      assert.equal(await link.evaluate(a => a.target), '_blank');
      assert.ok(await link.evaluate(a => a.relList.contains('noopener')));
    }
    const buttons = await page.$$('[data-gift-copy]');
    assert.equal(buttons.length, data.prompts.length);
    const rows = () => page.evaluate(() => (window.dataLayer ?? []).filter(x => x[0] === 'event').map(x => ({ name: x[1], ...x[2] })));
    const clear = () => page.evaluate(() => { window.dataLayer.length = 0; });
    for (let i = 0; i < buttons.length; i++) {
      const button = buttons[i], prompt = data.prompts[i];
      assert.equal(await button.evaluate(b => b.hidden), false);
      await button.evaluate(b => b.scrollIntoView({ block: 'center', behavior: 'instant' }));
      await clear();
      if (width === 390) {
        const box = await button.boundingBox(); await page.touchscreen.tap(box.x + box.width / 2, box.y + box.height / 2);
      } else { await button.focus(); await page.keyboard.press('Enter'); }
      try { await page.waitForFunction(id => dataLayer.some(x => x[2]?.item_id === id && x[2]?.result === 'success'), {}, prompt.id); } catch (error) { console.error(await rows(), await button.evaluate(b => ({text:b.textContent,box:b.getBoundingClientRect().toJSON()}))); throw error; }
      assert.equal(await page.evaluate(() => Promise.race([navigator.clipboard.readText(), new Promise((_, reject) => setTimeout(() => reject(new Error('Clipboard read timeout')), 5000))])), prompt.text, 'copy exact original, including typos and line breaks');
      const events = await rows();
      assert.deepEqual(events.map(e => e.action), ['copy', 'result']);
      assert.ok(events.every(e => e.name === 'select_content' && e.item_id === prompt.id && e.content_type === 'idea' && e.site_language === lang && e.post_slug === expected.slug));
      assert.equal(events[1].result, 'success');
      assert.ok(events.every(e => !JSON.stringify(e).includes(prompt.text)), 'no prompt text collected');
    }
    await page.screenshot({ path: `${report}/${lang}-${width}-prompt.png` });
    console.log('Exact prompt copies and their analytics outcomes checked');
    // Failure is distinguishable from success; the original remains selected for manual copying.
    await page.evaluate(() => { navigator.clipboard.writeText = async () => { throw new Error('Clipboard denied'); }; });
    await clear(); await buttons[0].click();
    await page.waitForFunction(() => dataLayer.some(x => x[2]?.result === 'error'));
    assert.equal(await page.evaluate(() => getSelection().toString()), data.prompts[0].text);
    assert.deepEqual((await rows()).map(e => [e.action, e.result ?? null]), [['copy', null], ['result', 'error']]);
    const failureEvidence = await rows();
    const player = await page.$('video.software-gift-video'); assert.ok(player);
    assert.deepEqual(await player.evaluate(v => [v.controls, v.playsInline, v.autoplay, v.preload, v.paused]), [true, true, false, 'none', true]);
    assert.ok(await player.evaluate(v => v.currentTime === 0 && !v.querySelector('source').src.includes('uploads.linear.app')));
    await player.evaluate(v => v.scrollIntoView({ block: 'center', behavior: 'instant' }));
    await page.screenshot({ path: `${report}/${lang}-${width}-player.png` });
    await clear();
    await player.evaluate(v => v.play());
    await page.waitForFunction(() => document.querySelector('video').currentTime > .1);
    assert.deepEqual(await player.evaluate(v => [v.videoWidth, v.videoHeight, v.duration]), [1920, 1080, 36]);
    await player.evaluate(v => { v.currentTime = 35.5; });
    await page.waitForFunction(() => document.querySelector('video').ended);
    const videoEvidence = (await rows()).filter(e => e.content_type === 'video');
    assert.deepEqual(videoEvidence.map(e => e.action), ['play', 'complete']);
    assert.ok(videoEvidence.every(e => e.name === 'select_content' && e.site_language === lang && e.item_id.endsWith('/TypoSwap-Gift-Walkthrough.mp4')));
    // Enhanced Measurement owns outbound clicks/downloads: no duplicate custom events.
    await clear();
    await page.evaluate(() => {
      for (const a of document.querySelectorAll('.prose a[href*="github.com/seffyfisher/"],.prose a[href$=".mp4"]')) {
        a.addEventListener('click', e => e.preventDefault(), { once: true }); a.click();
      }
    });
    assert.deepEqual(await rows(), []);
    // Native image enlargement is still usable from the keyboard.
    const imageButton = await page.$('.prose .image-enlarge'); await imageButton.focus(); await page.keyboard.press('Enter');
    assert.ok(await page.$('.image-viewer:popover-open')); await page.keyboard.press('Escape');
    assert.equal(await page.$('.image-viewer:popover-open'), null);
    await page.emulateMediaFeatures([{ name: 'prefers-color-scheme', value: 'dark' }, { name: 'prefers-reduced-motion', value: 'reduce' }]);
    await page.addStyleTag({ content: 'html{font-size:200%}' });
    assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), 'no horizontal overflow at 200% text size');
    // Copying/manual selection must work even if the analytics API throws.
    await page.evaluate(() => { window.gtag = () => { throw new Error('Analytics blocked'); }; });
    await buttons[0].click();
    assert.equal(await page.evaluate(() => getSelection().toString()), data.prompts[0].text);
    assert.deepEqual(errors, []);
    await page.addStyleTag({ content: 'html{font-size:100%}' });
    await page.evaluate(() => scrollTo(0, 0));
    await page.screenshot({ path: `${report}/${lang}-${width}-top.png` });
    results.push({ route, width, status: 200, images: 7, exactPromptsCopied: buttons.length, input: width === 390 ? 'touch' : 'keyboard', failureEvidence, videoEvidence, noOverflowAt200Percent: true, analyticsBlockedUi: true });
    console.log(`${route} ${width}px: 7 original images; ${buttons.length} exact clipboard copies; failure selection; 1080p playback/end; analytics; 200% text; dark/reduced motion PASS`);
    await context.close();
  }
  for (const lang of ['he', 'en']) {
    const page = await browser.newPage(); await page.setJavaScriptEnabled(false);
    await page.setViewport({ width: 390, height: 844 });
    await page.goto(base + `${lang === 'en' ? '/en' : ''}/posts/${expected.slug}/`, { waitUntil: 'load' });
    assert.equal(await page.$$eval('[data-gift-copy]', es => es.every(e => e.hidden)), true);
    assert.equal(await page.$$eval('.chat-bubble', es => es.length), expected.languages[lang].prompts.length);
    assert.deepEqual(await page.$eval('video', v => [v.controls, v.playsInline, v.autoplay]), [true, true, false]);
    assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1));
    await page.close();
  }
  await writeFile(`${report}/results.json`, JSON.stringify({ base, checkedAt: new Date().toISOString(), results, noJavaScript: ['he', 'en'], accountSideGA4Ingestion: 'unverified; browser queue only' }, null, 2));
} finally {
  await browser?.close();
  if (server.listening) await new Promise(r => server.close(r));
}
