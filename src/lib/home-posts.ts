/** Keep each group's existing newest-first order; never mutate the dated history. */
export function featuredFirst<T extends { data: { featured?: boolean } }>(posts: T[]): T[] {
  return [
    ...posts.filter((post) => post.data.featured === true),
    ...posts.filter((post) => post.data.featured !== true),
  ];
}
