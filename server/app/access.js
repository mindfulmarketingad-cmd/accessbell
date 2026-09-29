// Who may use the dashboard. An account has access when its owner is:
//   1. marked "Subscriber" (app.profiles.status), or
//   2. listed in app.subscriber_emails.
// If a migration has not been run yet, fall back to the next simpler rule so
// nobody is locked out while the database catches up:
//   0004 missing -> rule 1 only;  0003 missing -> the Stripe subscription status.

const UNDEFINED_TABLE = '42P01';
const UNDEFINED_COLUMN = '42703';

/**
 * SQL expressions (true when the account `alias` has access), most complete first.
 * @param {string} alias the accounts table alias in the calling query
 */
export const accessRules = (alias = 'a') => [
  `(exists (
      select 1 from app.account_members m
        join app.profiles pr on pr.user_id = m.user_id
       where m.account_id = ${alias}.id and m.role = 'owner'
         and (lower(btrim(pr.status)) = 'subscriber'
              or exists (select 1 from app.subscriber_emails s where s.email = lower(btrim(pr.email)))))
   )`,
  `(exists (
      select 1 from app.account_members m
        join app.profiles pr on pr.user_id = m.user_id
       where m.account_id = ${alias}.id and m.role = 'owner' and lower(btrim(pr.status)) = 'subscriber')
   )`,
  `(${alias}.subscription_status in ('trialing', 'active'))`,
];

/** Run `run(rule)` with the most complete rule the database supports. */
export async function withAccessRule(run, alias = 'a') {
  const rules = accessRules(alias);
  for (let i = 0; i < rules.length; i++) {
    try {
      return await run(rules[i]);
    } catch (err) {
      const missing = err?.code === UNDEFINED_TABLE || err?.code === UNDEFINED_COLUMN;
      if (!missing || i === rules.length - 1) throw err;
    }
  }
}
