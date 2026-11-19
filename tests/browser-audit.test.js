import { test } from 'node:test';
import assert from 'node:assert/strict';
import { runAudit } from '../server/app/scanning.js';
import {
  scFromTag,
  mapAxeResults,
  browserAudit,
  connectBrowser,
  createBrowserLease,
  isBrowserRateLimit,
  BROWSER_RATE_LIMIT_DELAYS_MS,
} from '../server/browser-audit.js';

test('axe tags convert to WCAG success criteria', () => {
  assert.equal(scFromTag('wcag111'), '1.1.1');
  assert.equal(scFromTag('wcag143'), '1.4.3');
  assert.equal(scFromTag('wcag1410'), '1.4.10');
  assert.equal(scFromTag('wcag2411'), '2.4.11');
  assert.equal(scFromTag('wcag2aa'), null);
  assert.equal(scFromTag('cat.color'), null);
});

const fixture = {
  testEngine: { version: '4.13.0' },
  violations: [
    {
      id: 'color-contrast',
      impact: 'serious',
      tags: ['cat.color', 'wcag2aa', 'wcag143'],
      help: 'Elements must meet minimum color contrast ratio thresholds',
      description: 'Ensure the contrast between foreground and background colors meets WCAG 2 AA thresholds',
      helpUrl: 'https://dequeuniversity.com/rules/axe/4.13/color-contrast',
      nodes: [
        { html: '<p class="muted">Low contrast</p>', target: ['main > p.muted'], failureSummary: 'Fix any of the following:\n  Element has insufficient color contrast of 2.1 (expected 4.5:1)' },
        { html: '<span>' + 'x'.repeat(400) + '</span>', failureSummary: '' },
        { html: '<a>3</a>' },
        { html: '<a>4</a>' },
      ],
    },
    {
      id: 'image-alt',
      impact: 'critical',
      tags: ['wcag2a', 'wcag111'],
      help: 'Images must have alternative text',
      description: 'Ensure img elements have alternative text',
      helpUrl: 'javascript:alert(1)',
      nodes: [{ html: '<img src="a.png">', failureSummary: 'Fix any of the following:\n  Element does not have an alt attribute' }],
    },
  ],
  passes: [{ id: 'html-has-lang', tags: ['wcag2a', 'wcag311'], help: '<html> element must have a lang attribute', nodes: [{}] }],
  incomplete: [{ id: 'color-contrast-bg', tags: ['wcag2aa', 'wcag143'], help: 'Check text over images', helpUrl: 'https://dequeuniversity.com/x', nodes: [{}, {}] }],
};

test('axe results map to the report shape used by the website', () => {
  const r = mapAxeResults(fixture, 'wcag22');
  assert.equal(r.engine, 'browser');
  assert.equal(r.issues[0].id, 'image-alt', 'critical issues sort first');
  assert.equal(r.issues[1].count, 4);
  assert.equal(r.issues[1].samples.length, 3);
  assert.ok(r.issues[1].samples.every((s) => s.length <= 220));
  assert.deepEqual(r.issues[1].wcag, [{ sc: '1.4.3', name: 'Contrast (Minimum)', level: 'AA', version: '2.0', principle: 'Perceivable', guideline: 'Distinguishable' }]);
  assert.match(r.issues[1].fix, /insufficient color contrast/);
  assert.doesNotMatch(r.issues[1].fix, /Fix any of the following/);
  assert.equal(r.issues[1].helpUrl, 'https://dequeuniversity.com/rules/axe/4.13/color-contrast');
  assert.equal(r.issues[0].helpUrl, undefined, 'non-https or foreign help links are dropped');
  assert.equal(r.summary.issues, 5);
  assert.equal(r.summary.critical, 1);
  assert.equal(r.passes.length, 1);
  assert.equal(r.review[0].count, 2);
  // Every failing element (up to 25) is kept with its selector for the issue details page.
  assert.equal(r.issues[1].elements.length, 4);
  assert.deepEqual(r.issues[1].elements[0], { html: '<p class="muted">Low contrast</p>', target: 'main > p.muted', fix: 'Element has insufficient color contrast of 2.1 (expected 4.5:1).' });
  assert.ok(r.issues[1].elements[1].html.length <= 300);
  assert.equal(r.review[0].elements.length, 2);
  // A screenshot of the problem is attached to its issue when the scan captured one.
  const shot = 'data:image/jpeg;base64,AAAA';
  const withShot = mapAxeResults(fixture, 'wcag22', { 'image-alt': shot });
  assert.equal(withShot.issues.find((i) => i.id === 'image-alt').shot, shot);
  assert.equal(withShot.issues.find((i) => i.id === 'color-contrast').shot, undefined);
  assert.ok(r.score < 100);
});

