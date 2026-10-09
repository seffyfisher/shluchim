import { getCollection } from 'astro:content';
import { SHOW_DRAFTS } from '../config';

/** Published posts, newest first. Drafts only when SHOW_DRAFTS=1. */
export async function getPosts() {
  const posts = await getCollection('posts', ({ id, data }) => data.draft !== true || (SHOW_DRAFTS && id !== 'example-draft'));
  return posts.sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf());
}

/** Build an internal URL that respects BASE_PATH. Always use this for links. */
export function url(path = '') {
  const base = import.meta.env.BASE_URL.replace(/\/$/, '');
  const p = path.replace(/^\//, '');
  return p ? `${base}/${p}` : `${base}/`;
}

const fmt = new Intl.DateTimeFormat('he-IL', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' });
export const formatDate = (d: Date) => fmt.format(d);
