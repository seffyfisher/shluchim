// Build-time: size inline images and add a native, script-free viewer in posts.
// A "-NNN" suffix in the file name (e.g. terms-checkbox-390.webp) marks a retina capture of an NNN-px-wide view:
// if the file is wider than NNN, it is shown at NNN px (natural width / density). Otherwise at natural width.
import { readFileSync } from 'node:fs';
import { imageSize } from './img-dims.mjs';
import { withBase, imagePath } from './site-env.mjs';
import { imageViewer, escapeHtml as esc } from './image-viewer.mjs';
export const satteriImgSize = () => {
  let index = 0;
  const render = (node, ctx) => {
    const rel = imagePath(node.url);
    const src = rel ? withBase('/' + rel) : node.url;
    let d; try { d = rel ? imageSize(readFileSync(new URL('../../public/' + rel, import.meta.url))) : null; } catch { d = null; }
    let size = '';
    if (d) {
      let { width: w, height: h } = d;
      const n = /-(\d{3,4})\.[a-z]+$/i.exec(rel);
      if (n && w > +n[1]) { h = Math.round(h * +n[1] / w); w = +n[1]; }
      size = ` width="${w}" height="${h}"`;
    }
    const img = `<img src="${esc(src)}" alt="${esc(node.alt)}"${node.title ? ` title="${esc(node.title)}"` : ''}${size} loading="lazy" decoding="async">`;
    const fm = ctx.data?.astro?.frontmatter;
    return fm?.date ? imageViewer(img, { id: `post-image-${++index}`, src, alt: node.alt, lang: fm.lang ?? 'he' }) : img;
  };
  return {
    name: 'img-size',
    link(node, ctx) {
      // An image-only link becomes a viewer; never nest a button inside a link.
      if (node.children.length === 1 && node.children[0].type === 'image' && ctx.data?.astro?.frontmatter?.date) {
        ctx.replaceNode(node, { type: 'html', value: render(node.children[0], ctx) });
      }
    },
    image(node, ctx) {
      if (ctx.parent(node)?.type === 'link') return;
      if (!imagePath(node.url) && !ctx.data?.astro?.frontmatter?.date) return;
      ctx.replaceNode(node, { type: 'html', value: render(node, ctx) });
    },
  };
};
