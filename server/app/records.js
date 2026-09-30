// Compliance records: dated documentation of a domain's accessibility testing and
// remediation, for audits and legal defense. Built from the scans AccessBell ran,
// the changes people made in the dashboard and the remediation notes they wrote.
// Each record is stored exactly as issued with a SHA-256 fingerprint so it can be
// downloaded again and verified later.
import crypto from 'node:crypto';
import { query, one } from './db.js';
import { requireRole } from './accounts.js';
import { getDomain } from './domains.js';
import { AppError, badRequest, notFound } from './errors.js';

const UNDEFINED_TABLE = '42P01';
const UNDEFINED_COLUMN = '42703';
const DAY_MS = 86_400_000;
const MAX_SPAN_DAYS = 1096;
const MAX_EVENTS = 5000;
const MAX_ACTIVITY = 2000;
const MAX_PAGES = 1000;
export const RECORD_FORMAT = 'accessbell-compliance-record/1';
export const SCHEDULE = 'Every day at 06:00 UTC';

export const DISCLAIMER =
  'This record documents automated accessibility testing and the remediation activity logged in AccessBell for the period shown. ' +
  'Automated testing detects many, but not all, WCAG failures, and an issue that is no longer detected may have been fixed or removed from the page. ' +
  'This record is not a certification of conformance or legal advice.';

const isMissing = (err) => err?.code === UNDEFINED_TABLE || err?.code === UNDEFINED_COLUMN;

async function needsMigration(run) {
  try {
    return await run();
  } catch (err) {
    if (isMissing(err)) {
      throw new AppError(503, 'Compliance records need a database update. Run supabase/migrations/0008_compliance_records.sql in Supabase.', 'migration_needed');
    }
    throw err;
  }
}

export const sha256 = (text) => crypto.createHash('sha256').update(text, 'utf8').digest('hex');

// ---------- Remediation notes and the activity list ----------

const isoDay = (d) => new Date(d).toISOString().slice(0, 10);

function parseDay(value, label) {
  const s = String(value || '');
  if (!/^\d{4}-\d{2}-\d{2}$/.test(s) || Number.isNaN(Date.parse(`${s}T00:00:00Z`)) || isoDay(`${s}T00:00:00Z`) !== s) {
    throw badRequest(`Enter the ${label} as a date.`);
  }
  return s;
}

/** A remediation note: work done outside AccessBell, such as a code change or a manual test. */
export async function addNote(ctx, domainId, input) {
  requireRole(ctx, 'member');
  const domain = await getDomain(ctx, domainId);
  const text = String(input?.text ?? '').trim();
  if (!text) throw badRequest('Describe what was changed or tested.');
  if (text.length > 2000) throw badRequest('Keep the note under 2,000 characters.');
  const page = String(input?.page ?? '').trim();
  if (page.length > 2048 || (page && !/^(https?:\/\/|\/)[^\s]*$/i.test(page))) throw badRequest('Enter the page as a web address or a path such as /checkout, or leave it empty.');
  const today = isoDay(Date.now());
  const day = input?.date ? parseDay(input.date, 'date of the change') : today;
  if (day > today) throw badRequest('The date of the change cannot be in the future.');
  if (day < '2000-01-01') throw badRequest('Enter a date after the year 2000.');
  return needsMigration(async () => {
    const row = await one(
      `insert into app.activity_log (account_id, domain_id, user_id, user_email, action, detail, happened_on)
       values ($1, $2, $3, $4, 'note', $5, $6)
       returning id, action, detail, happened_on, user_email, created_at`,
      [ctx.account.id, domain.id, ctx.user.id, ctx.user.email || null, JSON.stringify({ text, page: page || undefined }), day],
    );
    return { entry: row };
  });
}

const recordSummary = (r) => ({ id: r.id, from: isoDay(r.period_from), to: isoDay(r.period_to), sha256: r.sha256, generatedBy: r.user_email, generatedAt: r.created_at });

// ---------- Building a record ----------

