import { checkLiveDelivery } from './live-delivery.mjs';
import { spawn } from 'node:child_process';
import { createReadStream } from 'node:fs';
import { mkdir, readFile, stat } from 'node:fs/promises';
import { createServer } from 'node:http';
import { extname, resolve, sep } from 'node:path';
import { createGzip } from 'node:zlib';

// Use the same Lighthouse release and mobile defaults for every candidate.
// Never block third-party requests or turn analytics off for the audit.
const routeNames = {
  '/': 'he-home',
  '/en/': 'en-home',
  '/posts/2026-10-06-reminders-shaliach/': 'he-post',
  '/podcast/': 'he-podcast',
  '/posts/2026-10-13-wake-up-sky/': 'he-podcast-post',
};
const routes = Object.keys(routeNames);
const reportDir = resolve('lighthouse-reports');
const buildDir = resolve('dist');
const lighthouseCli = resolve('node_modules/lighthouse/cli/index.js');
const minimumScore = 100;
const runsPerRoute = 3;
const mimeTypes = {
  '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8', '.webmanifest': 'application/manifest+json',
  '.woff2': 'font/woff2', '.webp': 'image/webp', '.png': 'image/png',
  '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon', '.gif': 'image/gif',
};

function run(command, args, options = {}) {
  return new Promise((resolveRun, reject) => {
    const child = spawn(command, args, { stdio: 'inherit', ...options });
    child.once('error', reject);
    child.once('exit', (code, signal) => code === 0
      ? resolveRun()
      : reject(new Error(`${command} exited with ${code ?? signal}`)));
  });
}

async function startPreview() {
  const server = createServer(async (request, response) => {
    let path;
    try {
      const pathname = decodeURIComponent(new URL(request.url, 'http://localhost').pathname);
      path = resolve(buildDir, `.${pathname}`, pathname.endsWith('/') ? 'index.html' : '');
      if (!path.startsWith(`${buildDir}${sep}`)) throw new Error('Invalid path');
      const file = await stat(path);
      if (!file.isFile()) throw new Error('Not a file');
    } catch {
      response.writeHead(404).end('Not found');
      return;
    }
    const extension = extname(path);
    response.setHeader('Content-Type', mimeTypes[extension] ?? 'application/octet-stream');
    // GitHub Pages and Astro preview compress text. An uncompressed local
    // document gave the same post a false 99 solely from transfer time.
    if (['.html', '.js', '.css', '.svg', '.webmanifest'].includes(extension) &&
        request.headers['accept-encoding']?.includes('gzip')) {
      response.setHeader('Content-Encoding', 'gzip');
      response.setHeader('Vary', 'Accept-Encoding');
      createReadStream(path).pipe(createGzip()).pipe(response);
    } else createReadStream(path).pipe(response);
  });
  await new Promise((resolveListen, reject) => {
    server.once('error', reject);
    server.listen(0, '127.0.0.1', resolveListen);
  });
  return { server, baseUrl: `http://127.0.0.1:${server.address().port}/` };
}

const metricIds = ['first-contentful-paint', 'largest-contentful-paint', 'total-blocking-time', 'cumulative-layout-shift'];

async function audit(baseUrl, route, runIndex) {
  const name = routeNames[route];
  const report = resolve(reportDir, `${name}-${runIndex}.json`);
  const url = new URL(route.slice(1), baseUrl).href;
  await run(process.execPath, [
    lighthouseCli, url, '--only-categories=performance', '--output=json',
    `--output-path=${report}`, '--chrome-flags=--headless --no-sandbox --disable-dev-shm-usage', '--quiet',
  ]);
  const data = JSON.parse(await readFile(report, 'utf8'));
  if (data.runtimeError) throw new Error(`${route}: ${data.runtimeError.message}`);
  if (data.lighthouseVersion !== '13.4.1') throw new Error(`${route}: unexpected Lighthouse ${data.lighthouseVersion}`);
  if (data.finalUrl !== url) throw new Error(`${route}: audited ${data.finalUrl} instead of ${url}`);
  const score = Math.round(100 * data.categories.performance.score);
  const metrics = metricIds.map((id) => `${id}: ${data.audits[id]?.displayValue ?? 'unknown'}`).join(', ');
  console.log(`${route} run ${runIndex}: Performance ${score}/100; ${metrics}; report: ${report}`);
  return score;
}

let preview;
try {
  await mkdir(reportDir, { recursive: true });
  let baseUrl = process.env.PERF_BASE_URL;
  if (!baseUrl) {
    preview = await startPreview();
    baseUrl = preview.baseUrl;
  } else {
    baseUrl = new URL(baseUrl.endsWith('/') ? baseUrl : `${baseUrl}/`).href;
  }
  let passed = true;
  for (const route of routes) {
    const scores = [];
    for (let runIndex = 1; runIndex <= runsPerRoute; runIndex++) {
      scores.push(await audit(baseUrl, route, runIndex));
    }
    const median = [...scores].sort((a, b) => a - b)[1];
    console.log(`${route}: median ${median}/100 from ${scores.join(', ')}`);
    if (median < minimumScore) passed = false;
  }
  if (process.env.PERF_BASE_URL) await checkLiveDelivery(baseUrl);
  if (!passed) throw new Error(`Performance below ${minimumScore}/100; do not release this version.`);
  console.log('Performance guard passed.');
} catch (error) {
  console.error(error);
  process.exitCode = 1;
} finally {
  if (preview) await new Promise((resolveClose) => preview.server.close(resolveClose));
}
