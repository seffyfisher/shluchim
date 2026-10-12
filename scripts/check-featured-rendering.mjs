// Build real pages with temporary pinned-post fixtures, without editing the repository's posts.
import assert from 'node:assert/strict';
import { cpSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, rmSync, symlinkSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { spawnSync } from 'node:child_process';
import { parseFrontmatter } from '../src/lib/frontmatter.mjs';

const root = resolve(import.meta.dirname, '..');
const preview = join(root, 'preview-shots/featured');
mkdirSync(preview, { recursive: true });
// Astro moves generated assets with rename(); fixture and output must share a filesystem.
const fixture = mkdtempSync(join(preview, '.fixture-'));
const output = join(preview, 'site');
const list = (html) => [...html.matchAll(/<h3><a href="\/(?:en\/)?posts\/([^/]+)\/"/g)].map((m) => m[1]);
const home = (lang) => readFileSync(join(output, lang === 'en' ? 'en/index.html' : 'index.html'), 'utf8');
const scripts = (html) => [...html.matchAll(/<script\b[\s\S]*?<\/script>/g)].map((m) => m[0]);
const originals = ['2026-10-09-voice-profile', '2026-09-19-shinlamed-studio-upload'];
const build = () => {
  const result = spawnSync(process.execPath, [join(root, 'node_modules/astro/bin/astro.mjs'), 'build', '--outDir', output], {
    cwd: fixture, encoding: 'utf8', env: { ...process.env, ASTRO_TELEMETRY_DISABLED: '1', SEO_STRICT: '1', SHOW_DRAFTS: '0', BASE_PATH: '/' },
  });
  if (result.status !== 0) {
    console.error('Fixture build failed:', { cwd: fixture, status: result.status, signal: result.signal, error: result.error?.message });
    console.error('stdout:', result.stdout || '(empty)');
    console.error('stderr:', result.stderr || '(empty)');
  }
  assert.equal(result.status, 0, result.stdout + result.stderr);
};
const setFeatured = (path, value) => {
  const src = readFileSync(path, 'utf8');
  writeFileSync(path, /^featured:/m.test(src) ? src.replace(/^featured:.*$/m, `featured: ${value}`) : src.replace(/^---\n/, `---\nfeatured: ${value}\n`));
};

try {
  for (const path of ['src', 'public', 'astro.config.mjs', 'package.json']) cpSync(join(root, path), join(fixture, path), { recursive: true });
  symlinkSync(join(root, 'node_modules'), join(fixture, 'node_modules'), 'dir');
  // Editors may already have pinned real posts. Keep these fixtures controlled
  // so legitimate authoring changes cannot make the CI test fail.
  for (const lang of ['he', 'en']) {
    for (const file of readdirSync(join(fixture, 'src/content/posts', lang))) {
      if (file.endsWith('.md')) setFeatured(join(fixture, 'src/content/posts', lang, file), false);
    }
  }
  build();
  const baseline = Object.fromEntries(['he', 'en'].map((lang) => [lang, home(lang)]));
  const datedFiles = ['rss.xml', 'en/rss.xml', ...['', 'en/'].flatMap((prefix) => readdirSync(join(output, prefix, 'topics')).map((topic) => `${prefix}topics/${topic}/index.html`))];
  const datedLists = new Map(datedFiles.map((path) => [path, readFileSync(join(output, path), 'utf8')]));
  const translated = new Map();
  for (const file of readdirSync(join(fixture, 'src/content/posts/en'))) {
    const { data } = parseFrontmatter(readFileSync(join(fixture, 'src/content/posts/en', file), 'utf8'));
    translated.set(data.translationKey || file.slice(0, -3), file.slice(0, -3));
  }
  for (const slug of originals) setFeatured(join(fixture, 'src/content/posts/he', `${slug}.md`), true);
  // Deliberately conflicting English choices verify that pinning stays synchronized.
  for (const slug of originals) setFeatured(join(fixture, 'src/content/posts/en', `${translated.get(slug)}.md`), false);
  setFeatured(join(fixture, 'src/content/posts/en', `${list(baseline.en)[0]}.md`), true);
  for (const file of readdirSync(join(fixture, 'src/content/posts/he'))) {
    const path = join(fixture, 'src/content/posts/he', file);
    if (parseFrontmatter(readFileSync(path, 'utf8')).data.draft !== 'false') setFeatured(path, true);
  }
  build();
  for (const lang of ['he', 'en']) {
    const html = home(lang);
    const before = list(baseline[lang]);
    const pinned = originals.map((slug) => lang === 'he' ? slug : translated.get(slug));
    const expected = [...before.filter((slug) => pinned.includes(slug)), ...before.filter((slug) => !pinned.includes(slug))];
    assert.deepEqual(list(html), expected, `${lang} must render newest featured first, then newest regular first`);
    assert.equal(new Set(list(html)).size, before.length, 'no duplicate or draft posts');
    assert.equal((html.match(/<ol class="stories"/g) || []).length, 1, 'reuse the existing single story list');
    assert.ok(!html.includes('מקודמים'), 'no promoted label');
    assert.deepEqual(scripts(html), scripts(baseline[lang]), 'no additional browser JS');
  }
  for (const [path, before] of datedLists) assert.equal(readFileSync(join(output, path), 'utf8'), before, `date order/content unchanged: ${path}`);
  mkdirSync(join(root, 'preview-shots/featured'), { recursive: true });
  writeFileSync(join(root, 'preview-shots/featured/README.txt'), 'Visual preview uses temporary fixtures only: voice-profile (2026-10-09) and shinlamed-studio-upload (2026-09-19) are pinned. No actual post selection is committed.\n');
  console.log('PASS: HE/EN real rendering, newest-first pinned groups, remaining history, no duplicates/drafts/new JS, unchanged RSS/topics, strict SEO checks.');
  console.log(`Preview fixture site: ${output}`);
} finally {
  rmSync(fixture, { recursive: true, force: true });
}
