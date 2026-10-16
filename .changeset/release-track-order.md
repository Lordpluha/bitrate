---
'@bitrate/api': minor
'@bitrate/web-artists': minor
'@bitrate/admin': patch
'@bitrate/contracts': minor
---

Recordings on a release now have a running order. Existing recordings keep their upload order,
new uploads go last, and artists move recordings up or down in the release workspace. The new
order must name every recording on the draft once, so a recording added or removed meanwhile
fails the write instead of being placed silently. The operator review page lists recordings in
the same order.
