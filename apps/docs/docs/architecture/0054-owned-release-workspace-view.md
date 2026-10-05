# ADR-0054: Owned release workspace view

Status: Accepted

Date: 2026-10-03

## Context

Music summaries and draft title/type editing already work. Issue #245 requires one
addressable workspace holding a release's tracks, schedule and participants. Pencil
screens 21/21B depict review feedback and master history that the API does not implement.

## Decision

Add `GET /api/v1/releases/:id/workspace` using the authenticated artist as owner.
Missing, soft-deleted and foreign releases return the same 404. A selected Prisma
query returns summary/cover, the owner's display name, active private recording
metadata, ordered existing `ReleaseTrack` metadata and credited names/roles. It does
not return login details, audio source URLs, rights splits or implied delivery results.
Credits remain descriptive and do not grant access (ADR-0051).

Bound each relation preview to 50 rows with deterministic ordering; include filtered
total counts and disclose truncation in the UI. A single query reads the workspace
relations/counts. Responses are private/no-store. Existing schema and migrations
suffice; no schema change is introduced.

The protected portal route `/dashboard/music/$releaseId` uses the established FSD
layers, validated OpenAPI response and artist-scoped query cache. Its non-nested
file route stays inside the authenticated dashboard without embedding Music's
catalogue view. Existing draft editing invalidates the workspace cache after a save.
One responsive layout and semantic tokens serve Light/Dark/Dim. Original waveform
art and desktop/mobile card geometry come from screens 21/21B; unsupported review
feedback, master history and workflow transitions are labeled as future work.

## Consequences

Artists can open a release, see actual linked tracks, its optional UTC schedule and
credited participants, then edit an owned draft's title/type. Relation previews are
bounded; full relation pagination and membership/schedule/credit mutation remain
future slices. Status values are displayed as stored, without inferring approval,
delivery or fabricated timeline completion.

## Alternatives considered

- **Static review demo** — would misrepresent stored status, participants and delivery.
- **Unbounded nested response** — could grow with large releases; bounded previews
  and genuine totals are sufficient for this initial workspace view.
- **New upload/review pipeline in this slice** — requires separate storage/workflow
  contracts; preserve the current small metadata boundary instead.
