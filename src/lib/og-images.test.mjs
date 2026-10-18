import { test } from 'node:test';
import assert from 'node:assert/strict';
import sharp from 'sharp';
import { ogCropSize, ogCandidates, postOgImage, ogUrl, renderOg, OG_WIDTH, OG_HEIGHT } from './og-images.mjs';

test('crop size is the largest 1200:630 box, scaled down to 1200x630 and never enlarged', () => {
  assert.deepEqual(ogCropSize(1672, 941), { width: 1200, height: 630 });
  assert.deepEqual(ogCropSize(1280, 1280), { width: 1200, height: 630 });
  assert.deepEqual(ogCropSize(1074, 1272), { width: 1074, height: 564 });
  assert.deepEqual(ogCropSize(648, 169), { width: 322, height: 169 });
});

test('explicit frontmatter images come first: socialImage, then cover, then article images in order', () => {
  const post = { body: '![First](/images/posts/a.webp)\n![Second](/shluchim/images/posts/b.webp)', data: { socialImage: '/images/posts/b.webp', coverAlt: 'Cover alt' } };
  const { explicit, body } = ogCandidates(post);
  assert.deepEqual(explicit.map(({ src, alt, source }) => ({ src, alt, source })), [{ src: '/images/posts/b.webp', alt: 'Second', source: 'socialImage' }]);
  assert.deepEqual(body.map(({ src }) => src), ['/images/posts/a.webp', '/images/posts/b.webp']);
});

test('a post whose first image fills a card gets a 1200x630 card with that image alt text', async () => {
  const image = await postOgImage({ body: '![The actual guide team](/media/posts/grok-bot-guide/grokbot-101-team.webp)', data: {} });
  assert.equal(image.width, OG_WIDTH); assert.equal(image.height, OG_HEIGHT);
  assert.equal(image.alt, 'The actual guide team'); assert.equal(image.source, 'body');
  assert.match(ogUrl('grok-bot-guide', image), /^\/og\/posts\/grok-bot-guide-[a-f0-9]{10}\.jpg$/);
  const card = await sharp(await renderOg(image)).metadata();
  assert.deepEqual([card.width, card.height, card.format], [OG_WIDTH, OG_HEIGHT, 'jpeg']);
});

test('tiny images never become a blurry card: the post keeps the site card', async () => {
  assert.equal(await postOgImage({ body: '![Small](/images/posts/voice-profile-skill-request.webp)', data: {} }), undefined);
  assert.equal(await postOgImage({ body: 'No images at all.', data: {} }), undefined);
  assert.equal(await postOgImage({ body: '![Missing](/images/posts/does-not-exist.webp)', data: {} }), undefined);
});
