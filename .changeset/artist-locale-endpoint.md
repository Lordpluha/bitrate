---
'@bitrate/api': minor
'@bitrate/contracts': minor
---

Added `PUT /api/v1/artist-profile/locale`, which stores the artist's workspace language (`en`, `uk` or `pl`). It is a preference, so it needs no profile version and leaves the version unchanged; the artist profile response now includes `locale`. Transactional emails already follow this value where a template exists.
