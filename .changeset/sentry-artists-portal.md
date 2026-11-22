---
'@bitrate/web-artists': minor
'@bitrate/web-player': patch
---

The artists portal reported its errors to Sentry: browser and SSR server errors, route-boundary errors, request and navigation traces, and session replays with all text and input masked, sent through the portal's own origin so ad-blockers did not drop them. In the player, errors caught by a page's error screen reached Sentry too instead of only the app-wide one. The Privacy Policy now named the artists portal alongside the listener app for error monitoring and session replays.
