# @bitrate/contracts

## 1.3.0

### Minor Changes

- 7eeb53a: Error responses gain an additive `code` field: the dictionary key the message was translated from (for example `errors.track.not_found`). A message that is still an untranslated English literal has no `code`. A validation failure answers `code: errors.validation.failed` plus an `errors` array of `{ path, code?, message }`, with each zod issue translated in the request locale (`validation.too_small.string`, `validation.invalid_format.email`, `validation.required`, …); a hand-written DTO message is kept as written and has no per-field `code`. The API now translates into en, uk, ru, pl and de (ru, pl and de are unreviewed machine-written text), falling back to en. Transactional emails keep en/uk: the mail locale comes from the account's stored locale, and any other value falls back to en. New `TranslatableException` base for keyed errors; a Jest scan (TypeScript AST) now fails when a file gains a literal exception message, `super()` message or DTO message beyond its count in the per-file baseline `apps/api/test/i18n-literal-baseline.json`, and also asks to lower the baseline when a file improves, so the baseline can only shrink.
- 97b1b5e: Add the artist Analytics page for Bitrate-owned listening signals. For the last 7, 28 or
  90 UTC days it shows plays and distinct listeners with the change against the previous
  period in words, plays per day as a single-series bar chart with hover values and a table
  view, and the top tracks. An artist without published tracks, or whose tracks nobody has
  played yet, sees a clear No data yet state instead of a chart of zeroes, and Spotify,
  Apple Music and YouTube Music read Not connected rather than zero. Analytics is now a real
  section in the workspace navigation and the dashboard links to it.
- 5da2f64: Add the protected artist dashboard with responsive navigation, verified server sessions,
  safe return-to-login redirects, two-factor sign-in and recoverable auth errors. Prepare the
  release workspace schema with contributors, recording/composition splits, UPC and territories;
  share pending two-factor cookies across the configured API/portal domain.

  Complete the artist email-verification flow: explain the verification requirement after
  registration and at login, handle confirmation links and allow resending expired links.
  Add six-digit artist verification codes with a ten-minute lifetime, atomic attempt limits
  and resend cooldowns. Match verification and two-factor forms to the existing auth style
  and report unavailable or local mail delivery without claiming an email was sent.

  Add artist-owned release draft creation and paginated workspace listing with validated
  inputs, session-derived ownership, soft-deletion filtering and private no-store responses.

  Connect Create release and Music to the release API: validate the title/type form, prevent
  duplicate submissions while saving, show confirmed drafts and paginated summaries, and
  handle loading, empty, malformed-response and retry states. Scope release query caches
  to the signed-in artist and keep one responsive layout across Light, Dark and Dim.

  Add the private database-backed Music catalogue: tracks/releases tabs, combined search
  and filters, stable sorting, pagination, read-only details and optional audio previews.
  Use the design's original cover/background assets and one layout across all three
  themes. Add owner-constrained preparation recordings and an opt-in idempotent demo
  seed without inserting public tracks or implementing publication and upload transitions.

  Add title/type editing for owned release drafts with a latest-summary read and an
  atomic owner/status/version-guarded PATCH. Keep entered values on failed or conflicting
  saves, validate responses before confirming success, refresh artist-scoped catalogue
  caches and reuse accessible responsive fields across create/edit dialogs.

  Add an addressable artist-owned release workspace with active private/existing
  recording metadata, optional scheduled date and credited participants. Bound relation
  previews with genuine totals, validate private API responses and refresh the workspace
  after a draft edit. Reuse the Pencil waveform and responsive desktop/mobile geometry
  across all three themes without fabricating review history or delivery results.

  Add planned UTC date/time editing and clearing for owned DRAFT workspaces through
  the existing version-guarded PATCH. Preserve omitted metadata and entered values
  on errors, and validate the saved instant before displaying success. Saving a plan
  does not submit review or start external delivery.

  Add credited participants to owned release drafts with validated names and unique
  roles. Persist each credit and the guarded release version in one transaction;
  refresh Music/workspace after confirmed writes and preserve form entries on errors.
  Use a shared responsive three-theme dialog with pending dismissal locks.

  Allow correcting an existing participant's name and roles with a current single-credit
  read and the same transactional draft/version guard. Preserve contributor identity,
  artist links and splits; repair legacy credits without roles and keep entries on
  conflicts or unconfirmed saves. Share the accessible form with contributor addition.

