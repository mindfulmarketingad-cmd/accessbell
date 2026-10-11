// The checker and the dashboard must accept every domain extension, not just
// .com: country codes (.co.uk, .com.au), new generic ones (.site, .store) and
// internationalised domains. No code should assume a fixed list of extensions.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { normalizeSiteUrl, normalizePageUrl } from '../server/app/domains.js';
import { assertSafeUrl } from '../server/net-guard.js';

const HOSTS = [
  'example.com', 'example.co.uk', 'example.org.uk', 'example.ac.uk', 'example.gov.uk', 'example.site', 'example.net',
  'example.co', 'example.org', 'example.io', 'example.ai', 'example.app', 'example.dev', 'example.store', 'example.shop',
  'example.online', 'example.photography', 'example.com.au', 'example.co.nz', 'example.co.za', 'example.com.br',
  'example.de', 'example.fr', 'example.ca', 'example.us', 'example.info', 'example.biz', 'example.me', 'example.tv',
  'example.xyz', 'example.agency', 'example.law', 'example.health', 'shop.example.co.uk',
];

test('every domain extension is accepted when adding a domain and its pages', () => {
  for (const host of HOSTS) {
    for (const input of [host, `www.${host}`, `https://${host}/about`, host.toUpperCase(), `${host}.`]) {
      const site = normalizeSiteUrl(input);
      assert.equal(site.hostname, host, `${input} -> ${site.hostname}`);
      assert.equal(site.baseUrl.startsWith(`https://`), true);
      const page = normalizePageUrl(`https://${host}/contact`, { hostname: host, base_url: site.baseUrl, settings: {} });
      assert.ok(page, `page on ${host}`);
    }
    assert.doesNotThrow(() => assertSafeUrl(`https://${host}/`), host);
  }
});

test('internationalised domains are accepted', () => {
  assert.equal(normalizeSiteUrl('münchen.de').hostname, 'xn--mnchen-3ya.de');
  assert.equal(normalizeSiteUrl('пример.рф').hostname, 'xn--e1afmkfd.xn--p1ai');
});

test('a trailing dot is the same domain', () => {
  assert.equal(normalizeSiteUrl('example.co.uk.').baseUrl, normalizeSiteUrl('example.co.uk').baseUrl);
});
