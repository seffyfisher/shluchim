// SEO / GEO helpers. Pure functions (no astro imports) so `npm test` can run them under plain node.
// Everything here is build-time string work: the site still ships zero client JS.
export type Lang = 'he' | 'en';

/** Collapse whitespace and cut at a word boundary with an ellipsis. */
export function clip(text: string, max: number): string {
  const t = text.replace(/\s+/g, ' ').trim();
  if (t.length <= max) return t;
  const cut = t.slice(0, max - 1);
  const space = cut.lastIndexOf(' ');
  return (space > max * 0.6 ? cut.slice(0, space) : cut).replace(/[\s,.;:־-]+$/, '') + '…';
}

/** `2026-10-09` (UTC date part). */
export const isoDate = (d: Date) => d.toISOString().slice(0, 10);

/** `<title>` text: the page's own title plus the brand, e.g. "My post · Shluchim". */
export const withBrand = (title: string, brand: string) => `${title} · ${brand}`;

/** Serialise JSON-LD for an inline <script type="application/ld+json"> (never lets the data close the tag). */
export const safeJson = (data: unknown) =>
  JSON.stringify(data).replace(/</g, '\\u003c').replace(/\u2028/g, '\\u2028').replace(/\u2029/g, '\\u2029');

/** Rough word count of a markdown body (code fences and image syntax removed). */
export function wordCount(body = ''): number {
  return body
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/!\[[^\]]*\]\([^)]*\)/g, ' ')
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/[#>*_`|~-]/g, ' ')
    .split(/\s+/)
    .filter(Boolean).length;
}

/** Stable @ids so every page's JSON-LD points at the same entities. `heRoot` / `langRoot` = absolute site roots. */
export const nodeIds = (heRoot: string, langRoot: string) => ({ person: `${heRoot}#seffy`, website: `${langRoot}#website`, blog: `${langRoot}#blog` });

type Ref = { '@id': string };
const ref = (id: string): Ref => ({ '@id': id });
const drop = <T extends Record<string, unknown>>(o: T): T =>
  Object.fromEntries(Object.entries(o).filter(([, v]) => v !== undefined && v !== null && !(Array.isArray(v) && v.length === 0))) as T;

export const personNode = (a: { id: string; name: string; alternateName?: string | string[]; url: string; description?: string; sameAs?: string[] }) =>
  drop({ '@type': 'Person', '@id': a.id, name: a.name, alternateName: a.alternateName, url: a.url, description: a.description, sameAs: a.sameAs });

export const websiteNode = (a: { id: string; url: string; name: string; alternateName?: string | string[]; description: string; lang: Lang; publisherId: string }) =>
  drop({ '@type': 'WebSite', '@id': a.id, url: a.url, name: a.name, alternateName: a.alternateName, description: a.description, inLanguage: a.lang, publisher: ref(a.publisherId) });

export const blogNode = (a: { id: string; url: string; name: string; description: string; lang: Lang; websiteId: string; publisherId: string; keywords?: string[] }) =>
  drop({ '@type': 'Blog', '@id': a.id, url: a.url, name: a.name, description: a.description, inLanguage: a.lang, isPartOf: ref(a.websiteId), publisher: ref(a.publisherId), author: ref(a.publisherId), keywords: a.keywords?.length ? a.keywords.join(', ') : undefined });

export const blogPostingNode = (a: {
  url: string; headline: string; description: string; lang: Lang; published: string; modified: string;
  image?: string; blogId: string; personId: string; keywords?: string[]; section?: string; words?: number;
}) =>
  drop({
    '@type': 'BlogPosting',
    '@id': `${a.url}#article`,
    mainEntityOfPage: { '@type': 'WebPage', '@id': a.url },
    url: a.url,
    headline: clip(a.headline, 110),
    description: a.description,
    inLanguage: a.lang,
    datePublished: a.published,
    dateModified: a.modified,
    image: a.image ? [a.image] : undefined,
    author: ref(a.personId),
    publisher: ref(a.personId),
    isPartOf: ref(a.blogId),
    articleSection: a.section,
    keywords: a.keywords?.length ? a.keywords.join(', ') : undefined,
    wordCount: a.words,
  });

export const breadcrumbNode = (items: { name: string; url: string }[]) => ({
  '@type': 'BreadcrumbList',
  itemListElement: items.map((it, i) => ({ '@type': 'ListItem', position: i + 1, name: it.name, item: it.url })),
});

/** About / topic hub / team pages. `list` becomes an ItemList of the posts on the page. */
export const pageNode = (a: {
  type: 'WebPage' | 'AboutPage' | 'CollectionPage'; url: string; name: string; description: string; lang: Lang;
  websiteId: string; mainEntityId?: string; list?: { name: string; url: string }[];
}) =>
  drop({
    '@type': a.type,
    '@id': `${a.url}#webpage`,
    url: a.url,
    name: a.name,
    description: a.description,
    inLanguage: a.lang,
    isPartOf: ref(a.websiteId),
    mainEntity: a.mainEntityId ? ref(a.mainEntityId) : a.list?.length
      ? { '@type': 'ItemList', itemListElement: a.list.map((it, i) => ({ '@type': 'ListItem', position: i + 1, name: it.name, url: it.url })) }
      : undefined,
  });
