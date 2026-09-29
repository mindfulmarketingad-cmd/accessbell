// Shared by the domain list, Found Pages and the domain page: the domain's
// actions menu and the "Scanning in progress" dialog.
import { api, el, icon, can, pool, disclosure } from './core.js';

/** "6 days ago", "in 14 hours". */
export function relative(value) {
  const diff = (new Date(value).getTime() - Date.now()) / 1000;
  const units = [['year', 31536000], ['month', 2592000], ['day', 86400], ['hour', 3600], ['minute', 60]];
  const rtf = new Intl.RelativeTimeFormat(undefined, { numeric: 'auto' });
  for (const [unit, secs] of units) if (Math.abs(diff) >= secs) return rtf.format(Math.round(diff / secs), unit);
  return rtf.format(Math.round(diff), 'second');
}

/** Scheduled monitoring runs daily at 06:00 UTC. */
export function nextScheduledScan() {
  const now = new Date();
  const next = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 6));
  if (next <= now) next.setUTCDate(next.getUTCDate() + 1);
  return next;
}

// ---------- Scanning in progress ----------

let scanDialog;
function dialogParts() {
  if (scanDialog) return scanDialog;
  const title = el('h2', { id: 'scan-dialog-title', text: 'Scanning in progress' });
  const text = el('p', { class: 'scan-dialog-text', role: 'status', 'aria-live': 'polite' });
  const bar = el('progress', { max: '1', value: '0', 'aria-labelledby': 'scan-dialog-title' });
  const note = el('p', { class: 'muted scan-dialog-note' });
  const leave = el('button', { class: 'btn btn-outline', type: 'button', text: 'Keep scanning in the background' });
  const node = el('dialog', { class: 'dialog scan-dialog', 'aria-labelledby': 'scan-dialog-title' }, [
    el('div', { class: 'dialog-body' }, [
      el('div', { class: 'scan-anim', 'aria-hidden': 'true' }, [el('span'), el('span'), el('span'), icon('scan')]),
      title,
      text,
      bar,
      note,
      leave,
    ]),
  ]);
  // A scan cannot be cancelled half way, so Escape does not close the dialog.
  node.addEventListener('cancel', (e) => e.preventDefault());
  document.body.append(node);
  scanDialog = { node, text, bar, note, leave };
  return scanDialog;
}

const pagesText = (n) => `${n.toLocaleString()} page${n === 1 ? '' : 's'}`;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/**
 * Scan a domain's monitored pages while the dialog shows progress. Small
 * selections are scanned from this tab; large ones run on our servers and
 * this polls their progress. Resolves with { total, failed, background, left }.
 */
export async function scanDomainWithDialog(domainId) {
  const start = await api('domain/scan', { method: 'POST', body: { id: domainId } });
  const { node, text, bar, note, leave } = dialogParts();
  const total = start.mode === 'client' ? start.pages.length : start.total;
  bar.max = String(total);
  bar.value = 0;
  text.textContent = `Scanning 0 of ${pagesText(total)}...`;
  node.showModal();
  try {
    if (start.mode === 'client') {
      note.textContent = 'Each page is loaded in a real browser and tested against your WCAG settings. Keep this tab open until it finishes.';
      leave.hidden = true;
      const results = await pool(start.pages, 2, (p) => api('scan', { method: 'POST', body: { pageId: p.id } }), (done) => {
        bar.value = done;
        text.textContent = `Scanning ${done} of ${pagesText(total)}...`;
      });
      // A page fails when the request errors or every device scan of it failed.
      const failed = results.filter((r) => r instanceof Error || !r?.scans?.some((x) => x.status === 'done')).length;
      text.textContent = 'Scan complete. Loading your results...';
      return { total, failed, background: false };
    }
    note.textContent = 'This scan runs on our servers, so you can close this tab or keep working. Results appear as each page finishes.';
    leave.hidden = false;
    let left = false;
    const onLeave = () => (left = true);
    leave.addEventListener('click', onLeave, { once: true });
    let status = { done: 0, failed: 0 };
    while (!left && status.done < total) {
      await sleep(4000);
      status = await api(`domain/scan-status?id=${encodeURIComponent(domainId)}&since=${encodeURIComponent(start.since)}`).catch(() => status);
      bar.value = status.done;
      text.textContent = `Scanning ${status.done.toLocaleString()} of ${pagesText(total)}...`;
    }
    leave.removeEventListener('click', onLeave);
    return { total, failed: status.failed, background: true, left, done: status.done };
  } finally {
    node.close();
  }
}

