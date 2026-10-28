# ADR-0062: Release publishing and track visibility

Status: Accepted

Date: 2026-10-27

## Context

An approved release (`READY`) could never reach listeners. Its recordings stayed private
`ArtistTrackDraft` rows, nothing created player `Track`/`Album` rows, and nothing set
`RELEASED`. At the same time a player track became public the moment its conversion finished
(`processingStatus = READY`), a rule copied into about 35 queries, several of them raw SQL. If
publishing simply created tracks, a multi-track release would appear in the player one track at
a time. The product decisions behind this work are in
[`specs/release-publishing.md`](../specs/release-publishing.md).

## Decision

- **Visibility is a timestamp, not a status.** `Track.publishedAt` and `Album.publishedAt`
  are null while the release is publishing or offline. A listener-facing read requires
  `publishedAt IS NOT NULL` on top of the existing conditions. The rule lives in one place:
  `PUBLIC_TRACK_WHERE` / `PUBLIC_TRACK_SQL` (`modules/tracks/track-visibility.ts`) and
  `PUBLIC_ALBUM_WHERE` (`modules/albums/album-visibility.ts`). Admin reads skip it.
- Both columns default to the creation time and existing rows were backfilled from
  `createdAt`, so tracks and albums made outside the release workflow (direct uploads,
  seeds) keep their behaviour. Only the release workflow writes null.
- **Release state machine** (`ReleaseStatus`): `READY → PUBLISHING → RELEASED`, failing to
  `PUBLISH_FAILED` (Bitrate retries back to `PUBLISHING`); `READY → SCHEDULED` for a
  premiere, `SCHEDULED → READY` to cancel it; `RELEASED ⇄ UNPUBLISHED`. `unpublishedBy`
  records who took it offline; only the artist's own takedown can be republished by the
  artist. Every artist transition checks the read `updatedAt` version.
- **All or nothing.** A `release-publishing` BullMQ queue runs the work outside the request:
  the job copies each private master into the track pipeline and creates every unpublished
  `Track` with its `ReleaseTrack` link (one transaction per track), and only then queues the
  conversions. The transcode worker reports each finished or permanently failed conversion
  of a release track back on the same queue; the API re-checks the release. When every
  track is `READY`, one transaction claims `PUBLISHING → RELEASED`, sets `publishedAt` on
  the tracks, creates the album and links it (`Release.albumId`). The claim is the first
  write, so concurrent checks publish at most once.
- Premieres are delayed jobs with a deterministic id per release and time; the API queues
  any missed premiere at boot.
- Followers get one `NEW_RELEASE` notification per album (`release-published` job); the
  per-track notification is skipped for release tracks.
- Publication lives in `ReleasePublishingModule`, apart from `ReleasesModule`, because it
  depends on the tracks and albums modules and a queue. Track and album writes go through
  those modules' services (ADR-0060).

## Consequences

- A new listener-facing track or album read must use the shared filters; a raw query must
  alias the track table as `t` to use `PUBLIC_TRACK_SQL`.
- Unpublishing hides tracks everywhere they are referenced (playlists, likes, history)
  without deleting anything, and republishing restores them with the same ids.
- A premiere goes live a few minutes after its time, because conversion starts then.
  Pre-converting before the premiere is a possible later improvement.
- Editing a live release (revisions, PR 3 of the spec) is not covered yet.
