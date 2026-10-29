---
'@bitrate/admin': minor
---

Removed the podcast vertical from the operator panel, per the music-only decision in ADR-0066. The Podcasts list and detail screens, their navigation entry and routes are gone, so `/podcasts` and `/podcasts/:id` now fall through to the not-found page. The role and staff editors no longer offer `podcasts:*` permissions, the moderation queue no longer filters by podcast or episode, and the overview's reports-by-type chart no longer shows those types. Report subjects no longer carry a parent link. Until the API removes them, podcast permissions it still stores and podcast/episode series it still reports are dropped when the panel reads them.
