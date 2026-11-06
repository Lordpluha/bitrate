# ADR-0070: The artist workspace lives under `/artists/me`, sign-in under `/artists/auth`

Status: Accepted

Date: 2026-11-05

Tracked in [#467](https://github.com/Lordpluha/bitrate/issues/467).

## Context

The public API's artist routes grew one root per feature: `/releases`, `/release-tasks`,
`/distribution`, `/artist-dashboard`, `/artist-analytics`, `/artist-workspace`, `/artist-music`,
`/artist-notifications`, `/artist-profile`, `/artist-search`. A few artist-only methods sat in
listener controllers (`POST /tracks`, `PUT /tracks/:id`, `/albums` writes, `PUT` and
`DELETE /artists/:id`). Nothing in a path said whether a call came from an artist or a listener,
and `/artists/me/following` used `me` for a *listener*. The only client of these routes is
web-artists.

## Decision

- **Every route guarded by `@ArtistAuth` is under `/artists/`.** The signed-in artist's workspace
  is `/artists/me/...` (`releases`, `tasks`, `distribution`, `dashboard`, `analytics`, `music`,
  `notifications`, `profile`, `search`, `workspace`); account deletion is `DELETE /artists/me`. Sign-in,
  OAuth, 2FA and sessions stay under `/artists/auth/...`.
- **`/artists/me` belongs to the artist.** Every route under it is guarded by `@ArtistAuth`; the
  listener's followed artists moved to `/users/me/following/artists`, beside
  `/users/me/following` (people).
- **Listener routes under `/artists` are public catalogue reads and follow:** `/artists`,
  `/artists/:id`, `/artists/:id/{top-tracks,playlists,follow}`, `/artists/username/:username`.
  A listener route must never share a method and a segment-compatible pattern with a workspace
  route, so `me` is never captured by `:id` regardless of registration order.
- **Unused artist writes were removed**, not moved: catalogue tracks and albums are created by
  publishing a release ([ADR-0062](./0062-release-publishing-and-track-visibility.md)); the
  profile is edited through `/artists/me/profile`.
- `apps/api/src/artist-routes.unit-spec.ts` enforces all of the above from controller metadata.
- The switch is hard: no deprecated aliases. web-artists ships with the API under one image tag.

## Consequences

- A path alone tells reviewers, logs and cache rules which audience a call serves.
- A new artist feature is a controller under `artists/me/<feature>`; putting `@ArtistAuth` on any
  other path, or a listener route under `/artists/me`, fails the unit spec.
- Releasing the API without web-artists (or the reverse) breaks the artist dashboard, as with any
  breaking contract change; the changeset marks `@bitrate/api` and `@bitrate/contracts` major.

## Alternatives considered

- **Feature segments directly under `/artists/`** (`/artists/releases`) — collide with
  `/artists/:id` and rely on route order.
- **`/artists/studio/...`** — avoids the collision too, but `me` already names "the caller" in
  `/users/me/...` and reads as the account the session belongs to.
- **Deprecated aliases for one release** — web-artists is the only client and ships in the same
  image, so aliases would only add a second path to maintain.
