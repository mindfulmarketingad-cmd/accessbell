// Free accessibility checker: submits a URL to /api/scan and renders the report.
// All scan data is inserted with textContent, never as HTML.
(function () {
  'use strict';
  var forms = document.querySelectorAll('[data-scan-form]');
  var section = document.getElementById('scan-results');
  var mount = section && section.querySelector('[data-results]');
  if (!forms.length || !mount) return;

  var busy = false;

  var el = function (tag, attrs, children) {
    var node = document.createElement(tag);
    if (attrs) {
      Object.keys(attrs).forEach(function (k) {
        if (k === 'text') node.textContent = attrs[k];
        else node.setAttribute(k, attrs[k]);
      });
    }
    (children || []).forEach(function (c) {
      if (c) node.appendChild(typeof c === 'string' ? document.createTextNode(c) : c);
    });
    return node;
  };

  var svgNS = 'http://www.w3.org/2000/svg';
  var checkIcon = function () {
    var svg = document.createElementNS(svgNS, 'svg');
    svg.setAttribute('viewBox', '0 0 24 24');
    svg.setAttribute('fill', 'none');
    svg.setAttribute('stroke', 'currentColor');
    svg.setAttribute('stroke-width', '2');
    svg.setAttribute('stroke-linecap', 'round');
    svg.setAttribute('stroke-linejoin', 'round');
    svg.setAttribute('aria-hidden', 'true');
    var p = document.createElementNS(svgNS, 'path');
    p.setAttribute('d', 'M20 6 9 17l-5-5');
    svg.appendChild(p);
    return svg;
  };

  var normalizeUrl = function (raw) {
    var v = (raw || '').trim();
    if (!v) return { error: 'Enter a website address to check.' };
    if (!/^[a-z][a-z0-9+.-]*:\/\//i.test(v)) v = 'https://' + v;
    var u;
    try {
      u = new URL(v);
    } catch (e) {
      return { error: 'That does not look like a valid web address. Try something like example.com.' };
    }
    if (u.protocol !== 'http:' && u.protocol !== 'https:') return { error: 'Only http and https addresses can be checked.' };
    if (u.hostname.indexOf('.') === -1) return { error: 'Enter a full domain name, such as example.com.' };
    return { url: u.toString() };
  };

  var setError = function (form, message) {
    var id = form.getAttribute('aria-describedby');
    var box = id && document.getElementById(id);
    var input = form.elements.url;
    if (message) {
      input.setAttribute('aria-invalid', 'true');
      if (box) {
        box.textContent = message;
        box.hidden = false;
      }
    } else {
      input.removeAttribute('aria-invalid');
      if (box) {
        box.textContent = '';
        box.hidden = true;
      }
    }
  };

  var showLoading = function (url) {
    section.hidden = false;
    section.setAttribute('aria-busy', 'true');
    mount.replaceChildren(
      el('div', { class: 'results-card' }, [
        el('div', { class: 'loading' }, [el('span', { class: 'spinner', 'aria-hidden': 'true' }), el('span', { text: 'Checking ' + url + ' for accessibility issues...' })]),
      ]),
    );
    section.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  var showFailure = function (message) {
    section.setAttribute('aria-busy', 'false');
    var heading = el('h2', { tabindex: '-1', text: 'We could not check that page' });
    mount.replaceChildren(
      el('div', { class: 'results-card' }, [
        el('div', { class: 'results-body' }, [heading, el('p', { text: message })]),
      ]),
    );
    heading.focus({ preventScroll: true });
  };

  var impactLabel = { critical: 'Critical', serious: 'Serious', moderate: 'Moderate', minor: 'Minor' };

  var render = function (r) {
    section.setAttribute('aria-busy', 'false');
    var band = r.score >= 90 ? 'high' : r.score >= 60 ? 'mid' : 'low';
    var ring = el('div', { class: 'score-ring', 'data-band': band, role: 'img', 'aria-label': 'Accessibility score ' + r.score + ' out of 100' }, [
      el('span', { 'aria-hidden': 'true', text: String(r.score) }),
    ]);
    ring.style.setProperty('--pct', String(r.score));

    var heading = el('h2', { tabindex: '-1', text: 'Accessibility report' });
    var head = el('div', { class: 'results-head' }, [
      ring,
      el('div', null, [
        heading,
        el('p', { text: r.finalUrl }),
        el('p', { text: r.standard.label + ' - scanned ' + new Date(r.scannedAt).toLocaleString() }),
      ]),
      el('ul', { class: 'results-stats' }, [
        el('li', null, [el('strong', { text: String(r.summary.issues) }), el('span', { text: 'Issues' })]),
        el('li', null, [el('strong', { text: String(r.summary.rulesFailed) }), el('span', { text: 'Checks failed' })]),
        el('li', null, [el('strong', { text: String(r.summary.rulesPassed) }), el('span', { text: 'Checks passed' })]),
      ]),
    ]);

    var body = el('div', { class: 'results-body' });
    if (r.issues.length) {
      body.appendChild(el('h3', { text: 'Issues to fix (' + r.issues.length + ')' }));
      var list = el('ul', { class: 'issue-list' });
      r.issues.forEach(function (issue) {
        var tags = el('span', null, [
          el('span', { class: 'tag tag-' + issue.impact, text: impactLabel[issue.impact] || issue.impact }),
          ' ',
          el('span', {
            class: 'tag',
            text: issue.wcag.map(function (w) { return 'WCAG ' + w.sc + ' (' + w.level + ')'; }).join(', '),
          }),
        ]);
        var item = el('li', { class: 'issue' }, [
          el('div', { class: 'issue-top' }, [el('h4', { text: issue.title + (issue.count > 1 ? ' - ' + issue.count + ' instances' : '') }), tags]),
          el('p', { text: issue.description }),
          el('p', null, [el('strong', { text: 'How to fix: ' }), issue.fix]),
        ]);
        (issue.samples || []).forEach(function (s) {
          item.appendChild(el('pre', null, [el('code', { text: s })]));
        });
        list.appendChild(item);
      });
      body.appendChild(list);
    } else {
      body.appendChild(el('h3', { text: 'No automated issues found' }));
      body.appendChild(el('p', { text: 'Great start. Automated checks cover part of WCAG, so follow up with keyboard and screen reader testing.' }));
    }

    if (r.passes.length) {
      body.appendChild(el('h3', { text: 'Checks passed (' + r.passes.length + ')' }));
      var passes = el('ul', { class: 'pass-list' });
      r.passes.forEach(function (p) {
        passes.appendChild(el('li', null, [checkIcon(), el('span', { text: p.title + ' (WCAG ' + p.wcag.map(function (w) { return w.sc; }).join(', ') + ')' })]));
      });
      body.appendChild(passes);
    }

    (r.notes || []).forEach(function (n) {
      body.appendChild(el('p', { class: 'mb-0', text: n }));
    });

    var foot = el('div', { class: 'results-foot' }, [
      el('p', { text: 'This free check tests one page with automated rules. Automated testing finds many, but not all, WCAG failures. Monitor every page and get scheduled rescans with a paid plan.' }),
      el('a', { class: 'btn btn-accent', href: '/pricing', text: 'Monitor your whole site' }),
    ]);

    mount.replaceChildren(el('div', { class: 'results-card' }, [head, body, foot]));
    heading.focus({ preventScroll: true });
  };

  forms.forEach(function (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (busy) return;
      var parsed = normalizeUrl(form.elements.url.value);
      if (parsed.error) {
        setError(form, parsed.error);
        form.elements.url.focus();
        return;
      }
      setError(form, null);
      busy = true;
      var button = form.querySelector('button[type="submit"]');
      button.disabled = true;
      showLoading(parsed.url);

      var controller = typeof AbortController !== 'undefined' ? new AbortController() : null;
      var timer = controller && setTimeout(function () { controller.abort(); }, 45000);

      fetch('/api/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: parsed.url, standard: form.elements.standard.value }),
        credentials: 'same-origin',
        signal: controller ? controller.signal : undefined,
      })
        .then(function (res) {
          return res
            .json()
            .catch(function () { return {}; })
            .then(function (data) {
              if (!res.ok) throw new Error(data.error || 'The scan could not be completed. Please try again.');
              return data;
            });
        })
        .then(render)
        .catch(function (err) {
          showFailure(err.name === 'AbortError' ? 'The page took too long to respond. Please try again later.' : err.message);
        })
        .then(function () {
          if (timer) clearTimeout(timer);
          busy = false;
          button.disabled = false;
        });
    });
  });
})();
