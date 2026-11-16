import { test } from 'node:test';
import assert from 'node:assert/strict';
import { whatsappShareUrl, WA_SHARE_UTM } from './whatsapp-share.mjs';

const cases = [
  {
    lang: 'he',
    title: 'השליח שמחתך את השעון',
    pageUrl: 'https://shluchim.shinlamed.com/posts/2026-11-13-shaliach-punches-the-clock/',
    slug: '2026-11-13-shaliach-punches-the-clock',
  },
  {
    lang: 'en',
    title: 'The shaliach who punches the clock',
    pageUrl: 'https://shluchim.shinlamed.com/en/posts/2026-11-13-shaliach-punches-the-clock/',
    slug: '2026-11-13-shaliach-punches-the-clock',
  },
  {
    lang: 'ar',
    title: 'الشليح الذي يختم الساعة',
    pageUrl: 'https://shluchim.shinlamed.com/ar/posts/2026-11-13-shaliach-punches-the-clock/',
    slug: '2026-11-13-shaliach-punches-the-clock',
  },
];

test('whatsappShareUrl encodes title + UTM-tagged canonical URL for HE, EN and AR', () => {
  for (const c of cases) {
    const href = whatsappShareUrl(c);
    assert.ok(href.startsWith('https://wa.me/?text='), c.lang);
    const encoded = href.slice('https://wa.me/?text='.length);
    const decoded = decodeURIComponent(encoded);
    assert.ok(decoded.startsWith(`${c.title} `), c.lang);
    const shared = new URL(decoded.slice(c.title.length + 1));
    assert.equal(shared.origin + shared.pathname, new URL(c.pageUrl).origin + new URL(c.pageUrl).pathname, c.lang);
    assert.equal(shared.searchParams.get('utm_source'), WA_SHARE_UTM.source, c.lang);
    assert.equal(shared.searchParams.get('utm_medium'), WA_SHARE_UTM.medium, c.lang);
    assert.equal(shared.searchParams.get('utm_content'), `${c.slug}_wabutton`, c.lang);
    assert.equal([...shared.searchParams.keys()].sort().join(','), 'utm_content,utm_medium,utm_source', c.lang);
  }
});

test('utm_content uses translationKey so it stays the same when path slugs differ by locale', () => {
  const slug = '2026-10-12-dial-bot';
  const he = whatsappShareUrl({
    title: 'חייגתי',
    pageUrl: 'https://shluchim.shinlamed.com/posts/2026-10-12-dial-bot/',
    slug,
  });
  const en = whatsappShareUrl({
    title: 'My shluchim can make phone calls',
    pageUrl: 'https://shluchim.shinlamed.com/en/posts/2026-10-12-my-shluchim-can-make-phone-calls/',
    slug,
  });
  const content = (href) => new URL(decodeURIComponent(href.slice('https://wa.me/?text='.length)).split(' ').pop()).searchParams.get('utm_content');
  assert.equal(content(he), '2026-10-12-dial-bot_wabutton');
  assert.equal(content(en), '2026-10-12-dial-bot_wabutton');
});
