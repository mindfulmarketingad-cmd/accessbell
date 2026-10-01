import { WCAG_GUIDES_CATEGORY } from './wcag-guides';
import { CRITERIA } from '../../server/wcag-criteria.js';
import { wcagCoverSlug } from '../data/blog-covers.js';

type PostLike = { id: string; data: { category: string } };

/**
 * "WCAG Codes Explained" guides live in the blog collection but are published
 * as the criterion pages at /resources/wcag/<sc-slug>, not under /blog.
 */
export const isWcagGuide = (p: PostLike) => p.data.category === WCAG_GUIDES_CATEGORY;

/** The success criterion a guide covers: "wcag-1-1-1-non-text-content" -> "1.1.1" */
export const guideSc = (id: string) => (id.match(/^wcag-(\d+)-(\d+)-(\d+)-/) || []).slice(1).join('.');

/** The criterion page slug for a guide, e.g. "1-1-1-non-text-content" (4.1.1 maps to its full criterion name). */
export const guideSlug = (id: string) => {
  const c = (CRITERIA as Record<string, { sc: string; name: string }>)[guideSc(id)];
  return c ? wcagCoverSlug(c.sc, c.name) : id.replace(/^wcag-/, '');
};

/** The public URL of any post. */
export const postPath = (p: PostLike) => (isWcagGuide(p) ? `/resources/wcag/${guideSlug(p.id)}` : `/blog/${p.id}`);
