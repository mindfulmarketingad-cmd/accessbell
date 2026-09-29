import { getCollection } from 'astro:content';
import { helpByCategory, articlePath, categoryPath } from './help';
import { CHECKERS, checkerPath } from '../data/checkers';
import { PLATFORMS, platformPath } from '../data/platforms';
import { INDUSTRIES, industryPath } from '../data/industries';
import { STATE_LAWS, stateLawPath } from '../data/state-laws';
import { CRITERIA } from '../../server/wcag-criteria.js';
import { criterionPath } from './wcag-pages';

export type RouteEntry = { path: string; label: string; note?: string; lastmod: Date; group: 'main' | 'blog' | 'authors' | 'help' | 'company' | 'wcag' };

/** Date the static pages were last meaningfully changed. Bump when editing them. */
const STATIC_LASTMOD = new Date('2026-09-28');

const STATIC: Omit<RouteEntry, 'lastmod'>[] = [
  { path: '/', label: 'Home', note: 'Free website accessibility checker', group: 'main' },
  { path: '/pricing', label: 'Pricing', note: 'Lite plan and features', group: 'main' },
  { path: '/blog', label: 'Blog', note: 'Accessibility guides and compliance insights', group: 'main' },
  { path: '/reviews', label: 'Reviews', note: 'Verified customer reviews', group: 'main' },
  { path: '/resources', label: 'Resources', note: 'Free tools and guides', group: 'main' },
  { path: '/resources/statement-generator', label: 'Accessibility Statement Generator', note: 'Free custom accessibility statement', group: 'main' },
  { path: '/resources/contrast-checker', label: 'WCAG Contrast Checker', note: 'Free color contrast ratio checker', group: 'main' },
  { path: '/resources/wcag', label: 'WCAG Success Criteria Library', note: 'Every WCAG criterion explained', group: 'main' },
  { path: '/resources/help-center', label: 'Help Center', note: 'Guides for every AccessBell feature', group: 'help' },
  { path: '/authors', label: 'Authors', note: 'The writers and reviewers behind our guides', group: 'authors' },
  { path: '/about', label: 'About', note: 'Our mission and approach', group: 'company' },
  { path: '/methodology', label: 'Methodology', note: 'How we test: the engine, coverage and review process', group: 'company' },
  { path: '/contact', label: 'Contact', note: 'Sales and support', group: 'company' },
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
  const authors = await getCollection('authors');
  const help = await helpByCategory();
  const helpUpdated = (list: { data: { updatedDate: Date } }[]) => new Date(Math.max(+STATIC_LASTMOD, ...list.map((a) => +a.data.updatedDate)));

  return [
    ...STATIC.map((r) => ({
      ...r,
      // Home and the blog hub list the latest posts, so they change when a post is published.
      lastmod:
        r.path === '/' || r.path === '/blog' || r.path === '/authors'
          ? new Date(Math.max(+STATIC_LASTMOD, +newestPost))
          : r.path === '/resources/help-center'
            ? helpUpdated(help.flatMap((g) => g.articles))
            : STATIC_LASTMOD,
    })),
    ...CHECKERS.map((c) => ({ path: checkerPath(c), label: c.name, note: `Free WCAG ${c.version} Level ${c.level} scan`, lastmod: STATIC_LASTMOD, group: 'main' as const })),
    ...PLATFORMS.map((p) => ({ path: platformPath(p), label: `${p.name} Accessibility Checker`, note: 'Free scan for this platform', lastmod: STATIC_LASTMOD, group: 'main' as const })),
    ...INDUSTRIES.map((ind) => ({ path: industryPath(ind), label: `${ind.name} Accessibility Checker`, note: 'Free scan for this industry', lastmod: STATIC_LASTMOD, group: 'main' as const })),
    ...STATE_LAWS.map((st) => ({ path: stateLawPath(st), label: `${st.name} Website Accessibility Checker`, note: 'State accessibility law and a free scan', lastmod: STATIC_LASTMOD, group: 'main' as const })),
    ...Object.values(CRITERIA).map((c) => ({ path: criterionPath(c.sc), label: `${c.sc} ${c.name}`, note: `Level ${c.level} · WCAG ${c.version}`, lastmod: STATIC_LASTMOD, group: 'wcag' as const })),
    ...help.flatMap((g) => [
      { path: categoryPath(g.id), label: g.title, note: `${g.articles.length} articles`, lastmod: helpUpdated(g.articles), group: 'help' as const },
      ...g.articles.map((a) => ({ path: articlePath(a), label: a.data.title, lastmod: a.data.updatedDate, group: 'help' as const })),
    ]),
    ...posts.map((p) => ({
      path: `/blog/${p.id}`,
      label: p.data.title,
      lastmod: p.data.updatedDate ?? p.data.pubDate,
      group: 'blog' as const,
    })),
    ...authors.map((a) => {
      const theirs = posts.filter((p) => p.data.contributors.some((c) => c.author.id === a.id));
      const latest = theirs.reduce((d, p) => Math.max(d, +(p.data.updatedDate ?? p.data.pubDate)), +STATIC_LASTMOD);
      return { path: `/authors/${a.id}`, label: a.data.name, note: a.data.jobTitle, lastmod: new Date(latest), group: 'authors' as const };
    }),
  ];
}
