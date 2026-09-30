// /llms.txt: a Markdown map of the site for AI assistants and LLM crawlers (https://llmstxt.org).
// Generated at build time, so new posts, help articles and tools are listed automatically.
import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';
import { SITE, absoluteUrl } from '../config/site';
import { PLAN } from '../data/pricing';
import { CHECKERS, checkerPath } from '../data/checkers';
import { PLATFORMS, platformPath } from '../data/platforms';
import { INDUSTRIES, industryPath } from '../data/industries';
import { STATE_LAWS, stateLawPath } from '../data/state-laws';
import { CRITERIA } from '../../server/wcag-criteria.js';
import { criterionPath } from '../lib/wcag-pages';
import { helpByCategory, articlePath, categoryPath } from '../lib/help';

const link = (title: string, path: string, note?: string) => `- [${title}](${absoluteUrl(path)})${note ? `: ${note}` : ''}`;

export const GET: APIRoute = async () => {
  const posts = (await getCollection('blog', ({ data }) => !data.draft)).sort((a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf());
  const help = await helpByCategory();

  const sections: [string, string[]][] = [
    [
      'Product',
      [
        link('Home and free scanner', '/', 'Scan any public page and see how many WCAG issues it has. No sign-up needed; subscribers see every issue and its fix.'),
        link('Pricing', '/pricing', `${PLAN.name} plan: $${PLAN.price} per domain per month or $${PLAN.annualPrice} per domain per year, up to ${PLAN.urlsPerDomain} monitored URLs per domain, 3-day free trial.`),
        link('Methodology', '/methodology', 'How scans work: the axe-core engine, what automated testing covers and what needs manual review.'),
        link('About', '/about'),
        link('Contact', '/contact', `Sales and support. Email ${SITE.email}.`),
      ],
    ],
    [
      'Free Tools',
      [
        link('All free tools', '/resources'),
        ...CHECKERS.map((c) => link(c.name, checkerPath(c), c.description)),
        link('WCAG Color Contrast Checker', '/resources/contrast-checker', 'Check the contrast ratio of any text and background colors against WCAG AA and AAA.'),
        link('Free PDF Accessibility Checker', '/resources/pdf-accessibility-checker', 'Check a PDF for WCAG and PDF/UA issues in the browser, with no upload.'),
        link('Chart and Infographic Color Checker', '/resources/chart-color-checker', 'Check chart colors for 3:1 contrast and color blindness.'),
        link('Accessibility Statement Generator', '/resources/statement-generator', 'Create a custom accessibility statement for your website.'),
        link('Free Accessibility Icon Set', '/resources/free-accessibility-icon-set', 'Free SVG and PNG accessibility icons, licensed CC BY 4.0.'),
      ],
    ],
    ['Guides', posts.map((p) => link(p.data.title, `/blog/${p.id}`, p.data.description))],
    [
      'WCAG Success Criteria',
      [link('WCAG Success Criteria Library', '/resources/wcag', 'Every WCAG 2.0, 2.1 and 2.2 success criterion explained, with how to test it.')],
    ],
    [
      'Help Center',
      [
        link('Help Center', '/resources/help-center', 'How to use every AccessBell feature.'),
        ...help.flatMap((g) => [link(g.title, categoryPath(g.id)), ...g.articles.map((a) => link(a.data.title, articlePath(a), a.data.description))]),
      ],
    ],
    [
      'Optional',
      [
        ...Object.values(CRITERIA).map((c) => link(`WCAG ${c.sc} ${c.name}`, criterionPath(c.sc), `Level ${c.level}, added in WCAG ${c.version}.`)),
        link('Accessibility checkers by platform', '/platforms'),
        link('Accessibility checkers by industry', '/industries'),
        link('Website accessibility laws by state', '/state-accessibility-laws'),
        ...PLATFORMS.map((p) => link(`${p.name} Accessibility Checker`, platformPath(p))),
        ...INDUSTRIES.map((i) => link(`${i.name} Accessibility Checker`, industryPath(i))),
        ...STATE_LAWS.map((s) => link(`${s.name} Website Accessibility Checker`, stateLawPath(s))),
        link('Privacy Policy', '/privacy'),
        link('Terms of Service', '/terms'),
        link('Disclaimer', '/disclaimer'),
      ],
    ],
  ];

  const body = `# ${SITE.name}

> ${SITE.description}

${SITE.name} (${SITE.domain}) is a ${SITE.tagline.toLowerCase()}. Key facts:

- The free scanner tests one public page at a time against WCAG 2.2 AA, WCAG 2.1 AA, the ADA, Section 508 or EN 301 549, with no account needed. The free scan shows how many issues were found and their severity; Pro subscribers see each issue, the failing code and the fix.
- The paid ${PLAN.name} plan costs $${PLAN.price} per domain per month or $${PLAN.annualPrice} per domain per year billed annually, both after a 3-day free trial, with the same features. It monitors up to ${PLAN.urlsPerDomain} URLs per domain with daily rescans, tracks issues over time and emails alerts when new issues appear.
- Scans run the open-source axe-core engine in a real browser. Automated testing finds many but not all accessibility issues, so every report also lists the WCAG criteria that need manual review.
- Content on this site explains technical standards and is not legal advice.

${sections.map(([title, lines]) => `## ${title}\n\n${lines.join('\n')}`).join('\n\n')}
`;
  return new Response(body, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
};
