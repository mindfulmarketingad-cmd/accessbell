// Issue details: one rule across a domain, with its failed and fixed elements.
import { api, boot, el, icon, qs, fmtDate, busy, can, setStatus } from './core.js';
import { initTabs } from './tabs.js';
import { codeBlock } from './code-block.js';
import { fixExample } from '../shared/fix-examples.js';
import { affectedBy } from '../shared/affected.js';
import { issueVisual } from '../shared/issue-visuals.js';
import { ELEMENT_FIXES, correctedHtml } from '../shared/element-fix.js';
import { CRITERIA } from '../../../server/wcag-criteria.js';

const me = await boot();
const domainId = qs('id');
const ruleId = qs('rule');
const $ = (s) => document.querySelector(s);
const plural = (n, word) => `${n.toLocaleString()} ${word}${n === 1 ? '' : 's'}`;
const IMPACT = {
  critical: ['Critical', 'Blocks some people from using the page'],
  serious: ['Serious', 'Makes the page hard to use for some people'],
  moderate: ['Moderate', 'Causes difficulty for some people'],
  minor: ['Minor', 'An annoyance for some people'],
};
// Issues AccessBellFix can fix, and which kind of fix they need.
const FIXABLE = {
  'image-alt': 'alt', 'input-image-alt': 'alt', 'role-img-alt': 'alt', 'svg-img-alt': 'alt', 'area-alt': 'alt',
  'button-name': 'name', 'input-button-name': 'name', 'link-name': 'name', 'select-name': 'name', 'aria-command-name': 'name',
  'html-has-lang': 'lang', 'html-lang-valid': 'lang',
  // Fields and widgets are named with aria-label, which AccessBellFix applies as a 'name' fix.
  label: 'name', 'aria-input-field-name': 'name', 'aria-toggle-field-name': 'name', 'aria-meter-name': 'name',
  'aria-progressbar-name': 'name', 'aria-tooltip-name': 'name', 'aria-dialog-name': 'name', 'summary-name': 'name', 'object-alt': 'name',
};
const kebab = (s) => s.toLowerCase().replace(/[()]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const criterionPath = (sc) => `/resources/wcag/${sc.replace(/\./g, '-')}-${kebab(CRITERIA[sc]?.name || sc)}`;

const selectTab = initTabs($('[data-tabs]'));
let data;
/** Is AccessBellFix running on this site? Unknown (null) until checked. */
let fixConnected = null;

const stat = (label, value) => el('div', { class: 'stat-card' }, [el('h3', { text: label }), value]);
const pills = (items) => el('ul', { class: 'pill-list' }, items.map((x) => el('li', {}, [x])));

function renderStats() {
  const { issue } = data;
  const impact = IMPACT[issue.impact];
  const criteria = (issue.wcag || []).filter((w) => CRITERIA[w.sc]);
  const levels = [...new Set(criteria.map((w) => w.level).filter(Boolean))];
  const share = data.share === null ? 'n/a' : `${(data.share * 100).toFixed(data.share < 0.1 ? 1 : 0)}% of issues`;
  $('[data-stats]').replaceChildren(
    stat('Pages affected', el('p', { class: 'stat-value', text: plural(data.pages, 'page') })),
    stat(issue.kind === 'review' ? 'Elements to check' : 'Failed elements', el('p', { class: 'stat-value', text: plural(data.elements, 'element') })),
    stat('Share of all issues', el('p', { class: 'stat-value', text: share })),
    stat(
      'Severity level',
      issue.kind === 'review'
        ? el('p', {}, [el('span', { class: 'chip chip-warn' }, [icon('eye'), 'Needs review'])])
        : impact
          ? el('div', {}, [el('span', { class: `tag tag-${issue.impact}`, text: impact[0] }), el('p', { class: 'stat-note', text: impact[1] })])
          : el('p', { text: 'Not rated' }),
    ),
    stat('Who is most affected', pills(affectedBy(criteria).map((g) => el('span', { class: 'pill', text: g })))),
    stat(
      'WCAG success criteria',
      pills([
        ...levels.map((l) => el('span', { class: 'pill', text: `Level ${l}` })),
        ...criteria.map((w) => el('a', { class: 'pill pill-link', href: criterionPath(w.sc), text: `${w.sc}: ${CRITERIA[w.sc].name}` })),
      ]),
    ),
  );
}

function renderDescription() {
  const { issue } = data;
  const ex = fixExample(issue.id);
  const guidance =
    issue.helpUrl && issue.helpUrl.startsWith('https://')
      ? el('a', { href: issue.helpUrl, target: '_blank', rel: 'noopener noreferrer', text: 'Detailed guidance for this rule (opens in a new tab)' })
      : null;
  const criteria = (issue.wcag || []).filter((w) => CRITERIA[w.sc]);
  $('[data-desc]').replaceChildren(
    el('section', { class: 'desc-step' }, [
      el('h3', { text: '1. What does this mean?' }),
      el('div', { class: 'desc-card' }, [
        el('p', { text: issue.description || issue.title }),
        issueVisual({ id: issue.id, shot: data.shot }, { where: data.shotUrl ? data.shotUrl.replace(/^https?:\/\//, '') : undefined }),
        issue.kind === 'review'
          ? el('p', { text: 'Automated testing could not decide whether these elements pass, so a person needs to check each one. They are not counted as failures.' })
          : null,
        criteria.length
          ? el('p', {}, [
              'This relates to ',
              ...criteria.flatMap((w, i) => [i ? (i === criteria.length - 1 ? ' and ' : ', ') : '', el('a', { href: criterionPath(w.sc), text: `WCAG ${w.sc} ${CRITERIA[w.sc].name}` })]),
              '.',
            ])
          : null,
      ]),
    ]),
    el('section', { class: 'desc-step' }, [
      el('h3', {}, ['2. How to ', el('span', { class: 'accent-text', text: 'solve it' })]),
      el('div', { class: 'desc-card' }, [
        ex
          ? el('ol', { class: 'fix-steps' }, ex.steps.map(([t, d]) => el('li', {}, [el('strong', { text: `${t}: ` }), d])))
          : el('p', { text: issue.fix || 'Follow the detailed guidance linked below.' }),
        ex ? codeBlock(ex.code, 'Correct markup solutions', 'good') : null,
        ex?.bad ? codeBlock(ex.bad, 'Incorrect markup solutions', 'bad') : null,
        guidance ? el('p', {}, [guidance]) : null,
      ]),
    ]),
  );
}

// ---------- Failed and fixed elements ----------

let fixSeq = 0;
let installDialog;

/** Shown when someone selects Fix now before AccessBellFix is installed on their site. */
function installPrompt({ returnTo, onCopy }) {
  if (!installDialog) {
    const copyInstead = el('button', { class: 'btn btn-outline', type: 'button', text: 'Copy the code fix instead' });
    const later = el('button', { class: 'btn btn-outline', type: 'button', text: 'Not now' });
    const node = el('dialog', { class: 'dialog install-dialog', 'aria-labelledby': 'install-title', 'aria-describedby': 'install-text' }, [
      el('div', { class: 'dialog-body' }, [
        el('span', { class: 'install-icon', 'aria-hidden': 'true' }, [icon('sparkle')]),
        el('h2', { id: 'install-title', text: 'Install AccessBellFix for seamless, fast fixes' }),
        el('p', { id: 'install-text', text: 'Fix now applies fixes on your live site through AccessBellFix, a lightweight script you add once. After that, every fix is one click: no code changes, and nothing goes live until you approve it.' }),
        el('ol', { class: 'install-steps' }, [
          el('li', { text: 'Copy one line of code from your domain settings.' }),
          el('li', { text: 'Paste it before </head> on your site, or in your site builder\'s custom code settings.' }),
          el('li', { text: 'Come back and select Fix now on any issue.' }),
        ]),
        el('div', { class: 'install-actions' }, [
          el('a', { class: 'btn btn-accent', href: `/app/domain?id=${encodeURIComponent(domainId)}&setup=fix` }, [icon('sparkle'), 'Set up AccessBellFix']),
          copyInstead,
          later,
        ]),
      ]),
    ]);
    later.addEventListener('click', () => node.close());
    copyInstead.addEventListener('click', () => {
      node.close();
      installDialog.onCopy?.();
    });
    node.addEventListener('close', () => installDialog.returnTo?.focus());
    document.body.append(node);
    installDialog = { node };
  }
  installDialog.returnTo = returnTo;
  installDialog.onCopy = onCopy;
  installDialog.node.showModal();
}

/**
 * Fix one element: type the text once, copy the corrected code into your site,
 * or select Fix now to apply it with AccessBellFix (for the fixes the script supports).
 */
function fixPanel(element, { kind, editable }) {
  const rule = ELEMENT_FIXES[data.issue.id];
  if (!rule || !element.html || data.issue.kind !== 'failed') return null;
  const id = `fx-${++fixSeq}`;
  const status = el('p', { class: 'status-line', role: 'status', 'aria-live': 'polite' });
  const input = el('input', { id, type: 'text', maxlength: '300', autocomplete: 'off', 'aria-describedby': `${id}-hint` });
  const code = el('code', { text: correctedHtml(data.issue.id, element.html, '') });
  const copy = el('button', { type: 'button', class: 'btn btn-sm btn-outline' }, [icon('copy'), el('span', { text: 'Copy code' })]);
  input.addEventListener('input', () => {
    code.textContent = correctedHtml(data.issue.id, element.html, input.value);
  });
  copy.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(code.textContent);
      setStatus(status, 'success', 'Corrected code copied. Paste it over the element in your site, then rescan.');
    } catch {
      setStatus(status, 'error', 'Copy is not available in this browser. Select the code and copy it.');
    }
  });
  const actions = [];
  if (kind && editable && element.target) {
    const fixNow = el('button', { type: 'button', class: 'btn btn-sm btn-accent' }, [icon('sparkle'), el('span', { text: 'Fix now' })]);
    fixNow.addEventListener(
      'click',
      busy(fixNow, status, async () => {
        if (!input.value.trim()) {
          input.focus();
          throw new Error(`${rule.ask} first, then select Fix now.`);
        }
        // Fix now works through AccessBellFix. Without it, offer to install it (or copy the code).
        if (fixConnected !== true) {
          installPrompt({ returnTo: fixNow, onCopy: () => copy.click() });
          return;
        }
        await api('domain/fix/add', { method: 'POST', body: { id: domainId, kind, selector: element.target, value: input.value.trim() } });
        fixNow.replaceWith(el('span', { class: 'el-fix-done' }, [icon('check'), 'Fixed with AccessBellFix']));
        setStatus(status, 'success', 'Fixed. AccessBellFix applies it on your site the next time the page loads, and your next scan confirms it.');
      }),
    );
    actions.push(fixNow);
  }
  actions.push(copy);
  return el('div', { class: 'el-fix' }, [
    el('p', { class: 'el-fix-title' }, [icon('wrench'), 'Fix this element']),
    el('label', { for: id, text: rule.ask }),
    el('p', { class: 'el-fix-hint', id: `${id}-hint`, text: rule.hint }),
    input,
    el('p', { class: 'el-fix-label', text: 'Corrected code' }),
    el('pre', { class: 'el-html el-html-fixed', tabindex: '0' }, [code]),
    el('div', { class: 'el-fix-row' }, actions),
    status,
  ]);
}

function elementItem(e, { kind, editable, fixed }) {
  const copy = e.target ? el('button', { type: 'button', class: 'copy-btn copy-sm' }, [icon('copy'), el('span', { text: 'Copy selector' })]) : null;
  copy?.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(e.target);
      copy.lastChild.textContent = 'Copied';
      setTimeout(() => (copy.lastChild.textContent = 'Copy selector'), 2000);
    } catch {
      copy.lastChild.textContent = 'Copy not available';
    }
  });
  return el('li', { class: 'el-item' }, [
    el('pre', { class: 'el-html', tabindex: '0' }, [el('code', { text: e.html })]),
    e.target ? el('p', { class: 'el-target' }, [el('span', { class: 'muted', text: 'Selector: ' }), el('code', { text: e.target }), copy]) : null,
    e.fix ? el('p', { class: 'el-note' }, [el('strong', { text: 'What to fix: ' }), e.fix]) : null,
    fixed ? null : fixPanel(e, { kind, editable }),
  ]);
}

