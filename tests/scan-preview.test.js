// The free scan lists issues by name, severity and WCAG criterion. It must never
// return the failing code, where an issue is on the page or how to fix it.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { preview } from '../api/scan.js';
import { audit } from '../server/audit.js';

const sample = () => ({ finalUrl: 'https://example.com/', engine: 'html', ...audit('<html><body><img src="secret-photo.png"><button></button></body></html>', { standard: 'wcag22' }) });

test('free scan preview lists each issue but drops code, samples and fixes', () => {
  const report = sample();
  assert.ok(report.issues.length > 0, 'the sample page has issues');
  const out = preview(report);
  assert.equal(out.preview, true);
  assert.equal(out.summary.issues, report.summary.issues);
  assert.equal(out.summary.critical + out.summary.serious + out.summary.moderate + out.summary.minor, report.summary.issues);
  assert.equal(out.issues.length, report.issues.length);
  assert.deepEqual(Object.keys(out).sort(), ['engine', 'finalUrl', 'issues', 'preview', 'standard', 'summary']);
  for (const issue of out.issues) assert.deepEqual(Object.keys(issue).sort(), ['count', 'impact', 'title', 'wcag']);
  assert.ok(out.issues[0].wcag.every((c) => c.sc && c.name && c.level), 'criteria carry number, name and level');
  const text = JSON.stringify(out);
  for (const issue of report.issues) {
    assert.ok(!text.includes(issue.fix), `no fix for ${issue.id}`);
    assert.ok(!text.includes(issue.description), `no description for ${issue.id}`);
  }
  assert.ok(!text.includes('<img') && !text.includes('secret-photo'), 'no failing markup');
});

test('free scan preview caps the list and survives a bare report', () => {
  const many = { summary: { issues: 99 }, issues: Array.from({ length: 80 }, (_, i) => ({ title: `Issue ${i}`, impact: 'minor', count: 1, wcag: [] })) };
  assert.equal(preview(many).issues.length, 30);
  assert.deepEqual(preview({}).issues, []);
});
