// Team name and password.
import { api, boot, busy, can, setStatus } from './core.js';

const me = await boot();
const $ = (s) => document.querySelector(s);

const accountForm = $('[data-account-form]');
accountForm.elements.name.value = me.account.name;
if (!can(me, 'admin')) accountForm.querySelectorAll('input, button').forEach((x) => (x.disabled = true));
accountForm.addEventListener(
  'submit',
  busy(accountForm.querySelector('button'), $('[data-account-status]'), async () => {
    const { account } = await api('account', { method: 'POST', body: { name: accountForm.elements.name.value } });
    document.querySelector('[data-account-name]').textContent = account.name;
    setStatus($('[data-account-status]'), 'success', 'Team name saved.');
  }),
);

$('[data-email]').textContent = `Signed in as ${me.user.email}`;
const pw = $('[data-password-form]');
pw.addEventListener(
  'submit',
  busy(pw.querySelector('button'), $('[data-password-status]'), async () => {
    if (!pw.elements.password.checkValidity()) throw new Error('Passwords must be at least 8 characters.');
    await api('auth/password', { method: 'POST', body: { password: pw.elements.password.value } });
    pw.reset();
    setStatus($('[data-password-status]'), 'success', 'Password updated.');
  }),
);
