---
'@bitrate/web-player': patch
---

The route screenshot baselines carry the Bitrate mark, and the gate that guards them can now see a
change that size.

`maxDiffPixelRatio: 0.02` allowed 18,000 differing pixels on a 1280×720 shot — eighteen times the
area of the header logo. Replacing the logo outright therefore passed the screenshot suite without
a single failure, and `--update-snapshots` declined to rewrite the baselines because it saw no
difference worth recording. Both still showed the previous product's logo.

Consecutive runs are byte-identical here, verified down to a ratio of zero, so the threshold is now
0.0004 — roughly 370 pixels of headroom for antialiasing, comfortably under anything logo-sized. An
8-pixel change to the logo's height fails both specs under the new value and passes under the old
one.
