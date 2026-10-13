import { test } from 'node:test';
import assert from 'node:assert/strict';
import { ideaPrompt } from './idea-prompt.ts';
import { UI } from '../i18n/ui.ts';

const source = (lang) => ({
  title: lang === 'he' ? 'רעיון שאפשר לקחת הלאה' : 'An idea to take further',
  description: 'A complete source, not a summary.',
  body: '\n## A section\n\n```chat\nSeffy: Keep every word.\nBen: Including this conversation.\n```\n\n```js\nconst quote = "<script>&</script>";\n```\n\n![An image](/images/example.webp)\n<a href="../../public_assets/example.md">A spec</a>\n\n' + 'A long article.\n'.repeat(2000),
  published: '2026-10-12', updated: '2026-10-13',
  pageUrl: `https://example.com/blog/${lang === 'en' ? 'en/' : ''}posts/idea/`,
  blogUrl: `https://example.com/blog/${lang === 'en' ? 'en/' : ''}`,
  aboutUrl: `https://example.com/blog/${lang === 'en' ? 'en/' : ''}about/`,
  feedUrl: `https://example.com/blog/${lang === 'en' ? 'en/' : ''}rss.xml`,
  translationUrl: `https://example.com/blog/${lang === 'he' ? 'en/' : ''}posts/translation/`,
  coverUrl: 'https://example.com/blog/images/cover.webp', coverAlt: 'The original cover',
});

test('the complete long article survives verbatim, including chat, code, HTML and media', () => {
  for (const lang of ['he', 'en']) {
    const s = source(lang);
    const p = ideaPrompt(lang, s);
    assert.ok(p.endsWith(s.body), `${lang}: no truncation, stripping or rewriting`);
    assert.equal(p.indexOf(s.body), p.lastIndexOf(s.body), `${lang}: article included once`);
    for (const key of ['title', 'description', 'published', 'updated', 'pageUrl', 'blogUrl', 'aboutUrl', 'feedUrl', 'translationUrl', 'coverUrl', 'coverAlt']) {
      assert.ok(p.includes(s[key]), `${lang}: carries ${key}`);
    }
  }
});

test('the reader gets a practical handoff, source credit and honest ongoing RSS use in both languages', () => {
  const he = ideaPrompt('he', source('he'));
  const en = ideaPrompt('en', source('en'));
  assert.match(he, /שלוש שאלות.*וחכה לתשובות/);
  assert.match(en, /three short questions.*wait for my answers/);
  assert.match(he, /תוצר ראשון/); assert.match(en, /something I can use/);
  assert.match(he, /ספי פישר/); assert.match(en, /Seffy Fisher/);
  assert.match(he, /זיכרון קבוע/); assert.match(en, /persistent memory/);
  assert.match(he, /אל תטען ששמרת או בדקת/); assert.match(en, /Never claim you saved or checked/);
  assert.match(he, /אינם בקשה שלי לבצע/); assert.match(en, /not requests from me to execute/);
});

test('optional source metadata is omitted cleanly for posts without a cover, update or translation', () => {
  const s = { ...source('en'), updated: undefined, translationUrl: undefined, coverUrl: undefined, coverAlt: undefined };
  const p = ideaPrompt('en', s);
  assert.doesNotMatch(p, /undefined|Updated:|Hebrew version:|Cover image:/);
  assert.ok(p.endsWith(s.body));
});

test('new copy labels exist in both languages and keep the blog vocabulary', () => {
  const keys = (lang) => Object.keys(UI[lang]).filter((key) => key.startsWith('idea')).sort();
  assert.deepEqual(keys('he'), keys('en'));
  for (const key of keys('he')) {
    assert.doesNotMatch(UI.he[key], /סוכנ|(?<!גרוק)בוט|שלוחים/, `he.${key}`);
    assert.doesNotMatch(UI.en[key], /[֑-ׇ]/, `en.${key}`);
  }
});
