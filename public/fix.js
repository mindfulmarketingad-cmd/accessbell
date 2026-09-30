/*
 * AccessBellFix: applies the accessibility fixes you have reviewed and
 * approved in your AccessBell dashboard, such as image alt text, accessible
 * names and the page language. It changes attributes only, never your design.
 * When the site turns it on, it also adds the PageAssist toolbar, which lets
 * each visitor adjust text size, contrast, spacing, fonts, links and motion
 * for themselves.
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

  // ---------- PageAssist toolbar ----------

  var TAG = 'accessbell-pageassist';
  var STORE = 'accessbell-pageassist';
  var SCALES = [1, 1.1, 1.25, 1.4, 1.6];
  var DEFAULTS = { scale: 0, contrast: 'default', spacing: false, font: false, links: false, motion: false };

  function loadPrefs() {
    try {
      var saved = JSON.parse(localStorage.getItem(STORE) || '{}');
      var out = {};
      for (var k in DEFAULTS) out[k] = k in saved ? saved[k] : DEFAULTS[k];
      return out;
    } catch (e) {
      return Object.assign({}, DEFAULTS);
    }
  }
  function savePrefs(p) {
    try {
      localStorage.setItem(STORE, JSON.stringify(p));
    } catch (e) {}
  }

  // Styles go in constructed style sheets, which work under a strict
  // Content-Security-Policy. Older browsers fall back to a <style> element.
  function sheet(css) {
    try {
      var s = new CSSStyleSheet();
      s.replaceSync(css);
      return s;
    } catch (e) {
      return null;
    }
  }
  var pageSheet = null;
  var pageStyleEl = null;
  function setPageCss(css) {
    if (!pageSheet && !pageStyleEl) {
      pageSheet = sheet('');
      if (pageSheet && document.adoptedStyleSheets) {
        document.adoptedStyleSheets = document.adoptedStyleSheets.concat([pageSheet]);
      } else {
        pageSheet = null;
        pageStyleEl = document.createElement('style');
        document.head.appendChild(pageStyleEl);
      }
    }
    if (pageSheet) pageSheet.replaceSync(css);
    else pageStyleEl.textContent = css;
  }

  function pageCss(p) {
    var css = '';
    var not = ':not(' + TAG + ')';
    var text = 'body *' + not + ':not(svg):not(svg *)';
    var scale = SCALES[p.scale] || 1;
    if (scale !== 1) css += 'body > *' + not + '{zoom:' + scale + '}';
    if (p.contrast === 'high') css += 'html{filter:contrast(1.4)}';
    if (p.contrast === 'grayscale') css += 'html{filter:grayscale(1)}';
    if (p.contrast === 'dark') {
      css +=
        'html{filter:invert(1) hue-rotate(180deg);background:#fff}' +
        'img,picture,video,canvas,iframe,[style*="background-image"],' + TAG + '{filter:invert(1) hue-rotate(180deg)}';
    }
    if (p.spacing) {
      css += text + '{line-height:1.5!important;letter-spacing:0.12em!important;word-spacing:0.16em!important}p' + not + '{margin-bottom:2em!important}';
    }
    if (p.font) {
      css += text + ':not(i):not([class*="icon"]):not([class*="fa-"]):not(.material-icons){font-family:Verdana,Arial,Helvetica,sans-serif!important;font-style:normal!important}';
    }
    if (p.links) {
      css += 'a[href]{text-decoration:underline!important;text-underline-offset:3px!important;background:#ffe45c!important;color:#1a1a1a!important;outline:2px solid #1a1a1a!important}';
    }
    if (p.motion) {
      css += '*,*::before,*::after{animation-duration:0s!important;animation-delay:0s!important;animation-iteration-count:1!important;transition:none!important;scroll-behavior:auto!important}';
    }
    return css;
  }

  var UI_CSS =
    ':host{all:initial;position:fixed;z-index:2147483646;bottom:16px;font:16px/1.4 system-ui,-apple-system,"Segoe UI",Roboto,Arial,sans-serif;color:#1f2430}' +
    ':host([data-side="right"]){right:16px}:host([data-side="left"]){left:16px}' +
    '*{box-sizing:border-box}' +
    'button{font:inherit;color:inherit;cursor:pointer}' +
    ':focus-visible{outline:3px solid #1d4ed8;outline-offset:2px}' +
    '.launch{display:grid;place-items:center;width:52px;height:52px;border:2px solid #fff;border-radius:50%;background:#1f2430;color:#fff;box-shadow:0 4px 14px rgba(0,0,0,.3)}' +
    '.launch svg{width:30px;height:30px}' +
    '.panel{position:absolute;bottom:64px;width:min(340px,calc(100vw - 32px));max-height:min(620px,calc(100vh - 96px));overflow:auto;padding:16px;border:1px solid #c9cdd6;border-radius:14px;background:#fff;box-shadow:0 12px 40px rgba(0,0,0,.25)}' +
    ':host([data-side="right"]) .panel{right:0}:host([data-side="left"]) .panel{left:0}' +
    '.panel[hidden]{display:none}' +
    '.head{display:flex;align-items:center;justify-content:space-between;gap:8px;margin-bottom:8px}' +
    'h2{margin:0;font-size:18px;font-weight:700}' +
    '.close{min-width:44px;min-height:44px;border:1px solid #c9cdd6;border-radius:10px;background:#fff}' +
    'fieldset{margin:12px 0 0;padding:0;border:0}' +
    'legend,.label{margin-bottom:6px;padding:0;font-size:14px;font-weight:700}' +
    '.row{display:flex;gap:6px;align-items:center}' +
    '.row button{flex:1;min-height:44px;border:1px solid #c9cdd6;border-radius:10px;background:#f4f5f7;font-weight:600}' +
    '.size{min-width:60px;text-align:center;font-weight:700}' +
    '.opts{display:grid;grid-template-columns:1fr 1fr;gap:6px}' +
    '.opts label{display:flex;align-items:center;gap:8px;min-height:44px;padding:8px 10px;border:1px solid #c9cdd6;border-radius:10px;background:#f4f5f7;font-size:14px;font-weight:600;cursor:pointer}' +
    '.opts input{width:18px;height:18px;margin:0;accent-color:#1f2430}' +
    '.toggles{display:grid;gap:6px;margin-top:12px}' +
    '.toggle{display:flex;justify-content:space-between;align-items:center;width:100%;min-height:44px;padding:8px 12px;border:1px solid #c9cdd6;border-radius:10px;background:#f4f5f7;font-size:15px;font-weight:600;text-align:left}' +
    '.toggle[aria-pressed="true"]{border-color:#1f2430;background:#1f2430;color:#fff}' +
    '.toggle span:last-child{font-size:13px;font-weight:700}' +
    '.reset{width:100%;min-height:44px;margin-top:12px;border:1px solid #1f2430;border-radius:10px;background:#fff;font-weight:700}' +
    '.foot{margin:12px 0 0;font-size:13px;color:#4b5261}' +
    '.foot a{color:#1f2430}' +
    '.sr{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap}';

  var ICON =
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><circle cx="12" cy="4.5" r="1.8"/><path d="M5 8.5l7 1.5 7-1.5M12 10v4.5M12 14.5l-3 6M12 14.5l3 6"/></svg>';

  function toolbar(opts) {
    if (document.querySelector(TAG)) return;
    var prefs = loadPrefs();
    var host = document.createElement(TAG);
    host.setAttribute('data-side', opts.position === 'left' ? 'left' : 'right');
    var root = host.attachShadow({ mode: 'open' });
    var ui = sheet(UI_CSS);
    if (ui && root.adoptedStyleSheets !== undefined) root.adoptedStyleSheets = [ui];
    else {
      var st = document.createElement('style');
      st.textContent = UI_CSS;
      root.appendChild(st);
    }
    var wrap = document.createElement('div');
    wrap.innerHTML =
      '<button class="launch" type="button" aria-expanded="false" aria-controls="pa-panel">' + ICON + '<span class="sr">Accessibility preferences</span></button>' +
      '<div class="panel" id="pa-panel" role="region" aria-labelledby="pa-title" hidden>' +
      '<div class="head"><h2 id="pa-title">Accessibility preferences</h2><button class="close" type="button"><span aria-hidden="true">&#x2715;</span><span class="sr">Close</span></button></div>' +
      '<div class="label" id="pa-size-label">Text size</div>' +
      '<div class="row" role="group" aria-labelledby="pa-size-label"><button type="button" data-size="-1"><span aria-hidden="true">A&minus;</span><span class="sr">Smaller text</span></button>' +
      '<output class="size" aria-live="polite"></output>' +
      '<button type="button" data-size="1"><span aria-hidden="true">A+</span><span class="sr">Larger text</span></button></div>' +
      '<fieldset><legend>Colors</legend><div class="opts">' +
      ['default:Default', 'high:High contrast', 'dark:Dark', 'grayscale:Grayscale']
        .map(function (o) {
          var v = o.split(':');
          return '<label><input type="radio" name="pa-contrast" value="' + v[0] + '">' + v[1] + '</label>';
        })
        .join('') +
      '</div></fieldset>' +
      '<div class="toggles">' +
      [['spacing', 'Text spacing'], ['font', 'Readable font'], ['links', 'Highlight links'], ['motion', 'Stop animations']]
        .map(function (t) {
          return '<button class="toggle" type="button" data-toggle="' + t[0] + '" aria-pressed="false"><span>' + t[1] + '</span><span aria-hidden="true"></span></button>';
        })
        .join('') +
      '</div>' +
      '<button class="reset" type="button">Reset all</button>' +
      '<p class="foot">These settings change how this site looks for you only. Accessibility tools by <a href="https://www.accessbell.co" target="_blank" rel="noopener">AccessBell<span class="sr"> (opens in a new tab)</span></a>.</p>' +
      '</div>';
    while (wrap.firstChild) root.appendChild(wrap.firstChild);

    var launch = root.querySelector('.launch');
    var panel = root.querySelector('.panel');
    var size = root.querySelector('.size');

    function render() {
      size.textContent = Math.round((SCALES[prefs.scale] || 1) * 100) + '%';
      var radios = root.querySelectorAll('input[name="pa-contrast"]');
      for (var i = 0; i < radios.length; i++) radios[i].checked = radios[i].value === prefs.contrast;
      var toggles = root.querySelectorAll('[data-toggle]');
      for (var j = 0; j < toggles.length; j++) {
        var on = Boolean(prefs[toggles[j].getAttribute('data-toggle')]);
        toggles[j].setAttribute('aria-pressed', String(on));
        toggles[j].lastChild.textContent = on ? 'On' : 'Off';
      }
      setPageCss(pageCss(prefs));
    }
    function update(change) {
      for (var k in change) prefs[k] = change[k];
      savePrefs(prefs);
      if (change.motion) {
        var vids = document.querySelectorAll('video');
        for (var i = 0; i < vids.length; i++) if (!vids[i].paused) vids[i].pause();
      }
      render();
    }
    function open(on) {
      panel.hidden = !on;
      launch.setAttribute('aria-expanded', String(on));
      if (on) {
        var title = root.querySelector('h2');
        title.setAttribute('tabindex', '-1');
        title.focus();
      } else launch.focus();
    }

    launch.addEventListener('click', function () {
      open(panel.hidden);
    });
    root.querySelector('.close').addEventListener('click', function () {
      open(false);
    });
    root.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && !panel.hidden) {
        e.stopPropagation();
        open(false);
      }
    });
    root.querySelectorAll('[data-size]').forEach(function (b) {
      b.addEventListener('click', function () {
        var next = Math.min(SCALES.length - 1, Math.max(0, prefs.scale + Number(b.getAttribute('data-size'))));
        update({ scale: next });
      });
    });
    root.querySelectorAll('input[name="pa-contrast"]').forEach(function (r) {
      r.addEventListener('change', function () {
        update({ contrast: r.value });
      });
    });
    root.querySelectorAll('[data-toggle]').forEach(function (b) {
      b.addEventListener('click', function () {
        var k = b.getAttribute('data-toggle');
        var change = {};
        change[k] = !prefs[k];
        update(change);
      });
    });
    root.querySelector('.reset').addEventListener('click', function () {
      update(Object.assign({}, DEFAULTS));
    });

    render();
    (document.body || document.documentElement).appendChild(host);
  }

  fetch(origin + '/api/app/fix?k=' + encodeURIComponent(key), { credentials: 'omit' })
    .then(function (res) {
      return res.ok ? res.json() : { fixes: [] };
    })
    .then(function (data) {
      fixes = (data && data.fixes) || [];
      if (fixes.length) {
        apply();
        state.applied = fixes.length;
        new MutationObserver(schedule).observe(document.documentElement, { childList: true, subtree: true });
      }
      if (data && data.toolbar) {
        if (document.body) toolbar(data.toolbar);
        else document.addEventListener('DOMContentLoaded', function () {
          toolbar(data.toolbar);
        });
      }
    })
    .catch(function () {})
    .then(function () {
      state.ready = true;
    });
})();
