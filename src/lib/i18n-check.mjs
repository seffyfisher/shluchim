// Build-time translation check (warns, never fails the build).
// - A published Hebrew post with no English counterpart (same translationKey, or same file name) -> warning.
// - Niqqud in an English post outside "original:" lines / ```chat-he blocks -> warning (niqqud is Hebrew-only).
import { readdirSync, readFileSync, existsSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { join } from 'node:path';
import { TOPIC_SLUGS } from '../data/topics.mjs';
import { parseFrontmatter } from './frontmatter.mjs';

const fm = (src) => {
  const m = /^---\n([\s\S]*?)\n---/.exec(src);
  const get = (k) => m && (new RegExp(`^${k}:\\s*["']?(.*?)["']?\\s*$`, 'm').exec(m[1]) || [])[1];
  return { draft: get('draft'), key: get('translationKey'), heOnly: get('heOnly') === 'true' };
};
const read = (dir) => existsSync(dir)
  ? readdirSync(dir).filter((f) => f.endsWith('.md')).map((f) => { const src = readFileSync(join(dir, f), 'utf8'); const d = fm(src); const pf = parseFrontmatter(src).data; return { f, src, key: d.key || f.replace(/\.md$/, ''), draft: d.draft !== 'false', heOnly: d.heOnly, date: String(pf.date ?? '').slice(0, 10) || undefined, updated: String(pf.updated ?? '').slice(0, 10) || undefined, topics: Array.isArray(pf.topics) ? pf.topics : [] }; })
  : [];

export function checkTranslations(root) {
  const he = read(join(root, 'src/content/posts/he')).filter((p) => !p.draft && p.f !== 'example-draft.md');
  const en = read(join(root, 'src/content/posts/en'));
  const enKeys = new Set(en.filter((p) => !p.draft).map((p) => p.key)); // drafts don't count as translated
  const missing = he.filter((p) => !p.heOnly && !enKeys.has(p.key)).map((p) => p.f); // heOnly: Hebrew on purpose
  const nikud = en.filter((p) => p.src.replace(/```chat-he\n[\s\S]*?\n```/g, '').split('\n').some((l) => !/^\s*(original|מקור):/i.test(l) && /[\u0591-\u05C7]/.test(l))).map((p) => p.f);
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

/** he<->en URL pairs (published only) for sitemap alternates. English slugs may differ; pairs come from translationKey. */
export function urlPairs(root, siteBase) {
  const he = read(join(root, 'src/content/posts/he')).filter((p) => !p.draft);
  const en = read(join(root, 'src/content/posts/en')).filter((p) => !p.draft);
  const slug = (f) => f.replace(/\.md$/, '');
  const pairs = [['', 'en/'], ['team/', 'en/team/'], ['friends/', 'en/friends/']];
  for (const slug of TOPIC_SLUGS) if (he.some((p) => p.topics.includes(slug)) && en.some((p) => p.topics.includes(slug))) pairs.push([`topics/${slug}/`, `en/topics/${slug}/`]);
  if (existsSync(join(root, 'src/content/pages/en/about.md'))) pairs.push(['about/', 'en/about/']);
  for (const e of en) { const h = he.find((x) => x.key === e.key); if (h) pairs.push([`posts/${slug(h.f)}/`, `en/posts/${slug(e.f)}/`]); }
  const map = new Map();
  for (const [h, e] of pairs) { const links = [{ lang: 'he', url: siteBase + h }, { lang: 'en', url: siteBase + e }, { lang: 'x-default', url: siteBase + e }]; map.set(siteBase + h, links); map.set(siteBase + e, links); }
  return map;
}

/** Sitemap <lastmod>: a post's `updated` (else `date`); index and topic pages take their newest story. Only dates we really know. */
/**
 * Last commit date (ISO, committer time) touching any of `files`, from git. Deterministic for a given commit.
 * Returns undefined when git is unavailable or the clone is shallow (a shallow clone would date every file to
 * the checkout commit), so a page without a trustworthy date simply gets no <lastmod>. CI checks out full history.
 */
export function gitLastModified(root, files) {
  try {
    const git = (args) => execFileSync('git', args, { cwd: root, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim();
    if (git(['rev-parse', '--is-shallow-repository']) !== 'false') return undefined;
    return git(['log', '-1', '--format=%cI', '--', ...files]) || undefined;
  } catch { return undefined; }
}

/** Source files behind each static page; a commit to any of them changes the page. */
const PAGE_SOURCES = {
  'about/': (lang) => [`src/content/pages/${lang}/about.md`, 'src/components/AboutPage.astro', 'src/data/about-photos.json'],
  'team/': () => ['src/components/TeamPage.astro', 'src/data/shluchim.json'],
  'friends/': () => ['src/components/FriendsPage.astro', 'src/data/friends.ts', 'src/data/friend-portraits.ts'],
  'links/': () => ['src/components/ReadyBotsPage.astro', 'src/data/ready-bots.ts'],
  'feedback/': () => ['src/components/FeedbackWallPage.astro', 'src/data/feedback-wall.json'],
};

/** Newest podcast episode date (the podcast page lists the episodes; Hebrew only). */
const newestEpisode = (root) => {
  try {
    const feed = JSON.parse(readFileSync(join(root, 'src/data/podcast-feed.json'), 'utf8'));
    return (feed.episodes ?? []).map((e) => e.published).filter(Boolean).sort().pop();
  } catch { return undefined; }
};

export function lastmods(root, siteBase) {
  const map = new Map();
  for (const [lang, prefix] of [['he', ''], ['en', 'en/']]) {
    for (const [path, files] of Object.entries(PAGE_SOURCES)) { const d = gitLastModified(root, files(lang)); if (d) map.set(`${siteBase}${prefix}${path}`, d); }
  }
  const ep = newestEpisode(root); if (ep) map.set(`${siteBase}podcast/`, ep);
  const when = (p) => [p.date, p.updated].filter(Boolean).sort().pop();
  const newest = (ps) => ps.map(when).filter(Boolean).sort().pop();
  for (const [lang, prefix] of [['he', ''], ['en', 'en/']]) {
    const posts = read(join(root, `src/content/posts/${lang}`)).filter((p) => !p.draft && p.f !== 'example-draft.md');
    for (const p of posts) map.set(`${siteBase}${prefix}posts/${p.f.replace(/\.md$/, '')}/`, when(p));
    if (posts.length) map.set(`${siteBase}${prefix}`, newest(posts));
    for (const slug of TOPIC_SLUGS) { const ps = posts.filter((p) => p.topics.includes(slug)); if (ps.length) map.set(`${siteBase}${prefix}topics/${slug}/`, newest(ps)); }
  }
  return map;
}
