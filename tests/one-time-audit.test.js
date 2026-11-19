// Paid one-time audits: rendered-link discovery, browser fallback, and the
// owner re-run. These tests never open a real browser or database.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { redactSecrets } from '../server/redact.js';
import { collectRenderedHrefs } from '../server/browser-audit.js';
import {
  aggregateOneTimeReport,
  discoverOneTimeUrls,
  isBrowserServiceFailure,
  isTargetHttpError,
  runPaidCheck,
  scanOneTimeUrls,
} from '../server/one-time-audit.js';
import { degradedAuditAlertEmail, DEGRADED_AUDIT_ALERT_TO, sendDegradedAuditAlert } from '../server/app/email-sequences.js';
import { rerunPaidAudit } from '../server/app/one-time.js';

const TOKEN = '13506a8d1dffe9736c20270113435028';
const SECRET_URL = 'wss://production-sfo.browserless.io?token=supersecret';

function withEnv(extra, fn) {
  const saved = {
    BROWSER_WS_ENDPOINT: process.env.BROWSER_WS_ENDPOINT,
    RESEND_API_KEY: process.env.RESEND_API_KEY,
    EMAIL_FROM: process.env.EMAIL_FROM,
    SUBSCRIBER_ADMIN_TOKEN: process.env.SUBSCRIBER_ADMIN_TOKEN,
    ADMIN_TOKEN: process.env.ADMIN_TOKEN,
  };
  for (const [key, value] of Object.entries(extra)) {
    if (value === undefined) delete process.env[key];
    else process.env[key] = value;
  }
  const restore = () => {
    for (const [key, value] of Object.entries(saved)) {
      if (value === undefined) delete process.env[key];
      else process.env[key] = value;
    }
  };
  return Promise.resolve()
    .then(fn)
    .then(
      (value) => {
        restore();
        return value;
      },
      (err) => {
        restore();
        throw err;
      },
    );
}

const shell = '<!doctype html><html><head><title>App</title></head><body><div id="root"></div></body></html>';

test('the report page clears the loading placeholder before showing the report', () => {
  const src = readFileSync(new URL('../src/scripts/one-time-report.js', import.meta.url), 'utf8');
  const fn = src.slice(src.indexOf('function showReport'), src.indexOf('const PRICES'));
  const clear = fn.indexOf('mount.replaceChildren()');
  const append = fn.lastIndexOf('mount.append(card)');
  assert.ok(clear !== -1 && append !== -1 && clear < append);
});

test('secrets in browser errors are removed before they can be stored or sent', () => {
  const text = redactSecrets(`connect failed ${SECRET_URL} Unexpected server response: 429\nstack`);
  assert.match(text, /429/);
  assert.match(text, /wss:\/\/\[redacted\]/);
  assert.doesNotMatch(text, /supersecret/);
  assert.equal(text.includes('\n'), false);
  assert.equal(isTargetHttpError('HTTP 404'), true);
  assert.equal(isBrowserServiceFailure('HTTP 404'), false);
  assert.equal(isBrowserServiceFailure('HTTP 401'), true);
  assert.equal(isBrowserServiceFailure('Unexpected server response: 429'), true);
  assert.equal(isBrowserServiceFailure(text), true);
});

test('collectRenderedHrefs does not connect when no browser is configured', async () => {
  await withEnv({ BROWSER_WS_ENDPOINT: undefined }, async () => {
    assert.deepEqual(await collectRenderedHrefs('https://example.com'), []);
  });
  await assert.rejects(collectRenderedHrefs('http://127.0.0.1/', { endpoint: 'ws://127.0.0.1:9' }), /private network/);
});

test('rendered same-origin links are added when the browser is configured', async () => {
  await withEnv({ BROWSER_WS_ENDPOINT: 'wss://browserless.example/chrome' }, async () => {
    let renderedCalled = 0;
    const found = await discoverOneTimeUrls('https://nosh-flow-admin.base44.app/', {
      fetchPage: async () => ({ finalUrl: 'https://nosh-flow-admin.base44.app/', html: shell }),
      readSitemaps: async () => [],
      renderedLinks: async (url) => {
        renderedCalled += 1;
        assert.equal(url, 'https://nosh-flow-admin.base44.app/');
        return [
          'https://nosh-flow-admin.base44.app/orders',
          'https://nosh-flow-admin.base44.app/settings#team',
          'https://nosh-flow-admin.base44.app/orders',
          'https://evil.example/phish',
          'https://nosh-flow-admin.base44.app/file.pdf',
          'mailto:hi@example.com',
        ];
      },
    });
    assert.equal(renderedCalled, 1);
    assert.deepEqual(found.urls, [
      'https://nosh-flow-admin.base44.app/',
      'https://nosh-flow-admin.base44.app/orders',
      'https://nosh-flow-admin.base44.app/settings',
    ]);
    assert.equal(found.browserDiscoveryError, null);
  });
});

