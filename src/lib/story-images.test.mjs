import { test } from 'node:test';
import assert from 'node:assert/strict';
import { storyImageCandidates, storyImage, previewUrl, previewSrcset } from './story-images.mjs';

test('article previews use actual local Markdown images, preserving source order and alt text', () => {
  const candidates = storyImageCandidates('![A real illustration](/media/posts/guide/team.webp)\n![A second image](/images/posts/detail.png "Detail")');
  assert.deepEqual(candidates.map(({ src, alt }) => ({ src, alt })), [{ src: '/media/posts/guide/team.webp', alt: 'A real illustration' }, { src: '/images/posts/detail.png', alt: 'A second image' }]);
});

test('legacy article paths resolve locally; code examples, remote images and traversal do not', () => {
  const candidates = storyImageCandidates('```md\n![Example](/images/example.webp)\n```\n![Remote](https://example.com/photo.webp)\n![Unsafe](/images/%2e%2e/private.webp)\n![Actual](/shluchim/images/posts/call.webp)');
  assert.deepEqual(candidates.map(({ src }) => src), ['/images/posts/call.webp']);
});

test('missing and image-free articles gracefully keep a text row', async () => {
  assert.equal(await storyImage({ body: 'A text-only story.', data: {} }), undefined);
  assert.equal(await storyImage({ body: '![Missing](/images/does-not-exist.webp)', data: {} }), undefined);
});

test('preview URLs preserve the real source aspect and never upscale small artwork', async () => {
  const image = await storyImage({ body: '![The actual guide team](/media/posts/grok-bot-guide/grokbot-101-team.webp)', data: {} });
  assert.equal(image.width / image.height, 1.5);
  assert.equal(image.original, '/media/posts/grok-bot-guide/grokbot-101-team.webp');
  assert.match(previewUrl(image, 320), /\/media\/story-previews\/[a-f0-9]+-320\.webp$/);
  assert.equal(previewSrcset({ ...image, width: 64 }, [160, 320]), previewUrl({ ...image, width: 64 }, 64) + ' 64w');
});
