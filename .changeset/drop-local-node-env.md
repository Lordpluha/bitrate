---
'@bitrate/api': patch
'@bitrate/web-player': patch
---

Dropped the non-standard `local` value for `NODE_ENV`. Node tooling recognises only `development`, `production`, and `test` — Next.js warns on anything else and assigns one of the three itself, and Nest never sets the variable at all, so `local` only ever appeared as a schema default that no runtime produced. Both env schemas now accept the three standard values and default to `development`; the Sentry environment fallbacks follow.
