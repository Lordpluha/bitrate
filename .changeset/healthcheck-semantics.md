---
'@bitrate/web-artists': major
'@bitrate/web-player': patch
'@bitrate/api': patch
---

The web-artists container reported unhealthy while serving correctly. Its root path answers 307
to `/auth/login` because the portal is behind auth, and the health check demanded exactly 200.
It now accepts any status below 500 — the check is meant to prove the server is up and routing,
not that a given page is public.

All three checks also lacked an error handler on the request, so a refused connection surfaced as
an unhandled `error` event and a stack trace instead of a clean failure.
