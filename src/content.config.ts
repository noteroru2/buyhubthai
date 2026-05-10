import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const sell = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/sell' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    draft: z.boolean().optional(),
    serviceName: z.string().optional(),
    heroImageAlt: z.string().optional()
  })
});

const areas = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/areas' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    draft: z.boolean().optional(),
    province: z.string(),
    heroImageAlt: z.string().optional()
  })
});

const blog = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/blog' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    draft: z.boolean().optional(),
    pubDate: z.coerce.date(),
    updatedDate: z.coerce.date().optional(),
    author: z.string().optional(),
    heroImageAlt: z.string().optional(),
    tags: z.array(z.string()).optional(),
    faqs: z
      .array(
        z.object({
          question: z.string(),
          answer: z.string()
        })
      )
      .optional()
  })
});

export const collections = { sell, areas, blog };
