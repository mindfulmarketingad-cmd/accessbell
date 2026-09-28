// Accessibility statement generator. Runs entirely in the browser: nothing the
// visitor types is sent anywhere. All user text is inserted with textContent;
// the HTML download escapes it.

const STANDARDS = {
  wcag22aa: { std: 'WCAG 2.2 Level AA' },
  wcag21aa: { std: 'WCAG 2.1 Level AA' },
  wcag20aa: { std: 'WCAG 2.0 Level AA' },
  wcag22aaa: { std: 'WCAG 2.2 Level AAA' },
  ada: { std: 'WCAG 2.1 Level AA', law: 'the standard we use to meet our obligations under the Americans with Disabilities Act (ADA)' },
  section508: { std: 'WCAG 2.0 Level AA', law: 'the standard referenced by Section 508 of the Rehabilitation Act' },
  en301549: { std: 'WCAG 2.1 Level AA', law: 'the web standard in EN 301 549, the harmonized European standard used for the European Accessibility Act' },
};

const EMAIL = /^[^\s@<>()[\]\\,;:"]{1,64}@[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?(?:\.[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?)+$/i;
const SITE = /^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?(?:\.[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?)+(?:\/[^\s]*)?$/i;

const cleanSite = (v) =>
  String(v || '')
    .trim()
    .replace(/^https?:\/\//i, '')
    .replace(/^www\./i, '')
    .replace(/[?#].*$/, '')
    .replace(/\/+$/, '');

const today = () => new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

/**
 * The statement as data: a list of blocks that can be rendered to the page,
 * to plain text and to HTML.
 */
function buildStatement(v) {
  const s = STANDARDS[v.standard] || STANDARDS.wcag22aa;
  const org = v.org || 'Your organization';
  const site = v.site || 'our website';
  const target = s.law ? `${s.std}, ${s.law}` : s.std;
  const subject = v.site ? `Our website, ${v.site},` : 'Our website';
  const conformant = v.status === 'conformant';
  const blocks = [
    { type: 'p', text: `${org} is committed to ensuring digital accessibility for people with disabilities. We are continually improving the experience of ${site} for everyone and applying the relevant accessibility standards.` },
    { type: 'h', text: 'Conformance Status' },
    { type: 'p', text: 'The Web Content Accessibility Guidelines (WCAG) define requirements for designers and developers to improve accessibility for people with disabilities. They have three levels of conformance: Level A, Level AA and Level AAA.' },
    {
      type: 'p',
      text: conformant
        ? `${subject} conforms with ${target}. We test it with automated tools and manual review, and monitor it regularly so it stays accessible.`
        : `${subject} is partially conformant with ${target}. Partially conformant means that some parts of the content do not yet fully conform to the standard. We are actively working to fix them.`,
    },
    { type: 'h', text: 'Our Commitment' },
    {
      type: 'ol',
      items: [
        'We include accessibility in how we design, write and build our website.',
        conformant
          ? `We test ${site} regularly, with automated tools and with people, and fix any new issues promptly.`
          : `We test ${site} regularly and fix the issues we find, starting with those that affect people most.`,
        'We welcome feedback on any accessibility barriers you encounter and will work promptly to address them.',
      ],
    },
    { type: 'h', text: 'Feedback and Contact Information' },
    { type: 'p', text: `We welcome your feedback on the accessibility of ${site}. If you encounter a barrier, or need information in a different format, please contact us:` },
    {
      type: 'contacts',
      items: [
        { label: 'Email', value: v.email || 'accessibility@example.com', href: v.email ? `mailto:${v.email}` : null },
        ...(v.phone ? [{ label: 'Phone', value: v.phone, href: `tel:${v.phone.replace(/[^\d+]/g, '')}` }] : []),
      ],
    },
    { type: 'p', text: 'We aim to respond to feedback within 5 business days.' },
    { type: 'meta', text: `Last updated: ${today()}` },
  ];
  return { title: `Accessibility Statement for ${org}`, blocks };
}

function renderInto(box, statement) {
  const nodes = statement.blocks.map((b) => {
    if (b.type === 'h') {
      const h = document.createElement('h4');
      h.textContent = b.text;
      return h;
    }
    if (b.type === 'ol') {
      const ol = document.createElement('ol');
      for (const t of b.items) {
        const li = document.createElement('li');
        li.textContent = t;
        ol.append(li);
      }
      return ol;
    }
    if (b.type === 'contacts') {
      const ul = document.createElement('ul');
      for (const c of b.items) {
        const li = document.createElement('li');
        const strong = document.createElement('strong');
        strong.textContent = `${c.label}: `;
        li.append(strong);
        if (c.href) {
          const a = document.createElement('a');
          a.href = c.href;
          a.textContent = c.value;
          li.append(a);
        } else li.append(c.value);
        ul.append(li);
      }
      return ul;
    }
    const p = document.createElement('p');
    p.textContent = b.text;
    if (b.type === 'meta') p.className = 'gen-updated';
    return p;
  });
  box.replaceChildren(...nodes);
}

function toText(st) {
  const out = [st.title, ''];
  for (const b of st.blocks) {
    if (b.type === 'h') out.push('', b.text);
    else if (b.type === 'ol') b.items.forEach((t, i) => out.push(`${i + 1}. ${t}`));
    else if (b.type === 'contacts') b.items.forEach((c) => out.push(`${c.label}: ${c.value}`));
    else out.push(b.text);
    if (b.type !== 'h') out.push('');
  }
  return out.join('\n').replace(/\n{3,}/g, '\n\n').trim();
}

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

function toHtml(st) {
  const parts = [`<h1>${esc(st.title)}</h1>`];
  for (const b of st.blocks) {
    if (b.type === 'h') parts.push(`<h2>${esc(b.text)}</h2>`);
    else if (b.type === 'ol') parts.push(`<ol>\n${b.items.map((t) => `  <li>${esc(t)}</li>`).join('\n')}\n</ol>`);
    else if (b.type === 'contacts')
      parts.push(`<ul>\n${b.items.map((c) => `  <li><strong>${esc(c.label)}:</strong> ${c.href ? `<a href="${esc(c.href)}">${esc(c.value)}</a>` : esc(c.value)}</li>`).join('\n')}\n</ul>`);
    else parts.push(`<p>${esc(b.text)}</p>`);
  }
  return parts.join('\n');
}

function init(root) {
  const form = root.querySelector('[data-gen-form]');
  const box = root.querySelector('[data-statement]');
  const outSite = root.querySelector('[data-out-site]');
  const status = root.querySelector('[data-gen-status]');
  const heading = root.querySelector('#gen-out-title');
  const copyBtn = root.querySelector('[data-copy]');
  const downloadBtn = root.querySelector('[data-download]');
  const f = form.elements;

  const values = () => ({
    status: root.querySelector('input[name="status"]:checked')?.value || 'partial',
    org: f.org.value.trim().slice(0, 120),
    email: f.email.value.trim(),
    site: cleanSite(f.site.value),
    phone: f.phone.value.trim(),
    standard: f.standard.value,
  });

  const setError = (input, message) => {
    const err = document.getElementById(`${input.id}-err`);
    input.setAttribute('aria-invalid', message ? 'true' : 'false');
    err.textContent = message || '';
    err.hidden = !message;
  };

  function validate() {
    const v = values();
    const problems = [
      [f.org, v.org ? '' : 'Enter your organization name.'],
      [f.email, EMAIL.test(v.email) ? '' : 'Enter a valid email address, such as accessibility@example.com.'],
      [f.site, SITE.test(v.site) ? '' : 'Enter your website address, such as example.com.'],
    ];
    for (const [input, msg] of problems) setError(input, msg);
    const first = problems.find(([, msg]) => msg);
    if (first) first[0].focus();
    return !first;
  }

  const update = () => {
    const v = values();
    outSite.textContent = v.site || 'your website';
    renderInto(box, buildStatement(v));
  };

  let timer = 0;
  form.addEventListener('input', (e) => {
    if (e.target.getAttribute('aria-invalid') === 'true') setError(e.target, '');
    clearTimeout(timer);
    timer = setTimeout(update, 150);
  });
  root.querySelectorAll('input[name="status"]').forEach((r) => r.addEventListener('change', update));
  form.addEventListener('change', update);

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    if (!validate()) return;
    update();
    status.textContent = 'Statement generated. Use Copy to copy it, or HTML to download it.';
    heading.focus();
    heading.scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'start' });
  });

  const flash = (btn, text) => {
    const label = btn.querySelector('span');
    const before = label.textContent;
    label.textContent = text;
    setTimeout(() => (label.textContent = before), 2000);
  };

  copyBtn.addEventListener('click', async () => {
    if (!validate()) return;
    const st = buildStatement(values());
    const text = toText(st);
    try {
      if (window.ClipboardItem && navigator.clipboard?.write) {
        // Rich HTML keeps headings and lists when pasted into a website editor.
        await navigator.clipboard.write([
          new ClipboardItem({ 'text/plain': new Blob([text], { type: 'text/plain' }), 'text/html': new Blob([toHtml(st)], { type: 'text/html' }) }),
        ]);
      } else {
        await navigator.clipboard.writeText(text);
      }
      flash(copyBtn, 'Copied');
      status.textContent = 'Statement copied to the clipboard.';
    } catch {
      status.textContent = 'Copy is not available in this browser. Select the statement text and copy it manually.';
    }
  });

  downloadBtn.addEventListener('click', () => {
    if (!validate()) return;
    const v = values();
    const st = buildStatement(v);
    const doc = `<!doctype html>\n<html lang="en">\n<head>\n<meta charset="utf-8">\n<meta name="viewport" content="width=device-width, initial-scale=1">\n<title>${esc(st.title)}</title>\n</head>\n<body>\n<main>\n${toHtml(st)}\n</main>\n</body>\n</html>\n`;
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([doc], { type: 'text/html;charset=utf-8' }));
    a.download = `accessibility-statement-${(v.site || 'website').replace(/[^a-z0-9.-]+/gi, '-')}.html`;
    document.body.append(a);
    a.click();
    setTimeout(() => {
      URL.revokeObjectURL(a.href);
      a.remove();
    }, 0);
    flash(downloadBtn, 'Saved');
    status.textContent = 'Statement downloaded as an HTML file.';
  });

  update();
}

document.querySelectorAll('[data-generator]').forEach(init);
