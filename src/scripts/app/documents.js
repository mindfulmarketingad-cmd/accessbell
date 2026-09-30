// Documents tab: PDFs linked from the domain's pages, their accessibility
// checks, and a fixed copy for the issues that can be fixed safely (title,
// language, title display). Loads the first time the tab is shown.
import { api, el, icon, fmtDate, busy, can, setStatus, pool } from './core.js';
import { CRITERIA } from '../../../server/wcag-criteria.js';

const IMPACT = { critical: 'Critical', serious: 'Serious', moderate: 'Moderate', minor: 'Minor' };
const CHECKS = {
  'pdf-untagged': 'Tagged for screen readers',
  'pdf-image-only': 'Real text, not scanned images',
  'pdf-figure-alt': 'Figures have alternative text',
  'pdf-encrypted': 'Security settings allow screen readers',
  'pdf-title': 'Has a document title',
  'pdf-lang': 'Has a document language',
  'pdf-form-labels': 'Form fields are labeled',
  'pdf-display-title': 'Viewer shows the title',
  'pdf-tab-order': 'Tab order follows the structure',
  'pdf-bookmarks': 'Long document has bookmarks',
};
const kebab = (s) => s.toLowerCase().replace(/[()]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const criterionPath = (sc) => `/resources/wcag/${sc.replace(/\./g, '-')}-${kebab(CRITERIA[sc]?.name || sc)}`;
const fileName = (url) => {
  try {
    return decodeURIComponent(new URL(url).pathname.split('/').pop() || url);
  } catch {
    return url;
  }
};
const size = (b) => (b === null || b === undefined ? '' : b > 1048576 ? `${(b / 1048576).toFixed(1)} MB` : `${Math.max(1, Math.round(b / 1024))} KB`);
const plural = (n, word) => `${n.toLocaleString()} ${word}${n === 1 ? '' : 's'}`;

function statusCell(d) {
  if (d.status === 'pending') return el('span', { class: 'muted', text: 'Not checked yet' });
  if (d.status === 'failed') return el('span', { class: 'tag tag-serious', text: 'Could not check' });
  if (!d.issuesCount) return el('span', { class: 'tag tag-pass' }, [icon('check'), 'Passed']);
  return el('span', { class: `tag tag-${d.worst || 'serious'}`, text: plural(d.issuesCount, 'issue') });
}

function download(bytes, name) {
  const a = el('a', { href: URL.createObjectURL(new Blob([bytes], { type: 'application/pdf' })), download: name, hidden: true, text: name });
  document.body.append(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(a.href), 1000);
}

export function mountDocuments({ panel, box, domainId, me }) {
  let loaded = false;
  let docs = [];
  const status = el('p', { class: 'status-line', role: 'status', 'aria-live': 'polite' });
  const detail = el('section', { class: 'vault-detail doc-detail', 'aria-live': 'polite' });
  const editable = can(me, 'member');

  async function refresh() {
    docs = (await api(`domain/documents?id=${encodeURIComponent(domainId)}`)).documents;
    render();
  }

  async function checkOne(id) {
    const r = await api('document/scan', { method: 'POST', body: { id } });
    docs = docs.map((d) => (d.id === id ? { ...d, ...r.document } : d));
    return r.document;
  }

  // ---------- Fix a PDF ----------
  function fixForm(d) {
    const title = el('input', { id: 'doc-title', type: 'text', maxlength: '300', value: d.title || fileName(d.url).replace(/\.pdf$/i, '').replace(/[-_]+/g, ' ') });
    const lang = el('input', { id: 'doc-lang', type: 'text', maxlength: '20', value: d.lang || document.documentElement.lang || 'en', 'aria-describedby': 'doc-lang-hint', spellcheck: 'false' });
    const pick = el('input', { id: 'doc-file', type: 'file', accept: 'application/pdf,.pdf' });
    const go = el('button', { class: 'btn btn-accent', type: 'submit' }, [icon('download'), 'Download fixed PDF']);
    const note = el('p', { class: 'status-line', role: 'status', 'aria-live': 'polite' });
    const pickWrap = el('div', { class: 'field' }, [
      el('label', { for: 'doc-file', text: 'Your copy of the PDF (optional)' }),
      el('p', { class: 'el-fix-hint', id: 'doc-file-hint', text: 'Leave empty to use the file on your website. Choose a file if the PDF is larger than 3 MB or is not public.' }),
      pick,
    ]);
    pick.setAttribute('aria-describedby', 'doc-file-hint');
    const form = el('form', { class: 'vault-form', novalidate: true }, [
      el('div', { class: 'field' }, [el('label', { for: 'doc-title', text: 'Document title' }), title]),
      el('div', { class: 'field' }, [
        el('label', { for: 'doc-lang', text: 'Language' }),
        el('p', { class: 'el-fix-hint', id: 'doc-lang-hint', text: 'A language code, such as en, en-US or es.' }),
        lang,
      ]),
      pickWrap,
      go,
      note,
    ]);
    form.addEventListener(
      'submit',
      busy(go, note, async () => {
        if (!title.value.trim()) throw new Error('Enter a document title.');
        let bytes;
        let name = fileName(d.url);
        if (pick.files?.[0]) {
          bytes = new Uint8Array(await pick.files[0].arrayBuffer());
          name = pick.files[0].name;
        } else {
          try {
            const f = await api(`document/file?id=${encodeURIComponent(d.id)}`);
            bytes = Uint8Array.from(atob(f.base64), (c) => c.charCodeAt(0));
            name = f.name;
          } catch (err) {
            pick.focus();
            throw new Error(`${err.message.replace(/\.$/, '')}. Choose your copy of the PDF above, then try again.`);
          }
        }
        setStatus(note, '', 'Preparing your fixed PDF...');
        const { remediatePdf } = await import('../../../server/pdf-audit.js');
        const fixed = await remediatePdf(bytes, { title: title.value, lang: lang.value });
        download(fixed, name.replace(/\.pdf$/i, '') + '-accessible.pdf');
        setStatus(note, 'success', 'Fixed copy downloaded. Replace the file on your website with it, then select Check again.');
      }),
    );
    return form;
  }

  function showDetail(d) {
    const issues = d.issues || [];
    const checked = d.status === 'done';
    const autoFixable = issues.some((i) => i.autoFix);
    const h = el('h3', { tabindex: '-1', text: fileName(d.url) });
    const recheck = el('button', { class: 'btn btn-outline btn-sm', type: 'button' }, [icon('refresh'), checked || d.status === 'failed' ? 'Check again' : 'Check now']);
    recheck.addEventListener(
      'click',
      busy(recheck, status, async () => {
        await checkOne(d.id);
        render();
        showDetail((await api(`document?id=${encodeURIComponent(d.id)}`)).document);
      }),
    );
    detail.replaceChildren(
      ...[
        el('div', { class: 'vault-detail-head' }, [h, el('div', { class: 'row-actions' }, [editable ? recheck : null, el('button', { class: 'btn btn-sm btn-outline', type: 'button', text: 'Close', on: { click: () => detail.replaceChildren() } })])]),
        el('p', {}, [el('a', { href: d.url, target: '_blank', rel: 'noopener noreferrer' }, [d.url, el('span', { class: 'visually-hidden', text: ' (opens in a new tab)' })])]),
        d.foundOn ? el('p', { class: 'muted', text: `Linked from ${d.foundOn}` }) : null,
        d.status === 'failed' ? el('p', { class: 'notice', text: d.error || 'The PDF could not be checked.' }) : null,
        d.status === 'pending' ? el('p', { class: 'muted', text: 'This PDF has not been checked yet.' }) : null,
        checked
          ? el('dl', { class: 'record-facts doc-facts' }, [
              el('dt', { text: 'Pages' }), el('dd', { text: String(d.pages ?? '-') }),
              el('dt', { text: 'Size' }), el('dd', { text: size(d.bytes) || '-' }),
              el('dt', { text: 'Title' }), el('dd', { text: d.title || 'None' }),
              el('dt', { text: 'Language' }), el('dd', { text: d.lang || 'None' }),
              el('dt', { text: 'Tagged' }), el('dd', { text: d.tagged ? 'Yes' : 'No' }),
              el('dt', { text: 'Last checked' }), el('dd', { text: fmtDate(d.checkedAt, true) }),
            ])
          : null,
        checked ? el('h4', { text: issues.length ? `Issues (${issues.length})` : 'No issues found' }) : null,
        checked && issues.length
          ? el(
              'ul',
              { class: 'doc-issues' },
              issues.map((i) =>
                el('li', {}, [
                  el('div', { class: 'doc-issue-head' }, [el('strong', { text: i.title }), el('span', { class: `tag tag-${i.impact}`, text: IMPACT[i.impact] || i.impact })]),
                  el('p', { text: i.detail }),
                  el('p', { class: 'doc-wcag' }, [
                    'WCAG ',
                    ...i.wcag.flatMap((sc, k) => [k ? ', ' : '', CRITERIA[sc] ? el('a', { href: criterionPath(sc), text: `${sc} ${CRITERIA[sc].name}` }) : sc]),
                  ]),
                  el('p', {}, [el('strong', { text: 'How to fix: ' }), i.fix]),
                ]),
              ),
            )
          : null,
        checked && d.passes?.length
          ? el('details', { class: 'doc-passes' }, [
              el('summary', { text: `Passed checks (${d.passes.length})` }),
              el('ul', {}, d.passes.map((p) => el('li', {}, [icon('check'), CHECKS[p] || p]))),
            ])
          : null,
        checked && editable
          ? el('section', { class: 'doc-fix' }, [
              el('h4', { text: 'Fix this PDF' }),
              el('p', {
                text: autoFixable
                  ? 'AccessBell can fix the document title, language and title display for you. Your file is fixed in your browser; nothing about its content changes.'
                  : 'You can still set or update the title and language. Tagging, alt text and text recognition need the original file or Adobe Acrobat: follow "How to fix" above.',
              }),
              fixForm(d),
            ])
          : null,
      ].filter(Boolean),
    );
    h.focus({ preventScroll: true });
    detail.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function addForm() {
    const url = el('input', { id: 'doc-add', type: 'text', inputmode: 'url', placeholder: 'https://example.com/files/menu.pdf', maxlength: '2048' });
    const add = el('button', { class: 'btn', type: 'submit', text: 'Add PDF' });
    const form = el('form', { class: 'inline-form doc-add', novalidate: true }, [
      el('div', { class: 'field' }, [el('label', { for: 'doc-add', text: 'Add a PDF by address' }), url]),
      add,
    ]);
    form.addEventListener(
      'submit',
      busy(add, status, async () => {
        const r = await api('domain/documents/add', { method: 'POST', body: { id: domainId, url: url.value } });
        url.value = '';
        await refresh();
        setStatus(status, 'success', `Added ${fileName(r.document.url)}. Checking it now...`);
        await checkOne(r.document.id);
        render();
        setStatus(status, 'success', `Checked ${fileName(r.document.url)}.`);
      }),
    );
    return form;
  }

  function render() {
    const checkAll = el('button', { class: 'btn btn-accent', type: 'button' }, [icon('scan'), 'Check all PDFs']);
    checkAll.addEventListener(
      'click',
      busy(checkAll, status, async () => {
        const todo = docs.filter((d) => d.status !== 'done' || !d.checkedAt || Date.now() - new Date(d.checkedAt).getTime() > 3600_000);
        const list = todo.length ? todo : docs;
        await pool(list, 2, (d) => checkOne(d.id), (done) => setStatus(status, '', `Checking ${done} of ${plural(list.length, 'PDF')}...`));
        render();
        const withIssues = docs.filter((d) => d.issuesCount).length;
        setStatus(status, 'success', `Checked ${plural(list.length, 'PDF')}. ${withIssues ? `${plural(withIssues, 'PDF')} need attention.` : 'No issues found.'}`);
      }),
    );
    const withIssues = docs.filter((d) => d.status === 'done' && d.issuesCount).length;
    const pending = docs.filter((d) => d.status === 'pending').length;
    const table = docs.length
      ? el('div', { class: 'table-wrap doc-table-wrap', tabindex: '0', role: 'region', 'aria-label': 'PDF documents' }, [
          el('table', { class: 'data-table doc-table' }, [
            el('caption', { class: 'visually-hidden', text: 'PDF documents found on this domain' }),
            el('thead', {}, [el('tr', {}, ['Document', 'Result', 'Pages', 'Last checked', 'Details'].map((t) => el('th', { scope: 'col', text: t })))]),
            el(
              'tbody',
              {},
              docs.map((d) => {
                const open = el('button', { class: 'btn btn-sm btn-outline', type: 'button' }, ['View', el('span', { class: 'visually-hidden', text: ` ${fileName(d.url)}` })]);
                open.addEventListener(
                  'click',
                  busy(open, status, async () => showDetail((await api(`document?id=${encodeURIComponent(d.id)}`)).document)),
                );
                return el('tr', {}, [
                  el('td', {}, [el('span', { class: 'doc-name' }, [icon('doc'), fileName(d.url)]), el('span', { class: 'doc-url muted', text: d.url.replace(/^https?:\/\//, '') })]),
                  el('td', {}, [statusCell(d)]),
                  el('td', { text: d.pages ? String(d.pages) : '-' }),
                  el('td', { text: d.checkedAt ? fmtDate(d.checkedAt) : '-' }),
                  el('td', {}, [open]),
                ]);
              }),
            ),
          ]),
        ])
      : el('div', { class: 'empty-state empty-sm' }, [
          el('h3', { text: 'No PDFs found yet' }),
          el('p', { text: 'PDFs linked from your pages appear here after your next scan. You can also add one by its address.' }),
        ]);
    box.replaceChildren(
      ...[
        el('div', { class: 'doc-summary' }, [
          el('p', { class: 'muted', text: docs.length ? `${plural(docs.length, 'PDF')} found. ${withIssues} with issues, ${pending} not checked yet.` : '' }),
          editable && docs.length ? checkAll : null,
        ]),
        status,
        table,
        editable ? addForm() : null,
        detail,
      ].filter(Boolean),
    );
  }

  async function show() {
    if (loaded) return;
    loaded = true;
    try {
      await refresh();
    } catch (err) {
      loaded = false;
      box.replaceChildren(el('p', { class: 'notice', text: /database update/.test(err.message) ? 'PDF checks are being set up for your account. Please check back shortly or contact support.' : err.message }));
    }
  }

  if (!panel.hidden) show();
  new MutationObserver(() => {
    if (!panel.hidden) show();
  }).observe(panel, { attributes: true, attributeFilter: ['hidden'] });
}
