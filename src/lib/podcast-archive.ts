import { PODCAST } from '../data/podcast.ts';

export interface FeedEpisode {
  guid: string;
  title: string;
  published: string;
  durationSeconds: number | null;
  number: number | null;
  language: string;
  description: string;
  pageUrl: string;
  audioUrl: string;
  audioType: string;
}

/** Build from a checked-in snapshot, never from a live browser request. */
export function podcastArchive(snapshot: unknown): FeedEpisode[] {
  const data = snapshot as { schemaVersion?: number; source?: string; episodes?: FeedEpisode[] };
  if (data?.schemaVersion !== 1 || data?.source !== PODCAST.feedUrl || !Array.isArray(data?.episodes) || !data.episodes.length) {
    throw new Error('Podcast archive: missing or invalid last-known-good RSS snapshot');
  }
  const seen = new Set<string>();
  for (const episode of data.episodes) {
    if (!episode.guid?.trim() || seen.has(episode.guid)) throw new Error('Podcast archive: GUIDs must be present and unique');
    seen.add(episode.guid);
    if (!episode.title?.trim() || !Number.isFinite(Date.parse(episode.published))) throw new Error('Podcast archive: invalid title or publication date');
    if (episode.durationSeconds !== null && (!Number.isSafeInteger(episode.durationSeconds) || episode.durationSeconds <= 0)) throw new Error('Podcast archive: invalid duration');
    for (const value of [episode.pageUrl, episode.audioUrl]) {
      const url = new URL(value);
      if (!['https:', 'http:'].includes(url.protocol) || url.username || url.password) throw new Error('Podcast archive: invalid public URL');
    }
    if (!episode.audioType?.startsWith('audio/') && episode.audioType !== 'application/ogg') throw new Error('Podcast archive: invalid audio type');
    if (typeof episode.description !== 'string' || !episode.language) throw new Error('Podcast archive: invalid description or language');
  }
  return [...data.episodes].sort((a, b) => Date.parse(b.published) - Date.parse(a.published) || b.guid.localeCompare(a.guid));
}

export function podcastDuration(seconds: number | null): string | undefined {
  if (seconds === null) return undefined;
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor(seconds / 60) % 60;
  const remainder = String(seconds % 60).padStart(2, '0');
  return hours ? `${hours}:${String(minutes).padStart(2, '0')}:${remainder}` : `${minutes}:${remainder}`;
}
