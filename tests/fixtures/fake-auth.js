// A tiny stand-in for Supabase Auth (GoTrue) used by tests and local demos.
// Users are kept in memory and mirrored into auth.users in the test database.
import http from 'node:http';
import crypto from 'node:crypto';

export function startFakeAuth(pool) {
  const users = new Map(); // email -> { id, email, password, confirmed }
  // Mimics Supabase with "Confirm email" turned on: sign-up returns a user but no session.
  const state = { confirmEmail: false };
  const tokens = new Map(); // access token -> user
  const refresh = new Map(); // refresh token -> user
  const issue = (user) => {
    const at = `at-${crypto.randomUUID()}`;
    const rt = `rt-${crypto.randomUUID()}`;
    tokens.set(at, user);
    refresh.set(rt, user);
    return { access_token: at, refresh_token: rt, expires_in: 3600, user: { id: user.id, email: user.email } };
  };
  const createUser = async (email, password, confirmed = !state.confirmEmail) => {
    const id = crypto.randomUUID();
    await pool.query('insert into auth.users (id, email) values ($1, $2)', [id, email]);
    const u = { id, email, password, confirmed };
    users.set(email, u);
    return u;
  };
  const server = http.createServer(async (req, res) => {
    const url = new URL(req.url, 'http://x');
    let body = '';
    for await (const c of req) body += c;
    const data = body ? JSON.parse(body) : {};
    const send = (status, obj) => {
      res.writeHead(status, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(obj));
    };
    const bearer = (req.headers.authorization || '').replace('Bearer ', '');
    const path = url.pathname.replace('/auth/v1', '');
    if (path === '/signup' && req.method === 'POST') {
      if (state.confirmEmail) {
        // Existing addresses get an obfuscated user, so the response does not reveal them.
        if (users.has(data.email)) return send(200, { id: crypto.randomUUID(), email: data.email, identities: [] });
        const u = await createUser(data.email, data.password);
        return send(200, { id: u.id, email: u.email, identities: [{ provider: 'email' }] });
      }
      if (users.has(data.email)) return send(422, { error_code: 'user_already_exists' });
      return send(200, issue(await createUser(data.email, data.password)));
    }
    if (path === '/token' && url.searchParams.get('grant_type') === 'password') {
      const u = users.get(data.email);
      if (!u || u.password !== data.password) return send(400, { error_code: 'invalid_credentials' });
      if (!u.confirmed) return send(400, { error_code: 'email_not_confirmed' });
      return send(200, issue(u));
    }
    if (path === '/token' && url.searchParams.get('grant_type') === 'refresh_token') {
      const u = refresh.get(data.refresh_token);
      if (!u) return send(400, { error_code: 'refresh_token_not_found' });
      refresh.delete(data.refresh_token);
      return send(200, issue(u));
    }
    if (path === '/user' && req.method === 'GET') {
      const u = tokens.get(bearer);
      return u ? send(200, { id: u.id, email: u.email }) : send(401, { error_code: 'bad_jwt' });
    }
    if (path === '/user' && req.method === 'PUT') {
      const u = tokens.get(bearer);
      if (!u) return send(401, { error_code: 'bad_jwt' });
      u.password = data.password;
      return send(200, { id: u.id });
    }
    if (path === '/logout') {
      tokens.delete(bearer);
      return send(204, {});
    }
    if (path === '/recover') return send(200, {});
    if (path === '/resend') {
      if (data.email === 'mailer-down@example.com') return send(500, { code: 'unexpected_failure', msg: 'Error sending confirmation email' });
      return send(200, {});
    }
    if (path === '/admin/users' && req.method === 'POST') {
      if (bearer !== 'service-key') return send(401, {});
      if (users.has(data.email)) return send(422, { error_code: 'email_exists' });
      const u = await createUser(data.email, data.password, data.email_confirm === true || !state.confirmEmail);
      return send(200, { id: u.id, email: u.email });
    }
    const adminUser = /^\/admin\/users\/([^/]+)$/.exec(path);
    if (adminUser && req.method === 'PUT') {
      if (bearer !== 'service-key') return send(401, {});
      const u = [...users.values()].find((x) => x.id === adminUser[1]);
      if (!u) return send(404, { error_code: 'user_not_found' });
      if (data.email_confirm === true) u.confirmed = true;
      return send(200, { id: u.id, email: u.email });
    }
    if (path === '/invite') {
      if (bearer !== 'service-key') return send(401, {});
      const u = await createUser(data.email, 'invited-password');
      return send(200, { id: u.id, email: u.email });
    }
    send(404, {});
  });
  return new Promise((resolve) => {
    server.listen(0, '127.0.0.1', () => resolve({ server, users, tokens, state, expire: (at) => tokens.delete(at) }));
  });
}