/** Re-scan every monitored page of a domain. */
export const rescanDomain = scanDomainWithDialog;

/** A one-line result for the status line after a scan. */
export function scanMessage(r, hostname) {
  if (r.left) return `Scanning ${pagesText(r.total)} of ${hostname} in the background. ${r.done.toLocaleString()} done so far; results update as pages finish.`;
  const ok = r.total - r.failed;
  return r.failed
    ? `Scan complete for ${hostname}: ${pagesText(ok)} scanned, ${r.failed.toLocaleString()} could not be scanned.`
    : `Scan complete for ${hostname}: ${pagesText(r.total)} scanned.`;
}

// ---------- Domain actions menu ----------

/**
 * The ⋮ menu for a domain. `d` needs id, hostname, scanned (bool) and
 * monitored (count). Hooks: onRescan, onAddSubdomain, onRemoved.
 */
export function domainMenu(me, d, { onRescan, onAddSubdomain, onRemoved, status, align = 'down' } = {}) {
  const menuId = `menu-${d.id}`;
  const button = el('button', { class: 'icon-btn', type: 'button', 'aria-expanded': 'false', 'aria-controls': menuId }, [
    icon('more'),
    el('span', { class: 'visually-hidden', text: `Actions for ${d.hostname}` }),
  ]);
  const base = `/app/domain?id=${encodeURIComponent(d.id)}`;
  const editPages = me.subscribed && can(me, 'member');
  const item = (iconName, label, { href, onClick, disabled, danger } = {}) => {
    const node = href && !disabled ? el('a', { href }) : el('button', { type: 'button', disabled });
    node.append(icon(iconName), el('span', { text: label }));
    if (danger) node.classList.add('menu-danger');
    if (onClick && !disabled) node.addEventListener('click', onClick);
    return node;
  };
  const sep = () => el('hr', { class: 'menu-sep', 'aria-hidden': 'true' });
  const menu = el('div', { class: `menu menu-${align} domain-menu`, id: menuId, hidden: true });
  const close = () => setOpen(false);
  menu.append(
    item('doc', 'Export fixing instructions', { href: `${base}&export=csv`, disabled: !d.scanned }),
    item('print', 'Export PDF summary', { href: `${base}&export=pdf`, disabled: !d.scanned }),
    sep(),
    item('chart', 'View scan details', { href: base }),
    item('refresh', 'Re-scan domain', {
      disabled: !editPages || !d.monitored,
      onClick: async () => {
        close();
        try {
          await onRescan?.();
        } catch (err) {
          if (status) status.textContent = err.message;
          else alert(err.message);
        }
      },
    }),
    item('list', 'Manage domain pages', { href: `/app/pages?id=${encodeURIComponent(d.id)}` }),
    item('gear', 'Domain settings', { href: `${base}&tab=settings` }),
    item('plus', 'Add subdomain', {
      disabled: !can(me, 'admin'),
      onClick: () => {
        close();
        onAddSubdomain?.();
      },
    }),
  );
  if (can(me, 'admin')) {
    menu.append(
      sep(),
      item('x', 'Remove domain', {
        danger: true,
        onClick: async () => {
          close();
          if (!confirm(`Remove ${d.hostname} and all of its scan history? This cannot be undone.`)) return;
          try {
            await api('domain/delete', { method: 'POST', body: { id: d.id } });
            onRemoved?.();
          } catch (err) {
            alert(err.message);
          }
        },
      }),
    );
  }
  const setOpen = disclosure(button, menu);
  return el('div', { class: 'menu-wrap' }, [button, menu]);
}
