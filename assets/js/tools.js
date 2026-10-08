/* 439439.com — tool pages. Requires engine.js (window.N439) and main.js. */
(function () {
  'use strict';
  var E = window.N439;
  if (!E) return;
  var esc = window.esc, url = window.siteUrl, Data = window.Data;
  var params = new URLSearchParams(location.search);
  var uid = 0;

  function bind(name, fn) {
    var f = document.querySelector('[data-tool="' + name + '"]');
    if (!f) return null;
    f.addEventListener('submit', function (e) { e.preventDefault(); fn(f); });
    return f;
  }
  function copyable(text) {
    var id = 'c' + (++uid);
    return '<span id="' + id + '">' + esc(text) + '</span><button type="button" class="copy-btn" data-copy="' + id + '">Copy</button>';
  }
  function ledger(rows) {
    return '<dl class="ledger">' + rows.filter(Boolean).map(function (r) {
      return '<div><dt>' + r[0] + '</dt><dd>' + r[1] + '</dd></div>';
    }).join('') + '</dl>';
  }
  function fail(out, msg) { out.innerHTML = '<p class="form-status is-err">' + msg + '</p>'; }
  function fmt(n) { return Number(n).toLocaleString('en-US'); }
  function numLink(n) { return n <= 1000 ? url('/number/' + n + '/') : url('/explorer/') + '?n=' + n; }
  function keystrip(s) {
    var g = E.keypadGroups(s);
    return '<div class="keystrip">' + s.split('').map(function (d, i) {
      return '<span class="keycap"><b>' + d + '</b><small>' + (g[i] || '–') + '</small></span>';
    }).join('') + '</div>';
  }
  function auto(form, inputSel) {
    var v = params.get('n');
    if (form && v) { form.querySelector(inputSel).value = v; form.requestSubmit ? form.requestSubmit() : form.dispatchEvent(new Event('submit')); }
  }

  /* ---------- number to words ---------- */
  var wf = bind('words', function (f) {
    var out = f.querySelector('#w-out'), raw = f.querySelector('#w-n').value.replace(/[\s,_]/g, ''), cur = f.querySelector('#w-cur').value;
    if (!/^\d{1,15}(\.\d{1,2})?$/.test(raw)) return fail(out, 'Enter a number up to 15 digits, with at most two decimals, for example 439439.50.');
    var parts = raw.split('.'), whole = Number(parts[0]), dec = parts[1] ? (parts[1] + '0').slice(0, 2) : '';
    var amount = whole + (dec ? Number(dec) / 100 : 0);
    var cap = function (s) { return s.charAt(0).toUpperCase() + s.slice(1); };
    var decWords = dec ? ' point ' + dec.split('').map(function (d) { return E.wordsEN(Number(d)); }).join(' ') : '';
    out.innerHTML = '<p class="out-big">' + esc(Number(raw).toLocaleString('en-US', { maximumFractionDigits: 2 })) + '</p>' + ledger([
      ['US and international', copyable(cap(E.wordsEN(whole)) + decWords)],
      ['British', copyable(cap(E.wordsEN(whole, true)) + decWords)],
      ['Indian (lakh and crore)', copyable(cap(E.wordsIndian(whole)) + decWords)],
      !dec ? ['Ordinal', copyable(E.ordinalWords(whole) + ' (' + E.ordinalSuffix(whole) + ')')] : null,
      ['Cheque (' + cur + ')', copyable(E.cheque(amount, cur))],
      cur !== 'INR' ? ['Cheque (INR)', copyable(E.cheque(amount, 'INR'))] : ['Cheque (USD)', copyable(E.cheque(amount, 'USD'))],
      ['Hindi', copyable(E.wordsHindi(whole))],
      ['Chinese', copyable(E.chinese(whole))],
      ['Chinese, financial (for cheques)', copyable(E.chineseFinancial(whole))],
      ['Japanese', copyable(E.japanese(whole))],
      ['Spanish', copyable(E.wordsSpanish(whole))],
      ['French', copyable(E.wordsFrench(whole))],
      ['German', copyable(E.wordsGerman(whole))]
    ]) + (dec ? '<p class="fine">Languages other than English show the whole-number part.</p>' : '') +
      '<p><a href="' + numLink(whole) + '">More facts about ' + fmt(whole) + '</a></p>';
  });
  auto(wf, '#w-n');

  /* ---------- keypad ---------- */
  var kf = bind('keypad', function (f) {
    var out = f.querySelector('#k-out'), s = E.digitsOnly(f.querySelector('#k-n').value);
    if (!s || s.length > 16) return fail(out, 'Enter between 1 and 16 digits.');
    out.innerHTML = '<p class="empty-state">Looking up 13,000 words…</p>';
    Data.words().then(function (dict) {
      var pw = E.phonewords(s, dict, 16);
      var html = keystrip(s);
      if (pw.whole.length) html += '<h3>Whole number spells</h3><ul class="word-chips">' + pw.whole.map(function (w) { return '<li>' + esc(w.toUpperCase()) + '</li>'; }).join('') + '</ul>';
      if (pw.splits.length) html += '<h3>Spelled in parts</h3><ul class="word-chips">' + pw.splits.map(function (sp) { return '<li>' + esc(sp.join('-').toUpperCase()) + '</li>'; }).join('') + '</ul>';
      if (pw.parts.length) {
        html += '<h3>Words inside your number</h3><ul class="word-chips">' + pw.parts.slice(0, 20).map(function (p) {
          return '<li>' + esc(s.slice(0, p.start)) + '<span style="color:var(--margin)">' + esc(p.word.toUpperCase()) + '</span>' + esc(s.slice(p.end)) + '</li>';
        }).join('') + '</ul>';
      }
      if (!pw.whole.length && !pw.splits.length && !pw.parts.length) html += '<p>No common English words fit these digits' + (/[01]/.test(s) ? ' (0 and 1 carry no letters)' : '') + '. Try a different ending, or ask us to find a vanity number for you.</p>';
      html += '<p><a class="btn btn-gold" href="' + url('/services/') + '?need=vanity&n=' + s + '">Get a number that spells my word</a></p>';
      out.innerHTML = html;
    }).catch(function () { fail(out, 'The word list did not load. Check your connection and try again.'); });
  });
  auto(kf, '#k-n');
  bind('keypad-word', function (f) {
    var out = f.querySelector('#k-wout'), w = f.querySelector('#k-w').value.trim();
    var d = E.wordToDigits(w);
    if (!d) return fail(out, 'Type a word or phrase using letters A to Z.');
    out.innerHTML = '<p class="out-big">' + d + '</p>' + keystrip(d) +
      '<p>Dial it: <a href="tel:' + d + '">' + d + '</a>. ' + (d.length === 7 ? 'Seven digits fit the last part of a North American number.' : d.length > 7 ? 'Longer than seven digits: most vanity numbers spell only the last seven.' : 'Short words can sit inside a longer number.') + '</p>' +
      '<p><a href="' + url('/services/') + '?need=vanity&word=' + encodeURIComponent(w) + '">Check which real numbers can spell ' + esc(w.toUpperCase()) + '</a></p>';
  });

  /* ---------- lucky number ---------- */
  var lf = bind('lucky', function (f) {
    var out = f.querySelector('#l-out'), s = E.digitsOnly(f.querySelector('#l-n').value), kind = f.querySelector('#l-kind').value;
    if (!s || s.length > 20) return fail(out, 'Enter between 1 and 20 digits.');
    Data.json('/assets/data/lexicon.json').then(function (lex) {
      var c = E.cultureLens(s, lex), v = c.verdict;
      var score = 50;
      E.CULTURES.forEach(function (k) { score += v[k] === 'f' ? 10 : v[k] === 'a' ? -10 : 0; });
      c.combos.forEach(function (k) { var ef = lex.combos[k].effect || {}; Object.keys(ef).forEach(function (x) { score += ef[x] > 0 ? 4 : -4; }); });
      score = Math.max(0, Math.min(100, score));
      var uniq = s.split('').filter(function (d, i, a) { return a.indexOf(d) === i; });
      var rows = E.CULTURES.map(function (k) {
        var why = uniq.filter(function (d) { return lex.digits[d][k] && lex.digits[d][k + 'Note']; }).map(function (d) { return d + ': ' + lex.digits[d][k + 'Note']; });
        c.combos.forEach(function (x) { if (lex.combos[x].effect && lex.combos[x].effect[k]) why.push(x + ': ' + lex.combos[x].note); });
        return '<tr><th scope="row">' + lex.cultures[k].name + '</th><td><span class="verdict v-' + v[k] + '">' + lex.verdicts[v[k]].label + '</span></td><td>' + (why.length ? why.map(function (w) { return '<span>' + esc(w) + '</span>'; }).join('') : 'No strong associations.') + '</td></tr>';
      }).join('');
      var sum = E.digitSum(s), root = E.reduce(sum, false), planet = lex.digits[String(root)].planet;
      var count = function (d) { return s.split(d).length - 1; };
      out.innerHTML = '<p><span class="score">' + score + '</span> / 100 luck balance <span class="fine">(for fun: favoured cultures add, avoided ones subtract)</span></p><div class="meter" aria-hidden="true"><i style="width:' + score + '%"></i></div>' +
        '<table class="t-culture"><thead><tr><th scope="col">Culture</th><th scope="col">Verdict</th><th scope="col">Why</th></tr></thead><tbody>' + rows + '</tbody></table>' +
        (c.combos.length ? '<h3>Special combinations found</h3><ul class="combos">' + c.combos.map(function (x) { return '<li><strong>' + x + '</strong>: ' + esc(lex.combos[x].note) + '</li>'; }).join('') + '</ul>' : '') +
        '<h3>Indian numerology</h3><p>The digits add up to ' + sum + ', root number <strong>' + root + '</strong>' + (planet ? ' (' + planet + ')' : '') + '. ' + (kind === 'phone' ? 'Many people choose a mobile number whose root matches their birth number (mulank).' : '') + '</p>' +
        '<p>Digit count: ' + ['8', '6', '9', '4'].map(function (d) { return count(d) + ' × ' + d; }).join(', ') + '.</p>' +
        '<p><a class="btn btn-gold" href="' + url('/services/') + '?need=lucky&n=' + s + '&kind=' + kind + '">Find me a luckier ' + (kind === 'plate' ? 'number plate' : kind === 'house' ? 'address option' : kind === 'price' ? 'price point' : kind === 'date' ? 'date' : 'number') + '</a></p>';
    }).catch(function () { fail(out, 'The culture data did not load. Check your connection and try again.'); });
  });
  auto(lf, '#l-n');

  /* ---------- numerology ---------- */
  bind('numerology', function (f) {
    var out = f.querySelector('#nm-out'), name = f.querySelector('#nm-name').value.trim(), dob = f.querySelector('#nm-dob').value;
    if (!name && !dob) return fail(out, 'Enter a name, a date of birth, or both.');
    var y, m, d;
    if (dob) { var p = dob.split('-'); y = Number(p[0]); m = Number(p[1]); d = Number(p[2]); }
    if (name && !/[a-z]/i.test(name)) return fail(out, 'Use the Latin alphabet (A to Z) for the name.');
    Data.json('/assets/data/lexicon.json').then(function (lex) {
      var pr = E.numerologyProfile(name, y, m, d, new Date().getFullYear());
      var mean = function (k) { var x = lex.numerology[String(k)]; return x ? '<strong>' + k + '</strong>, ' + x.title + ': ' + x.keys : '<strong>' + k + '</strong>'; };
      var rows = [];
      if (pr.lifePath) rows.push(['Life path', mean(pr.lifePath)], ['Birthday number', mean(pr.birthday)], ['Personal year ' + new Date().getFullYear(), mean(pr.personalYear)], ['Mulank (root number)', mean(pr.rootNumber)], ['Bhagyank (destiny number)', mean(pr.destiny)]);
      if (pr.expression) rows.push(['Expression (destiny)', mean(pr.expression)], ['Soul urge', mean(pr.soulUrge)], ['Personality', mean(pr.personality)], ['Chaldean name number', '<strong>' + pr.chaldeanCompound + '</strong> (compound), reducing to ' + pr.chaldean]);
      var lead = pr.lifePath || pr.expression;
      var lx = lex.numerology[String(lead)];
      out.innerHTML = ledger(rows) + (lx ? '<h3>' + (pr.lifePath ? 'Your life path: ' : 'Your expression number: ') + lead + ', ' + lx.title + '</h3><p>' + esc(lx.text) + '</p>' : '') +
        '<p class="fine">For reflection and fun. Numerology is a belief system, not a science.</p>';
    });
  });

  /* ---------- prime factorization ---------- */
  var pf = bind('prime', function (f) {
    var out = f.querySelector('#p-out'), n = E.parse(f.querySelector('#p-n').value);
    if (n === null) return fail(out, 'Enter a whole number from 0 to 1,000,000,000,000,000.');
    var a = E.analyze(n, { maxDivisors: 512 });
    var verdict = a.type === 'prime' ? fmt(n) + ' is prime' + (a.primeIndex ? ', the ' + E.ordinalSuffix(a.primeIndex) + ' prime' : '') + '.' :
      a.type === 'composite' ? fmt(n) + ' is composite.' : a.type === 'unit' ? '1 is neither prime nor composite.' : '0 is neither prime nor composite.';
    var tree = [], rest = n;
    a.factors.forEach(function (pe) { for (var i = 0; i < pe[1]; i++) { if (rest !== pe[0]) tree.push(fmt(rest) + ' = ' + fmt(pe[0]) + ' × ' + fmt(rest / pe[0])); rest = rest / pe[0]; } });
    out.innerHTML = '<p class="out-big">' + esc(verdict) + '</p>' + ledger([
      a.factors.length ? ['Prime factorization', a.factorHTML] : null,
      n > 0 ? ['Number of divisors', fmt(a.divisorCount)] : null,
      a.divisors ? ['Divisors', a.divisors.map(fmt).join(', ')] : (n > 0 ? ['Divisors', 'Too many to list (' + fmt(a.divisorCount) + ')'] : null),
      n > 0 ? ['Sum of divisors', fmt(a.divisorSum)] : null,
      n > 0 ? ['Euler\'s totient φ', fmt(a.totient)] : null,
      a.prevPrime ? ['Previous prime', '<a href="' + numLink(a.prevPrime) + '">' + fmt(a.prevPrime) + '</a>'] : null,
      ['Next prime', '<a href="' + numLink(a.nextPrime) + '">' + fmt(a.nextPrime) + '</a>']
    ]) + (tree.length ? '<h3>Factor tree</h3><ul>' + tree.map(function (t) { return '<li>' + t + '</li>'; }).join('') + '</ul>' : '') +
      '<p><a href="' + numLink(n) + '">Everything about ' + fmt(n) + '</a></p>';
  });
  auto(pf, '#p-n');

  /* ---------- base converter ---------- */
  var bf = document.querySelector('[data-tool="base"]');
  if (bf) {
    var from = bf.querySelector('#b-from'), to = bf.querySelector('#b-to');
    for (var b = 2; b <= 36; b++) {
      from.add(new Option('Base ' + b + (b === 2 ? ' (binary)' : b === 8 ? ' (octal)' : b === 10 ? ' (decimal)' : b === 16 ? ' (hex)' : ''), b));
      to.add(new Option('Base ' + b, b));
    }
    from.value = '16'; to.value = '36';
  }
  var DIG = '0123456789abcdefghijklmnopqrstuvwxyz';
  function parseBig(str, base) {
    str = str.trim().toLowerCase().replace(/^0[xbo]/, '').replace(/[\s_,]/g, '');
    if (!str) return null;
    var B = BigInt(base), v = BigInt(0);
    for (var i = 0; i < str.length; i++) {
      var dgt = DIG.indexOf(str[i]);
      if (dgt < 0 || dgt >= base) return null;
      v = v * B + BigInt(dgt);
    }
    return v;
  }
  bind('base', function (f) {
    var out = f.querySelector('#b-out'), base = Number(f.querySelector('#b-from').value), toB = Number(f.querySelector('#b-to').value);
    if (typeof BigInt === 'undefined') return fail(out, 'Your browser is too old for exact big-number conversion.');
    var v = parseBig(f.querySelector('#b-v').value, base);
    if (v === null) return fail(out, 'That value has a digit that does not exist in base ' + base + '. Base ' + base + ' uses ' + DIG.slice(0, base).toUpperCase() + '.');
    var dec = v.toString(10);
    out.innerHTML = ledger([
      ['Decimal (base 10)', copyable(dec.replace(/\B(?=(\d{3})+(?!\d))/g, ','))],
      ['Binary (base 2)', copyable(v.toString(2))],
      ['Octal (base 8)', copyable(v.toString(8))],
      ['Hexadecimal (base 16)', copyable(v.toString(16).toUpperCase())],
      ['Base 36', copyable(v.toString(36).toUpperCase())],
      [2, 8, 10, 16, 36].indexOf(toB) < 0 ? ['Base ' + toB, copyable(v.toString(toB).toUpperCase())] : null
    ]) + (v <= BigInt('1000000000000000') ? '<p><a href="' + numLink(Number(v)) + '">More about ' + dec + '</a></p>' : '');
  });

  /* ---------- roman numerals ---------- */
  var RX = /^M{0,3}(CM|CD|D?C{0,3})(XC|XL|L?X{0,3})(IX|IV|V?I{0,3})$/;
  function fromRoman(s) {
    var val = { I: 1, V: 5, X: 10, L: 50, C: 100, D: 500, M: 1000 };
    var plain = function (t) { var sum = 0; for (var i = 0; i < t.length; i++) { var a = val[t[i]], b = val[t[i + 1]] || 0; sum += a < b ? -a : a; } return sum; };
    var over = '', rest = '';
    var chars = s.normalize('NFD').toUpperCase().replace(/\s/g, '');
    for (var i = 0; i < chars.length; i++) {
      if (chars[i] === '̅') continue;
      if (chars[i + 1] === '̅') over += chars[i]; else rest += chars[i];
    }
    if (!over && !rest) return null;
    if ((over && !RX.test(over)) || (rest && !RX.test(rest))) return null;
    if (/[^IVXLCDM]/.test(over + rest)) return null;
    return (over ? plain(over) * 1000 : 0) + (rest ? plain(rest) : 0);
  }
  var rf = bind('roman', function (f) {
    var out = f.querySelector('#r-out'), raw = f.querySelector('#r-in').value.trim();
    if (/^[\d,\s]+$/.test(raw)) {
      var n = Number(raw.replace(/[,\s]/g, ''));
      if (n < 1 || n > 3999999) return fail(out, 'Roman numerals here cover 1 to 3,999,999. The Romans had no zero.');
      out.innerHTML = '<p class="out-big">' + copyable(E.roman(n)) + '</p><p>' + fmt(n) + ' = ' + E.roman(n) + (n >= 4000 ? '. The bar over a letter multiplies it by 1,000.' : '.') + ' <a href="' + numLink(n) + '">More about ' + fmt(n) + '</a></p>';
    } else {
      var v = fromRoman(raw);
      if (v === null) return fail(out, 'That is not a valid Roman numeral. Use I, V, X, L, C, D and M, at most three of a kind in a row, and only IV, IX, XL, XC, CD and CM as subtractions.');
      out.innerHTML = '<p class="out-big">' + fmt(v) + '</p><p>' + esc(raw.toUpperCase()) + ' = ' + fmt(v) + '. <a href="' + numLink(v) + '">More about ' + fmt(v) + '</a></p>';
    }
  });
  auto(rf, '#r-in');

  /* ---------- ABCABC ---------- */
  var af = bind('abcabc', function (f) {
    var out = f.querySelector('#a-out'), s = E.digitsOnly(f.querySelector('#a-n').value);
    if (s.length !== 3) return fail(out, 'Enter exactly three digits, for example 439.');
    var abc = Number(s), big = Number(s + s);
    var s13 = big / 13, s11 = s13 / 11, s7 = s11 / 7;
    out.innerHTML = '<p class="out-big">' + s + s + '</p><ol class="steps-list">' +
      '<li>' + fmt(big) + ' ÷ 13 = ' + fmt(s13) + ' (no remainder)</li>' +
      '<li>' + fmt(s13) + ' ÷ 11 = ' + fmt(s11) + ' (no remainder)</li>' +
      '<li>' + fmt(s11) + ' ÷ 7 = <strong>' + s7 + '</strong>, your number back</li></ol>' +
      '<p>Because ' + s + s + ' = ' + abc + ' × 1001 and 1001 = 7 × 11 × 13. <a href="' + numLink(big) + '">See ' + fmt(big) + '</a></p>';
  });
  auto(af, '#a-n');
})();
