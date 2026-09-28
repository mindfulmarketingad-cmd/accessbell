/**
 * Verified customer reviews shown on /reviews.
 *
 * Only add reviews you have written permission to publish from real,
 * identifiable customers. Fabricated or incentivized-without-disclosure
 * reviews violate the FTC rule on consumer reviews (16 CFR Part 465)
 * and Google's structured data policies. Review schema is emitted only
 * when this list is non-empty.
 */
export type Review = {
  author: string;
  role?: string;
  company?: string;
  rating: 1 | 2 | 3 | 4 | 5;
  title: string;
  body: string;
  /** ISO date, e.g. 2026-09-28 */
  date: string;
};

export const REVIEWS: Review[] = [];
