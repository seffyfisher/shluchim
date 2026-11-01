// The homepage alone reorders posts. getPosts() remains chronological for feeds and topic pages.
const keyOf = (post) => post.data.translationKey ?? post.id.replace(/^(he|en|ar)\//, '');

// Homepage order: the single newest post, then the featured posts, then the rest of the history.
// The newest post appears only once, in the latest slot, even when it is also featured.
export function splitFeaturedPosts(posts, hebrewPosts, lang) {
  const hebrewByKey = new Map(hebrewPosts.map((post) => [keyOf(post), post]));
  // getPosts() already sorts newest first, so the latest post is the first one.
  const [latest = null, ...rest] = posts;
  const featured = [];
  const history = [];
  for (const post of rest) {
    const source = lang !== 'he' ? hebrewByKey.get(keyOf(post)) ?? post : post;
    (source.data.featured === true ? featured : history).push(post);
  }
  // Partitioning preserves the newest-first order in both groups.
  return { latest, featured, history };
}
