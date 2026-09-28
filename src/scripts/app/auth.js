// Sign in, sign up, password reset and email-link callback.
import { api, setStatus } from './core.js';

/** Only allow redirects back into the dashboard (no open redirects). */
function safeNext(fallback = '/app') {
  const next = new URLSearchParams(location.search).get('next') || '';
  return /^\/app(\/[\w\-./?=&%]*)?$/.test(next) && !next.startsWith('//') ? next : fallback;
}

// Show or hide the password. The button keeps its name and reports its state.
document.querySelectorAll('[data-password-toggle]').forEach((btn) => {
  const input = document.getElementById(btn.getAttribute('aria-controls'));
  btn.addEventListener('click', () => {
    const show = input.type === 'password';
    input.type = show ? 'text' : 'password';
    btn.setAttribute('aria-pressed', String(show));
  });
});

const form = document.querySelector('[data-auth-form]');
if (form) {
  const mode = form.getAttribute('data-auth-form');
  const status = form.querySelector('[data-status]');
  const button = form.querySelector('button[type="submit"]');

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    const invalid = [...form.elements].find((f) => f.willValidate && !f.checkValidity());
    if (invalid) {
      setStatus(
        status,
        'error',
        invalid.type === 'email'
          ? 'Enter a valid email address.'
          : invalid.type === 'password'
            ? 'Passwords must be at least 8 characters.'
            : invalid.type === 'checkbox'
              ? 'Please agree to the Terms of Service and Privacy Policy to continue.'
              : 'Please complete this form.',
      );
      invalid.focus();
      return;
    }
    button.disabled = true;
    setStatus(status, '', 'Please wait...');
    const email = form.elements.email?.value.trim();
    const password = form.elements.password?.value;
    try {
      if (mode === 'login') {
        await api('auth/login', { method: 'POST', body: { email, password }, redirectOn401: false });
        location.assign(safeNext());
      } else if (mode === 'signup') {
        await api('auth/signup', { method: 'POST', body: { email, password }, redirectOn401: false });
        location.assign('/app');
      } else if (mode === 'forgot') {
        await api('auth/forgot', { method: 'POST', body: { email }, redirectOn401: false });
        setStatus(status, 'success', 'If an account exists for that email, a reset link is on its way.');
      } else if (mode === 'reset') {
        await api('auth/password', { method: 'POST', body: { password } });
        setStatus(status, 'success', 'Password updated. Taking you to your dashboard...');
        setTimeout(() => location.assign('/app'), 900);
      }
    } catch (err) {
      setStatus(status, 'error', err.message);
    } finally {
      button.disabled = false;
    }
  });
}

// Email links: Supabase sends tokens in the URL fragment (or a token_hash in the query).
const callback = document.querySelector('[data-auth-callback]');
if (callback) {
  (async () => {
    const hash = new URLSearchParams(location.hash.slice(1));
    const query = new URLSearchParams(location.search);
    history.replaceState(null, '', location.pathname); // remove tokens from the address bar
    const type = hash.get('type') || query.get('type');
    try {
      if (hash.get('error_description')) throw new Error(hash.get('error_description'));
      if (hash.get('access_token')) {
        await api('auth/session', {
          method: 'POST',
          redirectOn401: false,
          body: { access_token: hash.get('access_token'), refresh_token: hash.get('refresh_token'), expires_in: hash.get('expires_in') },
        });
      } else if (query.get('token_hash')) {
        await api('auth/verify', { method: 'POST', redirectOn401: false, body: { token_hash: query.get('token_hash'), type } });
      } else {
        throw new Error('That link is missing its sign-in details. Please request a new one.');
      }
      location.replace(type === 'recovery' || type === 'invite' ? '/app/reset' : '/app');
    } catch (err) {
      callback.querySelector('[data-message]').textContent = err.message;
      callback.querySelector('[data-retry]').hidden = false;
    }
  })();
}
