import { test } from 'node:test';
import assert from 'node:assert/strict';
import { scFromTag, mapAxeResults, browserAudit } from '../server/browser-audit.js';

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
