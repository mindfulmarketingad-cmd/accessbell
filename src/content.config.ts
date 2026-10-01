import { defineCollection, reference } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';
import { SOURCE_IDS } from './data/sources';

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
    /** The H1. Over 70 characters needs a seoTitle for the <title> tag. */
    title: z.string().max(110),
    /** <title> tag override when the H1 is long. Up to 47 characters gets " | AccessBell"
     * appended; longer titles (up to 65, the title tag limit) are used as written. */
    seoTitle: z.string().max(65).optional(),
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
  }).refine((d) => d.title.length <= 70 || d.seoTitle, { message: 'Titles over 70 characters need a seoTitle', path: ['seoTitle'] }),
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
    /** External references (ids from src/data/sources.ts), shown as "Sources and further reading" */
    sources: z.array(z.enum(SOURCE_IDS)).min(1),
  }),
});

export const collections = { blog, authors, help };
