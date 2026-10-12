import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { checkLists } from './list-guard.mjs';

const stories = [
  { key: 'new', date: '2026-10-12', emoji: '📮' },
  { key: 'featured-recent', date: '2026-10-09', featured: true, emoji: '🍳' },
  { key: 'featured-old', date: '2026-09-11', featured: true, emoji: '🎨' },
  { key: 'old', date: '2026-09-01', emoji: '🌿' },
];
const expected = ['featured-recent', 'featured-old', 'new', 'old'];
function fixture(t, { featured = true, base = '/' } = {}) {
  const root = mkdtempSync(join(tmpdir(), 'home-list-'));
  t.after(() => rmSync(root, { recursive: true, force: true }));
  const out = join(root, 'dist');
  for (const lang of ['he', 'en']) {
    const dir = join(root, 'src/content/posts', lang);
    mkdirSync(dir, { recursive: true });
    mkdirSync(join(out, lang === 'en' ? 'en' : ''), { recursive: true });
    for (const p of stories) {
      // Translation date/featured deliberately disagree; Hebrew remains authoritative.
      const date = lang === 'en' ? '2027-01-01' : p.date;
      const pin = lang === 'en' ? !p.featured : featured && p.featured === true;
      const data = { title: p.key, date, draft: false, emoji: p.emoji, featured: pin, translationKey: p.key };
      writeFileSync(join(dir, `${lang}-${p.key}.md`), `---\n${Object.entries(data).map(([k, v]) => `${k}: ${v}`).join('\n')}\n---\n`);
    }
    writeFileSync(join(dir, 'draft.md'), '---\ntitle: draft\ndate: 2030-01-01\ndraft: true\nfeatured: true\n---\n');
  }
  const writeList = (lang, keys) => writeFileSync(join(out, lang === 'en' ? 'en/index.html' : 'index.html'), keys.map((k) => `<h3><a href="${base}${lang === 'en' ? 'en/' : ''}posts/${lang}-${k}/">${k}</a></h3>`).join('\n'));
  return { root, out, writeList, check: () => checkLists(root, out, base) };
}

test('guard accepts featured-first groups and translated metadata, including base paths', (t) => {
  const f = fixture(t, { base: '/shluchim/' });
  for (const lang of ['he', 'en']) f.writeList(lang, expected);
  assert.deepEqual(f.check(), { errs: [], count: 4 });
});

test('guard catches wrong group order even if Hebrew and English agree', (t) => {
  const f = fixture(t);
  for (const lang of ['he', 'en']) f.writeList(lang, ['new', 'featured-recent', 'featured-old', 'old']);
  assert.equal(f.check().errs.filter((e) => /homepage order/.test(e)).length, 2);
});

test('guard catches reverse dates within featured and regular groups', (t) => {
  const f = fixture(t);
  f.writeList('he', ['featured-old', 'featured-recent', 'new', 'old']);
  f.writeList('en', ['featured-recent', 'featured-old', 'old', 'new']);
  assert.equal(f.check().errs.filter((e) => /homepage order/.test(e)).length, 2);
});

test('guard rejects duplicate posts even when both language lists agree', (t) => {
  const f = fixture(t);
  for (const lang of ['he', 'en']) f.writeList(lang, [...expected, 'featured-old']);
  assert.equal(f.check().errs.filter((e) => /duplicate posts/.test(e)).length, 2);
});

test('default or false featured values preserve usual newest-first history', (t) => {
  const f = fixture(t, { featured: false });
  for (const lang of ['he', 'en']) f.writeList(lang, ['new', 'featured-recent', 'featured-old', 'old']);
  assert.deepEqual(f.check().errs, []);
});

test('guard still excludes featured drafts and requires every published post', (t) => {
  const f = fixture(t);
  f.writeList('he', expected.slice(0, 3));
  f.writeList('en', [...expected, 'draft']);
  assert.ok(f.check().errs.some((e) => /published posts missing/.test(e)));
  assert.ok(f.check().errs.some((e) => /listed but not published/.test(e)));
});
