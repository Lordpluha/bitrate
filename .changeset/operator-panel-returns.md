---
'@bitrate/admin': minor
'@bitrate/api': minor
---

Gave operators an interface again, for the first time since the Kottster panel was deleted. The API grew a `Staff` identity kept deliberately separate from `User` — `ADMIN`/`MODERATOR` roles, its own session model, no self-registration and no OAuth — behind `POST /api/v1/admin/auth/login`, `/refresh`, `/logout` and `GET /me`, guarded by a new `@AdminAuth(...roles)` decorator. The first operator workflow is the moderation queue at `GET`/`PATCH /api/v1/admin/moderation/reports`, which finally reads the `ModerationReport` rows the API had been collecting with nothing to read them. `AuditLog` finally has a writer too: the existing global audit interceptor now recognises a staff actor, so every operator mutation records who did what and from where instead of filing it as anonymous.

The panel itself is `apps/admin`, an Angular 22 zoneless SPA on spartan-ng, served at `admin.<domain>` behind `X-Frame-Options: DENY`. It goes through the API rather than around it, which was the condition ADR-0025 set for any replacement. Its data layer diverges from the other frontends on purpose and at some cost — `HttpClient` instead of `openapi-fetch`, no query cache at all, and request/response shapes written by hand as zod schemas because the generated contract cannot describe endpoints that did not exist when the app was started.

One thing worth knowing before the next migration: `prisma migrate dev` wanted to drop the four GIN trigram indexes that back search, because `schema.prisma` has no syntax for them and Prisma therefore reads them as drift. They were removed from the generated SQL by hand and the whole chain was replayed against an empty database to prove the indexes survive. Every future generated migration will want to drop them again — see `.claude/rules/api-rules.md`.
