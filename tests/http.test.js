import { test } from 'node:test';
import assert from 'node:assert/strict';
import { checkOrigin, readJson } from '../server/http.js';

const req = (headers, body) => new Request('https://accessbell.co/api/scan', { method: 'POST', headers, body });
const prod = { NODE_ENV: 'production', VERCEL: '1' };

test('origin check allows the site and rejects others', () => {
  assert.equal(checkOrigin(req({ origin: 'https://accessbell.co' }), prod), true);
  assert.equal(checkOrigin(req({ origin: 'https://evil.example' }), prod), false);
  assert.equal(checkOrigin(req({}), prod), false);
  assert.equal(checkOrigin(req({ origin: 'https://accessbell.co', 'sec-fetch-site': 'cross-site' }), prod), false);
  assert.equal(checkOrigin(req({ origin: 'http://localhost:4321' }), prod), false);
  assert.equal(checkOrigin(req({ origin: 'https://project-voiul.vercel.app' }), { ...prod, VERCEL_PROJECT_PRODUCTION_URL: 'project-voiul.vercel.app' }), true);
});

test('readJson enforces content type and size', async () => {
  assert.deepEqual(await readJson(req({ 'content-type': 'application/json' }, '{"a":1}'), 100), { a: 1 });
  assert.equal(await readJson(req({ 'content-type': 'text/plain' }, '{"a":1}'), 100), null);
  assert.equal(await readJson(req({ 'content-type': 'application/json' }, JSON.stringify({ a: 'x'.repeat(500) })), 100), null);
  assert.equal(await readJson(req({ 'content-type': 'application/json' }, '[1,2]'), 100), null);
  assert.equal(await readJson(req({ 'content-type': 'application/json' }, '{bad'), 100), null);
});
