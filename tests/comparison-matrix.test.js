// The /comparisons matrix may only use prices from the November 2026 research
// brief. Directory and contract ranges stay labeled. AudioEye's own page has
// no dollar amount.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const matrix = readFileSync(new URL('../src/data/comparison-matrix.ts', import.meta.url), 'utf8');
const page = readFileSync(new URL('../src/pages/comparisons/index.astro', import.meta.url), 'utf8');

test('the comparisons hub is the five-tool cost and feature table', () => {
  for (const name of ['AccessBell', 'AudioEye', 'AAArdvark', 'Siteimprove', 'Level Access']) {
    assert.match(matrix, new RegExp(`name: '${name}'`));
  }
  assert.match(page, /cmp-matrix/);
  assert.match(page, /November 2026/);
  assert.match(page, /Accessibility Tool Comparison \| AccessBell/);
});

test('published and reference prices match the research brief', () => {
  for (const snippet of [
    'PLAN.price} per domain per month',
    'PLAN.annualPrice} per domain per year',
    'ONE_TIME.pageReport.price',
    'ONE_TIME.domainAudit.price',
    'about $49 per month',
    'third-party directory figure, not a price AudioEye publishes',
    '$549, $1,099, $2,749 and $5,499',
    '$7,100 per year for 1,000 pages',
    '£8,000 to £28,700 per licence',
    '$5,000 for 12 months',
    '$13,495 per year',
    '$14,995 per year',
    '$160 per hour',
    '$33,735 per year',
    '$50,000 to $500,000 or more',
  ]) {
    assert.ok(matrix.includes(snippet), snippet);
  }
});

test('the hub does not present directory or channel prices as AudioEye list prices', () => {
  assert.match(matrix, /does not publish dollar amounts on its own plans page/);
  assert.match(page, /\$9\.99 and \$99 are channel-specific/);
  assert.match(page, /about \$305 per customer per year is average revenue, not a plan price/);
  assert.doesNotMatch(matrix, /AudioEye publishes \$49/);
  assert.doesNotMatch(matrix, /AudioEye costs \$49/);
});

test('detailed write-ups still point at real comparison routes', () => {
  for (const slug of ['audioeye-vs-accessbell', 'aaardvark-vs-accessbell', 'siteimprove-vs-accessbell', 'level-access-vs-accessbell']) {
    assert.match(matrix, new RegExp(`/comparisons/${slug}`));
  }
  assert.match(page, /comparisonPath/);
});
