/** WhatsApp share link for a post: wa.me with the title and a UTM-tagged canonical URL. No client JS. */

export const WA_SHARE_UTM = {
  source: 'whatsapp',
  medium: 'organic_social',
  contentSuffix: '_wabutton',
};

/**
 * Build https://wa.me/?text=… from the post title and its canonical absolute URL.
 * `slug` is `keyOf(post)` (translationKey, else the URL-path slug) so utm_content
 * stays the same across HE/EN/AR even when the path slug differs by language.
 */
export function whatsappShareUrl({ title, pageUrl, slug }) {
  if (typeof title !== 'string' || !title.trim()) throw new Error('whatsappShareUrl: title is required');
  if (typeof pageUrl !== 'string' || !pageUrl) throw new Error('whatsappShareUrl: pageUrl is required');
  if (typeof slug !== 'string' || !slug) throw new Error('whatsappShareUrl: slug is required');
  const shared = new URL(pageUrl);
  shared.searchParams.set('utm_source', WA_SHARE_UTM.source);
  shared.searchParams.set('utm_medium', WA_SHARE_UTM.medium);
  shared.searchParams.set('utm_content', `${slug}${WA_SHARE_UTM.contentSuffix}`);
  return `https://wa.me/?text=${encodeURIComponent(`${title} ${shared.href}`)}`;
}
