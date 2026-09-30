// Add Domain wizard: Indexing > Configure settings > AccessBellFix (optional)
// > Accessibility statement (optional, with its own steps).
import { api, el, icon, busy, setStatus, planButtons } from './core.js';
import { mountFixInstall, mountStatementFlow, GUIDE_URL } from './site-tools.js';

const STEPS = [
  { name: 'Indexing' },
  { name: 'Configure settings' },
  { name: 'AccessBellFix', optional: true },
  { name: 'Accessibility statement', optional: true },
];

export function setupAddDomain(me, { getBilling }) {
  const dialog = el('dialog', { class: 'dialog wizard', 'aria-labelledby': 'wiz-title' });
  const title = el('h2', { id: 'wiz-title', text: 'Add Domain' });
  const closeBtn = el('button', { class: 'icon-btn', type: 'button' }, [icon('x'), el('span', { class: 'visually-hidden', text: 'Close' })]);
  const nav = el('ol', { class: 'wiz-steps', 'aria-label': 'Setup steps' });
  const panel = el('div', { class: 'wiz-panel' });
  const status = el('p', { class: 'status-line', role: 'status', 'aria-live': 'polite' });
  const back = el('button', { class: 'btn btn-outline', type: 'button', text: 'Back' });
  const skip = el('button', { class: 'btn btn-outline', type: 'button', text: 'Set up later' });
  const next = el('button', { class: 'btn', type: 'button', text: 'Next' });
  const actions = el('div', { class: 'dialog-actions' }, [back, skip, next]);
  dialog.append(el('div', { class: 'dialog-body' }, [el('div', { class: 'dialog-head' }, [title, closeBtn]), nav, panel, status, actions]));
  document.body.append(dialog);

  let step = 0;
  let domain = null; // { id, hostname, settings }
  let siteKey = null;
  const form = { url: '', sitemapUrl: '', wcagVersion: '2.2', wcagLevel: 'AA', devices: ['desktop'], includeSubdomains: false };

  const finish = () => {
    dialog.close();
    location.assign('/app');
  };
  closeBtn.addEventListener('click', () => (domain ? finish() : dialog.close()));
  dialog.addEventListener('cancel', (e) => {
    if (domain) {
      e.preventDefault();
      finish();
    }
  });

  function renderNav() {
    nav.replaceChildren(
      ...STEPS.map((s, i) =>
        el('li', { class: i < step ? 'is-done' : i === step ? 'is-current' : null, 'aria-current': i === step ? 'step' : null }, [
          el('span', { class: 'wiz-dot', 'aria-hidden': 'true' }, [i < step ? icon('check') : String(i + 1)]),
          el('span', { class: 'wiz-name' }, [s.name, s.optional ? el('small', { text: 'Optional' }) : null]),
          i < step ? el('span', { class: 'visually-hidden', text: ' (completed)' }) : null,
        ]),
      ),
    );
  }

  const field = (id, label, control, help) =>
    el('div', { class: 'field' }, [el('label', { for: id }, Array.isArray(label) ? label : [label]), control, help ? el('span', { class: 'help', id: `${id}-help`, text: help }) : null]);

  function heading(text, sub) {
    const h = el('h3', { class: 'wiz-title', tabindex: '-1', text });
    return [h, sub ? el('p', { class: 'muted', text: sub }) : null];
  }

  // ---------- Steps ----------

  function stepIndexing() {
    const url = el('input', { id: 'wiz-url', type: 'text', inputmode: 'url', value: form.url, placeholder: 'example.com', maxlength: '2048', autocomplete: 'url', disabled: Boolean(domain) });
    url.addEventListener('input', () => (form.url = url.value));
    const sitemap = el('input', { id: 'wiz-sitemap', type: 'text', inputmode: 'url', value: form.sitemapUrl, placeholder: 'https://example.com/sitemap.xml', maxlength: '2048', 'aria-describedby': 'wiz-sitemap-help' });
    sitemap.addEventListener('input', () => (form.sitemapUrl = sitemap.value));
    const help = el('details', { class: 'wiz-help' }, [
      el('summary', { text: 'How do I find my sitemap?' }),
      el('ul', {}, [
        el('li', {}, ['Try ', el('code', { text: '/sitemap.xml' }), ' or ', el('code', { text: '/sitemap_index.xml' }), ' after your address.']),
        el('li', {}, ['Look for a ', el('code', { text: 'Sitemap:' }), ' line in ', el('code', { text: '/robots.txt' }), '.']),
        el('li', { text: 'WordPress (Yoast or Rank Math), Shopify, Wix and Squarespace create one automatically.' }),
        el('li', { text: 'No sitemap? Leave it empty. We also follow the links on your home page.' }),
      ]),
    ]);
    return [
      ...heading('Index your website', 'We find your pages from your sitemap and the links on your home page. Next, you choose up to 500 of them to scan and monitor.'),
      field('wiz-url', 'Website address', url),
      field('wiz-sitemap', ['XML sitemap ', el('span', { class: 'hint', text: '(optional)' })], sitemap, 'Recommended for large sites, so we find all of your pages.'),
      help,
    ];
  }

  function stepSettings() {
    const radios = (name, options, legend) =>
      el('fieldset', { class: 'field choice-inline' }, [
        el('legend', { text: legend }),
        el(
          'div',
          { class: 'seg' },
          options.map((o) => {
            const r = el('input', { type: 'radio', name, value: o, checked: form[name] === o });
            r.addEventListener('change', () => (form[name] = o));
            return el('label', {}, [r, el('span', { text: name === 'wcagVersion' ? `WCAG ${o}` : `Level ${o}` })]);
          }),
        ),
      ]);
    const device = (value, label) => {
      const c = el('input', { type: 'checkbox', name: 'device', value, checked: form.devices.includes(value) });
      c.addEventListener('change', () => {
        form.devices = c.checked ? [...new Set([...form.devices, value])] : form.devices.filter((d) => d !== value);
      });
      return el('label', {}, [c, ` ${label}`]);
    };
    const sub = el('input', { type: 'checkbox', checked: form.includeSubdomains });
    sub.addEventListener('change', () => (form.includeSubdomains = sub.checked));
    return [
      ...heading('Configure settings', 'Choose the standard to test against. WCAG 2.2 Level AA is the current recommendation and what most laws and settlements expect.'),
      radios('wcagVersion', ['2.2', '2.1', '2.0'], 'WCAG version'),
      radios('wcagLevel', ['A', 'AA', 'AAA'], 'Conformance level'),
      el('fieldset', { class: 'field' }, [el('legend', { text: 'Devices' }), el('div', { class: 'check-row' }, [device('desktop', 'Desktop'), device('mobile', 'Mobile')])]),
      el('fieldset', { class: 'field' }, [
        el('legend', { text: 'Coverage' }),
        el('div', { class: 'check-row' }, [el('label', {}, [sub, ` Include subdomains of ${domain?.hostname || 'this domain'}`])]),
      ]),
      el('p', { class: 'help', text: 'You can change these, and add login headers or URL rules, later in Domain Settings.' }),
    ];
  }

  async function stepFix() {
    const box = el('div');
    if (!siteKey) siteKey = (await api(`domain/fix?id=${encodeURIComponent(domain.id)}`)).siteKey;
    mountFixInstall(box, { domainId: domain.id, hostname: domain.hostname, siteKey });
    return [
      ...heading('Install AccessBellFix', 'Add one line of code to your site. You then choose fixes in AccessBell, such as missing alt text or button names, and AccessBellFix applies them on your site. Nothing changes until you approve a fix.'),
      box,
      el('p', { class: 'help' }, ['Optional. You can install it any time from Domain Settings. ', el('a', { href: GUIDE_URL, target: '_blank', rel: 'noopener', text: 'How AccessBellFix works' }), '.']),
    ];
  }

  function stepStatement() {
    const start = el('button', { class: 'btn', type: 'button', text: 'Create statement' });
    start.addEventListener('click', async () => {
      actions.hidden = true;
      const box = el('div');
      panel.replaceChildren(box);
      const existing = await api(`domain/statement?id=${encodeURIComponent(domain.id)}`).catch(() => ({}));
      mountStatementFlow(box, {
        domain: { ...domain, settings: { wcagVersion: form.wcagVersion, wcagLevel: form.wcagLevel } },
        siteKey: existing.siteKey || siteKey,
        existing: existing.statement,
        me,
        finishLabel: 'Finish',
        onFinish: finish,
        onExit: () => show(),
      });
    });
    return [
      ...heading('Create your accessibility statement', 'An accessibility statement tells visitors your commitment, the standard you follow and how to report a barrier. Answer a few questions and we write it for you, with a hosted link that stays up to date.'),
      el('ol', { class: 'wiz-substeps' }, ['Organization type', 'Company name', 'Contact info', 'Related policies & links (optional)', 'Custom notes (optional)', 'Install statement'].map((t) => el('li', { text: t }))),
      el('div', {}, [start]),
    ];
  }

  // ---------- Navigation ----------

  async function show() {
    renderNav();
    actions.hidden = false;
    setStatus(status, '', '');
    const nodes = step === 0 ? stepIndexing() : step === 1 ? stepSettings() : step === 2 ? await stepFix() : stepStatement();
    panel.replaceChildren(...nodes.filter(Boolean));
    back.hidden = step === 0;
    skip.hidden = !STEPS[step].optional;
    skip.textContent = step === 3 ? 'Skip and finish' : 'Set up later';
    next.hidden = step === 3; // the statement step has its own Create button
    next.textContent = step === 0 ? 'Next: settings' : 'Next';
    panel.querySelector('.wiz-title')?.focus();
  }

  async function saveStep() {
    if (step === 0) {
      if (!domain) {
        if (!form.url.trim()) {
          panel.querySelector('#wiz-url')?.focus();
          throw new Error('Enter your website address.');
        }
        const r = await api('domains', { method: 'POST', body: { url: form.url.trim() } });
        domain = { id: r.domain.id, hostname: r.domain.hostname };
      }
      await api('domain/settings', { method: 'POST', body: { id: domain.id, settings: { sitemapUrl: form.sitemapUrl.trim() } } });
      // Start finding pages now; the Found Pages screen picks up the results.
      api('domain/discover', { method: 'POST', body: { id: domain.id } }).catch(() => {});
    } else if (step === 1) {
      if (!form.devices.length) throw new Error('Choose at least one device.');
      await api('domain/settings', {
        method: 'POST',
        body: { id: domain.id, settings: { wcagVersion: form.wcagVersion, wcagLevel: form.wcagLevel, devices: form.devices, includeSubdomains: form.includeSubdomains } },
      });
    }
  }

  back.addEventListener('click', () => {
    step = Math.max(0, step - 1);
    show();
  });
  skip.addEventListener('click', () => {
    if (step === 3) return finish();
    step++;
    show();
  });
  next.addEventListener(
    'click',
    busy(next, status, async () => {
      await saveStep();
      if (step === 3) return finish();
      step++;
      await show();
    }),
  );

  /** Open the wizard; `prefill` sets the website address (used by "Add subdomain"). */
  return function openAdd(prefill = '') {
    const billing = getBilling();
    setStatus(status, '', '');
    step = 0;
    domain = null;
    siteKey = null;
    Object.assign(form, { url: prefill, sitemapUrl: '', wcagVersion: '2.2', wcagLevel: 'AA', devices: ['desktop'], includeSubdomains: false });
    let blocked = null;
    if (!me.subscribed) {
      blocked = [
        el('p', { text: 'Subscribe to AccessBell Pro to add domains: $29 per domain per month after a 3-day free trial, or $199 per domain per year.' }),
        me.role === 'owner' ? planButtons(status) : el('p', { class: 'muted', text: 'Ask the account owner to start the subscription.' }),
      ];
    } else if (billing.domainsUsed >= billing.domainQuota) {
      blocked = [
        el('p', {}, [
          `Your plan includes ${billing.domainQuota} domain${billing.domainQuota === 1 ? '' : 's'} and all are in use. `,
          el('a', { href: '/app/billing', text: 'Add a domain to your plan in Billing' }),
          '.',
        ]),
      ];
    }
    if (blocked) {
      nav.hidden = true;
      actions.hidden = true;
      panel.replaceChildren(...blocked);
      dialog.showModal();
      return;
    }
    nav.hidden = false;
    dialog.showModal();
    show().then(() => {
      const input = panel.querySelector('#wiz-url');
      input.focus();
      if (prefill) input.setSelectionRange(0, 0);
    });
  };
}
