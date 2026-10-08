/*!
 * 439439.com number engine
 * Pure functions for number facts, words, numerals, keypad words,
 * numerology and culture lenses. Runs in the browser (window.N439)
 * and in Node (module.exports) so static pages and live tools agree.
 */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.N439 = factory();
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  var MAX = 1e15;

  /* ---------- input ---------- */
  function digitsOnly(input) {
    return String(input == null ? '' : input).replace(/\D+/g, '');
  }
  function parse(input) {
    var s = String(input == null ? '' : input).trim().replace(/[\s,_]/g, '');
    if (!/^\d{1,16}$/.test(s)) return null;
    var n = Number(s);
    if (!isFinite(n) || n > MAX) return null;
    return n;
  }

  /* ---------- arithmetic ---------- */
  function isPrime(n) {
    if (n < 2 || n !== Math.floor(n)) return false;
    if (n % 2 === 0) return n === 2;
    if (n % 3 === 0) return n === 3;
    var r = Math.floor(Math.sqrt(n));
    for (var i = 5; i <= r; i += 6) {
      if (n % i === 0 || n % (i + 2) === 0) return false;
    }
    return true;
  }
  function factorize(n) {
    var f = [];
    if (n < 2) return f;
    function take(p) {
      var e = 0;
      while (n % p === 0) { n = n / p; e++; }
      if (e) f.push([p, e]);
    }
    take(2); take(3);
    for (var i = 5; i * i <= n; i += 6) { take(i); take(i + 2); }
    if (n > 1) f.push([n, 1]);
    return f;
  }
  function divisorList(f, cap) {
    var ds = [1];
    for (var a = 0; a < f.length; a++) {
      var p = f[a][0], e = f[a][1], len = ds.length, pk = 1;
      for (var k = 1; k <= e; k++) {
        pk *= p;
        for (var j = 0; j < len; j++) ds.push(ds[j] * pk);
      }
      if (cap && ds.length > cap * 4) break;
    }
    ds.sort(function (x, y) { return x - y; });
    return ds;
  }
  function tau(f) { var t = 1; for (var i = 0; i < f.length; i++) t *= f[i][1] + 1; return t; }
  function sigma(f) {
    var s = 1;
    for (var i = 0; i < f.length; i++) {
      var p = f[i][0], e = f[i][1], sum = 1, pk = 1;
      for (var k = 1; k <= e; k++) { pk *= p; sum += pk; }
      s *= sum;
    }
    return s;
  }
  function totient(n, f) {
    if (n === 0) return 0;
    var t = 1;
    for (var i = 0; i < f.length; i++) t *= Math.pow(f[i][0], f[i][1] - 1) * (f[i][0] - 1);
    return t;
  }
  function nextPrime(n) { var m = Math.max(2, Math.floor(n) + 1); while (!isPrime(m)) m++; return m; }
  function prevPrime(n) { for (var m = Math.floor(n) - 1; m >= 2; m--) if (isPrime(m)) return m; return 0; }

  var _sieve = null, _sieveLimit = 0;
  function primePi(n) {
    if (n < 2) return 0;
    if (n > 2000000) return null;
    if (!_sieve || _sieveLimit < n) {
      _sieveLimit = Math.max(n, 1200000);
      var lim = _sieveLimit;
      var comp = new Uint8Array(lim + 1);
      for (var i = 2; i * i <= lim; i++) if (!comp[i]) for (var j = i * i; j <= lim; j += i) comp[j] = 1;
      _sieve = new Uint32Array(lim + 1);
      var c = 0;
      for (var k = 0; k <= lim; k++) { if (k >= 2 && !comp[k]) c++; _sieve[k] = c; }
    }
    return _sieve[n];
  }

  function digitSum(s) { var t = 0; for (var i = 0; i < s.length; i++) t += +s[i]; return t; }
  function digitProduct(s) { var t = 1; for (var i = 0; i < s.length; i++) t *= +s[i]; return t; }
  function digitalRoot(n) { return n === 0 ? 0 : 1 + ((n - 1) % 9); }
  function reverseStr(s) { return s.split('').reverse().join(''); }
  function isSquare(n) { var r = Math.round(Math.sqrt(n)); return r * r === n; }
  function isCube(n) { var r = Math.round(Math.cbrt(n)); return r * r * r === n; }
  function isFibonacci(n) { var a = 0, b = 1; while (a < n) { var t = a + b; a = b; b = t; } return a === n; }
  function isHappy(n) {
    var seen = {};
    while (n !== 1 && !seen[n]) {
      seen[n] = 1;
      var s = String(n), t = 0;
      for (var i = 0; i < s.length; i++) t += (+s[i]) * (+s[i]);
      n = t;
    }
    return n === 1;
  }
  function isPowerOf2(n) { if (n < 1) return false; while (n % 2 === 0) n /= 2; return n === 1; }
  var FACTORIALS = [1, 2, 6, 24, 120, 720, 5040, 40320, 362880, 3628800, 39916800, 479001600, 6227020800, 87178291200, 1307674368000, 20922789888000, 355687428096000];
  function isArmstrong(n) {
    var s = String(n), k = s.length, t = 0;
    for (var i = 0; i < k; i++) t += Math.pow(+s[i], k);
    return t === n;
  }

  /* ---------- representations ---------- */
  function toBase(n, b) { return n.toString(b).toUpperCase(); }

  var ROMAN = [[1000, 'M'], [900, 'CM'], [500, 'D'], [400, 'CD'], [100, 'C'], [90, 'XC'], [50, 'L'], [40, 'XL'], [10, 'X'], [9, 'IX'], [5, 'V'], [4, 'IV'], [1, 'I']];
  function romanBasic(n) {
    var out = '';
    for (var i = 0; i < ROMAN.length; i++) while (n >= ROMAN[i][0]) { out += ROMAN[i][1]; n -= ROMAN[i][0]; }
    return out;
  }
  function roman(n) {
    if (n < 1 || n >= 4000000) return '';
    if (n < 4000) return romanBasic(n);
    var th = Math.floor(n / 1000), rest = n % 1000;
    var over = romanBasic(th).split('').map(function (c) { return c + '̅'; }).join('');
    return over + romanBasic(rest);
  }

  var ONES = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen'];
  var TENS = ['', '', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety'];
  var SCALES = ['', 'thousand', 'million', 'billion', 'trillion', 'quadrillion'];
  function en99(n) { if (n < 20) return ONES[n]; var o = n % 10; return TENS[Math.floor(n / 10)] + (o ? '-' + ONES[o] : ''); }
  function en999(n, uk) {
    var h = Math.floor(n / 100), r = n % 100, out = '';
    if (h) out = ONES[h] + ' hundred';
    if (r) out += (h ? (uk ? ' and ' : ' ') : '') + en99(r);
    return out;
  }
  function wordsEN(n, uk) {
    n = Math.floor(n);
    if (n === 0) return 'zero';
    var chunks = [], i = 0;
    while (n > 0) { chunks.push(n % 1000); n = Math.floor(n / 1000); i++; }
    var parts = [];
    for (var k = chunks.length - 1; k >= 0; k--) {
      var c = chunks[k];
      if (!c) continue;
      var w = en999(c, uk) + (SCALES[k] ? ' ' + SCALES[k] : '');
      if (!uk || !parts.length) parts.push(w);
      else if (k === 0 && c < 100) parts.push('and ' + w);
      else parts.push(w);
    }
    if (!uk) return parts.join(' ');
    var out = parts[0];
    for (var m = 1; m < parts.length; m++) out += (parts[m].indexOf('and ') === 0 ? ' ' : ', ') + parts[m];
    return out;
  }
  function wordsIndian(n) {
    n = Math.floor(n);
    if (n === 0) return 'zero';
    var out = [];
    var crore = Math.floor(n / 1e7), rest = n % 1e7;
    if (crore) out.push(wordsIndian(crore) + ' crore');
    var lakh = Math.floor(rest / 1e5); rest %= 1e5;
    var th = Math.floor(rest / 1000); rest %= 1000;
    if (lakh) out.push(en99(lakh) + ' lakh');
    if (th) out.push(en99(th) + ' thousand');
    if (rest) out.push(en999(rest, false));
    return out.join(' ');
  }
  var ORD = { one: 'first', two: 'second', three: 'third', five: 'fifth', eight: 'eighth', nine: 'ninth', twelve: 'twelfth' };
  function ordinalWord(w) {
    var m = w.match(/^(.*?)([a-z]+)$/);
    var head = m[1], last = m[2];
    if (ORD[last]) return head + ORD[last];
    if (/y$/.test(last)) return head + last.slice(0, -1) + 'ieth';
    return head + last + 'th';
  }
  function ordinalWords(n) { return ordinalWord(wordsEN(n, false)); }
  function ordinalSuffix(n) {
    var h = n % 100;
    if (h >= 11 && h <= 13) return n + 'th';
    var d = n % 10;
    return n + (d === 1 ? 'st' : d === 2 ? 'nd' : d === 3 ? 'rd' : 'th');
  }
  function titleCase(s) { return s.replace(/(^|[\s-])([a-z])/g, function (m, a, b) { return a + b.toUpperCase(); }); }

  var HI = ['शून्य', 'एक', 'दो', 'तीन', 'चार', 'पाँच', 'छह', 'सात', 'आठ', 'नौ', 'दस',
    'ग्यारह', 'बारह', 'तेरह', 'चौदह', 'पंद्रह', 'सोलह', 'सत्रह', 'अठारह', 'उन्नीस', 'बीस',
    'इक्कीस', 'बाईस', 'तेईस', 'चौबीस', 'पच्चीस', 'छब्बीस', 'सत्ताईस', 'अट्ठाईस', 'उनतीस', 'तीस',
    'इकतीस', 'बत्तीस', 'तैंतीस', 'चौंतीस', 'पैंतीस', 'छत्तीस', 'सैंतीस', 'अड़तीस', 'उनतालीस', 'चालीस',
    'इकतालीस', 'बयालीस', 'तैंतालीस', 'चवालीस', 'पैंतालीस', 'छियालीस', 'सैंतालीस', 'अड़तालीस', 'उनचास', 'पचास',
    'इक्यावन', 'बावन', 'तिरेपन', 'चौवन', 'पचपन', 'छप्पन', 'सत्तावन', 'अट्ठावन', 'उनसठ', 'साठ',
    'इकसठ', 'बासठ', 'तिरेसठ', 'चौंसठ', 'पैंसठ', 'छियासठ', 'सड़सठ', 'अड़सठ', 'उनहत्तर', 'सत्तर',
    'इकहत्तर', 'बहत्तर', 'तिहत्तर', 'चौहत्तर', 'पचहत्तर', 'छिहत्तर', 'सतहत्तर', 'अठहत्तर', 'उन्यासी', 'अस्सी',
    'इक्यासी', 'बयासी', 'तिरासी', 'चौरासी', 'पचासी', 'छियासी', 'सत्तासी', 'अट्ठासी', 'नवासी', 'नब्बे',
    'इक्यानवे', 'बानवे', 'तिरानवे', 'चौरानवे', 'पंचानवे', 'छियानवे', 'सत्तानवे', 'अट्ठानवे', 'निन्यानवे'];
  function wordsHindi(n) {
    n = Math.floor(n);
    if (n === 0) return HI[0];
    var out = [];
    var crore = Math.floor(n / 1e7), rest = n % 1e7;
    if (crore) out.push(wordsHindi(crore) + ' करोड़');
    var lakh = Math.floor(rest / 1e5); rest %= 1e5;
    var th = Math.floor(rest / 1000); rest %= 1000;
    var h = Math.floor(rest / 100); rest %= 100;
    if (lakh) out.push(HI[lakh] + ' लाख');
    if (th) out.push(HI[th] + ' हज़ार');
    if (h) out.push(HI[h] + ' सौ');
    if (rest) out.push(HI[rest]);
    return out.join(' ');
  }

  function cjk(n, set) {
    n = Math.floor(n);
    var D = set.digits, U = set.units, BIG = set.big;
    if (n === 0) return D[0];
    var sections = [];
    while (n > 0) { sections.push(n % 10000); n = Math.floor(n / 10000); }
    var out = '', needZero = false;
    for (var k = sections.length - 1; k >= 0; k--) {
      var sec = sections[k];
      if (sec === 0) { if (out) needZero = true; continue; }
      if (set.zero && out && (needZero || sec < 1000)) out += D[0];
      needZero = false;
      var ds = ('000' + sec).slice(-4), s = '', z = false;
      for (var i = 0; i < 4; i++) {
        var d = +ds[i], u = 3 - i;
        if (d === 0) { if (s) z = true; continue; }
        if (z && set.zero) s += D[0];
        z = false;
        if (set.dropOne && d === 1 && (u === 1 || u === 2 || (u === 3 && k === sections.length - 1))) s += U[u];
        else s += D[d] + U[u];
      }
      out += s + BIG[k];
    }
    if (set.stripLeadingOneTen && out.indexOf(D[1] + U[1]) === 0) out = out.slice(1);
    return out;
  }
  var ZH = { digits: '零一二三四五六七八九', units: ['', '十', '百', '千'], big: ['', '万', '亿', '万亿'], zero: true, stripLeadingOneTen: true };
  var ZHF = { digits: '零壹贰叁肆伍陆柒捌玖', units: ['', '拾', '佰', '仟'], big: ['', '万', '亿', '万亿'], zero: true };
  var JA = { digits: '〇一二三四五六七八九', units: ['', '十', '百', '千'], big: ['', '万', '億', '兆'], zero: false, dropOne: true };
  function chinese(n) { return cjk(n, ZH); }
  function chineseFinancial(n) { return cjk(n, ZHF); }
  function japanese(n) { return n === 0 ? '零' : cjk(n, JA); }

  var ES_U = ['cero', 'uno', 'dos', 'tres', 'cuatro', 'cinco', 'seis', 'siete', 'ocho', 'nueve', 'diez', 'once', 'doce', 'trece', 'catorce', 'quince', 'dieciséis', 'diecisiete', 'dieciocho', 'diecinueve', 'veinte', 'veintiuno', 'veintidós', 'veintitrés', 'veinticuatro', 'veinticinco', 'veintiséis', 'veintisiete', 'veintiocho', 'veintinueve'];
  var ES_T = ['', '', '', 'treinta', 'cuarenta', 'cincuenta', 'sesenta', 'setenta', 'ochenta', 'noventa'];
  var ES_H = ['', 'ciento', 'doscientos', 'trescientos', 'cuatrocientos', 'quinientos', 'seiscientos', 'setecientos', 'ochocientos', 'novecientos'];
  function es99(n) { if (n < 30) return ES_U[n]; var o = n % 10; return ES_T[Math.floor(n / 10)] + (o ? ' y ' + ES_U[o] : ''); }
  function es999(n) {
    if (n === 100) return 'cien';
    var h = Math.floor(n / 100), r = n % 100;
    return [h ? ES_H[h] : '', r ? es99(r) : ''].filter(Boolean).join(' ');
  }
  function esApocope(w) { return /veintiuno$/.test(w) ? w.replace(/veintiuno$/, 'veintiún') : w.replace(/uno$/, 'un'); }
  function esBelowMillion(n) {
    var t = Math.floor(n / 1000), r = n % 1000, out = [];
    if (t === 1) out.push('mil'); else if (t) out.push(esApocope(es999(t)) + ' mil');
    if (r) out.push(es999(r));
    return out.join(' ');
  }
  function wordsSpanish(n) {
    n = Math.floor(n);
    if (n === 0) return 'cero';
    var bil = Math.floor(n / 1e12), mil = Math.floor((n % 1e12) / 1e6), rest = n % 1e6, out = [];
    if (bil) out.push(bil === 1 ? 'un billón' : esApocope(esBelowMillion(bil)) + ' billones');
    if (mil) out.push(mil === 1 ? 'un millón' : esApocope(esBelowMillion(mil)) + ' millones');
    if (rest) out.push(esBelowMillion(rest));
    return out.join(' ');
  }

  var FR_U = ['zéro', 'un', 'deux', 'trois', 'quatre', 'cinq', 'six', 'sept', 'huit', 'neuf', 'dix', 'onze', 'douze', 'treize', 'quatorze', 'quinze', 'seize'];
  var FR_T = ['', '', 'vingt', 'trente', 'quarante', 'cinquante', 'soixante'];
  function fr99(n, final) {
    if (n <= 16) return FR_U[n];
    if (n < 20) return 'dix-' + FR_U[n - 10];
    var t = Math.floor(n / 10), o = n % 10;
    if (t <= 6) return FR_T[t] + (o === 1 ? ' et un' : o ? '-' + FR_U[o] : '');
    if (t === 7) return 'soixante' + (o === 1 ? ' et onze' : '-' + fr99(10 + o, true));
    if (t === 8) return o ? 'quatre-vingt-' + FR_U[o] : (final ? 'quatre-vingts' : 'quatre-vingt');
    return 'quatre-vingt-' + fr99(10 + o, true);
  }
  function fr999(n, final) {
    var h = Math.floor(n / 100), r = n % 100, out = [];
    if (h === 1) out.push('cent');
    else if (h) out.push(FR_U[h] + ' cent' + (r === 0 && final ? 's' : ''));
    if (r) out.push(fr99(r, final));
    return out.join(' ');
  }
  function frBelowMillion(n, final) {
    var t = Math.floor(n / 1000), r = n % 1000, out = [];
    if (t === 1) out.push('mille'); else if (t) out.push(fr999(t, false) + ' mille');
    if (r) out.push(fr999(r, final));
    return out.join(' ');
  }
  function wordsFrench(n) {
    n = Math.floor(n);
    if (n === 0) return 'zéro';
    var bil = Math.floor(n / 1e12), mrd = Math.floor((n % 1e12) / 1e9), mil = Math.floor((n % 1e9) / 1e6), rest = n % 1e6, out = [];
    function big(v, word) { return (v === 1 ? 'un ' + word : frBelowMillion(v, true) + ' ' + word + 's'); }
    if (bil) out.push(big(bil, 'billion'));
    if (mrd) out.push(big(mrd, 'milliard'));
    if (mil) out.push(big(mil, 'million'));
    if (rest) out.push(frBelowMillion(rest, true));
    return out.join(' ');
  }

  var DE_U = ['null', 'eins', 'zwei', 'drei', 'vier', 'fünf', 'sechs', 'sieben', 'acht', 'neun', 'zehn', 'elf', 'zwölf', 'dreizehn', 'vierzehn', 'fünfzehn', 'sechzehn', 'siebzehn', 'achtzehn', 'neunzehn'];
  var DE_T = ['', '', 'zwanzig', 'dreißig', 'vierzig', 'fünfzig', 'sechzig', 'siebzig', 'achtzig', 'neunzig'];
  function de99(n) {
    if (n < 20) return DE_U[n];
    var o = n % 10;
    return (o ? (o === 1 ? 'ein' : DE_U[o]) + 'und' : '') + DE_T[Math.floor(n / 10)];
  }
  function de999(n) {
    var h = Math.floor(n / 100), r = n % 100;
    return (h ? (h === 1 ? 'ein' : DE_U[h]) + 'hundert' : '') + (r ? de99(r) : '');
  }
  function deBelowMillion(n) {
    var t = Math.floor(n / 1000), r = n % 1000;
    return (t ? (t === 1 ? 'ein' : de999(t).replace(/eins$/, 'ein')) + 'tausend' : '') + (r ? de999(r) : '');
  }
  function wordsGerman(n) {
    n = Math.floor(n);
    if (n === 0) return 'null';
    var bil = Math.floor(n / 1e12), mrd = Math.floor((n % 1e12) / 1e9), mil = Math.floor((n % 1e9) / 1e6), rest = n % 1e6, out = [];
    function big(v, one, many) { return v === 1 ? 'eine ' + one : deBelowMillion(v) + ' ' + many; }
    if (bil) out.push(big(bil, 'Billion', 'Billionen'));
    if (mrd) out.push(big(mrd, 'Milliarde', 'Milliarden'));
    if (mil) out.push(big(mil, 'Million', 'Millionen'));
    if (rest) out.push(deBelowMillion(rest));
    return out.join(' ');
  }

  var SCRIPTS = [
    ['Devanagari (Hindi, Marathi, Nepali)', 0x966], ['Bengali and Assamese', 0x9E6], ['Gurmukhi (Punjabi)', 0xA66],
    ['Gujarati', 0xAE6], ['Odia', 0xB66], ['Tamil', 0xBE6], ['Telugu', 0xC66], ['Kannada', 0xCE6], ['Malayalam', 0xD66],
    ['Thai', 0xE50], ['Lao', 0xED0], ['Tibetan', 0xF20], ['Burmese', 0x1040], ['Khmer', 0x17E0], ['Mongolian', 0x1810],
    ['Eastern Arabic', 0x660], ['Persian and Urdu', 0x6F0]
  ];
  function scripts(s) {
    return SCRIPTS.map(function (sc) {
      return { name: sc[0], text: s.replace(/\d/g, function (d) { return String.fromCharCode(sc[1] + (+d)); }) };
    });
  }

  function cheque(amount, currency) {
    var whole = Math.floor(amount), cents = Math.round((amount - whole) * 100);
    if (cents === 100) { whole += 1; cents = 0; }
    if (currency === 'INR') {
      var w = titleCase(wordsIndian(whole));
      return 'Rupees ' + w + (cents ? ' and ' + titleCase(en99(cents)) + ' Paise' : '') + ' Only';
    }
    var name = currency === 'EUR' ? 'Euros' : currency === 'GBP' ? 'Pounds' : currency === 'CAD' ? 'Canadian Dollars' : 'Dollars';
    return titleCase(wordsEN(whole, currency === 'GBP')) + ' and ' + ('0' + cents).slice(-2) + '/100 ' + name;
  }

  /* ---------- keypad ---------- */
  var KEYPAD = ['', '', 'ABC', 'DEF', 'GHI', 'JKL', 'MNO', 'PQRS', 'TUV', 'WXYZ'];
  var LETTER = {};
  KEYPAD.forEach(function (ls, d) { for (var i = 0; i < ls.length; i++) LETTER[ls[i]] = String(d); });
  function wordToDigits(w) {
    return String(w).toUpperCase().replace(/[^A-Z0-9]/g, '').replace(/[A-Z]/g, function (c) { return LETTER[c]; });
  }
  function keypadGroups(s) { return s.split('').map(function (d) { return KEYPAD[+d] || ''; }); }
  function phonewords(digits, dict, limit) {
    limit = limit || 12;
    var res = { whole: [], parts: [], splits: [] };
    if (!dict || !digits) return res;
    res.whole = (dict[digits] || []).slice(0, limit);
    var seen = {};
    for (var len = Math.min(digits.length - 1, 10); len >= 3; len--) {
      for (var i = 0; i + len <= digits.length; i++) {
        var sub = digits.substr(i, len), ws = dict[sub];
        if (!ws) continue;
        for (var k = 0; k < Math.min(ws.length, 3); k++) {
          var key = ws[k] + '@' + i;
          if (seen[key]) continue;
          seen[key] = 1;
          res.parts.push({ word: ws[k], start: i, end: i + len });
        }
      }
      if (res.parts.length >= limit * 2) break;
    }
    res.parts = res.parts.slice(0, limit * 2);
    if (digits.length >= 6 && digits.length <= 12) {
      var memo = {};
      var seg = function (pos) {
        if (pos === digits.length) return [[]];
        if (memo[pos]) return memo[pos];
        var out = [];
        for (var l = 2; l <= digits.length - pos && out.length < 6; l++) {
          var ws2 = dict[digits.substr(pos, l)];
          if (!ws2) continue;
          var tails = seg(pos + l);
          for (var a = 0; a < Math.min(ws2.length, 2) && out.length < 6; a++)
            for (var b = 0; b < tails.length && out.length < 6; b++) out.push([ws2[a]].concat(tails[b]));
        }
        memo[pos] = out;
        return out;
      };
      res.splits = seg(0).filter(function (x) { return x.length > 1; }).slice(0, 6);
    }
    return res;
  }

  /* ---------- numerology ---------- */
  var PYTH = { A: 1, B: 2, C: 3, D: 4, E: 5, F: 6, G: 7, H: 8, I: 9, J: 1, K: 2, L: 3, M: 4, N: 5, O: 6, P: 7, Q: 8, R: 9, S: 1, T: 2, U: 3, V: 4, W: 5, X: 6, Y: 7, Z: 8 };
  var CHAL = { A: 1, B: 2, C: 3, D: 4, E: 5, F: 8, G: 3, H: 5, I: 1, J: 1, K: 2, L: 3, M: 4, N: 5, O: 7, P: 8, Q: 1, R: 2, S: 3, T: 4, U: 6, V: 6, W: 6, X: 5, Y: 1, Z: 7 };
  function reduce(n, keepMaster) {
    n = Math.abs(Math.floor(n));
    while (n > 9 && !(keepMaster && (n === 11 || n === 22 || n === 33))) n = digitSum(String(n));
    return n;
  }
  function nameSum(name, table, filter) {
    var t = 0, s = String(name).toUpperCase();
    for (var i = 0; i < s.length; i++) {
      var c = s[i];
      if (!table[c]) continue;
      var vowel = 'AEIOU'.indexOf(c) >= 0;
      if (filter === 'vowels' && !vowel) continue;
      if (filter === 'consonants' && vowel) continue;
      t += table[c];
    }
    return t;
  }
  function lifePath(y, m, d) { return reduce(reduce(y, true) + reduce(m, true) + reduce(d, true), true); }
  function numerologyProfile(name, y, m, d, nowYear) {
    var out = {};
    if (y && m && d) {
      out.lifePath = lifePath(y, m, d);
      out.birthday = reduce(d, true);
      out.rootNumber = reduce(d, false);
      out.destiny = reduce(digitSum(String(y) + String(m) + String(d)), false);
      if (nowYear) out.personalYear = reduce(reduce(m, false) + reduce(d, false) + reduce(nowYear, false), false);
    }
    if (name && /[a-z]/i.test(name)) {
      out.expression = reduce(nameSum(name, PYTH), true);
      out.soulUrge = reduce(nameSum(name, PYTH, 'vowels'), true);
      out.personality = reduce(nameSum(name, PYTH, 'consonants'), true);
      var cs = nameSum(name, CHAL);
      out.chaldeanCompound = cs;
      out.chaldean = reduce(cs, false);
    }
    return out;
  }

  /* ---------- culture lens ---------- */
  var CULTURES = ['cn', 'jp', 'kr', 'th', 'we'];
  function cultureLens(s, lex) {
    var tally = {}, hits = [];
    CULTURES.forEach(function (c) { tally[c] = { pos: 0, neg: 0, why: [] }; });
    for (var i = 0; i < s.length; i++) {
      var dg = lex.digits[s[i]];
      CULTURES.forEach(function (c) {
        var v = dg[c] || 0;
        if (v > 0) tally[c].pos += v; else if (v < 0) tally[c].neg += v;
      });
    }
    Object.keys(lex.combos).forEach(function (key) {
      var cb = lex.combos[key];
      var match = cb.exact ? s === key : s.indexOf(key) >= 0;
      if (!match) return;
      hits.push(key);
      Object.keys(cb.effect || {}).forEach(function (c) {
        if (!tally[c]) return;
        var v = cb.effect[c];
        if (v > 0) tally[c].pos += v; else tally[c].neg += v;
      });
    });
    var verdict = {};
    CULTURES.forEach(function (c) {
      var t = tally[c];
      verdict[c] = t.pos > 0 && t.neg < 0 ? 'm' : t.pos > 0 ? 'f' : t.neg < 0 ? 'a' : 'n';
    });
    return { verdict: verdict, combos: hits };
  }

  /* ---------- properties ---------- */
  function properties(n, s, f, sig) {
    var p = [];
    var prime = isPrime(n);
    p.push(n % 2 === 0 ? 'ev' : 'od');
    if (prime) p.push('pr'); else if (n > 1) p.push('co');
    if (n > 0 && isSquare(n)) p.push('sq');
    if (n > 0 && isCube(n)) p.push('cu');
    if (n > 0 && isSquare(8 * n + 1)) p.push('tr');
    if (isFibonacci(n)) p.push('fi');
    if (s.length > 1 && s === reverseStr(s)) p.push('pa');
    if (s.length > 1 && /^(\d)\1+$/.test(s)) p.push('re');
    if (n > 0 && n % digitSum(s) === 0) p.push('ha');
    if (n > 0 && isArmstrong(n)) p.push('ar');
    if (n > 0 && isHappy(n)) p.push('hp');
    if (n > 1) {
      var al = sig - n;
      p.push(al === n ? 'pf' : al > n ? 'ab' : 'de');
    }
    var omega = f.reduce(function (a, x) { return a + x[1]; }, 0);
    if (omega === 2) p.push('se');
    if (n > 1 && f.every(function (x) { return x[1] === 1; })) p.push('sf');
    if (isPowerOf2(n)) p.push('p2');
    if (FACTORIALS.indexOf(n) >= 0) p.push('fa');
    if (prime) {
      if (isPrime(n - 2) || isPrime(n + 2)) p.push('tw');
      if (isPrime(2 * n + 1)) p.push('sg');
      if (n > 2 && isPrime((n - 1) / 2)) p.push('sa');
      var rv = Number(reverseStr(s));
      if (rv !== n && isPrime(rv)) p.push('em');
    }
    if (s.length === 6 && s.slice(0, 3) === s.slice(3)) p.push('aa');
    return p;
  }

  function sqrtStr(n) {
    var r = Math.sqrt(n);
    return Number.isInteger(r) ? String(r) : r.toFixed(4).replace(/0+$/, '');
  }
  function cbrtStr(n) {
    var r = Math.cbrt(n), ri = Math.round(r);
    return ri * ri * ri === n ? String(ri) : r.toFixed(4).replace(/0+$/, '');
  }
  function factorHTML(f) {
    if (!f.length) return '';
    return f.map(function (x) { return x[0].toLocaleString('en-US') + (x[1] > 1 ? '<sup>' + x[1] + '</sup>' : ''); }).join(' × ');
  }
  function factorText(f) {
    var sup = '⁰¹²³⁴⁵⁶⁷⁸⁹';
    return f.map(function (x) {
      return x[0] + (x[1] > 1 ? String(x[1]).replace(/\d/g, function (d) { return sup[+d]; }) : '');
    }).join(' × ');
  }
  function asTime(s) {
    var n = Number(s);
    if (s.length < 3 || s.length > 4) return '';
    var h = Math.floor(n / 100), m = n % 100;
    if (h > 23 || m > 59) return '';
    return h + ':' + ('0' + m).slice(-2);
  }
  function duration(sec) {
    var d = Math.floor(sec / 86400), h = Math.floor((sec % 86400) / 3600), m = Math.floor((sec % 3600) / 60), x = sec % 60, out = [];
    if (d) out.push(d.toLocaleString('en-US') + ' d');
    if (h) out.push(h + ' h');
    if (m) out.push(m + ' min');
    if (x || !out.length) out.push(x + ' s');
    return out.join(' ');
  }

  /* ---------- everything about one number ---------- */
  function analyze(n, opts) {
    opts = opts || {};
    var s = String(n), f = factorize(n), sig = n > 0 ? sigma(f) : 0;
    var prime = isPrime(n);
    var r = {
      n: n, s: s, digits: s.length,
      type: n === 0 ? 'zero' : n === 1 ? 'unit' : prime ? 'prime' : 'composite',
      factors: f, factorHTML: factorHTML(f), factorText: factorText(f),
      divisorCount: n > 0 ? tau(f) : 0, divisorSum: sig, totient: totient(n, f),
      props: properties(n, s, f, sig),
      prevPrime: n > 2 ? prevPrime(n) : 0, nextPrime: nextPrime(n),
      primeIndex: prime ? primePi(n) : null,
      digitSum: digitSum(s), digitalRoot: digitalRoot(n), digitProduct: digitProduct(s),
      binary: toBase(n, 2), octal: toBase(n, 8), hex: toBase(n, 16), base36: toBase(n, 36),
      roman: roman(n), sqrt: sqrtStr(n), cbrt: cbrtStr(n),
      words: wordsEN(n, false), wordsUK: wordsEN(n, true), wordsIndian: wordsIndian(n),
      ordinal: ordinalWords(n), ordinalShort: ordinalSuffix(n),
      hindi: wordsHindi(n), chinese: chinese(n), chineseFinancial: chineseFinancial(n), japanese: japanese(n),
      spanish: wordsSpanish(n), french: wordsFrench(n), german: wordsGerman(n),
      scripts: scripts(s), keypad: keypadGroups(s), time: asTime(s),
      asSeconds: duration(n), numerologyRoot: reduce(digitSum(s), true)
    };
    if (n > 0 && r.divisorCount <= (opts.maxDivisors || 512)) r.divisors = divisorList(f);
    if (opts.lexicon) r.culture = cultureLens(s, opts.lexicon);
    if (opts.dict) r.phonewords = phonewords(s, opts.dict, 12);
    return r;
  }

  return {
    MAX: MAX, parse: parse, digitsOnly: digitsOnly,
    isPrime: isPrime, factorize: factorize, divisorList: divisorList, tau: tau, sigma: sigma, totient: totient,
    nextPrime: nextPrime, prevPrime: prevPrime, primePi: primePi,
    digitSum: digitSum, digitalRoot: digitalRoot, reduce: reduce,
    toBase: toBase, roman: roman, wordsEN: wordsEN, wordsIndian: wordsIndian, ordinalWords: ordinalWords,
    ordinalSuffix: ordinalSuffix, wordsHindi: wordsHindi, chinese: chinese, chineseFinancial: chineseFinancial,
    japanese: japanese, wordsSpanish: wordsSpanish, wordsFrench: wordsFrench, wordsGerman: wordsGerman,
    scripts: scripts, cheque: cheque, titleCase: titleCase,
    KEYPAD: KEYPAD, wordToDigits: wordToDigits, keypadGroups: keypadGroups, phonewords: phonewords,
    numerologyProfile: numerologyProfile, lifePath: lifePath, cultureLens: cultureLens, CULTURES: CULTURES,
    properties: properties, factorHTML: factorHTML, factorText: factorText, asTime: asTime, duration: duration,
    analyze: analyze
  };
});
