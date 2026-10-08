#!/usr/bin/env python3
"""Builds assets/data/words-0.txt … words-3.txt: common English words for keypad (phoneword) lookups.

Uses the wordfreq frequency list so common words come first. Offensive words are
excluded via a hashed blocklist (so the list itself is not published).
Run:  pip install wordfreq && python3 _build/make_keypad.py
"""
import hashlib, os, re
from wordfreq import top_n_list

BLOCK = set(['0147fee25f60', '02ac484597c8', '037b3e936d13', '03913c546d46', '0391a1e58f32', '08bc5beda7a9', '0b77230a89e4', '11dbf66d28b6', '1ac5f681171f', '1f49e04244df', '1f956b5138bf', '21554666d275', '22bf5d4a65ff', '23c1bf668c18', '266f83d202fa', '2e71777dff35', '2f61cb7837b8', '305f0a31538b', '320d1a474a0d', '327c4c086e0a', '3417fa9d4857', '35ed5406781e', '36ff6da7d389', '3844f1150f73', '38d0f91a99c5', '39f6f95327b3', '3b19ecd69b49', '3bf858ffe8f9', '3cc97fd9bfd8', '3e83b13d99bf', '46e6f4054939', '4b8cfc115af4', '4d6bc77ca367', '4dbc8c31da4f', '56ece01521bf', '57456e092ee2', '595ed903cafe', '5c9b0c957784', '63aef6ff8e1e', '66e7a97c5557', '68bb04bd54b8', '6a3578663cb2', '6ab3adb9fbf3', '6b7b1987ddad', '6b80a34a0eed', '6da3cf38f418', '703f115eb4f3', '7f50fd4afd66', '819d7c152e96', '82da4c33e3a5', '842df0e20f51', '85fe8de475bc', '8c4947e96c7c', '921f208a404d', '926dee392274', '95e261baa83e', '9ee1a1f1f177', 'a2b7429c2d54', 'a9c241cebb7c', 'ab14d94055e7', 'ac04b70e6de3', 'ae972466bae3', 'b1aa14315bdb', 'b5af50a4c265', 'b8100ed7368f', 'bcee59cecbc4', 'bf5afc18dfbc', 'bff272e9d673', 'c0049442a7ca', 'c177922cb771', 'c22d4a0c9612', 'c976720ffb80', 'ca41bd367508', 'cdb96284a9ff', 'd286c1126ceb', 'd6791ddba07d', 'd6d222dbed66', 'd7eb2aa54ec8', 'dcd6732d222b', 'dd48bac63c1c', 'e3a82186438a', 'e49524050d4b', 'e60a7eb67994', 'e984805ca93b', 'ebbe2e8ed1f6', 'eef56b513021', 'f0b5bcedceba', 'f1358a077206', 'f1ca6ecc6865', 'f73127d74a6a', 'f8a17e958f70', 'fb8bba6c13c1'])
TWO = set("am an as at be by do go he hi if in is it me my no of oh ok on or ox so to up us we".split())
KEY = {c: d for d, letters in {"2": "abc", "3": "def", "4": "ghi", "5": "jkl", "6": "mno", "7": "pqrs", "8": "tuv", "9": "wxyz"}.items() for c in letters}

def blocked(w):
    return hashlib.sha1(w.encode()).hexdigest()[:12] in BLOCK

LIMIT = 13000   # words kept, most frequent first

def main():
    words, seen = [], set()
    for w in top_n_list("en", 60000):
        if not re.fullmatch(r"[a-z]{2,8}", w) or re.fullmatch(r"(.)\1+", w) or blocked(w) or w in seen:
            continue
        if len(w) == 2 and w not in TWO:
            continue
        seen.add(w)
        words.append(w)
        if len(words) >= LIMIT:
            break
    root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    folder = os.path.join(root, "assets", "data")
    os.makedirs(folder, exist_ok=True)
    parts = 4
    size = (len(words) + parts - 1) // parts
    for p in range(parts):
        chunk = words[p * size:(p + 1) * size]
        with open(os.path.join(folder, "words-%d.txt" % p), "w", encoding="utf-8") as f:
            for i in range(0, len(chunk), 120):
                f.write(" ".join(chunk[i:i + 120]) + "\n")
    print("words-0..3.txt:", len(words), "words")

if __name__ == "__main__":
    main()
