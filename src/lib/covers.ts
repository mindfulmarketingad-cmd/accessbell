import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { coverAlt } from '../data/blog-covers.js';

const publicDir = resolve(process.cwd(), 'public');

/** Featured image paths for a blog post (from npm run covers), or null if not generated yet. */
export function coverFor(slug: string) {
  const src = `/blog/covers/${slug}.webp`;
  const og = `/blog/og/${slug}.png`;
  if (!existsSync(resolve(publicDir, src.slice(1)))) return null;
  return { src, og: existsSync(resolve(publicDir, og.slice(1))) ? og : null, alt: coverAlt(slug), width: 1200, height: 630 };
}
