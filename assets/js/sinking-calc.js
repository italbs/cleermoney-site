/* Christmas savings (sinking fund) calculator (/resources/christmas-savings/).
 * Runs entirely in the browser: nothing typed here is sent anywhere.
 * The section ships hidden so visitors without JS only see the worked example.
 */
(function () {
  'use strict';

  var section = document.getElementById('calculator');
  var calc = document.getElementById('sinkCalc');
  if (!section || !calc) return;

  var amount = calc.querySelector('#sinkAmount');
  var pays = calc.querySelector('#sinkPays');
  var periods = calc.querySelectorAll('input[name="sinkPeriod"]');
  // Paydays from January up to mid-December, when most Christmas spending happens.
  var PAYS_BY_DEC = { week: 50, fortnight: 25, month: 11 };
  var LABEL = { week: 'a week', fortnight: 'a fortnight', month: 'a month' };
  var money = new Intl.NumberFormat('en-AU', { style: 'currency', currency: 'AUD', maximumFractionDigits: 0 });

  function num(el) { return parseFloat(String(el.value).replace(/[^0-9.]/g, '')) || 0; }

  function period() {
    for (var i = 0; i < periods.length; i++) if (periods[i].checked) return periods[i].value;
    return 'fortnight';
  }

  function update() {
    var total = num(amount);
    var left = Math.max(1, Math.round(num(pays)));
    var p = period();
    calc.querySelector('[data-sink="per"]').textContent = money.format(Math.ceil(total / left));
    calc.querySelector('[data-sink="next"]').textContent = 'about ' + money.format(Math.ceil(total / PAYS_BY_DEC[p]));
    calc.querySelector('[data-sink-period]').textContent = LABEL[p];
  }

  amount.addEventListener('input', update);
  pays.addEventListener('input', update);
  periods.forEach(function (el) { el.addEventListener('change', update); });
  section.hidden = false;
  update();
  if (location.hash === '#calculator') section.scrollIntoView();
})();
