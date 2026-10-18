// Build-time share cards (og:image / twitter:image) cut from each post's own artwork.
// Source order: frontmatter `socialImage`, then `cover`, then the article's Markdown images.
// Never enlarged: a source too small for a 600x315 card leaves the post on the site-wide card.
import { readFile, stat } from 'node:fs/promises';
import { resolve, sep } from 'node:path';
import { createHash } from 'node:crypto';
import sharp from 'sharp';
import { withBase } from './site-env.mjs';
import { storyImageCandidates } from './story-images.mjs';

export const OG_WIDTH = 1200;
export const OG_HEIGHT = 630;
/** Facebook's minimum for a large link card; smaller crops fall back to the site card. */
export const OG_MIN_WIDTH = 600;
export const OG_QUALITY = 88;
const root = resolve(process.cwd());
const cache = new Map();

/** The largest 1200:630 box inside a source, scaled down to 1200x630 at most and never enlarged. */
export function ogCropSize(width, height) {
  let w = width, h = Math.round(width * OG_HEIGHT / OG_WIDTH);
  if (h > height) { h = height; w = Math.round(height * OG_WIDTH / OG_HEIGHT); }
  return w > OG_WIDTH ? { width: OG_WIDTH, height: OG_HEIGHT } : { width: w, height: h };
}

async function measure(file) {
  const info = await stat(file);
  const key = `${file}:${info.size}:${info.mtimeMs}`;
  if (!cache.has(key)) cache.set(key, (async () => {
    const bytes = await readFile(file);
    const data = await sharp(bytes).metadata();
    if (!data.width || !data.height) return;
    const rotated = data.orientation >= 5 && data.orientation <= 8;
    const width = rotated ? data.height : data.width, height = rotated ? data.width : data.height;
    const size = ogCropSize(width, height);
    return { file, bytes, sourceWidth: width, sourceHeight: height, ...size };
  })());
  return cache.get(key);
}

/** Ordered share-image candidates of a post: explicit frontmatter first, then the article's own images. */
export function ogCandidates(post) {
  const d = post.data ?? {};
  const body = storyImageCandidates(post.body);
  const explicit = [];
  if (d.socialImage) {
    const [local] = storyImageCandidates(`![](${d.socialImage})`);
    if (local) explicit.push({ ...local, alt: body.find((b) => b.src === local.src)?.alt || d.coverAlt || '', source: 'socialImage' });
  }
  if (d.cover?.fsPath && resolve(d.cover.fsPath).startsWith(root + sep)) explicit.push({ file: resolve(d.cover.fsPath), alt: d.coverAlt ?? '', source: 'cover' });
  return { explicit, body: body.map((b) => ({ ...b, source: 'body' })) };
}

/**
 * The share card for a post, or undefined for the site-wide card.
 * An explicit image wins when it makes at least a 600px card. Among article images the first one that
 * fills 1200x630 wins; otherwise the largest that still makes a 600px card (smaller than 1200, never upscaled).
 */
export async function postOgImage(post) {
  const { explicit, body } = ogCandidates(post);
  const load = async (c) => {
    try {
      const { bytes, ...m } = await measure(c.file) ?? {};
      if (!m.width) return undefined;
      // Chosen share art is composed around its centre; for article images let sharp find the salient region.
      const position = c.source === 'body' ? 'attention' : 'centre';
      // The name changes with the source or the recipe, so social caches see a new URL.
      const id = createHash('sha256').update(`og-${m.width}x${m.height}-q${OG_QUALITY}-${position}-${sharp.versions.sharp}:`).update(bytes).digest('hex').slice(0, 10);
      return { ...m, id, position, alt: c.alt, source: c.source };
    } catch { return undefined; }
  };
  for (const c of explicit) {
    const m = await load(c);
    if (m && m.width >= OG_MIN_WIDTH) return m;
  }
  let best;
  for (const c of body) {
    const m = await load(c);
    if (!m) continue;
    if (m.width === OG_WIDTH) return m;
    if (m.width >= OG_MIN_WIDTH && (!best || m.width > best.width)) best = m;
  }
  return best;
}

/** File name (without extension) under /og/posts/: a Hebrew/English pair with the same artwork shares one card. */
export const ogName = (key, image) => `${key}-${image.id}`;
export const ogUrl = (key, image) => withBase(`/og/posts/${ogName(key, image)}.jpg`);

export const renderOg = (image) => sharp(image.file).rotate()
  .resize(image.width, image.height, { fit: 'cover', position: image.position === 'attention' ? sharp.strategy.attention : 'centre' })
  .flatten({ background: '#fafafa' })
  .jpeg({ quality: OG_QUALITY, mozjpeg: true })
  .toBuffer();
