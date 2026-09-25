---
'@bitrate/api': minor
'@bitrate/contracts': minor
---

Added three operator-panel API surfaces: a zero-filled daily time-series endpoint
(`GET /admin/overview/series`) covering uploads/processing outcome, signups, listens, and
moderation reports over a configurable trailing window; a paginated listening-history
endpoint for a user (`GET /admin/users/:id/listening-history`); and paginated tracks/albums
endpoints for an artist's publications (`GET /admin/artists/:id/tracks`,
`GET /admin/artists/:id/albums`). Playlists are user-owned in this schema, not artist-owned,
so no artist-scoped playlist endpoint was added. Also adds a `ListeningHistory.listenedAt`
index backing the new daily listens aggregation.
