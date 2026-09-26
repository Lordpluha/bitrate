---
'@bitrate/api': patch
'@bitrate/converter': patch
---

Patched `nodemailer` (quadratic-time DoS in its address parser, GHSA-2x7j-588g-ccc2) and `sharp`
(bundled a vulnerable libheif, GHSA-rgj7-g3m4-5g8c) to their fixed versions. Both already
satisfied the existing `^` range in `package.json`, so only the resolved lockfile version moved.
