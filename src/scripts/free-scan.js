// Free accessibility checker: submits a URL to /api/scan, runs the checklist
// animation, then lists the issues found. No sign-up is needed to run it.
// The most severe issues are shown in full (failing code and fix) as a
// teaser; the full detail for every issue is what a one-time report adds,
// and daily monitoring is what a free trial adds.
// All data is inserted as text, never HTML.
import { trackFreeScan } from './shared/ads-conversions.js';
import { countLabel, explainIssue, SEVERITY_HINT, verdictFor, wcagSummary } from './shared/plain-issue.js';
import { el } from './shared/report-view.js';
import { pagesScanned, scannedText, fillScanProof } from './shared/scan-stats.js';
import { OWNER_LABELS, ownerLabels } from './shared/owner-priority.js';

export { verdictFor };

const forms = document.querySelectorAll('[data-scan-form]');
const section = document.getElementById('scan-results');
const mount = section?.querySelector('[data-results]');
let busy = false;

function normalizeUrl(raw) {
  let v = (raw || '').trim();
  if (!v) return { error: 'Enter a website address to check.' };
  if (!/^[a-z][a-z0-9+.-]*:\/\//i.test(v)) v = 'https://' + v;
  let u;
  try {
    u = new URL(v);
  } catch {
    return { error: 'That does not look like a valid web address. Try something like example.com.' };
  }
  if (u.protocol !== 'http:' && u.protocol !== 'https:') return { error: 'Only http and https addresses can be checked.' };
  // Any domain extension is fine: .com, .co.uk, .site, .org, .com.au and so on.
  u.hostname = u.hostname.replace(/\.$/, '');
  if (!u.hostname.includes('.')) return { error: 'Enter a full domain name, such as example.com or example.co.uk.' };
  return { url: u.toString() };
}

function setError(form, message) {
  const box = document.getElementById(form.getAttribute('aria-describedby'));
  const input = form.elements.url;
  if (message) input.setAttribute('aria-invalid', 'true');
  else input.removeAttribute('aria-invalid');
  if (box) {
    box.textContent = message || '';
    box.hidden = !message;
  }
}

// What the scan checks, shown while it runs. The engine runs every rule at
// once; the checklist is paced so people can see what is being tested.
const TARGETS = {
  wcag22: { label: 'WCAG 2.2 Level AA', v22: true },
  wcag21: { label: 'WCAG 2.1 Level AA' },
  ada: { label: 'ADA (WCAG 2.1 Level AA)' },
  section508: { label: 'Section 508 (WCAG 2.0 Level AA)', v20: true },
  en301549: { label: 'EN 301 549 (WCAG 2.1 Level AA)' },
};

function scanSteps(standard) {
  const t = TARGETS[standard] || TARGETS.wcag22;
  return [
    ['Loading the page the way a visitor sees it', 'Includes scripts, so the real page is checked'],
    ['Images and alternative text', 'WCAG 1.1.1'],
    ['Text color contrast', 'WCAG 1.4.3'],
    ['Form fields, labels and autocomplete', t.v20 ? 'WCAG 1.3.1, 3.3.2, 4.1.2' : 'WCAG 1.3.1, 1.3.5, 3.3.2, 4.1.2'],
    ['Link and button names', 'WCAG 2.4.4, 4.1.2'],
    ['Headings, landmarks and skip links', 'WCAG 1.3.1, 2.4.1'],
    ['Page title and language', 'WCAG 2.4.2, 3.1.1, 3.1.2'],
    ['Keyboard access and focusable content', 'WCAG 2.1.1'],
    ['ARIA roles, states and properties', 'WCAG 4.1.2'],
    [t.v22 ? 'Zoom, text spacing and touch target size' : t.v20 ? 'Zoom and text resizing' : 'Zoom and text spacing', t.v22 ? 'WCAG 1.4.4, 1.4.12, 2.5.8' : t.v20 ? 'WCAG 1.4.4' : 'WCAG 1.4.4, 1.4.12'],
    ['Video, audio and moving content', 'WCAG 1.2.2, 1.4.2, 2.2.2'],
    ['Sorting what we found by how much it blocks visitors', 'Your results are almost ready'],
  ];
}

const reducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const wait = (ms) => new Promise((r) => setTimeout(r, ms));

/** Animated checklist while the scan runs. Returns { finish, stop }. */
function showLoading(url, standard) {
  section.hidden = false;
  section.setAttribute('aria-busy', 'true');
  const steps = scanSteps(standard);
  const host = (() => {
    try {
      return new URL(url).hostname;
    } catch {
      return url;
    }
  })();
  const bar = el('span', { class: 'scan-bar-fill' });
  const items = steps.map(([title, note]) =>
    el('li', { class: 'scan-step' }, [
      el('span', { class: 'scan-step-icon', 'aria-hidden': 'true' }),
      el('span', { class: 'scan-step-text' }, [el('strong', { text: title }), el('small', { text: note })]),
      el('span', { class: 'visually-hidden', 'data-state': '', text: 'waiting' }),
    ]),
  );
  const count = el('span', { class: 'scan-count', text: `0 of ${steps.length} checks` });
  mount.replaceChildren(
    el('div', { class: 'results-card scan-panel' }, [
      el('div', { class: 'scan-head' }, [
        el('span', { class: 'spinner', 'aria-hidden': 'true' }),
        el('div', {}, [el('h2', { class: 'scan-title', text: `Scanning ${host}` }), el('p', { text: `Testing against ${(TARGETS[standard] || TARGETS.wcag22).label}` })]),
        count,
      ]),
      el('div', { class: 'scan-bar', 'aria-hidden': 'true' }, [bar]),
      el('ol', { class: 'scan-steps', 'aria-label': 'What we are checking' }, items),
      el('p', { class: 'visually-hidden', role: 'status' }, [`Scanning ${host}. This usually takes 10 to 30 seconds.`]),
    ]),
  );
  section.scrollIntoView({ behavior: reducedMotion() ? 'auto' : 'smooth', block: 'start' });

  let done = 0;
  let stopped = false;
  const setState = (i, state) => {
    const li = items[i];
    if (!li) return;
    li.dataset.state = state;
    li.lastChild.textContent = state === 'done' ? 'checked' : state === 'active' ? 'checking' : 'waiting';
  };
  const progress = () => {
    bar.style.setProperty('width', `${Math.round((done / steps.length) * 100)}%`);
    count.textContent = `${done} of ${steps.length} checks`;
  };
  setState(0, 'active');
  // Tick through the checklist, holding on the last step until results arrive.
  const timer = setInterval(() => {
    if (stopped || done >= steps.length - 1) return;
    setState(done, 'done');
    done++;
    setState(done, 'active');
    progress();
  }, 1300);

  return {
    panel: mount.firstChild,
    /** Tick through every check but the last, which keeps spinning. */
    async toLastStep() {
      clearInterval(timer);
      const fast = reducedMotion() ? 0 : 90;
      while (done < steps.length - 1) {
        setState(done, 'done');
        done++;
        setState(done, 'active');
        progress();
        if (fast) await wait(fast);
      }
      if (!reducedMotion()) await wait(400);
    },
    stop() {
      stopped = true;
      clearInterval(timer);
    },
  };
}

function showFailure(message) {
  section.setAttribute('aria-busy', 'false');
  const heading = el('h2', { tabindex: '-1', text: 'We could not check that page' });
  mount.replaceChildren(el('div', { class: 'results-card' }, [el('div', { class: 'results-body' }, [heading, el('p', { text: message })])]));
  heading.focus({ preventScroll: true });
}

const plural = (n, word) => `${n.toLocaleString()} ${word}${n === 1 ? '' : 's'}`;
const SEVERITIES = [
  ['critical', 'Critical'],
  ['serious', 'Serious'],
  ['moderate', 'Moderate'],
  ['minor', 'Minor'],
];

/**
 * Trial signup link with the scanned domain carried through, so signup is
 * prefilled and the first monitored scan runs for this site. Keeps any
 * ?plan= picked earlier on this page's URL.
 */
export function trialHref(host) {
  const q = new URLSearchParams();
  if (host) q.set('domain', host.replace(/^www\./, ''));
  const plan = new URLSearchParams(location.search).get('plan');
  if (plan === 'annual' || plan === 'monthly') q.set('plan', plan);
  const qs = q.toString();
  return `/app/signup${qs ? `?${qs}` : ''}`;
}

const IMPACT_LABEL = { critical: 'Critical', serious: 'Serious', moderate: 'Moderate', minor: 'Minor' };
const URGENT = new Set(['critical', 'serious']);
const pageStarted = Date.now();

function ownerTags(issue, pageUrl) {
  return ownerLabels(issue, pageUrl).map((id) => {
    const meta = OWNER_LABELS[id];
    return el('span', { class: `tag tag-owner tag-owner-${id}`, title: meta.hint, text: meta.text });
  });
}

function scoreBlock(score) {
  if (!Number.isInteger(score)) return null;
  const band = score >= 90 ? 'high' : score >= 60 ? 'mid' : 'low';
  const ring = el('div', {
    class: 'score-ring scan-score-ring',
    'data-band': band,
    role: 'img',
    'aria-label': `Accessibility score ${score} out of 100`,
  }, [el('span', { 'aria-hidden': 'true', text: String(score) })]);
  ring.style.setProperty('--pct', String(score));
  return el('div', { class: 'scan-score' }, [
    ring,
    el('div', {}, [
      el('p', { class: 'scan-score-kicker', text: 'Accessibility Score' }),
      el('p', { class: 'scan-score-note', text: 'Out of 100, from the automated checks on this page. It is not a legal compliance score.' }),
    ]),
  ]);
}

/** DIY trial vs a note to the existing contact form. AccessBell does not staff a remediation team. */
function pathSplit(trial, url, { compact = false } = {}) {
  const note = el('p', { class: 'scan-help-note', role: 'status', hidden: true });
  const form = el('form', { class: 'scan-help-form' }, [
    el('label', { for: compact ? 'scan-help-email-2' : 'scan-help-email', text: 'Email' }),
    el('input', {
      id: compact ? 'scan-help-email-2' : 'scan-help-email',
      name: 'email',
      type: 'email',
      autocomplete: 'email',
      required: true,
      maxlength: 254,
      placeholder: 'you@example.com',
    }),
    el('button', { type: 'submit', class: 'btn btn-outline', text: "I'd rather have help" }),
    el('p', { class: 'scan-lead-consent' }, ['Sending this agrees we may reply about a quote or a partner introduction, as described in the ', el('a', { href: '/privacy', text: 'Privacy Policy' }), '.']),
    note,
  ]);
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const button = form.querySelector('button[type="submit"]');
    const email = (form.elements.email.value || '').trim();
    if (!email.includes('@')) {
      note.textContent = 'Enter a valid email address.';
      note.hidden = false;
      form.elements.email.focus();
      return;
    }
    button.disabled = true;
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'Website owner',
          email,
          company: '',
          site: url,
          topic: 'help',
          plan: '',
          domains: '',
          message: `I would rather have help with the accessibility issues on ${url}. Please reply about a quote or a partner introduction. I understand AccessBell does not staff a remediation team and this is not legal help.`,
          website: '',
          consent: true,
          elapsedMs: Date.now() - pageStarted,
        }),
        credentials: 'same-origin',
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || 'Could not send that note.');
      note.textContent = 'Sent. We will reply within one business day. This is not a promise of remediation or a legal outcome.';
      button.remove();
      form.elements.email.setAttribute('readonly', '');
    } catch (err) {
      note.textContent = err.message || 'Could not send that note. You can also use the contact page.';
      button.disabled = false;
    } finally {
      note.hidden = false;
    }
  });
  return el('div', { class: compact ? 'scan-paths scan-paths-compact' : 'scan-paths' }, [
    el('div', { class: 'scan-path' }, [
      el('h3', { text: 'Fix it myself with AccessBell Pro' }),
      compact
        ? null
        : el('p', { text: 'The failing code and a guided fix, for this page and up to 500 pages on the domain. 3-day free trial, then $29 per domain per month or $199 per year.' }),
      el('a', { class: 'btn btn-accent', href: trial, text: 'Fix it myself with AccessBell Pro' }),
    ]),
    el('div', { class: 'scan-path' }, [
      el('h3', { text: "I'd rather have help" }),
      compact
        ? null
        : el('p', { text: 'AccessBell does not staff a remediation team and does not guarantee a legal outcome. Leave your email and we will reply about a quote or whether a partner introduction is available.' }),
      form,
      el('p', { class: 'scan-path-alt' }, ['Or ', el('a', { href: `/contact?topic=help&site=${encodeURIComponent(url)}`, text: 'use the contact form' }), '.']),
    ]),
  ]);
}

