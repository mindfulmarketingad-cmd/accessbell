// Internal link audit over the built site (run after `astro build`).
// For every page in sitemap.xml it counts, in the main content only (not the
// site header, footer, breadcrumbs or other <nav> blocks, and not the HTML
// sitemap page):
//   - inbound internal links from other pages (0 = orphan; fewer than 3 fails)
//   - internal links out to other pages
//   - outbound links to other websites
// It also fails when an internal link points at a missing page, or at a URL
// that vercel.json redirects (the link should use the final URL), or when a
// page is more than 3 clicks from the homepage.
// Exits non-zero if any page fails, so it can run in CI.
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import { parse } from 'parse5';

const DIST = new URL('../dist/', import.meta.url).pathname;
const ROOT = new URL('../', import.meta.url).pathname;
const SITE_HOSTS = new Set(['www.accessbell.co', 'accessbell.co']);
const EXCLUDED_SOURCES = new Set(['/sitemap']);
const MIN_INBOUND = 3;
const MAX_DEPTH = 3;

const files = (dir) => readdirSync(dir).flatMap((f) => (statSync(join(dir, f)).isDirectory() ? files(join(dir, f)) : [join(dir, f)]));
const toPath = (file) => '/' + relative(DIST, file).replace(/\.html$/, '').replace(/(^|\/)index$/, '').replace(/\/$/, '');
const clean = (p) => p.replace(/\.html$/, '').replace(/\/index$/, '').replace(/\/+$/, '') || '/';
// Redirect sources are matched as requested, so /index stays /index and is not folded into /.
const requestPath = (p) => p.replace(/\/+$/, '') || '/';

const sitemap = readFileSync(join(DIST, 'sitemap.xml'), 'utf8');
const indexable = new Set([...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => clean(new URL(m[1]).pathname)));

const vercel = JSON.parse(readFileSync(join(ROOT, 'vercel.json'), 'utf8'));
const redirectRules = (vercel.redirects || []).map((rule) => {
  const names = [];
  let pattern = '^';
  for (const part of rule.source.split(/(:[A-Za-z0-9_]+\*?)/)) {
    const star = part.match(/^:([A-Za-z0-9_]+)\*$/);
    const one = part.match(/^:([A-Za-z0-9_]+)$/);
    if (star) {
      names.push(star[1]);
      pattern += '(.*)';
    } else if (one) {
      names.push(one[1]);
      pattern += '([^/]+)';
    } else pattern += part.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }
  return { ...rule, names, re: new RegExp(`${pattern}$`) };
});

function redirectFor(pathname) {
  const path = requestPath(pathname);
  for (const rule of redirectRules) {
    const match = rule.re.exec(path);
    if (!match) continue;
    let destination = rule.destination;
    rule.names.forEach((name, i) => {
      destination = destination.replaceAll(`:${name}*`, match[i + 1]).replaceAll(`:${name}`, match[i + 1]);
    });
    return requestPath(destination.split('?')[0]);
  }
  return null;
}

function finalUrl(pathname) {
  let current = requestPath(pathname);
  const seen = new Set([current]);
  for (let i = 0; i < 8; i++) {
    const next = redirectFor(current);
    if (!next || next === current) return current;
    if (seen.has(next)) return next;
    seen.add(next);
    current = next;
  }
  return current;
}

const onDisk = new Set(files(DIST).map((file) => '/' + relative(DIST, file).split('\\').join('/')));

function pageLinks(html, pagePath) {
  const internal = new Set();
  const all = new Set();
  const external = new Set();
  const problems = [];
  const walk = (node, inMain, excluded) => {
    const tag = node.tagName;
    if (tag === 'main') inMain = true;
    if (tag === 'nav' || tag === 'header' || tag === 'footer') excluded = true;
    if (tag === 'a') {
      const href = node.attrs.find((a) => a.name === 'href')?.value;
      if (href && !href.startsWith('#') && !/^(mailto|tel|javascript):/i.test(href)) {
        let url;
        try {
          url = new URL(href, `https://www.accessbell.co${pagePath}`);
        } catch {
          problems.push({ kind: 'broken', href, target: href });
          return;
        }
        if (SITE_HOSTS.has(url.hostname)) {
          const requested = requestPath(url.pathname);
          const target = clean(url.pathname);
          if (target !== pagePath) {
            all.add(target);
            if (inMain && !excluded) internal.add(target);
          }
          const hop = redirectFor(requested);
          if (hop && hop !== requested) problems.push({ kind: 'redirect', href, target: requested, destination: finalUrl(requested) });
          else if (!requested.startsWith('/api/') && !onDisk.has(requested) && !onDisk.has(url.pathname)) {
            problems.push({ kind: 'unresolved', href, target: requested, cleaned: target });
          }
        } else if (/^https?:$/.test(url.protocol)) external.add(url.origin + url.pathname);
      }
    }
    for (const child of node.childNodes || []) walk(child, inMain, excluded);
    if (node.content) walk(node.content, inMain, excluded);
  };
  walk(parse(html), false, false);
  return { internal, all, external, problems };
}

