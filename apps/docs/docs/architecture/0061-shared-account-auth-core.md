# ADR-0061: Shared account auth core for listeners and artists

Status: Accepted

Date: 2026-10-19

## Context

`users-auth` and `artists-auth` each implemented password login, lockout, session rotation,
logout, password reset, email-verification tokens, TOTP two-factor and the session guard.
The copies were line-for-line the same apart from table names (about 1,000 duplicated
lines), so every security fix had to land twice and had already started to drift.
`admin-auth` repeats the same pattern for staff.

Merging `User` and `Artist` into one `Account` table was considered and **not** chosen now:
41 foreign keys reference the two tables, and the move would touch cookies, tokens and both
front-ends. The product owner also decided that a listener and an artist with the same email
remain **two separate accounts**, so a merged table would not remove the second login anyway.

## Decision

- `src/modules/auth-core` holds the shared rules with no schema or HTTP change:
  - `AccountAuthCore` — login with lockout (5 attempts, 15 minutes), two-factor completion,
    refresh-token rotation, logout, password reset (1 hour) and email-verification tokens
    (24 hours);
  - `SessionAuthGuard` and `sessionAuth()` — the session guard body and the decorator
    factory behind `UserAuth()` / `ArtistAuth()`;
  - `TwoFactorCore` — TOTP enrolment, disabling and login verification;
  - `UNAUTHORIZED_ERRORS`, defined once.
- The core never touches Prisma directly. Each audience implements `AccountAuthStore`
  (`UserAuthStore`, `ArtistAuthStore`) and the guard and 2FA lookups in its own module, so
  writes to `user*` / `artist*` tables stay with their owners (ADR-0060).
- Services, guards and their constructors keep their names and signatures. The existing unit
  specs pass unchanged, which is the check that behaviour did not move.
- Audience-specific behaviour stays in the audience module: registration (legal fields,
  artist agreement, mail availability), mail delivery and artist email codes, session
  listing and revoke semantics, `OptionalUserAuthGuard`, `WsUserAuthGuard`, and the error
  text when a two-factor login finds no account.

## Consequences

- A lockout, rotation or token-lifetime change is made once and applies to both audiences.
- The i18n literal baseline fell from 238 to 220: duplicated messages collapsed into the core.
- Follow-ups, each its own change:
  - OAuth URL building, code exchange, username generation and session issuing are still
    duplicated (`oauth.service.ts` / `artist-oauth.service.ts`); their email-collision
    policies differ on purpose and stay per audience;
  - `admin-auth` can adopt `AccountAuthCore` and `SessionAuthGuard` for staff;
  - known differences kept as-is here rather than changed silently: `WsUserAuthGuard`
    does not check session expiry, listener two-factor login does not exclude soft-deleted
    accounts, listener OAuth treats a soft-deleted email as free (then fails on the unique
    index), and listener registration never receives `Accept-Language`.

## Alternatives considered

- **Merge `User` and `Artist` into `Account`** — see Context; rejected for now.
- **Nest-injectable core with generic Prisma delegates** — TypeScript cannot call a union of
  Prisma delegates, and it would move table writes out of the owning modules.
