# Artist release drafts

The first Release Workspace API slice uses the existing `Release` schema and the
single-owner policy in [ADR-0052](../../../../docs/docs/architecture/0052-artist-release-workspace-foundation.md).
All endpoints require an authenticated artist session through `ArtistAuth`; a credit or
contributor relationship does not grant workspace access.

| Endpoint | Behavior |
| --- | --- |
| `POST /api/v1/releases` | Creates a `DRAFT` owned by the authenticated artist. |
| `GET /api/v1/releases?page=1&limit=20` | Lists that artist's active workspaces, newest first, with `{ data, total, page, limit }`. |
| `GET /api/v1/releases/:id` | Reads one owned active workspace, including its edit version. |
| `GET /api/v1/releases/:id/workspace` | Reads summary, active linked recording metadata, optional schedule and credited participants; each relation preview is capped at 50. |
| `POST /api/v1/releases/:id/contributors` | Adds a name and unique roles to an owned DRAFT using expectedUpdatedAt; credit and release version persist in one transaction. |
| `GET /api/v1/releases/:id/contributors/:contributorId` | Reads exactly one credit and current release version within the owned active release. |
| `PATCH /api/v1/releases/:id/contributors/:contributorId` | Corrects a DRAFT credit's name/roles with expectedUpdatedAt, preserving its identity, artist link and splits. |
| `PATCH /api/v1/releases/:id` | Updates title, type and/or planned date of an owned `DRAFT`, requiring the previously read `updatedAt`. |
| `GET /api/v1/artist-music/counts` | Counts the artist's active private recordings and releases. |
| `GET /api/v1/artist-music/tracks` | Lists private preparation recordings, with artwork, version, duration, status and optional owned release. |
| `GET /api/v1/artist-music/releases` | Lists release summaries with artwork and active track counts. |

Create input:

```json
{ "title": "My first release", "type": "SINGLE" }
```

`title` is trimmed and must contain 1–255 characters. `type` is optional and defaults
to `SINGLE`; `ALBUM`, `EP` and `COMPILATION` are also accepted. Unknown fields, including ownership
and status overrides, return 400. Pagination accepts positive integers, with a maximum
of 100 items per page. Unsupported query fields return 400.

Responses contain summary metadata only and use `Cache-Control: private, no-store`.
Lists exclude soft-deleted releases and apply the same owner filter to the count.
Creating a draft does not require tracks, a UPC, participants, splits, territories or
a scheduled date. It does not publish an album or send anything to a distributor.

Edit input (copy `expectedUpdatedAt` from the latest GET response):

```json
{ "title": "Updated title", "type": "EP", "expectedUpdatedAt": "2026-10-03T10:00:00.000Z" }
```

At least one editable field is required. Ownership, active state, `DRAFT` status and
version are checked atomically in the write. Changed/non-draft workspaces return 409;
missing, deleted and other artists' workspaces all return 404. The client preserves
entries after errors and reloads the latest version when the form is reopened. There
are no automatic mutation retries. This slice needs no additional migration.

The workspace response includes `trackDrafts`, ordered existing `tracks`,
`participants`, `trackCount` and `participantCount`. Totals apply the same active
filters as the previews; they can exceed the bounded arrays. Private recordings
also require the same owner. Credited participants expose only ID, display name and
roles; recording source/playback URLs and account credentials are not included.
Missing, foreign and deleted releases return the same 404; malformed IDs return 400.
Credited participants can be added to an owned DRAFT with
`POST /api/v1/releases/:id/contributors`: name, at least one unique existing role,
and the release's `expectedUpdatedAt`. The release version and new credit are
saved in one transaction; rejected writes persist neither change. Foreign/deleted
releases return 404, stale/non-DRAFT writes 409. Credits do not grant membership
or alter existing credits/splits. Editing uses GET/PATCH on the individual credit
with the same strict fields and transaction/version guard. Legacy empty role lists
can be read and corrected; writes require at least one role. A missing credit or
failed credit write also rolls back the release version. Removal and rights remain
future slices.
See [ADR-0057](../../../../docs/docs/architecture/0057-owned-release-contributor-addition.md).
For credit correction see [ADR-0058](../../../../docs/docs/architecture/0058-owned-release-contributor-editing.md).
For workspace reading see
[ADR-0055](../../../../docs/docs/architecture/0055-owned-release-workspace-view.md).

PATCH also accepts an optional
`scheduledAt` ISO 8601 instant with milliseconds and an explicit timezone, or `null`
to clear the plan. Omitted fields are preserved. The existing atomic owner, active,
DRAFT and version predicates apply to schedule edits. Saving a plan never submits
review, changes lifecycle status or starts external delivery. Years are bounded to
1–9999 UTC; date-only and timezone-less values are rejected. Past dates are allowed
for draft preparation; delivery-specific lead-time rules are not introduced here.
See [ADR-0056](../../../../docs/docs/architecture/0056-owned-release-schedule-editing.md).

The artist portal's Create release dialog saves a title/type draft through POST, then
opens Music / Releases. Music provides tracks and releases views, recoverable
loading/error/empty states and details with **Edit draft** for title/type. Artwork,
recording editing, deleting, membership
mutations, credit removal, rights and submission validation belong to subsequent slices.

Running against PostgreSQL requires the previously introduced release-foundation
migration and `20261003120000_artist_music_catalogue` to be applied. The latter adds
private `ArtistTrackDraft` metadata and optional release artwork/demo flags. Its
compound release/owner foreign key rejects cross-artist recording links; duration
must be nonnegative. Public `Track` records and publication processing are unchanged.
See [ADR-0053](../../../../docs/docs/architecture/0053-private-artist-music-catalogue.md).

Catalogue lists accept `page`, `limit`, `search` (up to 100 characters), `status`,
`type`, and `sort` (`updated`, `title`, `oldest`). Track `type` means recording version;
release `type` means release format. Filters combine; counts are unfiltered. Unknown
query fields and unsupported enum values return 400. Sorting includes an ID tie-breaker.

The opt-in seed `src/infra/seeds/artist-music-demo.sql` requires a psql variable
`artist_username`. Run against the intended local development database, after migrations:

```bash
psql "$LOCAL_DEVELOPMENT_DATABASE_URL" -v ON_ERROR_STOP=1 -v artist_username=<artist-username> -f apps/api/src/infra/seeds/artist-music-demo.sql
```

It transactionally adds six illustrative private recordings and two demo releases,
preserves existing workspaces and skips existing demo rows on repeat execution. It
does not create accounts, change credentials or insert public tracks. Demo preview
URLs resolve to the artist portal's identified synthetic sample audio.

`test/migrations/artist-music-catalogue.sql` checks valid-owner links, cross-owner
rejection and nonnegative duration in a transaction that always rolls back.

From the repository root, run the isolated HTTP tests (Prisma is mocked; no database
or env files are used):

```bash
rtk proxy python3 -B .claude/scripts/run-heavy.py -- env NODE_OPTIONS=--max-old-space-size=2048 pnpm --filter @bitrate/api exec jest --config test/jest-int.json --runInBand --runTestsByPath src/modules/releases/releases.controller.int-spec.ts
```

After a Nest build or watch compilation, verify the emitted controller in plain Node:

```bash
rtk proxy pnpm --filter @bitrate/api check:release-build
```

This checks runtime imports, DI and Swagger response metadata without loading env
files or connecting to a database. Keep the service's selected Prisma result inferred
and declare the response entity in the Swagger decorators: the compiler plugin can
otherwise emit an absolute TS-source import on a non-ASCII checkout path. Compilation
and ts-jest alone do not detect that startup failure.
