/*
 * AccessBellFix: applies the accessibility fixes you have reviewed and
 * approved in your AccessBell dashboard, such as image alt text, accessible
 * names and the page language. It changes attributes only, never your design.
 * https://www.accessbell.co/resources/help-center/getting-started/install-accessbellfix
 */
(function () {
  'use strict';
  var me = document.currentScript || document.querySelector('script[data-site][src*="/fix.js"]');
  if (!me || !window.fetch) return;
  var key = me.getAttribute('data-site') || '';
  if (!/^[A-Za-z0-9_-]{16,40}$/.test(key)) return;
  var origin = new URL(me.src, location.href).origin;
  var fixes = [];
  // Scanners (including AccessBell's) wait for ready so they test the fixed page.
  var state = (window.AccessBellFix = { ready: false, applied: 0 });

  function setAttr(el, name, value) {
    if (el.getAttribute(name) !== value) el.setAttribute(name, value);
  }

  function apply() {
    for (var i = 0; i < fixes.length; i++) {
      var f = fixes[i];
      if (f.kind === 'lang') {
        setAttr(document.documentElement, 'lang', f.value);
        continue;
      }
      var nodes;
      try {
        nodes = document.querySelectorAll(f.selector);
      } catch (e) {
        continue; // an invalid selector skips that one fix
      }
      for (var j = 0; j < nodes.length; j++) {
        var el = nodes[j];
        if (f.kind === 'alt') {
          if (el.matches('img, area, input[type="image"]')) setAttr(el, 'alt', f.value);
          else if (el.matches('svg, [role="img"]')) {
            setAttr(el, 'role', 'img');
            setAttr(el, 'aria-label', f.value);
          }
        } else if (f.kind === 'name') {
          setAttr(el, 'aria-label', f.value);
        }
      }
    }
  }

  // Re-apply when the page adds content (menus, product grids, pop-ups).
  var queued = false;
  function schedule() {
    if (queued) return;
    queued = true;
    setTimeout(function () {
      queued = false;
      apply();
    }, 200);
  }

  fetch(origin + '/api/app/fix?k=' + encodeURIComponent(key), { credentials: 'omit' })
    .then(function (res) {
      return res.ok ? res.json() : { fixes: [] };
    })
    .then(function (data) {
      fixes = (data && data.fixes) || [];
      if (!fixes.length) return;
      apply();
      state.applied = fixes.length;
      new MutationObserver(schedule).observe(document.documentElement, { childList: true, subtree: true });
    })
    .catch(function () {})
    .then(function () {
      state.ready = true;
    });
})();
