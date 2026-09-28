// Monthly / annual price toggle on /pricing.
(function () {
  'use strict';
  var group = document.querySelector('[data-billing]');
  if (!group) return;
  var apply = function (period) {
    document.querySelectorAll('[data-price], [data-billed]').forEach(function (el) {
      var value = el.getAttribute('data-' + period);
      if (value) el.textContent = value;
    });
  };
  group.addEventListener('change', function (e) {
    if (e.target && e.target.name === 'billing') apply(e.target.value);
  });
  var checked = group.querySelector('input:checked');
  if (checked) apply(checked.value);
})();
