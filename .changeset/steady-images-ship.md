---
'@bitrate/web-player': patch
'@bitrate/web-artists': patch
---

Corrected the deployment URLs baked into the published container images. CI built both
frontends against `http://localhost:3000` and a stale pre-rebrand Vercel host (web-player)
or no API URL at all (web-artists), and because `next build` inlines every `NEXT_PUBLIC_*`
value into the client bundle, no published image could ever reach the production API. The
build now defaults to the real origins and keeps the Actions variables as an override.
