/* 50/30/20 pay split calculator (/resources/50-30-20-rule/).
 * Runs entirely in the browser: nothing typed here is sent anywhere.
 * The section ships hidden so visitors without JS only see the static example.
 */
(function () {
  'use strict';

  var section = document.getElementById('calculator');
  var calc = document.getElementById('splitCalc');
  if (!section || !calc) return;

  var input = calc.querySelector('#splitPay');
  var periods = calc.querySelectorAll('input[name="splitPeriod"]');
  var PER_YEAR = { week: 52, fortnight: 26, month: 12 };
  var LABEL = { week: 'a week', fortnight: 'a fortnight', month: 'a month' };
  var money = new Intl.NumberFormat('en-AU', { style: 'currency', currency: 'AUD', maximumFractionDigits: 0 });

  function period() {
    for (var i = 0; i < periods.length; i++) if (periods[i].checked) return periods[i].value;
    return 'fortnight';
  }

  function update() {
    var pay = parseFloat(String(input.value).replace(/[^0-9.]/g, '')) || 0;
    var p = period();
    calc.querySelector('[data-split="needs"]').textContent = money.format(pay * 0.5);
    calc.querySelector('[data-split="wants"]').textContent = money.format(pay * 0.3);
    calc.querySelector('[data-split="savings"]').textContent = money.format(pay * 0.2);
    calc.querySelectorAll('[data-split-period]').forEach(function (el) { el.textContent = LABEL[p]; });
    calc.querySelector('[data-split="year"]').textContent = money.format(pay * 0.2 * PER_YEAR[p]);
  }

  input.addEventListener('input', update);
  periods.forEach(function (el) { el.addEventListener('change', update); });
  section.hidden = false;
  update();
  // The hub links to #calculator, which was hidden when the browser tried to jump to it.
  if (location.hash === '#calculator') section.scrollIntoView();
})();
