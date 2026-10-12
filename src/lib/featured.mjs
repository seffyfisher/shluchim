// The homepage alone reorders posts. getPosts() remains chronological for feeds and topic pages.
const keyOf = (post) => post.data.translationKey ?? post.id.replace(/^(he|en)\//, '');

export function splitFeaturedPosts(posts, hebrewPosts, lang) {
  const hebrewByKey = new Map(hebrewPosts.map((post) => [keyOf(post), post]));
  const featured = [];
  const history = [];
  for (const post of posts) {
    const source = lang === 'en' ? hebrewByKey.get(keyOf(post)) ?? post : post;
    (source.data.featured === true ? featured : history).push(post);
  }
  // getPosts() already sorts newest first. Partitioning preserves that order in both groups.
  return { featured, history };
}
