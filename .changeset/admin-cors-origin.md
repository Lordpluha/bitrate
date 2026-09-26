---
'@bitrate/api': patch
---

Fixed the admin panel's login failing in production with a CORS preflight rejection
(`No 'Access-Control-Allow-Origin' header is present`). `getAllowedOrigins()` only ever knew
about `USER_WEB_HOST`/`ARTIST_WEB_HOST` — the admin frontend's own origin was never added when
the operator panel shipped. Added `ADMIN_WEB_HOST` alongside them, resolved with no fallback to
the legacy `WEB_HOST` (admin is a distinct, newer audience, so silently accepting the web
player's origin as an admin origin would be worse than failing loudly on a missing variable).
Also wired `ADMIN_WEB_HOST` through `deploy_reusable.yml`'s preflight and `.env`-render steps,
the same gap `CLOUDFLARE_TUNNEL_TOKEN` had.
