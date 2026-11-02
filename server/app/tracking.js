// Best-effort tracking for the admin account page. Every function here
// swallows its own errors: tracking must never break a scan, an email or the
// AccessBellFix script. Nothing here sends email or changes billing.
import { query, one } from './db.js';
import { config } from './config.js';
import { TRACKING_SCHEMA_SQL } from './tracking-schema.js';

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const MISSING = new Set(['42P01', '42703']);

/** A page scan still "running" after this long never finished. */
export const HUNG_AFTER_MS = 20 * 60 * 1000;

/** Error codes fix.js may report. Anything else is ignored (no free text, no PII). */
export const SNIPPET_ERROR_CODES = new Set(['config_http', 'config_network', 'config_parse', 'bad_selector', 'apply_error', 'toolbar_error']);

let schemaReady = null;

/** Apply the additive tracking schema once per instance. Resolves true when ready. */
export function ensureTrackingSchema() {
  if (!config().databaseUrl) return Promise.resolve(false);
  if (!schemaReady) {
    schemaReady = query(TRACKING_SCHEMA_SQL)
      .then(() => {
        console.log('tracking schema ready');
        return true;
      })
      .catch((err) => {
        console.error('tracking schema failed', err?.code || err?.message);
        schemaReady = null; // try again on a later call
        return false;
      });
  }
  return schemaReady;
}

/** Run a tracking write; on a missing table/column apply the schema and retry once. Never throws. */
async function track(label, fn) {
  if (!config().databaseUrl) return null;
  try {
    return await fn();
  } catch (err) {
    if (MISSING.has(err?.code) && (await ensureTrackingSchema())) {
      try {
        return await fn();
      } catch (err2) {
        err = err2;
      }
    }
    console.error(`tracking ${label} failed`, err?.code || err?.message);
    return null;
  }
}

const short = (v, n = 300) => (v == null ? null : String(v).slice(0, n));

export function startScanRun({ accountId, domainId = null, pageId = null, kind = 'page', trigger = 'manual', pages = 1 }) {
  return track('scan run start', async () => {
    const row = await one(
      `insert into app.scan_runs (account_id, domain_id, page_id, kind, trigger, pages) values ($1, $2, $3, $4, $5, $6) returning id`,
      [accountId, domainId, pageId, kind, String(trigger).slice(0, 20), Math.max(0, Math.floor(Number(pages) || 0))],
    );
    return row?.id || null;
  });
}

export function finishScanRun(runId, { status = 'done', durationMs } = {}) {
  if (!runId) return Promise.resolve(null);
  return track('scan run finish', () =>
    query(`update app.scan_runs set status = $2, finished_at = now(), duration_ms = $3 where id = $1`, [
      runId,
      status === 'failed' ? 'failed' : 'done',
      Number.isFinite(durationMs) ? Math.round(durationMs) : null,
    ]),
  );
}

export function recordScanDuration(scanId, durationMs) {
  if (!scanId || !Number.isFinite(durationMs)) return Promise.resolve(null);
  return track('scan duration', () => query('update app.scans set duration_ms = $2 where id = $1', [scanId, Math.round(durationMs)]));
}

export function recordAlertEmail({ accountId, pageUrl, recipients, status, resendId, error }) {
  if (!accountId) return Promise.resolve(null);
  return track('alert email', () =>
    query(
      `insert into app.alert_emails (account_id, page_url, recipients, status, resend_id, error) values ($1, $2, $3, $4, $5, $6)`,
      [accountId, short(pageUrl, 2048), recipients ?? null, status, short(resendId, 100), short(error)],
    ),
  );
}

/** Record the welcome email for an account (key = account id). Ignores non-account keys. */
export function recordWelcomeEmail(accountId, res) {
  if (!UUID.test(String(accountId || ''))) return Promise.resolve(null);
  const ok = Boolean(res?.ok);
  return track('welcome email', () =>
    query(
      `insert into app.welcome_emails (account_id, status, resend_id, error, sent_at, updated_at)
       values ($1, $2, $3, $4, case when $2 = 'sent' then now() end, now())
       on conflict (account_id) do update set
         status = case when app.welcome_emails.status = 'sent' then 'sent' else excluded.status end,
         resend_id = coalesce(excluded.resend_id, app.welcome_emails.resend_id),
         error = case when app.welcome_emails.status = 'sent' or excluded.status = 'sent' then null else excluded.error end,
         sent_at = coalesce(app.welcome_emails.sent_at, excluded.sent_at),
         updated_at = now()`,
      [accountId, ok ? 'sent' : 'failed', short(res?.id, 100), ok ? null : short(res?.reason || 'unknown')],
    ),
  );
}

/** Count one snippet error for a site key. Unknown keys and codes are ignored. Never throws. */
export function recordSnippetError(key, code) {
  if (!/^[A-Za-z0-9_-]{16,40}$/.test(String(key || '')) || !SNIPPET_ERROR_CODES.has(code)) return Promise.resolve(null);
  return track('snippet error', () =>
    query(
      `insert into app.snippet_errors (domain_id, code)
       select id, $2 from app.domains where site_key = $1
       on conflict (domain_id, day, code) do update set count = least(app.snippet_errors.count + 1, 1000000), last_at = now()`,
      [key, code],
    ),
  );
}
