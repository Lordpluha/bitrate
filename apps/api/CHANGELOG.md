# @bitrate/api

## 1.1.1

### Patch Changes

- 8da2953: Fixed production deploys failing at `task prod:deploy` with `CLOUDFLARE_TUNNEL_TOKEN is missing
a value`. The `cloudflared` service in `infra/docker-compose.prod.yaml` has no profile gate, so
  it is always part of the stack, but `deploy_reusable.yml`'s preflight and `.env`-rendering steps
  never knew the name — even with the secret already set on the `production` environment, it was
  never read or written into the rendered `.env`. Added `CLOUDFLARE_TUNNEL_TOKEN` to the required
  variable list, both steps' `env:` mappings, and the render body.

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

- 011e415: Added English/Ukrainian internationalisation to the API: error and validation responses are
  now translated by the global exception filter based on `Accept-Language` (falling back to
  English for an unsupported language), and transactional password-reset/email-verification
  mail renders in the recipient's own stored `locale` rather than the request that triggered
  it. `User` and `Artist` gained a `locale` column (default `en`), set at registration from
  `Accept-Language`. A CI check now fails the build on any drift between the `en`/`uk`
  dictionaries, or a translation key referenced in source but defined in neither.
- 0ab550c: Every API response that returns a body now declares a real, type-checked schema instead of a hand-written `$ref` string or no schema at all, so the generated OpenAPI contract no longer carries dangling references or untyped response bodies — new entities were added for the playlist detail, search, history, follow/unfollow, and 2FA-required-at-login shapes, and the artist "get current authenticated artist" endpoint was corrected to type its response as the artist entity it actually returns instead of the wrong user entity. The three modules that each declared their own `LoginDto` — admin, artist, and user auth — were renamed to `AdminLoginDto`, `ArtistLoginDto`, and `UserLoginDto`, clearing the "Duplicate DTO detected" warning Nest logged at startup and fixing two of the three login endpoints, which had been documented in the generated contract with the wrong request body shape. The admin panel's staff sign-in request DTO now binds to the renamed `AdminLoginDto` contract key. The 2FA-enrollment response (QR code and manual secret) is now a named `UserTwoFactorSetupEntity`/`ArtistTwoFactorSetupEntity` instead of an inline anonymous schema, and the admin audio stream/probe endpoints now declare their binary `audio/mp4` body and `Accept-Ranges`/`Content-Range` headers explicitly instead of relying on a bare `ApiProduces` with no schema.
- d2bfd92: Added `sort`/`order` query parameters to the six paginated operator-facing list endpoints
  (`/admin/artists`, `/admin/audit`, `/admin/moderation/reports`, `/admin/tracks`,
  `/admin/users`, `/admin/staff`), each backed by an explicit per-resource field allowlist
  that rejects any other value with a 400. Omitting `sort` keeps each endpoint's existing
  ordering unchanged, including the track pipeline's attention-first (failed/stuck-first)
  default — choosing a `sort` on that endpoint replaces it with a plain ordering instead.
- 6a48275: Gave operators an interface again, for the first time since the Kottster panel was deleted. The API grew a `Staff` identity kept deliberately separate from `User` — `ADMIN`/`MODERATOR` roles, its own session model, no self-registration and no OAuth — behind `POST /api/v1/admin/auth/login`, `/refresh`, `/logout` and `GET /me`, guarded by a new `@AdminAuth(...roles)` decorator. `AuditLog` finally has a writer: the existing global audit interceptor now recognises a staff actor, so every operator mutation records who did what and from where instead of filing it as anonymous.

  Four operator surfaces sit behind that: the moderation queue, which finally reads the `ModerationReport` rows the API had been collecting with nothing to read them; artist management with verification and soft delete; listener management; the catalog pipeline, listing tracks by processing state with failures and longest-stuck uploads first, and a reprocess action that reuses the existing audio-processing queue rather than adding a second one; and a read-only audit log with each row's actor resolved to a username server-side. Every mutation requires `ADMIN`; reads are open to `MODERATOR` as well. No response includes a password or two-factor secret, and lists exclude soft-deleted rows by default.

  The panel itself is `apps/admin`, an Angular 22 zoneless SPA on spartan-ng, served at `admin.<domain>` behind `X-Frame-Options: DENY`. It goes through the API rather than around it, which was the condition ADR-0025 set for any replacement. Its data layer diverges from the other frontends on purpose and at some cost — `HttpClient` instead of `openapi-fetch`, no query cache at all, and request and response shapes written by hand as zod schemas because the generated contract could not describe endpoints that did not exist when the app was started.

  One thing worth knowing before the next migration: `prisma migrate dev` wanted to drop the four GIN trigram indexes that back search, because `schema.prisma` has no syntax for them and Prisma therefore reads them as drift. They were removed from the generated SQL by hand and the whole chain was replayed against an empty database to prove the indexes survive. Every future generated migration will want to drop them again — see `.claude/rules/api-rules.md`.

