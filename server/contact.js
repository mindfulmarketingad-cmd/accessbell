// Validation and delivery for the contact form.
export const TOPICS = ['general', 'sales', 'support', 'billing', 'accessibility', 'press'];
export const PLAN_IDS = ['', 'lite'];

const EMAIL = /^[^\s@<>()[\]\\,;:"]{1,64}@[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?(?:\.[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?)+$/i;
// Control characters other than tab and newline
const CONTROL = /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g;

const clean = (v, max) => (typeof v === 'string' ? v.replace(CONTROL, '').trim().slice(0, max) : '');
const oneLine = (v, max) => clean(v, max).replace(/[\r\n]+/g, ' ');

/**
 * Returns { ok: true, data } or { ok: false, error, spam? }.
 * Spam submissions report ok to the client so bots learn nothing.
 */
export function validateContact(input) {
  if (!input || typeof input !== 'object') return { ok: false, error: 'Invalid request.' };

  // Honeypot and minimum fill time
  if (clean(input.website, 200)) return { ok: false, spam: true };
  if (typeof input.elapsedMs === 'number' && input.elapsedMs < 2500) return { ok: false, spam: true };

  const data = {
    name: oneLine(input.name, 100),
    email: oneLine(input.email, 254).toLowerCase(),
    company: oneLine(input.company, 120),
    site: oneLine(input.site, 2048),
    topic: oneLine(input.topic, 30),
    plan: oneLine(input.plan, 30),
    domains: oneLine(input.domains, 6),
    message: clean(input.message, 5000),
  };

  if (!data.name) return { ok: false, error: 'Please enter your name.' };
  if (!EMAIL.test(data.email)) return { ok: false, error: 'Please enter a valid email address.' };
  if (!TOPICS.includes(data.topic)) return { ok: false, error: 'Please choose a topic.' };
  if (!PLAN_IDS.includes(data.plan)) return { ok: false, error: 'Please choose a valid plan.' };
  if (data.domains && !/^[1-9]\d{0,3}$/.test(data.domains)) return { ok: false, error: 'Please enter a valid number of domains.' };
  if (data.message.length < 10) return { ok: false, error: 'Please enter a message of at least 10 characters.' };
  if (input.consent !== true) return { ok: false, error: 'Please confirm you agree to the Privacy Policy.' };
  if ((data.message.match(/https?:\/\//gi) || []).length > 5) return { ok: false, spam: true };

  return { ok: true, data };
}

/** Plain-text email body. Never HTML, so user input cannot inject markup. */
export function formatEmail(d, meta) {
  return [
    `Topic: ${d.topic}`,
    `Plan: ${d.plan || 'not specified'}`,
    `Domains: ${d.domains || '-'}`,
    `Name: ${d.name}`,
    `Email: ${d.email}`,
    `Company: ${d.company || '-'}`,
    `Website: ${d.site || '-'}`,
    `Submitted: ${meta.at}`,
    '',
    d.message,
  ].join('\n');
}

export async function sendViaResend(d, env = process.env, fetchImpl = fetch) {
  const key = env.RESEND_API_KEY;
  const to = env.CONTACT_TO_EMAIL;
  const from = env.CONTACT_FROM_EMAIL || 'AccessBell <forms@accessbell.co>';
  if (!key || !to) return { ok: false, reason: 'not-configured' };

  const res = await fetchImpl('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from,
      to: [to],
      reply_to: d.email,
      subject: `[AccessBell] ${d.topic} - ${d.name}`.slice(0, 150),
      text: formatEmail(d, { at: new Date().toISOString() }),
    }),
    signal: AbortSignal.timeout(8000),
  });
  return { ok: res.ok, reason: res.ok ? undefined : `resend-${res.status}` };
}
