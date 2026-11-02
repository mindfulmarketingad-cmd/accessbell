// Shopify access and refresh tokens are encrypted at rest (AES-256-GCM).
// The key is derived from the app secret: rotating the secret invalidates
// every Shopify token anyway, so nothing is lost by tying the two together.
import crypto from 'node:crypto';

const keyFor = (secret) => crypto.createHash('sha256').update(`accessbell-shopify-tokens:${secret}`).digest();

export function seal(plain, secret) {
  if (plain == null) return null;
  if (!secret) throw new Error('SHOPIFY_API_SECRET is not set');
  const iv = crypto.randomBytes(12);
  const c = crypto.createCipheriv('aes-256-gcm', keyFor(secret), iv);
  const data = Buffer.concat([c.update(String(plain), 'utf8'), c.final()]);
  return `v1.${iv.toString('base64url')}.${c.getAuthTag().toString('base64url')}.${data.toString('base64url')}`;
}

export function open(sealed, secret) {
  if (!sealed) return null;
  const [v, iv, tag, data] = String(sealed).split('.');
  if (v !== 'v1' || !iv || !tag || data == null) return null;
  try {
    const d = crypto.createDecipheriv('aes-256-gcm', keyFor(secret), Buffer.from(iv, 'base64url'));
    d.setAuthTag(Buffer.from(tag, 'base64url'));
    return Buffer.concat([d.update(Buffer.from(data, 'base64url')), d.final()]).toString('utf8');
  } catch {
    return null;
  }
}
