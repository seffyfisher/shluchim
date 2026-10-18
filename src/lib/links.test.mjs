import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { htmlToHast, markdownToHtml } from 'satteri';
import { auditLinks, isExternalLink, satteriLinks } from './links.mjs';
import { satteriImgSize } from './remark-img-size.mjs';
import { imagePopover } from './image-viewer.mjs';
import { SITE_URL } from './site-env.mjs';

const render = (source, extra = {}) => markdownToHtml(source, {
  hastPlugins: [satteriLinks], features: { rawHtml: true }, ...extra,
}).html;
const anchors = (html) => {
  const result = [];
  const walk = (node) => {
    if (node.type === 'element' && ['a', 'area'].includes(node.tagName)) result.push(node.properties);
    for (const child of node.children ?? []) walk(child);
  };
  walk(htmlToHast(html));
  return result;
};

test('external means another HTTP(S) host, including protocol-relative URLs', () => {
  const site = 'https://blog.example.test';
  for (const href of ['https://elsewhere.example.test', 'http://elsewhere.example.test', '//elsewhere.example.test/path', 'https://blog.example.test.evil.test']) {
    assert.equal(isExternalLink(href, site), true, href);
  }
  for (const href of ['/', '/friends/', '../posts/', '#person', '?page=2', '', site + '/friends/', 'http://blog.example.test/friends/', '//blog.example.test/friends/', 'mailto:hello@example.test', 'tel:+123456789', 'javascript:void(0)', 'https://[invalid']) {
    assert.equal(isExternalLink(href, site), false, href);
  }
});

test('only external Markdown, reference, autolink and raw HTML links open a new tab', () => {
  const html = render(`
[Internal](/friends/) [External](https://example.com) [Fragment](#person) [Mail](mailto:hello@example.com)

[Reference][creator]

<https://example.com/auto>

https://example.com/bare

<a href="/raw/" target="_blank">Raw internal link</a>
<a href="">Current page</a>
<map name="people"><area href="/person/" alt="Person"></map>
<a href="${SITE_URL}/friends/" target="_blank">Absolute site link</a>
<a href="//example.com/creator">Protocol-relative external link</a>

[creator]: https://example.com/creator
`);
  const links = anchors(html);
  assert.equal(links.length, 12);
  for (const link of links) {
    if (isExternalLink(link.href)) {
      assert.equal(link.target, '_blank', link.href);
      assert.ok(link.rel.includes('noopener'), link.href);
    } else assert.equal(link.target, undefined, link.href);
  }
});

test('raw HTML preserves URLs, labels and attributes, retains nofollow and removes opener', () => {
  const html = render('<a href="https://example.com/friends/?name=ספי&amp;page=2#person" id="creator" title="בני אנוש" download rel="nofollow noreferrer opener" target="named-tab">אדם</a>');
  const [link] = anchors(html);
  assert.equal(link.href, 'https://example.com/friends/?name=ספי&page=2#person');
  assert.equal(link.id, 'creator');
  assert.equal(link.title, 'בני אנוש');
  assert.equal(link.download, true);
  assert.equal(link.target, '_blank');
  assert.deepEqual(link.rel, ['nofollow', 'noreferrer', 'noopener']);
  assert.match(html, />אדם<\/a>/);
});

test('named anchors and example code remain content, while generated image links open a new tab', () => {
  const named = anchors(render('<a id="person"></a>'));
  assert.deepEqual(named, [{ id: 'person' }]);
  const code = render('`<a href="/example">Example</a>`\n\n```html\n<a href="/example">Example</a>\n```');
  assert.deepEqual(anchors(code), []);
  assert.match(code, /&lt;a href=/);

  const html = render('[![Photo](https://example.com/photo.jpg)](https://example.com/full.jpg)', {
    mdastPlugins: [satteriImgSize], data: { astro: { frontmatter: { date: '2026-10-13', lang: 'en' } } },
  });
  const [original] = anchors(html);
  assert.equal(original.href, 'https://example.com/photo.jpg');
  assert.equal(original.target, '_blank');
  assert.ok(original.rel.includes('noopener'));
  assert.match(html, /popover/);
  const [localOriginal] = anchors(imagePopover({ id: 'local-image', src: '/images/photo.jpg', lang: 'en' }));
  assert.equal(localOriginal.target, undefined);
});

test('post media reserves image geometry and offers responsive sources without upscaling small originals', () => {
  const options = { mdastPlugins: [satteriImgSize], data: { astro: { frontmatter: { date: '2026-10-13', lang: 'he' } } } };
  const art = render('![Gift](/media/posts/software-as-small-gifts/01-personal-gift-1672.webp)', options);
  assert.match(art, /width="1672" height="941"/);
  assert.match(art, /srcset="[^"]+-1024.webp 1024w, [^"]+-1672.webp 1672w"/);
  const small = render('![Kol-Chen](/media/posts/software-as-small-gifts/07-kol-chen-wrapped-480.webp)', options);
  assert.match(small, /width="480" height="204"/);
  assert.doesNotMatch(small, /srcset=/);
});

test('the built-page guard finds violations across both languages and ignores inert markup', (t) => {
  const dir = mkdtempSync(join(tmpdir(), 'shluchim-links-'));
  t.after(() => rmSync(dir, { recursive: true, force: true }));
  mkdirSync(join(dir, 'en/friends'), { recursive: true });
  writeFileSync(join(dir, 'index.html'), `
    <a href="https://example.com/missing">Missing target and rel</a>
    <a href="#main" target="_blank" rel="noopener">Wrong target</a>
    <a id="main"></a>
    <!-- <a href="/comment">Comment</a> -->
    <script>const example = '<a href="/script">Script</a>';</script>
    <pre>&lt;a href="/code"&gt;Code&lt;/a&gt;</pre>
  `);
  writeFileSync(join(dir, 'en/friends/index.html'), `
    <a href="https://example.com" target="_blank" rel="opener">Unsafe rel</a>
    <a href="/en/" rel="nofollow">Good site link</a>
    <a href="${SITE_URL}/friends/" target="_blank">Wrong absolute-site target</a>
  `);
  const { errors, pages, links } = auditLinks(dir);
  assert.equal(pages, 2);
  assert.equal(links, 5);
  assert.equal(errors.length, 5);
  assert.ok(errors.some((error) => error.includes('index.html: link "https://example.com/missing" needs target="_blank"')));
  assert.ok(errors.some((error) => error.includes('link "#main" must open in the same tab')));
  assert.ok(errors.some((error) => error.includes('en/friends/index.html: link "https://example.com" needs rel="noopener"')));
  assert.ok(errors.every((error) => !error.includes('link "/en/"')));
});

test('the built-page guard accepts external, internal, fragment and image-map links', (t) => {
  const dir = mkdtempSync(join(tmpdir(), 'shluchim-links-'));
  t.after(() => rmSync(dir, { recursive: true, force: true }));
  writeFileSync(join(dir, 'index.html'), render('[Internal](/) [External](https://example.com) [Fragment](#main)\n\n<map name="people"><area href="/friends/" alt="Friends"></map>'));
  assert.deepEqual(auditLinks(dir), { errors: [], pages: 1, links: 4, external: 1 });
});
