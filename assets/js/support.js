/* 439439.com — support / donation pledges. Requires main.js. */
(function () {
  'use strict';
  var form = document.getElementById('support-form');
  if (!form || !window.Forms) return;
  var CFG = window.CONFIG || {};
  var btn = document.getElementById('support-submit');
  var customWrap = document.getElementById('custom-wrap');
  var custom = document.getElementById('s-custom');
  var cur = document.getElementById('s-cur');
  var freq = document.getElementById('s-freq');
  var sliders = Array.prototype.slice.call(form.querySelectorAll('[data-alloc]'));

  function amount() {
    var r = form.querySelector('input[name="amount"]:checked');
    if (!r) return '';
    if (r.value === 'custom') return (custom.value || '').replace(/[^\d.]/g, '');
    return r.value;
  }
  function label() {
    var a = amount();
    var f = freq.value === 'Monthly' ? ' a month' : freq.value === 'Yearly' ? ' a year' : '';
    return a ? a + ' ' + cur.value + f : '';
  }
  function refresh() {
    var r = form.querySelector('input[name="amount"]:checked');
    customWrap.hidden = !(r && r.value === 'custom');
    custom.required = !customWrap.hidden;
    var l = label();
    btn.textContent = l ? 'Pledge ' + l : 'Pledge my support';
    form.querySelector('[name="amount_label"]').value = l;
  }
  function balance(changed) {
    var total = sliders.reduce(function (s, x) { return s + Number(x.value); }, 0);
    var others = sliders.filter(function (x) { return x !== changed; });
    var over = total - 100;
    var guard = 0;
    while (over !== 0 && guard++ < 100) {
      for (var i = 0; i < others.length && over !== 0; i++) {
        var v = Number(others[i].value);
        if (over > 0 && v > 0) { others[i].value = v - 5; over -= 5; }
        else if (over < 0 && v < 100) { others[i].value = v + 5; over += 5; }
      }
    }
    sliders.forEach(function (x) {
      var o = form.querySelector('output[data-for="' + x.getAttribute('data-alloc') + '"]');
      if (o) o.textContent = x.value + '%';
    });
  }
  sliders.forEach(function (s) { s.addEventListener('input', function () { balance(s); }); });
  form.addEventListener('change', refresh);
  custom.addEventListener('input', refresh);

  var pay = CFG.pay || {};
  var links = [];
  if (pay.stripe) links.push(['Pay by card', pay.stripe]);
  if (pay.paypal) links.push(['PayPal', pay.paypal]);
  if (pay.buymeacoffee) links.push(['Buy us a coffee', pay.buymeacoffee]);
  if (links.length || pay.upi) {
    document.getElementById('instant-pay').hidden = false;
    var box = document.getElementById('instant-pay-buttons');
    box.innerHTML = links.map(function (l) { return '<a class="btn btn-ink" href="' + l[1] + '" target="_blank" rel="noopener">' + l[0] + '</a>'; }).join(' ') +
      (pay.upi ? '<a class="btn btn-ghost" href="upi://pay?pa=' + encodeURIComponent(pay.upi) + '&pn=439439&cu=INR">Pay with UPI</a>' : '');
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    refresh();
    if (!amount()) { custom.setAttribute('aria-invalid', 'true'); custom.focus(); return; }
    window.Forms.submit(form, { need: 'support pledge ' + label() }).then(function (ok) {
      if (ok) {
        var st = form.querySelector('.form-status');
        st.textContent = 'Thank you! Your pledge of ' + label() + ' is noted. We will email you a secure payment link within 1 to 2 business days.';
        st.className = 'form-status is-ok';
      }
    });
  });
  refresh();
  balance(sliders[0]);
})();
