// Postgres access through Supabase's connection pooler (DATABASE_URL).
import pg from 'pg';
import { config } from './config.js';

let pool;

function sslOption(url) {
  if (/sslmode=disable/.test(url) || /@(localhost|127\.0\.0\.1)[:/]/.test(url)) return false;
  // Supabase's pooler presents a certificate from Supabase's own CA. Supply it
  // as DATABASE_CA_CERT to verify it; otherwise the connection is encrypted
  // without certificate verification.
  if (process.env.DATABASE_CA_CERT) return { ca: process.env.DATABASE_CA_CERT };
  return { rejectUnauthorized: false };
}

export function getPool() {
  if (!pool) {
    const url = config().databaseUrl;
    if (!url) throw new Error('DATABASE_URL is not set');
    pool = new pg.Pool({
      connectionString: url.replace(/[?&]sslmode=[^&]*/, ''),
      ssl: sslOption(url),
      max: 3,
      idleTimeoutMillis: 10_000,
      connectionTimeoutMillis: 8_000,
    });
  }
  return pool;
}

export async function query(text, params = []) {
  const res = await getPool().query(text, params);
  return res.rows;
}

export async function one(text, params = []) {
  const rows = await query(text, params);
  return rows[0] || null;
}

export async function tx(fn) {
  const client = await getPool().connect();
  try {
    await client.query('begin');
    const q = async (text, params = []) => (await client.query(text, params)).rows;
    const result = await fn(q);
    await client.query('commit');
    return result;
  } catch (err) {
    await client.query('rollback').catch(() => {});
    throw err;
  } finally {
    client.release();
  }
}

/** For tests: close and forget the pool. */
export async function resetPool() {
  if (pool) await pool.end().catch(() => {});
  pool = undefined;
}