- 5258ea0: Add the artist notification center. The bell opens notifications split into Action
  required (overdue tasks, tasks due within two days, changes requested by the reviewer,
  failed store deliveries) and Updates (submitted, approved, released, live on a store), each
  linking to its release, with relative times and unread marking; a dot on the bell shows
  unread items and Mark all as read clears them. Notifications are derived from saved tasks,
  review and delivery states, so they never disagree with them; only the last-seen time is
  stored, in its own table.
- cc05365: Add the artist Profile and Settings pages. Profile edits the public handle, country, bio
  and links with a live preview, and uploads or removes the profile photo and header image
  through the object store with content checks, instead of client-supplied URLs. Writes carry
  the profile version, so two tabs never silently overwrite each other, and a taken handle
  reports a clear conflict. Settings shows the sign-in email and its verification, turns
  two-factor sign-in on with a QR code or manual key and off with a code, sends a password
  reset link, switches appearance, and deletes the account after the handle is typed.
  Profile and Settings are now real routes in the workspace navigation, in the designed
  order, and the Music upload shortcut explains that tracks are uploaded inside a release.
- abf65f1: Artists can now see the devices signed in to their account in Settings → Security. Each session
  records its browser and last activity at sign-in and on token refresh. An artist can sign out one
  other device or every device except the current one; the current session still ends through
  sign-out.
- 9024023: Add friends via requests: send, accept, decline and cancel friend requests, list friends with their presence (online, away, offline and what they are playing when they share it), remove friends, and notify on new and accepted requests.
- 7836a87: The web player no longer shows invented content or controls that do nothing. Search suggestions, browse categories, genre charts, popular artists, an artist's top tracks and "Featuring" playlists come from the API; "This Is" / "Radio" cards, the Download / Invite / Mix buttons, the video settings, volume normalization and the equalizer were removed. Playlist and album likes, Liked Songs counts and the Library Albums tab read the server, so they follow the account to a new browser. The header gained a friend-activity panel, notifications that open the follower or artist, an install button driven by the browser's own prompt, and Bitrate Connect: this browser registers as a device, saves its queue and position, and an empty player continues the saved queue after sign-in (playback is not handed off). Privacy toggles, language and streaming quality are saved to the account, and the Low/Normal qualities cap the stream at 128/192 kbps. Footers link only the published legal documents. The contracts package gained the new endpoints.
- acf3455: Artists can switch notification categories (tasks and deadlines, Bitrate review, delivery and
  release) off for the in-app notification center from Settings → Notifications. Switched-off
  categories are no longer queried or shown there; the dashboard still lists anything that needs
  action. Email and push are shown as not sent yet instead of offering settings that do nothing.
- 57ce6cb: Add the delivery plan and Distribution page, and the returning-artist dashboard. Artists
  plan which stores (Spotify, Apple Music, YouTube Music, Amazon Music, Deezer, TIDAL) and
  which territories a draft release goes to; saving a plan sends nothing. Each store reports
  an honest state: Not connected while no distribution partner is connected, and Pending,
  Live, Failed or Taken down only once a partner reports it. Behind this is one distribution
  adapter interface with a not-connected default and the documented delivery state machine,
  ready for a confirmed partner. The dashboard now shows, once a release exists, the current
  release with its remaining steps, items needing attention, next tasks, catalogue counts,
  upcoming planned dates and an analytics placeholder that never shows invented numbers.
- eb49605: Add artwork and master audio uploads to owned release drafts. Artists upload, replace and
  remove the cover (JPEG, PNG or WebP up to 20 MB, checked against its content) and add
  recordings from a WAV, FLAC, MP3 or OGG master up to 512 MB, which is stored privately in
  the object store and played back only by its owner. Recordings can be renamed, have their
  master replaced or be removed, which also deletes the stored file and frees the ISRC.
  Adding, replacing or removing audio clears the accuracy confirmation. Submission now also
  requires artwork and uploaded audio for every draft recording. Nothing is published or
  delivered by these uploads.
- ad7fb4c: Bitrate operators can now review artist release submissions. A new release review queue in the
  operator panel lists submissions oldest first. Each submission opens on its recordings with
  playable masters, its rights, credits and shares, its delivery plan and its earlier decisions.
  Operators holding `releases:review` approve a release or request changes, giving required changes
  and optional recommendations; a decision only applies to the version the operator read and is
  written to the audit log. Artists see the latest decision in their release workspace and can
  reopen a release sent back for changes, then submit it again.
