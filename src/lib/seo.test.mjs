import { test } from 'node:test';
import assert from 'node:assert';
import { clip, safeJson, withBrand, wordCount, blogPostingNode, breadcrumbNode, pageNode, nodeIds } from './seo.ts';

test('clip cuts at a word boundary and adds an ellipsis', () => {
  assert.equal(clip('short', 20), 'short');
  const c = clip('one two three four five six seven eight', 20);
  assert.ok(c.length <= 20); assert.ok(c.endsWith('…')); assert.ok(!c.includes('thre…'));
});

test('withBrand appends the brand once', () => assert.equal(withBrand('A post', 'Shluchim'), 'A post · Shluchim'));

test('safeJson can never close the script tag', () => {
  const out = safeJson({ a: '</script><script>alert(1)</script>' });
  assert.ok(!out.includes('</script>'));
  assert.deepEqual(JSON.parse(out), { a: '</script><script>alert(1)</script>' });
});

test('wordCount ignores code fences, images and markdown marks', () => {
  assert.equal(wordCount('# Title\n\nthree small words ![alt text](x.png)\n```\nignored code here\n```'), 4);
});

test('blogPostingNode has what Google needs and drops empty fields', () => {
  const n = blogPostingNode({ url: 'https://x.test/p/', headline: 'H', description: 'D', lang: 'en', published: '2026-10-09', modified: '2026-10-09', image: 'https://x.test/i.jpg', blogId: 'b', personId: 'p', keywords: [] });
  for (const k of ['headline', 'description', 'datePublished', 'dateModified', 'image', 'author', 'mainEntityOfPage', 'inLanguage']) assert.ok(n[k], k);
  assert.equal(n.keywords, undefined);
  assert.deepEqual(n.author, { '@id': 'p' });
});

test('a long headline is clipped to 110 characters', () => {
  const n = blogPostingNode({ url: 'u', headline: 'word '.repeat(60), description: 'D', lang: 'he', published: 'a', modified: 'b', blogId: 'b', personId: 'p' });
  assert.ok(n.headline.length <= 110);
});

test('breadcrumbs are numbered from 1', () => {
  const b = breadcrumbNode([{ name: 'A', url: 'u1' }, { name: 'B', url: 'u2' }]);
  assert.deepEqual(b.itemListElement.map((i) => i.position), [1, 2]);
});

test('pageNode with a list becomes an ItemList; with a main entity it points at it', () => {
  const list = pageNode({ type: 'CollectionPage', url: 'u', name: 'n', description: 'd', lang: 'en', websiteId: 'w', list: [{ name: 'x', url: 'ux' }] });
  assert.equal(list.mainEntity['@type'], 'ItemList');
  const about = pageNode({ type: 'AboutPage', url: 'u', name: 'n', description: 'd', lang: 'en', websiteId: 'w', mainEntityId: 'p' });
  assert.deepEqual(about.mainEntity, { '@id': 'p' });
});

test('nodeIds are stable and per language', () => {
  const ids = nodeIds('https://x.test/', 'https://x.test/en/');
  assert.equal(ids.person, 'https://x.test/#seffy'); assert.equal(ids.website, 'https://x.test/en/#website');
});
