---
'@bitrate/api': minor
'@bitrate/contracts': minor
---

Added `GET /artists/:id/countdown` for the player's artist page: while an artist with promotion
enabled has approved a countdown step of an unpublished release and its day has come, it returns
that release's id, title, cover and release time; otherwise `countdown` is null. It never exposes
tracks of the unpublished release.
