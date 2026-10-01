export const SITE = {
  name: 'AccessBell',
  domain: 'accessbell.co',
  url: 'https://www.accessbell.co',
  tagline: 'Website Accessibility Checker',
  description:
    'AccessBell is a website accessibility checker that scans your pages against WCAG 2.2, ADA, Section 508 and EN 301 549, then shows you exactly what to fix.',
  email: 'hello@accessbell.co',
  locale: 'en_US',
  ogImage: '/og-default.png',
  twitterHandle: '@accessbell',
  social: {
    instagram: 'https://www.instagram.com/accessbell',
    twitter: 'https://x.com/accessbell',
    facebook: 'https://www.facebook.com/accessbell',
  },
} as const;

export const HEADER_NAV = [
  { label: 'Pricing', href: '/pricing' },
  { label: 'Solutions', href: '/solutions' },
  { label: 'Platforms', href: '/platforms' },
  { label: 'Comparisons', href: '/comparisons' },
  { label: 'WCAG Library', href: '/resources/wcag' },
  { label: 'Tools', href: '/tools' },
  { label: 'Resources', href: '/resources' },
] as const;

/** Footer links, grouped into columns. */
export const FOOTER_GROUPS = [
  {
    title: 'Product',
    links: [
      { label: 'Pricing', href: '/pricing' },
      { label: 'Solutions', href: '/solutions' },
      { label: 'Comparisons', href: '/comparisons' },
      { label: 'Use Cases', href: '/use-cases' },
      { label: 'Platform Checkers', href: '/platforms' },
    ],
  },
  {
    title: 'Resources',
    links: [
      { label: 'Free Tools', href: '/tools' },
      { label: 'Resources', href: '/resources' },
      { label: 'WCAG Library', href: '/resources/wcag' },
      { label: 'Blog', href: '/blog' },
      { label: 'Help Center', href: '/resources/help-center' },
    ],
  },
  {
    title: 'Company',
    links: [
      { label: 'About', href: '/about' },
      { label: 'Methodology', href: '/methodology' },
      { label: 'Contact', href: '/contact' },
      { label: 'Accessibility Statement', href: '/statement' },
    ],
  },
  {
    title: 'Legal',
    links: [
      { label: 'Terms', href: '/terms' },
      { label: 'Privacy', href: '/privacy' },
      { label: 'Disclaimer', href: '/disclaimer' },
      { label: 'Sitemap', href: '/sitemap' },
    ],
  },
] as const;

export const FOOTER_NAV = FOOTER_GROUPS.flatMap((g) => g.links);

export const STANDARDS = [
  { id: 'wcag22', label: 'WCAG 2.2 AA' },
  { id: 'wcag21', label: 'WCAG 2.1 AA' },
  { id: 'ada', label: 'ADA' },
  { id: 'section508', label: 'Section 508' },
  { id: 'en301549', label: 'EN 301 549' },
] as const;

/** Absolute canonical URL. Root keeps its slash; every other path has none. */
export const absoluteUrl = (path: string) => {
  const clean = path.replace(/\/+$/, '');
  return clean ? `${SITE.url}${clean.startsWith('/') ? '' : '/'}${clean}` : `${SITE.url}/`;
};

/** Request path without .html, trailing /index or trailing slash ("/" for the homepage). */
export const normalizePath = (pathname: string) =>
  pathname.replace(/\.html$/, '').replace(/\/index$/, '').replace(/\/+$/, '') || '/';