- efcc52c: Laid the foundation for per-operator permissions, replacing the fixed `StaffRole` enum. Authorisation now lives on `Staff.permissions`, a string array checked against a code-owned catalogue (`reports:*`, `artists:*`, `tracks:*`, `users:*`, `audit:read`, plus the protected `staff:*`/`roles:*` reserved for the built-in ADMIN role); a `Role` row is a template copied onto an operator at assignment time and kept afterwards only as provenance/display via `Staff.roleId`. The built-in ADMIN role still passes every permission check by identity, and MODERATOR keeps its existing access through a template equal to every grantable permission. Every operator route now declares `@RequirePermission(...)` in place of the old `@StaffRoles(...)`/role-array form on `@AdminAuth()`, with the guard, coverage spec, and both seed scripts updated to match. The migration backfills every existing operator's `permissions` from their prior role so no account silently loses access on deploy. Staff/role management endpoints and the admin panel UI for any of this are not part of this change.
- 4bc7da4: Added the operator-facing role-template and staff-management API: `/admin/roles` (list/get with
  per-role active-operator `holders` and `divergentHolders` counts, `/admin/roles/permissions` for
  the full permission catalogue with a `heldBy` count per permission, create/edit/delete of
  non-`ADMIN` role templates) and `/admin/staff` (list/get, create an operator, reassign its role,
  replace its own permission set, and deactivate it — deactivation also revokes every session for
  that operator in the same transaction). Assigning a role copies its current template onto the
  operator; editing a template afterwards does not reach operators already assigned it. The
  built-in `ADMIN` role can never be edited or deleted and its own `permissions` are always `[]`;
  the built-in `MODERATOR` template may be edited but not renamed. An operation that would leave
  zero active operators holding the built-in `ADMIN` role is rejected. Every permission change
  (creation, role reassignment, or a direct permission edit) writes its own detailed audit row —
  before/after/added/removed — inside the same transaction as the write, alongside the generic row
  the global audit interceptor already records for every mutating request.
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

- 43c90ca: Added `pnpm --filter @bitrate/api db:seed:admin`, an additive and idempotent fixture script that
  creates the stuck/failed tracks, moderation reports across every status and entity type,
  deactivated users/artists, an unreferenced genre, extra staff and roles, and audit history the
  admin panel's coverage work is verified against. Never clears existing data and unconditionally
  refuses to run with `NODE_ENV=production` — fixture data has no legitimate production use, so
  unlike `db:seed:staff` this refusal has no override. It also refuses to run against a
  non-local `DATABASE_URL` host (anything other than `localhost`/`127.0.0.1`/`::1` or the
  `postgres`/`postgres_test` Docker service names) unless `ADMIN_FIXTURES_ALLOW_REMOTE_DB=true` is
  set — production is refused either way, with no override.

  `db:seed`, `db:seed:staff`, and `db:seed:admin` now load `.env` then `.env.local` — the same
  first-file-wins order `apps/api`'s own `ConfigModule` uses — instead of a bare `dotenv/config`
  that only reads `.env`. `apps/api` ships no `.env` by default, only `.env.local`, so all three
  previously required `DATABASE_URL` to be inlined by hand.

- e13c38d: Collapsed the operator list endpoints' pagination onto the constants the rest of the API already uses. Each of the five `list-*.dto.ts` files restated `page` and `limit` verbatim, with the ceiling written out as a literal `100` five times, while `apps/api/src/common/pagination.ts` had owned `MAX_LIMIT` all along for the ten non-admin modules that call `normalizePagination`. That file now also exports a `paginationQuerySchema` built from those constants, which the five DTOs extend, and the five services take their defaults from `DEFAULT_PAGE`/`DEFAULT_LIMIT` instead of repeating `1` and `20`. The schema deliberately declares no `.default()`, because that would publish a default into the OpenAPI document and move the generated contract; the query parameters this produces were captured before and after the change and are byte-identical. A new spec pins the bound through a resource schema rather than the shared one, since what is worth asserting is that extending does not lose it — checked by mutation, where a local `.max(50)` override fails it.
- de2a6ff: Fixed the root welcome endpoint answering "Welcome to undefined!" in production by greeting
  with the API's own name instead of an npm-injected variable that only exists when the process
  is started through a script runner, renamed the health/metrics/debug controller's Swagger tag
  from the misleading "Welcome" to "System", and enabled the Swagger UI's tag filter plus a
  deterministic sort order so operators can navigate the growing route list.
- 43c90ca: Edits to the built-in MODERATOR role's permissions and description now survive an API restart;
  boot only creates a built-in role that is missing. The MODERATOR template is an explicit list, so a
  permission added to the catalogue no longer joins it without a deliberate change.
