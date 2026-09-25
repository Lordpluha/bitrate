---
'@bitrate/api': patch
---

Added Swagger `@ApiOperation` documentation (or an explicit `@ApiExcludeEndpoint`) to every route that was missing it — 46 routes across `me`, `discovery`, `podcasts`, `app.controller`, `users-auth`, `users`, `artists-auth`, `search`, `tracks`, `moderation`, and `infra/storage` — and corrected two artist-auth summaries that were copy-pasted from the user-auth wording. Added a unit spec (`swagger-operation-coverage.unit-spec.ts`) that walks every controller on disk and fails if a route is undocumented again.
