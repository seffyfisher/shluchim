import { test } from 'node:test';
import assert from 'node:assert/strict';
import { absUrl, absolutizeMarkdown, postMarkdown, markdownUrl } from './post-markdown.mjs';

const page = 'https://shluchim.shinlamed.com/posts/a-story/';

test('absUrl resolves site and document relative URLs, keeps absolute ones', () => {
  assert.equal(absUrl('/images/x.webp', page), 'https://shluchim.shinlamed.com/images/x.webp');
  assert.equal(absUrl('../../public_assets/spec.md', page), 'https://shluchim.shinlamed.com/public_assets/spec.md');
  assert.equal(absUrl('https://example.com/a', page), 'https://example.com/a');
  assert.equal(absUrl('mailto:a@b.c', page), 'mailto:a@b.c');
  assert.equal(absUrl('#sources', page), '#sources');
  assert.equal(absUrl('/shluchim/images/posts/x.webp', page), 'https://shluchim.shinlamed.com/images/posts/x.webp');
});

test('absolutizeMarkdown rewrites links, images and raw HTML but not code', () => {
  const md = '![alt](/images/a.webp) [link](/posts/b/) <audio src="/audio/c.mp3"></audio>\n[ref]: /x/\n```\n![no](/code/)\n```\n`[no](/inline/)`';
  const out = absolutizeMarkdown(md, page);
  assert.match(out, /\]\(https:\/\/shluchim\.shinlamed\.com\/images\/a\.webp\)/);
  assert.match(out, /\]\(https:\/\/shluchim\.shinlamed\.com\/posts\/b\/\)/);
  assert.match(out, /src="https:\/\/shluchim\.shinlamed\.com\/audio\/c\.mp3"/);
  assert.match(out, /\[ref\]: https:\/\/shluchim\.shinlamed\.com\/x\//);
  assert.match(out, /\]\(\/code\/\)/);
  assert.match(out, /\]\(\/inline\/\)/);
});

test('postMarkdown has title, lede, metadata and body; markdownUrl maps the URL', () => {
  const out = postMarkdown({ title: 'T', description: 'D  d', url: page, lang: 'en', author: 'Seffy Fisher', published: '2026-10-01', updated: '2026-10-02', topics: ['Everyday AI'], translationUrl: 'https://shluchim.shinlamed.com/posts/x/', body: 'Hello [a](/b/)' });
  assert.match(out, /^# T\n\n> D d\n/);
  assert.match(out, /- Updated: 2026-10-02/);
  assert.match(out, /- Hebrew version: https:\/\/shluchim\.shinlamed\.com\/posts\/x\//);
  assert.match(out, /Hello \[a\]\(https:\/\/shluchim\.shinlamed\.com\/b\/\)/);
  assert.equal(markdownUrl(page), 'https://shluchim.shinlamed.com/posts/a-story.md');
  assert.equal(markdownUrl('/en/posts/s/'), '/en/posts/s.md');
});

import { demoteHeadings } from './post-markdown.mjs';
test('demoteHeadings shifts headings outside code only', () => {
  assert.equal(demoteHeadings('# A\n## B\n```\n# code\n```\n###### F'), '## A\n### B\n```\n# code\n```\n###### F');
});
