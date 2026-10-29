---
'@bitrate/player': major
---

Removed the deprecated legacy fallback (ADR-0065): `streaming.legacy`, the
`BitratePlayerLegacyAdapter` type and `source.progressiveUrl` are gone, and `streaming.renditionUrl`
is now required. A track whose manifest resolves to `null`, or whose manifest lookup fails, stops
with a playback error instead of trying another format; without MSE, or after a CMAF loader
failure, the element plays the rendition file natively.
