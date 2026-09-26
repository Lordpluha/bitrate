# @bitrate/contracts

## 1.1.0

### Minor Changes

- 0ab550c: Added three operator-panel API surfaces: a zero-filled daily time-series endpoint
  (`GET /admin/overview/series`) covering uploads/processing outcome, signups, listens, and
  moderation reports over a configurable trailing window; a paginated listening-history
  endpoint for a user (`GET /admin/users/:id/listening-history`); and paginated tracks/albums
  endpoints for an artist's publications (`GET /admin/artists/:id/tracks`,
  `GET /admin/artists/:id/albums`). Playlists are user-owned in this schema, not artist-owned,
  so no artist-scoped playlist endpoint was added. Also adds a `ListeningHistory.listenedAt`
  index backing the new daily listens aggregation.
- 43c90ca: Added `GET /admin/overview`, an aggregate operator landing summary behind a new `overview:read` permission: open/reviewing report counts, track pipeline counts by processing status with a stuck-upload count and its threshold, deactivated user/artist counts, signups and uploads in the trailing 7 days, and the 10 most recent audit log rows with the actor resolved. Signups and uploads are historical activity counts — a row counts if it was created inside the window, whether or not it was soft-deleted afterward — same rule for users, artists, and tracks. `overview:read` is add-only in the permission catalogue and not part of the built-in MODERATOR template — administrators reach it by identity, everyone else only once granted. The regenerated contract carries the new `AdminOverviewEntity` response shape and the `overview:read` permission literal.

  The operator panel's root route (`/`) is now this dashboard itself, gated by `overview:read`, replacing the old unconditional redirect to `/moderation` — sign-in now lands on `/` too, not a fixed screen. Every tile links to the matching filtered list where one already exists and the signed-in operator holds that list's own read permission (`/moderation`, `/catalog?status=FAILED`, and so on — the open-reports link omits `status=OPEN` since that is the moderation queue's own default); a tile whose target the operator can't reach renders as a plain count instead. Stuck tracks and deactivated accounts also render as plain counts for now, since the catalog has no "stuck" status filter and the users/artists lists have no deactivated filter yet. A new "Overview" link sits at the top of the sidebar with no section caption of its own, and an operator without `overview:read` who lands on `/` is sent to the first screen their permissions actually reach, same as any other denied route.

- f3fd92d: The operator panel now reads the regenerated `StaffEntity` contract (`roleId`, free-text `role`, and a `permissions` array) instead of the old `'ADMIN' | 'MODERATOR'` role union, and hides navigation and mutating controls the signed-in operator's permissions do not cover. Routes are gated per screen (`reports:read`, `tracks:read`, `artists:read`, `users:read`, `audit:read`); an operator denied one screen is redirected to the first they can reach, or to a new no-access page if none. Hiding is cosmetic — the API remains the sole enforcement point.
- 43c90ca: Extended the operator surface's tracks, users, artists, moderation, and audit endpoints with the
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

- 0ab550c: The admin track list and detail responses now expose `cover`, the track's stored cover image filename, so the operator panel can render the track's actual artwork instead of a placeholder. `<bitrate-player>` in the track detail page now shows the track's real cover art, joined from the stored filename to the API's static URL, instead of its built-in placeholder.
- 43c90ca: Added `GET /admin/tracks/:id/audio` and `HEAD /admin/tracks/:id/audio`, staff-only endpoints (`tracks:read`) that stream a READY track's highest-bitrate CMAF rendition — or the one named by `?bitrate=` — for operator playback, honoring an inclusive `bytes=` Range with 200/206/416 responses. A taken-down (soft-deleted) READY track stays playable so an operator can review it before deciding whether to restore it; a track that is missing, not READY, or has no CMAF rendition at the requested bitrate returns 404. The `HEAD` route returns the same headers with no body and no storage round-trip, so a client can probe session/rendition availability before assigning `src`. The regenerated contract carries the new `/api/v1/admin/tracks/{id}/audio` path.

  The operator panel's track detail page now plays a READY track, taken-down ones included, with a quality selector when several CMAF renditions exist. Playback never starts on its own, probes the session before assigning a source so an expired access token is refreshed first, and stops when the operator leaves the page.

- 0ab550c: Every API response that returns a body now declares a real, type-checked schema instead of a hand-written `$ref` string or no schema at all, so the generated OpenAPI contract no longer carries dangling references or untyped response bodies — new entities were added for the playlist detail, search, history, follow/unfollow, and 2FA-required-at-login shapes, and the artist "get current authenticated artist" endpoint was corrected to type its response as the artist entity it actually returns instead of the wrong user entity. The three modules that each declared their own `LoginDto` — admin, artist, and user auth — were renamed to `AdminLoginDto`, `ArtistLoginDto`, and `UserLoginDto`, clearing the "Duplicate DTO detected" warning Nest logged at startup and fixing two of the three login endpoints, which had been documented in the generated contract with the wrong request body shape. The admin panel's staff sign-in request DTO now binds to the renamed `AdminLoginDto` contract key. The 2FA-enrollment response (QR code and manual secret) is now a named `UserTwoFactorSetupEntity`/`ArtistTwoFactorSetupEntity` instead of an inline anonymous schema, and the admin audio stream/probe endpoints now declare their binary `audio/mp4` body and `Accept-Ranges`/`Content-Range` headers explicitly instead of relying on a bare `ApiProduces` with no schema.
- 43c90ca: Added a durable per-attempt processing log for the audio pipeline
  (`TrackProcessingAttempt`, one row per BullMQ attempt — successes compact, failures carrying
  the redacted step/error detail) and the operator endpoint that reads it:
  `GET /admin/tracks/:id/processing-attempts` (`tracks:read`, newest first, paginated,
  404 for an unknown id, reachable for a soft-deleted track). `@bitrate/converter`'s FFmpeg
  calls now run through a bounded stderr ring buffer and throw a typed `FfmpegError` carrying
  `exitCode`/`signal`/`timedOut`/`stderrTail`, which the API classifies and redacts before
  persisting. The operator panel's track detail page (`/catalog/:id`) now has a "Processing
  history" section reading that endpoint — a table of attempts with their trigger, outcome
  badge, failed step, duration, error code/message, `willRetry`/`retryable` wording, and worker
  host, with a keyboard-operable diagnostics disclosure (command line, stderr tail, stack, and
  a clipboard "Copy diagnostics" action) on any attempt that has detail to show. A track stuck
  processing or with a failed row on the catalog list, and its own detail page, now link to
  this section directly. The failed/stuck take-down and restore conflict messages on the track
  detail page now say "taken down" instead of the account-oriented "deactivated" wording they
  borrowed from the users/artists screens.

### Patch Changes

- 69bb943: Restricted API sort keys to supported fields, restored admin builds with their workspace dependencies, and refreshed the generated contract to match the API.

## 1.0.0

### Major Changes

- adc2b7c: Every workspace package moved from the `@spotify/` namespace to `@bitrate/`, the first step of
  the rebranding described in `apps/docs/docs/brand/`. Imports, `--filter` targets in `Taskfile.yml`,
  `lefthook.yml`, and the CI workflows, and the agent-layer rules under `.claude/` were updated to
  match. Documentation that narrates the removed `@spotify/tokens` and `@spotify/tokens-generator`
  packages kept the original names, because those packages never existed under the new namespace.

### Patch Changes

- abe3615: `gen:api` now formats what it writes. `astToString` emits the TypeScript
  printer's own style — semicolons and a four-space indent — while the committed
  `src/api/v1.ts` is Biome-formatted, so regenerating always reported the whole
  file as changed and the CI reproducibility check could never pass on any branch.
  The generator runs Biome over its output, making the command idempotent, and
  `openapi-typescript` is now declared as a dependency of the package that imports
  it rather than being borrowed from another workspace via hoisting.

  The converter also exposes its CMAF and MP4 index helpers as package exports,
  and its test suite runs in CI alongside the API that consumes it.
