// Site-wide behavior: mobile navigation and accessible tabs.
(function () {
  'use strict';

  // Mobile navigation disclosure
  var toggle = document.querySelector('[data-nav-toggle]');
  var nav = document.getElementById('primary-nav');
  if (toggle && nav) {
    var setOpen = function (open) {
      toggle.setAttribute('aria-expanded', String(open));
      nav.setAttribute('data-open', String(open));
    };
    toggle.addEventListener('click', function () {
      setOpen(toggle.getAttribute('aria-expanded') !== 'true');
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && toggle.getAttribute('aria-expanded') === 'true') {
        setOpen(false);
        toggle.focus();
      }
    });
    document.addEventListener('click', function (e) {
      if (toggle.getAttribute('aria-expanded') === 'true' && !nav.contains(e.target) && !toggle.contains(e.target)) {
        setOpen(false);
      }
    });
  }

  // Header "Resources" dropdown (button + hidden menu, WAI-ARIA disclosure pattern)
  document.querySelectorAll('[data-nav-dropdown-trigger]').forEach(function (trigger) {
    var menu = document.getElementById(trigger.getAttribute('aria-controls'));
    if (!menu) return;
    var setOpen = function (open) {
      trigger.setAttribute('aria-expanded', String(open));
      menu.hidden = !open;
    };
    trigger.addEventListener('click', function () {
      setOpen(trigger.getAttribute('aria-expanded') !== 'true');
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && trigger.getAttribute('aria-expanded') === 'true') {
        setOpen(false);
        trigger.focus();
      }
    });
    document.addEventListener('click', function (e) {
      if (trigger.getAttribute('aria-expanded') === 'true' && !menu.contains(e.target) && !trigger.contains(e.target)) {
        setOpen(false);
      }
    });
    document.addEventListener('focusin', function (e) {
      if (trigger.getAttribute('aria-expanded') === 'true' && !menu.contains(e.target) && !trigger.contains(e.target)) {
        setOpen(false);
      }
    });
  });

  // Tabs (WAI-ARIA Authoring Practices, automatic activation)
  document.querySelectorAll('[data-tabs]').forEach(function (root) {
    var tabs = Array.prototype.slice.call(root.querySelectorAll('[role="tab"]'));
    var select = function (tab, focus) {
      tabs.forEach(function (t) {
        var selected = t === tab;
        t.setAttribute('aria-selected', String(selected));
        t.tabIndex = selected ? 0 : -1;
        var panel = document.getElementById(t.getAttribute('aria-controls'));
        if (panel) panel.hidden = !selected;
      });
      if (focus) tab.focus();
    };
    tabs.forEach(function (tab, i) {
      tab.addEventListener('click', function () {
        select(tab, false);
      });
      tab.addEventListener('keydown', function (e) {
        var next = null;
        if (e.key === 'ArrowRight') next = tabs[(i + 1) % tabs.length];
        else if (e.key === 'ArrowLeft') next = tabs[(i - 1 + tabs.length) % tabs.length];
        else if (e.key === 'Home') next = tabs[0];
        else if (e.key === 'End') next = tabs[tabs.length - 1];
        if (next) {
          e.preventDefault();
          select(next, true);
        }
      });
    });
  });
})();
