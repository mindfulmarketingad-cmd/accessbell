// Accessibility statement generator. Runs entirely in the browser: nothing the
// visitor types is sent anywhere.
import { EMAIL, SITE, cleanSite, buildStatement, renderInto, toText, toHtml, esc } from './shared/statement.js';

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
