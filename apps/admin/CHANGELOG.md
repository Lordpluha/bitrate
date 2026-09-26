# @bitrate/admin

## 0.1.1

### Patch Changes

- 8da2953: Fixed production deploys failing at `task prod:deploy` with `CLOUDFLARE_TUNNEL_TOKEN is missing
a value`. The `cloudflared` service in `infra/docker-compose.prod.yaml` has no profile gate, so
  it is always part of the stack, but `deploy_reusable.yml`'s preflight and `.env`-rendering steps
  never knew the name — even with the secret already set on the `production` environment, it was
  never read or written into the rendered `.env`. Added `CLOUDFLARE_TUNNEL_TOKEN` to the required
  variable list, both steps' `env:` mappings, and the render body.

## 0.1.0

### Minor Changes

- 9e19ecd: Added the operator panel's half of three insights features backed by the already-verified API
  endpoints: the overview dashboard replaced its recent-operator-actions list with hand-written
  SVG charts (new accounts, listens, uploads by outcome, and reports filed plus their current
  status breakdown) over a 7/30/90-day range control kept in the URL, each chart backed by an
  accessible visually-hidden data table; the listener detail page gained a paginated listening
  history section; and the artist detail page gained paginated tracks and albums sections. The
  charts were then reworked to fix user-reported gaps: real x/y axes with nicely-rounded ticks
  and thinned date labels, an honest fixed-aspect layout instead of a distorting
  `preserveAspectRatio="none"`, a keyboard-accessible hover tooltip with exact values (and the
  stacked total), and a one-line description of what each chart counts, its UTC window, and its
  unit — plus a deliberate grid grouping the two reports charts together instead of leaving one
  chart alone in the row. Fixed two more reported defects: axis-label text now stays a constant
  size across every chart instead of scaling with each card's column width, chart cards in the
  same row now share a uniform height, and a hover tooltip near a card's edge can no longer widen
  the page and trigger an extra horizontal scrollbar. The standalone grid of nine raw number
  tiles above the charts was removed: each count that duplicated a chart (signups, uploads) now
  shows as a range-following headline total in that chart's own header, and every current-state
  count with no time series (the track pipeline's failed/processing/stuck, moderation's
  open/reviewing, and deactivated listener/artist counts) moved into a compact, still-linked
  status strip inside the chart card it belongs to.
