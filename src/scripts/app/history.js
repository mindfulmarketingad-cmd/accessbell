// Scan history for one page (audit evidence).
import { api, boot, el, qs, fmtDate, scorePill } from './core.js';

await boot();
const box = document.querySelector('[data-history]');
try {
  const { page, scans } = await api(`page?id=${encodeURIComponent(qs('id') || '')}`);
  document.querySelector('[data-title]').textContent = page.url;
  document.querySelector('[data-back]').setAttribute('href', `/app/domain?id=${page.domainId}#pages`);
  document.querySelector('[data-back]').textContent = `← ${page.hostname}`;
  box.replaceChildren(
    scans.length
      ? el('div', { class: 'table-wrap' }, [
          el('table', { class: 'data-table' }, [
            el('caption', { class: 'visually-hidden', text: 'Scan history' }),
            el('thead', {}, [el('tr', {}, ['Date', 'Device', 'Score', 'Issues', 'Type', 'Standard'].map((h) => el('th', { scope: 'col', class: h === 'Score' || h === 'Issues' ? 'num' : undefined, text: h })))]),
            el(
              'tbody',
              {},
              scans.map((s) =>
                el('tr', {}, [
                  el('th', { scope: 'row' }, [el('a', { href: `/app/scan?id=${s.id}`, text: fmtDate(s.created_at, true) })]),
                  el('td', { text: s.device }),
                  el('td', { class: 'num' }, [s.status === 'failed' ? el('span', { class: 'tag tag-serious', text: 'Failed' }) : scorePill(s.score)]),
                  el('td', { class: 'num', text: s.issues_count === null ? '-' : String(s.issues_count) }),
                  el('td', { text: s.trigger === 'scheduled' ? 'Scheduled' : 'Manual' }),
                  el('td', { text: s.standard || '-' }),
                ]),
              ),
            ),
          ]),
        ])
      : el('p', { class: 'muted', text: 'No scans yet.' }),
  );
} catch (err) {
  box.replaceChildren(el('p', { text: err.message }));
}
