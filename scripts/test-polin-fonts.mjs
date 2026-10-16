// Compare the real generated webfonts with the unchanged originals in Chromium.
// No runtime code or measurement overrides are added to the site.
import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { createReadStream } from 'node:fs';
import { readFile, readdir, stat } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { resolve, sep, extname } from 'node:path';
import puppeteer from 'puppeteer-core';

const fonts = resolve('src/fonts');
const manifest = JSON.parse(await readFile(resolve(fonts, 'polin-core.json'), 'utf8'));
const faces = [...(await readFile(resolve(fonts, 'polin-core.css'), 'utf8')).matchAll(/@font-face\s*\{([^}]+)\}/g)].map(match => match[1]);
assert.equal(faces.length, 4, 'both weights need common and remaining-character faces');
const expandRanges = value => value.split(',').flatMap(range => {
  const [start, end = start] = range.trim().replace('U+', '').split('-').map(value => parseInt(value, 16));
  return Array.from({ length: end - start + 1 }, (_, i) => start + i);
});
for (const face of manifest.faces) {
  for (const [file, expected] of [[face.original, face.originalSha256], [face.core, face.coreSha256]]) {
    const hash = createHash('sha256').update(await readFile(resolve(fonts, file))).digest('hex');
    assert.equal(hash, expected, `${file}: regenerate and validate changed font bytes`);
  }
  assert.equal(new Set([...face.coreCodepoints, ...face.remainingCodepoints]).size, 729);
  assert.equal(face.coreCodepoints.filter(cp => face.remainingCodepoints.includes(cp)).length, 0);
  for (const [file, expected] of [[face.core, face.coreCodepoints], [face.original, face.remainingCodepoints]]) {
    const declaration = faces.find(css => css.includes(`url('./${file}')`) && css.includes(`font-weight: ${face.weight};`));
    assert.ok(declaration, `${file}: matching CSS face missing`);
    assert.deepEqual(expandRanges(declaration.match(/unicode-range:\s*([^;]+);/)[1]), expected, `${file}: CSS must preserve validated glyph coverage`);
  }
  assert.ok(face.coreBytes < face.originalBytes * 0.6, 'core face must materially reduce the real font payload');
}

