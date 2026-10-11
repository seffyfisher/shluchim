// IndexNow (https://www.indexnow.org): tells Bing, Yandex, Naver and Seznam about new or changed URLs right after a deploy.
// Google and Brave do not support it. Pure helpers here so `npm test` can cover them; the CLI is scripts/indexnow.mjs.
import { parseFrontmatter } from './frontmatter.mjs';
import { TOPIC_SLUGS } from '../data/topics.mjs';

const PREFIX = { he: '', en: 'en/' };

/**
 * URLs (absolute, trailing slash) to submit for a set of changed files.
 * `read(path)` returns the file's text. Only published stories count: a draft never gets announced.
 * Any changed story also refreshes both homepages and the topic hubs the story belongs to.
 */
export function urlsFor(changed, read, siteBase) {
  const urls = new Set();
  const topics = new Set();
  let stories = false;
  for (const file of changed) {
    const m = /^src\/content\/posts\/(he|en)\/([^/]+)\.md$/.exec(file);
    if (m) {
      let data;
      try { data = parseFrontmatter(read(file)).data; } catch { continue; } // deleted or unreadable
      if (data.draft !== 'false' || m[2] === 'example-draft') continue;
      urls.add(`${siteBase}${PREFIX[m[1]]}posts/${m[2]}/`);
      for (const t of Array.isArray(data.topics) ? data.topics : []) topics.add(t);
      stories = true;
      continue;
    }
    const p = /^src\/content\/pages\/(he|en)\/about\.md$/.exec(file);
    if (p) urls.add(`${siteBase}${PREFIX[p[1]]}about/`);
    if (file === 'src/data/topics.mjs') for (const t of TOPIC_SLUGS) topics.add(t);
  }
  if (stories) for (const l of ['he', 'en']) urls.add(`${siteBase}${PREFIX[l]}`);
  for (const t of topics) for (const l of ['he', 'en']) if (TOPIC_SLUGS.includes(t)) urls.add(`${siteBase}${PREFIX[l]}topics/${t}/`);
  return [...urls];
}

/** The JSON body for POST https://api.indexnow.org/indexnow. The key file must be reachable at keyLocation. */
export const payload = (origin, base, key, urlList) => ({
  host: new URL(origin).host,
  key,
  keyLocation: `${origin}${base}/${key}.txt`,
  urlList,
});
