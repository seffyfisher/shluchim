import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const read = (path) => readFileSync(new URL(path, import.meta.url), 'utf8');

test('Hebrew and Arabic code blocks are right to left and right-aligned; English stays left to right', () => {
  const css = read('../styles/global.css');
  assert.match(css, /html\[lang="he"\] \.prose pre, html\[lang="ar"\] \.prose pre \{[^}]*direction: rtl;[^}]*text-align: right/);
  assert.match(css, /html\[lang="he"\] \.prose pre code, html\[lang="ar"\] \.prose pre code \{[^}]*direction: inherit/);
  assert.match(css, /\.prose pre \{ direction: ltr;/);
});

test('every language has copy-button labels, and the post page wires the button and a status region', () => {
  const ui = read('../i18n/ui.ts');
  for (const key of ['codeCopy', 'codeCopied', 'codeCopyFail']) assert.equal(ui.split(`${key}:`).length - 1, 3, key);
  const page = read('../components/PostPage.astro');
  assert.match(page, /data-copy=\{ui\.codeCopy\}/);
  assert.match(page, /querySelectorAll\('pre'\)/);
  assert.match(page, /role', 'status'/);
  assert.match(page, /navigator\.clipboard\.writeText/);
});