- adef79e: Add rights confirmation, splits, identifiers and submission to owned release drafts.
  Artists record the master owner and confirm that every writer is credited and the
  information is accurate; changing credits clears both confirmations and changing splits
  clears accuracy. Recording and composition splits may stay partial in a draft but never
  exceed 100%. An optional UPC (with check digit) and per-recording ISRC are validated and
  kept unique. The workspace reports submission blockers and non-blocking notices, and a
  ready draft can be submitted for Bitrate review (re-checked in the same transaction) or
  withdrawn back to its draft. Submission never starts external delivery.

  The release workspace shows rights and identifiers, Master/Publishing splits with a live
  total, per-recording ISRC and a readiness checklist with blockers and notes. Artists edit
  rights, splits, UPC and ISRC in dialogs that keep entries on errors, confirm the review,
  submit for Bitrate review and withdraw the request.

- a172a4a: Add preparation tasks to releases. Artists add tasks with notes, a due date and an
  assignee chosen from the participants credited on the release, move them between To do,
  In progress and Done, edit and delete them. Tasks are planning notes: they stay editable
  after submission and never change the release version or its confirmations, and each task
  carries its own version so concurrent edits are rejected instead of overwritten. The
  release workspace has a Tasks panel, and the dashboard's Tasks page lists every task
  across the artist's releases with status filters, counts and overdue deadlines.
- 45b94a0: Recordings on a release now have a running order. Existing recordings keep their upload order,
  new uploads go last, and artists move recordings up or down in the release workspace. The new
  order must name every recording on the draft once, so a recording added or removed meanwhile
  fails the write instead of being placed silently. The operator review page lists recordings in
  the same order.
- 0e9e5f8: Track lists show the album each track belongs to, linked to the album page, instead of "Unknown Album". The API gained `GET /albums/by-tracks?trackIds=…`, which answers the earliest live album of up to 100 tracks per call (null for singles). The player now uses the design system's type: Unbounded for headings and lyrics, Inter for text.
- b394751: Make the workspace search global. Besides the workspace sections, now including Profile
  and Settings, it finds the artist's releases, tracks and tasks by title as you type and
  opens the matching release workspace, or the Music tracks view for a track outside a
  release. The API answers at most five results per group and never returns deleted items.

## 1.2.0

### Minor Changes

- 5b1870d: **Breaking (released as minor while the product is on 0.x):** clients that register users or artists, or upload tracks and albums, must now send the acceptance fields and `rightsConfirmed: true`.

  Registration now requires accepting the legal documents. The API rejects user and artist registration (and the creation of new accounts through Google or Facebook sign-in) unless the Terms of Use, Community Guidelines and Privacy Policy, and for artists the Artist Agreement, are accepted, and it stores the accepted revision and time on the account. The web player and artist apps show the matching required checkboxes and a notice next to the social sign-in buttons, and publish the draft legal documents under /legal/<document>; ui-react gains a Checkbox component.

  Uploading a track or creating an album now requires `rightsConfirmed: true` and stores the Artist Agreement revision and time on the track or album; replacing a track's audio requires it too. `GET /auth/me` reports `legalAcceptanceRequired`, and `POST /auth/legal/accept` records the current revision, which the web player's blocking dialog uses for accounts that never accepted or accepted an older revision. The legal pages now include a Complaints and reports page, and the registration checkboxes link the Terms of Use, Community Guidelines and Privacy Policy in a new tab.

### Patch Changes

- 6b10244: Store and serve images and seeds through `STORAGE_SERVICE`; the local storage directory is gone (breaking for deployments: the `api_storage` volume is removed from the production compose file, so copy any existing objects into the bucket before deploying, see the deployment runbook). Track covers and user avatars are validated in memory and uploaded to SeaweedFS under `tracks/covers/<uuid>.<ext>` and `users/avatars/<uuid>.<ext>`, with no image ever written to local disk. `ServeStaticModule` is replaced by a route at the same `/static/<folder>/<file>` URL that streams only public image keys from the object store with `Cache-Control: public, max-age=31536000, immutable` and Range support; stored values and client URLs do not change. The seeds download covers into memory and audio into the private upload directory, then upload through `TrackUploadService`. `apps/api/storage`, `storage.config.ts`, the `/app/storage` image directory, the `prod:storage:*` tasks and the `backup.sh` storage archive are removed (`--no-storage` is still accepted and ignored). `@bitrate/contracts` only reflects a corrected description of where track covers live.

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
