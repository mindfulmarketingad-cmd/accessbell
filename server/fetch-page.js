// Fetch a single public HTML page with strict limits.
import http from 'node:http';
import https from 'node:https';
import zlib from 'node:zlib';
import { assertSafeUrl, safeLookup, UnsafeUrlError } from './net-guard.js';

export const LIMITS = {
  maxRedirects: 5,
  maxBytes: 3 * 1024 * 1024, // decompressed HTML
  timeoutMs: 12_000, // whole request, including redirects
};

const USER_AGENT = 'Mozilla/5.0 (compatible; AccessBellBot/1.0; +https://accessbell.co/about)';

export class FetchError extends Error {
  constructor(message, status = 502) {
    super(message);
    this.name = 'FetchError';
    this.status = status;
    this.expose = true;
  }
}

function requestOnce(url, deadline) {
  return new Promise((resolve, reject) => {
    const remaining = deadline - Date.now();
    if (remaining <= 0) return reject(new FetchError('The page took too long to respond.', 504));

    const lib = url.protocol === 'https:' ? https : http;
    const req = lib.request(
      url,
      {
        method: 'GET',
        lookup: safeLookup,
        agent: false, // no connection reuse across requests
        timeout: remaining,
        headers: {
          'User-Agent': USER_AGENT,
          Accept: 'text/html,application/xhtml+xml;q=0.9,*/*;q=0.1',
          'Accept-Encoding': 'gzip, deflate, br',
          'Accept-Language': 'en-US,en;q=0.8',
        },
      },
      (res) => resolve({ res, req }),
    );
    const timer = setTimeout(() => req.destroy(new FetchError('The page took too long to respond.', 504)), remaining);
    req.on('close', () => clearTimeout(timer));
    req.on('timeout', () => req.destroy(new FetchError('The page took too long to respond.', 504)));
    req.on('error', (err) => {
      if (err instanceof UnsafeUrlError || err instanceof FetchError) return reject(err);
      if (err.code === 'ENOTFOUND' || err.code === 'EAI_AGAIN') return reject(new FetchError('We could not find that domain. Check the address and try again.', 422));
      if (err.code === 'ECONNREFUSED') return reject(new FetchError('The server refused the connection.', 502));
      if ((err.code && String(err.code).startsWith('ERR_TLS')) || /certificate/i.test(err.message)) {
        return reject(new FetchError('The site has an invalid or expired TLS certificate.', 502));
      }
      reject(new FetchError('We could not connect to that website.', 502));
    });
    req.end();
  });
}

function readBody(res, deadline) {
  return new Promise((resolve, reject) => {
    const encoding = String(res.headers['content-encoding'] || '').trim().toLowerCase();
    let stream = res;
    if (encoding === 'gzip' || encoding === 'x-gzip') stream = res.pipe(zlib.createGunzip());
    else if (encoding === 'deflate') stream = res.pipe(zlib.createInflate());
    else if (encoding === 'br') stream = res.pipe(zlib.createBrotliDecompress());
    else if (encoding && encoding !== 'identity') return reject(new FetchError('The page uses an unsupported content encoding.', 422));

    const chunks = [];
    let size = 0;
    const fail = (err) => {
      res.destroy();
      if (stream !== res) stream.destroy();
      reject(err);
    };
    const timer = setTimeout(() => fail(new FetchError('The page took too long to respond.', 504)), Math.max(0, deadline - Date.now()));
    stream.on('data', (chunk) => {
      size += chunk.length;
      // Counted after decompression, so compression bombs are cut off too.
      if (size > LIMITS.maxBytes) return fail(new FetchError('The page is too large to check (limit 3 MB of HTML).', 413));
      chunks.push(chunk);
    });
    stream.on('end', () => {
      clearTimeout(timer);
      resolve(Buffer.concat(chunks));
    });
    stream.on('error', () => {
      clearTimeout(timer);
      fail(new FetchError('The page could not be read.', 502));
    });
  });
}

function decode(buffer, contentType) {
  const m = /charset=["']?([\w-]+)/i.exec(contentType || '');
  let charset = m ? m[1].toLowerCase() : 'utf-8';
  if (!m) {
    const head = buffer.subarray(0, 2048).toString('latin1');
    const meta = /<meta[^>]+charset=["']?([\w-]+)/i.exec(head);
    if (meta) charset = meta[1].toLowerCase();
  }
  try {
    return new TextDecoder(charset).decode(buffer);
  } catch {
    return new TextDecoder('utf-8').decode(buffer);
  }
}

/**
 * Fetch an HTML page. Redirects are followed manually and every hop is
 * re-validated, so a public URL cannot redirect into a private network.
 */
export async function fetchPage(input) {
  const deadline = Date.now() + LIMITS.timeoutMs;
  let url = assertSafeUrl(input);

  for (let hop = 0; hop <= LIMITS.maxRedirects; hop++) {
    const { res } = await requestOnce(url, deadline);
    const status = res.statusCode || 0;

    if (status >= 300 && status < 400 && res.headers.location) {
      res.destroy();
      if (hop === LIMITS.maxRedirects) throw new FetchError('The page redirected too many times.', 422);
      let next;
      try {
        next = new URL(res.headers.location, url);
      } catch {
        throw new FetchError('The page redirected to an invalid address.', 422);
      }
      url = assertSafeUrl(next.toString());
      continue;
    }

    if (status >= 400) {
      res.destroy();
      throw new FetchError(`The website responded with HTTP ${status}. Make sure the page is public.`, 422);
    }

    const type = String(res.headers['content-type'] || '').toLowerCase();
    if (type && !type.includes('text/html') && !type.includes('application/xhtml+xml')) {
      res.destroy();
      throw new FetchError('That address is not an HTML page. Enter the URL of a web page.', 422);
    }

    const declared = Number(res.headers['content-length']);
    if (Number.isFinite(declared) && declared > LIMITS.maxBytes) {
      res.destroy();
      throw new FetchError('The page is too large to check (limit 3 MB of HTML).', 413);
    }

    const body = await readBody(res, deadline);
    return { finalUrl: url.toString(), status, html: decode(body, type) };
  }
  throw new FetchError('The page redirected too many times.', 422);
}
