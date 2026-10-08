/* 439439.com — number explorer. Requires engine.js and main.js. */
(function () {
  'use strict';
  var E = window.N439;
  var form = document.getElementById('explorer-form');
  if (!E || !form) return;
  var esc = window.esc, url = window.siteUrl, Data = window.Data, Store = window.Store;
  var out = document.getElementById('explorer-out'), input = document.getElementById('ex-n'), recentEl = document.getElementById('ex-recent');
  var STATIC_MAX = 1000;
  var NOTABLE = [1001, 1010, 1111, 1212, 1221, 1234, 1313, 1314, 1414, 1440, 1515, 1717, 1729, 1818, 1947, 2020, 2024, 2025, 2026, 2222, 3333, 4321, 4444, 5555, 6174, 6666, 7777, 8888, 9999, 10000, 11111, 12345, 65536, 86400, 99999, 100000, 111111, 123456, 142857, 222222, 333333, 439439, 444444, 555555, 666666, 777777, 888888, 999999, 1000000, 5201314];
  var SURPRISE = [7, 8, 13, 39, 42, 108, 168, 360, 404, 439, 495, 520, 666, 786, 888, 1001, 1729, 6174, 8128, 65536, 142857, 439439, 5201314, 999999937];
  var fmt = function (n) { return Number(n).toLocaleString('en-US'); };
  var cap = function (s) { return s.charAt(0).toUpperCase() + s.slice(1); };
  var hasPage = function (n) { return n <= STATIC_MAX || NOTABLE.indexOf(n) >= 0; };
  var link = function (n) { return hasPage(n) ? url('/number/' + n + '/') : url('/explorer/') + '?n=' + n; };
  function ledger(rows) {
    return '<dl class="ledger">' + rows.filter(Boolean).map(function (r) { return '<div><dt>' + r[0] + '</dt><dd>' + r[1] + '</dd></div>'; }).join('') + '</dl>';
  }

  function render(raw) {
    var digits = E.digitsOnly(raw);
    var n = E.parse(raw);
    if (n === null || !digits) {
      out.innerHTML = '<p class="form-status is-err">Enter a whole number from 0 to 1,000,000,000,000,000. Remove letters and decimal points.</p>';
      return;
    }
    out.innerHTML = '<p class="empty-state">Calculating…</p>';
    Promise.all([Data.json('/assets/data/lexicon.json'), Data.json('/assets/data/facts.json'), Data.words().catch(function () { return null; })]).then(function (res) {
      var lex = res[0], facts = res[1], dict = res[2];
      var a = E.analyze(n, { lexicon: lex, dict: dict, maxDivisors: 300 });
      var keyStr = digits.length > String(n).length ? digits : a.s;
      var luck = E.cultureLens(keyStr, lex);
      var pw = dict ? E.phonewords(keyStr, dict, 10) : { whole: [], splits: [], parts: [] };
      var typeLine = a.type === 'prime' ? 'a prime number' + (a.primeIndex ? ', the ' + E.ordinalSuffix(a.primeIndex) + ' prime' : '') :
        a.type === 'composite' ? 'a composite number' : a.type === 'unit' ? 'neither prime nor composite (the unit)' : 'zero, neither prime nor composite';
      var uniq = a.s.split('').filter(function (c, i, arr) { return arr.indexOf(c) === i; });
      var nm = lex.numerology[String(a.numerologyRoot)];
      var world = [];
      if (n >= 1 && n <= 118) world.push('<li><strong>Chemistry:</strong> element ' + n + ' is ' + facts.elements[n][1] + ' (' + facts.elements[n][0] + ').</li>');
      if (facts.calling[a.s]) world.push('<li><strong>Phone:</strong> +' + a.s + ' is the calling code for ' + facts.calling[a.s] + '.</li>');
      if (facts.emergency[a.s]) world.push('<li><strong>Emergency:</strong> ' + a.s + ' is the ' + facts.emergency[a.s] + '.</li>');
      if (facts.http[a.s]) world.push('<li><strong>Web:</strong> HTTP ' + a.s + ' means "' + facts.http[a.s] + '".</li>');
      if (a.time) world.push('<li><strong>Clock:</strong> read as a time, ' + a.s + ' is ' + a.time + '.</li>');
      if (n >= 1 && n <= 2100) world.push('<li><strong>Calendar:</strong> see the <a href="https://en.wikipedia.org/wiki/' + (n < 100 ? 'AD_' : '') + n + '" target="_blank" rel="noopener">year ' + n + '</a>.</li>');
      if (n >= 60) world.push('<li><strong>Time span:</strong> ' + fmt(n) + ' seconds is ' + a.asSeconds + '.</li>');

      var cultureRows = E.CULTURES.map(function (k) {
        var v = luck.verdict[k];
        var why = uniq.filter(function (d) { return lex.digits[d][k] && lex.digits[d][k + 'Note']; }).map(function (d) { return d + ': ' + lex.digits[d][k + 'Note']; });
        luck.combos.forEach(function (x) { if (lex.combos[x].effect && lex.combos[x].effect[k]) why.push(x + ': ' + lex.combos[x].note); });
        return '<tr><th scope="row">' + lex.cultures[k].name + '</th><td><span class="verdict v-' + v + '">' + lex.verdicts[v].label + '</span></td><td>' + (why.length ? why.map(function (w) { return '<span>' + esc(w) + '</span>'; }).join('') : 'No strong associations.') + '</td></tr>';
      }).join('');

      var html = '';
      html += '<header class="num-hero" style="border-top:0"><div class="num-figure"><div class="num-big" style="--len:' + a.s.length + '">' + esc(keyStr) + '</div>' +
        '<div class="num-letters">' + E.keypadGroups(keyStr).map(function (g) { return '<span>' + (g || '&nbsp;') + '</span>'; }).join('') + '</div></div>' +
        '<div class="num-intro"><h2>' + fmt(n) + ' is ' + typeLine + '</h2><p class="lede">In words: <strong>' + esc(a.words) + '</strong>' + (a.wordsIndian !== a.words ? ', or ' + esc(a.wordsIndian) + ' in the Indian system' : '') + '.</p>' +
        '<ul class="tags">' + a.props.map(function (p) { return '<li title="' + esc(lex.props[p].desc) + '">' + lex.props[p].label + '</li>'; }).join('') + '</ul>' +
        '<p class="num-actions">' + (hasPage(n) ? '<a class="btn btn-ink" href="' + link(n) + '">Open the full page</a> ' : '') + '<button class="btn btn-ghost" type="button" data-copy-url>Copy link to this result</button></p></div></header>';

      html += '<h2>Quick facts</h2>' + ledger([
        a.factors.length ? ['Prime factorization', a.factorHTML] : null,
        n > 0 ? ['Number of divisors', fmt(a.divisorCount)] : null,
        a.divisors && a.divisors.length <= 64 ? ['Divisors', a.divisors.map(fmt).join(', ')] : null,
        n > 0 ? ['Sum of divisors', fmt(a.divisorSum)] : null,
        n > 0 ? ['Euler\'s totient φ', fmt(a.totient)] : null,
        ['Digit sum', a.digitSum + ' (digital root ' + a.digitalRoot + ')'],
        ['Square root', a.sqrt], ['Cube root', a.cbrt],
        a.prevPrime ? ['Previous prime', '<a href="' + link(a.prevPrime) + '">' + fmt(a.prevPrime) + '</a>'] : null,
        ['Next prime', '<a href="' + link(a.nextPrime) + '">' + fmt(a.nextPrime) + '</a>']
      ]);

      html += '<h2>In words</h2>' + ledger([
        ['US and international', esc(a.words)], ['British', esc(a.wordsUK)], a.wordsIndian !== a.words ? ['Indian system', esc(a.wordsIndian)] : null,
        ['Ordinal', esc(a.ordinal) + ' (' + a.ordinalShort + ')'], ['Hindi', esc(a.hindi)], ['Chinese', esc(a.chinese)], ['Chinese (financial)', esc(a.chineseFinancial)],
        ['Japanese', esc(a.japanese)], ['Spanish', esc(a.spanish)], ['French', esc(a.french)], ['German', esc(a.german)],
        ['US cheque', esc(E.cheque(n, 'USD'))], ['Indian cheque', esc(E.cheque(n, 'INR'))]
      ]);

      html += '<h2>Bases, Roman numerals and scripts</h2>' + ledger([
        ['Binary', a.binary], ['Octal', a.octal], ['Hexadecimal', a.hex], ['Base 36', a.base36],
        ['Roman numerals', a.roman || 'None (the Romans had no zero; this system stops below 4,000,000)']
      ]) + ledger(a.scripts.slice(0, 9).map(function (s) { return [s.name, s.text]; }));

      html += '<h2>On a phone keypad</h2><div class="keystrip">' + keyStr.split('').map(function (d) {
        var g = E.KEYPAD[+d]; return '<span class="keycap"><b>' + d + '</b><small>' + (g || '–') + '</small></span>';
      }).join('') + '</div>';
      var kw = pw.whole.concat(pw.splits.map(function (s) { return s.join('-'); }));
      if (kw.length) html += '<p>Spells: </p><ul class="word-chips">' + kw.slice(0, 10).map(function (w) { return '<li>' + esc(w.toUpperCase()) + '</li>'; }).join('') + '</ul>';
      else if (pw.parts.length) html += '<p>Words inside: </p><ul class="word-chips">' + pw.parts.slice(0, 10).map(function (p) { return '<li>' + esc(keyStr.slice(0, p.start)) + '<span style="color:var(--margin)">' + esc(p.word.toUpperCase()) + '</span>' + esc(keyStr.slice(p.end)) + '</li>'; }).join('') + '</ul>';
      else html += '<p>No common English words fit these keys.</p>';

      html += '<h2>Meaning</h2>' + (nm ? '<p>In Pythagorean numerology the digits add up to ' + a.digitSum + ', which reduces to <strong>' + a.numerologyRoot + '</strong>, ' + esc(nm.title) + ' (' + esc(nm.keys) + '). ' + esc(nm.text) + '</p>' : '') +
        '<p>In angel-number tradition: ' + uniq.map(function (d) { return '<strong>' + d + '</strong> ' + esc(lex.digits[d].angel); }).join('; ') + '.</p><p class="fine">Belief traditions, shared for cultural interest.</p>';

      html += '<h2>Is it lucky?</h2><table class="t-culture"><thead><tr><th scope="col">Culture</th><th scope="col">Verdict</th><th scope="col">Why</th></tr></thead><tbody>' + cultureRows + '</tbody></table>' +
        (luck.combos.length ? '<ul class="combos">' + luck.combos.map(function (x) { return '<li><strong>' + x + '</strong>: ' + esc(lex.combos[x].note) + '</li>'; }).join('') + '</ul>' : '');

      if (world.length) html += '<h2>In the real world</h2><ul class="world">' + world.join('') + '</ul>';
      out.innerHTML = html;
      var cu = out.querySelector('[data-copy-url]');
      if (cu) cu.addEventListener('click', function () { window.copyText(location.href, cu); });
      remember(keyStr);
    }).catch(function () { out.innerHTML = '<p class="form-status is-err">Some data did not load. Check your connection and try again.</p>'; });
  }

  function remember(s) {
    var list = Store.get('recent-numbers', []).filter(function (x) { return x !== s; });
    list.unshift(s);
    Store.set('recent-numbers', list.slice(0, 8));
    showRecent();
  }
  function showRecent() {
    var list = Store.get('recent-numbers', []);
    if (!recentEl || !list.length) return;
    recentEl.innerHTML = 'Recent: ' + list.map(function (s) { return '<a href="?n=' + encodeURIComponent(s) + '">' + esc(s) + '</a>'; }).join(', ');
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var v = input.value.trim();
    history.replaceState(null, '', '?n=' + encodeURIComponent(E.digitsOnly(v)));
    render(v);
  });
  document.getElementById('ex-random').addEventListener('click', function () {
    var n = Math.random() < 0.5 ? SURPRISE[Math.floor(Math.random() * SURPRISE.length)] : Math.floor(Math.random() * 1000000);
    input.value = n;
    form.requestSubmit ? form.requestSubmit() : form.dispatchEvent(new Event('submit'));
  });
  var start = new URLSearchParams(location.search).get('n');
  input.value = start || '439439';
  render(input.value);
  showRecent();
})();
