// AccessBellFix install and fix list, and the accessibility statement flow.
// Used by the Add Domain wizard and the domain's Settings tab.
import { api, el, busy, setStatus, fmtDate } from './core.js';
import { buildStatement, renderInto, toHtml, esc } from '../shared/statement.js';

export const GUIDE_URL = '/resources/help-center/getting-started/install-accessbellfix';

export const snippetFor = (key) =>
  `<!-- AccessBellFix: applies the accessibility fixes you approve in AccessBell -->\n<script src="${location.origin}/fix.js" data-site="${key}" async></script>`;

export const statementUrl = (key) => `${location.origin}/statement?k=${encodeURIComponent(key)}`;

async function copyText(text, button, status) {
  try {
    await navigator.clipboard.writeText(text);
    const label = button.querySelector('span') || button;
    const before = label.textContent;
    label.textContent = 'Copied';
    setTimeout(() => (label.textContent = before), 2000);
    if (status) setStatus(status, 'success', 'Copied to the clipboard.');
  } catch {
    if (status) setStatus(status, 'error', 'Copy is not available here. Select the text and copy it manually.');
  }
}

// ---------- AccessBellFix: install and validate ----------

export function mountFixInstall(box, { domainId, hostname, siteKey, headingLevel = 'h4' }) {
  const H = headingLevel;
  const code = snippetFor(siteKey);
  const status = el('p', { class: 'status-line', role: 'status', 'aria-live': 'polite' });
  const copy = el('button', { class: 'btn btn-outline btn-sm', type: 'button' }, [el('span', { text: 'Copy code' })]);
  copy.addEventListener('click', () => copyText(code, copy, status));
  const mail = el('a', {
    class: 'btn btn-outline btn-sm',
    href: `mailto:?subject=${encodeURIComponent(`Please add AccessBellFix to ${hostname}`)}&body=${encodeURIComponent(
      `Hi,\n\nPlease paste this code once in the site's global template, just before the closing </head> tag, so it loads on every page of ${hostname}:\n\n${code}\n\nInstall guide: ${location.origin}${GUIDE_URL}\n\nThanks!`,
    )}`,
    text: 'Send to my developer',
  });
  const result = el('p', { class: 'fix-conn', 'data-state': 'unknown' }, [el('span', { class: 'fix-dot', 'aria-hidden': 'true' }), el('span', { text: 'Not checked yet' })]);
  const validate = el('button', { class: 'btn btn-outline btn-sm', type: 'button', text: 'Validate connection' });
  validate.addEventListener(
    'click',
    busy(validate, status, async () => {
      setStatus(status, '', 'Checking your site...');
      const r = await api('domain/fix/verify', { method: 'POST', body: { id: domainId } });
      result.dataset.state = r.connected ? 'ok' : 'off';
      result.lastChild.textContent = r.connected
        ? r.foundInPage
          ? 'Connected: the code is on your home page.'
          : `Connected: the script last loaded ${fmtDate(r.seenAt, true)}.`
        : 'Not connected yet.';
      if (r.connected) document.dispatchEvent(new CustomEvent('accessbellfix:connected', { detail: { domainId } }));
      setStatus(
        status,
        r.connected ? 'success' : 'error',
        r.connected ? 'AccessBellFix is connected.' : r.error ? `We could not check your home page: ${r.error}` : 'We could not find the code on your home page. Check it is saved and published, then try again.',
      );
    }),
  );

  box.replaceChildren(
    el('ol', { class: 'install-steps' }, [
      el('li', {}, [
        el(H, { text: 'Copy the installation code' }),
        el('pre', { class: 'fix-code', tabindex: '0', role: 'region', 'aria-label': 'AccessBellFix installation code' }, [el('code', { text: code })]),
        el('div', { class: 'fix-row' }, [copy, mail]),
      ]),
      el('li', {}, [
        el(H, { text: 'Paste it before the closing </head> tag' }),
        el('p', {}, [
          'Add it once to your site-wide template so it loads on every page, including pages you publish later. ',
          el('a', { href: GUIDE_URL, target: '_blank', rel: 'noopener', text: 'Step-by-step guides for WordPress, Shopify, Wix, Squarespace, Webflow and Google Tag Manager' }),
          '.',
        ]),
      ]),
      el('li', {}, [el(H, { text: 'Validate the connection' }), el('div', { class: 'fix-row fix-row-spread' }, [result, validate])]),
    ]),
    status,
  );
}

// ---------- AccessBellFix: approved fixes ----------

const KIND_HELP = {
  alt: 'Describe what the image shows, for example "Tent pitched by a lake".',
  name: 'Name the control, for example "Search" or "Open menu".',
  lang: 'The main language of your site, for example en or en-US.',
};

export async function mountFixList(box, { domainId, canEdit }) {
  const setup = await api(`domain/fix?id=${encodeURIComponent(domainId)}`);
  const status = el('p', { class: 'status-line', role: 'status', 'aria-live': 'polite' });
  const list = el('div');

  const render = (fixes) => {
    if (!fixes.length) {
      list.replaceChildren(el('p', { class: 'muted', text: 'No fixes yet. Add one below, then AccessBellFix applies it on your site.' }));
      return;
    }
    const rows = fixes.map((f) => {
      const actions = el('td', { class: 'actions' });
      if (canEdit) {
        const toggle = el('button', { class: 'btn btn-outline btn-sm', type: 'button', text: f.enabled ? 'Turn off' : 'Turn on' });
        toggle.addEventListener('click', busy(toggle, status, async () => {
          await api('domain/fix/update', { method: 'POST', body: { id: domainId, fixId: f.id, enabled: !f.enabled } });
          f.enabled = !f.enabled;
          render(fixes);
          setStatus(status, 'success', f.enabled ? 'Fix turned on.' : 'Fix turned off.');
        }));
        const remove = el('button', { class: 'btn btn-outline btn-sm', type: 'button', text: 'Delete' });
        remove.addEventListener('click', busy(remove, status, async () => {
          await api('domain/fix/update', { method: 'POST', body: { id: domainId, fixId: f.id, remove: true } });
          render(fixes.filter((x) => x.id !== f.id));
          fixes.splice(fixes.indexOf(f), 1);
          setStatus(status, 'success', 'Fix deleted.');
        }));
        actions.append(toggle, remove);
      }
      return el('tr', {}, [
        el('td', { text: setup.kinds[f.kind] || f.kind }),
        el('td', {}, [el('code', { text: f.selector })]),
        el('td', { text: f.value }),
        el('td', { text: f.enabled ? 'On' : 'Off' }),
        actions,
      ]);
    });
    list.replaceChildren(
      el('div', { class: 'table-scroll', role: 'region', 'aria-label': 'Approved fixes', tabindex: '0' }, [
        el('table', { class: 'data-table' }, [
          el('caption', { class: 'visually-hidden', text: 'Fixes AccessBellFix applies on your site' }),
          el('thead', {}, [el('tr', {}, ['Fix', 'Element (CSS selector)', 'Text', 'Status', 'Actions'].map((t) => el('th', { scope: 'col', text: t })))]),
          el('tbody', {}, rows),
        ]),
      ]),
    );
  };

  const nodes = [list, status];
  if (canEdit) {
    const kind = el('select', { id: 'fix-kind', name: 'kind' }, Object.entries(setup.kinds).map(([k, v]) => el('option', { value: k, text: v })));
    const selector = el('input', { id: 'fix-selector', name: 'selector', type: 'text', maxlength: '300', autocomplete: 'off', spellcheck: 'false', placeholder: 'img.hero, #search-button', 'aria-describedby': 'fix-selector-help' });
    const value = el('input', { id: 'fix-value', name: 'value', type: 'text', maxlength: '300', autocomplete: 'off', 'aria-describedby': 'fix-value-help' });
    const valueHelp = el('span', { class: 'help', id: 'fix-value-help', text: KIND_HELP.alt });
    const selectorField = el('div', { class: 'field' }, [
      el('label', { for: 'fix-selector', text: 'Element (CSS selector)' }),
      selector,
      el('span', { class: 'help', id: 'fix-selector-help', text: 'Copy it from an issue in the Issues tab, or from your browser\'s developer tools.' }),
    ]);
    kind.addEventListener('change', () => {
      valueHelp.textContent = KIND_HELP[kind.value];
      selectorField.hidden = kind.value === 'lang';
    });
    const submit = el('button', { class: 'btn', type: 'submit', text: 'Add fix' });
    const form = el('form', { class: 'fix-form', novalidate: true }, [
      el('div', { class: 'form-grid cols-2' }, [
        el('div', { class: 'field' }, [el('label', { for: 'fix-kind', text: 'What to fix' }), kind]),
        selectorField,
        el('div', { class: 'field' }, [el('label', { for: 'fix-value', text: 'Text to use' }), value, valueHelp]),
      ]),
      submit,
    ]);
    form.addEventListener('submit', busy(submit, status, async (e) => {
      e.preventDefault();
      const { fix } = await api('domain/fix/add', { method: 'POST', body: { id: domainId, kind: kind.value, selector: selector.value, value: value.value } });
      setup.fixes.push(fix);
      render(setup.fixes);
      selector.value = '';
      value.value = '';
      setStatus(status, 'success', 'Fix added. It applies the next time a page loads.');
    }));
    nodes.push(el('h4', { text: 'Add a fix' }), form);
  }
  render(setup.fixes);
  box.replaceChildren(...nodes);
  return setup;
}

// ---------- Accessibility statement ----------

const ORG_TYPES = [
  ['business', 'Business'],
  ['nonprofit', 'Nonprofit'],
  ['government', 'Government agency'],
  ['education', 'School, college or university'],
  ['other', 'Other organization'],
];
export const STATEMENT_STEPS = ['Organization type', 'Company name', 'Contact info', 'Related policies & links', 'Custom notes', 'Install statement'];
const OPTIONAL = new Set([3, 4]);

/**
 * Six-step statement flow rendered into `box`. Calls onFinish() after the
 * last step, and onExit() when Back is pressed on the first step.
 */
export function mountStatementFlow(box, { domain, siteKey, existing, me, onFinish, onExit, finishLabel = 'Finish' }) {
  const std = domain.settings ? `WCAG ${domain.settings.wcagVersion || '2.2'} Level ${domain.settings.wcagLevel || 'AA'}` : 'WCAG 2.2 Level AA';
  const v = {
    orgType: existing?.orgType || 'business',
    org: existing?.org || '',
    status: existing?.status || 'partial',
    email: existing?.email || me?.user?.email || '',
    phone: existing?.phone || '',
    links: existing?.links?.length ? existing.links.map((l) => ({ ...l })) : [{ label: 'Privacy policy', url: '' }],
    notes: existing?.notes || '',
  };
  let step = 0;
  const status = el('p', { class: 'status-line', role: 'status', 'aria-live': 'polite' });
  const nav = el('ol', { class: 'wiz-steps wiz-steps-sm', 'aria-label': 'Statement steps' });
  const panel = el('div', { class: 'wiz-panel' });
  const back = el('button', { class: 'btn btn-outline', type: 'button', text: 'Back' });
  const next = el('button', { class: 'btn', type: 'button' });
  const skip = el('button', { class: 'btn btn-outline', type: 'button', text: 'Skip' });
  box.replaceChildren(nav, panel, status, el('div', { class: 'dialog-actions' }, [back, skip, next]));

  const field = (id, label, input, help) => el('div', { class: 'field' }, [el('label', { for: id, text: label }), input, help ? el('span', { class: 'help', text: help }) : null]);
  const input = (id, key, attrs = {}) => {
    const i = el('input', { id, type: 'text', value: v[key], ...attrs });
    i.addEventListener('input', () => (v[key] = i.value));
    return i;
  };

  function renderNav() {
    nav.replaceChildren(
      ...STATEMENT_STEPS.map((name, i) =>
        el('li', { class: i < step ? 'is-done' : i === step ? 'is-current' : null, 'aria-current': i === step ? 'step' : null }, [
          el('span', { class: 'wiz-dot', 'aria-hidden': 'true' }),
          el('span', { text: name }),
          i < step ? el('span', { class: 'visually-hidden', text: ' (completed)' }) : null,
        ]),
      ),
    );
  }

  const statementData = () => ({
    ...v,
    site: domain.hostname,
    standardText: std,
    links: v.links.filter((l) => l.label && l.url),
  });

  function body() {
    if (step === 0) {
      return el('fieldset', { class: 'field choice-list' }, [
        el('legend', { text: 'Which best describes your organization?' }),
        ...ORG_TYPES.map(([value, label]) => {
          const r = el('input', { type: 'radio', name: 'orgType', value, checked: v.orgType === value });
          r.addEventListener('change', () => (v.orgType = value));
          return el('label', { class: 'choice' }, [r, el('span', { text: label })]);
        }),
      ]);
    }
    if (step === 1) {
      const statusSet = el('fieldset', { class: 'field choice-list' }, [
        el('legend', { text: 'How accessible is the site today?' }),
        ...[
          ['partial', 'Partially conformant: some content does not meet the standard yet'],
          ['conformant', 'Fully conformant: we have tested it and it meets the standard'],
        ].map(([value, label]) => {
          const r = el('input', { type: 'radio', name: 'status', value, checked: v.status === value });
          r.addEventListener('change', () => (v.status = value));
          return el('label', { class: 'choice' }, [r, el('span', { text: label })]);
        }),
      ]);
      return el('div', {}, [
        field('st-org', 'Organization or company name', input('st-org', 'org', { maxlength: '120', autocomplete: 'organization' })),
        statusSet,
        el('p', { class: 'help', text: `Your statement will reference ${std}, the standard this domain is tested against. Only choose fully conformant if you are confident it is true.` }),
      ]);
    }
    if (step === 2) {
      return el('div', {}, [
        field('st-email', 'Accessibility contact email', input('st-email', 'email', { type: 'email', maxlength: '254', autocomplete: 'email' }), 'People use this to report barriers or ask for another format.'),
        field('st-phone', 'Phone number (optional)', input('st-phone', 'phone', { type: 'tel', maxlength: '40', autocomplete: 'tel' })),
      ]);
    }
    if (step === 3) {
      const rows = el('div', { class: 'link-rows' });
      const draw = () =>
        rows.replaceChildren(
          ...v.links.map((l, i) => {
            const label = el('input', { id: `st-link-label-${i}`, type: 'text', value: l.label, maxlength: '60' });
            label.addEventListener('input', () => (l.label = label.value));
            const url = el('input', { id: `st-link-url-${i}`, type: 'url', value: l.url, maxlength: '500', placeholder: 'https://' });
            url.addEventListener('input', () => (l.url = url.value));
            const remove = el('button', { class: 'btn btn-outline btn-sm', type: 'button', text: 'Remove', 'aria-label': `Remove link ${i + 1}` });
            remove.addEventListener('click', () => {
              v.links.splice(i, 1);
              draw();
            });
            return el('div', { class: 'link-row' }, [field(`st-link-label-${i}`, `Link ${i + 1} name`, label), field(`st-link-url-${i}`, `Link ${i + 1} address`, url), remove]);
          }),
        );
      draw();
      const add = el('button', { class: 'btn btn-outline btn-sm', type: 'button', text: 'Add a link' });
      add.addEventListener('click', () => {
        if (v.links.length < 5) v.links.push({ label: '', url: '' });
        draw();
      });
      return el('div', {}, [el('p', { class: 'help', text: 'Optional. Link related pages, such as your privacy policy, a feedback form or other accessibility information. Up to 5.' }), rows, add]);
    }
    if (step === 4) {
      const notes = el('textarea', { id: 'st-notes', rows: '5', maxlength: '2000', 'aria-describedby': 'st-notes-help' });
      notes.value = v.notes;
      notes.addEventListener('input', () => (v.notes = notes.value));
      return el('div', { class: 'field' }, [
        el('label', { for: 'st-notes', text: 'Custom notes (optional)' }),
        notes,
        el('span', { class: 'help', id: 'st-notes-help', text: 'For example, known limitations and when you plan to fix them, or alternatives you offer. Separate paragraphs with a blank line.' }),
      ]);
    }
    // Install
    const preview = el('div', { class: 'statement-preview' });
    renderInto(preview, buildStatement(statementData()));
    const html = toHtml(buildStatement(statementData()));
    const link = statementUrl(siteKey);
    const copyHtml = el('button', { class: 'btn btn-outline btn-sm', type: 'button' }, [el('span', { text: 'Copy HTML' })]);
    copyHtml.addEventListener('click', () => copyText(html, copyHtml, status));
    const copyLink = el('button', { class: 'btn btn-outline btn-sm', type: 'button' }, [el('span', { text: 'Copy link' })]);
    copyLink.addEventListener('click', () => copyText(link, copyLink, status));
    const download = el('button', { class: 'btn btn-outline btn-sm', type: 'button', text: 'Download HTML' });
    download.addEventListener('click', () => {
      const st = buildStatement(statementData());
      const doc = `<!doctype html>\n<html lang="en">\n<head>\n<meta charset="utf-8">\n<meta name="viewport" content="width=device-width, initial-scale=1">\n<title>${esc(st.title)}</title>\n</head>\n<body>\n<main>\n${toHtml(st)}\n</main>\n</body>\n</html>\n`;
      const a = el('a', { href: URL.createObjectURL(new Blob([doc], { type: 'text/html;charset=utf-8' })), download: `accessibility-statement-${domain.hostname}.html` });
      document.body.append(a);
      a.click();
      setTimeout(() => {
        URL.revokeObjectURL(a.href);
        a.remove();
      }, 0);
    });
    return el('div', {}, [
      el('p', {}, ['Your statement is saved. Use either option below, then link to it from your site footer, for example with the text "Accessibility".']),
      el('ol', { class: 'install-steps' }, [
        el('li', {}, [
          el('h4', { text: 'Option 1: Link to your hosted statement' }),
          el('p', { text: 'It stays up to date automatically, including when your site was last checked.' }),
          el('div', { class: 'fix-row' }, [el('a', { class: 'btn btn-outline btn-sm', href: link, target: '_blank', rel: 'noopener', text: 'Open statement' }), copyLink]),
          el('p', { class: 'help' }, [el('code', { text: link })]),
        ]),
        el('li', {}, [el('h4', { text: 'Option 2: Publish it as a page on your site' }), el('div', { class: 'fix-row' }, [copyHtml, download])]),
      ]),
      el('h4', { text: 'Preview' }),
      preview,
    ]);
  }

  function validate() {
    if (step === 1 && !v.org.trim()) return 'Enter your organization or company name.';
    if (step === 2 && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.email.trim())) return 'Enter a valid contact email address.';
    if (step === 3 && v.links.some((l) => (l.label || l.url) && (!l.label.trim() || !/^https?:\/\/\S+$/i.test(l.url.trim()))))
      return 'Each link needs a name and a full address starting with https://, or remove it.';
    return '';
  }

  function show() {
    renderNav();
    const heading = el('h3', { class: 'wiz-title', tabindex: '-1', text: `${STATEMENT_STEPS[step]}${OPTIONAL.has(step) ? ' (optional)' : ''}` });
    panel.replaceChildren(heading, body());
    next.textContent = step === 5 ? finishLabel : step === 4 ? 'Save and continue' : 'Next';
    skip.hidden = !OPTIONAL.has(step);
    back.hidden = step === 5;
    setStatus(status, '', '');
    heading.focus();
  }

  back.addEventListener('click', () => {
    if (step === 0) return onExit?.();
    step--;
    show();
  });
  skip.addEventListener('click', () => {
    if (step === 3) v.links = [];
    if (step === 4) v.notes = '';
    next.click();
  });
  next.addEventListener(
    'click',
    busy(next, status, async () => {
      const problem = validate();
      if (problem) throw new Error(problem);
      if (step === 5) return onFinish?.();
      if (step === 4) {
        await api('domain/statement', { method: 'POST', body: { id: domain.id, statement: { ...v, links: v.links.filter((l) => l.label || l.url) } } });
      }
      step++;
      show();
    }),
  );
  show();
}


// ---------- PageAssist toolbar (Settings tab) ----------

/** Turn the visitor toolbar on or off and choose its corner. Admins and owners can change it. */
export async function mountToolbar(box, { domainId, canEdit, fixConnected }) {
  const { toolbar } = await api(`domain/toolbar?id=${encodeURIComponent(domainId)}`);
  const status = el('p', { class: 'status-line', role: 'status', 'aria-live': 'polite' });
  const enabled = el('input', { type: 'checkbox', id: 'pa-enabled', checked: toolbar.enabled || undefined, disabled: !canEdit || undefined });
  const position = el('select', { id: 'pa-position', disabled: !canEdit || undefined }, [
    el('option', { value: 'right', text: 'Bottom right', selected: toolbar.position !== 'left' || undefined }),
    el('option', { value: 'left', text: 'Bottom left', selected: toolbar.position === 'left' || undefined }),
  ]);
  const save = el('button', { class: 'btn', type: 'submit', text: 'Save toolbar settings', disabled: !canEdit || undefined });
  const form = el('form', { class: 'toolbar-form', novalidate: true }, [
    el('label', { class: 'check-inline', for: 'pa-enabled' }, [enabled, 'Show the PageAssist toolbar on my site']),
    el('div', { class: 'field' }, [el('label', { for: 'pa-position', text: 'Position' }), position]),
    save,
    status,
  ]);
  form.addEventListener(
    'submit',
    busy(save, status, async () => {
      const r = await api('domain/toolbar', { method: 'POST', body: { id: domainId, enabled: enabled.checked, position: position.value } });
      setStatus(
        status,
        'success',
        r.toolbar.enabled
          ? fixConnected
            ? 'Saved. The toolbar appears on your site the next time a page loads.'
            : 'Saved. The toolbar appears once the AccessBellFix snippet is installed on your site.'
          : 'Saved. The toolbar is turned off.',
      );
    }),
  );
  box.replaceChildren(
    form,
    el('p', { class: 'muted toolbar-note' }, [
      'The toolbar changes how your site looks for the visitor who uses it. It does not fix your code or make your site conform to WCAG on its own, so keep fixing the issues AccessBell finds. ',
      el('a', { href: '/resources/help-center/domains/pageassist-toolbar', text: 'About the toolbar' }),
    ]),
    canEdit ? null : el('p', { class: 'muted', text: 'Only admins and the owner can change these settings.' }),
  );
}