const dist = resolve('dist');
const assets = await readdir(resolve(dist, '_astro'));
const findFont = name => {
  const stem = name.replace('.woff2', '.');
  const file = assets.find(file => file.startsWith(stem) && file.endsWith('.woff2'));
  assert.ok(file, `build does not contain ${name}`);
  return `/_astro/${file}`;
};
const originals = manifest.faces.map(face => ({ weight: face.weight, url: findFont(face.original) }));
const cores = manifest.faces.map(face => findFont(face.core));
const mime = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.woff2': 'font/woff2', '.svg': 'image/svg+xml', '.webp': 'image/webp' };
const server = createServer(async (req, res) => {
  try {
    const pathname = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
    const path = resolve(dist, `.${pathname}`, pathname.endsWith('/') ? 'index.html' : '');
    assert.ok(path.startsWith(dist + sep)); assert.ok((await stat(path)).isFile());
    res.setHeader('Content-Type', mime[extname(path)] ?? 'application/octet-stream');
    createReadStream(path).pipe(res);
  } catch { res.writeHead(404).end(); }
});
await new Promise(r => server.listen(0, '127.0.0.1', r));
const base = `http://127.0.0.1:${server.address().port}`;
let browser;
const settle = page => page.evaluate(async () => {
  await document.fonts.ready;
  await new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)));
});
const geometry = () => {
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  const rects = [];
  for (let node; (node = walker.nextNode());) {
    if (!node.textContent.trim() || node.parentElement.closest('script, style, [data-online-readers]')) continue;
    const range = document.createRange(); range.selectNodeContents(node);
    rects.push([...range.getClientRects()].map(r => [r.x, r.y, r.width, r.height]));
  }
  return rects;
};
try {
  browser = await puppeteer.launch({ channel: 'chrome', ...(process.env.CHROME_PATH ? { executablePath: process.env.CHROME_PATH } : {}), headless: true, args: ['--no-sandbox', '--disable-dev-shm-usage'] });
  for (const route of ['/', '/en/', '/posts/2026-10-06-reminders-shaliach/', '/podcast/', '/posts/2026-10-13-wake-up-sky/']) {
    for (const width of [412, 1440]) {
      const context = await browser.createBrowserContext(), page = await context.newPage();
      await page.setViewport({ width, height: 823 });
      const requests = [];
      page.on('request', r => { if (r.url().includes('/_astro/Polin-')) requests.push(new URL(r.url()).pathname); });
      await page.goto(base + route, { waitUntil: 'load' }); await settle(page);
      assert.deepEqual([...new Set(requests)].sort(), [...cores].sort(), 'initial text must use only the two smaller faces');
      // Probe CSS fallback before loading any reference face, so the test cannot
      // mistake its own reference downloads for working rare-character coverage.
      const rare = manifest.faces[0].remainingCodepoints.find(cp => cp >= 0x100 && cp < 0x250);
      await page.evaluate(cp => {
        const sample = document.createElement('p'); sample.id = 'font-fallback-probe';
        sample.append(document.createTextNode(String.fromCodePoint(cp)));
        const bold = document.createElement('strong'); bold.textContent = String.fromCodePoint(cp); sample.append(bold);
        document.body.append(sample);
      }, rare);
      await settle(page);
      for (const face of originals) assert.ok(requests.includes(face.url), 'rare characters keep both full original weights');
      await page.$eval('#font-fallback-probe', element => element.remove());
      await settle(page);
      const before = await page.evaluate(geometry);
      await page.evaluate(async faces => {
        for (const face of faces) {
          const font = new FontFace('Polin Original Test', `url('${face.url}')`, { weight: String(face.weight) });
          await font.load(); document.fonts.add(font);
        }
      }, originals);
      // Pixel comparison includes every core character and real Hebrew/English shaping.
      const raster = await page.evaluate(async points => {
        const samples = ['שְׁלוּחִים — מִזְכִּירָה עֲיֵפָה, שלום!', 'AVATAR office difficult ffi 0123456789 € ₪ →', ...Array.from({ length: Math.ceil(points.length / 40) }, (_, i) => String.fromCodePoint(...points.slice(i * 40, i * 40 + 40)))];
        const render = (family, weight, size, sample) => {
          const canvas = document.createElement('canvas'); canvas.width = 2400; canvas.height = 120;
          const ctx = canvas.getContext('2d'); ctx.direction = 'ltr'; ctx.textAlign = 'left';
          ctx.font = `${weight} ${size}px '${family}'`;
          ctx.fillText(sample, 50, 65);
          return ctx.getImageData(0, 0, canvas.width, canvas.height).data;
        };
        for (const weight of [400, 800]) for (const size of [18, 32]) for (const sample of samples) {
          const core = render('Polin', weight, size, sample), full = render('Polin Original Test', weight, size, sample);
          if (!core.every((v, i) => v === full[i])) return { equal: false, weight, size, sample };
        }
        return { equal: true };
      }, manifest.faces[0].coreCodepoints);
      assert.deepEqual(raster, { equal: true }, 'core fonts must preserve actual Chromium glyph rasterization and shaping');
      await page.evaluate(() => document.documentElement.style.setProperty('--font', "'Polin Original Test', Arial, sans-serif"));
      await settle(page);
      assert.deepEqual(await page.evaluate(geometry), before, `${route} ${width}: current text wrapping and geometry must match full originals`);
      await page.evaluate(() => document.documentElement.style.removeProperty('--font'));
      await context.close();
      console.log(`${route} ${width}px: smaller initial fonts; identical raster and text geometry; rare-character fallback available`);
    }
  }
} finally {
  if (browser) await browser.close();
  await new Promise(r => server.close(r));
}
