// One regression alert email per account and site per monitoring run.
//
// Monitoring rescans every page as its own background job. Each job used to
// email the account owner when it found new serious issues, so a site with
// several monitored pages got several emails seconds apart. Now every job adds
// its findings to one open digest per (account, site); a sweeper sends each
// digest once, after the site has been quiet for QUIET_MINUTES.
import { query } from './db.js';

export const QUIET_MINUTES = 10;
export const MAX_OPEN_HOURS = 3;

// Same SQL as supabase/migrations/0017_alert_digests.sql (a test keeps them in sync).
export const ALERT_DIGEST_SCHEMA_SQL = `
select pg_advisory_xact_lock(815017);

create table if not exists app.alert_digests (
  id          uuid primary key default gen_random_uuid(),
  account_id  uuid not null references app.accounts (id) on delete cascade,
  hostname    text not null check (char_length(hostname) <= 253),
  regressions jsonb not null default '[]'::jsonb,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  sent_at     timestamptz
);
create unique index if not exists alert_digests_one_open_idx on app.alert_digests (account_id, hostname) where sent_at is null;
alter table app.alert_digests enable row level security;
`;

let schemaReady = null;
function ensureSchema(q) {
  if (!schemaReady) {
    schemaReady = q(ALERT_DIGEST_SCHEMA_SQL).catch((err) => {
      schemaReady = null;
      throw err;
    });
  }
  return schemaReady;
}

/** Run a write; if the table is missing, apply the additive schema once and retry. */
async function withSchema(q, fn) {
  try {
    return await fn();
  } catch (err) {
    if (err?.code !== '42P01') throw err;
    await ensureSchema(q);
    return fn();
  }
}

/**
 * Add one page's new regressions to the open digest for its account and site.
 * Creates the digest if none is open. Concurrent jobs are safe: the partial
 * unique index guarantees a single open digest per account and site.
 */
export async function addToDigest(result, { q = query } = {}) {
  const regressions = (result.regressions || []).map((r) => ({ ...r, url: result.url }));
  if (!regressions.length || !result.accountId || !result.hostname) return null;
  const rows = await withSchema(q, () =>
    q(
      `insert into app.alert_digests (account_id, hostname, regressions)
       values ($1, $2, $3::jsonb)
       on conflict (account_id, hostname) where sent_at is null
       do update set regressions = app.alert_digests.regressions || excluded.regressions, updated_at = now()
       returning id`,
      [result.accountId, result.hostname, JSON.stringify(regressions)],
    ),
  );
  return rows[0]?.id || null;
}

/**
 * Atomically close and return every open digest that is ready to send:
 * quiet for QUIET_MINUTES, or open for more than MAX_OPEN_HOURS. A digest is
 * returned to exactly one caller, even if sweeps overlap.
 */
export async function claimReadyDigests({ q = query } = {}) {
  return withSchema(q, () =>
    q(
      `update app.alert_digests set sent_at = now()
        where sent_at is null
          and (updated_at < now() - make_interval(mins => $1)
               or created_at < now() - make_interval(hours => $2))
        returning id, account_id, hostname, regressions`,
      [QUIET_MINUTES, MAX_OPEN_HOURS],
    ),
  );
}

/** Reopen a claimed digest whose email failed, so the next sweep retries it. */
export async function reopenDigest(id, { q = query } = {}) {
  await q('update app.alert_digests set sent_at = null where id = $1', [id]);
}
