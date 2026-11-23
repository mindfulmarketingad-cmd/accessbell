// One-time report checkout forms (landing pages): POST the email and URL to
// /api/one-time-checkout, then send the buyer to the Stripe Payment Link.
// The URL field is prefilled from ?url= when the visitor arrives from a free scan.
import { rememberCheckout } from './shared/ads-conversions.js';
const forms = document.querySelectorAll('[data-checkout-form]');

const params = new URLSearchParams(location.search);
const prefill = params.get('url') || '';

// Arriving from a free scan (?url=): name the scanned site in the hero, point
// the hero button at it, and send focus to the email field (the URL is filled).
const handoff = document.querySelector('[data-scan-handoff]');
let scannedHost = '';
try { if (prefill) scannedHost = new URL(prefill.includes('://') ? prefill : `https://${prefill}`).hostname.replace(/^www\./, ''); } catch { /* not a URL */ }
if (handoff && scannedHost) {
  const hostEl = handoff.querySelector('[data-scan-host]');
  if (hostEl) hostEl.textContent = scannedHost;
  handoff.hidden = false;
  const cta = document.querySelector('[data-handoff-cta]');
  const text = cta && cta.querySelector('[data-handoff-text]');
  if (cta && text && cta.dataset.handoffLabel) text.textContent = cta.dataset.handoffLabel.replace('{host}', scannedHost);
  const email = document.querySelector('[data-checkout-form] [name="email"]');
  if (cta && email) cta.addEventListener('click', () => { setTimeout(() => email.focus({ preventScroll: true }), 0); });
}

for (const form of forms) {
  const urlInput = form.elements.url;
  if (urlInput && prefill && !urlInput.value) urlInput.value = prefill;
  const errorBox = form.querySelector('[data-checkout-error]');
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const button = form.querySelector('button[type="submit"]');
    const email = (form.elements.email.value || '').trim();
    const url = (form.elements.url.value || '').trim();
    if (!email.includes('@') || !url) {
      if (errorBox) {
        errorBox.textContent = 'Enter an email address and a web address.';
        errorBox.hidden = false;
      }
      return;
    }
    button.disabled = true;
    if (errorBox) errorBox.hidden = true;
    try {
      const res = await fetch('/api/one-time-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ product: form.dataset.product, email, url }),
        credentials: 'same-origin',
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.checkoutUrl) throw new Error(data.error || 'Checkout could not be started. Please try again.');
      try {
        const ref = new URL(data.checkoutUrl).searchParams.get('client_reference_id');
        if (ref) rememberCheckout({ kind: 'one_time', token: ref, product: form.dataset.product });
      } catch { /* not a URL */ }
      location.href = data.checkoutUrl;
    } catch (err) {
      if (errorBox) {
        errorBox.textContent = err.message;
        errorBox.hidden = false;
      }
      button.disabled = false;
    }
  });
}
