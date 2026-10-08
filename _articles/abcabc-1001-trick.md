---
title: "The 1001 trick: why every ABCABC number divides by 7, 11 and 13"
description: "Write any three digits twice and the result always divides by 7, 11 and 13. Here is why, how to perform it as a party trick, and the bigger rule hiding behind it."
date: 2026-10-08
updated: 2026-10-08
category: Math
hero_number: "1001"
reading_time: 5
cta_heading: "Need math help that sticks?"
cta_text: "One-to-one tutoring for school, SAT, IB and competition math, with tutors who make tricks like this one click."
cta_need: tutoring
cta_button: "Find a tutor"
faq:
  - q: "Why is every ABCABC number divisible by 7, 11 and 13?"
    a: "Because ABCABC equals ABC × 1001, and 1001 = 7 × 11 × 13. Dividing by those three primes simply undoes the 1001."
  - q: "Does it work for numbers like 007007?"
    a: "Yes. 007007 is 7007 = 7 × 1001. Any three digits, including leading zeros, work."
  - q: "Is there a similar trick for four digits?"
    a: "Yes. ABCDABCD equals ABCD × 10001, and 10001 = 73 × 137, so every such number divides by 73 and 137."
sources:
  - title: "1001 (number), Wikipedia"
    url: "https://en.wikipedia.org/wiki/1001_(number)"
  - title: "Divisibility rule, Wikipedia"
    url: "https://en.wikipedia.org/wiki/Divisibility_rule"
---
Pick any three-digit number, say 439. Write it twice: 439439. Now divide by 13, then by 11, then by 7. You get 33,803, then 3,073, then 439, with no remainder at any step. It works for every three-digit number, every time, and the reason fits in one line.

## The one-line proof

Writing a number twice is the same as multiplying it by 1001:

439 × 1000 + 439 = 439 × 1001 = 439439

And 1001 is not just any number. It is the product of three consecutive primes:

1001 = 7 × 11 × 13

So 439439 = 439 × 7 × 11 × 13. Divide by 7, 11 and 13 and only 439 is left. The same is true of 100100, 999999 or whatever you pick, which is why the trick never fails. You can try it on the [ABCABC trick tool]({{ '/tools/abcabc-trick/' | relative_url }}).

## How to perform it

1. Ask a friend to choose any three-digit number and type it twice into a calculator, without showing you.
2. Say, "I bet that number divides exactly by 13." Let them check: no remainder.
3. Ask them to divide the answer by 11, then by 7. Still no remainders.
4. Announce that the final number on the screen is the one they chose.

The reveal lands because the order looks random. Start with 13, the "unlucky" prime, for extra drama.

## The bigger rule hiding behind it

Because 1000 is one less than 1001, there is a neat test for 7, 11 and 13 that works on any number. Split the number into groups of three digits from the right, then add and subtract the groups alternately. If the result divides by 7, 11 or 13, so does the original number.

For 439439 the groups are 439 and 439, and 439 − 439 = 0. Zero divides by everything, so 439439 divides by 7, 11 and 13 together. For a number like 1,002,001 the groups are 1, 002 and 001, and 1 − 2 + 1 = 0, so it divides by 1001 too.

There are classic one-digit-at-a-time tests as well:

- **For 7:** double the last digit and subtract it from the rest. 439439: 43943 − 18 = 43925, and keep going until the number is small.
- **For 11:** take the alternating sum of the digits. 4 − 3 + 9 − 4 + 3 − 9 = 0, so 439439 divides by 11.
- **For 13:** add four times the last digit to the rest. 43943 + 36 = 43979, and so on.

## Four digits, eight digits

The pattern scales. A four-digit block written twice, ABCDABCD, equals ABCD × 10001, and 10001 = 73 × 137. So 12341234 divides by both 73 and 137. Repeating blocks always hide a factor of 1 followed by zeros and another 1, and those numbers often break into interesting primes.

## Why 1001 shows up elsewhere

1001 is a palindrome, the title number of *The Thousand and One Nights*, and a favourite cash-gift amount in India, where adding one rupee to a round sum marks a fresh start. Our own domain is the trick in action: 439439 is 439 × 1001. Read [the full 439439 story]({{ '/439439/' | relative_url }}) or see every fact about [1001]({{ '/number/1001/' | relative_url }}).
