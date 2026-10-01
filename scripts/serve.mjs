// Local production preview that mirrors vercel.json: cleanUrls, redirects,
// headers and the /api functions. Usage: npm run build && node scripts/serve.mjs
import http from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { extname, join, resolve, normalize } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const dist = join(root, 'dist');
const config = JSON.parse(await readFile(join(root, 'vercel.json'), 'utf8'));
const port = Number(process.env.PORT || 4321);

const TYPES = {
  '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json', '.webmanifest': 'application/manifest+json', '.svg': 'image/svg+xml', '.png': 'image/png',
  '.ico': 'image/x-icon', '.mp4': 'video/mp4', '.webm': 'video/webm', '.jpg': 'image/jpeg', '.webp': 'image/webp', '.woff2': 'font/woff2', '.xml': 'application/xml; charset=utf-8', '.txt': 'text/plain; charset=utf-8',
};

const toRegex = (source) =>
  new RegExp('^' + source.replace(/\/:(\w+)\*/g, '(?:/(?<$1>.*))?').replace(/:(\w+)/g, '(?<$1>[^/]+)') + '$');

function headersFor(path) {
  const out = {};
  for (const rule of config.headers) if (toRegex(rule.source).test(path)) for (const h of rule.headers) out[h.key] = h.value;
  delete out['Strict-Transport-Security']; // not meaningful on localhost
  out['Content-Security-Policy'] = (out['Content-Security-Policy'] || '').replace('; upgrade-insecure-requests', '');
  return out;
}

const handlers = {
  '/api/scan': await import(join(root, 'api/scan.js')),
  '/api/contact': await import(join(root, 'api/contact.js')),
  '/api/app': await import(join(root, 'api/app.js')),
  '/api/stripe-webhook': await import(join(root, 'api/stripe-webhook.js')),
  '/api/inngest': await import(join(root, 'api/inngest.js')).catch(() => ({})),
};

async function tryFile(p) {
  try {
    const s = await stat(p);
    return s.isFile() ? p : null;
  } catch {
    return null;
  }
}

http
  .createServer(async (req, res) => {
    const url = new URL(req.url, `http://localhost:${port}`);
    const path = decodeURIComponent(url.pathname);

    for (const r of config.redirects) {
      if (r.has) continue;
      const m = toRegex(r.source).exec(path);
      if (m) {
        const dest = r.destination.replace(/:(\w+)\*?/g, (_, k) => m.groups?.[k] ?? '');
        res.writeHead(r.permanent ? 308 : 307, { Location: dest });
        return res.end();
      }
    }

    // vercel.json rewrites (for example /api/app/domains -> /api/app?route=domains)
    for (const r of config.rewrites || []) {
      const m = toRegex(r.source).exec(path);
      if (m) {
        const dest = new URL(r.destination.replace(/:(\w+)\*?/g, (_, k) => encodeURIComponent(m.groups?.[k] ?? '')), url);
        for (const [k, v] of dest.searchParams) url.searchParams.set(k, decodeURIComponent(v));
        url.pathname = dest.pathname;
        break;
      }
    }
    const fnPath = url.pathname;

    if (handlers[fnPath]) {
      const chunks = [];
      for await (const c of req) chunks.push(c);
      const headers = new Headers();
      for (const [k, v] of Object.entries(req.headers)) if (typeof v === 'string') headers.set(k, v);
      headers.set('x-real-ip', req.socket.remoteAddress || 'local');
      const request = new Request(url, { method: req.method, headers, body: ['GET', 'HEAD'].includes(req.method) ? undefined : Buffer.concat(chunks) });
      const fn = handlers[fnPath][req.method];
      const response = fn ? await fn(request) : new Response('Method not allowed', { status: 405 });
      const outHeaders = { ...headersFor(path), ...Object.fromEntries(response.headers) };
      const setCookie = response.headers.getSetCookie?.() || [];
      if (setCookie.length) outHeaders['Set-Cookie'] = setCookie;
      res.writeHead(response.status, outHeaders);
      return res.end(Buffer.from(await response.arrayBuffer()));
    }

    if (path !== '/' && path.endsWith('/')) {
      res.writeHead(308, { Location: path.replace(/\/+$/, '') + url.search });
      return res.end();
    }
    if (path.endsWith('.html')) {
      res.writeHead(308, { Location: path.replace(/(\/index)?\.html$/, '') || '/' });
      return res.end();
    }

    const safe = normalize(path).replace(/^(\.\.[/\\])+/, '');
    const file =
      (await tryFile(join(dist, safe === '/' ? 'index.html' : safe))) ||
      (await tryFile(join(dist, safe + '.html'))) ||
      (await tryFile(join(dist, safe, 'index.html')));
    const status = file ? 200 : 404;
    const body = await readFile(file || join(dist, '404.html'));
    res.writeHead(status, { 'Content-Type': TYPES[file ? extname(file) : '.html'] || 'application/octet-stream', ...headersFor(path) });
    res.end(body);
  })
  .listen(port, () => console.log(`Preview on http://localhost:${port}`));
