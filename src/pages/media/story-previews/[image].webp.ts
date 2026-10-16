// Prerendered WebP assets, not a runtime image service. Source artwork stays untouched.
import type { APIRoute, GetStaticPaths } from 'astro';
import sharp from 'sharp';
import { getPosts, keyOf } from '../../../lib/posts';
import { splitFeaturedPosts } from '../../../lib/featured.mjs';
import { storyImage, previewWidth, PREVIEW_QUALITY, PREVIEW_EFFORT } from '../../../lib/story-images.mjs';

export const prerender = true;
export const getStaticPaths: GetStaticPaths = async () => {
  const he = await getPosts('he'), en = await getPosts('en');
  const featured = new Set([...splitFeaturedPosts(he, he, 'he').featured, ...splitFeaturedPosts(en, he, 'en').featured].map(keyOf));
  const assets = new Map();
  for (const post of [...he, ...en]) {
    const image = await storyImage(post);
    if (!image) continue;
    for (const requested of featured.has(keyOf(post)) ? [160, 320, 480, 768, 1120, 1536] : [160, 320]) {
      const width = previewWidth(image, requested), name = `${image.id}-${width}`;
      assets.set(name, { params: { image: name }, props: { file: image.file, width } });
    }
  }
  return [...assets.values()];
};

export const GET: APIRoute = async ({ props }) => {
  const image = await sharp(props.file).rotate().resize({ width: props.width, withoutEnlargement: true }).webp({ quality: PREVIEW_QUALITY, effort: PREVIEW_EFFORT }).toBuffer();
  return new Response(new Uint8Array(image), { headers: { 'Content-Type': 'image/webp' } });
};
