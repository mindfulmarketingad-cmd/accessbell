import { getCollection } from 'astro:content';

export type RouteEntry = { path: string; label: string; note?: string; lastmod: Date; group: 'main' | 'blog' | 'company' };

/** Date the static pages were last meaningfully changed. Bump when editing them. */
const STATIC_LASTMOD = new Date('2026-09-28');

const STATIC: Omit<RouteEntry, 'lastmod'>[] = [
  { path: '/', label: 'Home', note: 'Free website accessibility checker', group: 'main' },
  { path: '/pricing', label: 'Pricing', note: 'Plans and feature comparison', group: 'main' },
  { path: '/blog', label: 'Blog', note: 'Accessibility guides and compliance insights', group: 'main' },
  { path: '/reviews', label: 'Reviews', note: 'Verified customer reviews', group: 'main' },
  { path: '/about', label: 'About', note: 'Our mission and approach', group: 'company' },
  { path: '/contact', label: 'Contact', note: 'Sales, support and free trials', group: 'company' },
  { path: '/disclaimer', label: 'Disclaimer', group: 'company' },
  { path: '/privacy', label: 'Privacy Policy', group: 'company' },
  { path: '/terms', label: 'Terms of Service', group: 'company' },
  { path: '/sitemap', label: 'Sitemap', group: 'company' },
];

/** Every indexable URL on the site. Feeds /sitemap and /sitemap.xml. */
export async function getRoutes(): Promise<RouteEntry[]> {
  const posts = (await getCollection('blog', ({ data }) => !data.draft)).sort(
    (a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf(),
  );
  const newestPost = posts[0]?.data.updatedDate ?? posts[0]?.data.pubDate ?? STATIC_LASTMOD;

  return [
    ...STATIC.map((r) => ({
      ...r,
      // Home and the blog hub list the latest posts, so they change when a post is published.
      lastmod: r.path === '/' || r.path === '/blog' ? new Date(Math.max(+STATIC_LASTMOD, +newestPost)) : STATIC_LASTMOD,
    })),
    ...posts.map((p) => ({
      path: `/blog/${p.id}`,
      label: p.data.title,
      lastmod: p.data.updatedDate ?? p.data.pubDate,
      group: 'blog' as const,
    })),
  ];
}
