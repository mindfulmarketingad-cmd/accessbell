// GET/POST /api/unsubscribe?t=<signed token> -> one-click funnel unsubscribe.
//
// The token is an HMAC of the address (server/app/unsubscribe.js), so only
// someone holding the emailed link can unsubscribe that address. GET (a click
// on the link in the email) and POST (RFC 8058 one-click from the mail
// client's own Unsubscribe button, body "List-Unsubscribe=One-Click") both
// record the address in app.funnel_suppressions and confirm. Repeat calls are
// harmless. No Origin check: mail providers call this from their servers.
import { verifyUnsubscribeToken } from '../server/app/unsubscribe.js';
import { recordFunnelSuppression } from '../server/app/funnel.js';

const HEADERS = {
  'Content-Type': 'text/html; charset=utf-8',
  'Cache-Control': 'no-store',
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'no-referrer',
  'X-Robots-Tag': 'noindex',
  'Content-Security-Policy': "default-src 'none'; style-src 'unsafe-inline'; frame-ancestors 'none'",
};

function page(status, title, message) {
  const html = `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex"><title>${title} | AccessBell</title>
<style>body{font:16px/1.5 system-ui,sans-serif;max-width:36rem;margin:4rem auto;padding:0 1rem;color:#1a1a1a}a{color:#0b57d0}</style></head>
<body><main><h1>${title}</h1><p>${message}</p><p><a href="https://www.accessbell.co/">Back to AccessBell</a></p></main></body></html>`;
  return new Response(html, { status, headers: HEADERS });
}

export async function handleUnsubscribe(request, { suppress = recordFunnelSuppression } = {}) {
  const token = new URL(request.url).searchParams.get('t') || '';
  const email = verifyUnsubscribeToken(token);
  if (!email) {
    return page(400, 'Link not recognised', 'This unsubscribe link is invalid or incomplete. Reply to any AccessBell email with "opt out" and we will stop following up.');
  }
  try {
    await suppress(email, request.method === 'POST' ? 'unsubscribe-one-click' : 'unsubscribe-link');
  } catch (err) {
    console.error('unsubscribe failed', err?.code || err?.name);
    return page(503, 'Please try again', 'We could not record your request just now. Please try the link again in a minute, or reply to the email with "opt out".');
  }
  return page(200, 'You are unsubscribed', 'You will not get any more follow-up emails from AccessBell at this address. Emails you need for something you bought (like a report link or receipt) may still be sent.');
}

export const GET = (request) => handleUnsubscribe(request);
export const POST = (request) => handleUnsubscribe(request);