function pageGroups(list, { fixed = false } = {}) {
  const kind = !fixed && data.issue.kind === 'failed' ? FIXABLE[data.issue.id] : null;
  const editable = me.subscribed && can(me, 'member');
  return el(
    'div',
    { class: 'el-groups' },
    list.map((g) =>
      el('section', { class: 'el-group' }, [
        el('div', { class: 'el-group-head' }, [
          el('h3', {}, [
            el('a', { href: g.url, target: '_blank', rel: 'noopener noreferrer' }, [g.url.replace(/^https?:\/\//, ''), el('span', { class: 'visually-hidden', text: ' (opens in a new tab)' })]),
          ]),
          el('span', { class: 'tag', text: g.device === 'mobile' ? 'Mobile' : 'Desktop' }),
          el('span', { class: 'muted', text: fixed ? `${plural(g.count, 'element')} fixed ${fmtDate(g.fixedAt)}` : plural(g.count, 'element') }),
        ]),
        el('ul', { class: 'el-list' }, g.elements.map((e) => elementItem(e, { kind, editable, fixed }))),
        g.count > g.elements.length ? el('p', { class: 'muted', text: `Showing ${g.elements.length} of ${g.count}. Fix these, then rescan to see the rest.` }) : null,
      ]),
    ),
  );
}

function renderElements() {
  const failedLabel = data.issue.kind === 'review' ? 'Elements to Check' : 'Failed Elements';
  $('[data-failed-label]').textContent = `${failedLabel} (${data.elements.toLocaleString()})`;
  $('[data-fixed-label]').textContent = `Fixed Elements (${data.fixedElements.toLocaleString()})`;
  const failed = data.issue.kind === 'failed';
  const inCode = failed && ELEMENT_FIXES[data.issue.id];
  const how = !failed
    ? ''
    : inCode
      ? FIXABLE[data.issue.id]
        ? ' Type the text under any element to get its corrected code to copy into your site, or select Fix now to fix it on your live site.'
        : ' Type the text under any element to get its corrected code to copy into your site.'
      : ' Follow "What to fix" under each element, and see the correct markup on the Issue Overview tab.';
  $('[data-failed-sub]').textContent = data.failed.length
    ? `${plural(data.elements, 'element')} on ${plural(data.pages, 'page')}, from the latest scan of each page.${how}`
    : 'Nothing is failing in the latest scans.';
  $('[data-failed]').replaceChildren(
    data.failed.length
      ? pageGroups(data.failed)
      : el('div', { class: 'empty-state empty-sm' }, [el('h2', { text: 'All fixed' }), el('p', { text: 'This issue did not appear in the latest scan of any monitored page.' })]),
  );
  $('[data-fixed]').replaceChildren(
    data.fixed.length
      ? pageGroups(data.fixed, { fixed: true })
      : el('div', { class: 'empty-state empty-sm' }, [el('h2', { text: 'No fixed elements yet' }), el('p', { text: 'When a page that failed this check passes on its next scan, it shows here.' })]),
  );
}

try {
  data = await api(`domain/issue?id=${encodeURIComponent(domainId || '')}&rule=${encodeURIComponent(ruleId || '')}`);
  const domainUrl = `/app/domain?id=${encodeURIComponent(domainId)}`;
  document.title = `${data.issue.title} | AccessBell`;
  $('[data-title]').textContent = data.issue.title;
  $('[data-back]').setAttribute('href', `${domainUrl}&tab=${data.issue.kind === 'review' ? 'review' : 'issues'}`);
  $('[data-crumb-host]').replaceChildren(el('a', { href: domainUrl, text: data.domain.hostname }));
  $('[data-tabs]').hidden = false;
  try {
    const setup = await api(`domain/fix?id=${encodeURIComponent(domainId)}`);
    fixConnected = Boolean(setup.seenAt && Date.now() - new Date(setup.seenAt).getTime() < 7 * 86400000);
  } catch {
    fixConnected = null;
  }
  $('[data-fix-promo]').hidden = !(ELEMENT_FIXES[data.issue.id] && data.issue.kind === 'failed' && data.failed.length);
  $('[data-goto-failed]').addEventListener('click', () => selectTab('failed'));
  renderStats();
  renderDescription();
  renderElements();
  const tab = qs('tab');
  if (tab === 'failed' || tab === 'fixed') selectTab(tab);
} catch (err) {
  $('[data-title]').textContent = 'Issue not available';
  $('[data-progress]').textContent = err.message;
}
