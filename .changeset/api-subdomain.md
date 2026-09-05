---
'@bitrate/api': minor
---

The API answers on its own host as well as at `/api` on the main domain. Both paths reach the
same handler: the service sets a global prefix of `api`, and requests to the new host that omit
that prefix are rewritten to add it, so `api.<domain>/v1/…` and `api.<domain>/api/v1/…` both
work. The path route stays in place so the move needs no flag day.

Requests from the frontends are now cross-origin, which means a CORS preflight before every
non-simple request. The origins the API accepts come from `USER_WEB_HOST` and `ARTIST_WEB_HOST`,
and the auth cookies stay same-site — `bitrate.me` and `api.bitrate.me` share a registrable
domain, so `SameSite=Strict` still sends them.
