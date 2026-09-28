// Free accessibility checker on the homepage: submits a URL to /api/scan and
// renders the report with WCAG filters. All data is inserted as text, never HTML.
import { el, mountFilteredReport } from './shared/report-view.js';

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

function showLoading(url) {
  section.hidden = false;
  section.setAttribute('aria-busy', 'true');
  mount.replaceChildren(
    el('div', { class: 'results-card' }, [
      el('div', { class: 'loading' }, [el('span', { class: 'spinner', 'aria-hidden': 'true' }), el('span', { text: `Checking ${url} for accessibility issues...` })]),
    ]),
  );
  section.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function showFailure(message) {
  section.setAttribute('aria-busy', 'false');
  const heading = el('h2', { tabindex: '-1', text: 'We could not check that page' });
  mount.replaceChildren(el('div', { class: 'results-card' }, [el('div', { class: 'results-body' }, [heading, el('p', { text: message })])]));
  heading.focus({ preventScroll: true });
}

function render(r) {
  section.setAttribute('aria-busy', 'false');
  const band = r.score >= 90 ? 'high' : r.score >= 60 ? 'mid' : 'low';
  const ring = el('div', { class: 'score-ring', 'data-band': band, role: 'img', 'aria-label': `Accessibility score ${r.score} out of 100` }, [el('span', { 'aria-hidden': 'true', text: String(r.score) })]);
  ring.style.setProperty('--pct', String(r.score));

  const heading = el('h2', { tabindex: '-1', text: 'Accessibility report' });
  const head = el('div', { class: 'results-head' }, [
    ring,
    el('div', {}, [heading, el('p', { text: r.finalUrl }), el('p', { text: `${r.standard.label} - scanned ${new Date(r.scannedAt).toLocaleString()}` })]),
    el('ul', { class: 'results-stats' }, [
      el('li', {}, [el('strong', { text: String(r.summary.issues) }), el('span', { text: 'Issues' })]),
      el('li', {}, [el('strong', { text: String(r.summary.rulesFailed) }), el('span', { text: 'Checks failed' })]),
      el('li', {}, [el('strong', { text: String(r.summary.rulesPassed) }), el('span', { text: 'Checks passed' })]),
    ]),
  ]);
  const reportBox = el('div', { class: 'results-filtered' });
  const foot = el('div', { class: 'results-foot' }, [
    el('p', { text: 'This free check tests one page with automated rules. Automated testing finds many, but not all, WCAG failures. Monitor up to 25 URLs per domain with unlimited rescans on the Lite plan, $79 per domain per month.' }),
    el('a', { class: 'btn btn-accent', href: '/pricing', text: 'Monitor your whole site' }),
  ]);
  mount.replaceChildren(el('div', { class: 'results-card' }, [head, reportBox, foot]));
  mountFilteredReport(reportBox, r, { level: 3 });
  heading.focus({ preventScroll: true });
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
    showLoading(parsed.url);
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
      render(data);
    } catch (err) {
      showFailure(err.name === 'AbortError' ? 'The page took too long to respond. Please try again later.' : err.message);
    } finally {
      clearTimeout(timer);
      busy = false;
      button.disabled = false;
    }
  });
}
