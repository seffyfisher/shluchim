// Build-time translation check (warns, never fails the build).
// - A published Hebrew post with no English counterpart (same translationKey, or same file name) -> warning.
// - Niqqud in an English post outside "original:" chat lines -> warning (niqqud is Hebrew-only).
import { readdirSync, readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const fm = (src) => {
  const m = /^---\n([\s\S]*?)\n---/.exec(src);
  const get = (k) => m && (new RegExp(`^${k}:\\s*["']?(.*?)["']?\\s*$`, 'm').exec(m[1]) || [])[1];
  return { draft: get('draft'), key: get('translationKey') };
};
const read = (dir) => existsSync(dir)
  ? readdirSync(dir).filter((f) => f.endsWith('.md')).map((f) => { const src = readFileSync(join(dir, f), 'utf8'); const d = fm(src); return { f, src, key: d.key || f.replace(/\.md$/, ''), draft: d.draft !== 'false' }; })
  : [];

export function checkTranslations(root) {
  const he = read(join(root, 'src/content/posts/he')).filter((p) => !p.draft && p.f !== 'example-draft.md');
  const en = read(join(root, 'src/content/posts/en'));
  const enKeys = new Set(en.filter((p) => !p.draft).map((p) => p.key)); // drafts don't count as translated
  const missing = he.filter((p) => !enKeys.has(p.key)).map((p) => p.f);
  const nikud = en.filter((p) => p.src.split('\n').some((l) => !/^\s*(original|מקור):/i.test(l) && /[\u0591-\u05C7]/.test(l))).map((p) => p.f);
  return { missing, nikud, total: he.length };
}

export const i18nCheck = () => ({
  name: 'shluchim-i18n-check',
  hooks: {
    'astro:build:start': ({ logger }) => {
      const { missing, nikud, total } = checkTranslations(process.cwd());
      if (missing.length) logger.warn(`${missing.length}/${total} published Hebrew posts have no English translation yet (src/content/posts/en/):\n  ${missing.join('\n  ')}`);
      if (nikud.length) logger.warn(`Niqqud found in English posts (Hebrew-only rule; allowed only on "original:" chat lines):\n  ${nikud.join('\n  ')}`);
    },
  },
});
