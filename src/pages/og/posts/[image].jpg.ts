// Prerendered 1200x630 share cards (og:image / twitter:image), one per post with usable artwork. No runtime image service.
import type { APIRoute, GetStaticPaths } from 'astro';
import { getPosts, keyOf } from '../../../lib/posts';
import { postOgImage, ogName, renderOg } from '../../../lib/og-images.mjs';

export const prerender = true;
export const getStaticPaths: GetStaticPaths = async () => {
  const cards = new Map();
  for (const post of [...await getPosts('he'), ...await getPosts('en')]) {
    const image = await postOgImage(post);
    if (image) cards.set(ogName(keyOf(post), image), { params: { image: ogName(keyOf(post), image) }, props: { image } });
  }
  return [...cards.values()];
};

export const GET: APIRoute = async ({ props }) =>
  new Response(new Uint8Array(await renderOg(props.image)), { headers: { 'Content-Type': 'image/jpeg' } });
