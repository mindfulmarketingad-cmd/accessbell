// The free scan is a preview: it must return counts only, never issue details.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { preview } from '../api/scan.js';
import { audit } from '../server/audit.js';

test('free scan preview keeps counts and drops every issue detail', () => {
  const report = { finalUrl: 'https://example.com/', engine: 'html', ...audit('<html><body><img src="a.png"><button></button></body></html>', { standard: 'wcag22' }) };
  assert.ok(report.issues.length > 0, 'the sample page has issues');
  const out = preview(report);
  assert.equal(out.locked, true);
  assert.equal(out.summary.issues, report.summary.issues);
  assert.equal(out.summary.critical + out.summary.serious + out.summary.moderate + out.summary.minor, report.summary.issues);
  assert.deepEqual(Object.keys(out).sort(), ['engine', 'finalUrl', 'locked', 'standard', 'summary']);
  const text = JSON.stringify(out);
  for (const issue of report.issues) assert.ok(!text.includes(issue.id), `no rule id ${issue.id}`);
  assert.ok(!text.includes('<img'), 'no failing markup');
});