- 43c90ca: Added `GET /admin/overview`, an aggregate operator landing summary behind a new `overview:read` permission: open/reviewing report counts, track pipeline counts by processing status with a stuck-upload count and its threshold, deactivated user/artist counts, signups and uploads in the trailing 7 days, and the 10 most recent audit log rows with the actor resolved. Signups and uploads are historical activity counts — a row counts if it was created inside the window, whether or not it was soft-deleted afterward — same rule for users, artists, and tracks. `overview:read` is add-only in the permission catalogue and not part of the built-in MODERATOR template — administrators reach it by identity, everyone else only once granted. The regenerated contract carries the new `AdminOverviewEntity` response shape and the `overview:read` permission literal.

  The operator panel's root route (`/`) is now this dashboard itself, gated by `overview:read`, replacing the old unconditional redirect to `/moderation` — sign-in now lands on `/` too, not a fixed screen. Every tile links to the matching filtered list where one already exists and the signed-in operator holds that list's own read permission (`/moderation`, `/catalog?status=FAILED`, and so on — the open-reports link omits `status=OPEN` since that is the moderation queue's own default); a tile whose target the operator can't reach renders as a plain count instead. Stuck tracks and deactivated accounts also render as plain counts for now, since the catalog has no "stuck" status filter and the users/artists lists have no deactivated filter yet. A new "Overview" link sits at the top of the sidebar with no section caption of its own, and an operator without `overview:read` who lands on `/` is sent to the first screen their permissions actually reach, same as any other denied route.

- f3fd92d: The operator panel now reads the regenerated `StaffEntity` contract (`roleId`, free-text `role`, and a `permissions` array) instead of the old `'ADMIN' | 'MODERATOR'` role union, and hides navigation and mutating controls the signed-in operator's permissions do not cover. Routes are gated per screen (`reports:read`, `tracks:read`, `artists:read`, `users:read`, `audit:read`); an operator denied one screen is redirected to the first they can reach, or to a new no-access page if none. Hiding is cosmetic — the API remains the sole enforcement point.
- f0762ce: Added the roles screens to the operator panel: a list of role templates with holder/divergence
  counts and the permission catalogue, and a create/edit screen with a shared permission grid.
  Built-in roles are read-only (`ADMIN`) or rename-locked (`MODERATOR`), a custom role cannot be
  deleted while operators still hold it, and API refusals (duplicate name, built-in edit, a role
  still in use) surface as specific messages instead of a generic failure.
- 0a6ea12: Rebuilt the operator panel's navigation. The rail is resizable by dragging its edge, remembers its width per browser, and collapses to a 64px icon column — by button, by dragging below a threshold, or by arrow keys on the handle, which carries a `separator` role so assistive tech announces it as resizable rather than as decoration. Destinations now carry Lucide icons and sit under section captions rather than in one flat list, and the Bitrate mark heads the rail, keeping its own gradient in every theme because a logo that restyles is a different logo.

  The navigation is data now, with three structural levels and a deliberate visual treatment each: a section is a caption plus space, not a rule, because rules between every group turn a short list into a ladder; a link marks its active state with both a filled surface and a leading rail, so it never depends on colour alone; and a nested group's children indent, drop their icons and gain a vertical guide, which is what stops subordinate rows reading as more equal destinations. Collapsed, a caption cannot shrink to an icon, so it is replaced by a hairline instead of being truncated.

- 1c50e0f: Added the staff screens to the operator panel. The directory lists operators with their role and a
  badge showing how each one's permissions differ from that role's template, with the page kept in
  the URL. Creating an operator starts from the chosen role's permissions and lets an administrator
  adjust them before saving. An operator's page edits their own permission set, or states that a
  built-in administrator holds every permission and cannot be edited individually; reassigning a role
  warns that it replaces the current set. Each refusal from the API — a protected permission, the last
  active administrator, an email or username already in use — is shown as a specific sentence.
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

- ff5c3ed: Added a working dark/light/dim theme switcher to the operator panel. A single button in the sidebar footer cycles through the three themes, sharing its silhouette with the collapse control beside it so it reads the same whether the rail is expanded or collapsed. The chosen theme is remembered per browser and applied as a class on `<html>`, matching the token-driven theme mechanism `@bitrate/ui-react` already ships. An inline script in `index.html` applies the stored theme before Angular's bundle loads, so the first paint never flashes the wrong one.
- 0ab550c: The admin track list and detail responses now expose `cover`, the track's stored cover image filename, so the operator panel can render the track's actual artwork instead of a placeholder. `<bitrate-player>` in the track detail page now shows the track's real cover art, joined from the stored filename to the API's static URL, instead of its built-in placeholder.
- 43c90ca: Added `GET /admin/tracks/:id/audio` and `HEAD /admin/tracks/:id/audio`, staff-only endpoints (`tracks:read`) that stream a READY track's highest-bitrate CMAF rendition — or the one named by `?bitrate=` — for operator playback, honoring an inclusive `bytes=` Range with 200/206/416 responses. A taken-down (soft-deleted) READY track stays playable so an operator can review it before deciding whether to restore it; a track that is missing, not READY, or has no CMAF rendition at the requested bitrate returns 404. The `HEAD` route returns the same headers with no body and no storage round-trip, so a client can probe session/rendition availability before assigning `src`. The regenerated contract carries the new `/api/v1/admin/tracks/{id}/audio` path.

  The operator panel's track detail page now plays a READY track, taken-down ones included, with a quality selector when several CMAF renditions exist. Playback never starts on its own, probes the session before assigning a source so an expired access token is refreshed first, and stops when the operator leaves the page.

- 6544783: Restructured the operator panel into four clean-architecture layers — `domain`, `application`,
  `infrastructure` and `presentation` — with repository ports as the seam between them. Business
  rules that used to live in components (how long a track may sit in processing, whether an account
  can still be deactivated) are now tested domain functions, and the API's vocabulary stops at a
  mapper instead of reaching templates. Resolving a report that already holds the target status no
  longer issues a request, so it no longer writes an audit entry saying nothing changed.
- cdd630f: Filters and the current page of every operator list now live in the URL, so a pasted or
  bookmarked link reproduces the exact view and browser history behaves. The address bar is the
  single source of truth: a screen action writes to it and an effect reads back, so nothing in the
  load path can navigate and re-trigger itself. Defaults are omitted from the query string, a
  discrete change adds a history entry while typing in a search box replaces one, and the
  moderation queue keeps its OPEN default with an explicit token for showing everything.

  Two defects in the shared list state were fixed on the way. A slower response could overwrite a
  newer one, which was harmless while only a button could start a load and is not once the URL can;
  and a deep link past the first page was silently dropped, because the page guard compared against
  a page count that is still 1 before anything has loaded.

- 7be8504: Added sortable column headers to every paginated operator list (artists, catalog, audit,
  moderation, listeners, staff). Clicking a column cycles unsorted → ascending → descending →
  unsorted, the sort is kept in the URL so it survives reload, refresh and back/forward, and
  choosing a column always resets to page one. The catalog screen keeps saying plainly when it
  is showing its attention-first default instead of a column sort, and clearing the sort
  restores that default order.
- 6a48275: Gave operators an interface again, for the first time since the Kottster panel was deleted. The API grew a `Staff` identity kept deliberately separate from `User` — `ADMIN`/`MODERATOR` roles, its own session model, no self-registration and no OAuth — behind `POST /api/v1/admin/auth/login`, `/refresh`, `/logout` and `GET /me`, guarded by a new `@AdminAuth(...roles)` decorator. `AuditLog` finally has a writer: the existing global audit interceptor now recognises a staff actor, so every operator mutation records who did what and from where instead of filing it as anonymous.

  Four operator surfaces sit behind that: the moderation queue, which finally reads the `ModerationReport` rows the API had been collecting with nothing to read them; artist management with verification and soft delete; listener management; the catalog pipeline, listing tracks by processing state with failures and longest-stuck uploads first, and a reprocess action that reuses the existing audio-processing queue rather than adding a second one; and a read-only audit log with each row's actor resolved to a username server-side. Every mutation requires `ADMIN`; reads are open to `MODERATOR` as well. No response includes a password or two-factor secret, and lists exclude soft-deleted rows by default.

  The panel itself is `apps/admin`, an Angular 22 zoneless SPA on spartan-ng, served at `admin.<domain>` behind `X-Frame-Options: DENY`. It goes through the API rather than around it, which was the condition ADR-0025 set for any replacement. Its data layer diverges from the other frontends on purpose and at some cost — `HttpClient` instead of `openapi-fetch`, no query cache at all, and request and response shapes written by hand as zod schemas because the generated contract could not describe endpoints that did not exist when the app was started.

  One thing worth knowing before the next migration: `prisma migrate dev` wanted to drop the four GIN trigram indexes that back search, because `schema.prisma` has no syntax for them and Prisma therefore reads them as drift. They were removed from the generated SQL by hand and the whole chain was replayed against an empty database to prove the indexes survive. Every future generated migration will want to drop them again — see `.claude/rules/api-rules.md`.

- 9a41ed1: Added English/Ukrainian interface language support to the operator panel: a Transloco-driven
  locale switcher in the sidebar, localized date formatting that reacts to the chosen language
  without a reload, and translated login/navigation text. A CI check now fails the build if a
  referenced translation key is missing from either language file.
- e9d556d: `@bitrate/player` now ships a real playback engine and `<bitrate-player>` UI — a shadow-DOM custom element with play/pause, seek, volume, mute, and a quality selector, driven by a framework-free engine that resolves a source lazily and never autoplays. The operator panel's track detail page replaces its native `<audio>` element with `<bitrate-player>`, resolving each play request through a `HEAD` probe so an expired session is refreshed before the audio source is assigned.

  The element's chrome now matches `apps/web-player`'s bottom player bar — cover art, title/artist, token-styled transport and volume rails — and adapts to a compact layout at a narrow shadow-root width; optional transport controls (previous, next, shuffle, repeat, like, queue, picture-in-picture, expand) render only once a host supplies the matching callback property, so the operator panel keeps exactly today's play/seek/volume/quality surface.

  Fixed: the compact layout no longer hides the quality selector or the volume control below the `36rem` container breakpoint — both stayed reachable only via hover, which made them unusable on a narrow/touch viewport. They now wrap onto their own row instead; only the total-duration readout shrinks away, keeping the elapsed time visible.

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

- 0e234c2: Bound the operator panel's zod schemas to the generated API contract, which immediately found a broken page. The catalog required `artistName` while the API has always sent `artistUsername`, so every list load threw inside `parse` and the artist column rendered its em-dash fallback; the audit log had already lost `actorName` versus `actorUsername` the same way, found by hand. Each schema now declares the slice of the entity it reads as a `Pick` of the contract type and asserts it with `satisfies`, so a renamed or retyped field is a compile error rather than a runtime failure in front of an operator, while zod stays the runtime guard and `z.infer` stays the source of the exported types. Status lists needed more than `satisfies`, which accepts a narrower union than the contract declares — a status the API grows later would have type-checked cleanly and then thrown on parse — so they are built through `contractEnum`/`coveringTuple`, which force the list to cover the union, in components as well as schemas. `@bitrate/contracts` joins the app as a devDependency, since it contributes types only.
- 0ab550c: Every API response that returns a body now declares a real, type-checked schema instead of a hand-written `$ref` string or no schema at all, so the generated OpenAPI contract no longer carries dangling references or untyped response bodies — new entities were added for the playlist detail, search, history, follow/unfollow, and 2FA-required-at-login shapes, and the artist "get current authenticated artist" endpoint was corrected to type its response as the artist entity it actually returns instead of the wrong user entity. The three modules that each declared their own `LoginDto` — admin, artist, and user auth — were renamed to `AdminLoginDto`, `ArtistLoginDto`, and `UserLoginDto`, clearing the "Duplicate DTO detected" warning Nest logged at startup and fixing two of the three login endpoints, which had been documented in the generated contract with the wrong request body shape. The admin panel's staff sign-in request DTO now binds to the renamed `AdminLoginDto` contract key. The 2FA-enrollment response (QR code and manual secret) is now a named `UserTwoFactorSetupEntity`/`ArtistTwoFactorSetupEntity` instead of an inline anonymous schema, and the admin audio stream/probe endpoints now declare their binary `audio/mp4` body and `Accept-Ranges`/`Content-Range` headers explicitly instead of relying on a bare `ApiProduces` with no schema.
- a81d71c: Fixed line-chart tooltip/cursor position drifting from the actual data point, worse toward the edges.
- 85111a0: Fixed line-chart cursor/tooltip misalignment (points now share a hover region with the point they represent, by construction) and dead space in shorter overview chart cards.
- 69bb943: Restricted API sort keys to supported fields, restored admin builds with their workspace dependencies, and refreshed the generated contract to match the API.
- f769029: Restored workspace dependency links in admin Docker builds and included the shared UI build in development web images so they run from a clean checkout.
- d3ce2f7: Moved the operator panel's configuration out of the source tree and into `.env` files. The API
  base URL no longer sits hardcoded in three `define` blocks in `angular.json`, in a fallback inside
  `api.config.ts`, and in a Dockerfile `ARG` default, and the dev-server port no longer sits in both
  `angular.json` and the package scripts. A small bridge script reads the `.env` chain — Angular has
  no `.env` support of its own — validates it, and writes the module the application imports, so a
  missing variable now fails the command that needs it by name instead of quietly producing a bundle
  pointed at localhost.
- 3a90d2e: Fixed sign-in reporting failure for correct operator credentials. `POST /admin/auth/login`
  answers 201 with no body — it only sets the two httpOnly cookies, exactly as its Swagger
  documents — but the panel parsed that empty response against the staff schema, so Zod threw and
  the login screen showed "Sign-in failed. Check the address and password, then try again." while
  the session cookies had in fact been set; reloading the page let you straight in. The signed-in
  operator is now read back from `/admin/auth/me` on the session the cookies just established, and
  the repository has specs covering the empty body, refused credentials, and a session that cannot
  be read back.
- 3a90d2e: Removed the development-only authentication bypass from the operator panel. The
  `NG_APP_AUTH_BYPASS` build-time define, the placeholder operator it injected into the session
  store, and the interceptor branch that suppressed the redirect on a failed refresh are all gone,
  so `ng serve` now goes through the real login screen and a failed token refresh always returns to
  it. Production bundles are unchanged — the flag was already hardcoded false there.
- bbfa177: Theme switcher labels are now translated (EN/UK) instead of hardcoded English.
- Updated dependencies [e9d556d]
  - @bitrate/player@1.1.0
