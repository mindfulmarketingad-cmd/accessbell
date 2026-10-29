// The free scan lists issues by name, severity and WCAG criterion, and shows
// the most severe issues in full (failing code samples and the fix) as a
// teaser. The names-only list must never carry code, samples or fixes.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { preview, teaser } from '../api/scan.js';
import { audit } from '../server/audit.js';

const sample = () => ({ finalUrl: 'https://example.com/', engine: 'html', ...audit('<html><body><img src="secret-photo.png"><button></button></body></html>', { standard: 'wcag22' }) });

test('free scan preview lists each issue but drops code, samples and fixes from the list', () => {
  const report = sample();
  assert.ok(report.issues.length > 0, 'the sample page has issues');
  const out = preview(report);
  assert.equal(out.preview, true);
  assert.equal(out.summary.issues, report.summary.issues);
  assert.equal(out.summary.critical + out.summary.serious + out.summary.moderate + out.summary.minor, report.summary.issues);
  assert.equal(out.issues.length, report.issues.length);
  assert.deepEqual(Object.keys(out).sort(), ['engine', 'finalUrl', 'issues', 'preview', 'standard', 'summary', 'teaser']);
  for (const issue of out.issues) assert.deepEqual(Object.keys(issue).sort(), ['count', 'impact', 'title', 'wcag']);
  assert.ok(out.issues[0].wcag.every((c) => c.sc && c.name && c.level), 'criteria carry number, name and level');
  const listText = JSON.stringify(out.issues);
  for (const issue of report.issues) {
    assert.ok(!listText.includes(issue.fix), `no fix for ${issue.id} in the list`);
    assert.ok(!listText.includes(issue.description), `no description for ${issue.id} in the list`);
  }
  assert.ok(!listText.includes('<img') && !listText.includes('secret-photo'), 'no failing markup in the list');
});

test('free scan teaser shows at most the 5 most severe issues in full', () => {
  const report = sample();
  const t = teaser(report);
  assert.ok(t.length > 0 && t.length <= 5, 'teaser is non-empty and capped at 5');
  assert.equal(t.length, Math.min(5, report.issues.length));
  assert.deepEqual(
    t.map((i) => i.title),
    report.issues.slice(0, t.length).map((i) => i.title),
    'teaser follows report order: most severe first',
  );
  for (const item of t) {
    assert.deepEqual(Object.keys(item).sort(), ['count', 'fix', 'helpUrl', 'impact', 'samples', 'title', 'wcag']);
    assert.ok(item.fix && item.fix.length > 0, 'teaser carries the fix');
    assert.ok(Array.isArray(item.samples), 'teaser carries code samples');
  }
});

test('free scan preview caps the list and survives a bare report', () => {
  const many = { summary: { issues: 99 }, issues: Array.from({ length: 80 }, (_, i) => ({ title: `Issue ${i}`, impact: 'minor', count: 1, wcag: [] })) };
  assert.equal(preview(many).issues.length, 30);
  assert.equal(preview(many).teaser.length, 5);
  assert.deepEqual(preview({}).issues, []);
  assert.deepEqual(preview({}).teaser, []);
});
