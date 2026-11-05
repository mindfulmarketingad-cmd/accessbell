// Store-owner labels layered on top of axe severity.
// Lawsuit-common: alt text, unlabeled fields, unnamed buttons (and links with no name).
// Blocks checkout: those barriers, plus other critical or serious issues, on a cart or checkout URL.
// Best practice: everything else. Labels describe priority for a store owner. They are not legal findings.

export const OWNER_LABELS = {
  'lawsuit-common': {
    text: 'Lawsuit-common',
    hint: 'Missing alt text, unlabeled fields, and controls with no name are barriers website complaints often name.',
  },
  'blocks-checkout': {
    text: 'Blocks checkout',
    hint: 'On a cart or checkout URL, this can get in the way of completing a purchase.',
  },
  'best-practice': {
    text: 'Best practice',
    hint: 'Worth fixing. It is less often the barrier named in a website accessibility complaint.',
  },
};

const ALT = /\b(image-alt|area-alt|input-image-alt|svg-img-alt|role-img-alt|alt text|alternative text|non-text content|images? (do not |does not |missing |without |have no ))/;
const BUTTON = /\b(button-name|link-name|empty button|empty link|unnamed button|button has no|link has no|no accessible name)/;
const FORM = /\b(label\b|form-field|select-name|autocomplete-valid|unlabeled|form field|missing label|no label|labels or instructions)/;

function haystack(issue) {
  const criteria = (issue?.wcag || []).map((c) => `${c?.sc || ''} ${c?.name || ''}`).join(' ');
  return `${issue?.id || ''} ${issue?.title || ''} ${criteria}`.toLowerCase();
}

/** True when the URL path is a cart, bag, basket, checkout, payment, or billing step. */
export function isCheckoutPath(url) {
  const raw = String(url || '');
  if (!raw) return false;
  let path = raw;
  let search = '';
  try {
    const u = new URL(raw, 'https://example.com');
    path = u.pathname;
    search = u.search;
  } catch {
    path = raw;
  }
  const pathHit = /(?:^|\/)(checkout|checkouts|cart|basket|bag|payment|billing)(?:\/|$)/i.test(path);
  const queryHit = /[?&](checkout|cart)=/i.test(search);
  return pathHit || queryHit;
}

export function classifyIssue(issue) {
  const text = haystack(issue);
  const scs = new Set((issue?.wcag || []).map((c) => c?.sc).filter(Boolean));
  return {
    alt: ALT.test(text) || scs.has('1.1.1'),
    button: BUTTON.test(text),
    form: FORM.test(text) || scs.has('3.3.2') || scs.has('1.3.5'),
  };
}

/**
 * Owner labels for one issue. `urls` is the page or pages where it appears.
 * An issue can be both Blocks checkout and Lawsuit-common. Best practice is used only on its own.
 */
export function ownerLabelsFor(issue, urls = []) {
  const kind = classifyIssue(issue);
  const labels = [];
  const checkout = (Array.isArray(urls) ? urls : [urls]).some(isCheckoutPath);
  const urgent = issue?.impact === 'critical' || issue?.impact === 'serious';
  if (checkout && (kind.form || kind.button || kind.alt || urgent)) labels.push('blocks-checkout');
  if (kind.alt || kind.form || kind.button) labels.push('lawsuit-common');
  if (!labels.length) labels.push('best-practice');
  return labels;
}

export function ownerLabels(issue, pageUrl) {
  return ownerLabelsFor(issue, pageUrl ? [pageUrl] : []);
}

/** Element counts for each owner label. An element can count in more than one label. */
export function ownerCounts(issues, pageUrl) {
  const counts = { lawsuitCommon: 0, blocksCheckout: 0, bestPractice: 0 };
  for (const issue of issues || []) {
    const n = Number.isFinite(issue?.count) ? issue.count : 0;
    const labels = ownerLabels(issue, pageUrl || issue?.url || '');
    if (labels.includes('blocks-checkout')) counts.blocksCheckout += n;
    if (labels.includes('lawsuit-common')) counts.lawsuitCommon += n;
    if (labels.includes('best-practice')) counts.bestPractice += n;
  }
  return counts;
}
