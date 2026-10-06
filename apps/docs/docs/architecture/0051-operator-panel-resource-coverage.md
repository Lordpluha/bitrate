# ADR-0051: Operator panel resource coverage

Status: Accepted

Date: 2026-10-05

This record covers the operator panel (`apps/admin`) and its `/admin/*` API. It builds on
[ADR-0035](./0035-admin-panel-on-angular.md), [ADR-0036](./0036-admin-clean-architecture.md)
and [ADR-0038](./0038-operator-permissions-roles-as-templates.md) and changes none of their decisions.

## Context

The panel began as lists for reports, tracks, artists, users and the audit log. Operators could not
open a record, could not see a deactivated account, and had no tool for albums, public playlists,
genres or podcasts. Without a shared rule, each new resource would invent its own take-down
semantics, permission names and template membership. These decisions were made while planning the
resource expansion and are recorded so later screens follow them.

## Decision

### Which pages exist

A page earns a route only if an operator acts or diagnoses there. In order of operator value:

1. Overview (`/`): open reports, failed and stuck tracks, deactivated accounts, recent operator actions.
2. Track detail (`/catalog/:id`).
3. Report detail (`/moderation/:id`): the report resolved to its subject.
4. Listener detail (`/users/:id`).
5. Artist detail (`/artists/:id`).
6. The `status` filter on users, artists and tracks.
7. Albums (`/albums`, `/albums/:id`).
8. Public playlists (`/playlists`, `/playlists/:id`).
9. Genres (`/genres`, `/genres/new`, `/genres/:id`).
10. Podcasts (`/podcasts`, `/podcasts/:id`), with episodes inside the podcast detail.

### Tables deliberately without a page

- Session, password-reset, email-verification and OAuth-account tables hold tokens or secrets.
  Detail pages show a count and a revoke action instead of rows.
- Settings, search history, player device, player state and queue are private, ephemeral listener
  state. No operator action on them exists.
- Notifications and subscriptions have no backend an operator could act on (no sending, no
  billing). The notifications and settings pages (#222, #223) are not built; revisit them when a
  backend exists.
- Listening history, likes, follows and saved-episode tables are join or log tables. They appear as
  counts on user, artist and track detail.
- Track files, album and playlist tracks, track artists and the genre join tables are structure
  shown inside their owner's detail page.
- The audit log has its own page; detail pages link to it filtered by entity.

### Take-down: soft delete with restore

One convention for every resource with a `deletedAt` column (users, artists, tracks, albums,
playlists, podcasts and episodes):

- `<resource>:delete` stamps `deletedAt`; `<resource>:restore` clears it. Episodes reuse
  `podcasts:delete` and `podcasts:restore`.
- List endpoints take `status=active|deactivated|all`, default `active`. Detail by id is not
  restricted to active rows, so a taken-down record stays reachable.
- Take-downs do not cascade. Taking an album down does not touch its tracks, and a podcast and its
  episodes are independent. Operators manage each separately.
- Taking down an already taken-down row, or restoring one that is not taken down, answers 409. The
  write is conditional on the current state, so a concurrent request loses with 409 instead of
  re-stamping.
- Every write is audited: `AuditInterceptor` records the request, and the service writes an
  explicit row carrying the optional reason.
- Taking a user or artist down also deletes their sessions, in the same transaction.

### Session revocation without listing

Users and artists get `POST /admin/{users,artists}/:id/sessions/revoke` under
`users:revoke-sessions` and `artists:revoke-sessions`. Detail pages show an active-session count,
never the rows. A revoked listener is signed out on their next request; an open WebSocket stays
connected until it drops. Staff sessions are out of scope: the staff permissions are protected and
the staff screen already exists.

### Public playlists: two independent tiers

- Hide sets `isPublic` to false under `playlists:hide`. Take-down sets `deletedAt` under
  `playlists:delete`. Neither changes the other: restoring never re-publishes, and un-hiding never
  restores.
- The list shows public playlists only. A hidden playlist leaves the list and is reached through a
  report's subject link, the audit log or its URL.
- Un-hide is accepted only when the latest operator hide or un-hide audit row for that playlist is
  a hide; otherwise 409. No column records whether the owner or an operator made a playlist
  private, and an operator must never publish a playlist its owner made private.
- Trade-off: the correctness of un-hide depends on the audit trail, and an operator cannot browse
  hidden playlists. Rejected alternative: a migration adding an explicit "hidden by operator"
  flag. It would allow a hidden-playlists list and a stateless guard, but the epic ships without
  migrations, and the flag can still be added later if browsing hidden playlists becomes a need.

### Genres

Genres are reference data with create, update and delete. They have no `deletedAt`, by design. A
delete is physical and is refused with 409 and the track, album and artist reference counts while
anything references the genre. A taken slug answers 409. The guard counts and then deletes outside
one transaction, so a reference added in between is caught by the foreign key instead.

### Permissions and the MODERATOR template

Permission ids stay `resource:action`, add-only, never renamed. `MODERATOR_TEMPLATE` in
`apps/api/src/modules/admin-auth/access/permissions.ts` is an explicit list, not derived from the
catalogue:

- A new permission reaches administrators by identity and nobody else. Joining the template is a
  deliberate edit.
- The template only seeds the built-in role on first boot; `ensureBuiltInRoles` does not rewrite an
  existing role. Existing moderators change only when an administrator edits them on `staff/:id`.
- This epic added `albums:read`, `playlists:read`, `playlists:hide`, `podcasts:read` and
  `genres:read` to the template. All delete, restore, write and revoke-sessions permissions, and
  `overview:read`, stayed administrator-only.

### Planned, not yet built

- Bulk actions (#219, built): `POST /admin/<resource>/batch/<action>` with up to 100 ids, a per-id result,
  the same per-id permission check and one audit row per entity.
- CSV export (#220, built): separate administrator-only `<resource>:export` permissions, list filters
  reused, a cap of 50 000 rows and formula-injection prefixing.
- Drill-down (#221): one view of reports by entity type over time, under `overview:read`.

## Consequences

- New resources follow the take-down, `status` filter and audit conventions without a new decision.
- A new permission is invisible to moderators until someone grants it; the permission catalogue's
  held-by count on the new id is how the gap is noticed.
- Operators cannot list hidden playlists, and a genre in use must be unlinked before it is deleted.
- Notifications and subscription tooling stay out until a backend exists.

## Alternatives considered

- **Derive `MODERATOR_TEMPLATE` from the catalogue minus protected permissions** — every new
  permission, including destructive ones, would enter the template as a side effect.
- **Soft delete for genres** — needs a migration and an index check for reference data with no
  restore use case.
- **List session rows on detail pages** — exposes token rows with no operator value.
- **Cascade take-downs (album to tracks, podcast to episodes)** — hides a rights decision inside a
  side effect and makes a partial restore impossible.
- **A page per table** — dumps with no operator action.