test('browserAudit refuses private targets before contacting the browser', async () => {
  await assert.rejects(browserAudit('http://169.254.169.254/', { endpoint: 'ws://127.0.0.1:1' }), /private network/);
  await assert.rejects(browserAudit('https://example.com', { endpoint: '' }), /BROWSER_WS_ENDPOINT/);
});

const SECRET_ENDPOINT = 'wss://production-sfo.browserless.io?token=supersecret';

async function captureConsole(fn) {
  const lines = [];
  const keys = ['log', 'info', 'warn', 'error', 'debug'];
  const saved = {};
  for (const key of keys) {
    saved[key] = console[key];
    console[key] = (...args) => lines.push(args.map((part) => String(part)).join(' '));
  }
  try {
    return { value: await fn(), lines };
  } finally {
    for (const key of keys) console[key] = saved[key];
  }
}

test('a Browserless 429 is retried at 5s, 15s and 30s and other errors are not', async () => {
  assert.deepEqual(BROWSER_RATE_LIMIT_DELAYS_MS, [5_000, 15_000, 30_000]);
  assert.equal(isBrowserRateLimit('browserType.connectOverCDP: Unexpected server response: 429'), true);
  assert.equal(isBrowserRateLimit('429 Too Many Requests'), true);
  assert.equal(isBrowserRateLimit('HTTP 429'), false, 'a target site status is not a Browserless connect failure');
  assert.equal(isBrowserRateLimit('HTTP 404'), false);
  assert.equal(isBrowserRateLimit('HTTP 401'), false);
  assert.equal(isBrowserRateLimit(''), false);

  const recovered = [];
  let calls = 0;
  const browser = { id: 'recovered' };
  const got = await connectBrowser(SECRET_ENDPOINT, {
    connect: async () => {
      calls += 1;
      if (calls < 3) throw new Error('browserType.connectOverCDP: Unexpected server response: 429');
      return browser;
    },
    sleep: async (ms) => recovered.push(ms),
  });
  assert.equal(got, browser);
  assert.equal(calls, 3);
  assert.deepEqual(recovered, [5_000, 15_000]);

  let once = 0;
  await assert.rejects(
    () => connectBrowser('wss://example.test/chrome', {
      connect: async () => {
        once += 1;
        throw new Error('HTTP 404');
      },
      sleep: async () => {
        throw new Error('should not sleep');
      },
    }),
    /HTTP 404/,
  );
  assert.equal(once, 1);

  const exhausted = [];
  let attempts = 0;
  const { lines } = await captureConsole(async () => {
    await assert.rejects(
      () => connectBrowser(SECRET_ENDPOINT, {
        connect: async (endpoint) => {
          attempts += 1;
          throw new Error(`browserType.connectOverCDP: ${endpoint} 429 Too Many Requests`);
        },
        sleep: async (ms) => exhausted.push(ms),
      }),
      /429/,
    );
  });
  assert.equal(attempts, 4);
  assert.deepEqual(exhausted, [5_000, 15_000, 30_000]);
  assert.ok(lines.every((line) => !line.includes('supersecret')));
});

