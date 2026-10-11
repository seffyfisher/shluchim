import { test } from 'node:test';
import assert from 'node:assert';
import { urlsFor, payload } from './indexnow.mjs';

const BASE = 'https://x.test/shluchim/';
const files = {
  'src/content/posts/he/a.md': '---\ndraft: false\ntopics: ["grok-bot"]\n---\nbody',
  'src/content/posts/en/b.md': '---\ndraft: false\ntopics: ["ai-at-work"]\n---\nbody',
  'src/content/posts/he/d.md': '---\ndraft: true\ntopics: ["grok-bot"]\n---\nbody',
  'src/content/posts/he/example-draft.md': '---\ndraft: false\n---\n',
};
const read = (f) => { if (!(f in files)) throw new Error('gone'); return files[f]; };

test('a published story brings its URL, both homepages and the hubs of its topics', () => {
  const u = urlsFor(['src/content/posts/he/a.md'], read, BASE);
  assert.deepEqual(u.sort(), [BASE, `${BASE}en/`, `${BASE}posts/a/`, `${BASE}topics/grok-bot/`, `${BASE}en/topics/grok-bot/`].sort());
});

test('English stories live under /en/', () => {
  assert.ok(urlsFor(['src/content/posts/en/b.md'], read, BASE).includes(`${BASE}en/posts/b/`));
});

test('drafts, the example draft, deleted files and unrelated files are never announced', () => {
  assert.deepEqual(urlsFor(['src/content/posts/he/d.md', 'src/content/posts/he/example-draft.md', 'src/content/posts/he/gone.md', 'README.md'], read, BASE), []);
});

test('About changes announce the About page only', () => {
  assert.deepEqual(urlsFor(['src/content/pages/en/about.md'], read, BASE), [`${BASE}en/about/`]);
});

test('payload names the host and where the key file lives (under the site path, so every URL is inside its directory)', () => {
  const p = payload('https://x.test', '/shluchim', 'k3y-abcdef12', ['u']);
  assert.equal(p.host, 'x.test'); assert.equal(p.keyLocation, 'https://x.test/shluchim/k3y-abcdef12.txt'); assert.deepEqual(p.urlList, ['u']);
});
