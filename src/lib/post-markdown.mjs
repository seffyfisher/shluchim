// Plain-Markdown copies of the stories for AI answer engines and agents (`/posts/<slug>.md`, `/llms-full.txt`).
// Pure build-time string work (no astro imports), unit-tested in post-markdown.test.mjs. No client JS.
// The body is the post's own Markdown, unchanged except that site-relative links and media become absolute URLs,
// so a copy read outside the site still points to the right place. Reader-facing text is never rewritten here.

const SKIP = /^(?:[a-z][a-z0-9+.-]*:|#|\/\/)/i; // absolute (http:, mailto:, data:...), fragments, protocol-relative

/** Resolve a site-relative or document-relative URL against the post's canonical HTML URL. */
/** Content written before the domain move may still say '/shluchim/images/...'; the site now serves those at '/images/...'. */
const LEGACY = /^\/shluchim\/(?=(?:images|media|audio|public_assets)\/)/;
export const absUrl = (value, pageUrl) => (SKIP.test(value) ? value : new URL(value.replace(LEGACY, '/'), pageUrl).href);

/** Make Markdown links/images, reference definitions and raw-HTML src/href/poster attributes absolute. Code is left alone. */
export function absolutizeMarkdown(body, pageUrl) {
  const parts = body.split(/(```[\s\S]*?```|`[^`\n]*`)/g); // odd indexes are code spans/blocks
  return parts
    .map((part, i) => {
      if (i % 2) return part;
      return part
        .replace(/(\]\()(<[^>]+>|[^)\s]+)/g, (_, open, url) => open + (url.startsWith('<') ? `<${absUrl(url.slice(1, -1), pageUrl)}>` : absUrl(url, pageUrl)))
        .replace(/^(\s{0,3}\[[^\]]+\]:\s*)(\S+)/gm, (_, open, url) => open + absUrl(url, pageUrl))
        .replace(/\b(src|href|poster)=(["'])([^"']+)\2/g, (_, attr, q, url) => `${attr}=${q}${absUrl(url, pageUrl)}${q}`);
    })
    .join('');
}

const LABELS = {
  he: { lang: 'Hebrew (he)', other: 'English version' },
  en: { lang: 'English (en)', other: 'Hebrew version' },
  ar: { lang: 'Arabic (ar)', other: 'Hebrew version' },
};
const VERSION_LABELS = { he: 'Hebrew version', en: 'English version', ar: 'Arabic version' };

/**
 * One story as Markdown: title, lede, a small metadata list, then the body.
 * a = { title, description, url, lang, author, published, updated?, topics: string[], translationUrl?, translations?, body }
 */
export function postMarkdown(a) {
  const L = LABELS[a.lang];
  const trLines = a.translations
    ? Object.entries(a.translations).filter(([l, u]) => l !== a.lang && u).map(([l, u]) => `- ${VERSION_LABELS[l]}: ${u}`)
    : a.translationUrl
      ? [`- ${L.other}: ${a.translationUrl}`]
      : [];
  const meta = [
    `- URL: ${a.url}`,
    `- Author: ${a.author}`,
    `- Published: ${a.published}`,
    a.updated && a.updated !== a.published ? `- Updated: ${a.updated}` : null,
    `- Language: ${L.lang}`,
    a.topics?.length ? `- Topics: ${a.topics.join(', ')}` : null,
    ...trLines,
  ].filter(Boolean);
  const body = absolutizeMarkdown((a.body ?? '').trim(), a.url);
  return `# ${a.title}\n\n> ${a.description.replace(/\s+/g, ' ').trim()}\n\n${meta.join('\n')}\n\n${body}\n`;
}

/** `/posts/<slug>/` -> `/posts/<slug>.md` (works for absolute URLs too). */
export const markdownUrl = (postHtmlUrl) => postHtmlUrl.replace(/\/$/, '') + '.md';

/** Push every ATX heading down `by` levels (outside code fences), so stories nest under one file-level H1. */
export function demoteHeadings(md, by = 1) {
  let fence = false;
  return md
    .split('\n')
    .map((line) => {
      if (/^\s{0,3}(```|~~~)/.test(line)) fence = !fence;
      if (fence) return line;
      return line.replace(/^(#{1,6})(?=\s)/, (h) => '#'.repeat(Math.min(6, h.length + by)));
    })
    .join('\n');
}