test('one browser lease is reused until its budget, and a failed open is not retried per page', async () => {
  let t = 1_000;
  const sessions = [];
  const lease = createBrowserLease({
    endpoint: 'wss://example.test/chrome',
    budgetMs: 80_000,
    now: () => t,
    sleep: async () => {
      throw new Error('should not sleep');
    },
    connect: async () => {
      const session = {
        id: sessions.length + 1,
        closed: false,
        async close() {
          this.closed = true;
        },
      };
      sessions.push(session);
      return session;
    },
  });
  const first = await lease.current();
  t = 40_000;
  const second = await lease.current();
  assert.equal(second.session, first.session);
  t = 40_000 + 80_000;
  const third = await lease.current();
  assert.equal(sessions.length, 2);
  assert.notEqual(third.session, first.session);
  assert.equal(first.session.closed, true);
  await lease.close();
  assert.equal(third.session.closed, true);

  let connects = 0;
  const waits = [];
  const limited = createBrowserLease({
    endpoint: SECRET_ENDPOINT,
    connect: async (endpoint) => {
      connects += 1;
      throw new Error(`browserType.connectOverCDP: ${endpoint} Unexpected server response: 429`);
    },
    sleep: async (ms) => waits.push(ms),
  });
  const failed = await limited.current();
  const again = await limited.current();
  assert.equal(connects, 4);
  assert.deepEqual(waits, [5_000, 15_000, 30_000]);
  assert.equal(again.error, failed.error);
  assert.equal(again.session, null);
  await limited.close();

  let reconnects = 0;
  const extraWaits = [];
  let clock = 0;
  const aging = createBrowserLease({
    endpoint: SECRET_ENDPOINT,
    budgetMs: 1_000,
    now: () => clock,
    connect: async (endpoint) => {
      reconnects += 1;
      if (reconnects === 1) return { id: 'first', async close() {} };
      throw new Error(`429 Too Many Requests ${endpoint}`);
    },
    sleep: async (ms) => extraWaits.push(ms),
  });
  await aging.current();
  clock = 5_000;
  const { lines } = await captureConsole(async () => aging.current());
  assert.equal(reconnects, 2);
  assert.deepEqual(extraWaits, [], 'a later reconnect does not repeat the backoff');
  assert.ok(lines.every((line) => !line.includes('supersecret')));
  const stuck = await aging.current();
  assert.equal(reconnects, 2);
  assert.match(stuck.error.message, /429/);
  await aging.close();
});

test('a shared browser session is not closed after one page', async () => {
  let browserCloses = 0;
  let contextCloses = 0;
  const session = {
    async newContext() {
      return {
        async newPage() {
          return {
            async route() {},
            async goto() {
              throw new Error('navigation failed');
            },
          };
        },
        async close() {
          contextCloses += 1;
        },
      };
    },
    async close() {
      browserCloses += 1;
    },
  };
  await assert.rejects(() => browserAudit('https://example.com/', { session }), /navigation failed/);
  assert.equal(browserCloses, 0);
  assert.equal(contextCloses, 1);

  await assert.rejects(
    () => browserAudit('https://example.com/', {
      endpoint: 'wss://example.test/chrome',
      connect: async () => session,
      sleep: async () => {},
    }),
    /navigation failed/,
  );
  assert.equal(browserCloses, 1);
  assert.equal(contextCloses, 2);
});

test('monitoring reuses one session and does not log the browser token', async () => {
  const session = { id: 'shared' };
  const seen = [];
  const browser = async (url, opts) => {
    seen.push({ url, session: opts.session, device: opts.device });
    return {
      engine: 'browser',
      finalUrl: url,
      device: opts.device,
      score: 90,
      summary: { issues: 0 },
      issues: [],
      passes: [],
      review: [],
      notes: [],
      standard: { label: 'WCAG 2.2 AA' },
      documents: [],
    };
  };
  const saved = process.env.BROWSER_WS_ENDPOINT;
  process.env.BROWSER_WS_ENDPOINT = SECRET_ENDPOINT;
  try {
    await runAudit('https://example.com/', {}, 'desktop', { browser, session });
    await runAudit('https://example.com/', {}, 'mobile', { browser, session });
    assert.deepEqual(seen.map((s) => s.device), ['desktop', 'mobile']);
    assert.equal(seen[0].session, session);
    assert.equal(seen[1].session, session);

    const { value, lines } = await captureConsole(() => runAudit('https://example.com/', {}, 'desktop', {
      browser: async () => {
        throw new Error('browser should not be called');
      },
      fetcher: async (url) => ({ finalUrl: url, html: '<html><body><img src="a.png"></body></html>' }),
      browserError: new Error(`429 Too Many Requests ${SECRET_ENDPOINT}`),
    }));
    assert.equal(value.engine, 'html');
    assert.match(lines.join('\n'), /429/);
    assert.ok(lines.every((line) => !line.includes('supersecret')));
  } finally {
    if (saved === undefined) delete process.env.BROWSER_WS_ENDPOINT;
    else process.env.BROWSER_WS_ENDPOINT = saved;
  }
});
