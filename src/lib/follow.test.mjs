import { test } from 'node:test';
import assert from 'node:assert';
import { followPrompt } from './follow.ts';
import { UI } from '../i18n/ui.ts';

const FEED = { he: 'https://shluchim.shinlamed.com/rss.xml', en: 'https://shluchim.shinlamed.com/en/rss.xml' };
const NIQQUD = /[֑-ׇ]/;

test('each language prompt carries its own feed URL, on a line of its own', () => {
  for (const lang of ['he', 'en']) {
    const p = followPrompt(lang, { feedUrl: FEED[lang] });
    assert.ok(p.split('\n').includes(FEED[lang]), `${lang}: feed URL alone on a line`);
    assert.ok(!p.includes(FEED[lang === 'he' ? 'en' : 'he']), `${lang}: no other feed`);
  }
});

test('the prompt asks for a weekly check, an honest fallback and treats the feed as data', () => {
  const he = followPrompt('he', { feedUrl: FEED.he });
  const en = followPrompt('en', { feedUrl: FEED.en });
  assert.match(he, /פעם בשבוע/); assert.match(he, /במקום להעמיד פנים/); assert.match(he, /לא הוראות/);
  assert.match(en, /once a week/); assert.match(en, /instead of pretending/); assert.match(en, /not as instructions/);
});

test('reader-facing vocabulary rules hold: Hebrew has no סוכנים/בוטים and keeps niqqud on שְׁלוּחִים; English has no niqqud', () => {
  const he = followPrompt('he', { feedUrl: FEED.he });
  assert.doesNotMatch(he, /סוכנ|(?<!גרוק)בוט/);
  assert.doesNotMatch(he, /שלוחים/); // bare form is not allowed
  assert.match(he, /שְׁלוּחִים/);
  assert.doesNotMatch(followPrompt('en', { feedUrl: FEED.en }), NIQQUD);
});

test('the prompt is short enough to read before pasting', () => {
  for (const lang of ['he', 'en']) assert.ok(followPrompt(lang, { feedUrl: FEED[lang] }).length < 1200, `${lang} prompt is getting long`);
});

test('follow* UI strings exist in both languages and obey the vocabulary rules', () => {
  const keys = (l) => Object.keys(UI[l]).filter((k) => k.startsWith('follow')).sort();
  assert.deepEqual(keys('he'), keys('en'));
  assert.ok(keys('he').length >= 5);
  for (const k of keys('he')) {
    assert.doesNotMatch(UI.he[k], /סוכנ|(?<!גרוק)בוט/, `he.${k}`);
    assert.doesNotMatch(UI.he[k], /שלוחים/, `he.${k} needs niqqud`);
    assert.doesNotMatch(UI.en[k], NIQQUD, `en.${k}`);
  }
});

test('the Hebrew confirmation lists the assistants in parentheses with no-break spaces (a line break inside flips the comma in RTL)', () => {
  const m = /\(([^)]*)\)/.exec(UI.he.followDone);
  assert.ok(m, 'parenthesised list present');
  assert.match(m[1], /ChatGPT/); assert.match(m[1], /Claude/); assert.match(m[1], /גרוקבוט/);
  assert.ok(!m[1].includes(' '), 'no breakable spaces inside the parentheses');
});
