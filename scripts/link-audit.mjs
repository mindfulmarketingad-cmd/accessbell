// Internal link audit over the built site (run after `npm run build`).
// For every page in sitemap.xml it counts, in the main content only (not the
// site header, footer, breadcrumbs or other <nav> blocks, and not the HTML
// sitemap page):
//   - inbound internal links from other pages (0 = orphan page)
//   - internal links out to other pages
//   - outbound links to other websites
// Exits non-zero if any page fails, so it can run in CI.
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import { parse } from 'parse5';

const DIST = new URL('../dist/', import.meta.url).pathname;
const SITE_HOSTS = new Set(['www.accessbell.co', 'accessbell.co']);
const EXCLUDED_SOURCES = new Set(['/sitemap']);

const files = (dir) => readdirSync(dir).flatMap((f) => (statSync(join(dir, f)).isDirectory() ? files(join(dir, f)) : [join(dir, f)]));
const toPath = (file) => '/' + relative(DIST, file).replace(/\.html$/, '').replace(/(^|\/)index$/, '').replace(/\/$/, '');
const clean = (p) => p.replace(/\.html$/, '').replace(/\/index$/, '').replace(/\/+$/, '') || '/';

const sitemap = readFileSync(join(DIST, 'sitemap.xml'), 'utf8');
const indexable = new Set([...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => clean(new URL(m[1]).pathname)));

function contentLinks(html, pagePath) {
  const internal = new Set();
  const external = new Set();
  const walk = (node, inMain, excluded) => {
    const tag = node.tagName;
    if (tag === 'main') inMain = true;
    if (tag === 'nav' || tag === 'header' || tag === 'footer') excluded = true;
    if (tag === 'a' && inMain && !excluded) {
      const href = node.attrs.find((a) => a.name === 'href')?.value;
      if (href && !href.startsWith('#') && !/^(mailto|tel|javascript):/i.test(href)) {
        const url = new URL(href, `https://www.accessbell.co${pagePath}`);
        if (SITE_HOSTS.has(url.hostname)) {
          const target = clean(url.pathname);
          if (target !== pagePath) internal.add(target);
        } else if (/^https?:$/.test(url.protocol)) external.add(url.origin + url.pathname);
      }
    }
    for (const child of node.childNodes || []) walk(child, inMain, excluded);
    if (node.content) walk(node.content, inMain, excluded);
  };
  walk(parse(html), false, false);
  return { internal, external };
}

const pages = new Map();
const titles = new Map();
for (const file of files(DIST).filter((f) => f.endsWith('.html'))) {
  const path = clean(toPath(file));
  const html = readFileSync(file, 'utf8');
  pages.set(path, contentLinks(html, path));
  const t = (html.match(/<title>([^<]*)<\/title>/) || [])[1];
  if (t) titles.set(path, t.replace(/&amp;/g, '&').replace(/&#39;/g, "'").replace(/&quot;/g, '"').replace(/&lt;/g, '<').replace(/&gt;/g, '>'));
}

const inbound = new Map([...indexable].map((p) => [p, new Set()]));
for (const [from, { internal }] of pages) {
  if (EXCLUDED_SOURCES.has(from) || !indexable.has(from)) continue;
  for (const to of internal) inbound.get(to)?.add(from);
}

const rows = [...indexable].sort().map((p) => ({
  page: p,
  inbound: inbound.get(p).size,
  internalOut: pages.get(p)?.internal.size ?? 0,
  external: pages.get(p)?.external.size ?? 0,
}));
// Title tags must be 65 characters or fewer (CLAUDE.md).
const longTitles = [...indexable].filter((p) => (titles.get(p) || '').length > 65);
const failing = rows.filter((r) => !pages.has(r.page) || r.inbound === 0 || r.internalOut === 0 || r.external === 0);

console.log(`${rows.length} indexable pages audited.`);
for (const [label, key] of [['Orphan pages (no inbound links in content)', 'inbound'], ['No internal links in content', 'internalOut'], ['No outbound links to other sites', 'external']]) {
  const list = rows.filter((r) => r[key] === 0);
  console.log(`\n${label}: ${list.length}`);
  for (const r of list) console.log(`  ${r.page}`);
}
console.log(`\nTitle tags over 65 characters: ${longTitles.length}`);
for (const p of longTitles) console.log(`  ${p} (${titles.get(p).length}): ${titles.get(p)}`);
const weak = rows.filter((r) => r.inbound === 1);
console.log(`\nWeakly linked (1 inbound link, passes but worth strengthening): ${weak.length}`);
for (const r of weak) console.log(`  ${r.page}`);
const missing = rows.filter((r) => !pages.has(r.page));
if (missing.length) console.log(`\nIn sitemap but not built: ${missing.map((r) => r.page).join(', ')}`);
if (process.argv.includes('--verbose')) console.table(rows);
process.exit(failing.length || longTitles.length ? 1 : 0);
