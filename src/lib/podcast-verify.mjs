// Completeness check for the podcast (SEF-139 follow-up). Pure: all inputs are passed in, so the same code runs
// in `npm run podcast:verify` and in unit tests with broken fixtures. It returns a list of problems; empty means OK.
//
// Rule (Seffy): every published episode must be published fully and consistently:
//   1. it is listed on /podcast/;
//   2. it has a verified Spotify id + direct link (the RSS feed alone is not enough);
//   3. its source post, in EVERY language the post exists in (HE/EN/AR), carries the on-site player,
//      the Spotify link and the link to the podcast page.

const SPOTIFY_ID = /^[A-Za-z0-9]{22}$/;
const SITE_POST = /https?:\/\/shluchim\.shinlamed\.com\/posts\/([^/\s"'<>)]+)\//g;

/** Slugs of the Hebrew source posts of a feed episode: links in the RSS item and the enrichment's own post paths. */
export function sourceSlugs(feedEpisode, enrichment) {
  const slugs = new Set();
  for (const text of [feedEpisode.pageUrl, feedEpisode.description]) {
    for (const m of String(text ?? '').matchAll(SITE_POST)) slugs.add(m[1]);
  }
  const paths = [enrichment?.postPath, ...(enrichment?.morePosts ?? []).map((p) => p.path)].filter(Boolean);
  for (const path of paths) {
    const m = /^posts\/([^/]+)\/?$/.exec(path);
    if (m) slugs.add(m[1]);
  }
  return [...slugs];
}

/** The rendered file of a post inside dist, from its collection id (he/slug -> posts/slug/, en/slug -> en/posts/slug/). */
export const distPathForPost = (id) => {
  const [lang, ...rest] = id.split('/');
  return `${lang === 'he' ? '' : `${lang}/`}posts/${rest.join('/')}/index.html`;
};

/**
 * @param {object} input
 * @param {Array<{guid:string,title:string,number:number|null,pageUrl:string,description:string}>} input.feedEpisodes
 * @param {Record<string, any>} input.episodes EPISODES (key -> enrichment)
 * @param {Record<string,string>} input.postEpisodes POST_EPISODES (post id -> episode key)
 * @param {Array<{id:string,lang:string,slug:string,translationKey?:string,draft?:boolean}>} input.posts
 * @param {(relPath:string)=>string|null} [input.readDist] returns built HTML or null when the file is missing
 */
export function verifyPodcast({ feedEpisodes, episodes, postEpisodes, posts, readDist }) {
  const problems = [];
  const byGuid = new Map(Object.entries(episodes).map(([key, e]) => [e.rssGuid, { key, ...e }]));
  const label = (ep) => `episode ${ep.number ?? byGuid.get(ep.guid)?.number ?? '?'} «${ep.title}»`;
  const keyOf = (p) => p.translationKey ?? p.slug;
  const postsById = new Map(posts.map((p) => [p.id, p]));
  const feedGuids = new Set(feedEpisodes.map((e) => e.guid));

  if (!feedEpisodes.length) problems.push('podcast-feed.json has no episodes');

  for (const [key, e] of Object.entries(episodes)) {
    if (!feedGuids.has(e.rssGuid)) problems.push(`EPISODES.${key}: rssGuid ${e.rssGuid} is not in podcast-feed.json`);
  }
  for (const [postId, key] of Object.entries(postEpisodes)) {
    if (!postsById.has(postId)) problems.push(`POST_EPISODES: unknown post ${postId}`);
    if (!episodes[key]) problems.push(`POST_EPISODES: ${postId} points to unknown episode ${key}`);
  }

  const podcastPage = readDist?.('podcast/index.html');
  if (readDist && podcastPage == null) problems.push('dist/podcast/index.html is missing (run npm run build first)');

  for (const ep of feedEpisodes) {
    const enrich = byGuid.get(ep.guid);
    if (!enrich) {
      problems.push(`${label(ep)}: no Spotify enrichment. Add an EPISODES entry with the verified spotifyId (GUID ${ep.guid})`);
    } else {
      if (!SPOTIFY_ID.test(enrich.spotifyId ?? '')) problems.push(`${label(ep)}: spotifyId is missing or malformed`);
      else if (enrich.spotifyUrl !== `https://open.spotify.com/episode/${enrich.spotifyId}`) problems.push(`${label(ep)}: spotifyUrl does not match spotifyId`);
    }

    // 1. listed on /podcast/ (and, there, with its Spotify link and player)
    if (podcastPage != null) {
      const marker = `data-episode-guid="${ep.guid}"`;
      const start = podcastPage.indexOf(marker);
      if (start < 0) problems.push(`${label(ep)}: missing from /podcast/`);
      else if (enrich && SPOTIFY_ID.test(enrich.spotifyId ?? '')) {
        const row = podcastPage.slice(start, podcastPage.indexOf('</article>', start));
        if (!row.includes(`open.spotify.com/episode/${enrich.spotifyId}`)) problems.push(`${label(ep)}: /podcast/ row has no Spotify link`);
        if (!row.includes(`embed/episode/${enrich.spotifyId}`)) problems.push(`${label(ep)}: /podcast/ row has no Spotify player`);
      }
    }

    // 3. the source post in every language
    const slugs = sourceSlugs(ep, enrich);
    if (!slugs.length) {
      problems.push(`${label(ep)}: no source post found (link it in the RSS description or set postPath in EPISODES)`);
      continue;
    }
    for (const slug of slugs) {
      const he = postsById.get(`he/${slug}`);
      if (!he) { problems.push(`${label(ep)}: source post he/${slug} does not exist`); continue; }
      const family = posts.filter((p) => keyOf(p) === keyOf(he) && !p.draft);
      for (const post of family) {
        if (!enrich) continue;
        if (postEpisodes[post.id] !== enrich.key) {
          problems.push(`${label(ep)}: post ${post.id} has no podcast block (add it to POST_EPISODES)`);
          continue;
        }
        if (!readDist) continue;
        const html = readDist(distPathForPost(post.id));
        if (html == null) { problems.push(`${label(ep)}: ${post.id} is not built (${distPathForPost(post.id)})`); continue; }
        const need = [
          ['class="podcast-listen"', 'the podcast block'],
          [`embed/episode/${enrich.spotifyId}`, 'the Spotify player'],
          [`href="https://open.spotify.com/episode/${enrich.spotifyId}"`, 'the Spotify link'],
          ['href="/podcast/"', 'the link to the podcast page'],
        ];
        for (const [needle, what] of need) {
          if (!html.includes(needle)) problems.push(`${label(ep)}: built page of ${post.id} lacks ${what}`);
        }
      }
    }
  }
  return problems;
}
