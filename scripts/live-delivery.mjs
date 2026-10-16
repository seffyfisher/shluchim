import { pathToFileURL } from 'node:url';

export async function checkLiveDelivery(baseUrl) {
  // Cloudflare injects RUM into HTML responses, but not into the */* response
  // returned to a default fetch. Negotiate the same document readers receive.
  const response = await fetch(baseUrl, { headers: { Accept: 'text/html' } });
  if (!response.ok) throw new Error(`Live homepage returned HTTP ${response.status}`);
  const html = await response.text();
  if (html.includes('static.cloudflareinsights.com/beacon.min.js')) {
    throw new Error('Cloudflare RUM is still injected. Disable RUM for this hostname as described in PERFORMANCE.md.');
  }
  const asset = html.match(/["']([^"']*\/_astro\/[^"']+)["']/)?.[1];
  if (!asset) throw new Error('Could not find a hashed /_astro/ asset in the live homepage.');
  const assetResponse = await fetch(new URL(asset, baseUrl), { method: 'HEAD' });
  if (!assetResponse.ok) throw new Error(`Hashed asset returned HTTP ${assetResponse.status}`);
  const cacheControl = assetResponse.headers.get('cache-control') ?? '';
  const maxAge = Number(cacheControl.match(/(?:^|,)\s*max-age=(\d+)/)?.[1] ?? 0);
  if (maxAge < 31536000) {
    throw new Error(`Hashed assets have browser cache TTL ${maxAge}s; set Cloudflare Browser TTL to one year as described in PERFORMANCE.md.`);
  }
  console.log('Live delivery check passed: no Cloudflare RUM and hashed assets cached for one year.');
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  try {
    await checkLiveDelivery(process.env.PERF_BASE_URL || 'https://shluchim.shinlamed.com/');
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  }
}
