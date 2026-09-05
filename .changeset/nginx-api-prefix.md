---
'@bitrate/api': major
---

Every API request through nginx returned 404. `main.ts` calls `setGlobalPrefix('api')`, so the
API serves at `/api/v1/...`, while the nginx `/api` location rewrote the path to strip that
prefix before proxying. The API is reachable from the internet again.