- e2cfd82: Added Swagger `@ApiOperation` documentation (or an explicit `@ApiExcludeEndpoint`) to every route that was missing it — 46 routes across `me`, `discovery`, `podcasts`, `app.controller`, `users-auth`, `users`, `artists-auth`, `search`, `tracks`, `moderation`, and `infra/storage` — and corrected two artist-auth summaries that were copy-pasted from the user-auth wording. Added a unit spec (`swagger-operation-coverage.unit-spec.ts`) that walks every controller on disk and fails if a route is undocumented again.
- 4cbf8a9: Uploaded audio, HLS artifacts, covers and avatars now survive a production deploy. The API writes them under its working directory, which in the production image is `/app`, and `/app/storage` was mounted nowhere — the bytes lived in the container's writable layer and were destroyed by every `docker compose up -d` that recreated the container. The two mounts the production compose file declared, `../apps/api/uploads` and `../apps/api/public`, pointed at paths nothing in the API has ever written to. The image now creates `/app/storage` so a named volume mounted over it inherits the non-root user's ownership without a chown on the host, and the production stack mounts that volume. Existing uploads are only recoverable from the running container and must be rescued with `task prod:storage:rescue` before the deploy that lands this; see ADR-0033.
- 69bb943: Restricted API sort keys to supported fields, restored admin builds with their workspace dependencies, and refreshed the generated contract to match the API.
- 704e27e: Fixed failed sign-ins returning 500 instead of 401 on all three authentication surfaces. The
  lockout bookkeeping ran a raw `UPDATE ... SET "lockedUntil" = CASE ... ELSE NULL END`, where
  neither branch carried a type, so PostgreSQL resolved the expression to `text` and refused to
  assign it to the `timestamp(3)` column (SQLSTATE 42804). Every wrong password therefore crashed
  before the account could be locked, which also meant the brute-force lockout had never actually
  engaged. The three services now do the same work with typed Prisma writes — an atomic counter
  increment followed by a conditional deadline write — and an end-to-end spec exercises the
  counter, the lockout threshold, and the deadline it stores.
- e1a9c20: The three application production images shrank by between 35% and 94%. The web player now
  builds with Next.js standalone output file tracing, so its image carries the traced server
  instead of the whole hoisted production dependency tree, and its container runs `node
server.js` directly rather than two nested pnpm wrappers. Every production stage applies
  ownership through `COPY --chown` instead of a trailing recursive `chown`, which had been
  writing a second complete copy of the application tree into its own layer. The API image no
  longer copies the seeded audio under `apps/api/storage/private`, keeping only the `public`
  subtree its static file handler actually serves. Measured locally: web player 4.44 GB to
  265 MB, API 3.88 GB to 1.9 GB, web artists 637 MB to 412 MB.
- 2747e7a: `apps/api` now logs structured JSON via `nestjs-pino` instead of plain text through the built-in NestJS logger — existing `new Logger(context)` call sites are unaffected, only the output format and the addition of automatic per-request logging (excluding the Prometheus-scraped `/metrics` route) change. No public route, response shape or auth behavior changed.
- 2747e7a: `GET /metrics` is now backed by `prom-client` instead of a hand-rolled counter — it still serves the same route with the same bearer-token gate, but now also reports process memory, CPU and event-loop lag alongside the existing per-route HTTP request count and duration, and the duration metric is a proper histogram in seconds rather than a cumulative-milliseconds counter. No client of this route is known to exist yet, so this is not expected to be a breaking change in practice.
- 80908cf: Moved the operator panel's staff guard from individual route handlers onto the controller classes, so that forgetting it produces a too-broad role rather than an unauthenticated endpoint. Three of the five admin controllers declared `@AdminAuth(...)` per method, which meant a handler added without the decorator would have answered to anyone who found the path — nothing would have caught it, since the existing integration specs stub the guard with a role check that lets a route carrying no role metadata straight through. Routes that need a narrower role now use a new `@StaffRoles('ADMIN')`, which carries the role metadata and the 403 response but not the cookie scheme: reusing `@AdminAuth` for a narrowing applies `ApiCookieAuth` a second time and makes the generated spec list the same requirement twice, while leaving the 403 to the controller class drops it, because a method-level response declaration replaces the class's for that status rather than merging with it. The published contract is unchanged — `security`, the response codes and their descriptions were all checked to be identical before and after. A new spec walks the operator controllers found on disk and fails if any route lacks both a guard and role metadata, with the public surface named explicitly as one entry: the login route.
- 260eafb: Patched `nodemailer` (quadratic-time DoS in its address parser, GHSA-2x7j-588g-ccc2) and `sharp`
  (bundled a vulnerable libheif, GHSA-rgj7-g3m4-5g8c) to their fixed versions. Both already
  satisfied the existing `^` range in `package.json`, so only the resolved lockfile version moved.
- 24ec805: Made a bootstrap failure log the error and exit with a non-zero status instead of relying on
  Node's default unhandled-rejection behaviour, as part of enabling Biome's floating/misused
  promise lint rules.
- Updated dependencies [260eafb]
- Updated dependencies [43c90ca]
  - @bitrate/converter@2.1.0

## 1.0.1

### Patch Changes

- 0ff841a: Dropped the non-standard `local` value for `NODE_ENV`. Node tooling recognises only `development`, `production`, and `test` — Next.js warns on anything else and assigns one of the three itself, and Nest never sets the variable at all, so `local` only ever appeared as a schema default that no runtime produced. Both env schemas now accept the three standard values and default to `development`; the Sentry environment fallbacks follow.
- d373ea9: Fixed logging in leaving the user on the login page. The API issued its session cookies without a `Domain`, so they were host-only on the API's subdomain and the web apps' route guards — running on a different subdomain — never saw a session: login succeeded, the redirect to the player bounced straight back to the login page. The cookies now take an optional `COOKIE_DOMAIN` (e.g. `.bitrate.me`) and are scoped to the parent domain, logout clears them with the same attributes they were written with, and they use `SameSite=Lax` so a link followed from an email or an OAuth provider still carries the session.

