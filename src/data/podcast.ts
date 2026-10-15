// Approved, published audio only. This file never creates or syndicates audio.
export const PODCAST = {
  name: 'שְׁלוּחִים',
  spotifyShowId: '6ueCCm5YS5Oth66FbwkjO8',
  spotifyUrl: 'https://open.spotify.com/show/6ueCCm5YS5Oth66FbwkjO8',
  appleUrl: 'https://podcasts.apple.com/us/podcast/id6823130897',
  feedUrl: 'https://www.spreaker.com/show/7465546/episodes/feed',
} as const;

export interface Episode {
  /** Exact GUID from the official RSS, verified separately from the Spotify ID. */
  rssGuid: string;
  number?: number;
  title: string;
  description?: string;
  spotifyId: string;
  spotifyUrl: string;
  spreakerUrl?: string;
  published: string;
  duration: string;
  durationIso: string;
  language: string;
  aiNarrated: boolean;
  postPath?: string;
  postTitle?: string;
}

export const EPISODES = {
  'wake-up-sky-1': {
    rssGuid: 'https://api.spreaker.com/episode/75804362',
    number: 1,
    title: 'עורו, שמיים. | פרק 1',
    description: 'הבן שלי קורא לצ׳אט הקולי ״שמיים״. אחרי שעתיים וחצי של עבודה בקול במשרד, התחלתי להבין אותו.',
    spotifyId: '1Ccf2UKMMvEhrCb4mvnKJt',
    spotifyUrl: 'https://open.spotify.com/episode/1Ccf2UKMMvEhrCb4mvnKJt',
    spreakerUrl: 'https://www.spreaker.com/episode/wrw-smyym-prq-1--75804362',
    published: '2026-10-15',
    duration: '5:14',
    durationIso: 'PT5M14S',
    language: 'he',
    aiNarrated: true,
    postPath: 'posts/2026-10-13-wake-up-sky/',
    postTitle: 'עורו, שמיים.',
  },
} as const satisfies Record<string, Episode>;

/** Only verified GUID enrichment can supply Spotify/post links to an RSS row. */
export function episodeForGuid(guid: string): Episode | undefined {
  return (Object.values(EPISODES) as Episode[]).find((episode) => episode.rssGuid === guid);
}

export function validateEpisodeEnrichment(feedGuids: string[]) {
  const seen = new Set<string>();
  for (const episode of Object.values(EPISODES) as Episode[]) {
    if (!episode.rssGuid || !feedGuids.includes(episode.rssGuid)) throw new Error('Podcast enrichment: exact verified RSS GUID missing from snapshot');
    if (seen.has(episode.rssGuid)) throw new Error('Podcast enrichment: duplicate RSS GUID');
    seen.add(episode.rssGuid);
    if (!/^[A-Za-z0-9]{22}$/.test(episode.spotifyId) || episode.spotifyUrl !== `https://open.spotify.com/episode/${episode.spotifyId}`) throw new Error('Podcast enrichment: Spotify ID and direct URL must agree');
  }
}

// Exact content collection IDs, including language. Never compare display titles.
const POST_EPISODES: Record<string, keyof typeof EPISODES> = {
  'he/2026-10-13-wake-up-sky': 'wake-up-sky-1',
};

export function episodeForPost(postId: string): Episode | undefined {
  const key = POST_EPISODES[postId];
  return key ? EPISODES[key] : undefined;
}

export function validatePodcastAssociations(postIds: string[]) {
  for (const [postId, key] of Object.entries(POST_EPISODES)) {
    if (!postIds.includes(postId)) throw new Error(`Podcast association: unknown post ${postId}`);
    if (!EPISODES[key]) throw new Error(`Podcast association: unknown episode ${key}`);
  }
}
