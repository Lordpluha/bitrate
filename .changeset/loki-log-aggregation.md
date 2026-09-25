---
'@bitrate/api': patch
---

`apps/api` now logs structured JSON via `nestjs-pino` instead of plain text through the built-in NestJS logger — existing `new Logger(context)` call sites are unaffected, only the output format and the addition of automatic per-request logging (excluding the Prometheus-scraped `/metrics` route) change. No public route, response shape or auth behavior changed.
