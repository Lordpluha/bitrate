# Recording genres: behavior and implementation

> Status: **implemented** — decisions confirmed in chat on 2026-11-10.

## Goal and boundaries

Artists choose genres for each recording they prepare in `apps/web-artists`, so published
tracks and albums appear in genre browse, search and genre-based recommendations, which
already read `TrackGenre`/`AlbumGenre`. The same PR adds missing regression tests for
renaming a release and a recording.

Affected workspaces: `apps/api` (Prisma, releases module, publishing), `packages/contracts`
(regenerated), `apps/web-artists` (release workspace UI, i18n uk/pl/en).

Out of scope: genres on the release itself; changing genres of recordings already live
(no RELEASED → DRAFT path exists; `revise` reopens only REJECTED); backfilling existing
tracks/albums; artist-created genres; admin UI changes (admin genre CRUD already exists);
web-player changes; automatic genre detection from audio (separate follow-up task).

## Observable behavior and contracts

- **Catalogue.** Artists pick only from the `Genre` table that admins manage. A data
  migration inserts a curated catalogue of about 80 widely used streaming genres (main
  genres and their common subgenres) with `ON CONFLICT DO NOTHING`, so existing rows and
  admin edits are preserved. Spotify's algorithmic micro-genres are not imported.
- **Genre list.** `GET /api/v1/artists/me/genres` (ArtistAuth, `private, no-store`) returns
  every genre `{ id, slug, name }` sorted by name.
- **Recording genres.** `PATCH /api/v1/artists/me/releases/:id/tracks/:trackId` accepts
  `genreIds`: 1–3 unique IDs, replaced as a set under the existing DRAFT +
  `expectedUpdatedAt` guard. Unknown IDs → 400. Compilation (reused) recordings reject it
  with the existing `COMPILATION_TRACK_LOCKED` 409 and keep their catalogue genres.
  The workspace response lists each recording's `genres`.
- **Release.** Has no genre field; the release endpoints do not accept genres.
- **Readiness.** Each native recording without genres adds the submission blocker
  `TRACK_GENRES_MISSING` with its `trackId`; `submit` returns 422 like other blockers.
- **Publishing.** Each native catalogue track gets its recording's genres when publishing
  creates it (it stays private until go-live), and in the go-live transaction the album
  gets the union of all its tracks' genres (derived, not edited by the artist). Reused
  compilation tracks are not changed.
- **UI.** The draft workspace lets the artist pick 1–3 genres per recording (searchable
  list, chips) from the recording row; rows show the chosen genres; the readiness
  checklist lists recordings without genres. Non-DRAFT releases show genres read-only.

Migration: one join table (recording draft ↔ genre, cascade on genre and draft delete)
plus the catalogue insert. Rollback: drop the join table; inserted genres can stay as
ordinary catalogue rows.

## Acceptance and evidence

| ID | Observable criterion | Verification | Result / limitation |
|---|---|---|---|
| AC-1 | Release and recording titles of a DRAFT can be renamed; the new title is returned and stale/non-DRAFT writes fail | API int spec for track title PATCH; web-artists unit tests for both editors | Pass: `release-genres.int-spec.ts` (title PATCH), `TrackManageDialogs.unit-spec.tsx`, `ReleaseTitleEditor.unit-spec.tsx` |
| AC-2 | Artists can list the genre catalogue | API int spec | Pass: `release-genres.int-spec.ts` |
| AC-3 | A DRAFT recording's genres are set/replaced with 1–3 valid IDs; empty, duplicate, >3 or unknown IDs are rejected; reused recordings are locked | API int spec | Pass: `release-genres.int-spec.ts` |
| AC-4 | Submission is blocked with `TRACK_GENRES_MISSING` per native recording without genres | readiness unit spec | Pass: `release-readiness.unit-spec.ts` |
| AC-5 | Publishing writes TrackGenre per native track and AlbumGenre as the union of the album's track genres, leaving reused tracks alone | publishing unit spec | Pass: `release-publishing.service.unit-spec.ts` |
| AC-6 | The workspace lets the artist pick recording genres, in uk/pl/en | web-artists unit tests + type check | Pass: `TrackGenresDialog.unit-spec.tsx`, `rights.unit-spec.ts`, check-types; not checked in a live browser |

## Decisions and approval

Confirmed in chat (2026-11-10): genres belong to recordings, not to the release; artists
choose from the admin-managed catalogue, seeded with about 80 main genres and subgenres;
genres are required for submission (owner delegated the choice); already published
releases are untouched; one PR for API + web-artists; automatic detection with an audio
model is a separate follow-up.
Agent choices within that scope: 1–3 genres per recording; album genres derived as the
union of its tracks' genres so album search filters keep working; the admin contract and
review screen gain the new blocker code because they share the readiness entity.

## Implementation plan

1. Prisma: `ArtistTrackDraftGenre` + catalogue data migration (`prisma migrate deploy`).
2. API (TDD): genre list endpoint; `genreIds` in the track update DTO + Swagger; genres in
   workspace recordings; `TRACK_GENRES_MISSING` in readiness; genre copy in the go-live
   transaction; track-title regression test.
3. Regenerate `packages/contracts`.
4. web-artists: genre query, picker in the recording row actions, readiness label,
   i18n uk/pl/en, rename tests.
5. Checks: scoped API jest (`--maxWorkers=2`), web-artists `check-types` + `test:unit`,
   Biome on edited files; releases README.
