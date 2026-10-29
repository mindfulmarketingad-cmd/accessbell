// Buyer report page (/report?token=...): fetches the one-time report and
// renders it. No account is required; the emailed token is the access
// control. All report data is inserted as text, never HTML.
const mount = document.getElementById('report-mount');
const token = new URLSearchParams(location.search).get('token') || '';

const text = (tag, content, cls) => {
  const n = document.createElement(tag);
  if (cls) n.className = cls;
  n.textContent = content;
  return n;
};
const link = (href, content, cls) => {
  const a = document.createElement('a');
  a.href = href;
  if (cls) a.className = cls;
  a.textContent = content;
  return a;
};

function showTokenForm(message) {
  mount.replaceChildren();
  const card = document.createElement('div');
  card.className = 'results-card';
  card.append(text('h2', 'Open your report'));
  if (message) card.append(text('p', message));
  card.append(text('p', 'Your report link was emailed to you after checkout. Paste the token from that email here, or open the link from the email directly.'));
  const form = document.createElement('form');
  form.className = 'scan-lead';
  const label = document.createElement('label');
  label.setAttribute('for', 'report-token');
  label.textContent = 'Report token';
  const input = document.createElement('input');
  input.id = 'report-token';
  input.name = 'token';
  input.type = 'text';
  input.required = true;
  input.maxLength = 32;
  input.placeholder = 'Paste your 32-character token';
  if (token) input.value = token;
  const button = document.createElement('button');
  button.type = 'submit';
  button.className = 'btn btn-accent btn-sm';
  button.textContent = 'Open report';
  form.append(label, input, button);
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const t = (input.value || '').trim();
    if (/^[a-f0-9]{32}$/i.test(t)) location.search = `?token=${t.toLowerCase()}`;
  });
  card.append(form);
  mount.append(card);
}

function showPending(product, hostname, delivery) {
  mount.replaceChildren();
  const card = document.createElement('div');
  card.className = 'results-card';
  card.append(text('h2', product === 'domain_audit' ? 'Your Domain Audit is being prepared' : 'Your report is being prepared'));
  card.append(
    text(
      'p',
      product === 'domain_audit'
        ? `We are crawling up to 500 pages on ${hostname} and testing each one. We will email you the report link as soon as it is ready. This page will show the report then, too.`
        : 'Your report is being built. Please refresh this page in a moment.',
    ),
  );
  card.append(text('p', `Status: ${delivery}.`));
  const again = document.createElement('button');
  again.type = 'button';
  again.className = 'btn btn-outline btn-sm';
  again.textContent = 'Check again';
  again.addEventListener('click', () => location.reload());
  card.append(again);
  mount.append(card);
}

function showReport(data) {
  const report = data.report;
  const s = report.summary || {};
  const card = document.createElement('div');
  card.className = 'results-card scan-result';
  const title = data.product === 'domain_audit' ? `Domain Audit: ${data.hostname}` : `Page Report: ${data.hostname}`;
  card.append(text('h2', title));
  card.append(text('p', `Tested against ${report.standard || 'WCAG 2.2 AA'}${report.scannedAt ? ` on ${report.scannedAt.slice(0, 10)}` : ''}.`));
  if (report.pagesScanned !== undefined) card.append(text('p', `Pages scanned: ${report.pagesScanned}${report.pagesFailed ? ` (${report.pagesFailed} failed to load)` : ''}.`));
  const tiles = document.createElement('ul');
  tiles.className = 'scan-result-sev';
  for (const [key, name] of [['critical', 'Critical'], ['serious', 'Serious'], ['moderate', 'Moderate'], ['minor', 'Minor']]) {
    const li = document.createElement('li');
    li.dataset.sev = key;
    const strong = document.createElement('strong');
    strong.textContent = String(s[key] || 0);
    const span = document.createElement('span');
    span.textContent = name;
    li.append(strong, span);
    tiles.append(li);
  }
  card.append(tiles);
  if (report.score !== undefined) card.append(text('p', `Score: ${report.score} / 100. Automated testing covers part of the standard, so review the manual checks too.`));
  const list = document.createElement('ol');
  list.className = 'scan-result-list';
  for (const issue of report.issues || []) {
    const li = document.createElement('li');
    li.dataset.sev = issue.impact;
    const main = document.createElement('div');
    main.className = 'scan-result-main';
    const strong = document.createElement('strong');
    strong.textContent = issue.title;
    const meta = document.createElement('span');
    meta.className = 'scan-result-meta';
    const parts = [];
    if (issue.count) parts.push(`${issue.count} element${issue.count === 1 ? '' : 's'}`);
    if (issue.pagesAffected) parts.push(`${issue.pagesAffected} page${issue.pagesAffected === 1 ? '' : 's'}`);
    if (issue.wcag && issue.wcag.length) parts.push(`WCAG ${issue.wcag.map((c) => `${c.sc} ${c.name}`).join(', ')}`);
    meta.textContent = parts.join(' · ');
    main.append(strong, meta);
    li.append(main);
    if (issue.fix) {
      const fix = document.createElement('p');
      fix.className = 'scan-teaser-fix';
      const b = document.createElement('strong');
      b.textContent = 'Fix: ';
      const span = document.createElement('span');
      span.textContent = issue.fix;
      fix.append(b, span);
      li.append(fix);
    }
    if (issue.samples && issue.samples.length) {
      const pre = document.createElement('pre');
      pre.className = 'scan-teaser-code';
      const code = document.createElement('code');
      code.textContent = issue.samples.join('\n');
      pre.append(code);
      li.append(pre);
    }
    if (issue.helpUrl) {
      const a = link(issue.helpUrl, 'Read the guidance');
      a.rel = 'noopener noreferrer';
      a.target = '_blank';
      li.append(a);
    }
    list.append(li);
  }
  card.append(list);
  const actions = document.createElement('div');
  actions.className = 'scan-teaser-actions';
  if (data.pdfUrl) actions.append(link(data.pdfUrl, 'Download the PDF report', 'btn btn-accent btn-sm'));
  actions.append(link('/app/signup', 'Save this report to your dashboard', 'btn btn-outline btn-sm'));
  actions.append(link('/pricing', 'Keep it monitored with Pro — $29/mo', 'btn btn-outline btn-sm'));
  card.append(actions);
  card.append(text('p', 'This report records automated findings. Some checks need a person, and no tool can guarantee legal compliance on its own. See our disclaimer.', 'scan-cta-note'));
  mount.append(card);
}

async function main() {
  if (!/^[a-f0-9]{32}$/i.test(token)) {
    showTokenForm('');
    return;
  }
  mount.replaceChildren(text('p', 'Loading your report…'));
  let res;
  try {
    res = await fetch(`/api/one-time-report?token=${token.toLowerCase()}`, { credentials: 'same-origin' });
  } catch {
    mount.replaceChildren(text('p', 'The report could not be loaded. Please try again.'));
    return;
  }
  const data = await res.json().catch(() => ({}));
  if (!res.ok || data.error) {
    showTokenForm('That report link was not recognized. Check the token from your email and try again.');
    return;
  }
  if (data.status !== 'paid') {
    showTokenForm('This report has not been paid for yet. Finish checkout from the email link, then open the report again.');
    return;
  }
  if (data.delivery !== 'ready' || !data.report) {
    showPending(data.product, data.hostname, data.delivery);
    return;
  }
  showReport(data);
}

main();
