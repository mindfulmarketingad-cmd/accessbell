import { PLATFORMS, platformPath } from '../data/platforms';
import { platformLogo } from '../data/platform-logos';
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

const GROUP_LABEL = { ecommerce: 'E-commerce', cms: 'CMS', builder: 'Site builder', framework: 'Framework', host: 'Web host' } as const;

export const HEADER_NAV = [
  { label: 'Home', href: '/' },
  { label: 'Pricing', href: '/pricing' },
  { label: 'Blog', href: '/blog' },
  {
    label: 'Platforms',
    href: '/platforms',
    wide: true,
    children: [
      { label: 'All platforms', href: '/platforms', note: 'Every platform checker' },
      ...PLATFORMS.map((p) => ({ label: p.name, href: platformPath(p), note: GROUP_LABEL[p.group], logo: platformLogo(p.slug), initial: p.name.trim()[0] })),
    ],
  },
  {
    label: 'Resources',
    href: '/resources',
    children: [
      { label: 'Free Tools', href: '/resources', note: 'Scanner, checkers, statement generator and more' },
      { label: 'Help Center', href: '/resources/help-center', note: 'Guides for every AccessBell feature' },
    ],
  },
  { label: 'Reviews', href: '/reviews' },
  { label: 'About', href: '/about' },
] as const;

export const FOOTER_NAV = [
  { label: 'Home', href: '/' },
  { label: 'About', href: '/about' },
  { label: 'Methodology', href: '/methodology' },
  { label: 'Contact', href: '/contact' },
  { label: 'Resources', href: '/resources' },
  { label: 'Platform Checkers', href: '/platforms' },
  { label: 'Help Center', href: '/resources/help-center' },
  { label: 'Disclaimer', href: '/disclaimer' },
  { label: 'Privacy', href: '/privacy' },
  { label: 'Terms', href: '/terms' },
  { label: 'Sitemap', href: '/sitemap' },
  { label: 'Pricing', href: '/pricing' },
] as const;

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
