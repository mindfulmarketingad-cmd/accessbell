// One-time report checkout forms (landing pages): POST the email and URL to
// /api/one-time-checkout, then send the buyer to the Stripe Payment Link.
// The URL field is prefilled from ?url= when the visitor arrives from a free scan.
const forms = document.querySelectorAll('[data-checkout-form]');

const params = new URLSearchParams(location.search);
const prefill = params.get('url') || '';

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
