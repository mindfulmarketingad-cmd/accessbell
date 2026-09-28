// A single stored scan report.
import { api, boot, el, qs, fmtDate } from './core.js';
import { mountFilteredReport } from './report.js';

await boot();
const box = document.querySelector('[data-report]');
try {
  const { scan } = await api(`scan?id=${encodeURIComponent(qs('id') || '')}`);
  document.title = `Report for ${scan.url} | AccessBell`;
  document.querySelector('[data-back]').setAttribute('href', `/app/page?id=${scan.page_id}`);
  document.querySelector('[data-back]').textContent = '← Scan history';
  const ring = el('div', { class: 'score-ring', 'data-band': scan.score >= 90 ? 'high' : scan.score >= 60 ? 'mid' : 'low', role: 'img', 'aria-label': `Score ${scan.score ?? 'not available'} out of 100` }, [el('span', { 'aria-hidden': 'true', text: scan.score === null ? '-' : String(scan.score) })]);
  ring.style.setProperty('--pct', String(scan.score || 0));
  const head = el('div', { class: 'results-head' }, [
    ring,
    el('div', {}, [
      el('h1', { class: 'h3-size', text: 'Accessibility report' }),
      el('p', { text: scan.url }),
      el('p', { text: `${scan.standard || 'WCAG'} - ${scan.device} - ${fmtDate(scan.created_at, true)}${scan.trigger === 'scheduled' ? ' - scheduled scan' : ''}` }),
    ]),
    el('ul', { class: 'results-stats' }, [
      el('li', {}, [el('strong', { text: String(scan.issues_count ?? 0) }), el('span', { text: 'Issues' })]),
      el('li', {}, [el('strong', { text: String((scan.issues || []).length) }), el('span', { text: 'Rules failed' })]),
      el('li', {}, [el('strong', { text: String((scan.passes || []).length) }), el('span', { text: 'Passed' })]),
    ]),
  ]);
  if (scan.status === 'failed') {
    box.replaceChildren(el('div', { class: 'results-body' }, [el('h1', { class: 'h3-size', text: 'This scan failed' }), el('p', { text: scan.error })]));
  } else {
    const reportBox = el('div', { class: 'results-filtered' });
    box.replaceChildren(head, reportBox);
    mountFilteredReport(reportBox, scan, { level: 2 });
  }
} catch (err) {
  box.replaceChildren(el('div', { class: 'results-body' }, [el('h1', { class: 'h3-size', text: 'Report not available' }), el('p', { text: err.message })]));
}
