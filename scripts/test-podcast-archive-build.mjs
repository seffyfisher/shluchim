// Build a controlled copy: an RSS entry must appear without a template edit or
// a Spotify ID, even when its title is identical to a verified episode's title.
import assert from 'node:assert/strict';
import { cpSync, mkdtempSync, readFileSync, rmSync, symlinkSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const root = resolve(fileURLToPath(new URL('..', import.meta.url)));
const fixture = mkdtempSync(join(tmpdir(), 'shluchim-podcast-archive-'));
try {
  for (const name of ['src', 'public']) cpSync(join(root, name), join(fixture, name), { recursive: true });
  for (const name of ['astro.config.mjs', 'package.json']) cpSync(join(root, name), join(fixture, name));
  symlinkSync(join(root, 'node_modules'), join(fixture, 'node_modules'), 'dir');
  const path = join(fixture, 'src/data/podcast-feed.json');
  const data = JSON.parse(readFileSync(path, 'utf8'));
  const first = data.episodes.find((entry) => entry.guid === 'https://api.spreaker.com/episode/75804362');
  assert.ok(first, 'fixture needs the verified first episode');
  data.episodes.push({ ...first, guid: 'controlled-build-fixture-only',
    title: first.title, pageUrl: 'https://www.spreaker.com/episode/controlled-fixture--123',
    audioUrl: 'https://api.spreaker.com/download/episode/123/fixture.mp3' });
  writeFileSync(path, JSON.stringify(data));
  const build = spawnSync(process.execPath, [join(root, 'node_modules/astro/bin/astro.mjs'), 'build'], {
    cwd: fixture, env: { ...process.env, SEO_STRICT: '1' }, encoding: 'utf8', maxBuffer: 8 * 1024 * 1024,
  });
  assert.equal(build.status, 0, `archive fixture build failed:\n${build.stdout}\n${build.stderr}`);
  const html = readFileSync(join(fixture, 'dist/podcast/index.html'), 'utf8');
  assert.equal([...html.matchAll(/data-episode-guid=/g)].length, data.episodes.length);
  const row = /data-episode-guid="controlled-build-fixture-only"[^>]*>([\s\S]*?)<\/article>/.exec(html)?.[1];
  assert.ok(row, 'new GUID must have its own rendered archive row');
  assert.match(row, /https:\/\/www\.spreaker\.com\/episode\/controlled-fixture--123/);
  assert.match(row, /https:\/\/api\.spreaker\.com\/download\/episode\/123\/fixture\.mp3/);
  assert.doesNotMatch(row, /open\.spotify\.com|spotify-player|\/posts\//, 'same title must not inherit a Spotify ID or post association');
  console.log('Controlled podcast archive build: new RSS GUID renders once with verified host/audio fallbacks; no title matching.');
} finally {
  rmSync(fixture, { recursive: true, force: true });
}
