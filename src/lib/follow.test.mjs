import { test } from 'node:test';
import assert from 'node:assert';
import { followPrompt, followLinks, FOLLOW_TARGETS } from './follow.ts';

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

test('deep links round-trip the exact prompt and stay far below common URL length limits', () => {
  for (const lang of ['he', 'en']) {
    const p = followPrompt(lang, { feedUrl: FEED[lang] });
    const links = followLinks(p);
    assert.equal(links.length, FOLLOW_TARGETS.length);
    for (const l of links) {
      assert.equal(decodeURIComponent(new URL(l.href).searchParams.get('q')), p, `${lang}/${l.id} round-trips`);
      assert.ok(l.href.length < 5000, `${lang}/${l.id} URL is ${l.href.length} chars (keep well under 8 KB)`);
    }
  }
});
