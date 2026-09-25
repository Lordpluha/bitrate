---
'@bitrate/api': minor
'@bitrate/contracts': minor
'@bitrate/admin': minor
---

Extended the operator surface's tracks, users, artists, moderation, and audit endpoints with the
detail views and take-down workflow the admin panel needs:

- Tracks, users, and artists each gain a `status=active|deactivated|all` list filter, a
  `DELETE`/`restore` pair (`tracks:delete`/`tracks:restore`, `users:restore`,
  `artists:restore`), and — for users and artists — `POST /:id/sessions/revoke`
  (`users:revoke-sessions`, `artists:revoke-sessions`) that deletes every active session for the
  account. **Access ends on the account's next request, not on token refresh** — every guarded
  route looks the session up by its hashed token on every request, so a revoked or taken-down
  session is rejected the moment it is next presented. An **already-open WebSocket connection is
  unaffected until it disconnects on its own** — the socket guard rejects a deleted account only
  at connect time; evicting a live connection on take-down is a known limitation, not covered by
  this change. Taking a track/user/artist down also revokes its account's sessions in the same
  transaction, and a repeated `DELETE`/`restore` (or `POST /reprocess` on a taken-down track,
  or `PATCH` verification on a taken-down artist) now answers **409 Conflict**, not 404 — a
  concurrent second request loses the same race. Every destructive/restorative write accepts an
  optional `{ reason?: string }` body (trimmed, 1–500 chars), recorded in an audit row alongside
  the affected id's before/after state — in the same transaction as the mutation. The existing
  `DELETE /admin/users/:id` and `/admin/artists/:id` routes stay backward compatible: the body is
  optional.
- Fixed a security gap in the listener account surface: a soft-deleted user's cookies kept
  working. `UserAuthGuard`/`OptionalUserAuthGuard` now scope every session lookup to
  `deletedAt: null`, `UsersService`/`UsersPrivateService` do the same for every by-id/email/
  username lookup, and every entry point that can mint a session for a listener — password
  login, 2FA completion, refresh, and Google/Facebook OAuth — now refuses a soft-deleted account
  with the same generic "Invalid credentials" error a nonexistent account gets, never revealing
  the account's take-down state. `WsUserAuthGuard` rejects a soft-deleted user at connect for the
  same reason (see the live-socket limitation above). Artists already had this coverage through
  `ArtistsPrivateService`/`ArtistsService`, which this change did not need to touch.
- Every admin list route's `ApiQuery` declarations now match its zod query schema exactly — the
  `status` filter had never been documented on tracks/users/artists, nor `entityType` on
  moderation reports, nor `entityId` on audit logs, despite each already being accepted and
  validated. A new coverage spec (`admin-list-query-coverage.unit-spec.ts`) fails the build if a
  future list route's documented params and validated params ever diverge again.
- `GET /admin/tracks/:id`, `/admin/users/:id`, and `/admin/artists/:id` no longer exclude
  soft-deleted rows — an operator can now review a deactivated account or taken-down track before
  deciding whether to restore it. Track detail adds its audio renditions, artist credits, genres,
  albums, and open report count; user detail adds playlist/liked-track/listening-history/reports-
  filed/active-session counts (playlist counts now exclude soft-deleted playlists); artist detail
  adds track/album/active-session/open-report counts.
- `GET /admin/moderation/reports/:id` now resolves the reported entity (track, album, playlist,
  artist, podcast, episode, or user) to a linkable subject with its title, deletion state, and —
  for an episode — its parent podcast id. `subject` is always present in the response and
  `nullable` rather than optional. The list endpoint gains an `entityType` filter. `GET
  /admin/audit` gains an `entityId` filter.
- Fixed a blind spot in the operator dashboard's stuck-track count: a track a worker never
  dequeued has `processingStartedAt: null` forever, so it never crossed the stuck threshold. The
  count now falls back to `updatedAt` when `processingStartedAt` is null.
- Track delete/restore now return the same operator row shape (`AdminTrackEntity`, with the
  artist's username resolved) their Swagger contract promises, instead of the raw Prisma row —
  which leaked internal columns such as `audioUrl`, `lyrics`, and `isrc`.
- The operator panel adds listener detail (`/users/:id`) and artist detail (`/artists/:id`)
  pages: activity counts, a link to the account's filtered audit history, and — gated by the
  matching permission and hidden when not applicable — deactivate, restore, and revoke-sessions
  actions, each behind an inline confirm step with an optional reason (trimmed, up to 500
  characters; an empty reason is never sent). Artist detail also hides/disables verification
  once the account is deactivated, since the API now refuses that write with a 409. Both list
  screens gain an Active/Deactivated/All status filter (defaulting to Active and omitted from a
  clean URL) and now link each row's name to its detail page; the dashboard's "Deactivated
  listeners"/"Deactivated artists" tiles link to the matching filtered list.
- The operator panel adds track detail (`/catalog/:id`) and moderation report detail
  (`/moderation/:id`) pages, following the same pattern. Track detail shows processing state
  (with the stuck badge), attempts/started/finished, the last recorded error, stored renditions
  (format/bitrate/codec/size), artist credits, genres, albums, and open report count, plus
  gated Reprocess / Take down / Restore actions (reprocess is hidden once a track is taken
  down) and a "Processing history" placeholder section a follow-up change fills in. Report
  detail shows the reporter, details, and status, with the resolved subject linked to its own
  panel page when one exists (track, artist, user) or rendered as plain text otherwise (album,
  playlist, podcast, episode — an episode also shows its parent podcast id), a "Subject no
  longer exists" message for a null subject, and other reports on the same subject, each
  linking to its own detail page. The catalog list gains an Active/Taken down/All filter
  (separate from the existing processing-status filter) and now links each row's title to its
  detail page and shows a "taken down" badge; the moderation queue gains an entity-type filter
  and now links each row to its detail page. The dashboard's "Stuck tracks" tile stays
  unlinked — the catalog has no filter for it yet. `isTrackStuck` now matches the API's own
  rule exactly: it falls back to `updatedAt` when a track never recorded a `processingStartedAt`,
  instead of reading such a track as fresh forever.
- The service-level audit row a take-down/restore/revoke-sessions mutation writes now carries the
  same `requestId` (in `metadata.requestId`) and `ipAddress` as the generic row `AuditInterceptor`
  writes for the same request, so the two can be joined. A new `@AuditContext()` param decorator
  reads both off the request the same way the interceptor does. `before`/`after` snapshots now
  serialise `Date` fields with `.toISOString()` instead of relying on Prisma's `JSON.stringify` at
  write time, and `writeTakeDownAudit`'s `metadata` is built as a properly typed
  `Prisma.InputJsonObject` with no `as` cast.