## 1.0.0

### Major Changes

- adc2b7c: Copy that named Spotify is gone. The artists portal no longer reproduces Spotify for Artists'
  marketing page: `© 2026 Spotify AB` is `© 2026 Bitrate`, and the branded product names it
  borrowed — Canvas, Marquee, Discovery Mode, Loud & Clear, Showcase, Clips, Segments, Fan Study,
  Fan Support — are now plain descriptions of what each capability does, so the page no longer
  claims another company's products. A testimonial that named a real recording artist as a
  Spotify for Artists user was rewritten without her, rather than re-attributed to Bitrate.

  The landing page claimed "517.69 million+ Spotify users worldwide" — a real Spotify figure that
  would have become a fabricated claim about Bitrate. It now reads "Artists and listeners, in one
  place" and asserts no number. Two footers carried `© 2025` and `© 2026 Spotify AB`; both are
  now `© 2026 Bitrate`.

  `Spotify Premium` is `Bitrate Pro`, matching the name `design.md` already uses.

  The TOTP issuer for both user and artist two-factor auth changed from `Spotify` to `Bitrate`.
  Authenticator apps key their entries on the issuer, so codes already enrolled keep working but
  show under a second entry — enrolled users should re-scan.

  Seed data no longer ships `Spotify Clone Studios` as a publisher or `Welcome to Spotify Clone`
  as a playlist title.

- adc2b7c: Infrastructure identifiers moved off the Spotify name. The Postgres databases are now
  `bitrate`, `bitrate_shadow`, `bitrate_test`, and `bitrate_test_shadow`; the Docker network is
  `bitrate-network`; every container and container-image OS user is `bitrate-*`; the mail sender
  is `no-reply@bitrate.local`; and the admin panel's Knex data source lives in
  `bitrate_postgres_local`. The Postgres role and password the performance workflows spin up in
  CI are now `bitrate` / `bitrate_password`.

  Two identifiers break existing consumers. The Prometheus metrics `spotify_api_http_requests_total`
  and `spotify_api_http_request_duration_ms_sum` are now `bitrate_api_http_*`, so dashboards and
  alerts querying the old names stop returning data. The Redis rate-limit key prefix changed from
  `spotify:throttle:` to `bitrate:throttle:`, so counters in flight at deploy time reset and every
  client starts from a clean budget once.

  The Tauri desktop app renamed its Rust crate (`spotify-desktop` to `bitrate-desktop`, library
  `bitrate_desktop_lib`), its bundle identifier (`com.lordpluha.bitrate-desktop`), and its product
  name, which is now `Bitrate` rather than a hyphenated slug — so the produced bundle filenames
  change. Its dev-only VNC password is `bitrate`.

  Existing databases are not migrated. A running environment needs its volume recreated and the
  migrations and seed re-run.

- adc2b7c: Every workspace package moved from the `@spotify/` namespace to `@bitrate/`, the first step of
  the rebranding described in `apps/docs/docs/brand/`. Imports, `--filter` targets in `Taskfile.yml`,
  `lefthook.yml`, and the CI workflows, and the agent-layer rules under `.claude/` were updated to
  match. Documentation that narrates the removed `@spotify/tokens` and `@spotify/tokens-generator`
  packages kept the original names, because those packages never existed under the new namespace.
- cfed21e: Every API request through nginx returned 404. `main.ts` calls `setGlobalPrefix('api')`, so the
  API serves at `/api/v1/...`, while the nginx `/api` location rewrote the path to strip that
  prefix before proxying. The API is reachable from the internet again.
- 2f8bd87: One host, one application. The web player answers on the apex, the artists portal on
  `artists.<domain>`, and the API on `api.<domain>`; the path routes on the main domain are gone.

  Two of those paths were already broken. `/uploads` proxied to a route the API does not have —
  its static mount is `/static` — and `/docs` pointed at a service absent from the production
  stack. `/api` worked but duplicated what the API host now serves.

  The API host routes each URL shape explicitly rather than through one catch-all: `setGlobalPrefix`
  covers the endpoints but not Swagger or the static mount, so a blanket rewrite would have turned
  `/swagger` into a 404. Endpoints are reachable both as `/api/v1/…` and `/v1/…`, so the clients can
  drop the redundant segment when convenient.

- 41b95b9: The production API could not start. `apps/api/env.schema.ts` requires `WEB_HOST`, and
  `infra/docker-compose.prod.yaml` never passed it — the container would fail Zod validation and
  exit before serving a request. Preprod passed it all along, which is why CI never caught it.

  The service's environment moved from map form to list form so optional variables can be passed
  through by bare name. `KEY=${KEY}` gives the container an empty string when the variable is
  unset, and the optional URL and token fields are validated with `z.url()` and `.min(32)`, both
  of which reject an empty string — so writing them out in map form would have replaced a missing
  variable with an invalid one. Mail, S3, Sentry, and metrics settings now reach the container
  when they are configured and stay absent when they are not.