// What an unresolved issue can cost. Every figure is published and linked; there is no
// reliable public "average" settlement, so these are ranges and counts, not a prediction.
const RISK_STATS = [
  { value: '$5,000–$20,000', text: 'What ADA website lawsuits commonly settle for, before your own legal fees', source: 'Accessible.org', href: 'https://accessible.org/ada-website-compliance-lawsuit-settlement-amounts/' },
  { value: '$4,000+', text: 'Minimum damages per violation in California under the Unruh Civil Rights Act', source: 'Cal. Civ. Code § 52', href: 'https://leginfo.legislature.ca.gov/faces/codes_displaySection.xhtml?lawCode=CIV&sectionNum=52.' },
  { value: '5,006', text: 'Federal ADA Title III lawsuits filed in the first half of 2026', source: 'Seyfarth Shaw', href: 'https://www.adatitleiii.com/2026/09/2026-mid-year-report-ada-title-iii-federal-lawsuit-numbers-are-climbing/' },
  { value: '64%', text: 'Of companies sued in the first half of 2025 had annual revenue under $25 million', source: 'UsableNet', href: 'https://blog.usablenet.com/2025-midyear-accessibility-lawsuit-report-key-legal-trends' },
];

/** Shown when the page has critical or serious issues: what leaving them unfixed can cost. */
function riskPanel(urgent, url, trial) {
  if (!urgent) return null;
  return el('section', { class: 'scan-risk', 'aria-labelledby': 'scan-risk-title' }, [
    el('span', { class: 'scan-risk-kicker', text: 'Lawsuit risk' }),
    el('h3', { id: 'scan-risk-title', text: `${plural(urgent, 'issue')} on this page can show up in an ADA complaint` }),
    el('p', { text: 'Missing labels, buttons with no name, and pictures with no description come up often. What leaving them unfixed can cost:' }),
    el(
      'ul',
      { class: 'scan-risk-stats' },
      RISK_STATS.map((s) =>
        el('li', {}, [
          el('strong', { text: s.value }),
          el('span', { text: s.text }),
          el('a', { class: 'scan-risk-source', href: s.href, rel: 'noopener noreferrer', target: '_blank' }, [`Source: ${s.source}`, el('span', { class: 'visually-hidden', text: ' (opens in a new tab)' })]),
        ]),
      ),
    ),
    el('div', { class: 'scan-risk-actions' }, [
      el('a', { href: trial, text: 'Find these on every page with a 3-day free trial' }),
      el('a', { href: '/blog/ada-lawsuit-payouts', text: 'See what real ADA cases cost' }),
    ]),
    el('p', { class: 'scan-risk-note', text: 'Figures come from public sources and vary widely by case and state. They are not a prediction for your site and not legal advice.' }),
  ]);
}

