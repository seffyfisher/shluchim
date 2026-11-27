// npm run podcast:verify [-- --dist [dir]] [--online]
// Fails (exit 1) when a published episode is not fully published: missing from /podcast/, no Spotify id/link,
// or its source post (HE/EN/AR) lacks the on-site player and links. Rule + history: LESSONS.md, PODCAST.md.
//   (default)  static: podcast-feed.json + src/data/podcast.ts + the post front matter. No build needed.
//   --dist     also checks the built HTML (default dir: dist), after `npm run build`. CI uses this.
//   --online   also asks Spotify's oEmbed that every id resolves and carries the same title as the RSS item.
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { EPISODES, POST_EPISODES } from '../src/data/podcast.ts';
import { parseFrontmatter } from '../src/lib/frontmatter.mjs';
import { verifyPodcast } from '../src/lib/podcast-verify.mjs';

const root = resolve(fileURLToPath(new URL('..', import.meta.url)));
const args = process.argv.slice(2);
const distIdx = args.indexOf('--dist');
const distDir = distIdx >= 0 ? resolve(root, args[distIdx + 1]?.startsWith('--') || !args[distIdx + 1] ? 'dist' : args[distIdx + 1]) : null;
const online = args.includes('--online');

const feed = JSON.parse(readFileSync(join(root, process.env.PODCAST_FEED_FILE ?? 'src/data/podcast-feed.json'), 'utf8'));
const postsDir = join(root, 'src/content/posts');
const posts = ['he', 'en', 'ar'].flatMap((lang) => readdirSync(join(postsDir, lang)).filter((n) => n.endsWith('.md')).map((n) => {
  const slug = n.slice(0, -3);
  const { data } = parseFrontmatter(readFileSync(join(postsDir, lang, n), 'utf8'));
  return { id: `${lang}/${slug}`, lang, slug, translationKey: data.translationKey, draft: data.draft === true || data.draft === 'true' };
}));
const readDist = distDir ? (rel) => (existsSync(join(distDir, rel)) ? readFileSync(join(distDir, rel), 'utf8') : null) : undefined;

const problems = verifyPodcast({ feedEpisodes: feed.episodes ?? [], episodes: EPISODES, postEpisodes: POST_EPISODES, posts, readDist });

if (online) {
  for (const ep of feed.episodes ?? []) {
    const e = Object.values(EPISODES).find((x) => x.rssGuid === ep.guid);
    if (!e) continue;
    try {
      const res = await fetch(`https://open.spotify.com/oembed?url=${encodeURIComponent(e.spotifyUrl)}`, { signal: AbortSignal.timeout(15000) });
      if (!res.ok) { problems.push(`episode ${ep.number}: Spotify oEmbed answered ${res.status} for ${e.spotifyId}`); continue; }
      const { title } = await res.json();
      if (title?.trim() !== ep.title.trim()) problems.push(`episode ${ep.number}: Spotify title «${title}» differs from the RSS title «${ep.title}»`);
    } catch (err) {
      problems.push(`episode ${ep.number}: could not reach Spotify oEmbed (${err.message})`);
    }
  }
}

const scope = ['static', distDir ? 'dist' : null, online ? 'online' : null].filter(Boolean).join('+');
if (problems.length) {
  console.error(`podcast:verify FAILED (${scope}): ${problems.length} problem(s)`);
  for (const p of problems) console.error(`  - ${p}`);
  process.exit(1);
}
console.log(`podcast:verify OK (${scope}): ${(feed.episodes ?? []).length} episodes, ${Object.keys(POST_EPISODES).length} post blocks`);