- 8996302: Two container defects that only a real deployment could surface.

  The API image started `apps/api/dist/main.js`, which does not exist. `env.schema.ts` and
  `prisma.config.ts` live outside `src/` and the tsconfig sets no `rootDir`, so the compiler's
  common root is the app directory and the entrypoint compiles to `dist/src/main.js`. The
  package's own `start:prod` script already pointed there; only the Dockerfile did not, so the
  container crash-looped with `MODULE_NOT_FOUND`.

  The web-artists image kept web-player's `EXPOSE 3001` and health check against port 3001 in its
  production stage, while the app starts on 3002. The container ran correctly and reported
  unhealthy forever.

- fc0ff79: Migrations could not run in production. The API image did not include `prisma.config.ts`, and
  `schema.prisma` declares a datasource with no `url` — the URL comes only from that config — so
  every Prisma command failed with "The datasource.url property is required". The image now carries
  the TypeScript config at the path Prisma looks in — the compiled output is CommonJS, which
  Prisma's config loader rejects outright.

  `task prod:migrate` and `task prod:seed` were added. The documented `task db:migrate` targets the
  preprod stack and runs `prisma migrate dev`, which generates migrations, requires a shadow
  database, and can reset the database it is pointed at — not something to aim at production.

- c6b382a: The API could not talk to a password-protected Redis. `env.schema.ts` had no `REDIS_PASSWORD`,
  and both connection sites — the BullMQ root config and the cache module's ioredis client — passed
  only host and port, while the production compose starts Redis with `--requirepass`. Every command
  came back `NOAUTH Authentication required`, so rate limiting, caching, and the job queue were all
  dead in production.

  Redis's health check hid it. `redis-cli --raw incr ping` exits 0 even when the server answers
  NOAUTH, so the container reported healthy while nothing could use it — and the probe incremented
  a key named `ping` in the live database every few seconds. It now authenticates and asserts on
  the reply.

- ff34259: Mail could not be sent from a typical VPS. The transport treated only port 465 as implicit TLS,
  so the alternative port hosts leave open when they block the standard ones — 2465 — would have
  been negotiated as plaintext and failed. Both are now recognised.

  Worth knowing when this bites: providers block outbound 25, 465, and 587 silently, so the
  connection times out rather than being refused and a mail failure presents as a hang with nothing
  in the logs and nothing in the provider's dashboard.

### Minor Changes

- 33c74bc: The published API document identifies itself correctly and no longer advertises a foreign host.

  Its title and description were read from `npm_package_name`, which npm sets only for processes it
  launches. The production image runs `node` directly, so the live document at `/swagger` called
  itself "API Documentation" and described itself as **"undefined Swagger documentation"** — the
  literal string. Both come from named constants now, and the Swagger UI page gains a real tab title.

  The server list still offered `https://spotify-clone-api-jp5z.onrender.com/` alongside
  `http://localhost:3000`, so "Try it out" on the public document pointed at a host that is not ours
  and one that is not reachable. The stale entry is gone and the deployed origin is added from
  `API_BASE_URL` when it is set.

  `setExternalDoc('@bitrate/docs', '')` emitted `externalDocs` with an empty `url`, which OpenAPI
  does not allow. It is removed until the documentation site has an address to point at.

- 9e409ce: Ten variables the API expects now actually reach it in production.

  The compose file listed neither the OAuth credentials nor six token and health settings in the api
  service's environment, so the container never received them. Verified on the running production
  container: all ten were absent. The consequences were silent — the API fell back to its schema
  defaults for token lifetimes, cookie names, the health-check timeout and the mail token flag, so
  changing any of them in `.env` did nothing at all; and Google and Facebook sign-in could not work
  in production regardless of configuration, because neither client id nor secret was passed through.

  They are declared by bare name, the convention the rest of that list already uses: an unset variable
  stays absent rather than arriving as an empty string, which the API's schema would reject.

- 10157ba: The API answers on its own host as well as at `/api` on the main domain. Both paths reach the
  same handler: the service sets a global prefix of `api`, and requests to the new host that omit
  that prefix are rewritten to add it, so `api.<domain>/v1/…` and `api.<domain>/api/v1/…` both
  work. The path route stays in place so the move needs no flag day.

  Requests from the frontends are now cross-origin, which means a CORS preflight before every
  non-simple request. The origins the API accepts come from `USER_WEB_HOST` and `ARTIST_WEB_HOST`,
  and the auth cookies stay same-site — `bitrate.me` and `api.bitrate.me` share a registrable
  domain, so `SameSite=Strict` still sends them.

- 10095e5: Every application image moved from the `node:22-alpine` base to `node:24-alpine`, matching
  the Node version CI already built and tested against. Previously CI ran on Node 24 while
  each shipped container ran Node 22, so no pipeline exercised the runtime that actually
  served traffic.
