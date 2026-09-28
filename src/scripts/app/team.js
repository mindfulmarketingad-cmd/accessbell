// User management and role-based permissions.
import { api, boot, el, busy, can, setStatus } from './core.js';

const me = await boot();
const $ = (s) => document.querySelector(s);
const RANK = { viewer: 1, member: 2, admin: 3, owner: 4 };
const ROLE_LABEL = { owner: 'Owner', admin: 'Admin', member: 'Member', viewer: 'Viewer' };

async function load() {
  const { members } = await api('team');
  const status = $('[data-members-status]');
  const rows = members.map((m) => {
    const isSelf = m.user_id === me.user.id;
    const manageable = !isSelf && m.role !== 'owner' && can(me, 'admin') && RANK[m.role] < RANK[me.role];
    let roleCell;
    if (manageable) {
      const select = el('select', { 'aria-label': `Role for ${m.email}` }, ['admin', 'member', 'viewer'].filter((r) => r !== 'admin' || me.role === 'owner').map((r) => el('option', { value: r, text: ROLE_LABEL[r], selected: r === m.role })));
      select.addEventListener('change', async () => {
        try {
          await api('team/role', { method: 'POST', body: { userId: m.user_id, role: select.value } });
          setStatus(status, 'success', `${m.email} is now ${ROLE_LABEL[select.value].toLowerCase()}.`);
        } catch (err) {
          setStatus(status, 'error', err.message);
          select.value = m.role;
        }
      });
      roleCell = el('td', {}, [select]);
    } else {
      roleCell = el('td', { text: ROLE_LABEL[m.role] });
    }
    const actions = el('td', { class: 'actions' });
    if (manageable || (isSelf && m.role !== 'owner')) {
      const remove = el('button', { class: 'btn btn-danger btn-sm', type: 'button', text: isSelf ? 'Leave team' : 'Remove' });
      remove.addEventListener(
        'click',
        busy(remove, status, async () => {
          if (!confirm(isSelf ? 'Leave this team?' : `Remove ${m.email} from the team?`)) return;
          await api('team/remove', { method: 'POST', body: { userId: m.user_id } });
          if (isSelf) location.assign('/app');
          else await load();
        }),
      );
      actions.append(remove);
    }
    return el('tr', {}, [el('th', { scope: 'row', text: m.email + (isSelf ? ' (you)' : '') }), roleCell, actions]);
  });
  $('[data-members]').replaceChildren(
    el('div', { class: 'table-wrap' }, [
      el('table', { class: 'data-table' }, [
        el('caption', { class: 'visually-hidden', text: 'Team members' }),
        el('thead', {}, [el('tr', {}, [el('th', { scope: 'col', text: 'Email' }), el('th', { scope: 'col', text: 'Role' }), el('th', { scope: 'col' }, [el('span', { class: 'visually-hidden', text: 'Actions' })])])]),
        el('tbody', {}, rows),
      ]),
    ]),
  );
}

if (can(me, 'admin')) {
  $('[data-invite-panel]').hidden = false;
  if (me.role !== 'owner') $('#invite-role option[value="admin"]').remove();
  const form = $('[data-invite]');
  const status = $('[data-invite-status]');
  form.addEventListener(
    'submit',
    busy(form.querySelector('button'), status, async () => {
      const email = form.elements.email.value.trim();
      if (!form.elements.email.checkValidity() || !email) throw new Error('Enter a valid email address.');
      await api('team/invite', { method: 'POST', body: { email, role: form.elements.role.value } });
      form.reset();
      setStatus(status, 'success', `Invitation sent to ${email}.`);
      await load();
    }),
  );
}
await load();
