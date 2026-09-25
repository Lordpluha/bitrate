---
'@bitrate/admin': minor
'@bitrate/api': minor
---

Gave operators an interface again, for the first time since the Kottster panel was deleted. The API grew a `Staff` identity kept deliberately separate from `User` — `ADMIN`/`MODERATOR` roles, its own session model, no self-registration and no OAuth — behind `POST /api/v1/admin/auth/login`, `/refresh`, `/logout` and `GET /me`, guarded by a new `@AdminAuth(...roles)` decorator. `AuditLog` finally has a writer: the existing global audit interceptor now recognises a staff actor, so every operator mutation records who did what and from where instead of filing it as anonymous.

Four operator surfaces sit behind that: the moderation queue, which finally reads the `ModerationReport` rows the API had been collecting with nothing to read them; artist management with verification and soft delete; listener management; the catalog pipeline, listing tracks by processing state with failures and longest-stuck uploads first, and a reprocess action that reuses the existing audio-processing queue rather than adding a second one; and a read-only audit log with each row's actor resolved to a username server-side. Every mutation requires `ADMIN`; reads are open to `MODERATOR` as well. No response includes a password or two-factor secret, and lists exclude soft-deleted rows by default.

The panel itself is `apps/admin`, an Angular 22 zoneless SPA on spartan-ng, served at `admin.<domain>` behind `X-Frame-Options: DENY`. It goes through the API rather than around it, which was the condition ADR-0025 set for any replacement. Its data layer diverges from the other frontends on purpose and at some cost — `HttpClient` instead of `openapi-fetch`, no query cache at all, and request and response shapes written by hand as zod schemas because the generated contract could not describe endpoints that did not exist when the app was started.

One thing worth knowing before the next migration: `prisma migrate dev` wanted to drop the four GIN trigram indexes that back search, because `schema.prisma` has no syntax for them and Prisma therefore reads them as drift. They were removed from the generated SQL by hand and the whole chain was replayed against an empty database to prove the indexes survive. Every future generated migration will want to drop them again — see `.claude/rules/api-rules.md`.