/** Plain summary first, then the count and WCAG line. Technical title only when it adds jargon. */
function issueMain(issue) {
  const plain = explainIssue(issue);
  const wcag = wcagSummary(issue.wcag);
  const line = wcag.short ? `${countLabel(issue.count)} · ${wcag.short}` : countLabel(issue.count);
  const extra = wcag.full && wcag.full !== wcag.short;
  return {
    plain,
    node: el('div', { class: 'scan-result-main' }, [
      el('strong', { text: plain.name }),
      el('p', { class: 'scan-result-why', text: plain.why }),
      el('span', { class: 'scan-result-meta', title: extra ? wcag.full : undefined }, [
        line,
        extra ? el('span', { class: 'visually-hidden', text: ` Full list: ${wcag.full}.` }) : null,
      ]),
      plain.technical ? el('span', { class: 'scan-result-tech', text: plain.technical }) : null,
    ]),
  };
}

function failingCode(samples) {
  if (!samples || !samples.length) return null;
  return el('div', { class: 'scan-teaser-code-wrap' }, [
    el('p', { class: 'scan-teaser-code-label', text: 'Code that failed' }),
    el('pre', { class: 'scan-teaser-code' }, [el('code', { text: samples.join('\n') })]),
  ]);
}

/** The results list, then a prompt to start the trial for fixes and monitoring. */
function showResults(r, url, form) {
  section.setAttribute('aria-busy', 'false');
  // The free scan tests one URL. Show which one: the domain plus any path.
  const { host, page } = (() => {
    try {
      const u = new URL(r.finalUrl || url);
      const path = u.pathname.replace(/\/+$/, '');
      return { host: u.hostname, page: u.hostname + path };
    } catch {
      return { host: url, page: url };
    }
  })();
  const total = r.summary?.issues || 0;
  const list = r.issues || [];
  const trial = trialHref(host);
  const oneTimeLink = () =>
    el('a', { class: 'scan-onetime-link', href: `/solutions/page-report?url=${encodeURIComponent(url)}` }, [
      'Prefer no subscription? One-time reports: $19 for this page or $79 for your whole domain',
    ]);
  const v = verdictFor(r.summary);
  const owner = r.summary?.owner || {};
  const secondary = [
    `${(r.summary?.critical || 0).toLocaleString()} critical`,
    `${(owner.lawsuitCommon || 0).toLocaleString()} lawsuit-common`,
  ];
  if (owner.blocksCheckout) secondary.push(`${owner.blocksCheckout.toLocaleString()} blocking checkout`);
  const biggest = list.reduce((n, i) => Math.max(n, i.count || 0), 0);
  const proofCount = el('span', { class: 'scan-proof-count', hidden: true });
  pagesScanned().then((n) => {
    if (n) {
      proofCount.textContent = scannedText(n) + ' · ';
      proofCount.hidden = false;
    }
  });
  const tiles = total
    ? el(
        'ul',
        { class: 'scan-result-sev', 'aria-label': 'How serious the issues are. Critical blocks some visitors, serious means hard to use, moderate gets in the way, and minor is a small snag.' },
        SEVERITIES.map(([key, name]) =>
          el('li', { 'data-sev': key }, [el('strong', { text: String(r.summary[key] || 0) }), el('span', { text: name }), el('small', { text: SEVERITY_HINT[key] })]),
        ),
      )
    : null;
  const verdict = el('div', { class: `scan-verdict scan-verdict-${v.tone}` }, [
    scoreBlock(r.score),
    el('p', { class: 'scan-score-secondary', text: secondary.join(' · ') }),
    el('p', { class: 'scan-verdict-text' }, [el('strong', { text: v.text })]),
    tiles,
    pathSplit(trial, url),
    el('p', { class: 'scan-proof' }, [proofCount, `Accessibility monitoring tool: up to 500 pages on ${host}, with guided fixes. Cancel anytime. 14-day money-back guarantee.`]),
    el('p', { class: 'scan-verdict-alt' }, [oneTimeLink()]),
    biggest > 1
      ? el('p', { class: 'scan-pattern', text: `The same pattern shows up ${biggest.toLocaleString()} times on this page. On a monitored site, component grouping treats a shared template as one fix, so one template fix can clear every page that uses it.` })
      : el('p', { class: 'scan-pattern', text: 'When the same component fails on many pages, Pro groups it. One template fix can clear every page that shares it.' }),
  ]);
  const label = r.standard?.label || 'WCAG';
  const heading = el('h2', { id: 'scan-result-title', tabindex: '-1', text: total ? `${plural(total, 'issue')} on ${page}` : `No automatic issues on ${page}` });
  const kinds = `${list.length.toLocaleString('en-US')} ${list.length === 1 ? 'kind of problem' : 'kinds of problems'}`;
  const lead = total ? `${kinds}, checked against ${label}.` : `Checked against ${label}. Automatic checks do not cover the whole standard.`;
  // One clean page says nothing about the rest of the domain.
  const again = el('button', { type: 'button', class: 'btn btn-outline btn-sm', text: 'Scan another URL' });
  again.addEventListener('click', () => {
    const input = (form || forms[0])?.elements.url;
    if (!input) return;
    input.value = '';
    input.scrollIntoView({ behavior: reducedMotion() ? 'auto' : 'smooth', block: 'center' });
    input.focus({ preventScroll: true });
  });
  const scope = el('div', { class: 'scan-scope' }, [
    el('p', { class: 'scan-scope-title' }, [el('strong', { text: 'You checked 1 page, not the whole site.' })]),
    el('div', { class: 'scan-scope-compare' }, [
      el('div', { class: 'scan-scope-col' }, [
        el('span', { class: 'scan-scope-label', text: 'Free scan' }),
        el('strong', { text: '1 page' }),
        el('span', { text: `Only ${page}` }),
      ]),
      el('div', { class: 'scan-scope-col scan-scope-pro' }, [
        el('span', { class: 'scan-scope-label', text: 'AccessBell Pro' }),
        el('strong', { text: 'The whole site' }),
        el('span', { text: `Up to 500 pages on ${host}, checked every day` }),
      ]),
    ]),
    el('p', { text: 'Checkout, forms, and other pages can have problems this page does not. To fix accessibility issues on the rest of the site, Pro shows what to change and checks those pages every day.' }),
    el('div', { class: 'scan-scope-actions' }, [again]),
    el('p', { class: 'scan-cta-note' }, [
      'The trial covers up to 500 pages on this domain, rescanned every day. Then $29 per domain per month or $199 per year. Cancel before the trial ends and you will not be charged. ',
      el('a', { href: trial, text: `Start your trial for ${host}` }),
      '.',
    ]),
  ]);
  const rows = list.length
    ? el(
        'ol',
        { class: 'scan-result-list' },
        list.map((i) => {
          const main = issueMain(i);
          return el('li', { 'data-sev': i.impact }, [
            main.node,
            el('div', { class: 'scan-result-side' }, [
              el('span', { class: `tag tag-${i.impact}`, text: IMPACT_LABEL[i.impact] || i.impact }),
              ...ownerTags(i, r.finalUrl || url),
              // The most urgent problems get a direct route to a plan that fixes them.
              URGENT.has(i.impact)
                ? el('a', { class: 'scan-fix-link', href: trial }, ['Get the fix', el('span', { class: 'visually-hidden', text: `: ${main.plain.name}. Starts a 3-day free trial with guided fix suggestions for ${host}.` })])
                : null,
            ]),
          ]);
        }),
      )
    : null;
  const moreCount = (r.summary.rulesFailed || 0) - list.length;
  const more = moreCount > 0 ? el('p', { class: 'scan-result-more', text: `Plus ${moreCount} more ${moreCount === 1 ? 'kind of problem' : 'kinds of problems'} not shown in this list.` }) : null;
  const issues = rows ? el('div', { class: 'scan-issues' }, [el('h3', { text: 'What we found' }), rows, more]) : null;
  // Teaser: the most severe issues in full, failing code and fix included.
  // Everything else stays names-only; the full detail is what the reports sell.
  const teaser = (r.teaser || []).length
    ? el('section', { class: 'scan-teaser', 'aria-labelledby': 'scan-teaser-title' }, [
        el('span', { class: 'scan-teaser-kicker', text: 'The biggest problems' }),
        el('h3', { id: 'scan-teaser-title', text: 'What is wrong, and how to fix it' }),
        el('p', { text: 'The most serious issues, with the code and a fix. A free trial includes this for every issue, on every page.' }),
        el(
          'ol',
          { class: 'scan-teaser-list' },
          r.teaser.map((i) =>
            el('li', { 'data-sev': i.impact }, [
              issueMain(i).node,
              el('span', { class: 'scan-teaser-tags' }, [
                el('span', { class: `tag tag-${i.impact}`, text: IMPACT_LABEL[i.impact] || i.impact }),
                ...ownerTags(i, r.finalUrl || url),
              ]),
              failingCode(i.samples),
              i.fix ? el('p', { class: 'scan-teaser-fix' }, [el('strong', { text: 'What to change: ' }), el('span', { text: i.fix })]) : null,
              i.helpUrl ? el('a', { href: i.helpUrl, rel: 'noopener noreferrer', target: '_blank', text: 'Read the guidance' }) : null,
            ]),
          ),
        ),
        el('div', { class: 'scan-teaser-actions' }, [
          el('a', { class: 'btn btn-accent', href: trial, text: 'Fix it myself with AccessBell Pro' }),
          el('a', { class: 'btn btn-outline', href: `/contact?topic=help&site=${encodeURIComponent(url)}`, text: "I'd rather have help" }),
        ]),
      ])
    : null;
  // Email capture shown with the results, never a gate in front of them.
  // Submitting stores the address (app.scan_leads) and emails a summary of
  // these results right away; follow-ups carry a one-click unsubscribe.
  const leadNote = el('p', { class: 'scan-lead-note', role: 'status', hidden: true });
  const leadForm = el('form', { class: 'scan-lead scan-lead-prominent', 'aria-labelledby': 'scan-lead-title' }, [
    el('h3', { id: 'scan-lead-title', text: 'Email me these results' }),
    el('p', { text: 'A copy of this summary, with links to the fixes. Free, and no account needed.' }),
    el('label', { for: 'scan-lead-email', text: 'Email' }),
    el('input', { id: 'scan-lead-email', name: 'email', type: 'email', autocomplete: 'email', required: true, maxlength: 254, placeholder: 'you@example.com', 'aria-describedby': 'scan-lead-consent' }),
    el('button', { type: 'submit', class: 'btn btn-outline btn-sm', text: 'Email me my results' }),
    el('p', { id: 'scan-lead-consent', class: 'scan-lead-consent', text: "We'll email your results and occasional follow-ups; unsubscribe anytime." }),
    leadNote,
  ]);
  leadForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const button = leadForm.querySelector('button[type="submit"]');
    const input = leadForm.elements.email;
    const email = (input.value || '').trim();
    if (!email.includes('@')) {
      leadNote.textContent = 'Enter a valid email address.';
      leadNote.hidden = false;
      input.focus();
      return;
    }
    button.disabled = true;
    try {
      const res = await fetch('/api/scan-lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, url }),
        credentials: 'same-origin',
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || 'Could not save your email.');
      leadNote.textContent = data.emailed === false ? 'Saved. Your results email is on its way shortly.' : 'Sent. Check your inbox for your results.';
      leadForm.querySelector('button[type="submit"]').remove();
      input.setAttribute('readonly', '');
    } catch (err) {
      leadNote.textContent = err.message || 'Could not save your email. Please try again.';
      button.disabled = false;
    } finally {
      leadNote.hidden = false;
    }
  });
  const cta = el('div', { class: 'scan-cta' }, [
    el('h3', { text: total ? 'Get the fix for every issue' : 'Check the rest of your site' }),
    el('ul', {}, [
      el('li', { text: 'The broken code, and a corrected example, for each issue' }),
      el('li', { text: 'The whole site, not just this page: up to 500 pages per domain' }),
      el('li', { text: 'A dated record of what you fixed' }),
      el('li', { text: 'Daily monitoring, so a new page does not bring the problem back' }),
    ]),
    pathSplit(trial, url, { compact: true }),
    el('div', { class: 'scan-cta-actions' }, [oneTimeLink()]),
    el('p', { class: 'scan-cta-note' }, ['3-day free trial, then $29/mo or $199/year per domain. Cancel anytime. 14-day money-back guarantee. One-time reports need no account. Already subscribed? ', el('a', { href: '/app/login', text: 'Log in to your dashboard' }), '.']),
  ]);
  mount.replaceChildren(
    el('div', { class: 'results-card scan-result', role: 'region', 'aria-labelledby': 'scan-result-title' }, [
      el('div', { class: 'scan-result-head' }, [el('span', { class: 'scan-result-kicker', text: 'Free scan results' }), heading, el('p', { text: lead })]),
      verdict,
      scope,
      riskPanel((r.summary?.critical || 0) + (r.summary?.serious || 0), url, trial),
      leadForm,
      issues,
      teaser,
      cta,
    ]),
  );
  heading.focus({ preventScroll: true });
  mount.firstChild.scrollIntoView({ behavior: reducedMotion() ? 'auto' : 'smooth', block: 'start' });
}

fillScanProof();

for (const form of forms) {
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (busy || !mount) return;
    const parsed = normalizeUrl(form.elements.url.value);
    if (parsed.error) {
      setError(form, parsed.error);
      form.elements.url.focus();
      return;
    }
    setError(form, null);
    busy = true;
    const button = form.querySelector('button[type="submit"]');
    button.disabled = true;
    const scan = showLoading(parsed.url, form.elements.standard.value);
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 45000);
    try {
      const res = await fetch('/api/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: parsed.url, standard: form.elements.standard.value, source: location.pathname }),
        credentials: 'same-origin',
        signal: controller.signal,
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || 'The scan could not be completed. Please try again.');
      await scan.toLastStep();
      showResults(data, parsed.url, form);
      trackFreeScan();
    } catch (err) {
      scan.stop();
      showFailure(err.name === 'AbortError' ? 'The page took too long to respond. Please try again later.' : err.message);
    } finally {
      clearTimeout(timer);
      busy = false;
      button.disabled = false;
    }
  });
}
