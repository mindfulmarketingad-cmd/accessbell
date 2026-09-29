// One issue (an axe rule) across a domain: where it fails now, where it was
// fixed since the previous scan, and how big a share of all issues it is.
import { query } from './db.js';
import { getDomain } from './domains.js';
import { badRequest, notFound } from './errors.js';

const MAX_ELEMENTS = 200;

const elementsOf = (item) =>
  item.elements?.length ? item.elements : (item.samples || []).map((html) => ({ html, target: '', fix: '' }));

export async function domainIssue(ctx, domainId, ruleId) {
  const rule = String(ruleId || '');
  if (!/^[a-z0-9-]{1,80}$/i.test(rule)) throw badRequest('Unknown issue.');
  const domain = await getDomain(ctx, domainId);
  // The two most recent completed scans of each monitored page and device.
  const scans = await query(
    `select * from (
       select s.page_id, s.device, s.issues, s.review, s.created_at, p.url,
              row_number() over (partition by s.page_id, s.device order by s.created_at desc) as rn
         from app.scans s
         join app.pages p on p.id = s.page_id and p.monitored
        where s.domain_id = $1 and s.status = 'done'
     ) t where rn <= 2`,
    [domain.id],
  );
  const latest = scans.filter((s) => Number(s.rn) === 1);
  const previous = new Map(scans.filter((s) => Number(s.rn) === 2).map((s) => [`${s.page_id}|${s.device}`, s]));

  let meta = null;
  let kind = null;
  let totalIssues = 0;
  const failed = [];
  const fixed = [];
  for (const scan of latest) {
    totalIssues += (scan.issues || []).reduce((n, i) => n + (i.count || 0), 0);
    const issue = (scan.issues || []).find((i) => i.id === rule);
    const review = issue ? null : (scan.review || []).find((i) => i.id === rule);
    const hit = issue || review;
    if (hit) {
      if (!meta || (issue && kind === 'review')) {
        meta = hit;
        kind = issue ? 'failed' : 'review';
      }
      failed.push({ url: scan.url, device: scan.device, scannedAt: scan.created_at, count: hit.count || 1, elements: elementsOf(hit) });
    }
    // Fixed: failing in the previous scan of this page, gone from the latest.
    const prev = previous.get(`${scan.page_id}|${scan.device}`);
    const before = (prev?.issues || []).find((i) => i.id === rule);
    if (before && !issue) {
      if (!meta) {
        meta = before;
        kind = 'fixed';
      }
      fixed.push({ url: scan.url, device: scan.device, fixedAt: scan.created_at, count: before.count || 1, elements: elementsOf(before) });
    }
  }
  if (!meta) throw notFound('This issue was not found in the latest scans of this domain.');

  const elements = failed.reduce((n, f) => n + f.count, 0);
  const trim = (list) => {
    let left = MAX_ELEMENTS;
    return list.map((f) => {
      const els = f.elements.slice(0, Math.max(0, left));
      left -= els.length;
      return { ...f, elements: els };
    });
  };
  return {
    // Only what the page shows: settings can hold secret header values.
    domain: { id: domain.id, hostname: domain.hostname },
    issue: {
      id: meta.id,
      kind,
      title: meta.title,
      description: meta.description || '',
      fix: meta.fix || '',
      impact: meta.impact || null,
      wcag: meta.wcag || [],
      helpUrl: meta.helpUrl || null,
    },
    pages: new Set(failed.map((f) => f.url)).size,
    elements,
    share: kind === 'failed' && totalIssues ? elements / totalIssues : null,
    failed: trim(failed.sort((a, b) => b.count - a.count)),
    fixed: trim(fixed),
    fixedElements: fixed.reduce((n, f) => n + f.count, 0),
  };
}
