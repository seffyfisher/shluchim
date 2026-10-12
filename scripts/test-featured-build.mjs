// Build a controlled copy of the real site to verify homepage ordering without shipping sample pins.
import assert from 'node:assert/strict';
import { cpSync, mkdtempSync, readFileSync, readdirSync, rmSync, symlinkSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { parseFrontmatter } from '../src/lib/frontmatter.mjs';

const root = resolve(fileURLToPath(new URL('..', import.meta.url)));
const fixture = mkdtempSync(join(tmpdir(), 'shluchim-featured-'));
const slugOf = (p) => p.file.replace(/\.md$/, '');
const keyOf = (p) => p.data.translationKey || slugOf(p);
const dateOf = (p, hebrewByKey) => hebrewByKey.get(keyOf(p))?.data.date || p.data.date;
const newest = (a, b, hebrewByKey) => String(dateOf(b, hebrewByKey)).localeCompare(String(dateOf(a, hebrewByKey))) || keyOf(b).localeCompare(keyOf(a));
const files = (lang) => readdirSync(join(fixture, 'src/content/posts', lang)).filter((f) => f.endsWith('.md')).map((file) => {
  const path = join(fixture, 'src/content/posts', lang, file);
  return { file, path, data: parseFrontmatter(readFileSync(path, 'utf8')).data };
});
const listed = (html) => [...html.matchAll(/<h3><a href="[^"]*\/posts\/([^/]+)\/"/g)].map((m) => m[1]);

try {
  for (const name of ['src', 'public']) cpSync(join(root, name), join(fixture, name), { recursive: true });
  for (const name of ['astro.config.mjs', 'package.json']) cpSync(join(root, name), join(fixture, name));
  symlinkSync(join(root, 'node_modules'), join(fixture, 'node_modules'), process.platform === 'win32' ? 'junction' : 'dir');

  // Clear every copied flag first. A future real pin must never affect this fixture's expectations.
  for (const lang of ['he', 'en']) for (const p of files(lang)) {
    writeFileSync(p.path, readFileSync(p.path, 'utf8').replace(/^featured:\s*.*(?:\r?\n|$)/gm, ''));
  }
  const he = files('he').filter((p) => p.data.draft === 'false');
  const en = files('en').filter((p) => p.data.draft === 'false');
  const englishKeys = new Set(en.map(keyOf));
  const paired = he.filter((p) => englishKeys.has(keyOf(p))).sort((a, b) => newest(b, a, new Map()));
  assert.ok(paired.length >= 3, 'fixture needs at least three published pairs');
  const selected = paired.slice(0, 2);
  const selectedKeys = new Set(selected.map(keyOf));
  for (const p of selected) writeFileSync(p.path, readFileSync(p.path, 'utf8').replace(/^---\r?\n/, '---\nfeatured: true\n'));
  // A paired English flag cannot override the Hebrew source.
  const englishOverride = en.find((p) => !selectedKeys.has(keyOf(p)));
  assert.ok(englishOverride);
  writeFileSync(englishOverride.path, readFileSync(englishOverride.path, 'utf8').replace(/^---\r?\n/, '---\nfeatured: true\n'));

  const astro = join(root, 'node_modules/astro/bin/astro.mjs');
  const build = spawnSync(process.execPath, [astro, 'build'], { cwd: fixture, env: { ...process.env, SEO_STRICT: '1' }, encoding: 'utf8', maxBuffer: 8 * 1024 * 1024 });
  assert.equal(build.status, 0, `fixture build failed:\n${build.stdout}\n${build.stderr}`);

  const heByKey = new Map(he.map((p) => [keyOf(p), p]));
  const expected = (posts) => {
    const chronological = posts.toSorted((a, b) => newest(a, b, heByKey));
    return [...chronological.filter((p) => selectedKeys.has(keyOf(p))), ...chronological.filter((p) => !selectedKeys.has(keyOf(p)))].map(slugOf);
  };
  for (const [lang, posts, page] of [['he', he, 'index.html'], ['en', en, 'en/index.html']]) {
    const html = readFileSync(join(fixture, 'dist', page), 'utf8');
    const actual = listed(html);
    assert.deepEqual(actual, expected(posts), `${lang} homepage order`);
    assert.equal(new Set(actual).size, actual.length, `${lang} homepage must not duplicate posts`);
    const firstList = /<div id="stories">\s*<h2 class="sr-only">[^<]+<\/h2>\s*(<ol[\s\S]*?<\/ol>)/.exec(html)?.[1];
    assert.ok(firstList, `${lang} homepage names the featured list for assistive tech without a visible heading`);
    assert.doesNotMatch(firstList, /class="badge"/, `${lang} featured rows have no badge`);
  }
  if (process.env.FEATURED_PREVIEW_DIR) {
    cpSync(join(fixture, 'dist'), resolve(process.env.FEATURED_PREVIEW_DIR), { recursive: true });
    console.log(`Controlled preview saved to ${resolve(process.env.FEATURED_PREVIEW_DIR)}`);
  }
  console.log('Controlled featured build: Hebrew and English order, inheritance, and uniqueness OK');
} finally {
  rmSync(fixture, { recursive: true, force: true });
}
