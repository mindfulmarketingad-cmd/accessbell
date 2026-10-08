// Site structure audit over the built site (run after `npm run build`).
//
// For every page in sitemap.xml it reports:
//   - click depth from the homepage, following every link a crawler sees
//     (header, footer and content), and following content links only
//   - whether each page's hub (its nearest ancestor URL that is a page)
//     links down to it, and whether it links back up to that hub
//
// Usage: node scripts/structure-audit.mjs [--json] [--max-depth N]
// Exits non-zero when a page is deeper than --max-depth (default 3), is not
// reachable from the homepage, or is missing a hub-to-child or child-to-hub link.
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import { parse } from 'parse5';

const DIST = new URL('../dist/', import.meta.url).pathname;
const SITE_HOSTS = new Set(['www.accessbell.co', 'accessbell.co']);
const args = process.argv.slice(2);
const asJson = args.includes('--json');
const maxDepth = Number(args[args.indexOf('--max-depth') + 1]) || 3;
// The HTML sitemap links to every page, which hides how deep pages really are
// in the navigation. It is left out of the crawl unless --with-sitemap is set.
const SKIP_SOURCES = new Set(args.includes('--with-sitemap') ? [] : ['/sitemap']);

const files = (dir) => readdirSync(dir).flatMap((f) => (statSync(join(dir, f)).isDirectory() ? files(join(dir, f)) : [join(dir, f)]));
const clean = (p) => p.replace(/\.html$/, '').replace(/\/index$/, '').replace(/\/+$/, '') || '/';
const toPath = (file) => clean('/' + relative(DIST, file));

const sitemap = readFileSync(join(DIST, 'sitemap.xml'), 'utf8');
const indexable = new Set([...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => clean(new URL(m[1]).pathname)));

/** Internal links on a page: all of them, and those in the main content (breadcrumbs included). */
function links(html, pagePath) {
  const all = new Set();
  const main = new Set();
  const walk = (node, inMain, chrome) => {
    const tag = node.tagName;
    if (tag === 'main') inMain = true;
    if (tag === 'header' || tag === 'footer') chrome = true;
    if (tag === 'a') {
      const href = node.attrs.find((a) => a.name === 'href')?.value;
      if (href && !href.startsWith('#') && !/^(mailto|tel|javascript):/i.test(href)) {
        const url = new URL(href, `https://www.accessbell.co${pagePath}`);
        if (SITE_HOSTS.has(url.hostname)) {
          const target = clean(url.pathname);
          if (target !== pagePath) {
            all.add(target);
            if (inMain && !chrome) main.add(target);
          }
        }
      }
    }
    for (const child of node.childNodes || []) walk(child, inMain, chrome);
    if (node.content) walk(node.content, inMain, chrome);
  };
  walk(parse(html), false, false);
  return { all, main };
}

const graph = new Map();
for (const file of files(DIST).filter((f) => f.endsWith('.html'))) {
  const path = toPath(file);
  graph.set(path, links(readFileSync(file, 'utf8'), path));
}

function depths(kind) {
  const depth = new Map([['/', 0]]);
  const queue = ['/'];
  while (queue.length) {
    const page = queue.shift();
    if (SKIP_SOURCES.has(page)) continue;
    for (const next of graph.get(page)?.[kind] || []) {
      if (!depth.has(next) && graph.has(next)) {
        depth.set(next, depth.get(page) + 1);
        queue.push(next);
      }
    }
  }
  return depth;
}
const crawl = depths('all');
const content = depths('main');

/** The nearest ancestor URL that is itself an indexable page. */
const hubOf = (p) => {
  const parts = p.split('/').filter(Boolean);
  for (let i = parts.length - 1; i > 0; i--) {
    const up = '/' + parts.slice(0, i).join('/');
    if (indexable.has(up)) return up;
  }
  return p === '/' ? null : '/';
};

const rows = [...indexable].sort().map((page) => {
  const hub = hubOf(page);
  return {
    page,
    hub,
    crawlDepth: crawl.get(page) ?? null,
    contentDepth: content.get(page) ?? null,
    // The homepage's children are the top-level pages, which the site header and
    // footer link to on every page, so for it every link counts.
    hubLinksDown: hub ? graph.get(hub)?.[hub === '/' ? 'all' : 'main'].has(page) ?? false : null,
    linksUp: hub ? graph.get(page)?.main.has(hub) ?? false : null,
  };
});

const section = (p) => '/' + (p.split('/')[1] || '');
const bySection = new Map();
for (const r of rows) {
  const s = bySection.get(section(r.page)) || { pages: 0, maxCrawl: 0, maxContent: 0, unreachable: 0, noDown: 0, noUp: 0 };
  s.pages++;
  s.maxCrawl = Math.max(s.maxCrawl, r.crawlDepth ?? Infinity);
  s.maxContent = Math.max(s.maxContent, r.contentDepth ?? Infinity);
  if (r.crawlDepth === null) s.unreachable++;
  if (r.hubLinksDown === false) s.noDown++;
  if (r.linksUp === false) s.noUp++;
  bySection.set(section(r.page), s);
}

const histogram = (key) => {
  const h = {};
  for (const r of rows) h[r[key] ?? 'unreachable'] = (h[r[key] ?? 'unreachable'] || 0) + 1;
  return h;
};
const tooDeep = rows.filter((r) => r.crawlDepth === null || r.crawlDepth > maxDepth);
const noDown = rows.filter((r) => r.hubLinksDown === false);
const noUp = rows.filter((r) => r.linksUp === false);

if (asJson) {
  console.log(JSON.stringify({ rows, crawlDepths: histogram('crawlDepth'), contentDepths: histogram('contentDepth') }, null, 2));
} else {
  console.log(`${rows.length} indexable pages.\n`);
  console.log('Clicks from the homepage, following every link:', histogram('crawlDepth'));
  console.log('Clicks from the homepage, content links only:  ', histogram('contentDepth'));
  console.log('\nBy section: pages, deepest page (all links / content only), hub missing link down, page missing link up');
  for (const [s, v] of [...bySection].sort()) {
    console.log(`  ${s.padEnd(28)} ${String(v.pages).padStart(4)}   depth ${v.maxCrawl}/${v.maxContent}   no down-link ${v.noDown}   no up-link ${v.noUp}`);
  }
  console.log(`\nDeeper than ${maxDepth} clicks or unreachable: ${tooDeep.length}`);
  for (const r of tooDeep.slice(0, 40)) console.log(`  ${r.page} (${r.crawlDepth ?? 'unreachable'})`);
  console.log(`\nHub does not link down to the page: ${noDown.length}`);
  for (const r of noDown.slice(0, 40)) console.log(`  ${r.hub} -> ${r.page}`);
  console.log(`\nPage does not link back up to its hub: ${noUp.length}`);
  for (const r of noUp.slice(0, 40)) console.log(`  ${r.page} -> ${r.hub}`);
}

if (tooDeep.length || noDown.length || noUp.length) process.exitCode = 1;
