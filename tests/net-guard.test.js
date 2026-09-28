import { test } from 'node:test';
import assert from 'node:assert/strict';
import { isPublicAddress, assertSafeUrl, safeLookup } from '../server/net-guard.js';

test('blocks private, loopback, link-local and reserved IPv4', () => {
  for (const ip of ['127.0.0.1', '10.1.2.3', '172.16.0.1', '172.31.255.255', '192.168.1.1', '169.254.169.254', '100.64.0.1', '0.0.0.0', '224.0.0.1', '255.255.255.255', '198.18.0.1']) {
    assert.equal(isPublicAddress(ip), false, ip);
  }
});

test('blocks private and special IPv6, including IPv4-mapped forms', () => {
  for (const ip of ['::1', '::', 'fe80::1', 'fc00::1', 'fd12:3456::1', 'ff02::1', '::ffff:127.0.0.1', '::ffff:7f00:1', '::ffff:a9fe:a9fe', '64:ff9b::a00:1', '2002:c0a8:101::1', '2001:db8::1']) {
    assert.equal(isPublicAddress(ip), false, ip);
  }
});

test('allows public addresses', () => {
  for (const ip of ['93.184.215.14', '8.8.8.8', '1.1.1.1', '2606:4700:4700::1111', '::ffff:8.8.8.8']) {
    assert.equal(isPublicAddress(ip), true, ip);
  }
});

test('rejects non-http schemes, credentials, odd ports and internal hosts', () => {
  const bad = [
    'file:///etc/passwd',
    'ftp://example.com',
    'gopher://example.com',
    'http://user:pass@example.com',
    'http://example.com:8080',
    'http://localhost',
    'http://foo.localhost',
    'http://printer.local',
    'http://metadata.google.internal',
    'http://127.0.0.1',
    'http://[::1]',
    'http://2130706433', // 127.0.0.1 as an integer
    'http://0x7f.0.0.1',
    'http://intranet',
  ];
  for (const u of bad) assert.throws(() => assertSafeUrl(u), undefined, u);
});

test('accepts ordinary public URLs', () => {
  assert.equal(assertSafeUrl('https://example.com/path?q=1').hostname, 'example.com');
  assert.equal(assertSafeUrl('http://example.com:80/').hostname, 'example.com');
});

test('safeLookup refuses hostnames that resolve to private addresses', async () => {
  await new Promise((done) => {
    safeLookup('localhost', {}, (err) => {
      assert.ok(err, 'expected an error');
      done();
    });
  });
});
