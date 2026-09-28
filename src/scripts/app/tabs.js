// Accessible tabs (WAI-ARIA Authoring Practices, automatic activation).
export function initTabs(root) {
  if (!root) return;
  const tabs = [...root.querySelectorAll('[role="tab"]')];
  const select = (tab, focus) => {
    for (const t of tabs) {
      const on = t === tab;
      t.setAttribute('aria-selected', String(on));
      t.tabIndex = on ? 0 : -1;
      const panel = document.getElementById(t.getAttribute('aria-controls'));
      if (panel) panel.hidden = !on;
    }
    if (focus) tab.focus();
    history.replaceState(null, '', `${location.pathname}${location.search}#${tab.id.replace(/^tab-/, '')}`);
  };
  tabs.forEach((tab, i) => {
    tab.addEventListener('click', () => select(tab, false));
    tab.addEventListener('keydown', (e) => {
      const next = { ArrowRight: tabs[(i + 1) % tabs.length], ArrowLeft: tabs[(i - 1 + tabs.length) % tabs.length], Home: tabs[0], End: tabs[tabs.length - 1] }[e.key];
      if (next) {
        e.preventDefault();
        select(next, true);
      }
    });
  });
  const initial = tabs.find((t) => t.id === `tab-${location.hash.slice(1)}`);
  if (initial) select(initial, false);
  /** Switch to a tab by name (the id without "tab-") and move focus to it. */
  return (name) => {
    const tab = tabs.find((t) => t.id === `tab-${name}`);
    if (tab) select(tab, true);
  };
}
