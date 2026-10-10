import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

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
      description: z.string(),
      date: z.coerce.date(),
      draft: z.boolean().default(true),
      tags: z.array(z.string()).optional(),
      cover: image().optional(),
      coverAlt: z.string().optional(),
      ...i18nFields,
    }),
});

const pages = defineCollection({
  loader: glob({ pattern: '{he,en}/**/*.md', base: './src/content/pages' }),
  schema: z.object({ title: z.string(), description: z.string(), ...i18nFields }),
});

export const collections = { posts, pages };
