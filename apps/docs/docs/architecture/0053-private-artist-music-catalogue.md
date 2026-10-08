# ADR-0053: Private artist Music catalogue

Status: Accepted

Date: 2026-10-03

## Context

The artist Music design shows recordings at preparation stages alongside release
workspaces. Listener-facing `Track` records have a separate publication and audio
processing lifecycle. Demonstration rows must not become playable public catalogue
records or imply successful distribution.

## Decision

Use `ArtistTrackDraft` for private preparation metadata, with the artist as its
required owner. An optional release link uses a compound foreign key on release ID
and owner ID, so PostgreSQL rejects linking a recording to another artist's release.
The existing `Release` remains the source of truth for release workspaces.

Keep the read-only catalogue in `ReleasesModule`, behind `ArtistAuth`. The three
`artist-music` endpoints provide counts and paginated tracks/releases with search,
combined filters and stable sorting. Every query derives ownership from the session,
excludes soft-deleted rows and returns private, non-cacheable responses. Existing
release creation and summary endpoints retain their contracts.

Keep API state in artist-scoped React Query keys and tab/filter/page state in the
route URL. Create release invalidates the shared artist catalogue root; logout clears
private state. Light, Dark and Dim use one responsive table and semantic theme tokens.

An explicit, transactional demo seed targets one supplied username. It preserves
existing records, marks added records as illustrative, and is idempotent per owner
and title. Demo cover art comes from the design assets; preview audio is an identified
synthetic sample. No public `Track` or delivery records are seeded.

## Consequences

The real database can drive the designed Music views without modifying the public
player pipeline. Database ownership constraints complement API owner filters.
Release track counts include active draft recordings and existing release membership.

This stage provides metadata browsing and illustrative preview playback. Uploads,
editing, conversion from preparation metadata to published recordings, rights and
submission transitions require subsequent implementation and validation. Status
names in a demo record do not represent actual publication or delivery.

## Alternatives considered

- **Seed public `Track` records** — would mix demonstration/preparation metadata
  into the public audio lifecycle and require invented public media ownership.
- **Keep all rows as frontend fixtures** — would not satisfy the requested local
  database-backed catalogue or exercise owner-scoped API access.
