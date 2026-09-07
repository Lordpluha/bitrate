---
'@bitrate/web-player': patch
---

The web player's Sentry DSN now comes only from `NEXT_PUBLIC_SENTRY_DSN`, with no hardcoded fallback — an unconfigured build starts the SDK disabled and reports nowhere instead of adopting a baked-in project. The variable is passed as a Docker build arg through the image workflows, since `next build` inlines it into the client bundle and a runtime-only value would never reach the browser.
