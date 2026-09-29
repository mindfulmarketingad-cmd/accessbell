// Pricing page calculator: what checking accessibility by hand costs per year,
// compared with AccessBell Pro. Uses only the visitor's inputs and the
// published price, and never claims savings that the inputs do not show.
export const PRICE_PER_DOMAIN_MONTH = 29;
export const MAX_PAGES_PER_DOMAIN = 500;

const clamp = (value, min, max) => {
  const n = Number(value);
  return Number.isFinite(n) ? Math.min(Math.max(n, min), max) : min;
};

/** Yearly cost of testing every page by hand, versus AccessBell Pro, for the inputs given. */
export function compute(input) {
  const domains = Math.round(clamp(input.domains, 1, 50));
  const pages = Math.round(clamp(input.pages, 1, MAX_PAGES_PER_DOMAIN));
  const minutes = clamp(input.minutes, 1, 480);
  const checks = Math.round(clamp(input.checks, 1, 365));
  const rate = clamp(input.rate, 1, 1000);
  const hours = (domains * pages * minutes * checks) / 60;
  const manual = hours * rate;
  const tool = domains * PRICE_PER_DOMAIN_MONTH * 12;
  const saving = manual - tool;
  return { domains, pages, minutes, checks, rate, hours, manual, tool, saving, percent: manual > 0 ? saving / manual : 0 };
}

export const money = (n) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(Math.round(n));
const whole = (n) => new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 }).format(Math.round(n));

/** Text for the result panel. */
export function describe(r) {
  const better = r.saving > 0;
  return {
    headline: better ? money(r.saving) : money(0),
    label: better ? 'Potential yearly saving' : 'No saving at these numbers',
    manual: money(r.manual),
    tool: money(r.tool),
    hours: `${whole(r.hours)} hours`,
    summary: better
      ? `Checking by hand could cost about ${money(r.manual)} a year. AccessBell Pro costs ${money(r.tool)} a year, so you could save about ${money(r.saving)}, or ${r.percent >= 0.995 ? 'over 99' : Math.round(r.percent * 100)} percent.`
      : `At these numbers, checking by hand costs about ${money(r.manual)} a year and AccessBell Pro costs ${money(r.tool)}. Try more pages or more frequent checks.`,
  };
}

function init() {
  const root = document.querySelector('[data-calc]');
  if (!root) return;
  const val = (name) => root.querySelector(`[name="${name}"]`).value;
  const set = (sel, text) => (root.querySelector(sel).textContent = text);
  const read = () => compute({ domains: val('domains'), pages: val('pages'), minutes: val('minutes'), checks: val('checks'), rate: val('rate') });
  const paint = (announce) => {
    const d = describe(read());
    set('[data-calc-headline]', d.headline);
    set('[data-calc-label]', d.label);
    set('[data-calc-manual]', d.manual);
    set('[data-calc-tool]', d.tool);
    set('[data-calc-hours]', d.hours);
    // The spoken summary updates when a field is finished, not on every keystroke.
    if (announce) set('[data-calc-summary]', d.summary);
  };
  root.addEventListener('input', () => paint(false));
  root.addEventListener('change', () => paint(true));
  root.addEventListener('submit', (e) => e.preventDefault());
  paint(false);
}

if (typeof document !== 'undefined') init();
