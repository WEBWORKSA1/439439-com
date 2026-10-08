# 439439.com — Number Intelligence Hub

Every number has a story. 439439.com is a free, mobile-first reference for any number: prime check, factors, words in nine languages, Roman numerals and bases, phone-keypad words, numerology traditions and luck across cultures, plus games, a monthly contest, a lead desk for number services, sponsorships and reader support.

## How it is built

- **Static site on GitHub Pages** (free plan). Pages runs Jekyll on every push to `main`; there is no server and no build step to run yourself.
- **1,051 number pages** (`/number/0/` to `/number/1000/` plus notable numbers such as 1729, 6174, 142857 and 439439) come from one layout, `_layouts/number.html`, a compact data file, `_data/numbers.json`, and an empty stub per number in `_numbers/`.
- **The number engine** (`assets/js/engine.js`) does all math in the browser and in Node, so static pages and live tools always agree.
- **Forms** post to FormSubmit (AJAX). The inbox address is never written in the HTML; it is assembled in the browser only when needed.
- **Monetisation**: Google AdSense (Auto ads + optional manual units), YouTube embeds, a multi-step lead desk, sponsorship packages, donation pledges, and a careers page.

## Folders

| Path | What it holds |
| --- | --- |
| `index.html`, `*/index.html` | Pages (home, explorer, tools, culture, story, services, support, advertise, careers, play, legal) |
| `_layouts/`, `_includes/` | Page shells: header (with the top contact bar), footer, number and article templates |
| `_articles/` | Blog articles in Markdown (front matter holds FAQ, sources and the call to action) |
| `_data/` | Lexicon (digit meanings, cultures, combinations), reference facts, curated notes, videos, number data |
| `_numbers/` | One empty stub per number page (generated) |
| `assets/` | CSS, JavaScript, word list and JSON data for the tools |
| `_build/` | Generators for the number data and keypad word list (not published) |

## Settings to edit

Open `assets/js/config.js`:

- `formAlias`: after you activate FormSubmit (the first form submission sends an activation email to the site inbox), paste the random string FormSubmit gives you.
- `adSlots`: AdSense ad-unit IDs for manual placements; leave blank to rely on Auto ads.
- `pay`: optional PayPal.me, Stripe Payment Link, Buy Me a Coffee and UPI details for instant donations.
- `contest`: prize text and closing time for the monthly challenge.
- `youtube`: your channel URL to show Subscribe buttons.

Site-wide values (AdSense client, business contact link, canonical domain) live in `_config.yml`.

## Regenerate number pages

```bash
pip install wordfreq && python3 _build/make_keypad.py   # word list for keypad lookups
node _build/gen-data.js                                  # _data/numbers.json + _numbers/ stubs
RANGE_MAX=5000 node _build/gen-data.js                   # more pages (watch the 1 GB Pages limit)
```

Commit the results; GitHub Pages rebuilds the site.

## Add content

- **Article:** add a Markdown file to `_articles/` with the same front matter as the existing ones.
- **Video:** add an entry to `_data/videos.yml` (11-character YouTube ID).
- **Curated fact for a number:** add it to `_data/curated.json`.

## Custom domain

When 439439.com should point here: in the repository go to Settings → Pages → Custom domain, enter `439439.com`, then at the domain registrar add A records `185.199.108.153`, `185.199.109.153`, `185.199.110.153`, `185.199.111.153` and a `www` CNAME to `webworksa1.github.io`. `ads.txt` must be reachable at `https://439439.com/ads.txt` for AdSense.

## Legal

Original text, design and code © 439439.com. Third-party names and marks belong to their owners and are used only to describe them; see `/disclaimer/`.
