import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';
import { TOPIC_SLUGS } from './data/topics.mjs';

// Content is split by language: src/content/posts/{he,en}/<slug>.md and src/content/pages/{he,en}/<name>.md.
// Entry ids are "<lang>/<slug>". The URL uses only <slug> (Hebrew at the root, English under /en/).
// `lang` defaults to the folder; `translationKey` (defaults to the file name) links a he/en pair.
const i18nFields = {
  lang: z.enum(['he', 'en']).optional(),
  translationKey: z.string().optional(),
};

const posts = defineCollection({
  loader: glob({ pattern: '{he,en}/**/*.md', base: './src/content/posts' }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      // emoji: shown instead of the number in the story lists. Set on the HE post only; EN uses its pair's (translationKey).
      // Must be unique across posts and contextual (list guard enforces present + unique).
      emoji: z.string().optional(),
      description: z.string(),
      // Short copy for the homepage and topic lists. The full description remains on the post page and in RSS.
      listDescription: z.string().optional(),
      date: z.coerce.date(),
      draft: z.boolean().default(true),
      featured: z.boolean().default(false),
      tags: z.array(z.string()).optional(),
      // SEO fields. All optional, and none of them change what the reader sees on the page:
      // seoTitle -> <title> (brand is appended at build time), seoDescription -> meta description + JSON-LD,
      // updated -> dateModified / sitemap lastmod (defaults to `date`), topics -> topic hubs + related stories.
      seoTitle: z.string().optional(),
      seoDescription: z.string().optional(),
      updated: z.coerce.date().optional(),
      topics: z.array(z.enum(TOPIC_SLUGS as [string, ...string[]])).optional(),
      cover: image().optional(),
      coverAlt: z.string().optional(),
      socialImage: z.string().optional(),
      // heOnly: an intentionally Hebrew-only post (Seffy's decision). It is exempt from the HE/EN list parity
      // check and the missing-translation warning, and gets no English page, hreflang or sitemap alternate.
      heOnly: z.boolean().optional(),
      // hideWaCta: skip the WhatsApp invite line at the end of a Hebrew post (e.g. the WhatsApp group post itself).
      hideWaCta: z.boolean().optional(),
      ...i18nFields,
    }),
});

const pages = defineCollection({
  loader: glob({ pattern: '{he,en}/**/*.md', base: './src/content/pages' }),
  schema: z.object({ title: z.string(), description: z.string(), seoTitle: z.string().optional(), seoDescription: z.string().optional(), ...i18nFields }),
});

export const collections = { posts, pages };
