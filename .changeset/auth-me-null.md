---
'@bitrate/web-player': patch
---

Signed-out sessions no longer log "Query data cannot be undefined" for the current user: a 401 from `auth/me` is cached as signed out.