test('rendered links are not requested when the browser is not configured', async () => {
  await withEnv({ BROWSER_WS_ENDPOINT: undefined }, async () => {
    let renderedCalled = false;
    const found = await discoverOneTimeUrls('https://example.com/start', {
      fetchPage: async () => ({
        finalUrl: 'https://example.com/',
        html: '<html><body><a href="/about">About</a><a href="https://other.test/x">Away</a></body></html>',
      }),
      readSitemaps: async () => ['https://example.com/sitemap-page'],
      renderedLinks: async () => {
        renderedCalled = true;
        return ['https://example.com/hidden'];
      },
    });
    assert.equal(renderedCalled, false);
    assert.deepEqual(found.urls, ['https://example.com/start', 'https://example.com/sitemap-page', 'https://example.com/about']);
  });
});

test('a browser failure during discovery is recorded without the browser token', async () => {
  await withEnv({ BROWSER_WS_ENDPOINT: SECRET_URL }, async () => {
    const found = await discoverOneTimeUrls('https://nosh-flow-admin.base44.app/', {
      fetchPage: async () => ({ finalUrl: 'https://nosh-flow-admin.base44.app/', html: shell }),
      readSitemaps: async () => [],
      renderedLinks: async () => {
        throw new Error(`connectOverCDP failed ${SECRET_URL} Unexpected server response: 429`);
      },
    });
    assert.deepEqual(found.urls, ['https://nosh-flow-admin.base44.app/']);
    assert.match(found.browserDiscoveryError, /429/);
    assert.doesNotMatch(found.browserDiscoveryError, /supersecret/);
  });
});

test('a paid scan records an HTML fallback and does not keep the browser token', async () => {
  await withEnv({ BROWSER_WS_ENDPOINT: SECRET_URL }, async () => {
    const checked = await runPaidCheck('https://example.com/', {
      browserAudit: async () => {
        throw new Error(`Unexpected server response: 401 ${SECRET_URL}`);
      },
      fetchPage: async (url) => ({ finalUrl: url, html: '<html><body><img src="a.png"></body></html>' }),
    });
    assert.equal(checked.report.engine, 'html');
    assert.match(checked.browserFallback, /401/);
    assert.doesNotMatch(checked.browserFallback, /supersecret/);

    const results = await scanOneTimeUrls(['https://example.com/', 'https://example.com/orders'], {
      browserAudit: async () => {
        throw new Error('HTTP 429');
      },
      fetchPage: async (url) => ({ finalUrl: url, html: '<html><body><img src="a.png"></body></html>' }),
    });
    assert.equal(results.length, 2);
    assert.ok(results.every((r) => r.ok && r.browserFallback === 'HTTP 429'));
    const report = aggregateOneTimeReport({
      hostname: 'example.com',
      url: 'https://example.com/',
      pageResults: results,
    });
    assert.equal(report.degraded, true);
    assert.equal(report.browserFallback.reason, 'HTTP 429');
    assert.equal(report.browserFallback.pages, 2);
    assert.equal(report.pages[0].browserFallback, 'HTTP 429');
  });
});

test('one target-site miss does not mark a browser audit degraded', () => {
  const page = (url, extra = {}) => ({
    url,
    ok: true,
    issues: 0,
    critical: 0,
    serious: 0,
    moderate: 0,
    minor: 0,
    score: 100,
    issuesDetail: [],
    ...extra,
  });
  const mixed = aggregateOneTimeReport({
    hostname: 'example.com',
    url: 'https://example.com/',
    pageResults: [page('https://example.com/'), page('https://example.com/missing', { browserFallback: 'HTTP 404' })],
  });
  assert.equal(mixed.degraded, false);
  assert.equal(mixed.browserFallback.pages, 1);
  assert.equal(mixed.pagesScanned, 2);

  const collapsed = aggregateOneTimeReport({
    hostname: 'nosh-flow-admin.base44.app',
    url: 'https://nosh-flow-admin.base44.app/',
    pageResults: [page('https://nosh-flow-admin.base44.app/')],
    browserDiscoveryError: 'wss://[redacted] Unexpected server response: 429',
  });
  assert.equal(collapsed.degraded, true);
  assert.match(collapsed.browserFallback.reason, /429/);

  const sitemapStillWorked = aggregateOneTimeReport({
    hostname: 'example.com',
    url: 'https://example.com/',
    pageResults: [page('https://example.com/'), page('https://example.com/about')],
    browserDiscoveryError: 'Timeout 20000ms exceeded',
  });
  assert.equal(sitemapStillWorked.degraded, false);
  assert.equal(sitemapStillWorked.browserFallback.discovery, 'Timeout 20000ms exceeded');
});

