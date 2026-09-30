// Free PDF accessibility checker. Reads the chosen file in the browser and runs
// the same checks as AccessBell's Documents tab; nothing is uploaded.
import { ICONS } from '../lib/icons.js';

const MAX_BYTES = 100 * 1024 * 1024;
const IMPACT = { critical: 'Critical', serious: 'Serious', moderate: 'Moderate', minor: 'Minor' };

const SVG_NS = 'http://www.w3.org/2000/svg';
function icon(name) {
  const svg = document.createElementNS(SVG_NS, 'svg');
  for (const [k, v] of Object.entries({ viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': '1.8', 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'aria-hidden': 'true', focusable: 'false' })) svg.setAttribute(k, v);
  svg.innerHTML = ICONS[name];
  return svg;
}

function el(tag, attrs = {}, children = []) {
  const node = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (v === undefined || v === null || v === false) continue;
    if (k === 'text') node.textContent = v;
    else if (k === 'on') for (const [evt, fn] of Object.entries(v)) node.addEventListener(evt, fn);
    else node.setAttribute(k, v === true ? '' : String(v));
  }
  for (const child of [].concat(children)) if (child) node.append(child);
  return node;
}

const plural = (n, word) => `${n.toLocaleString()} ${word}${n === 1 ? '' : 's'}`;
const size = (b) => (b > 1048576 ? `${(b / 1048576).toFixed(1)} MB` : `${Math.max(1, Math.round(b / 1024))} KB`);

const root = document.querySelector('[data-pdf-checker]');
if (root) {
  const wcag = JSON.parse(root.dataset.wcag || '{}');
  const input = root.querySelector('[data-file]');
  const drop = root.querySelector('[data-drop]');
  const status = root.querySelector('[data-status]');
  const results = root.querySelector('[data-results]');
  let audit;

  const say = (text) => {
    status.textContent = '';
    requestAnimationFrame(() => (status.textContent = text));
  };

  const show = (nodes) => {
    results.replaceChildren(...nodes.filter(Boolean));
    results.hidden = false;
  };

  const fail = (message) => {
    show([el('p', { class: 'notice notice-error', role: 'alert', text: message })]);
    say(message);
  };

  function report(file, r, CHECKS) {
    const n = r.issues.length;
    const summary = n
      ? `${plural(n, 'issue')} found in ${file.name}. ${r.issues.filter((i) => i.impact === 'critical').length} critical.`
      : `No automated issues found in ${file.name}.`;
    const fact = (label, value) => [el('dt', { text: label }), el('dd', { text: value })];

    const issues = n
      ? el('ol', { class: 'pdfc-issues' },
          r.issues.map((i) =>
            el('li', {}, [
              el('div', { class: 'pdfc-issue-head' }, [el('h4', { text: i.title }), el('span', { class: `tag tag-${i.impact}`, text: IMPACT[i.impact] })]),
              el('p', { text: i.detail }),
              el('p', { class: 'pdfc-wcag' }, [
                'WCAG ',
                ...i.wcag.flatMap((sc, k) => [k ? ', ' : '', wcag[sc] ? el('a', { href: wcag[sc], text: sc }) : sc]),
              ]),
              el('p', {}, [el('strong', { text: 'How to fix: ' }), i.fix.replace(/ AccessBell can (add|set) (it|this) for you\.$/, '')]),
            ]),
          ),
        )
      : null;

    show([
      el('div', { class: `pdfc-summary ${n ? 'has-issues' : 'is-clean'}` }, [
        icon(n ? 'alert' : 'check-circle'),
        el('div', {}, [el('h3', { tabindex: '-1', text: summary }), el('p', { text: n ? 'Fix the critical issues first. Each one links to the WCAG success criterion it affects.' : 'Now review the checklist below by hand. Automated checks cannot test reading order, alt text quality or contrast.' })]),
      ]),
      el('dl', { class: 'pdfc-facts' }, [
        ...fact('File', `${file.name} (${size(file.size)})`),
        ...fact('Pages', String(r.pages)),
        ...fact('Title', r.title || 'None'),
        ...fact('Language', r.lang || 'None'),
        ...fact('Tagged', r.tagged ? 'Yes' : 'No'),
        ...fact('PDF/UA identifier', r.pdfua ? 'Declared' : 'Not declared'),
        ...fact('Form fields', r.formFields.total ? `${r.formFields.total} (${r.formFields.unlabeled} unlabeled)` : 'None'),
      ]),
      issues ? el('h3', { text: `Issues (${n})` }) : null,
      issues,
      r.passes.length
        ? el('details', { class: 'pdfc-passes', open: !n || undefined }, [
            el('summary', { text: `Passed checks (${r.passes.length})` }),
            el('ul', {}, r.passes.map((p) => el('li', {}, [icon('check'), CHECKS[p]?.label || p]))),
          ])
        : null,
      el('div', { class: 'pdfc-next' }, [
        el('p', {}, [
          el('strong', { text: 'Have more PDFs? ' }),
          'AccessBell Pro finds every PDF linked from your website, checks each one and fixes the title and language for you.',
        ]),
        el('div', { class: 'pdfc-next-actions' }, [
          el('a', { class: 'btn btn-green', href: '/app/signup', text: 'Start 3-day free trial' }),
          el('button', { class: 'btn btn-outline', type: 'button', text: 'Check another PDF', on: { click: () => input.click() } }),
        ]),
      ]),
    ]);
    say(summary);
    results.querySelector('h3')?.focus();
  }

  async function check(file) {
    if (!file) return;
    if (!/\.pdf$/i.test(file.name) && file.type !== 'application/pdf') return fail('That file is not a PDF. Choose a file that ends in .pdf.');
    if (file.size > MAX_BYTES) return fail('That PDF is larger than 100 MB. Try a smaller file.');
    show([el('p', { class: 'pdfc-loading', text: `Checking ${file.name}…` })]);
    say(`Checking ${file.name}`);
    try {
      audit ||= await import('../../server/pdf-audit.js');
      const r = await audit.auditPdf(new Uint8Array(await file.arrayBuffer()));
      report(file, r, audit.PDF_CHECKS);
    } catch (err) {
      fail(err?.expose ? `${err.message} It may be damaged or not a real PDF.` : 'Something went wrong while checking this PDF. Please try another file.');
    }
  }

  input.addEventListener('change', () => {
    check(input.files[0]);
    input.value = '';
  });
  for (const evt of ['dragenter', 'dragover']) {
    drop.addEventListener(evt, (e) => {
      e.preventDefault();
      drop.classList.add('is-over');
    });
  }
  for (const evt of ['dragleave', 'drop']) drop.addEventListener(evt, () => drop.classList.remove('is-over'));
  drop.addEventListener('drop', (e) => {
    e.preventDefault();
    check(e.dataTransfer?.files?.[0]);
  });
}
