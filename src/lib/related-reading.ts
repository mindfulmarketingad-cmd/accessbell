import { CRITERIA } from '../../server/wcag-criteria.js';
import { criterionPath } from './wcag-pages';

export type ReadingLink = { href: string; label: string };

type Criterion = { sc: string; name: string; level: string };

const ALL = Object.values(CRITERIA as Record<string, Criterion>);

const PRIORITY = ['1.4.3', '2.2.2', '1.1.1', '2.1.1', '4.1.2', '3.3.2', '2.4.7', '1.4.11'];

const MONITOR = '/resources/website-accessibility-monitoring-tool';
const MONITOR_LABELS = [
  'website accessibility monitoring tool guide',
  'what a monitoring tool should recheck',
  'WCAG-EM checklist for ongoing monitoring',
  'how often to monitor a website for accessibility',
];
const PRICING_LABELS = [
  'monitoring plans and pricing',
  'what Pro monitoring includes',
  'continuous monitoring pricing',
];

const hash = (s: string) => [...s].reduce((n, ch) => n + ch.charCodeAt(0), 0);

const mentioned = (text: string, sc: string) => new RegExp(`\\b${sc.replace(/\./g, '\\.')}(?!\\d)`).test(text);

const linked = (text: string, href: string) => {
  const path = href.split('#')[0];
  return text.includes(`](${href}`) || text.includes(`](${path}`) || text.includes(`href="${path}"`) || text.includes(`href='${path}'`);
};

/** Success criteria named in a piece of text, priority criteria first. */
export function criteriaMentioned(text: string, limit = 6): ReadingLink[] {
  const found = ALL.filter((c) => mentioned(text, c.sc));
  found.sort((a, b) => {
    const ap = PRIORITY.indexOf(a.sc);
    const bp = PRIORITY.indexOf(b.sc);
    if (ap !== -1 || bp !== -1) return (ap === -1 ? 99 : ap) - (bp === -1 ? 99 : bp);
    return a.sc.localeCompare(b.sc, undefined, { numeric: true });
  });
  return found.slice(0, limit).map((c) => ({ href: criterionPath(c.sc), label: `WCAG ${c.sc} ${c.name}` }));
}

/**
 * One contextual link from a criterion page to a money page. The target and
 * the anchor rotate so the same sentence is not copied onto every page.
 */
export function moneyLinkFor(sc: string): ReadingLink {
  const n = hash(sc);
  if (sc === '1.4.3') return { href: MONITOR, label: 'website accessibility monitoring tool guide' };
  if (sc === '2.2.2') return { href: MONITOR, label: 'what to recheck when content moves on its own' };
  if (n % 2 === 0) return { href: MONITOR, label: MONITOR_LABELS[n % MONITOR_LABELS.length] };
  return { href: '/pricing', label: PRICING_LABELS[n % PRICING_LABELS.length] };
}

const push = (links: ReadingLink[], href: string, label: string, body: string, self: string) => {
  if (!href || href === self || links.some((l) => l.href === href) || linked(body, href)) return;
  links.push({ href, label });
};

/**
 * Topic links for a blog post: the tool test, the lawsuit guide, monitoring,
 * and the criteria or checklists the post is actually about.
 */
