import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { checkLiveDelivery } from '../../scripts/live-delivery.mjs';

async function deliveryFixture(t, { rum = false, ttl = 31536000 } = {}) {
  const server = createServer((request, response) => {
    if (request.url === '/') {
      response.setHeader('Content-Type', 'text/html');
      // Cloudflare only transforms responses negotiated as HTML. A generic
      // fetch used to miss the beacon that real readers and Lighthouse load.
      const beacon = rum && request.headers.accept?.includes('text/html')
        ? '<script src="https://static.cloudflareinsights.com/beacon.min.js/version"></script>' : '';
      response.end(`<link rel="preload" href="/_astro/font.version.woff2">${beacon}`);
    } else if (request.url === '/_astro/font.version.woff2') {
      response.setHeader('Cache-Control', `public, max-age=${ttl}`);
      response.end('font');
    } else response.writeHead(404).end();
  });
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  t.after(() => new Promise((resolve) => server.close(resolve)));
  return `http://127.0.0.1:${server.address().port}/`;
}

test('live delivery rejects Cloudflare RUM injected only into HTML responses', async (t) => {
  const baseUrl = await deliveryFixture(t, { rum: true });
  await assert.rejects(checkLiveDelivery(baseUrl), /Cloudflare RUM is still injected/);
});

test('live delivery rejects the production four-hour hashed-asset TTL', async (t) => {
  const baseUrl = await deliveryFixture(t, { ttl: 14400 });
  await assert.rejects(checkLiveDelivery(baseUrl), /browser cache TTL 14400s/);
});

test('live delivery accepts a year of hashed-asset caching without RUM', async (t) => {
  const baseUrl = await deliveryFixture(t);
  await assert.doesNotReject(checkLiveDelivery(baseUrl));
});