- 10095e5: Added `API_RATE_LIMIT_MAX` and `API_RATE_LIMIT_WINDOW_MS` environment overrides for the
  global throttler so a single-IP load test can measure the API instead of the rate limiter.
  Both fall back to the previous 100 requests per 60 seconds when unset or not a positive
  finite number, and neither loosens the auth-route throttle, which stays at 10 per minute.

### Patch Changes

- f72b2f0: Album endpoints returned the `AlbumTrack` join-row id in place of the track's
  own id, because the membership row was spread over the track and its `id` won.
  Every track started from an album page therefore asked the playback endpoints
  for a non-existent id and failed with a 404 on both the CMAF manifest and the
  HLS fallback. The flattening now drops the join row's id while still letting the
  album-specific `trackNumber`/`discNumber` override the track's own.
- b27c405: Swagger examples no longer embed the current time. Four fields in the liked-tracks
  response example called `new Date()` at module load, so every API boot produced a
  different OpenAPI document and therefore a different generated contract. That made
  the contract reproducible only against the exact second it was generated: even a
  freshly committed `v1.ts` would be reported as drifted on the next CI run. The
  examples now use a fixed instant, the way the neighbouring `releaseDate` already did.
- 6b707b2: Build artifacts stay out of the Docker build context, which is the same defect as the env files and
  had two visible effects.

  `.dockerignore` listed `dist/`, `build/`, `.next/` and `out/` as root-relative patterns, so they
  matched only the context root and left every app's and package's output in the context. A published
  web-player image was carrying a `.next/dev/` tree — a development build inside a production image —
  and every build shipped gigabytes to the daemon: the working tree measured 2.9 GB, of which
  `apps/desktop/src-tauri/target` alone was 1.2 GB.

  With `**/` prefixes and the Rust target directory excluded, a web-player build transfers 540 kB of
  context instead, and the resulting image has no `.next/dev` at all. Verified by building it: the
  client bundle contains `https://api.bitrate.me` and no `localhost:3000`.

- 72e98ad: Nested `.env` files are excluded from every Docker build context, and `prisma generate` no longer
  depends on one being there.

  `.dockerignore` patterns are matched against the context root, so a bare `.env` line excluded only
  `./.env` and left `apps/api/.env`, `apps/api/.env.test`, `apps/mobile/.env`, and
  `apps/web-player/.env.development` in the context of every image built with `COPY . .`. They never
  reached a production image — the final stages copy named artifacts rather than the tree — but they
  did land in the build stage, which is exported to the registry as build cache. The patterns are
  `**/.env` and `**/.env.*` now, with the example templates negated back in.

  That exclusion is what surfaced the real bug. `prisma.config.ts` read the shadow database URL as
  `process.env.SHADOW_DATABASE_URL || env('SHADOW_DATABASE_URL')` and then spread it conditionally,
  which reads as "optional" — but Prisma's `env()` throws on a missing variable rather than returning
  undefined, so the conditional could never see a falsy value and loading the config failed outright
  wherever the variable was unset. It builds locally only because a developer's `apps/api/.env` was
  being copied in; CI, which has no such file, failed. The shadow database is only used by
  `migrate dev`, and production runs `migrate deploy`, so it is read from `process.env` and genuinely
  optional now.

  `prisma generate` and the Nest build both load that config, in three stages, so the placeholder URL
  is declared once as a build argument. The two stages that are discarded set it as `ENV`, which
  covers every command in them; the production stage passes it per-command instead, so nothing lands
  in the published image's environment — verified with `docker inspect`.

- 34776a7: Each app ships a `.env.example` generated from its own schema, and the real development env files
  leave version control.

  `apps/api/.env.development` and `apps/web-player/.env.development` were tracked, so a developer
  inherited someone else's values instead of choosing their own. They are untracked now and
  `.gitignore` covers the pattern so they cannot come back by accident.

  The examples are generated from each app's `env.schema.ts` rather than copied from the files they
  replace: every variable appears, grouped by whether the app refuses to start without it, and the
  defaults shown are the schema's own. `apps/api/.env.test` stays tracked on purpose — the E2E suite
  reads it and the CI step that runs it has no environment of its own, so removing it breaks the
  pipeline rather than tidying it.

- 00ae1cc: Hardened the CodeQL-flagged file-upload and cookie call sites in `apps/api` without
  changing their behaviour: every Multer-supplied file path (track audio, track covers, user
  avatars) is now reconstructed from its own directory and server-generated filename before
  being opened or removed, rejecting any filename that would escape its directory. Short-lived
  auth cookies (`pending_2fa_token`, `oauth_state`) now set `httpOnly`/`secure` as literal
  keys at the `res.cookie()` call site instead of through a spread options object. The `access`
  auth guards for users and artists no longer perform a redundant verification of a co-present
  refresh-token cookie: that check could not be bypassed by an attacker (who simply omits the
  cookie) and only rejected legitimate requests whose unrelated refresh token happened to be
  stale.
