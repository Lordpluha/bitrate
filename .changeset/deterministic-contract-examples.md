---
'@bitrate/api': patch
---

Swagger examples no longer embed the current time. Four fields in the liked-tracks
response example called `new Date()` at module load, so every API boot produced a
different OpenAPI document and therefore a different generated contract. That made
the contract reproducible only against the exact second it was generated: even a
freshly committed `v1.ts` would be reported as drifted on the next CI run. The
examples now use a fixed instant, the way the neighbouring `releaseDate` already did.
