---
'@bitrate/api': patch
---

Conditional HTTP caching (ETag and a 30-second `Cache-Control`) is now opted into per route with `@HttpCacheable()` instead of a URL pattern. The same public catalogue reads stay cached — artists, albums and playlists lists and details, browse categories and track charts — while GET routes under `artists/auth/*`, which the pattern had matched by accident, no longer carry those headers. Swagger lists the deployed server once, from `API_BASE_URL` or `https://api.bitrate.me` when it is unset. `PrismaService` now extends `PrismaClient`, so a new model needs no hand-written delegate, and transaction results are typed precisely.
