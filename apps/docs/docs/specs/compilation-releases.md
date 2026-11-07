# Compilation releases

Status: implemented for the artist’s own published recordings on 2026-11-06.
Spotify research completed on the same date. Multiple-artist compilations remain outside scope.

## Spotify reference

- [Compilations](https://support.spotify.com/us/artists/article/compilations/): Spotify
  supports compilation albums. Track-linking can substitute an identical available recording;
  royalties belong to that recording's rights holder. Its current public help page says
  compilations with five or more artists display Various Artists and appear under Appears On.
- [Re-uploading music](https://support.spotify.com/us/artists/article/re-uploading-music/):
  track-linking can preserve play counts when audio and metadata match, including duration,
  title and artist name. This describes Spotify behaviour, not an integration Bitrate has.
- [Artist albums API](https://developer.spotify.com/documentation/web-api/reference/get-an-artists-albums):
  compilation is an album type/group, separate from album, single and appears_on filters.

## Bitrate behaviour

A compilation is a reviewed release with its own title, artwork, running order and date.
An artist selects existing eligible recordings instead of uploading duplicate audio.
The existing automatic Single (1–4), EP (5–6), Album (7+) rules remain for ordinary releases;
compilation is an explicit release mode and must survive recording additions/removals.
Do not infer Various Artists or grant access merely from contributor count or free-text credits.

A recording has one canonical catalogue Track. Multiple ReleaseTrack/AlbumTrack associations
reuse its identity, ISRC, playback assets and listening history. Creating a compilation never
resets counts, clones likes, creates a second ISRC or automatically publishes a release.
Titles, artist credits and audio on a linked recording remain canonical; replacing audio creates
a new recording requiring review rather than mutating every release using the original.

Only the artist’s own currently published, approved recordings can be selected. Multiple-artist
permission grants are not implemented; public availability and participant credits grant no access.
A source removed by administration must not become available through another release.

## Implementation and API

At the bottom of **Dashboard → Profile**, choose **Create compilation**. This creates an
empty compilation draft directly. In its editor, **Add from catalogue** opens the recording picker.
Ordinary release drafts offer master uploads instead of starting compilations. The picker supports search,
numbered pagination (20 recordings per page), selections across pages and up to 50 recordings
per compilation. The profile entry explicitly creates COMPILATION mode. Removing every
recording preserves compilation mode. Compilation masters cannot be uploaded or replaced.

- `GET /api/v1/releases/:id/catalogue-tracks?page=1&search=...`: eligible owned recordings,
  excluding those already attached to this draft. Private, authenticated and owner-scoped.
- `POST /api/v1/releases/:id/compilation-tracks`: `{trackIds, expectedUpdatedAt}`. Adds canonical
  references in selection order under the draft version lock. Rejects stale versions, mixed
  uploaded masters, repeated IDs and identical original audio checksums when available.
- `ArtistTrackDraft.sourceTrackId` stores the canonical source; the private uploaded master is
  not copied. Source title, duration and ISRC are read from Track. The private preview resolves
  the original master and still checks ownership and source availability.
- `ReleaseTrack.reused` distinguishes reused recordings from native masters. Publication
  attaches existing recordings without new conversion, Track or ISRC records and preserves the
  publication dates of already-live tracks. The compilation still requires Bitrate review.
- Recording locks serialize source checks with deletion and administrative takedown. Eligibility
  is checked when adding, submitting, materializing and completing publication. Restoring an
  approved compilation can restore its previously approved hidden recordings, never blocked ones.
- Removing a release preserves shared recordings referenced by another release. A recording with
  no live release is hidden; it is deleted only when no undeleted release still references it.
- `Track.moderationBlockedAt` records removal of a native recording by administration and blocks
  every compilation appearance. Taking down a compilation only removes that compilation.

Migration: `20261106130000_own_catalogue_compilations`. It also preserves existing administrative
removals by backfilling the recording block. Existing releases remain native associations.

Artist analytics already query canonical Track and ListeningHistory directly, so compilation
associations do not multiply plays or unique listeners. This was verified against PostgreSQL.

## Verification

Focused unit checks cover source availability, duplicate bytes across different catalogue IDs,
compilation mode preservation, publication and existing master uploads. A browser run against
an isolated real API/database verified search, pagination, multi-page selection, immutable linked
metadata, save/reload and mobile layout. Database scenarios verified identifiers, likes, history,
no conversion, shared deletion/preview, restoring an approved compilation and administrative blocks.

## Focused acceptance checks

1. Add an eligible recording, preserve order and identifiers, and reject duplicates in one release.
2. Reject other artists' recordings without a grant, removed sources and stale draft versions.
3. Review the compilation before publication; an approval never grants access to arbitrary sources.
4. Publish without duplicating tracks, conversion jobs, ISRCs, plays or likes.
5. Remove either release without breaking the remaining authorised association.
6. Apply administrative takedown to every appearance; compilation cannot restore the recording.
7. Sum unique recording analytics correctly when a track appears in several releases.