const pages = new Map();
const titles = new Map();
for (const file of files(DIST).filter((f) => f.endsWith('.html'))) {
  const path = clean(toPath(file));
  const html = readFileSync(file, 'utf8');
  pages.set(path, pageLinks(html, path));
  const t = (html.match(/<title>([^<]*)<\/title>/) || [])[1];
  if (t) titles.set(path, t.replace(/&amp;/g, '&').replace(/&#39;/g, "'").replace(/&quot;/g, '"').replace(/&lt;/g, '<').replace(/&gt;/g, '>'));
}

const inbound = new Map([...indexable].map((p) => [p, new Set()]));
for (const [from, { internal }] of pages) {
  if (EXCLUDED_SOURCES.has(from) || !indexable.has(from)) continue;
  for (const to of internal) inbound.get(to)?.add(from);
}

const depth = new Map([['/', 0]]);
const queue = ['/'];
while (queue.length) {
  const page = queue.shift();
  if (EXCLUDED_SOURCES.has(page)) continue;
  for (const next of pages.get(page)?.all || []) {
    if (!depth.has(next) && pages.has(next)) {
      depth.set(next, depth.get(page) + 1);
      queue.push(next);
    }
  }
}
const tooDeep = [...indexable].filter((p) => !depth.has(p) || depth.get(p) > MAX_DEPTH);
const maxDepth = Math.max(0, ...[...indexable].map((p) => depth.get(p) ?? 0));

const rows = [...indexable].sort().map((p) => ({
  page: p,
  inbound: inbound.get(p).size,
  internalOut: pages.get(p)?.internal.size ?? 0,
  external: pages.get(p)?.external.size ?? 0,
}));
const longTitles = [...indexable].filter((p) => (titles.get(p) || '').length > 65);
const underLinked = rows.filter((r) => r.inbound < MIN_INBOUND);
const orphans = rows.filter((r) => r.inbound === 0);

const seenProblem = new Set();
const redirects = [];
const broken = [];
for (const [from, { problems }] of pages) {
  for (const problem of problems) {
    const key = `${problem.kind} ${from} ${problem.href} ${problem.target}`;
    if (seenProblem.has(key)) continue;
    seenProblem.add(key);
    if (problem.kind === 'redirect') redirects.push({ from, ...problem });
    // Built HTML is served without the .html suffix, so a link to /about is valid even though the file is about.html.
    else if (!pages.has(problem.cleaned) && problem.cleaned !== from) broken.push({ from, ...problem });
  }
}

const failing = rows.filter((r) => !pages.has(r.page) || r.inbound < MIN_INBOUND || r.internalOut === 0 || r.external === 0);

console.log(`${rows.length} indexable pages audited.`);
console.log(`Orphan pages: ${orphans.length}`);
console.log(`Pages with fewer than ${MIN_INBOUND} inbound contextual links: ${underLinked.length}`);
console.log(`Maximum click depth: ${tooDeep.length ? 'unreachable or ' + Math.max(...tooDeep.map((p) => depth.get(p) ?? Infinity)) : maxDepth}`);
console.log(`Broken internal links: ${broken.length}`);
console.log(`Redirect hops: ${redirects.length}`);

for (const [label, list] of [
  ['Orphan pages (no inbound links in content)', orphans],
  [`Fewer than ${MIN_INBOUND} inbound contextual links`, underLinked],
  ['No internal links in content', rows.filter((r) => r.internalOut === 0)],
  ['No outbound links to other sites', rows.filter((r) => r.external === 0)],
]) {
  console.log(`\n${label}: ${list.length}`);
  for (const r of list) console.log(`  ${r.inbound}  ${r.page}`);
}
console.log(`\nDeeper than ${MAX_DEPTH} clicks or unreachable: ${tooDeep.length}`);
for (const p of tooDeep) console.log(`  ${p} (${depth.get(p) ?? 'unreachable'})`);
console.log(`\nBroken internal links: ${broken.length}`);
for (const r of broken) console.log(`  ${r.from} -> ${r.target}  [${r.href}]`);
console.log(`\nInternal links that stop on a redirect: ${redirects.length}`);
for (const r of redirects) console.log(`  ${r.from} -> ${r.target} => ${r.destination}  [${r.href}]`);
console.log(`\nTitle tags over 65 characters: ${longTitles.length}`);
for (const p of longTitles) console.log(`  ${p} (${titles.get(p).length}): ${titles.get(p)}`);
const missing = rows.filter((r) => !pages.has(r.page));
if (missing.length) console.log(`\nIn sitemap but not built: ${missing.map((r) => r.page).join(', ')}`);
if (process.argv.includes('--verbose')) console.table(rows);
process.exit(failing.length || longTitles.length || tooDeep.length || broken.length || redirects.length ? 1 : 0);