- 208996d: The web-artists container reported unhealthy while serving correctly. Its root path answers 307
  to `/auth/login` because the portal is behind auth, and the health check demanded exactly 200.
  It now accepts any status below 500 — the check is meant to prove the server is up and routing,
  not that a given page is public.

  All three checks also lacked an error handler on the request, so a refused connection surfaced as
  an unhandled `error` event and a stack trace instead of a clean failure.

- ea3d30a: Deleting a track now actually stops it streaming. Both HLS entry points — the
  master playlist and the per-rendition assets — read the track without checking
  `deletedAt`, and the asset route checked no track state at all, so a soft-deleted
  track kept serving its full audio indefinitely while every other read path in the
  module filtered it out.

  Uploading a track no longer records a `TrackFile` row pointing at a bare multer
  filename rather than a storage key. That row survived publication, so a later
  progressive request for the source format resolved a path that does not exist and
  returned 404 for a perfectly healthy track. The `format` query parameter is now
  restricted to the supported progressive formats instead of accepting any string.

  Ranged responses omit `Content-Length` when the storage driver does not report
  one, instead of sending `0` or the literal text `undefined` alongside a non-empty
  body. Liking an already-liked playlist, or registering a device twice
  concurrently, now returns 409 instead of a generic 500.

- e7e3ab7: Error responses now carry the label that matches their status code. The exception filter seeded
  the `error` field with `Internal Server Error` and replaced it only when the exception supplied
  one of its own, so every exception that omits the field — nestjs-zod's validation exception among
  them — answered `400` under a `500` label. A rejected registration reported
  `{"statusCode":400,"error":"Internal Server Error"}`.

  The label is derived from the resolved status instead, and an exception that does supply its own
  still wins.

- f72b2f0: Track durations stopped being invented. The seeder generated a random 180-300
  second duration and used it to overwrite the real value that had already been
  read from the audio file on upload, so every seeded track was wrong by up to
  147 seconds in either direction, and instrumental versions inherited the main
  track's duration. The seeder now leaves the file-derived duration alone, and
  existing rows were recomputed from the CMAF fragment index.

  Also removed a legacy seeded track that had no audio files at all and was stuck
  in PROCESSING, and corrected a seeder log line that claimed to fall back to the
  remote source URL when a download failed — no such fallback exists, the track is
  skipped instead.

- 9ad8254: Migrations run before the new containers start, not after.

  `prod:migrate` used `compose exec api`, which needs that container already running — so migrations
  could only happen after the restart, and the new code served requests against the old schema for as
  long as they took. That is the worse of the two windows: new code is precisely what needs the new
  columns. It also made every deploy race the container's boot, which the workflow papered over with
  a six-attempt retry loop.

  The migration now runs in a throwaway container from the image just pulled, which needs nothing
  running but the database, so `prod:deploy` is pull, migrate, restart. The retry loop is gone with
  the race that caused it. Old code meeting an already-migrated schema is the safe direction, and it
  stays safe as long as migrations are additive — expand in one release, contract in a later one.

- 3c3ad99: The edge nginx owns port 80 outright, and stops naming its own version to anyone who asks.

  The image ships `conf.d/default.conf`, which sorts before the rendered `prod.conf` and was
  therefore the default server for port 80: every unrecognised `Host` got the stock nginx welcome
  page — version number included — and, more consequentially, an ACME challenge for any name not
  yet listed in `server_name` was answered by that block instead of from the webroot. That is
  exactly the moment a new subdomain's first certificate is issued, so the failure would have
  surfaced as an unexplained validation error. The HTTP block is now `default_server` and the
  image's file is mounted over with an empty one.

  `server_tokens off` removes the version from the `Server` header on every response.

- 9a05a92: nginx resolved each upstream host once at startup and cached the address for the life of the
  process, so every `docker compose up` that recreated a container left the proxy answering 502
  until someone restarted nginx by hand. Routing now goes through a variable with Docker's embedded
  resolver, which defers the lookup to request time.

  A side effect worth having: `nginx -t` used to fail with "host not found in upstream" unless the
  application containers were already running, so the configuration could not be validated on its
  own. It now checks anywhere.

- f72b2f0: OAuth redirect URIs now include the API's global prefix and version. The
  callback routes live under `/api/v1`, but the URI handed to Google and Facebook
  pointed at `/auth/oauth/<provider>/callback`, which 404s — so sign-in would have
  failed on the return leg the moment credentials were configured, for both the
  user and the artist flows.
- c4762b7: Pinned the vulnerable transitive dependencies flagged by Dependabot to their
  patched releases through pnpm overrides, and moved Next.js to 16.2.11. The
  affected packages reached the apps at runtime — multer, socket.io-parser, qs
  and body-parser in the API, dompurify and mermaid in the docs site, next in
  both web frontends — so this closes the advisories in shipped code rather
  than in tooling alone.
- 604c528: Production pulls the `:master` images rather than `:develop`.

  The compose file named the `develop` tag, so the server would have deployed whatever last landed on
  the working branch. It follows `master` now, which is what the branch protection and the existing
  pull-request flow already treat as the released state.

  The server's checkout has to be on `master` too, not only its images: the nginx templates, the
  compose file, and the Taskfile are read from the working tree rather than from any image, so a
  checkout left on `develop` deploys images built from one commit alongside configuration from
  another.

