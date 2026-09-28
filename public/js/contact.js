// Contact form: prefill from query string, validate, submit as JSON.
(function () {
  'use strict';
  var form = document.querySelector('[data-contact-form]');
  if (!form) return;
  var status = form.querySelector('[data-form-status]');
  var button = form.querySelector('button[type="submit"]');
  var startedAt = Date.now();

  // Prefill topic and plan from links such as /contact?topic=trial&plan=starter
  var params = new URLSearchParams(window.location.search);
  ['topic', 'plan'].forEach(function (key) {
    var value = params.get(key);
    var select = form.elements[key];
    if (!value || !select) return;
    for (var i = 0; i < select.options.length; i++) {
      if (select.options[i].value === value) {
        select.value = value;
        break;
      }
    }
  });

  var show = function (state, message) {
    status.hidden = false;
    status.setAttribute('data-state', state);
    status.textContent = message;
  };

  var labelFor = function (el) {
    var label = form.querySelector('label[for="' + el.id + '"]');
    return label ? label.firstChild.textContent.trim() : el.name;
  };

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var invalid = null;
    Array.prototype.forEach.call(form.elements, function (el) {
      if (!el.willValidate || el.name === 'website') return;
      var ok = el.checkValidity();
      el.setAttribute('aria-invalid', ok ? 'false' : 'true');
      if (!ok && !invalid) invalid = el;
    });
    if (invalid) {
      var msg =
        invalid.type === 'checkbox'
          ? 'Please confirm you agree to the Privacy Policy.'
          : invalid.validity.typeMismatch
            ? 'Please enter a valid ' + labelFor(invalid).toLowerCase() + '.'
            : invalid.validity.tooShort
              ? labelFor(invalid) + ' must be at least ' + invalid.minLength + ' characters.'
              : 'Please complete the ' + labelFor(invalid).toLowerCase() + ' field.';
      show('error', msg);
      invalid.focus();
      return;
    }

    var data = {
      name: form.elements.name.value,
      email: form.elements.email.value,
      company: form.elements.company.value,
      site: form.elements.site.value,
      topic: form.elements.topic.value,
      plan: form.elements.plan.value,
      message: form.elements.message.value,
      website: form.elements.website.value,
      consent: form.elements.consent.checked,
      elapsedMs: Date.now() - startedAt,
    };

    button.disabled = true;
    show('pending', 'Sending your message...');

    fetch(form.getAttribute('data-endpoint'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
      credentials: 'same-origin',
    })
      .then(function (res) {
        return res
          .json()
          .catch(function () {
            return {};
          })
          .then(function (body) {
            if (!res.ok) throw new Error(body.error || 'Something went wrong. Please try again.');
            return body;
          });
      })
      .then(function () {
        form.reset();
        show('success', 'Thank you. Your message has been sent and we will reply within one business day.');
        status.setAttribute('tabindex', '-1');
        status.focus();
      })
      .catch(function (err) {
        show('error', err.message + ' You can also email hello@accessbell.co.');
      })
      .then(function () {
        button.disabled = false;
      });
  });
})();