export function topicLinksForPost(id: string, category: string, body: string): ReadingLink[] {
  const links: ReadingLink[] = [];
  const self = `/blog/${id}`;
  const toolPost = category === 'Comparisons' || /checker|testing|software|overlay|axe|lighthouse/.test(id);
  const lawsuitPost = /lawsuit|sued|demand|title-ii|title-iii|compliance/.test(id) && !/ramps|bathrooms/.test(id);
  if (toolPost) push(links, '/blog/we-tested-10-accessibility-checker-tools', 'what 10 accessibility checker tools caught on one page', body, self);
  if (lawsuitPost) push(links, '/blog/ada-lawsuit-process', 'ADA lawsuit process', body, self);
  if (toolPost || lawsuitPost || /wcag|monitor|checker|testing|keyboard|check-website/.test(id)) {
    push(links, MONITOR, MONITOR_LABELS[hash(id) % MONITOR_LABELS.length], body, self);
  }
  if (/keyboard/.test(id)) {
    push(links, criterionPath('2.1.1'), 'WCAG 2.1.1 Keyboard', body, self);
    push(links, criterionPath('2.1.2'), 'WCAG 2.1.2 No Keyboard Trap', body, self);
    push(links, criterionPath('2.1.3'), 'WCAG 2.1.3 Keyboard (No Exception)', body, self);
  }
  if (/contrast/.test(id)) {
    push(links, criterionPath('1.4.3'), 'WCAG 1.4.3 Contrast (Minimum)', body, self);
    push(links, '/tools/contrast-checker', 'WCAG color contrast checker', body, self);
  }
  if (/seo/.test(id)) push(links, '/resources/web-accessibility-and-seo-impact', 'what impact accessibility has on SEO', body, self);
  if (/\bwix\b/i.test(body) && !/wix-accessibility/.test(id)) push(links, '/resources/wix-accessibility-checklist', 'Wix accessibility checklist', body, self);
  if (/squarespace/i.test(body)) push(links, '/resources/squarespace-accessibility-checklist', 'Squarespace accessibility checklist', body, self);
  return links.slice(0, 4);
}

type PostRef = { href: string; title: string; body: string; guide: boolean };

const PLATFORM_SC = new Set(['1.1.1', '1.3.1', '1.4.3', '1.4.11', '2.2.2', '2.4.7', '3.3.2', '4.1.2']);
const STORE_SC = new Set(['1.4.3', '2.2.2', '2.4.11', '2.5.7', '2.5.8', '3.2.6', '3.3.7', '3.3.8', '3.3.2']);
const KEYBOARD_SC = new Set(['2.1.1', '2.1.2', '2.1.3', '2.1.4', '2.4.3', '2.4.7']);

/** Blog posts, checklists and tools that discuss this success criterion. */
export function readingForCriterion(sc: string, selfHref: string, posts: PostRef[]): ReadingLink[] {
  const links: ReadingLink[] = [];
  const add = (href: string, label: string) => {
    if (!href || href === selfHref || links.some((l) => l.href === href)) return;
    links.push({ href, label });
  };

  const mentions = posts.filter((p) => p.href !== selfHref && mentioned(p.body, sc));
  const preferred = ['/blog/we-tested-10-accessibility-checker-tools', '/blog/ada-lawsuit-process', '/blog/keyboard-accessibility-testing'];
  const ordered = [...mentions.filter((p) => !p.guide), ...mentions.filter((p) => p.guide)];
  ordered.sort((a, b) => {
    const ap = preferred.indexOf(a.href);
    const bp = preferred.indexOf(b.href);
    return (ap === -1 ? 99 : ap) - (bp === -1 ? 99 : bp);
  });
  for (const p of ordered.slice(0, 4)) add(p.href, p.title);

  if (KEYBOARD_SC.has(sc)) add('/blog/keyboard-accessibility-testing', 'keyboard accessibility testing');
  if (sc === '1.4.3' || sc === '1.4.6' || sc === '1.4.11') add('/tools/contrast-checker', 'WCAG color contrast checker');
  if (sc === '2.2.2') add('/blog/we-tested-10-accessibility-checker-tools', 'what 10 accessibility checker tools caught, including an auto-advancing carousel');
  if (PLATFORM_SC.has(sc)) {
    add('/resources/wix-accessibility-checklist', 'Wix accessibility checklist');
    add('/resources/squarespace-accessibility-checklist', 'Squarespace accessibility checklist');
  }
  if (STORE_SC.has(sc)) add('/resources/wcag-2-2-checklist-for-online-stores', 'WCAG 2.2 checklist for online stores');
  if (sc === '1.4.3' || sc === '2.2.2' || sc === '1.1.1') add('/blog/how-to-check-if-website-is-ada-compliant', 'how to check if a website is ADA compliant');
  return links.slice(0, 8);
}