- faf3ea9: Production deploys pull the images CI publishes instead of building them on the server.

  Each app service now names its GHCR image alongside its build context, so `task prod:deploy`
  fetches and restarts in a couple of minutes where a build on that box takes twenty-odd. `build:`
  stays for local work and for the fallback `prod:build`.

  The API image also drops six dead `ENV DATABASE_URL=$DATABASE_URL`-style lines. The `ARG` feeding
  them was declared in the `base` stage, which later stages do not inherit, so each expanded to an
  empty string — and the empty string is worse than nothing: compose passes `SHADOW_DATABASE_URL` by
  bare name specifically so an unset variable stays absent, and the image was making it present. The
  placeholder `postgresql://admin:admin@…` defaults went with them; they never reached the image, but
  a credential-shaped default in a Dockerfile invites someone to start relying on it.

- a5ceca4: Split the largest source files into focused modules without changing any
  behaviour. On the server the tracks service became separate query, upload, and
  streaming services, the audio pipeline separated encoding from upload and
  publication, the WebSocket gateway handed its connection and playback state to
  a registry, social sign-in moved to its own controllers on both sides, and the
  database seeder became one seeder per step. In the player the stream loader
  separated bitrate choice and the download loop from the MediaSource lifecycle.
  In the artist app the registration form, the header submenu, and the slide
  video hook each split along their own seams.
- 34776a7: Sentry events now carry a release and an environment. The release is the deployed
  version of the API, read from `SENTRY_RELEASE`, and the environment comes from
  `SENTRY_ENVIRONMENT` rather than from `NODE_ENV` alone, so a deploy target labels
  its own events instead of relying on one variable being set correctly. Trace and
  profile sampling now follows the resolved environment for the same reason. Both
  values fall back to their previous behaviour when unset, so nothing changes for a
  container started outside the deploy workflow.
- cebd6df: Sentry now initialises before the modules it is supposed to trace.

  `import './instrument'` sat fifteen lines down, after Nest, Express, helmet and the rest. Imports
  evaluate in source order and Sentry's instrumentation patches modules as `init()` runs, so every
  module already loaded was left untraced — which is most of the ones worth tracing. The error filter
  and `SentryModule` worked, so errors were reported; HTTP and database spans were not.

  It sits in its own import block, because Biome sorts within a block but preserves block order, and
  alphabetical sorting is what had pushed it to the bottom in the first place. Verified by running
  `biome check --write` over the file afterwards.

- e0fcd01: The reverse proxy no longer lets a client choose its own IP address. `/api` was
  hardened to send `X-Forwarded-For: $remote_addr`, but `/uploads` — which also
  reaches the API — set no proxy headers at all, so a client-supplied
  `X-Forwarded-For` passed through untouched and, with `TRUST_PROXY_HOPS=1`,
  became `req.ip`. Rate-limit buckets and audit IPs were spoofable on that route.
  The remaining blocks appended the client value instead of replacing it; since
  this nginx is the outermost proxy, every block now sends `$remote_addr`.
- dad1adc: An upload's path is built from the directory the server chose, not from the one the request
  carried.

  Every field on a Multer file object arrives with the request, `path` included — Multer writes the
  file, but the object describing it is request data. The cleanup and validation paths were derived
  from `dirname(file.path)`, so a value shaped by the request reached `open()` and `rm()` even though
  the filename itself was a generated UUID.

  Both halves are now server-owned: the directory is a named constant the upload interceptor also
  writes to, and the filename is the result of `basename()`. The destination literals moved next to
  the media helpers so the interceptor and the cleanup cannot drift apart.

  An existing spec asserted the avatar cleanup deleted `/tmp/avatar.png` — the path its fixture put on
  the file object. It now asserts the file under the avatar directory, which is what the code should
  always have removed.

- Updated dependencies [adc2b7c]
- Updated dependencies [abe3615]
  - @bitrate/converter@2.0.0
  - @bitrate/ncs-parser@1.0.0

## 0.1.0

### Minor Changes

- a43dc9e: Add a StorageService driver abstraction for track audio/HLS storage, selectable via the new `STORAGE_DRIVER` env var (`s3` or `local`, defaulting to `local`). The local filesystem driver provides full feature parity with the existing S3 driver, including HTTP Range-request progressive streaming, HLS playlist/segment serving, and a signed-URL equivalent of S3 presigned URLs. S3 credentials are now only required when `STORAGE_DRIVER=s3`, so a fresh clone can boot without configuring MinIO/AWS.

### Patch Changes

- eedc147: Add adaptive HLS audio variants, resilient hls.js playback, and an atomic BullMQ conversion pipeline with versioned jobs, retries, FFmpeg timeouts, stale-job protection, cleanup, and processing statuses.
- 7aaa0f4: Fix authorization and private playlist exposure, make cache fallbacks safe, repair auth request retries and media URLs, and restore Base UI wrapper compatibility.
- Updated dependencies [eedc147]
  - @bitrate/converter@1.1.0
