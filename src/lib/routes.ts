import { getCollection } from 'astro:content';
import { isWcagGuide, guideSc } from './posts';
import { helpByCategory, articlePath, categoryPath } from './help';
import { CHECKERS, checkerPath } from '../data/checkers';
import { PLATFORMS, platformHome, platformCheckers } from '../data/platforms';
import { SOLUTIONS, solutionPath } from '../data/solutions';
import { COMPARISONS, comparisonPath } from '../data/comparisons';
import { USE_CASES, useCasePath } from '../data/use-cases';
import { INDUSTRIES, industryPath } from '../data/industries';
import { STATE_LAWS, stateLawPath } from '../data/state-laws';
import { CRITERIA } from '../../server/wcag-criteria.js';
import { criterionPath } from './wcag-pages';

/** lastmod is only set where the page has a real content date; sitemaps omit it otherwise. */
export type RouteEntry = { path: string; label: string; note?: string; lastmod?: Date; group: 'main' | 'blog' | 'authors' | 'help' | 'company' | 'wcag' };

/** Date the static pages were last meaningfully changed. Bump when editing them. */
const STATIC_LASTMOD = new Date('2026-09-30');

const STATIC: Omit<RouteEntry, 'lastmod'>[] = [
  { path: '/', label: 'Home', note: 'Free website accessibility checker', group: 'main' },
  { path: '/pricing', label: 'Pricing', note: 'Pro plan and features', group: 'main' },
  { path: '/blog', label: 'Blog', note: 'Accessibility guides and compliance insights', group: 'main' },
  { path: '/comparisons', label: 'Comparisons', note: 'AccessBell compared with other accessibility tools', group: 'main' },
  { path: '/use-cases', label: 'Use Cases', note: 'How customers use AccessBell to monitor accessibility compliance', group: 'main' },
  { path: '/solutions', label: 'Solutions', note: 'Continuous monitoring, automated fixes and the Compliance Vault', group: 'main' },
  { path: '/resources', label: 'Resources', note: 'Free tools and guides', group: 'main' },
  { path: '/resources/statement-generator', label: 'Accessibility Statement Generator', note: 'Free custom accessibility statement', group: 'main' },
  { path: '/resources/free-accessibility-icon-set', label: 'Free Accessibility Icon Set', note: '17 free SVG and PNG accessibility icons', group: 'main' },
  { path: '/resources/present-state-of-web-accessibility-2026', label: 'Present State of Web Accessibility in 2026', note: 'Research report: WebAIM Million 2026 data and what to fix first', group: 'main' },
  { path: '/resources/web-accessibility-and-seo-impact', label: 'What Impact Does Web Accessibility Have on SEO?', note: 'Research report on accessibility, traffic and rankings', group: 'main' },
  { path: '/resources/pdf-accessibility-checker', label: 'Free PDF Accessibility Checker', note: 'Check PDFs for WCAG and PDF/UA issues in your browser', group: 'main' },
  { path: '/resources/chart-color-checker', label: 'Chart and Infographic Color Checker', note: 'Free chart color checker for color blindness and contrast', group: 'main' },
  { path: '/resources/contrast-checker', label: 'WCAG Color Contrast Checker', note: 'Free color contrast ratio checker', group: 'main' },
  { path: '/platforms', label: 'Accessibility Checkers by Platform', note: 'WordPress, Shopify, Webflow, Squarespace and Wix', group: 'main' },
  { path: '/industries', label: 'Accessibility Checkers by Industry', note: 'E-commerce, healthcare, education, government and more', group: 'main' },
  { path: '/state-accessibility-laws', label: 'Website Accessibility Laws by State', note: 'State laws and a free checker for each', group: 'main' },
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
  const helpUpdated = (list: { data: { updatedDate: Date } }[]) => new Date(Math.max(...list.map((a) => +a.data.updatedDate)));

  return [
    ...STATIC.map((r) => ({
      ...r,
      // Home and the blog hub list the latest posts, so they change when a post is published.
      lastmod:
        r.path === '/' || r.path === '/blog' || r.path === '/authors'
          ? newestPost
          : r.path === '/use-cases'
            ? new Date(Math.max(...USE_CASES.map((x) => +x.pubDate)))
          : r.path === '/resources/help-center'
            ? helpUpdated(help.flatMap((g) => g.articles))
            : undefined,
    })),
    ...CHECKERS.map((c) => ({ path: checkerPath(c), label: c.name, note: `Free WCAG ${c.version} Level ${c.level} scan`, group: 'main' as const })),
    ...COMPARISONS.map((c) => ({ path: comparisonPath(c), label: `${c.name} vs. AccessBell`, note: c.kind, group: 'main' as const })),
    ...USE_CASES.map((x) => ({ path: useCasePath(x), label: x.h1, note: x.summary, lastmod: x.pubDate, group: 'main' as const })),
    ...SOLUTIONS.map((x) => ({ path: solutionPath(x), label: x.h1, note: x.summary, group: 'main' as const })),
    ...PLATFORMS.map((p) => ({ path: platformHome(p), label: `${p.name} Accessibility Checkers`, note: 'All free checkers for this platform', group: 'main' as const })),
    ...PLATFORMS.flatMap((p) => platformCheckers(p).map((c) => ({ path: c.href, label: c.label, note: `Free ${p.name} scan`, group: 'main' as const }))),
    ...INDUSTRIES.map((ind) => ({ path: industryPath(ind), label: `${ind.name} Accessibility Checker`, note: 'Free scan for this industry', group: 'main' as const })),
    ...STATE_LAWS.map((st) => ({ path: stateLawPath(st), label: `${st.name} Website Accessibility Checker`, note: 'State accessibility law and a free scan', group: 'main' as const })),
    ...Object.values(CRITERIA).map((c) => {
      // Criteria with a written guide take the guide's dates; the rest have no content date.
      const guide = posts.find((p) => isWcagGuide(p) && guideSc(p.id) === c.sc);
      return { path: criterionPath(c.sc), label: `${c.sc} ${c.name}`, note: `Level ${c.level} · WCAG ${c.version}`, lastmod: guide ? guide.data.updatedDate ?? guide.data.pubDate : undefined, group: 'wcag' as const };
    }),
    ...help.flatMap((g) => [
      { path: categoryPath(g.id), label: g.title, note: `${g.articles.length} articles`, lastmod: helpUpdated(g.articles), group: 'help' as const },
      ...g.articles.map((a) => ({ path: articlePath(a), label: a.data.title, lastmod: a.data.updatedDate, group: 'help' as const })),
    ]),
    ...posts.filter((p) => !isWcagGuide(p)).map((p) => ({
      path: `/blog/${p.id}`,
      label: p.data.title,
      lastmod: p.data.updatedDate ?? p.data.pubDate,
      group: 'blog' as const,
    })),
    ...authors.map((a) => {
      const theirs = posts.filter((p) => p.data.contributors.some((c) => c.author.id === a.id));
      const latest = theirs.reduce((d, p) => Math.max(d, +(p.data.updatedDate ?? p.data.pubDate)), 0);
      return { path: `/authors/${a.id}`, label: a.data.name, note: a.data.jobTitle, lastmod: latest ? new Date(latest) : undefined, group: 'authors' as const };
    }),
  ];
}
