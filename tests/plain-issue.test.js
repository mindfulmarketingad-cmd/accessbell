// Plain-language gloss for free-scan results. The checker title stays available
// when it is jargon; the sentence a visitor reads comes first.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { countLabel, explainIssue, verdictFor, wcagSummary } from '../src/scripts/shared/plain-issue.js';

test('verdict leads with what the issues mean for visitors', () => {
  const critical = verdictFor({ critical: 2, serious: 1, issues: 4 });
  assert.equal(critical.tone, 'bad');
  assert.match(critical.text, /2 critical issues can stop some visitors/);
  assert.doesNotMatch(critical.text, /lawsuit|compliant|not accessible/i);

  const serious = verdictFor({ critical: 0, serious: 1, issues: 3 });
  assert.match(serious.text, /1 serious issue makes this page hard to use/);
  assert.match(serious.text, /None are critical/);

  const minor = verdictFor({ issues: 4, moderate: 4 });
  assert.equal(minor.tone, 'warn');
  assert.match(minor.text, /4 smaller issues/);
  assert.match(minor.text, /None block visitors completely/);

  const clear = verdictFor({ issues: 0 });
  assert.equal(clear.tone, 'good');
  assert.match(clear.text, /not proof the page is fully accessible/);
});

test('known checker titles become a short name and a visitor-facing reason', () => {
  const contrast = explainIssue({
    title: 'Elements must meet minimum color contrast ratio thresholds',
    wcag: [{ sc: '1.4.3', name: 'Contrast (Minimum)' }],
  });
  assert.equal(contrast.name, 'Text is hard to read');
  assert.match(contrast.why, /cannot read it/);
  assert.equal(contrast.technical, 'Elements must meet minimum color contrast ratio thresholds');

  const image = explainIssue({ title: 'Images must have alternative text', wcag: [{ sc: '1.1.1', name: 'Non-text Content' }] });
  assert.equal(image.name, 'A picture has no description');
  assert.equal(image.technical, '');

  const button = explainIssue({ title: 'Buttons have no accessible name' });
  assert.equal(button.name, 'A button has no name');
  assert.match(button.why, /cannot tell what it does/);

  const imageButton = explainIssue({ title: 'Image buttons must have alternative text' });
  assert.equal(imageButton.name, 'A picture button has no description');

  const blink = explainIssue({ title: 'Blinking or scrolling text is used' });
  assert.equal(blink.name, 'Something moves and cannot be paused');

  const mismatch = explainIssue({ title: 'Elements must have their visible text as part of their accessible name' });
  assert.equal(mismatch.name, 'The visible label and the spoken name do not match');

  const ids = explainIssue({ title: 'IDs referenced by labels or ARIA are duplicated' });
  assert.equal(ids.name, 'The same ID is used more than once');

  assert.equal(explainIssue({ title: 'Links with the same name must have a similar purpose' }).name, 'Links with the same name do different things');
  assert.equal(explainIssue({ title: 'Alternative text of images should not be repeated as text' }).name, 'A picture description repeats nearby text');
  assert.equal(explainIssue({ title: 'Form field must not have multiple label elements' }).name, 'A field has more than one label');
  assert.equal(explainIssue({ title: 'Tables should not have the same summary and caption' }).name, 'A table caption is confusing');
  assert.equal(explainIssue({ title: '<video> or <audio> elements must not play automatically' }).name, 'Sound starts by itself');
  assert.equal(explainIssue({ title: 'Scrollable region must have keyboard access' }).name, 'A scrolling area is not keyboard accessible');
  assert.equal(explainIssue({ title: 'Users should be able to zoom and scale the text up to 500%' }).name, 'Enlarged text does not fit the screen');
});

test('every HTML-audit failure title has a plain explanation', () => {
  const titles = [
    'Page language is missing',
    'Page title is missing or empty',
    'Images are missing alternative text',
    'SVG images with role="img" have no accessible name',
    'Form fields have no label',
    'Buttons have no accessible name',
    'Links have no accessible name',
    'Links use vague text such as "click here" or "read more"',
    'Headings are empty',
    'Page has no level-one heading',
    'Heading levels are skipped',
    'Zooming and scaling are disabled',
    'Frames and iframes have no title',
    'IDs referenced by labels or ARIA are duplicated',
    'Elements use a positive tabindex',
    'Page refreshes or redirects on a timer',
    'Audio or video plays automatically with sound',
    'No main landmark or skip link',
    'The whole page is hidden from assistive technology',
    'Elements use invalid ARIA roles',
    'Blinking or scrolling text is used',
    'Data tables have no header cells',
  ];
  for (const title of titles) {
    const explained = explainIssue({ title, wcag: [] });
    assert.notEqual(explained.name, title, title);
    assert.notEqual(explained.why, 'This makes the page harder for some visitors to use.', title);
    assert.ok(explained.why.length < 180, title);
  }
});

test('an unfamiliar title keeps its wording and uses the WCAG criterion for why', () => {
  const explained = explainIssue({ title: 'Custom widget state is incomplete', wcag: [{ sc: '4.1.2', name: 'Name, Role, Value' }] });
  assert.equal(explained.name, 'Custom widget state is incomplete');
  assert.match(explained.why, /assistive software/i);
  assert.equal(explained.technical, '');
});

test('WCAG line keeps the first criterion visible and the rest available', () => {
  const one = wcagSummary([{ sc: '1.1.1', name: 'Non-text Content' }]);
  assert.equal(one.short, 'WCAG 1.1.1 Non-text Content');
  assert.equal(one.full, one.short);

  const many = wcagSummary([
    { sc: '1.3.1', name: 'Info and Relationships' },
    { sc: '4.1.2', name: 'Name, Role, Value' },
  ]);
  assert.equal(many.short, 'WCAG 1.3.1 Info and Relationships + 1 more');
  assert.match(many.full, /4\.1\.2 Name, Role, Value/);
  assert.equal(countLabel(1), '1 on this page');
  assert.equal(countLabel(12), '12 on this page');
});
