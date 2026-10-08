/* 439439.com — games: Daily target and Prime Rush. Requires engine.js and main.js. */
(function () {
  'use strict';
  var E = window.N439, Store = window.Store;
  if (!E) return;
  var $ = function (id) { return document.getElementById(id); };
  var CFG = window.CONFIG || {};
  if (CFG.contest) {
    if (CFG.contest.prize && $('ct-prize')) $('ct-prize').textContent = CFG.contest.prize;
    if (CFG.contest.closes && $('ct-close')) $('ct-close').textContent = CFG.contest.closes;
  }

  /* ---------- seeded random ---------- */
  function rng(seed) {
    return function () {
      seed |= 0; seed = seed + 0x6D2B79F5 | 0;
      var t = Math.imul(seed ^ seed >>> 15, 1 | seed);
      t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
      return ((t ^ t >>> 14) >>> 0) / 4294967296;
    };
  }

  /* ---------- Daily target ---------- */
  var tg = $('target-game');
  if (tg) {
    var now = new Date();
    var dayKey = now.getUTCFullYear() * 10000 + (now.getUTCMonth() + 1) * 100 + now.getUTCDate();
    var R = rng(dayKey);
    var pick = function (arr) { return arr[Math.floor(R() * arr.length)]; };
    var shuffle = function (arr) { var a = arr.slice(); for (var j = a.length - 1; j > 0; j--) { var r = Math.floor(R() * (j + 1)); var t = a[j]; a[j] = a[r]; a[r] = t; } return a; };
    var large = shuffle([25, 50, 75, 100]).slice(0, 2);
    var tiles = large.concat([0, 0, 0, 0].map(function () { return 1 + Math.floor(R() * 10); }));
    var target = 0, solution = '';
    for (var tries = 0; tries < 500 && !target; tries++) {
      var order = shuffle(tiles.map(function (v, i) { return i; }));
      var k = 3 + Math.floor(R() * 4), val = tiles[order[0]], expr = String(tiles[order[0]]), ok = true;
      for (var i = 1; i < k; i++) {
        var b = tiles[order[i]], op = pick(['+', '-', '*', '*', '/']);
        if (op === '+') { val += b; expr = '(' + expr + ' + ' + b + ')'; }
        else if (op === '-') { if (val - b <= 0) { ok = false; break; } val -= b; expr = '(' + expr + ' − ' + b + ')'; }
        else if (op === '*') { val *= b; expr = '(' + expr + ' × ' + b + ')'; }
        else { if (val % b !== 0 || b === 1) { ok = false; break; } val /= b; expr = '(' + expr + ' ÷ ' + b + ')'; }
      }
      if (ok && val >= 101 && val <= 999) { target = val; solution = expr.replace(/^\((.*)\)$/, '$1'); }
    }
    if (!target) { target = tiles[0] * tiles[2] + tiles[1]; solution = tiles[0] + ' × ' + tiles[2] + ' + ' + tiles[1]; }

    var tokens = [], used = [];
    var tilesEl = $('tg-tiles'), exprEl = $('tg-expr'), statusEl = $('tg-status');
    $('tg-target').textContent = target;
    $('tg-date').textContent = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate())).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' });
    var best = Store.get('tg-' + dayKey, null);
    var showBest = function () { $('tg-best').textContent = best ? 'Your best today: ' + best.points + ' points' : ''; };
    showBest();
    tilesEl.innerHTML = tiles.map(function (v, i) { return '<button class="tile" type="button" data-tile="' + i + '">' + v + '</button>'; }).join('');
    var last = function () { return tokens[tokens.length - 1]; };
    var draw = function () {
      exprEl.textContent = tokens.map(function (t) { return t.type === 'num' ? tiles[t.i] : { '*': '×', '/': '÷', '-': '−' }[t.v] || t.v; }).join(' ') || 'Tap a tile to start';
      Array.prototype.forEach.call(tilesEl.children, function (b, i) { b.classList.toggle('is-used', used.indexOf(i) >= 0); b.disabled = used.indexOf(i) >= 0; });
    };
    tilesEl.addEventListener('click', function (e) {
      var b = e.target.closest('[data-tile]'); if (!b) return;
      var i = Number(b.getAttribute('data-tile'));
      var l = last();
      if (l && (l.type === 'num' || l.v === ')')) { statusEl.textContent = 'Add an operation before the next tile.'; statusEl.className = 'form-status is-err'; return; }
      tokens.push({ type: 'num', i: i }); used.push(i); statusEl.textContent = ''; draw();
    });
    document.querySelectorAll('#target-game [data-op]').forEach(function (b) {
      b.addEventListener('click', function () {
        var v = b.getAttribute('data-op'), l = last();
        var lastIsVal = !!l && (l.type === 'num' || l.v === ')');
        if (v === '(' ? lastIsVal : !lastIsVal) return;
        tokens.push({ type: 'op', v: v }); draw();
      });
    });
    $('tg-undo').addEventListener('click', function () { var t = tokens.pop(); if (t && t.type === 'num') used.splice(used.indexOf(t.i), 1); draw(); });
    $('tg-clear').addEventListener('click', function () { tokens = []; used = []; statusEl.textContent = ''; draw(); });
    $('tg-reveal').addEventListener('click', function () { statusEl.textContent = 'One solution: ' + solution + ' = ' + target; statusEl.className = 'form-status is-ok'; });

    var evaluate = function () {
      var out = [], ops = [], prec = { '+': 1, '-': 1, '*': 2, '/': 2 };
      var apply = function () {
        var op = ops.pop(), b = out.pop(), a = out.pop();
        if (a === undefined || b === undefined) throw new Error('Incomplete expression.');
        if (op === '+') out.push(a + b); else if (op === '-') out.push(a - b); else if (op === '*') out.push(a * b);
        else { if (b === 0 || a % b !== 0) throw new Error('Every division must come out whole.'); out.push(a / b); }
      };
      tokens.forEach(function (t) {
        if (t.type === 'num') out.push(tiles[t.i]);
        else if (t.v === '(') ops.push('(');
        else if (t.v === ')') { while (ops.length && ops[ops.length - 1] !== '(') apply(); if (!ops.length) throw new Error('Unmatched bracket.'); ops.pop(); }
        else { while (ops.length && ops[ops.length - 1] !== '(' && prec[ops[ops.length - 1]] >= prec[t.v]) apply(); ops.push(t.v); }
      });
      while (ops.length) { if (ops[ops.length - 1] === '(') throw new Error('Unmatched bracket.'); apply(); }
      if (out.length !== 1) throw new Error('Incomplete expression.');
      return out[0];
    };
    $('tg-check').addEventListener('click', function () {
      if (!tokens.length) return;
      try {
        var v = evaluate(), diff = Math.abs(target - v), pts = diff === 0 ? 10 : diff <= 5 ? 7 : diff <= 10 ? 5 : 0;
        var exprText = exprEl.textContent;
        statusEl.className = 'form-status ' + (pts ? 'is-ok' : 'is-err');
        statusEl.innerHTML = (diff === 0 ? 'Exact! ' : '') + exprText + ' = ' + v + '. ' + (pts ? pts + ' points.' : 'Off by ' + diff + '. Get within 10 to score.') +
          (pts ? ' <button class="copy-btn" type="button" id="tg-enter">Use this in the contest</button>' : '');
        if (pts && (!best || pts > best.points)) { best = { points: pts, expr: exprText, value: v }; Store.set('tg-' + dayKey, best); showBest(); }
        var enter = $('tg-enter');
        if (enter) enter.addEventListener('click', function () {
          var cat = $('ce-cat'), entry = $('ce-entry');
          if (cat) cat.value = 'Puzzle champion';
          if (entry) entry.value = 'Daily target ' + dayKey + ': ' + exprText + ' = ' + v + ' (target ' + target + ', ' + pts + ' points)';
          location.hash = 'contest';
          if (entry) entry.focus();
        });
      } catch (err) { statusEl.className = 'form-status is-err'; statusEl.textContent = err.message; }
    });
    draw();
  }

  /* ---------- Prime Rush ---------- */
  var rush = $('rush-game');
  if (rush) {
    var primes = [], comps = [];
    for (var n = 11; n < 1000; n++) {
      if (E.isPrime(n)) primes.push(n);
      else if (n % 2 && n % 5 && n % 3) comps.push(n);
    }
    var numEl = $('pr-num'), yes = $('pr-yes'), no = $('pr-no'), startBtn = $('pr-start'), st = $('pr-status');
    var timeEl = $('pr-time'), scoreEl = $('pr-score'), bestEl = $('pr-best');
    var score = 0, left = 60, current = 0, timer = null, running = false;
    var bestScore = Store.get('prime-rush-best', 0);
    var showBestRush = function () { bestEl.textContent = bestScore ? 'Best ' + bestScore : ''; };
    showBestRush();
    var next = function () { current = Math.random() < 0.5 ? primes[Math.floor(Math.random() * primes.length)] : comps[Math.floor(Math.random() * comps.length)]; numEl.textContent = current; };
    var answer = function (saysPrime) {
      if (!running) return;
      var right = E.isPrime(current) === saysPrime;
      score += right ? 1 : -1;
      scoreEl.textContent = score;
      st.textContent = right ? 'Right.' : current + (E.isPrime(current) ? ' is prime.' : ' = ' + E.factorText(E.factorize(current)) + '.');
      st.className = 'form-status ' + (right ? 'is-ok' : 'is-err');
      next();
    };
    var stop = function () {
      running = false; clearInterval(timer); yes.disabled = no.disabled = true; startBtn.disabled = false; startBtn.textContent = 'Play again';
      if (score > bestScore) { bestScore = score; Store.set('prime-rush-best', score); }
      showBestRush();
      numEl.textContent = score + ' points';
      st.className = 'form-status is-ok';
      st.textContent = 'Time! You scored ' + score + '. ' + (score >= 25 ? 'Prime-level speed.' : 'Tip: anything ending in 5 or with digits adding to a multiple of 3 is not prime.');
    };
    startBtn.addEventListener('click', function () {
      score = 0; left = 60; running = true; scoreEl.textContent = '0'; timeEl.textContent = '60';
      yes.disabled = no.disabled = false; startBtn.disabled = true; st.textContent = '';
      next(); yes.focus();
      timer = setInterval(function () { left--; timeEl.textContent = left; if (left <= 0) stop(); }, 1000);
    });
    yes.addEventListener('click', function () { answer(true); });
    no.addEventListener('click', function () { answer(false); });
    document.addEventListener('keydown', function (e) {
      if (!running || (e.target.closest && e.target.closest('input, textarea, select'))) return;
      if (e.key === 'p' || e.key === 'P') answer(true);
      if (e.key === 'n' || e.key === 'N') answer(false);
    });
  }
})();
