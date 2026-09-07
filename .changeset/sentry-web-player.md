---
'@bitrate/web-player': minor
---

Added Sentry error monitoring, tracing, and session replay to the web player across all three Next.js runtimes — browser, Node server, and edge — matching the API's existing environment and release conventions. Client events are tunnelled through the app's own origin so ad-blockers cannot drop them, and the route guard now lets that tunnel through. Source maps upload on a production build when `SENTRY_AUTH_TOKEN` is present.