/** Validate the period. Defaults to the last 12 months, ending today. */
export function period(input = {}, now = Date.now()) {
  const today = isoDay(now);
  const to = input.to ? parseDay(input.to, 'end date') : today;
  const from = input.from ? parseDay(input.from, 'start date') : isoDay(Date.parse(`${to}T00:00:00Z`) - 365 * DAY_MS);
  if (to > today) throw badRequest('The end date cannot be in the future.');
  if (from > to) throw badRequest('The start date must be on or before the end date.');
  if ((Date.parse(to) - Date.parse(from)) / DAY_MS > MAX_SPAN_DAYS) throw badRequest('A record can cover up to 3 years. Choose a shorter period.');
  return { from, to, start: `${from}T00:00:00Z`, end: new Date(Date.parse(`${to}T00:00:00Z`) + DAY_MS).toISOString() };
}

// Rule id -> { title, impact, count, sc[] } for one scan's issues. Handles both
// issue shapes: wcag as ['1.1.1'] (HTML audit) or [{ sc: '1.1.1', ... }] (browser).
const RULES_SQL = `coalesce((
  select jsonb_object_agg(i->>'id', jsonb_build_object(
    'title', i->>'title',
    'impact', i->>'impact',
    'count', coalesce((i->>'count')::int, 1),
    'sc', (select coalesce(jsonb_agg(case when jsonb_typeof(w) = 'object' then w->>'sc' else w #>> '{}' end), '[]'::jsonb)
             from jsonb_array_elements(case when jsonb_typeof(i->'wcag') = 'array' then i->'wcag' else '[]'::jsonb end) w)))
    from jsonb_array_elements(case when jsonb_typeof(s.issues) = 'array' then s.issues else '[]'::jsonb end) i
   where i ? 'id'
), '{}'::jsonb)`;

async function snapshot(domainId, before) {
  const rows = await query(
    `select distinct on (s.page_id, s.device) s.page_id, s.device, s.score, s.issues_count, s.created_at
       from app.scans s
      where s.domain_id = $1 and s.status = 'done' and s.created_at < $2
      order by s.page_id, s.device, s.created_at desc`,
    [domainId, before],
  );
  const scored = rows.filter((r) => Number.isFinite(r.score));
  return {
    rows,
    summary: {
      pagesScanned: new Set(rows.map((r) => r.page_id)).size,
      averageScore: scored.length ? Math.round(scored.reduce((n, r) => n + r.score, 0) / scored.length) : null,
      openIssues: rows.reduce((n, r) => n + (r.issues_count || 0), 0),
    },
  };
}

/** Issues that stopped being detected, and new ones, between consecutive scans of a page. */
async function remediationEvents(domainId, start, end) {
  const rows = await query(
    `with s as (
       select s.id, s.page_id, s.device, s.created_at, s.trigger, ${RULES_SQL} as rules
         from app.scans s
        where s.domain_id = $1 and s.status = 'done'
          and s.created_at >= $2::timestamptz - interval '120 days' and s.created_at < $3
     ), l as (
       select s.*, lag(rules) over w as prev_rules, lag(created_at) over w as prev_at
         from s window w as (partition by page_id, device order by created_at)
     )
     select * from (
       select 'resolved' as kind, l.page_id, l.device, l.created_at as at, l.id as scan_id, l.trigger, l.prev_at, r.key as rule, r.value as meta
         from l cross join lateral jsonb_each(l.prev_rules) r
        where l.created_at >= $2 and l.prev_rules is not null and not (l.rules ? r.key)
       union all
       select 'detected', l.page_id, l.device, l.created_at, l.id, l.trigger, l.prev_at, r.key, r.value
         from l cross join lateral jsonb_each(l.rules) r
        where l.created_at >= $2 and l.prev_rules is not null and not (l.prev_rules ? r.key)
     ) e
     order by at asc, kind desc, rule asc
     limit ${MAX_EVENTS + 1}`,
    [domainId, start, end],
  );
  return rows;
}

async function openIssues(domainId, end) {
  return query(
    `with latest as (
       select distinct on (s.page_id, s.device) s.page_id, ${RULES_SQL} as rules
         from app.scans s
        where s.domain_id = $1 and s.status = 'done' and s.created_at < $2
        order by s.page_id, s.device, s.created_at desc
     )
     select r.key as rule, max(r.value->>'title') as title, max(r.value->>'impact') as impact,
            count(distinct latest.page_id)::int as pages, sum((r.value->>'count')::int)::int as elements,
            (array_agg(r.value->'sc'))[1] as sc
       from latest cross join lateral jsonb_each(latest.rules) r
      group by r.key
      order by case max(r.value->>'impact') when 'critical' then 0 when 'serious' then 1 when 'moderate' then 2 else 3 end, 5 desc`,
    [domainId, end],
  );
}

