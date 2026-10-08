/* 439439.com — site shell: navigation, theme, forms, ads, video, sharing, lead slide-in, home dial. */
(function () {
  'use strict';
  var CFG = window.CONFIG || {};
  var SITE = window.SITE || { base: '' };
  var BASE = SITE.base || '';
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var store = {
    get: function (k, d) { try { var v = localStorage.getItem(k); return v === null ? d : JSON.parse(v); } catch (e) { return d; } },
    set: function (k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} },
    sget: function (k) { try { return sessionStorage.getItem(k); } catch (e) { return null; } },
    sset: function (k, v) { try { sessionStorage.setItem(k, v); } catch (e) {} }
  };
  window.Store = store;
  function url(path) { return BASE + path; }
  window.siteUrl = url;
  function esc(s) { return String(s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  window.esc = esc;

  /* ---------- contact address (never written in the page) ---------- */
  var ENC = [116,118,106,53,115,112,104,116,110,71,56,104,122,114,121,118,126,105,108,126];
  function inbox() { return ENC.map(function (c) { return String.fromCharCode(c - 7); }).reverse().join(''); }
  document.addEventListener('click', function (e) {
    var a = e.target.closest && e.target.closest('[data-mail]');
    if (!a) return;
    e.preventDefault();
    var subject = a.getAttribute('data-mail') || '439439.com enquiry';
    window.location.href = 'mailto:' + inbox() + '?subject=' + encodeURIComponent(subject);
  });

  /* ---------- navigation & theme ---------- */
  var toggle = $('.nav-toggle'), nav = $('#site-nav');
  if (toggle && nav) {
    toggle.addEventListener('click', function () {
      var open = nav.classList.toggle('is-open');
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
      toggle.textContent = open ? 'Close' : 'Menu';
    });
  }
  $$('.theme-toggle').forEach(function (b) {
    b.addEventListener('click', function () {
      var root = document.documentElement;
      var current = root.getAttribute('data-theme') || (window.matchMedia && matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
      var next = current === 'dark' ? 'light' : 'dark';
      root.setAttribute('data-theme', next);
      try { localStorage.setItem('theme', next); } catch (e) {}
    });
  });

  /* ---------- attribution for leads ---------- */
  (function () {
    var q = new URLSearchParams(location.search);
    ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content'].forEach(function (k) { if (q.get(k)) store.sset(k, q.get(k)); });
    if (!store.sget('landing')) { store.sset('landing', location.pathname); store.sset('referrer', document.referrer || 'direct'); }
  })();

  /* ---------- forms (FormSubmit AJAX) ---------- */
  function endpoint() { return 'https://formsubmit.co/ajax/' + (CFG.formAlias || inbox()); }
  function setStatus(form, msg, ok) {
    var st = form.querySelector('.form-status');
    if (!st) return;
    st.textContent = msg;
    st.className = 'form-status ' + (ok ? 'is-ok' : 'is-err');
  }
  function validate(form) {
    var bad = null;
    $$('input, select, textarea', form).forEach(function (el) {
      if (el.type === 'hidden' || el.disabled || el.closest('[hidden]')) return;
      el.removeAttribute('aria-invalid');
      var v = (el.value || '').trim();
      var fail = (el.required && (el.type === 'checkbox' ? !el.checked : !v)) ||
        (v && el.type === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v)) ||
        (v && el.pattern && el.type !== 'email' && !new RegExp('^(?:' + el.pattern + ')$').test(v));
      if (fail) { el.setAttribute('aria-invalid', 'true'); if (!bad) bad = el; }
    });
    return bad;
  }
  function collect(form) {
    var data = {};
    var fd = new FormData(form);
    fd.forEach(function (v, k) { if (k === '_honey') return; data[k] = data[k] ? data[k] + ', ' + v : v; });
    return data;
  }
  function submitForm(form, extra) {
    var bad = validate(form);
    if (bad) { setStatus(form, 'Check the highlighted field' + (bad.labels && bad.labels[0] ? ': ' + bad.labels[0].textContent.trim() : '') + '.', false); bad.focus(); return Promise.resolve(false); }
    var hp = form.querySelector('[name="_honey"]');
    if (hp && hp.value) { setStatus(form, 'Thanks, received.', true); return Promise.resolve(true); }
    var data = collect(form);
    Object.assign(data, extra || {});
    var kind = form.getAttribute('data-form') || 'contact';
    data._subject = '[439439] ' + (form.getAttribute('data-subject') || kind) + (data.need ? ' / ' + data.need : '');
    data._template = 'table';
    data._captcha = 'false';
    if (data.email) data._replyto = data.email;
    data.form_type = kind;
    data.page = location.href;
    data.landing_page = store.sget('landing') || '';
    data.referrer = store.sget('referrer') || '';
    ['utm_source', 'utm_medium', 'utm_campaign'].forEach(function (k) { if (store.sget(k)) data[k] = store.sget(k); });
    data.submitted_at = new Date().toISOString();
    var btn = form.querySelector('[type="submit"]');
    if (btn) btn.disabled = true;
    setStatus(form, 'Sending…', true);
    return fetch(endpoint(), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify(data)
    }).then(function (r) { return r.json().catch(function () { return {}; }); })
      .then(function (res) {
        if (res && String(res.success) === 'false' && !/activat/i.test(res.message || '')) throw new Error(res.message || 'Not sent');
        if (res && /activat/i.test(res.message || '')) console.warn('FormSubmit: activate the form from the email FormSubmit sent.');
        setStatus(form, form.getAttribute('data-success') || 'Thanks! Your message is on its way. We reply within 1 to 2 business days.', true);
        form.dispatchEvent(new CustomEvent('form:success', { detail: data }));
        if (!form.hasAttribute('data-keep')) form.reset();
        return true;
      })
      .catch(function () {
        setStatus(form, 'We could not send this just now. Check your connection and try again, or use the Email us link.', false);
        return false;
      })
      .then(function (ok) { if (btn) btn.disabled = false; return ok; });
  }
  window.Forms = { submit: submitForm, validate: validate };
  $$('form[data-form]').forEach(function (form) {
    if (form.hasAttribute('data-manual')) return;
    form.addEventListener('submit', function (e) { e.preventDefault(); submitForm(form); });
  });

  /* ---------- AdSense manual units (Auto ads cover the rest) ---------- */
  $$('.ad-slot').forEach(function (slot) {
    var id = CFG.adSlots && CFG.adSlots[slot.getAttribute('data-ad')];
    if (!id) return;
    var ins = document.createElement('ins');
    ins.className = 'adsbygoogle';
    ins.style.display = 'block';
    ins.setAttribute('data-ad-client', SITE.adClient);
    ins.setAttribute('data-ad-slot', id);
    ins.setAttribute('data-ad-format', 'auto');
    ins.setAttribute('data-full-width-responsive', 'true');
    slot.appendChild(ins);
    try { (window.adsbygoogle = window.adsbygoogle || []).push({}); } catch (e) {}
  });

  /* ---------- YouTube facades (load the player only on click) ---------- */
  $$('[data-yt]').forEach(function (btn) {
    var id = btn.getAttribute('data-yt');
    btn.style.backgroundImage = 'url(https://i.ytimg.com/vi/' + id + '/hqdefault.jpg)';
    btn.addEventListener('click', function () {
      var f = document.createElement('iframe');
      f.src = 'https://www.youtube-nocookie.com/embed/' + id + '?autoplay=1&rel=0';
      f.title = btn.getAttribute('aria-label') || 'YouTube video';
      f.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share';
      f.allowFullscreen = true;
      f.loading = 'lazy';
      btn.replaceWith(f);
    });
  });
  var yt = CFG.youtube || SITE.youtube;
  $$('[data-yt-subscribe]').forEach(function (a) { if (yt) { a.href = yt + (yt.indexOf('?') < 0 ? '?sub_confirmation=1' : ''); a.hidden = false; } });

  /* ---------- sharing ---------- */
  $$('[data-share]').forEach(function (box) {
    var u = location.href.split('#')[0], t = document.title;
    var map = {
      x: 'https://twitter.com/intent/tweet?url=' + encodeURIComponent(u) + '&text=' + encodeURIComponent(t),
      facebook: 'https://www.facebook.com/sharer/sharer.php?u=' + encodeURIComponent(u),
      whatsapp: 'https://wa.me/?text=' + encodeURIComponent(t + ' ' + u),
      linkedin: 'https://www.linkedin.com/sharing/share-offsite/?url=' + encodeURIComponent(u)
    };
    $$('[data-share-to]', box).forEach(function (a) { a.href = map[a.getAttribute('data-share-to')]; });
    if (navigator.share) {
      box.classList.add('has-native');
      var nb = $('[data-share-native]', box);
      if (nb) nb.addEventListener('click', function () { navigator.share({ title: t, url: u }).catch(function () {}); });
    }
    var cb = $('[data-copy-link]', box);
    if (cb) cb.addEventListener('click', function () { copyText(u, cb); });
  });
  function copyText(text, btn) {
    var done = function () { if (btn) { var o = btn.textContent; btn.textContent = 'Copied'; setTimeout(function () { btn.textContent = o; }, 1400); } };
    if (navigator.clipboard && window.isSecureContext) navigator.clipboard.writeText(text).then(done, function () {});
    else { var ta = document.createElement('textarea'); ta.value = text; document.body.appendChild(ta); ta.select(); try { document.execCommand('copy'); done(); } catch (e) {} ta.remove(); }
  }
  window.copyText = copyText;
  document.addEventListener('click', function (e) {
    var b = e.target.closest && e.target.closest('[data-copy]');
    if (!b) return;
    var src = document.getElementById(b.getAttribute('data-copy'));
    if (src) copyText(src.textContent.trim(), b);
  });

  /* ---------- article table of contents ---------- */
  var toc = $('[data-toc]'), prose = $('[data-prose]');
  if (toc && prose) {
    var hs = $$('h2', prose).filter(function (h) { return !h.closest('.faq, .sources'); });
    if (hs.length >= 3) {
      var list = hs.map(function (h, i) {
        if (!h.id) h.id = 'section-' + (i + 1);
        return '<li><a href="#' + h.id + '">' + esc(h.textContent) + '</a></li>';
      }).join('');
      toc.innerHTML = '<p>On this page</p><ol>' + list + '</ol>';
    }
  }

  /* ---------- lazy data ---------- */
  var cache = {};
  function getJSON(path) {
    if (!cache[path]) cache[path] = fetch(url(path)).then(function (r) { return r.json(); });
    return cache[path];
  }
  function getWords() {
    if (!cache.words) cache.words = Promise.all([0, 1, 2, 3].map(function (i) { return fetch(url('/assets/data/words-' + i + '.txt')).then(function (r) { if (!r.ok) throw new Error('words'); return r.text(); }); })).then(function (parts) { return parts.join(' '); }).then(function (t) {
      var dict = {};
      t.trim().split(/\s+/).forEach(function (w) {
        var d = window.N439.wordToDigits(w);
        if (!dict[d]) dict[d] = [];
        if (dict[d].length < 8) dict[d].push(w);
      });
      return dict;
    });
    return cache.words;
  }
  window.Data = { json: getJSON, words: getWords };

  /* ---------- number pages: extra languages and scripts ---------- */
  var mw = $('[data-more-words]');
  if (mw && window.N439) {
    var n = Number(mw.getAttribute('data-more-words'));
    var E = window.N439;
    var rows = [
      ['British English', E.wordsEN(n, true)], ['Hindi', E.wordsHindi(n)], ['Chinese', E.chinese(n)],
      ['Chinese (financial)', E.chineseFinancial(n)], ['Japanese', E.japanese(n)], ['Spanish', E.wordsSpanish(n)],
      ['French', E.wordsFrench(n)], ['German', E.wordsGerman(n)], ['US cheque', E.cheque(n, 'USD')], ['Indian cheque', E.cheque(n, 'INR')]
    ];
    mw.innerHTML = '<dl class="ledger">' + rows.map(function (r) { return '<div><dt>' + r[0] + '</dt><dd>' + esc(r[1]) + '</dd></div>'; }).join('') + '</dl>';
    var sc = $('[data-scripts]');
    if (sc) sc.innerHTML = '<h3>Written in other scripts</h3><dl class="ledger">' + E.scripts(String(n)).map(function (s) { return '<div><dt>' + s.name + '</dt><dd lang="und">' + s.text + '</dd></div>'; }).join('') + '</dl>';
  }

  /* ---------- lead slide-in (once per session, content pages only) ---------- */
  var page = document.body.getAttribute('data-page') || '';
  var slideOK = /numbers|articles|tools|explorer|culture|angel|story/.test(page) && !store.sget('slidein-done');
  if (slideOK) {
    var shown = false;
    var show = function () {
      if (shown) return;
      shown = true;
      store.sset('slidein-done', '1');
      var box = document.createElement('aside');
      box.className = 'slidein';
      box.setAttribute('aria-label', 'Get expert help');
      box.innerHTML = '<button class="slidein-close" type="button" aria-label="Close">×</button>' +
        '<h2>Want a number that brings you luck?</h2>' +
        '<p>Tell us what you need (a VIP mobile number, a vanity business line or a lucky launch date) and get a free plan.</p>' +
        '<form data-form="slidein-lead" data-subject="Quick lead (slide-in)" novalidate>' +
        '<label class="sr-only" for="si-email">Email</label><input id="si-email" name="email" type="email" required placeholder="you@example.com" autocomplete="email">' +
        '<input type="hidden" name="need" value="quick-plan"><input type="text" name="_honey" class="hp" tabindex="-1" autocomplete="off" aria-hidden="true">' +
        '<div class="form-actions"><button class="btn btn-ink" type="submit">Send me a free plan</button><a href="' + url('/services/') + '">More options</a></div>' +
        '<p class="form-status" role="status" aria-live="polite"></p></form>';
      document.body.appendChild(box);
      var f = box.querySelector('form');
      f.addEventListener('submit', function (e) { e.preventDefault(); submitForm(f); });
      box.querySelector('.slidein-close').addEventListener('click', function () { box.classList.remove('is-open'); setTimeout(function () { box.remove(); }, 400); });
      requestAnimationFrame(function () { requestAnimationFrame(function () { box.classList.add('is-open'); }); });
    };
    setTimeout(show, 45000);
    window.addEventListener('scroll', function onScroll() {
      var h = document.documentElement;
      if ((h.scrollTop + innerHeight) / h.scrollHeight > 0.6) { window.removeEventListener('scroll', onScroll); show(); }
    }, { passive: true });
  }

  /* ---------- home: the dial ---------- */
  var dial = $('[data-dial]');
  if (dial && window.N439) {
    var E2 = window.N439, value = dial.getAttribute('data-dial') || '439439', lexicon = null;
    var numEl = $('[data-dial-number]', dial), letEl = $('[data-dial-letters]', dial), factsEl = $('[data-dial-facts]', dial), openEl = $('[data-dial-open]', dial);
    var keys = $$('.key[data-key]', dial);
    getJSON('/assets/data/lexicon.json').then(function (l) { lexicon = l; render(); }).catch(function () {});
    var render = function () {
      numEl.textContent = value || 'Dial';
      numEl.classList.toggle('is-empty', !value);
      var groups = E2.keypadGroups(value);
      letEl.textContent = value ? groups.map(function (g) { return g || '–'; }).join(' ') : '';
      if (value && !/[01]/.test(value) && value.length <= 12) {
        var asked = value;
        getWords().then(function (dict) {
          if (asked !== value) return;
          var pw = E2.phonewords(value, dict, 4);
          var w = pw.whole[0] || (pw.splits[0] && pw.splits[0].join('-'));
          if (w) letEl.textContent = 'Spells ' + w.toUpperCase();
        }).catch(function () {});
      }
      keys.forEach(function (k) { k.classList.toggle('is-lit', value.indexOf(k.getAttribute('data-key')) >= 0); });
      if (!value) { factsEl.innerHTML = '<li><b>Tip</b><span>Tap the keys or type on your keyboard.</span></li>'; return; }
      var n = Number(value);
      var a = E2.analyze(n, { lexicon: lexicon || undefined, maxDivisors: 64 });
      var type = a.type === 'prime' ? 'Prime' + (a.primeIndex ? ', the ' + E2.ordinalSuffix(a.primeIndex) + ' prime' : '') : a.type === 'composite' ? 'Composite: ' + a.factorText : a.type === 'unit' ? 'Neither prime nor composite' : 'Zero';
      var rows = [['Type', type], ['In words', a.words.charAt(0).toUpperCase() + a.words.slice(1)]];
      if (a.wordsIndian !== a.words) rows.push(['Indian style', a.wordsIndian]);
      if (lexicon && a.culture) {
        var v = a.culture.verdict, L = lexicon.verdicts;
        rows.push(['Luck check', 'China ' + L[v.cn].label.toLowerCase() + ', Japan ' + L[v.jp].label.toLowerCase() + ', Thailand ' + L[v.th].label.toLowerCase()]);
      }
      rows.push(['Numerology', 'Root ' + a.numerologyRoot]);
      factsEl.innerHTML = rows.map(function (r) { return '<li><b>' + r[0] + '</b><span>' + esc(r[1]) + '</span></li>'; }).join('');
      openEl.href = url('/explorer/') + '?n=' + value;
    };
    var press = function (k) {
      if (k === 'back') value = value.slice(0, -1);
      else if (k === 'clear') value = '';
      else if (value.length < 15) value = (value === '0' ? '' : value) + k;
      render();
    };
    keys.concat($$('.key[data-fn]', dial)).forEach(function (k) {
      k.addEventListener('click', function () { press(k.getAttribute('data-key') || k.getAttribute('data-fn')); });
    });
    document.addEventListener('keydown', function (e) {
      if (e.target.closest && e.target.closest('input, textarea, select, [contenteditable]')) return;
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      if (/^\d$/.test(e.key)) { press(e.key); flash(e.key); }
      else if (e.key === 'Backspace') { press('back'); }
      else if (e.key === 'Enter' && value) { location.href = openEl.href; }
    });
    var flash = function (d) { var k = $('.key[data-key="' + d + '"]', dial); if (!k) return; k.classList.add('is-pressed'); setTimeout(function () { k.classList.remove('is-pressed'); }, 120); };
    render();
  }

  /* ---------- number of the day ---------- */
  $$('[data-notd]').forEach(function (box) {
    if (!window.N439) return;
    var d = new Date(), seed = d.getUTCFullYear() * 1000 + Math.floor((d - new Date(Date.UTC(d.getUTCFullYear(), 0, 0))) / 864e5);
    var n = (seed * 7919) % 997 + 2;
    var a = window.N439.analyze(n, { maxDivisors: 64 });
    var link = $('[data-notd-link]', box);
    if (link) { link.textContent = n; link.href = url('/number/' + n + '/'); }
    var t = $('[data-notd-text]', box);
    if (t) t.textContent = n + ' is ' + (a.type === 'prime' ? 'a prime number' : 'composite (' + a.factorText + ')') + '. In words: ' + a.words + '. Its digits reduce to ' + a.numerologyRoot + ' in numerology.';
  });
})();
