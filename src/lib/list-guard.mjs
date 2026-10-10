// Build-time guard: every published (non-draft) post must appear in its language's homepage list,
// and the HE and EN lists must have the same count and the same order (paired by translationKey).
// Fails the build otherwise. Skipped for SHOW_DRAFTS preview builds.
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const fmOf = (src) => { const m = src.match(/^---\n([\s\S]*?)\n---/); return m ? m[1] : ''; };
const field = (fm, k) => (fm.match(new RegExp(`^${k}:\\s*"?([^"\\n]*)"?`, 'm')) || [])[1];
function published(dir) {
  return readdirSync(dir).filter((f) => f.endsWith('.md')).map((f) => {
    const fm = fmOf(readFileSync(join(dir, f), 'utf8'));
    return { slug: f.slice(0, -3), key: field(fm, 'translationKey') || f.slice(0, -3), draft: field(fm, 'draft') !== 'false' };
  }).filter((p) => !p.draft && p.slug !== 'example-draft');
}
const listed = (html, base) => [...html.matchAll(new RegExp(`<h3><a href="${base}(?:en/)?posts/([^/"]+)/"`, 'g'))].map((m) => m[1]);

export function checkLists(root, outDir, base) {
  const errs = [], res = {};
  for (const [lang, page] of [['he', 'index.html'], ['en', 'en/index.html']]) {
    const posts = published(join(root, 'src/content/posts', lang));
    const slugs = listed(readFileSync(join(outDir, page), 'utf8'), base);
    const keyOf = new Map(posts.map((p) => [p.slug, p.key]));
    const missing = posts.filter((p) => !slugs.includes(p.slug)).map((p) => p.slug);
    const extra = slugs.filter((s) => !keyOf.has(s));
    if (missing.length) errs.push(`${lang}: published posts missing from the homepage list: ${missing.join(', ')}`);
    if (extra.length) errs.push(`${lang}: listed but not published: ${extra.join(', ')}`);
    res[lang] = slugs.map((s) => keyOf.get(s) || s);
  }
  if (res.he.length !== res.en.length) errs.push(`count mismatch: he ${res.he.length}, en ${res.en.length}`);
  const i = res.he.findIndex((k, n) => k !== res.en[n]);
  if (i >= 0) errs.push(`order mismatch at position ${i + 1}: he=${res.he[i]} en=${res.en[i]}`);
  return { errs, count: res.he.length };
}

export const listGuard = () => ({
  name: 'shluchim-list-guard',
  hooks: {
    'astro:build:done': ({ dir, logger }) => {
      if (process.env.SHOW_DRAFTS === '1') return;
      const base = (process.env.BASE_PATH || '/shluchim').replace(/\/?$/, '/');
      const { errs, count } = checkLists(process.cwd(), fileURLToPath(dir), base);
      if (errs.length) throw new Error(`Homepage list guard failed:\n  ${errs.join('\n  ')}`);
      logger.info(`homepage lists OK: ${count} posts, HE and EN in the same order`);
    },
  },
});
