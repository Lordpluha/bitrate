---
'@bitrate/web-player': major
---

Loading any page dropped most of its JavaScript and fonts. Next.js requests dozens of
content-hashed chunks at once, which tripped nginx's page rate limit — and nginx answers a
limited request with a 503 and an HTML body, so the browser reported `Refused to execute script
… MIME type ('text/html')` instead of anything about throttling. Build output now has its own
location, outside the limit, and is served with a one-year immutable cache.
