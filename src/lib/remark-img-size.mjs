// Build-time: give post images their real width/height so they never render larger than their pixels.
// A "-NNN" suffix in the file name (e.g. terms-checkbox-390.webp) marks a retina capture of an NNN-px-wide view:
// if the file is wider than NNN, it is shown at NNN px (natural width / density). Otherwise at natural width.
import { readFileSync } from 'node:fs';
import { imageSize } from './img-dims.mjs';
const esc = (s) => String(s ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
export const satteriImgSize = {
  name: 'img-size',
  image(node, ctx) {
    const m = /^\/shluchim\/(images\/.+)$/.exec(node.url || '');
    if (!m) return;
    let d; try { d = imageSize(readFileSync(new URL('../../public/' + m[1], import.meta.url))); } catch { return; }
    if (!d) return;
    let { width: w, height: h } = d;
    const n = /-(\d{3,4})\.[a-z]+$/i.exec(m[1]);
    if (n && w > +n[1]) { h = Math.round(h * +n[1] / w); w = +n[1]; }
    ctx.replaceNode(node, { type: 'html', value: `<img src="${esc(node.url)}" alt="${esc(node.alt)}" width="${w}" height="${h}" loading="lazy" decoding="async">` });
  },
};
