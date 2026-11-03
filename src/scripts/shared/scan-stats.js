// Social proof: the real number of page scans run with AccessBell, read from
// the database via GET /api/scan?stats=1. No number is ever shown when the
// count is unavailable or still small; nothing here is invented.
const MIN_TO_SHOW = 100;
let pending;

/** Resolves to the page-scan count, or null when it should not be shown. */
export function pagesScanned() {
  pending ||= fetch('/api/scan?stats=1', { credentials: 'same-origin' })
    .then((r) => (r.ok ? r.json() : null))
    .then((d) => (Number.isInteger(d?.pagesScanned) && d.pagesScanned >= MIN_TO_SHOW ? d.pagesScanned : null))
    .catch(() => null);
  return pending;
}

/** "12,345 pages scanned with AccessBell" rounded down to a friendly figure. */
export function scannedText(n) {
  const step = n >= 10000 ? 1000 : n >= 1000 ? 100 : 10;
  return `${(Math.floor(n / step) * step).toLocaleString('en-US')}+ pages scanned with AccessBell`;
}

/** Fill every [data-scan-proof] slot: the count when available, plus "cancel anytime". */
export async function fillScanProof(root = document) {
  const slots = root.querySelectorAll('[data-scan-proof-count]');
  if (!slots.length) return;
  const n = await pagesScanned();
  for (const slot of slots) {
    if (n) {
      slot.textContent = scannedText(n);
      slot.hidden = false;
    }
  }
}
