// Accessibility statement builder, shared by the public statement generator
// and the dashboard's statement setup. All user text is inserted with
// textContent; the HTML output escapes it.

const ORG_NOUNS = {
  business: 'business',
  nonprofit: 'nonprofit organization',
  government: 'public agency',
  education: 'educational institution',
};

export const STANDARDS = {
  wcag22aa: { std: 'WCAG 2.2 Level AA' },
  wcag21aa: { std: 'WCAG 2.1 Level AA' },
  wcag20aa: { std: 'WCAG 2.0 Level AA' },
  wcag22aaa: { std: 'WCAG 2.2 Level AAA' },
  ada: { std: 'WCAG 2.1 Level AA', law: 'the standard we use to meet our obligations under the Americans with Disabilities Act (ADA)' },
  section508: { std: 'WCAG 2.0 Level AA', law: 'the standard referenced by Section 508 of the Rehabilitation Act' },
  en301549: { std: 'WCAG 2.1 Level AA', law: 'the web standard in EN 301 549, the harmonized European standard used for the European Accessibility Act' },
};

export const EMAIL = /^[^\s@<>()[\]\\,;:"]{1,64}@[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?(?:\.[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?)+$/i;
export const SITE = /^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?(?:\.[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?)+(?:\/[^\s]*)?$/i;

export const cleanSite = (v) =>
  String(v || '')
    .trim()
    .replace(/^https?:\/\//i, '')
    .replace(/^www\./i, '')
    .replace(/[?#].*$/, '')
    .replace(/\/+$/, '');

export const today = () => new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

/**
 * The statement as data: a list of blocks that can be rendered to the page,
 * to plain text and to HTML.
 */
export function buildStatement(v) {
  const s = v.standardText ? { std: v.standardText } : STANDARDS[v.standard] || STANDARDS.wcag22aa;
  const org = v.org || 'Your organization';
  const site = v.site || 'our website';
  const target = s.law ? `${s.std}, ${s.law}` : s.std;
  const subject = v.site ? `Our website, ${v.site},` : 'Our website';
  const conformant = v.status === 'conformant';
  const noun = ORG_NOUNS[v.orgType];
  const blocks = [
    { type: 'p', text: `${noun ? `As a ${noun}, ` : ''}${org} is committed to ensuring digital accessibility for people with disabilities. We are continually improving the experience of ${site} for everyone and applying the relevant accessibility standards.` },
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
    ...(v.links?.length ? [{ type: 'h', text: 'Related Policies' }, { type: 'links', items: v.links }] : []),
    ...(v.notes ? [{ type: 'h', text: 'Additional Information' }, ...v.notes.split(/\n{2,}/).map((t) => ({ type: 'p', text: t.trim() })).filter((b) => b.text)] : []),
    ...(v.lastChecked
      ? [{ type: 'h', text: 'Ongoing Monitoring' }, { type: 'p', text: `This website is monitored with automated accessibility testing. It was last checked on ${v.lastChecked}.` }]
      : []),
    { type: 'meta', text: `Last updated: ${v.updated || today()}` },
  ];
  return { title: `Accessibility Statement for ${org}`, blocks };
}

export function renderInto(box, statement) {
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
    if (b.type === 'links') {
      const ul = document.createElement('ul');
      for (const l of b.items) {
        const li = document.createElement('li');
        const a = document.createElement('a');
        a.href = l.url;
        a.textContent = l.label;
        li.append(a);
        ul.append(li);
      }
      return ul;
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

export function toText(st) {
  const out = [st.title, ''];
  for (const b of st.blocks) {
    if (b.type === 'h') out.push('', b.text);
    else if (b.type === 'ol') b.items.forEach((t, i) => out.push(`${i + 1}. ${t}`));
    else if (b.type === 'contacts') b.items.forEach((c) => out.push(`${c.label}: ${c.value}`));
    else if (b.type === 'links') b.items.forEach((l) => out.push(`${l.label}: ${l.url}`));
    else out.push(b.text);
    if (b.type !== 'h') out.push('');
  }
  return out.join('\n').replace(/\n{3,}/g, '\n\n').trim();
}

export const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

export function toHtml(st) {
  const parts = [`<h1>${esc(st.title)}</h1>`];
  for (const b of st.blocks) {
    if (b.type === 'h') parts.push(`<h2>${esc(b.text)}</h2>`);
    else if (b.type === 'ol') parts.push(`<ol>\n${b.items.map((t) => `  <li>${esc(t)}</li>`).join('\n')}\n</ol>`);
    else if (b.type === 'links') parts.push(`<ul>\n${b.items.map((l) => `  <li><a href="${esc(l.url)}">${esc(l.label)}</a></li>`).join('\n')}\n</ul>`);
    else if (b.type === 'contacts')
      parts.push(`<ul>\n${b.items.map((c) => `  <li><strong>${esc(c.label)}:</strong> ${c.href ? `<a href="${esc(c.href)}">${esc(c.value)}</a>` : esc(c.value)}</li>`).join('\n')}\n</ul>`);
    else parts.push(`<p>${esc(b.text)}</p>`);
  }
  return parts.join('\n');
}

