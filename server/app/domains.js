// Domains, monitored pages, discovery and the domain-wide overview.
import { parse } from 'parse5';
import { query, one, tx } from './db.js';
import { LIMITS, ADMIN_DOMAIN_QUOTA, SUBSCRIBER_MIN_DOMAINS } from './config.js';
import { badRequest, notFound, AppError } from './errors.js';
import { requireRole, requireSubscription, isAdminUser } from './accounts.js';
import { assertSafeUrl } from '../net-guard.js';
import { fetchPage } from '../fetch-page.js';
import { VERSIONS, LEVELS } from '../wcag.js';
import { logActivity } from './activity.js';
import { recordDocuments, isPdfUrl } from './documents.js';

export const DEFAULT_SETTINGS = {
  wcagVersion: '2.2',
  wcagLevel: 'AA',
  devices: ['desktop'],
  includeSubdomains: false,
  delayMs: 0,
  scroll: false,
  headers: [],
  include: [],
  exclude: [],
  sitemapUrl: '',
};

const MASK = '********';

// ---------- Validation ----------

/** Turn "example.com" or "https://staging.example.com/app" into a base URL. */
export function normalizeSiteUrl(input) {
  let raw = String(input || '').trim();
  if (!raw) throw badRequest('Enter a website address, such as example.com.');
  if (!/^https?:\/\//i.test(raw)) raw = 'https://' + raw;
  let url;
  try {
    url = assertSafeUrl(raw);
  } catch (err) {
    throw badRequest(err.message || 'Enter a valid website address.');
  }
  url.hash = '';
  url.search = '';
  const base = url.toString().replace(/\/$/, '');
  return { hostname: url.hostname.replace(/^www\./, ''), baseUrl: base };
}

const hostMatches = (host, domainHost, includeSubdomains) => {
  const h = host.replace(/^www\./, '');
  return h === domainHost || (includeSubdomains && h.endsWith('.' + domainHost));
};

/** Validate a page URL belongs to the domain (or a subdomain, if enabled). */
export function normalizePageUrl(input, domain) {
  let raw = String(input || '').trim();
  if (!raw) throw badRequest('Enter a page URL.');
  if (raw.startsWith('/')) raw = domain.base_url.replace(/(https?:\/\/[^/]+).*/, '$1') + raw;
  if (!/^https?:\/\//i.test(raw)) raw = 'https://' + raw;
  let url;
  try {
    url = assertSafeUrl(raw);
  } catch (err) {
    throw badRequest(err.message || 'Enter a valid page URL.');
  }
  const settings = { ...DEFAULT_SETTINGS, ...domain.settings };
  if (!hostMatches(url.hostname, domain.hostname, settings.includeSubdomains)) {
    throw badRequest(
      settings.includeSubdomains
        ? `That page is not on ${domain.hostname} or its subdomains.`
        : `That page is not on ${domain.hostname}. Turn on subdomain coverage to add subdomain pages.`,
    );
  }
  url.hash = '';
  return url.toString();
}

const patternList = (v) =>
  (Array.isArray(v) ? v : String(v || '').split('\n'))
    .map((s) => String(s).trim())
    .filter(Boolean)
    .slice(0, 20)
    .map((s) => s.slice(0, 200));

/** A sitemap address on the domain: a full URL, or a path such as /sitemap.xml. */
function validateSitemapUrl(value, domain) {
  const raw = String(value || '').trim();
  if (!raw) return '';
  if (!domain) throw badRequest('Save the domain before adding a sitemap.');
  let url;
  try {
    url = assertSafeUrl(raw.startsWith('/') ? domain.base_url.replace(/(https?:\/\/[^/]+).*/, '$1') + raw : /^https?:\/\//i.test(raw) ? raw : 'https://' + raw);
  } catch {
    throw badRequest('Enter the full address of your sitemap, such as https://example.com/sitemap.xml.');
  }
  if (!hostMatches(url.hostname, domain.hostname, true)) throw badRequest(`The sitemap must be on ${domain.hostname}.`);
  url.hash = '';
  return url.toString();
}

/** Validate settings from the dashboard. Masked header values keep their stored value. */
export function validateSettings(input, existing = DEFAULT_SETTINGS, domain = null) {
  const s = { ...DEFAULT_SETTINGS, ...existing };
  const out = { ...s };
  if (input.wcagVersion !== undefined) {
    if (!VERSIONS.includes(input.wcagVersion)) throw badRequest('Choose WCAG 2.0, 2.1 or 2.2.');
    out.wcagVersion = input.wcagVersion;
  }
  if (input.wcagLevel !== undefined) {
    if (!LEVELS.includes(input.wcagLevel)) throw badRequest('Choose level A, AA or AAA.');
    out.wcagLevel = input.wcagLevel;
  }
  if (input.devices !== undefined) {
    const d = (Array.isArray(input.devices) ? input.devices : []).filter((x) => x === 'desktop' || x === 'mobile');
    if (!d.length) throw badRequest('Choose at least one device.');
    out.devices = [...new Set(d)];
  }
  if (input.includeSubdomains !== undefined) out.includeSubdomains = input.includeSubdomains === true;
  if (input.scroll !== undefined) out.scroll = input.scroll === true;
  if (input.delayMs !== undefined) {
    const n = Number(input.delayMs);
    if (!Number.isFinite(n) || n < 0 || n > 10_000) throw badRequest('Page load delay must be between 0 and 10,000 milliseconds.');
    out.delayMs = Math.round(n);
  }
  if (input.sitemapUrl !== undefined) out.sitemapUrl = validateSitemapUrl(input.sitemapUrl, domain);
  if (input.include !== undefined) out.include = patternList(input.include);
  if (input.exclude !== undefined) out.exclude = patternList(input.exclude);
  if (input.headers !== undefined) {
    const prev = new Map((s.headers || []).map((h) => [h.name.toLowerCase(), h.value]));
    const list = (Array.isArray(input.headers) ? input.headers : []).slice(0, 10);
    out.headers = [];
    for (const h of list) {
      const name = String(h?.name || '').trim();
      if (!name) continue;
      if (!/^[A-Za-z0-9-]{1,64}$/.test(name)) throw badRequest(`"${name.slice(0, 40)}" is not a valid header name.`);
      let value = String(h?.value ?? '');
      if (value === MASK) value = prev.get(name.toLowerCase()) ?? '';
      if (value.length > 2048 || /[\r\n\0]/.test(value)) throw badRequest(`The value for ${name} is not valid.`);
      out.headers.push({ name, value });
    }
  }
  return out;
}

/** Settings as shown in the dashboard: header values are never sent back. */
export const publicSettings = (settings) => {
  const s = { ...DEFAULT_SETTINGS, ...settings };
  return { ...s, headers: (s.headers || []).map((h) => ({ name: h.name, value: h.value ? MASK : '' })) };
};

const matchesPattern = (url, pattern) => {
  if (pattern.includes('*')) {
    const re = new RegExp('^' + pattern.split('*').map((p) => p.replace(/[.+?^${}()|[\]\\]/g, '\\$&')).join('.*') + '$', 'i');
    return re.test(url) || re.test(new URL(url).pathname);
  }
  return url.toLowerCase().includes(pattern.toLowerCase());
};

/** Apply include and exclude URL rules. */
export function applyUrlRules(urls, settings) {
  const s = { ...DEFAULT_SETTINGS, ...settings };
  return urls.filter((u) => (!s.include.length || s.include.some((p) => matchesPattern(u, p))) && !s.exclude.some((p) => matchesPattern(u, p)));
}

// ---------- Queries ----------

export async function getDomain(ctx, domainId) {
  if (!/^[0-9a-f-]{36}$/i.test(String(domainId || ''))) throw notFound('Domain not found.');
  const d = await one('select * from app.domains where id = $1 and account_id = $2', [domainId, ctx.account.id]);
  if (!d) throw notFound('Domain not found.');
  return d;
}

export async function getPage(ctx, pageId) {
  if (!/^[0-9a-f-]{36}$/i.test(String(pageId || ''))) throw notFound('Page not found.');
  const p = await one(
    `select p.*, d.hostname, d.base_url, d.settings
       from app.pages p join app.domains d on d.id = p.domain_id
      where p.id = $1 and d.account_id = $2`,
    [pageId, ctx.account.id],
  );
  if (!p) throw notFound('Page not found.');
  return p;
}

/**
 * Multi-domain view: each domain's score, open and resolved issues, the worst
 * severity found, and how many monitored pages failed their latest scan.
 */
export async function listDomains(ctx) {
  const domains = await query(
    `select d.id, d.hostname, d.base_url, d.created_at, d.settings->>'discoveredAt' as discovered_at,
            -- Read through to_jsonb so the list still works before migration 0005 adds the column.
            (to_jsonb(d)->>'fix_seen_at') as fix_seen_at,
            count(p.*)::int as pages,
            count(p.*) filter (where p.monitored)::int as monitored,
            round(avg(p.last_score) filter (where p.monitored and p.last_score is not null))::int as score,
            coalesce(sum(p.last_issues) filter (where p.monitored), 0)::int as issues,
            max(p.last_scanned_at) filter (where p.monitored) as last_scanned_at
       from app.domains d
       left join app.pages p on p.domain_id = d.id
      where d.account_id = $1
      group by d.id
      order by d.created_at asc`,
    [ctx.account.id],
  );
  if (!domains.length) return [];
  // Latest scan of each monitored page and device (any status), and the last two completed ones.
  const scans = await query(
    `select * from (
       select s.domain_id, s.page_id, s.device, s.status,
              (select coalesce(jsonb_agg(jsonb_build_object('id', e->>'id', 'impact', e->>'impact', 'count', e->'count')), '[]'::jsonb)
                 from jsonb_array_elements(coalesce(s.issues, '[]'::jsonb)) e) as issues,
              row_number() over (partition by s.page_id, s.device order by s.created_at desc) as rn_all,
              row_number() over (partition by s.page_id, s.device, s.status order by s.created_at desc) as rn_status
         from app.scans s
         join app.pages p on p.id = s.page_id and p.monitored
         join app.domains d on d.id = s.domain_id and d.account_id = $1
     ) t where rn_all = 1 or (status = 'done' and rn_status <= 2)`,
    [ctx.account.id],
  );
  const stats = new Map(domains.map((d) => [d.id, { resolved: 0, failedPages: new Set(), scannedPages: new Set(), worst: null }]));
  const rank = { critical: 4, serious: 3, moderate: 2, minor: 1 };
  const done = new Map();
  for (const s of scans) {
    const st = stats.get(s.domain_id);
    if (Number(s.rn_all) === 1) {
      st.scannedPages.add(s.page_id);
      if (s.status === 'failed') st.failedPages.add(s.page_id);
    }
    if (s.status === 'done') {
      const key = `${s.page_id}|${s.device}`;
      done.set(key, { ...(done.get(key) || {}), [Number(s.rn_status)]: s, domainId: s.domain_id });
    }
  }
  for (const { 1: latest, 2: prev, domainId } of done.values()) {
    const st = stats.get(domainId);
    if (!latest) continue;
    for (const i of latest.issues || []) if ((rank[i.impact] || 0) > (rank[st.worst] || 0)) st.worst = i.impact;
    const current = new Set((latest.issues || []).map((i) => i.id));
    for (const i of prev?.issues || []) if (!current.has(i.id)) st.resolved += Number(i.count) || 1;
  }
  return domains.map((d) => {
    const st = stats.get(d.id);
    return {
      ...d,
      resolved: st.resolved,
      worstImpact: st.worst,
      scannedPages: st.scannedPages.size,
      failedPages: st.failedPages.size,
    };
  });
}

export async function createDomain(ctx, input) {
  requireRole(ctx, 'admin');
  requireSubscription(ctx);
  const { hostname, baseUrl } = normalizeSiteUrl(input);
  const created = await tx(async (q) => {
    // Lock the account row so concurrent requests cannot exceed the quota.
    const [account] = await q('select domain_quota from app.accounts where id = $1 for update', [ctx.account.id]);
    const [{ n }] = await q('select count(*)::int as n from app.domains where account_id = $1', [ctx.account.id]);
    const quota = isAdminUser(ctx.user) ? Math.max(account.domain_quota, ADMIN_DOMAIN_QUOTA) : Math.max(account.domain_quota, ctx.subscriber ? SUBSCRIBER_MIN_DOMAINS : 0);
    if (n >= quota) {
      throw new AppError(402, `Your plan covers ${quota} domain${quota === 1 ? '' : 's'}. Add another domain in Billing to monitor more.`, 'domain_quota');
    }
    const existing = await q('select id from app.domains where account_id = $1 and hostname = $2', [ctx.account.id, hostname]);
    if (existing.length) throw badRequest(`${hostname} is already in your account.`);
    const [domain] = await q(
      'insert into app.domains (account_id, hostname, base_url, settings) values ($1, $2, $3, $4) returning *',
      [ctx.account.id, hostname, baseUrl, DEFAULT_SETTINGS],
    );
    // Monitor the home page straight away.
    await q(`insert into app.pages (domain_id, url, monitored, source) values ($1, $2, true, 'manual')`, [domain.id, baseUrl + '/']);
    return domain;
  });
  await logActivity(ctx, created.id, 'domain.added', { url: baseUrl });
  return created;
}

export async function updateDomainSettings(ctx, domainId, input) {
  requireRole(ctx, 'admin');
  const domain = await getDomain(ctx, domainId);
  const settings = validateSettings(input || {}, domain.settings, domain);
  await query('update app.domains set settings = $2 where id = $1', [domain.id, settings]);
  // Only the public settings: header values can be secrets.
  await logActivity(ctx, domain.id, 'settings.updated', {
    wcagVersion: settings.wcagVersion,
    wcagLevel: settings.wcagLevel,
    devices: settings.devices,
    includeSubdomains: settings.includeSubdomains,
  });
  return publicSettings(settings);
}

export async function deleteDomain(ctx, domainId) {
  requireRole(ctx, 'admin');
  const domain = await getDomain(ctx, domainId);
  await query('delete from app.domains where id = $1', [domain.id]);
}

const limitError = (err) => {
  if (err && err.message && err.message.includes('monitored_page_limit')) {
    return new AppError(400, `Pro monitors up to ${LIMITS.monitoredPagesPerDomain} URLs per domain. Stop monitoring another page first.`, 'page_limit');
  }
  return err;
};

export async function addPage(ctx, domainId, url) {
  requireRole(ctx, 'member');
  requireSubscription(ctx);
  const domain = await getDomain(ctx, domainId);
  const clean = normalizePageUrl(url, domain);
  let page;
  try {
    page = await one(
      `insert into app.pages (domain_id, url, monitored, source) values ($1, $2, true, 'manual')
       on conflict (domain_id, url) do update set monitored = true
       returning *`,
      [domain.id, clean],
    );
  } catch (err) {
    throw limitError(err);
  }
  await logActivity(ctx, domain.id, 'page.added', { page: page.url });
  return page;
}

export async function setMonitored(ctx, pageId, monitored) {
  requireRole(ctx, 'member');
  if (monitored) requireSubscription(ctx);
  const page = await getPage(ctx, pageId);
  let updated;
  try {
    updated = await one('update app.pages set monitored = $2 where id = $1 returning *', [page.id, monitored === true]);
  } catch (err) {
    throw limitError(err);
  }
  if (page.monitored !== updated.monitored) await logActivity(ctx, page.domain_id, updated.monitored ? 'page.monitored' : 'page.unmonitored', { page: page.url });
  return updated;
}

export async function deletePage(ctx, pageId) {
  requireRole(ctx, 'member');
  const page = await getPage(ctx, pageId);
  await query('delete from app.pages where id = $1', [page.id]);
  await logActivity(ctx, page.domain_id, 'page.removed', { page: page.url });
}

/**
 * "Select pages & Scan": the chosen pages become the domain's monitored pages
 * (up to 500) and every other page stops being monitored.
 */
export async function selectPages(ctx, domainId, pageIds) {
  requireRole(ctx, 'member');
  requireSubscription(ctx);
  const domain = await getDomain(ctx, domainId);
  const ids = [...new Set((Array.isArray(pageIds) ? pageIds : []).map(String))];
  if (!ids.length) throw badRequest('Select at least one page to scan.');
  if (ids.length > LIMITS.monitoredPagesPerDomain) throw badRequest(`Select up to ${LIMITS.monitoredPagesPerDomain} pages.`);
  if (ids.some((x) => !/^[0-9a-f-]{36}$/i.test(x))) throw badRequest('One of the selected pages was not found.');
  const monitored = await tx(async (q) => {
    const found = await q('select id from app.pages where domain_id = $1 and id = any($2::uuid[])', [domain.id, ids]);
    if (found.length !== ids.length) throw badRequest('One of the selected pages was not found. Reload and try again.');
    await q('update app.pages set monitored = false where domain_id = $1 and monitored and not (id = any($2::uuid[]))', [domain.id, ids]);
    await q('update app.pages set monitored = true where domain_id = $1 and id = any($2::uuid[]) and not monitored', [domain.id, ids]);
    return q('select id, url from app.pages where domain_id = $1 and monitored order by url', [domain.id]);
  });
  await logActivity(ctx, domain.id, 'pages.selected', { monitored: monitored.length });
  return monitored;
}

/** Add pages by hand to the found pages list. They are not monitored until selected. */
export async function addPages(ctx, domainId, urls) {
  requireRole(ctx, 'member');
  requireSubscription(ctx);
  const domain = await getDomain(ctx, domainId);
  const list = (Array.isArray(urls) ? urls : String(urls || '').split(/\s+/)).map((u) => String(u).trim()).filter(Boolean);
  if (!list.length) throw badRequest('Enter at least one page URL.');
  if (list.length > 50) throw badRequest('Add up to 50 pages at a time.');
  const clean = [...new Set(list.map((u) => normalizePageUrl(u, domain)))];
  const [{ n }] = await query('select count(*)::int as n from app.pages where domain_id = $1', [domain.id]);
  if (n + clean.length > LIMITS.discoveredPagesPerDomain + 100) throw badRequest('This domain has reached the maximum number of pages.');
  await query(
    `insert into app.pages (domain_id, url, monitored, source)
     select $1, u, false, 'manual' from unnest($2::text[]) as u
     on conflict (domain_id, url) do nothing`,
    [domain.id, clean],
  );
  return query('select id, url, monitored, source from app.pages where domain_id = $1 and url = any($2::text[])', [domain.id, clean]);
}

// ---------- Discovery (automatic crawl + sitemap scanning) ----------

const SKIP_EXT = /\.(pdf|jpe?g|png|gif|webp|svg|ico|zip|gz|mp4|mp3|webm|css|js|json|xml|txt|docx?|xlsx?|pptx?)$/i;

export function linksFromHtml(html, base) {
  const out = new Set();
  const walk = (node) => {
    for (const c of node.childNodes || []) {
      if (c.tagName === 'a') {
        const href = (c.attrs || []).find((a) => a.name === 'href')?.value;
        if (href) {
          try {
            const u = new URL(href, base);
            if (u.protocol === 'http:' || u.protocol === 'https:') {
              u.hash = '';
              out.add(u.toString());
            }
          } catch {}
        }
      }
      if (c.childNodes) walk(c);
      if (c.content) walk(c.content);
    }
  };
  walk(parse(html));
  return [...out];
}

const locsFromXml = (xml) => [...xml.matchAll(/<loc>\s*([^<\s]+)\s*<\/loc>/gi)].map((m) => m[1].replace(/&amp;/g, '&'));

/** Read sitemap URLs from robots.txt and /sitemap.xml, following one level of sitemap indexes. */
export async function readSitemaps(origin, fetcher = fetchPage, extra = []) {
  // A sitemap the customer gave us comes first, then the usual places.
  const candidates = new Set([...extra.filter(Boolean), `${origin}/sitemap.xml`]);
  try {
    const robots = await fetcher(`${origin}/robots.txt`, { kind: 'text' });
    for (const m of robots.text.matchAll(/^\s*sitemap:\s*(\S+)/gim)) candidates.add(m[1]);
  } catch {}
  const pages = new Set();
  const queue = [...candidates].slice(0, 5);
  let fetched = 0;
  while (queue.length && fetched < 10 && pages.size < LIMITS.discoveredPagesPerDomain) {
    const sm = queue.shift();
    fetched++;
    let xml;
    try {
      xml = (await fetcher(sm, { kind: 'xml' })).text;
    } catch {
      continue;
    }
    const locs = locsFromXml(xml);
    if (/<sitemapindex/i.test(xml)) queue.push(...locs.slice(0, 8));
    else locs.forEach((l) => pages.add(l));
  }
  return [...pages];
}

/**
 * Discover pages from the sitemap and the home page's links. Found pages
 * are saved unmonitored so the customer can choose which 25 to monitor.
 */
export async function discoverPages(ctx, domainId, { fetcher = fetchPage } = {}) {
  requireRole(ctx, 'member');
  requireSubscription(ctx);
  const domain = await getDomain(ctx, domainId);
  const settings = { ...DEFAULT_SETTINGS, ...domain.settings };
  const origin = domain.base_url.replace(/(https?:\/\/[^/]+).*/, '$1');

  const fromSitemap = await readSitemaps(origin, fetcher, [settings.sitemapUrl]);
  let fromLinks = [];
  try {
    const home = await fetcher(domain.base_url + '/');
    fromLinks = linksFromHtml(home.html, home.finalUrl);
  } catch {}

  const seen = new Set();
  const found = [];
  const pdfs = [];
  const consider = (u, source) => {
    let url;
    try {
      url = new URL(u);
    } catch {
      return;
    }
    if (['http:', 'https:'].includes(url.protocol) && isPdfUrl(url.toString())) {
      pdfs.push(url.toString());
      return;
    }
    if (!['http:', 'https:'].includes(url.protocol) || SKIP_EXT.test(url.pathname)) return;
    if (!hostMatches(url.hostname, domain.hostname, settings.includeSubdomains)) return;
    url.hash = '';
    const key = url.toString();
    if (seen.has(key)) return;
    seen.add(key);
    found.push({ url: key, source });
  };
  fromSitemap.forEach((u) => consider(u, 'sitemap'));
  fromLinks.forEach((u) => consider(u, 'crawl'));

  const allowed = new Set(applyUrlRules(found.map((f) => f.url), settings));
  const toSave = found.filter((f) => allowed.has(f.url)).slice(0, LIMITS.discoveredPagesPerDomain);

  // One insert for every page, so large sitemaps save quickly.
  const rows = toSave.length
    ? await query(
        `insert into app.pages (domain_id, url, monitored, source)
         select $1, u, false, src from unnest($2::text[], $3::text[]) as t(u, src)
         on conflict (domain_id, url) do nothing returning id`,
        [domain.id, toSave.map((f) => f.url), toSave.map((f) => f.source)],
      )
    : [];
  const added = rows.length;
  if (pdfs.length) await recordDocuments(domain, domain.base_url + '/', pdfs);
  await query(`update app.domains set settings = settings || jsonb_build_object('discoveredAt', now()) where id = $1`, [domain.id]);
  return { found: toSave.length, added, fromSitemap: fromSitemap.length, fromLinks: fromLinks.length };
}

// ---------- Domain-wide overview ----------

/** Fingerprint an element snippet so the same component on many pages groups together. */
export function componentKey(html) {
  const tag = (/^<([a-z0-9-]+)/i.exec(html) || [])[1] || 'element';
  const id = (/\sid="([^"]+)"/i.exec(html) || [])[1];
  const cls = (/\sclass="([^"]+)"/i.exec(html) || [])[1];
  // Drop build hashes (CSS modules: "Header__toggle__sw4RU") and numbers, keep real names.
  const stable = (s) =>
    s.replace(/(__|-)[A-Za-z0-9]{4,}$/, (m) => (/[0-9]/.test(m) || /[A-Z]/.test(m.slice(3)) ? '' : m)).replace(/\d+/g, '');
  const classes = cls ? cls.split(/\s+/).filter(Boolean).map(stable).sort().slice(0, 4).join('.') : '';
  return `${tag.toLowerCase()}${id ? '#' + stable(id) : ''}${classes ? '.' + classes : ''}`;
}

export async function domainOverview(ctx, domainId) {
  const domain = await getDomain(ctx, domainId);
  const pages = await query(
    `select id, url, monitored, source, last_score, last_issues, last_scanned_at, last_scan_id
       from app.pages where domain_id = $1
      order by monitored desc, url asc`,
    [domain.id],
  );
  // The two most recent scans per monitored page and device: the latest drives
  // the overview, the one before it shows what was resolved.
  const recent = await query(
    `select * from (
       select s.page_id, s.device, s.score,
              -- Screenshots are left out: the overview never shows them and they are large.
              (select coalesce(jsonb_agg(e - 'shot'), '[]'::jsonb) from jsonb_array_elements(coalesce(s.issues, '[]'::jsonb)) e) as issues,
              s.passes, s.review, s.created_at,
              row_number() over (partition by s.page_id, s.device order by s.created_at desc) as rn
         from app.scans s
         join app.pages p on p.id = s.page_id and p.monitored
        where s.domain_id = $1 and s.status = 'done'
     ) t where rn <= 2`,
    [domain.id],
  );
  const latest = recent.filter((r) => Number(r.rn) === 1);
  const previous = new Map(recent.filter((r) => Number(r.rn) === 2).map((r) => [`${r.page_id}|${r.device}`, r]));

  // Daily history: for each page and device, its last scan of the day.
  const history = await query(
    `with daily as (
       select distinct on (date_trunc('day', created_at), page_id, device)
              date_trunc('day', created_at) as day, page_id, score, coalesce(issues_count, 0) as issues
         from app.scans
        where domain_id = $1 and status = 'done' and created_at > now() - interval '90 days'
        order by date_trunc('day', created_at), page_id, device, created_at desc
     )
     select day, round(avg(score))::int as score, count(distinct page_id)::int as pages, sum(issues)::int as issues
       from daily group by day order by day`,
    [domain.id],
  );

  const urlOf = new Map(pages.map((p) => [p.id, p.url]));
  const byRule = new Map();
  const byCriterion = new Map();
  const byComponent = new Map();
  const byReview = new Map();
  const coverage = {}; // sc -> { issues, passed, review, rules, reviewRules }
  const cov = (sc) => (coverage[sc] ||= { issues: 0, passed: false, review: 0, rules: [], reviewRules: [] });
  const addRule = (list, id, title) => {
    if (!list.some((r) => r.id === id)) list.push({ id, title });
  };
  const impacts = { critical: 0, serious: 0, moderate: 0, minor: 0 };
  let resolved = 0;

  for (const scan of latest) {
    const current = new Set((scan.issues || []).map((i) => i.id));
    const prev = previous.get(`${scan.page_id}|${scan.device}`);
    for (const i of prev?.issues || []) if (!current.has(i.id)) resolved += i.count || 1;

    for (const issue of scan.issues || []) {
      impacts[issue.impact] = (impacts[issue.impact] || 0) + issue.count;
      const r =
        byRule.get(issue.id) ||
        { id: issue.id, title: issue.title, impact: issue.impact, wcag: issue.wcag, helpUrl: issue.helpUrl, description: issue.description, fix: issue.fix, elements: 0, pages: new Set(), samples: [] };
      r.elements += issue.count;
      r.pages.add(scan.page_id);
      for (const sample of issue.samples || []) {
        if (r.samples.length < 6 && !r.samples.some((x) => x.code === sample)) r.samples.push({ code: sample, url: urlOf.get(scan.page_id) });
      }
      byRule.set(issue.id, r);
      for (const w of issue.wcag || []) {
        const c = byCriterion.get(w.sc) || { sc: w.sc, level: w.level, elements: 0, rules: new Set() };
        c.elements += issue.count;
        c.rules.add(issue.id);
        byCriterion.set(w.sc, c);
        if (w.level && w.level !== '-') {
          cov(w.sc).issues += issue.count;
          addRule(cov(w.sc).rules, issue.id, issue.title);
        }
      }
      for (const sample of issue.samples || []) {
        const key = `${issue.id}|${componentKey(sample)}`;
        const g = byComponent.get(key) || { rule: issue.id, title: issue.title, impact: issue.impact, component: componentKey(sample), sample, pages: new Set() };
        g.pages.add(scan.page_id);
        byComponent.set(key, g);
      }
    }
    for (const pass of scan.passes || []) for (const w of pass.wcag || []) if (w.level && w.level !== '-') cov(w.sc).passed = true;
    for (const item of scan.review || []) {
      const r = byReview.get(item.id) || { id: item.id, title: item.title, wcag: item.wcag, helpUrl: item.helpUrl, elements: 0, pages: new Set() };
      r.elements += item.count || 1;
      r.pages.add(scan.page_id);
      byReview.set(item.id, r);
      for (const w of item.wcag || []) {
        if (w.level && w.level !== '-') {
          cov(w.sc).review += item.count || 1;
          addRule(cov(w.sc).reviewRules, item.id, item.title);
        }
      }
    }
  }
  const order = { critical: 0, serious: 1, moderate: 2, minor: 3 };
  const monitored = pages.filter((p) => p.monitored);
  const scored = monitored.filter((p) => p.last_score !== null);
  const lastScanAt = latest.reduce((m, s) => (!m || s.created_at > m ? s.created_at : m), null);
  // Monitored pages whose most recent scan failed (a partial scan).
  const failed = await query(
    `select distinct on (s.page_id, s.device) s.page_id, s.status, s.error
       from app.scans s join app.pages p on p.id = s.page_id and p.monitored
      where s.domain_id = $1
      order by s.page_id, s.device, s.created_at desc`,
    [domain.id],
  );
  const failedPages = new Set(failed.filter((f) => f.status === 'failed').map((f) => f.page_id));

  return {
    domain: {
      id: domain.id,
      hostname: domain.hostname,
      baseUrl: domain.base_url,
      settings: publicSettings(domain.settings),
    },
    score: scored.length ? Math.round(scored.reduce((n, p) => n + p.last_score, 0) / scored.length) : null,
    impacts,
    resolved,
    lastScanAt,
    scannedPages: new Set(latest.map((s) => s.page_id)).size,
    failedPages: [...failedPages].map((pid) => urlOf.get(pid)),
    discoveredAt: domain.settings?.discoveredAt || null,
    monitoredCount: monitored.length,
    monitoredLimit: LIMITS.monitoredPagesPerDomain,
    pages,
    history,
    trend: history.map((h) => ({ day: h.day, score: h.score })),
    coverage,
    rules: [...byRule.values()]
      .map((r) => ({ ...r, pageUrls: [...r.pages].map((id) => urlOf.get(id)).slice(0, 10), pages: r.pages.size }))
      .sort((a, b) => order[a.impact] - order[b.impact] || b.pages - a.pages || b.elements - a.elements),
    review: [...byReview.values()].map((r) => ({ ...r, pages: r.pages.size })).sort((a, b) => b.elements - a.elements),
    criteria: [...byCriterion.values()].map((c) => ({ ...c, rules: c.rules.size })).sort((a, b) => b.elements - a.elements),
    components: [...byComponent.values()]
      .map((g) => ({ ...g, pages: g.pages.size }))
      .filter((g) => g.pages > 1)
      .sort((a, b) => b.pages - a.pages || order[a.impact] - order[b.impact])
      .slice(0, 20),
  };
}