async function optional(run, fallback) {
  try {
    return await run();
  } catch (err) {
    if (isMissing(err)) return fallback;
    throw err;
  }
}

/** Everything in a record, in a fixed order so the same data always gives the same text. */
export async function buildRecord(ctx, domain, p, { id, generatedAt }) {
  const [stats] = await query(
    `select count(*)::int as total,
            count(*) filter (where trigger = 'scheduled')::int as scheduled,
            count(*) filter (where trigger = 'manual')::int as manual,
            count(*) filter (where status = 'failed')::int as failed,
            count(distinct page_id)::int as pages,
            min(created_at) as first_at, max(created_at) as last_at
       from app.scans where domain_id = $1 and created_at >= $2 and created_at < $3`,
    [domain.id, p.start, p.end],
  );
  const trend = await query(
    `select to_char(date_trunc('month', created_at), 'YYYY-MM') as month, count(*)::int as scans,
            round(avg(score))::int as average_score, round(avg(issues_count))::int as average_issues
       from app.scans where domain_id = $1 and status = 'done' and created_at >= $2 and created_at < $3
      group by 1 order by 1`,
    [domain.id, p.start, p.end],
  );
  const before = await snapshot(domain.id, p.start);
  const after = await snapshot(domain.id, p.end);
  const pageRows = await query('select id, url, monitored from app.pages where domain_id = $1', [domain.id]);
  const urlOf = new Map(pageRows.map((r) => [r.id, r.url]));

  const events = await remediationEvents(domain.id, p.start, p.end);
  const truncated = events.length > MAX_EVENTS;
  const eventList = events.slice(0, MAX_EVENTS).map((e) => ({
    type: e.kind,
    confirmedAt: new Date(e.at).toISOString(),
    lastSeenAt: e.prev_at ? new Date(e.prev_at).toISOString() : null,
    page: urlOf.get(e.page_id) || '(page removed)',
    device: e.device,
    rule: e.rule,
    title: e.meta?.title || e.rule,
    impact: e.meta?.impact || null,
    wcag: Array.isArray(e.meta?.sc) ? e.meta.sc : [],
    elements: e.meta?.count ?? null,
    scanId: e.scan_id,
    scanTrigger: e.trigger,
  }));

  const open = await openIssues(domain.id, p.end);
  const activity = await optional(
    () =>
      query(
        `select action, detail, happened_on, user_email, created_at
           from app.activity_log
          where domain_id = $1 and coalesce(happened_on::timestamptz, created_at) >= $2 and coalesce(happened_on::timestamptz, created_at) < $3
          order by coalesce(happened_on::timestamptz, created_at) asc, created_at asc
          limit ${MAX_ACTIVITY}`,
        [domain.id, p.start, p.end],
      ),
    [],
  );
  const fixes = await optional(
    () =>
      query(
        `select f.kind, f.selector, f.value, f.enabled, f.created_at, pr.email
           from app.fixes f left join app.profiles pr on pr.user_id = f.created_by
          where f.domain_id = $1 and f.created_at < $2 order by f.created_at asc`,
        [domain.id, p.end],
      ),
    [],
  );

  const settings = domain.settings || {};
  const st = domain.statement;
  const resolvedCount = eventList.filter((e) => e.type === 'resolved').length;
  return {
    format: RECORD_FORMAT,
    recordId: id,
    generatedAt,
    generatedBy: ctx.user.email || null,
    organization: ctx.account.name || null,
    domain: { hostname: domain.hostname, baseUrl: domain.base_url, addedAt: new Date(domain.created_at).toISOString() },
    period: { from: p.from, to: p.to },
    standard: {
      wcagVersion: settings.wcagVersion || '2.2',
      wcagLevel: settings.wcagLevel || 'AA',
      devices: Array.isArray(settings.devices) && settings.devices.length ? settings.devices : ['desktop'],
      includeSubdomains: settings.includeSubdomains === true,
    },
    monitoring: {
      schedule: SCHEDULE,
      monitoredPages: pageRows.filter((r) => r.monitored).length,
    },
    scans: {
      total: stats.total,
      scheduled: stats.scheduled,
      manual: stats.manual,
      failed: stats.failed,
      pagesScanned: stats.pages,
      firstScanAt: stats.first_at ? new Date(stats.first_at).toISOString() : null,
      lastScanAt: stats.last_at ? new Date(stats.last_at).toISOString() : null,
    },
    status: { start: before.summary, end: after.summary },
    trend: trend.map((t) => ({ month: t.month, scans: t.scans, averageScore: t.average_score, averageIssues: t.average_issues })),
    remediation: {
      resolved: resolvedCount,
      detected: eventList.length - resolvedCount,
      truncated,
      events: eventList,
    },
    openIssues: open.map((o) => ({ rule: o.rule, title: o.title || o.rule, impact: o.impact, wcag: Array.isArray(o.sc) ? o.sc : [], pages: o.pages, elements: o.elements })),
    pages: after.rows
      .slice(0, MAX_PAGES)
      .map((r) => ({ page: urlOf.get(r.page_id) || '(page removed)', device: r.device, score: r.score, issues: r.issues_count, lastScanAt: new Date(r.created_at).toISOString() }))
      .sort((a, b) => a.page.localeCompare(b.page) || a.device.localeCompare(b.device)),
    activity: activity.map((a) => ({
      at: new Date(a.created_at).toISOString(),
      date: a.happened_on ? isoDay(a.happened_on) : isoDay(a.created_at),
      by: a.user_email || null,
      action: a.action,
      detail: a.detail || {},
    })),
    fixes: fixes.map((f) => ({ addedAt: new Date(f.created_at).toISOString(), by: f.email || null, kind: f.kind, selector: f.selector, value: f.value, enabled: f.enabled })),
    statement: st
      ? { organization: st.org || null, status: st.status || null, contact: st.email || null, updatedAt: st.updatedAt || null, url: domain.site_key ? `/statement?k=${domain.site_key}` : null }
      : null,
    disclaimer: DISCLAIMER,
  };
}

