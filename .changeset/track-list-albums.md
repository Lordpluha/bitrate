---
'@bitrate/api': minor
'@bitrate/contracts': minor
'@bitrate/web-player': minor
---

Track lists show the album each track belongs to, linked to the album page, instead of "Unknown Album". The API gained `GET /albums/by-tracks?trackIds=…`, which answers the earliest live album of up to 100 tracks per call (null for singles). The player now uses the design system's type: Unbounded for headings and lyrics, Inter for text.
