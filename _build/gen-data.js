#!/usr/bin/env node
/*
 * Generates the data behind every static number page:
 *   _data/n/<shard>.json  compact, positional facts per number, one file per hundred plus x.json
 *                       for notable numbers above 1,000 (read by _layouts/number.html)
 *   _numbers/<n>.md     one empty stub per number, so Jekyll builds /number/<n>/
 *
 * Usage:  node _build/gen-data.js            (0–1000 plus notable numbers)
 *         RANGE_MAX=5000 node _build/gen-data.js
 *
 * Field order in the shard files (keep in sync with _layouts/number.html):
 *  0 words  1 ordinal  2 indian words ('' when identical)  3 type z|u|p|c  4 prime index
 *  5 factor html  6 divisors  7 divisor count  8 divisor sum  9 totient  10 prev prime  11 next prime
 *  12 binary  13 octal  14 hex  15 base-36  16 roman  17 sqrt  18 cbrt  19 property codes
 *  20 keypad words  21 numerology root  22 culture verdicts (cn jp kr th we)  23 matched combos
 */
'use strict';
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const E = require(path.join(ROOT, 'assets/js/engine.js'));
const lexicon = JSON.parse(fs.readFileSync(path.join(ROOT, '_data/lexicon.json'), 'utf8'));
const words = [0, 1, 2, 3].map((i) => fs.readFileSync(path.join(ROOT, `assets/data/words-${i}.txt`), 'utf8')).join(' ').trim().split(/\s+/);

const dict = {};
for (const w of words) {
  const d = E.wordToDigits(w);
  if (!dict[d]) dict[d] = [];
  if (dict[d].length < 6) dict[d].push(w);
}

const RANGE_MAX = Number(process.env.RANGE_MAX || 1000);
const NOTABLE = [1001, 1010, 1111, 1212, 1221, 1234, 1313, 1314, 1414, 1440, 1515, 1717, 1729, 1818, 1947,
  2020, 2024, 2025, 2026, 2222, 3333, 4321, 4444, 5555, 6174, 6666, 7777, 8888, 9999, 10000, 11111,
  12345, 65536, 86400, 99999, 100000, 111111, 123456, 142857, 222222, 333333, 439439, 444444, 555555,
  666666, 777777, 888888, 999999, 1000000, 5201314];

const list = [];
for (let i = 0; i <= RANGE_MAX; i++) list.push(i);
for (const n of NOTABLE) if (n > RANGE_MAX) list.push(n);

const data = {};
for (const n of list) {
  const a = E.analyze(n, { lexicon, dict, maxDivisors: 300 });
  let kw = [];
  if (!/[01]/.test(a.s)) {
    kw = a.phonewords.whole.slice(0, 6).map((w) => w.toUpperCase());
    if (!kw.length) kw = a.phonewords.splits.slice(0, 3).map((sp) => sp.join('-').toUpperCase());
  }
  data[a.s] = [
    a.words, a.ordinal, a.wordsIndian === a.words ? '' : a.wordsIndian, a.type[0], a.primeIndex || 0,
    a.factorHTML, (a.divisors || []).join(', '), a.divisorCount, a.divisorSum, a.totient,
    a.prevPrime, a.nextPrime, a.binary, a.octal, a.hex, a.base36, a.roman, a.sqrt, a.cbrt,
    a.props.join(' '), kw.join(' '), a.numerologyRoot,
    E.CULTURES.map((c) => a.culture.verdict[c]).join(''), a.culture.combos.join(' ')
  ];
}

const shards = {};
for (const k of Object.keys(data)) {
  const n = Number(k);
  const id = n > 1000 ? 'x' : String(Math.floor(n / 100));
  (shards[id] = shards[id] || []).push(JSON.stringify(k) + ':' + JSON.stringify(data[k]));
}
const dataDir = path.join(ROOT, '_data/n');
fs.mkdirSync(dataDir, { recursive: true });
for (const f of fs.readdirSync(dataDir)) fs.unlinkSync(path.join(dataDir, f));
for (const id of Object.keys(shards)) fs.writeFileSync(path.join(dataDir, id + '.json'), '{\n' + shards[id].join(',\n') + '\n}\n');
if (fs.existsSync(path.join(ROOT, '_data/numbers.json'))) fs.unlinkSync(path.join(ROOT, '_data/numbers.json'));

const stubDir = path.join(ROOT, '_numbers');
fs.mkdirSync(stubDir, { recursive: true });
for (const f of fs.readdirSync(stubDir)) if (f.endsWith('.md')) fs.unlinkSync(path.join(stubDir, f));
for (const n of list) fs.writeFileSync(path.join(stubDir, `${n}.md`), '---\n---\n');

console.log(`_data/n/: ${Object.keys(shards).length} shards for ${list.length} numbers; stubs written to _numbers/`);
