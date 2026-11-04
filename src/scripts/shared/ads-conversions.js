// Google Ads conversion events (tag AW-18266125976, loaded by GoogleTag.astro +
// /js/gtag-config.js). Each conversion is sent at most once per transaction id,
// remembered in localStorage, so refreshes and revisits never double count.
// Google Ads also dedupes on transaction_id server-side.
const SEND_TO = {
  purchase: 'AW-18266125976/fiRTCJn_mLIdEJjt-4VE',
  trial: 'AW-18266125976/3bS7CJz_mLIdEJjt-4VE',
  freeScan: 'AW-18266125976/n2yJCJ__mLIdEJjt-4VE',
};
const PENDING_KEY = 'ab_pending_checkout';
const store = {
  get(k) { try { return localStorage.getItem(k); } catch { return null; } },
  set(k, v) { try { localStorage.setItem(k, v); } catch { /* storage blocked */ } },
  del(k) { try { localStorage.removeItem(k); } catch { /* storage blocked */ } },
};

function sendOnce(kind, id, params = {}) {
  if (!id) return false;
  const key = `ab_conv_${kind}_${id}`;
  if (store.get(key)) return false;
  store.set(key, String(Date.now()));
  const g = window.gtag || function () { (window.dataLayer = window.dataLayer || []).push(arguments); };
  g('event', 'conversion', { send_to: SEND_TO[kind], transaction_id: String(id), ...params });
  return true;
}

/** Remember a checkout the visitor is about to start (called right before the Stripe redirect). */
export function rememberCheckout(info) {
  store.set(PENDING_KEY, JSON.stringify({ ...info, at: Date.now() }));
}

/** The checkout started in this browser in the last 24 hours, if any. */
export function pendingCheckout() {
  try {
    const p = JSON.parse(store.get(PENDING_KEY) || 'null');
    if (p && Date.now() - p.at < 86400000) return p;
  } catch { /* ignore */ }
  store.del(PENDING_KEY);
  return null;
}
export const clearPendingCheckout = () => store.del(PENDING_KEY);

export const trackPurchase = (id, value) => sendOnce('purchase', id, { value, currency: 'USD' });
export const trackTrial = (id, value = 29) => sendOnce('trial', id, { value, currency: 'USD' });
/** One Free Scan conversion per browser session. */
export function trackFreeScan() {
  let sid;
  try {
    sid = sessionStorage.getItem('ab_scan_sid');
    if (!sid) { sid = `${Date.now()}-${Math.random().toString(36).slice(2)}`; sessionStorage.setItem('ab_scan_sid', sid); }
  } catch { sid = 'nostorage'; }
  return sendOnce('freeScan', sid);
}
