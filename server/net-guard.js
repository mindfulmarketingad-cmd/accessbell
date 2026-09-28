// SSRF protection for the page fetcher.
//
// Every address a hostname resolves to is checked against private, loopback,
// link-local, multicast and other reserved ranges. The check runs inside the
// socket's DNS lookup, so the address that is validated is the address that is
// connected to (no DNS-rebinding window between check and connect).
import dns from 'node:dns';
import net from 'node:net';

const blocked = new net.BlockList();

// IPv4 special-purpose ranges (IANA registry, RFC 6890 and successors)
for (const [addr, prefix] of [
  ['0.0.0.0', 8], // "this" network
  ['10.0.0.0', 8], // private
  ['100.64.0.0', 10], // carrier-grade NAT
  ['127.0.0.0', 8], // loopback
  ['169.254.0.0', 16], // link-local, cloud metadata endpoints
  ['172.16.0.0', 12], // private
  ['192.0.0.0', 24], // IETF protocol assignments
  ['192.0.2.0', 24], // TEST-NET-1
  ['192.31.196.0', 24], // AS112
  ['192.52.193.0', 24], // AMT
  ['192.88.99.0', 24], // 6to4 relay anycast
  ['192.168.0.0', 16], // private
  ['192.175.48.0', 24], // AS112
  ['198.18.0.0', 15], // benchmarking
  ['198.51.100.0', 24], // TEST-NET-2
  ['203.0.113.0', 24], // TEST-NET-3
  ['224.0.0.0', 4], // multicast
  ['240.0.0.0', 4], // reserved, includes broadcast
]) {
  blocked.addSubnet(addr, prefix, 'ipv4');
}

// IPv6 special-purpose ranges
for (const [addr, prefix] of [
  ['::', 128], // unspecified
  ['::1', 128], // loopback
  ['::', 96], // IPv4-compatible (deprecated)
  ['64:ff9b::', 96], // NAT64 well-known prefix
  ['64:ff9b:1::', 48], // local-use NAT64
  ['100::', 64], // discard-only
  ['2001::', 23], // IETF protocol assignments (Teredo, ORCHID, etc.)
  ['2001:db8::', 32], // documentation
  ['2002::', 16], // 6to4 (can embed private IPv4)
  ['3fff::', 20], // documentation
  ['5f00::', 16], // SRv6 SIDs
  ['fc00::', 7], // unique local
  ['fe80::', 10], // link-local
  ['fec0::', 10], // site-local (deprecated)
  ['ff00::', 8], // multicast
]) {
  blocked.addSubnet(addr, prefix, 'ipv6');
}

const MAPPED_V4 = /^::ffff:(\d{1,3}(?:\.\d{1,3}){3})$/i;
const MAPPED_V4_HEX = /^::ffff:([0-9a-f]{1,4}):([0-9a-f]{1,4})$/i;

/** True when the IP literal is safe to connect to (a public unicast address). */
export function isPublicAddress(ip) {
  if (typeof ip !== 'string') return false;
  const family = net.isIP(ip);
  if (family === 4) return !blocked.check(ip, 'ipv4');
  if (family !== 6) return false;

  const lower = ip.toLowerCase().split('%')[0];
  // IPv4-mapped IPv6 (::ffff:a.b.c.d or ::ffff:xxxx:xxxx) -> validate the embedded IPv4
  const dotted = MAPPED_V4.exec(lower);
  if (dotted) return isPublicAddress(dotted[1]);
  const hex = MAPPED_V4_HEX.exec(lower);
  if (hex) {
    const hi = parseInt(hex[1], 16);
    const lo = parseInt(hex[2], 16);
    return isPublicAddress(`${hi >> 8}.${hi & 255}.${lo >> 8}.${lo & 255}`);
  }
  return !blocked.check(lower, 'ipv6');
}

const BLOCKED_HOST_SUFFIXES = ['.localhost', '.local', '.internal', '.localdomain', '.home.arpa', '.intranet', '.lan', '.corp'];

/**
 * Validate a user-supplied URL before any network activity.
 * Returns a URL object or throws an Error with a user-safe message.
 */
export function assertSafeUrl(input) {
  let url;
  try {
    url = new URL(input);
  } catch {
    throw new UnsafeUrlError('Enter a valid web address, such as https://example.com.');
  }
  if (url.protocol !== 'http:' && url.protocol !== 'https:') {
    throw new UnsafeUrlError('Only http and https addresses can be checked.');
  }
  if (url.username || url.password) {
    throw new UnsafeUrlError('Addresses containing a username or password are not allowed.');
  }
  if (url.port && url.port !== '80' && url.port !== '443') {
    throw new UnsafeUrlError('Only standard web ports (80 and 443) can be checked.');
  }
  // URL() lowercases and punycode-encodes the hostname; strip IPv6 brackets and trailing dot.
  const host = url.hostname.replace(/^\[|\]$/g, '').replace(/\.$/, '');
  if (!host || host === 'localhost' || BLOCKED_HOST_SUFFIXES.some((s) => host.endsWith(s))) {
    throw new UnsafeUrlError('That address points to a private network and cannot be checked.');
  }
  if (net.isIP(host)) {
    if (!isPublicAddress(host)) throw new UnsafeUrlError('That address points to a private network and cannot be checked.');
  } else if (!host.includes('.')) {
    throw new UnsafeUrlError('Enter a full domain name, such as example.com.');
  }
  return url;
}

export class UnsafeUrlError extends Error {
  constructor(message) {
    super(message);
    this.name = 'UnsafeUrlError';
    this.expose = true;
  }
}

/**
 * Drop-in replacement for dns.lookup used by http(s).request.
 * Rejects the connection if ANY resolved address is non-public, so a
 * hostname cannot mix a public and a private record to slip through.
 */
export function safeLookup(hostname, options, callback) {
  if (typeof options === 'function') {
    callback = options;
    options = {};
  }
  const opts = typeof options === 'number' ? { family: options } : { ...options };
  dns.lookup(hostname, { ...opts, all: true, verbatim: true }, (err, addresses) => {
    if (err) return callback(err);
    if (!addresses.length) return callback(Object.assign(new Error('No addresses found'), { code: 'ENOTFOUND' }));
    const bad = addresses.find((a) => !isPublicAddress(a.address));
    if (bad) {
      return callback(new UnsafeUrlError('That address points to a private network and cannot be checked.'));
    }
    if (opts.all) return callback(null, addresses);
    callback(null, addresses[0].address, addresses[0].family);
  });
}
