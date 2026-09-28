import { defineCollection, reference } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

/**
 * People (or teams) who write and review articles. Each entry gets a page
 * at /authors/<file-name>. Only list real contributors who agreed to be named.
 */
const authors = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/authors' }),
  schema: z.object({
    name: z.string().max(80),
    /** "person" for an individual, "team" for a shared editorial byline */
    type: z.enum(['person', 'team']).default('person'),
    jobTitle: z.string().max(80),
    /** One or two sentences shown in article bylines and the authors hub */
    shortBio: z.string().min(40).max(300),
    expertise: z.array(z.string()).default([]),
    /** Public profiles (LinkedIn, personal site) for sameAs structured data */
    sameAs: z.array(z.string().url()).default([]),
  }),
});

const blog = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/blog' }),
  schema: z.object({
    title: z.string().max(70),
    /** <title> tag override when the H1 is longer than ~60 characters */
    seoTitle: z.string().max(47).optional(),
    description: z.string().min(110).max(165),
    pubDate: z.coerce.date(),
    updatedDate: z.coerce.date().optional(),
    category: z.string(),
    /** Who wrote, researched or reviewed the article. The first entry is the main author. */
    contributors: z
      .array(
        z.object({
          author: reference('authors'),
          role: z.enum(['Author', 'Researcher', 'Reviewer', 'Expert']).default('Author'),
        }),
      )
      .min(1),
    /** "How we reviewed this article" timeline, newest first */
    history: z.array(z.object({ date: z.coerce.date(), note: z.string() })).default([]),
    /** Rendered as a FAQ section with FAQPage structured data */
    faqs: z.array(z.object({ q: z.string(), a: z.string() })).default([]),
    /** Slugs of related posts for the "Keep reading" block */
    related: z.array(z.string()).default([]),
    draft: z.boolean().default(false),
  }),
});

/**
 * Help Center articles at /resources/help-center/<category>/<file-name>.
 * Files live in a folder named after their category.
 */
const help = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/help' }),
  schema: z.object({
    title: z.string().max(80),
    description: z.string().min(80).max(165),
    /** Position within its category */
    order: z.number().int(),
    /** Position in the Quick Start Guide, when the article belongs there */
    quickStart: z.number().int().optional(),
    updatedDate: z.coerce.date(),
  }),
});

export const collections = { blog, authors, help };
