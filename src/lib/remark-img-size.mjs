// Build-time: give post images their real width/height so they never render larger than their pixels.
// A "-NNN" suffix in the file name (e.g. terms-checkbox-390.webp) marks a retina capture of an NNN-px-wide view:
// if the file is wider than NNN, it is shown at NNN px (natural width / density). Otherwise at natural width.
import { readFileSync } from 'node:fs';
import { imageSize } from './img-dims.mjs';
import { withBase, imagePath } from './site-env.mjs';
const esc = (s) => String(s ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
export const satteriImgSize = {
  name: 'img-size',
  image(node, ctx) {
    const rel = imagePath(node.url); // 'images/posts/x.webp' for '/images/...' and the legacy '/shluchim/images/...'
    if (!rel) return;
    const src = withBase('/' + rel);
    let d; try { d = imageSize(readFileSync(new URL('../../public/' + rel, import.meta.url))); } catch { d = null; }
    if (!d) { ctx.replaceNode(node, { type: 'html', value: `<img src="${esc(src)}" alt="${esc(node.alt)}" loading="lazy" decoding="async">` }); return; }
    let { width: w, height: h } = d;
    const n = /-(\d{3,4})\.[a-z]+$/i.exec(rel);
    if (n && w > +n[1]) { h = Math.round(h * +n[1] / w); w = +n[1]; }
    ctx.replaceNode(node, { type: 'html', value: `<img src="${esc(src)}" alt="${esc(node.alt)}" width="${w}" height="${h}" loading="lazy" decoding="async">` });
  },
};
