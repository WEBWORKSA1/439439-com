/* 439439.com — multi-step lead desk. Requires main.js (window.Forms). */
(function () {
  'use strict';
  var form = document.getElementById('lead-form');
  if (!form || !window.Forms) return;
  var steps = Array.prototype.slice.call(form.querySelectorAll('.step'));
  var progress = Array.prototype.slice.call(form.querySelectorAll('.progress li'));
  var current = 1;
  var Store = window.Store;
  var params = new URLSearchParams(location.search);

  function stepEl(n) { return form.querySelector('[data-step="' + n + '"]'); }
  function need() { var r = form.querySelector('input[name="need"]:checked'); return r ? r.value : ''; }
  function syncNeed() {
    var v = need();
    form.querySelectorAll('[data-need-fields]').forEach(function (g) {
      var on = g.getAttribute('data-need-fields') === v;
      g.hidden = !on;
      g.querySelectorAll('input, select, textarea').forEach(function (el) { el.disabled = !on; });
    });
  }
  function show(n, quiet) {
    current = n;
    steps.forEach(function (s) { s.hidden = s.getAttribute('data-step') !== String(n); });
    progress.forEach(function (li, i) {
      li.classList.toggle('is-current', i + 1 === n);
      li.classList.toggle('is-done', typeof n === 'number' ? i + 1 < n : true);
    });
    var first = stepEl(n) && stepEl(n).querySelector('h2');
    if (first && !quiet) { first.setAttribute('tabindex', '-1'); first.focus({ preventScroll: true }); }
    var top = form.getBoundingClientRect().top + window.scrollY - 90;
    if (!quiet && window.scrollY > top) window.scrollTo({ top: top, behavior: 'smooth' });
  }
  function stepValid(n) {
    var el = stepEl(n), bad = null;
    if (n === 1 && !need()) { el.querySelector('.choice input').focus(); return false; }
    el.querySelectorAll('input, select, textarea').forEach(function (x) {
      if (x.disabled || x.type === 'hidden' || x.closest('[hidden]')) return;
      x.removeAttribute('aria-invalid');
      var v = (x.value || '').trim();
      var fail = (x.required && x.type !== 'radio' && (x.type === 'checkbox' ? !x.checked : !v)) ||
        (v && x.type === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v));
      if (fail) { x.setAttribute('aria-invalid', 'true'); if (!bad) bad = x; }
    });
    if (bad) bad.focus();
    return !bad;
  }
  function saveDraft() {
    var d = {};
    new FormData(form).forEach(function (v, k) { if (k !== '_honey' && k !== 'consent') d[k] = v; });
    Store.set('lead-draft', d);
  }
  function loadDraft() {
    var d = Store.get('lead-draft', null);
    if (!d) return;
    Object.keys(d).forEach(function (k) {
      var els = form.querySelectorAll('[name="' + k + '"]');
      els.forEach(function (el) {
        if (el.type === 'radio') el.checked = el.value === d[k];
        else if (el.type !== 'checkbox' && !el.value) el.value = d[k];
      });
    });
  }

  form.addEventListener('change', function (e) { if (e.target.name === 'need') syncNeed(); saveDraft(); });
  form.addEventListener('input', saveDraft);
  form.querySelectorAll('[data-next]').forEach(function (b) {
    b.addEventListener('click', function () { if (stepValid(current)) show(current + 1); });
  });
  form.querySelectorAll('[data-back]').forEach(function (b) { b.addEventListener('click', function () { show(current - 1); }); });
  form.querySelectorAll('.choice input[name="need"]').forEach(function (r) {
    r.addEventListener('keydown', function (e) { if (e.key === 'Enter') { e.preventDefault(); if (stepValid(1)) show(2); } });
  });
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    if (!stepValid(3)) return;
    window.Forms.submit(form).then(function (ok) {
      if (!ok) return;
      try { localStorage.removeItem('lead-draft'); } catch (x) {}
      show('done');
    });
  });

  loadDraft();
  var pn = params.get('need');
  if (pn) { var r = form.querySelector('input[name="need"][value="' + pn + '"]'); if (r) r.checked = true; }
  var refN = params.get('n') || params.get('word') || '';
  if (refN) {
    form.querySelector('[name="ref_number"]').value = refN;
    var target = pn === 'vanity' ? form.querySelector('#vf-word') : form.querySelector('#lf-current');
    if (target && !target.value) target.value = refN;
  }
  syncNeed();
  show(pn && need() ? 2 : 1, true);
})();
