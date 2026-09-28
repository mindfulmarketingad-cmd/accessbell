// Help Center search: loads a small JSON index on first use and ranks
// articles by where the words appear. Results are inserted as text, never HTML.

const STOP = new Set(['a', 'an', 'the', 'to', 'of', 'and', 'or', 'in', 'on', 'for', 'how', 'do', 'i', 'my', 'is', 'can', 'what', 'with']);
const words = (s) =>
  String(s || '')
    .toLowerCase()
    .split(/[^a-z0-9.]+/)
    .filter((w) => w && !STOP.has(w));

function score(item, terms) {
  const title = item.title.toLowerCase();
  const heads = item.headings.join(' ').toLowerCase();
  const desc = item.description.toLowerCase();
  const text = item.text.toLowerCase();
  let total = 0;
  for (const t of terms) {
    const s = (title.includes(t) ? 10 : 0) + (heads.includes(t) ? 5 : 0) + (desc.includes(t) ? 3 : 0) + (text.includes(t) ? 1 : 0);
    if (!s) return 0; // every word must appear somewhere
    total += s;
  }
  return total;
}

function init(form) {
  const input = form.querySelector('input[type="search"]');
  const box = form.querySelector('[data-help-results]');
  const count = form.querySelector('[data-help-count]');
  const list = form.querySelector('[data-help-list]');
  let index = null;
  let loading = null;
  let timer = 0;

  const load = () =>
    (loading ||= fetch(form.dataset.index)
      .then((r) => r.json())
      .then((data) => (index = data))
      .catch(() => (index = [])));

  async function run() {
    const q = input.value.trim();
    if (!q) {
      box.hidden = true;
      list.replaceChildren();
      count.textContent = '';
      return;
    }
    await load();
    const terms = words(q);
    const results = terms.length
      ? index
          .map((item) => ({ item, s: score(item, terms) }))
          .filter((r) => r.s > 0)
          .sort((a, b) => b.s - a.s)
          .slice(0, 8)
      : [];
    list.replaceChildren(
      ...results.map(({ item }) => {
        const li = document.createElement('li');
        const a = document.createElement('a');
        a.href = item.url;
        const t = document.createElement('strong');
        t.textContent = item.title;
        const c = document.createElement('small');
        c.textContent = item.category;
        const d = document.createElement('span');
        d.textContent = item.description;
        a.append(t, c, d);
        li.append(a);
        return li;
      }),
    );
    count.textContent = results.length ? `${results.length} article${results.length === 1 ? '' : 's'} found` : `No articles match "${q}". Try other words, or contact support.`;
    box.hidden = false;
  }

  input.addEventListener('focus', load, { once: true });
  input.addEventListener('input', () => {
    clearTimeout(timer);
    timer = setTimeout(run, 120);
  });
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      input.value = '';
      run();
    }
    if (e.key === 'ArrowDown') {
      const first = list.querySelector('a');
      if (first) {
        e.preventDefault();
        first.focus();
      }
    }
  });
  list.addEventListener('keydown', (e) => {
    const links = [...list.querySelectorAll('a')];
    const i = links.indexOf(document.activeElement);
    if (e.key === 'ArrowDown' && i < links.length - 1) {
      e.preventDefault();
      links[i + 1].focus();
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      (i > 0 ? links[i - 1] : input).focus();
    }
  });
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const first = list.querySelector('a');
    if (first) location.assign(first.href);
    else run();
  });

  // Support links such as /resources/help-center?q=billing
  const q = new URLSearchParams(location.search).get('q');
  if (q) {
    input.value = q.slice(0, 120);
    run();
  }
}

document.querySelectorAll('[data-help-search]').forEach(init);
