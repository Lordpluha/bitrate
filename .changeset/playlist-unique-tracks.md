---
"@bitrate/api": patch
---

A playlist now holds each track once. Adding tracks skips the ones the playlist already has,
and a request where every track is already there answers 409 "Track is already in this
playlist" instead of appending a second copy. Duplicates added before this change stay until
removed.