// ---------- Compliance Vault ----------

const monthsBack = (n, now = new Date()) => {
  const out = [];
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - i, 1));
    out.push(d.toISOString().slice(0, 7));
  }
  return out;
};

/**
 * Everything the Compliance Vault tab shows: the current score, 12 monthly scan
 * snapshots, the fix log, recent activity, issued records and statement status.
 */
export async function vault(ctx, domainId) {
  const domain = await getDomain(ctx, domainId);
  const now = Date.now();
  const yearAgo = new Date(Date.UTC(new Date(now).getUTCFullYear(), new Date(now).getUTCMonth() - 11, 1)).toISOString();
  const end = new Date(now + DAY_MS).toISOString();

  const current = await snapshot(domain.id, end);
  const months = await query(
    `select to_char(date_trunc('month', created_at), 'YYYY-MM') as month, count(*)::int as scans,
            count(distinct page_id)::int as pages,
            round(avg(score))::int as average_score, round(avg(issues_count))::int as average_issues
       from app.scans where domain_id = $1 and status = 'done' and created_at >= $2
      group by 1`,
    [domain.id, yearAgo],
  );
  const byMonth = new Map(months.map((m) => [m.month, m]));
  const archive = monthsBack(12, new Date(now)).map((month) => {
    const m = byMonth.get(month);
    return { month, scans: m?.scans || 0, pages: m?.pages || 0, averageScore: m?.average_score ?? null, averageIssues: m?.average_issues ?? null };
  });

  const pageRows = await query('select id, url from app.pages where domain_id = $1', [domain.id]);
  const urlOf = new Map(pageRows.map((r) => [r.id, r.url]));
  const events = await remediationEvents(domain.id, yearAgo, end);
  const fixLog = events
    .filter((e) => e.kind === 'resolved')
    .reverse()
    .slice(0, 300)
    .map((e) => ({
      confirmedAt: new Date(e.at).toISOString(),
      lastSeenAt: e.prev_at ? new Date(e.prev_at).toISOString() : null,
      page: urlOf.get(e.page_id) || '(page removed)',
      device: e.device,
      title: e.meta?.title || e.rule,
      impact: e.meta?.impact || null,
      wcag: Array.isArray(e.meta?.sc) ? e.meta.sc : [],
      elements: e.meta?.count ?? null,
      scanTrigger: e.trigger,
    }));

  let activity = [];
  let records = [];
  let migrationNeeded = false;
  try {
    activity = await query(
      `select id, action, detail, happened_on, user_email, created_at
         from app.activity_log where domain_id = $1 order by created_at desc limit 100`,
      [domain.id],
    );
    records = (
      await query(
        `select id, period_from, period_to, sha256, user_email, created_at
           from app.compliance_records where domain_id = $1 order by created_at desc limit 50`,
        [domain.id],
      )
    ).map(recordSummary);
  } catch (err) {
    if (!isMissing(err)) throw err;
    migrationNeeded = true;
  }

  const st = domain.statement;
  const rows = current.rows;
  return {
    hostname: domain.hostname,
    score: current.summary.averageScore,
    pagesScanned: current.summary.pagesScanned,
    openIssues: current.summary.openIssues,
    lastScanAt: rows.length ? new Date(Math.max(...rows.map((r) => new Date(r.created_at).getTime()))).toISOString() : null,
    certificateReady: rows.length > 0 && rows.every((r) => r.score === 100 && !r.issues_count),
    statement: st ? { saved: true, organization: st.org || null, updatedAt: st.updatedAt || null, url: domain.site_key ? `/statement?k=${domain.site_key}` : null } : { saved: false },
    archive,
    fixLog,
    activity,
    records,
    migrationNeeded,
  };
}