test('the degraded-audit alert goes to David and never includes the browser token', async () => {
  const mail = degradedAuditAlertEmail({
    hostname: 'nosh-flow-admin.base44.app',
    url: 'https://nosh-flow-admin.base44.app/',
    token: TOKEN,
    product: 'domain_audit',
    reason: `HTTP 429 ${SECRET_URL}`,
    pagesScanned: 1,
    pagesFellBack: 1,
  });
  assert.match(mail.subject, /Domain Audit/);
  assert.match(mail.subject, /nosh-flow-admin\.base44\.app/);
  assert.match(mail.text, /not marked ready/);
  assert.match(mail.text, new RegExp(TOKEN));
  assert.doesNotMatch(mail.text, /supersecret/);
  assert.match(mail.text, /\/api\/one-time-rerun/);

  await withEnv({ RESEND_API_KEY: 're_test_key', EMAIL_FROM: 'AccessBell <alerts@accessbell.co>' }, async () => {
    const calls = [];
    const original = globalThis.fetch;
    globalThis.fetch = async (url, opts) => {
      calls.push({ url: String(url), body: JSON.parse(opts.body), headers: opts.headers });
      return new Response(JSON.stringify({ id: 'email_1' }), { status: 200, headers: { 'content-type': 'application/json' } });
    };
    try {
      const res = await sendDegradedAuditAlert({
        hostname: 'nosh-flow-admin.base44.app',
        url: 'https://nosh-flow-admin.base44.app/',
        token: TOKEN,
        product: 'domain_audit',
        reason: 'HTTP 429',
        pagesScanned: 1,
        pagesFellBack: 1,
        idempotencyKey: `degraded-audit/${TOKEN}/2026-11-19`,
      });
      assert.equal(res.ok, true);
      assert.equal(calls.length, 1);
      assert.equal(calls[0].url, 'https://api.resend.com/emails');
      assert.equal(calls[0].body.to[0], DEGRADED_AUDIT_ALERT_TO);
      assert.equal(calls[0].headers['Idempotency-Key'], `degraded-audit/${TOKEN}/2026-11-19`);
      assert.equal(calls[0].headers.Authorization, 'Bearer re_test_key');
      assert.doesNotMatch(JSON.stringify(calls[0].body), /re_test_key/);
    } finally {
      globalThis.fetch = original;
    }
  });
});

test('admin re-run resets a domain audit and queues the crawl', async () => {
  const calls = [];
  const result = await rerunPaidAudit(TOKEN, {
    dbOne: async (sql, params) => {
      calls.push({ sql, params });
      return { token: TOKEN, product: 'domain_audit', hostname: 'nosh-flow-admin.base44.app', delivery: 'pending' };
    },
    sendEvent: async (token) => {
      calls.push({ event: token });
    },
  });
  assert.equal(result.status, 200);
  assert.equal(result.body.queued, true);
  assert.equal(result.body.delivery, 'pending');
  assert.match(calls[0].sql, /delivery = 'pending'/);
  assert.match(calls[0].sql, /report = null/);
  assert.match(calls[0].sql, /status = 'paid'/);
  assert.deepEqual(calls[0].params, [TOKEN]);
  assert.equal(calls[1].event, TOKEN);
});

test('admin re-run of a page report clears it and does not queue a domain crawl', async () => {
  let sent = false;
  const result = await rerunPaidAudit('a'.repeat(32), {
    dbOne: async () => ({ token: 'a'.repeat(32), product: 'page_report', hostname: 'example.com', delivery: 'pending' }),
    sendEvent: async () => {
      sent = true;
    },
  });
  assert.equal(result.status, 200);
  assert.equal(result.body.queued, false);
  assert.equal(sent, false);
  assert.equal((await rerunPaidAudit('nope', { dbOne: async () => { throw new Error('db'); } })).status, 400);
  assert.equal(
    (await rerunPaidAudit('b'.repeat(32), { dbOne: async () => null, sendEvent: async () => { throw new Error('should not send'); } })).status,
    404,
  );
});

test('the re-run endpoint requires an admin secret and does not echo it', async () => {
  await withEnv({ SUBSCRIBER_ADMIN_TOKEN: undefined, ADMIN_TOKEN: undefined }, async () => {
    const { POST, GET } = await import('../api/one-time-rerun.js');
    const hidden = await POST(new Request('https://www.accessbell.co/api/one-time-rerun', {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'x-admin-token': 'anything' },
      body: JSON.stringify({ token: TOKEN }),
    }));
    assert.equal(hidden.status, 404);
    const method = GET();
    assert.equal(method.status, 405);
  });

  await withEnv({ SUBSCRIBER_ADMIN_TOKEN: 'right-token', ADMIN_TOKEN: undefined }, async () => {
    const { POST } = await import('../api/one-time-rerun.js');
    const denied = await POST(new Request('https://www.accessbell.co/api/one-time-rerun', {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'x-admin-token': 'wrong-token' },
      body: JSON.stringify({ token: TOKEN }),
    }));
    assert.equal(denied.status, 403);
    const deniedBody = await denied.json();
    assert.equal(deniedBody.error, 'Forbidden.');
    assert.doesNotMatch(JSON.stringify(deniedBody), /right-token/);

    const bad = await POST(new Request('https://www.accessbell.co/api/one-time-rerun', {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'x-admin-token': 'right-token' },
      body: JSON.stringify({ token: 'not-a-token' }),
    }));
    assert.equal(bad.status, 400);
  });
});
