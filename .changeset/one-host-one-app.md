---
'@bitrate/api': major
---

One host, one application. The web player answers on the apex, the artists portal on
`artists.<domain>`, and the API on `api.<domain>`; the path routes on the main domain are gone.

Two of those paths were already broken. `/uploads` proxied to a route the API does not have —
its static mount is `/static` — and `/docs` pointed at a service absent from the production
stack. `/api` worked but duplicated what the API host now serves.

The API host routes each URL shape explicitly rather than through one catch-all: `setGlobalPrefix`
covers the endpoints but not Swagger or the static mount, so a blanket rewrite would have turned
`/swagger` into a 404. Endpoints are reachable both as `/api/v1/…` and `/v1/…`, so the clients can
drop the redundant segment when convenient.