/**
 * The certificate is only issued when every monitored page passed every automated
 * check in its latest scan. It says exactly that, and nothing more.
 */
export async function certificate(ctx, domainId) {
  const domain = await getDomain(ctx, domainId);
  const { rows } = await snapshot(domain.id, new Date(Date.now() + DAY_MS).toISOString());
  const ready = rows.length > 0 && rows.every((r) => r.score === 100 && !r.issues_count);
  if (!ready) throw new AppError(409, 'The certificate unlocks when every scanned page scores 100 in its latest scan.', 'not_eligible');
  const settings = domain.settings || {};
  return {
    hostname: domain.hostname,
    organization: ctx.account.name || null,
    standard: `WCAG ${settings.wcagVersion || '2.2'} Level ${settings.wcagLevel || 'AA'}`,
    pages: new Set(rows.map((r) => r.page_id)).size,
    devices: [...new Set(rows.map((r) => r.device))].sort(),
    lastScanAt: new Date(Math.max(...rows.map((r) => new Date(r.created_at).getTime()))).toISOString(),
    issuedAt: new Date().toISOString(),
  };
}

// ---------- Issuing, reading and verifying records ----------

export async function createRecord(ctx, domainId, input) {
  const domain = await getDomain(ctx, domainId);
  const p = period(input);
  return needsMigration(async () => {
    const id = crypto.randomUUID();
    const generatedAt = new Date().toISOString();
    const record = await buildRecord(ctx, domain, p, { id, generatedAt });
    const body = JSON.stringify(record);
    const hash = sha256(body);
    await query(
      `insert into app.compliance_records (id, account_id, domain_id, hostname, user_id, user_email, period_from, period_to, body, sha256, created_at)
       values ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
      [id, ctx.account.id, domain.id, domain.hostname, ctx.user.id, ctx.user.email || null, p.from, p.to, body, hash, generatedAt],
    );
    return { id, sha256: hash, body };
  });
}

/** A record exactly as issued. `body` is the text the fingerprint was taken from. */
export async function getRecord(ctx, recordId) {
  if (!/^[0-9a-f-]{36}$/i.test(String(recordId || ''))) throw notFound('Record not found.');
  return needsMigration(async () => {
    const row = await one('select id, body, sha256 from app.compliance_records where id = $1 and account_id = $2', [recordId, ctx.account.id]);
    if (!row) throw notFound('Record not found.');
    return { id: row.id, sha256: row.sha256, body: row.body };
  });
}

/**
 * Public check that a record ID and fingerprint match a record AccessBell issued.
 * Reveals only the domain, the period and when it was issued, never the contents.
 */
export async function verifyRecord(recordId, hash) {
  const id = String(recordId || '').trim().toLowerCase();
  const h = String(hash || '').trim().toLowerCase();
  if (!/^[0-9a-f-]{36}$/.test(id) || !/^[0-9a-f]{64}$/.test(h)) return { valid: false };
  const row = await needsMigration(() => one('select body, sha256, hostname, period_from, period_to, created_at from app.compliance_records where id = $1', [id]));
  if (!row || row.sha256 !== h || sha256(row.body) !== h) return { valid: false };
  return { valid: true, hostname: row.hostname, from: isoDay(row.period_from), to: isoDay(row.period_to), issuedAt: new Date(row.created_at).toISOString() };
}
