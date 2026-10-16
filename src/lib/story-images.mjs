// Build-time previews use only images already present in the article. No remote fetches or client script.
import { readFile, stat } from 'node:fs/promises';
import { resolve, sep } from 'node:path';
import { createHash } from 'node:crypto';
import sharp from 'sharp';
import { withBase } from './site-env.mjs';

const root = resolve(process.cwd());
const publicRoot = resolve(root, 'public');
const cache = new Map();
export const PREVIEW_QUALITY = 90;
export const PREVIEW_EFFORT = 6;

export function storyImageCandidates(body = '') {
  const text = body.replace(/```[\s\S]*?```|~~~[\s\S]*?~~~/g, '');
  return [...text.matchAll(/!\[([^\]]*)\]\(\s*<?([^\s)>]+)>?(?:\s+["'][^)]*["'])?\s*\)/g)]
    .flatMap(([, alt, original]) => {
      const src = original.replace(/^\/shluchim(?=\/(?:images|media)\/)/, '').split(/[?#]/)[0];
      if (!/^\/(?:images|media)\/.+\.(?:webp|png|jpe?g|gif|avif)$/i.test(src)) return [];
      let decoded;
      try { decoded = decodeURIComponent(src); } catch { return []; }
      if (decoded.split('/').some((part) => part === '..') || decoded.includes('\\')) return [];
      return [{ src, alt, file: resolve(publicRoot, '.' + decoded) }];
    });
}

async function metadata(file) {
  const info = await stat(file);
  const key = `${file}:${info.size}:${info.mtimeMs}`;
  if (!cache.has(key)) cache.set(key, (async () => {
    const bytes = await readFile(file);
    const data = await sharp(bytes).metadata();
    if (!data.width || !data.height) return;
    const rotated = data.orientation >= 5 && data.orientation <= 8;
    const id = createHash('sha256').update(`story-webp-q${PREVIEW_QUALITY}-e${PREVIEW_EFFORT}-orient-${sharp.versions.sharp}:`).update(bytes).digest('hex').slice(0, 16);
    return { file, id, width: rotated ? data.height : data.width, height: rotated ? data.width : data.height };
  })());
  return cache.get(key);
}

export async function storyImage(post) {
  const candidates = storyImageCandidates(post.body);
  // Astro covers are also article content; use one when the body has no local image.
  const cover = post.data?.cover;
  if (cover?.fsPath && resolve(cover.fsPath).startsWith(root + sep)) candidates.push({ file: resolve(cover.fsPath), alt: post.data.coverAlt ?? '' });
  for (const candidate of candidates) {
    try {
      const image = await metadata(candidate.file);
      if (image) return { ...image, alt: candidate.alt, original: candidate.src ?? cover.src };
    } catch { /* A missing or unsupported image leaves an ordinary text row. */ }
  }
}

export const previewWidth = (image, width) => Math.min(width, image.width);
export const previewUrl = (image, width) => withBase(`/media/story-previews/${image.id}-${previewWidth(image, width)}.webp`);
export const previewSrcset = (image, widths) => [...new Set(widths.map((width) => previewWidth(image, width)))].map((width) => `${previewUrl(image, width)} ${width}w`).join(', ');
