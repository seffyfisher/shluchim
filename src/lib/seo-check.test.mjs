import { test } from 'node:test';
import assert from 'node:assert';
import { mkdtempSync, mkdirSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { lintContent, auditDist } from './seo-check.mjs';
import { parseFrontmatter } from './frontmatter.mjs';

const SH = 'שְׁלוּחִים'; // the site's exact niqqud form
function fixture(files) {
  const root = mkdtempSync(join(tmpdir(), 'seo-'));
  for (const [rel, body] of Object.entries(files)) {
    mkdirSync(join(root, rel, '..'), { recursive: true });
    writeFileSync(join(root, rel), body);
  }
  return root;
}
const val = (v) => (Array.isArray(v) ? `[${v.map((x) => JSON.stringify(x)).join(', ')}]` : typeof v === 'string' ? JSON.stringify(v) : v);
const fm = (o) => `---\n${Object.entries(o).map(([k, v]) => `${k}: ${val(v)}`).join('\n')}\n---\nbody\n`;
const good = { title: 't', description: 'd', seoTitle: 'A fine title', seoDescription: 'x'.repeat(100), topics: ['ai-at-work'], date: '2026-10-09', draft: 'false' };

test('a complete post passes', () => {
  const root = fixture({ 'src/content/posts/en/a.md': fm({ ...good, lang: 'en' }) });
  assert.deepEqual(lintContent(root).errors, []);
});

test('missing seoTitle / seoDescription are errors', () => {
  const root = fixture({ 'src/content/posts/en/a.md': fm({ title: 't', description: 'd', date: '2026-10-09', draft: 'false' }) });
  const { errors } = lintContent(root);
  assert.equal(errors.filter((e) => /missing seo/.test(e)).length, 2);
});

test('drafts are ignored', () => {
  const root = fixture({ 'src/content/posts/en/a.md': fm({ title: 't', description: 'd', date: '2026-10-09', draft: 'true' }) });
  assert.deepEqual(lintContent(root).errors, []);
});

test('Hebrew: סוכנים / בוטים are errors, the product name גרוקבוט is fine', () => {
  const bad = lintContent(fixture({ 'src/content/posts/he/a.md': fm({ ...good, seoDescription: 'סוכנים ובוטים '.repeat(8) }) })).errors;
  assert.ok(bad.some((e) => /סוכנים\/בוטים/.test(e)));
  const ok = lintContent(fixture({ 'src/content/posts/he/a.md': fm({ ...good, seoTitle: 'גרוקבוט וגרוקבוטים', seoDescription: 'x'.repeat(100) }) })).errors;
  assert.deepEqual(ok, []);
});

test('Hebrew: שלוחים must carry niqqud', () => {
  const bare = lintContent(fixture({ 'src/content/posts/he/a.md': fm({ ...good, seoDescription: 'השלוחים שלי '.repeat(10) }) })).errors;
  assert.ok(bare.some((e) => /niqqud/.test(e)));
  const pointed = lintContent(fixture({ 'src/content/posts/he/a.md': fm({ ...good, seoDescription: `ה${SH} שלי `.repeat(10) }) })).errors;
  assert.deepEqual(pointed, []);
});

test('English: niqqud is an error', () => {
  const { errors } = lintContent(fixture({ 'src/content/posts/en/a.md': fm({ ...good, seoDescription: `the ${SH} ` + 'x'.repeat(90) }) }));
  assert.ok(errors.some((e) => /niqqud/.test(e)));
});

test('unknown topics and duplicate titles are errors, long titles and missing topics are warnings', () => {
  const root = fixture({
    'src/content/posts/en/a.md': fm({ ...good, topics: ['nope'] }),
    'src/content/posts/en/b.md': fm({ ...good, seoTitle: 'A fine title' }),
    'src/content/posts/en/c.md': fm({ ...good, seoTitle: 'x '.repeat(40), seoDescription: 'y'.repeat(100), topics: [] }),
  });
  const { errors, warnings } = lintContent(root);
  assert.ok(errors.some((e) => /unknown topic/.test(e)));
  assert.ok(errors.some((e) => /duplicates/.test(e)));
  assert.ok(warnings.some((w) => /<title> is/.test(w)));
  assert.ok(warnings.some((w) => /no topics/.test(w)));
});

test('frontmatter parser reads flow lists, block lists (CMS style) and escaped quotes', () => {
  const { data } = parseFrontmatter('---\ntitle: "say \\"hi\\""\ntopics:\n  - grok-bot\n  - ai-at-work\ntags: ["a", "b"]\ndraft: false\n---\nbody');
  assert.equal(data.title, 'say "hi"');
  assert.deepEqual(data.topics, ['grok-bot', 'ai-at-work']);
  assert.deepEqual(data.tags, ['a', 'b']);
  assert.equal(data.draft, 'false');
});

test('pre-launch /ar/ pages must be noindex without canonical; HE/EN may not hreflang to them', () => {
  const site = 'https://example.com';
  const page = ({ lang, path, robots, canonical, alts = {} }) => `<!doctype html><html lang="${lang}"><head><title>T</title><meta name="description" content="d">${canonical ? `<link rel="canonical" href="${site}${path}">` : ''}<meta name="robots" content="${robots}">${Object.entries(alts).map(([l, p]) => `<link rel="alternate" hreflang="${l}" href="${site}${p}">`).join('')}<meta property="og:image" content="https://cdn.example/x.jpg"><meta property="og:title" content="t"><meta property="og:description" content="d"><meta property="og:url" content="${site}${path}"><meta property="og:type" content="website"><meta name="twitter:card" content="summary_large_image"><script type="application/ld+json">{"@graph":[{"@type":"Person"},{"@type":"WebSite"}]}</script></head><body><h1>x</h1></body></html>`;
  const build = (files) => {
    const dist = mkdtempSync(join(tmpdir(), 'seo-dist-'));
    for (const f of ['sitemap-index.xml', 'llms.txt', 'llms-full.txt', 'robots.txt']) writeFileSync(join(dist, f), '');
    for (const [rel, html] of Object.entries(files)) { mkdirSync(join(dist, rel, '..'), { recursive: true }); writeFileSync(join(dist, rel), html); }
    return dist;
  };
  const he = (alts) => page({ lang: 'he', path: '/', robots: 'index,follow', canonical: true, alts });
  const ok = build({ 'index.html': he({ he: '/' }), 'ar/index.html': page({ lang: 'ar', path: '/ar/', robots: 'noindex', alts: { he: '/', ar: '/ar/' } }) });
  assert.deepEqual(auditDist(ok, site, '', { arLaunched: false }).errors, []);
  const indexed = build({ 'index.html': he({ he: '/' }), 'ar/index.html': page({ lang: 'ar', path: '/ar/', robots: 'index,follow', canonical: true }) });
  assert.ok(auditDist(indexed, site, '', { arLaunched: false }).errors.some((e) => e.includes('must be noindex')));
  const leaky = build({ 'index.html': he({ he: '/', ar: '/ar/' }), 'ar/index.html': page({ lang: 'ar', path: '/ar/', robots: 'noindex' }) });
  assert.ok(auditDist(leaky, site, '', { arLaunched: false }).errors.some((e) => e.includes('hreflang ar')));
  assert.ok(auditDist(ok, site, '', { arLaunched: true }).errors.some((e) => e.includes('noindex')));
});
