---
'@bitrate/api': patch
---

Made a bootstrap failure log the error and exit with a non-zero status instead of relying on
Node's default unhandled-rejection behaviour, as part of enabling Biome's floating/misused
promise lint rules.
