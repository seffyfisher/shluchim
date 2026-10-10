// Build-time: a ```photo <id>``` block in a page renders an archival <figure> from src/data/about-photos.json
// (captions and alt text live only in that file). Lazy-loaded, with real width/height. No client JS.
import { readFileSync } from 'node:fs';
const esc = (s) => String(s ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
const load = () => JSON.parse(readFileSync(new URL('../data/about-photos.json', import.meta.url), 'utf8'));
export const satteriPhoto = {
  name: 'photo',
  code(node, ctx) {
    if (node.lang !== 'photo') return;
    const lang = ctx.data?.astro?.frontmatter?.lang ?? 'he';
    const id = String(node.value || node.meta || '').trim();
    const p = load()[id];
    if (!p) throw new Error(`photo block: unknown id "${id}"`);
    const w = p.display, h = Math.round(p.height * p.display / p.width);
    const cap = esc(p[`caption_${lang}`]).split('\n').join('<br>');
    ctx.replaceNode(node, { type: 'html', value:
      `<figure class="archival archival-${esc(id)}"><span class="paper"><img src="${esc(p.src)}" alt="${esc(p[`alt_${lang}`])}" width="${w}" height="${h}" loading="lazy" decoding="async"></span>` +
      (cap ? `<figcaption>${cap}</figcaption>` : '') + `</figure>` });
  },
};
