// Free accessibility checker: submits a URL to /api/scan, runs the checklist
// animation, and just before it finishes asks the visitor to subscribe to see
// the results. The API returns counts only, so the preview shows how many
// issues were found and how severe they are, never which ones.
// All data is inserted as text, never HTML.
import { el } from './shared/report-view.js';

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
  if (!u.hostname.includes('.')) return { error: 'Enter a full domain name, such as example.com.' };
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
    ['Loading the page in a real Chrome browser', 'Runs your scripts so the real, rendered page is tested'],
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
    ['Mapping results to ' + t.label + ' and ranking by severity', 'Your report is almost ready'],
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

/** The subscribe prompt, shown over the checklist on its last step. */
function showLocked(panel, r, url) {
  section.setAttribute('aria-busy', 'false');
  const host = (() => {
    try {
      return new URL(r.finalUrl || url).hostname;
    } catch {
      return url;
    }
  })();
  const total = r.summary?.issues || 0;
  const label = r.standard?.label || 'WCAG';
  const heading = el('h2', { id: 'scan-lock-title', tabindex: '-1', text: total ? 'Subscribe to See Your Results' : 'Your Scan Is Almost Done' });
  const found = total
    ? el('p', { class: 'scan-lock-lead' }, ['We found ', el('strong', { text: plural(total, 'accessibility issue') }), ` on ${host}, tested against ${label}.`])
    : el('p', { class: 'scan-lock-lead' }, [`Our automated checks found no issues on this page of ${host}. Automated testing covers only part of ${label}, so subscribe to scan every page and track what needs a manual check.`]);
  const severity = total
    ? el(
        'ul',
        { class: 'scan-lock-sev', 'aria-label': 'Issues by severity' },
        SEVERITIES.map(([key, name]) => el('li', { 'data-sev': key }, [el('strong', { text: String(r.summary[key] || 0) }), el('span', { text: name })])),
      )
    : null;
  // Placeholder rows, blurred: they stand for the report without revealing anything in it.
  const teaser = total
    ? el(
        'div',
        { class: 'scan-lock-preview', 'aria-hidden': 'true' },
        SEVERITIES.filter(([key]) => r.summary[key] > 0)
          .slice(0, 3)
          .map(([key]) => el('div', { class: 'scan-lock-row', 'data-sev': key }, [el('i'), el('span'), el('b')])),
      )
    : null;
  const card = el('div', { class: 'scan-lock-card' }, [
    el('span', { class: 'scan-lock-kicker', text: total ? 'Report ready' : 'Scan complete' }),
    heading,
    found,
    severity,
    teaser,
    el('p', { text: 'Subscribe to see every issue, where it is on the page, the failing code and how to fix it. Pro also monitors up to 500 pages per domain every day and emails you when something breaks.' }),
    el('div', { class: 'scan-lock-actions' }, [
      el('a', { class: 'btn btn-accent', href: '/app/signup?plan=monthly', text: 'Start 3-day free trial' }),
      el('a', { class: 'btn', href: '/app/signup?plan=annual', text: 'Or pay $199/year' }),
    ]),
    el('p', { class: 'scan-lock-note' }, ['$29/mo per domain after the trial, or $199/year. Already subscribed? ', el('a', { href: '/app/login', text: 'Log in to your dashboard' }), '.']),
  ]);
  panel.classList.add('is-locked');
  panel.append(el('div', { class: 'scan-lock', role: 'region', 'aria-labelledby': 'scan-lock-title' }, [card]));
  heading.focus({ preventScroll: true });
  card.scrollIntoView({ behavior: reducedMotion() ? 'auto' : 'smooth', block: 'center' });
}

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
        body: JSON.stringify({ url: parsed.url, standard: form.elements.standard.value }),
        credentials: 'same-origin',
        signal: controller.signal,
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || 'The scan could not be completed. Please try again.');
      await scan.toLastStep();
      showLocked(scan.panel, data, parsed.url);
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
