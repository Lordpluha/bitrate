# Design specification: Web player without fake data

Date: 2026-10-14

Status: Implemented — the user confirmed the plan on 2026-10-14 ("Подтверждаю, начинай реализацию"); built on `design/web-player-restructure`.

## Problem

The web player has no mock infrastructure (no MSW, faker, fixtures or mock flags at runtime), but
an audit found 24 places where it shows invented content or controls that do nothing. Examples:

- search suggestions such as "… playlist 2026", 61 hardcoded genres and "This Is X" / "X Radio"
  cards;
- footers copied from Spotify with `href="#"` links, and buttons with no handler;
- "Liked Songs: 0", a "saved" checkmark that is always on, and "Updates: you're all caught up";
- settings that are saved locally and change nothing.

On the server, `Track.playCount`, `Track.popularity` and `Artist.monthlyListeners` are written
only by the seeder. No production code creates notifications, and `privateSession` and
`explicitContent` are stored but never applied.

## Goals

- Every number, list and label in the player comes from the API, or the element is removed.
- Every control does what it says, or it is removed.
- "Popular" and "top" rankings come from `ListeningHistory`, the only real listening signal, as
  `/charts/tracks` already does.

## Non-goals

- Real-time playback handoff between devices over Socket.io. Devices and the queue are synced;
  playback is not transferred.
- Volume normalization and the equalizer. Both are removed.
- Offline downloads, playlist collaborators and "Mix". The buttons are removed.

## Decisions (the user, 2026-10-14)

1. Friends and privacy are built for real:
   - a friend-activity endpoint and a friends panel;
   - three new `UserSettings` fields, `showListeningActivity`, `followersVisible` and
     `publicPlaylistsOnProfile` (one additive migration);
   - the server applies them to the activity feed, follower lists and profile playlists.
2. Bitrate Connect is synced without handoff:
   - this browser registers itself with `POST /me/player/devices`;
   - the button shows `GET /me/player/devices`;
   - the queue and position sync through `GET/PUT /me/player` and `/me/player/queue`.
3. Volume normalization and the equalizer are removed.
4. Notifications get basic producers through BullMQ: FOLLOW, when someone follows you, and
   NEW_RELEASE, when an artist you follow publishes.
5. The artist "Featuring" section is built from real data, using `GET /artists/{id}/playlists`.

## Design

### API (`apps/api`, Jest, test-first)

| Endpoint or change | Source | Notes |
|---|---|---|
| `GET /albums/liked` | `UserLikedAlbum` | UserAuth; declared before `:id`; never cached |
| `GET /playlists/liked` | `UserLikedPlaylist` | Same as above |
| `GET /playlists?userId=` | `Playlist.ownerId` | Keeps the public-only filter and respects `publicPlaylistsOnProfile` |
| `GET /artists/{id}/top-tracks` | `ListeningHistory` distinct user-hour plays | READY tracks only; returns `plays` |
| `GET /artists/{id}/playlists` | Public playlists that contain the artist's tracks | Paginated, ordered by followers |
| `GET /charts/artists` | Distinct listeners per artist in `ListeningHistory` | Same scope windows and cache as track charts |
| `GET /charts/tracks?genre=` | Joins `TrackGenre` | Genre is part of the cache key |
| `GET /users/me/following/activity` | Recent `ListeningHistory` of followed users | Respects `showListeningActivity` |
| `UserSettings` privacy fields | Migration | Additive; check the generated SQL for dropped trigram indexes |
| `privateSession`, `explicitContent` | History, search, feed | Applied on the server |
| Notification producers | BullMQ jobs on follow and on release publish | Idempotent per event |
| Monthly listeners | 28-day distinct listeners from the charts query | Replaces the seeded value |

Every route needs its Swagger decorators; `swagger-operation-coverage.unit-spec.ts` enforces them.

### Contracts

Start the infrastructure (`task infra:up`) and the API, run
`pnpm --filter @bitrate/contracts run gen:api`, and commit `packages/contracts/src/api/v1.ts`. CI
fails on drift.

### Web player

- **Existing endpoints:**
  - search suggestions use search history and `/browse/categories`; song suggestions show the
    artist name from the search `subtitle`;
  - the artist "More options" menu offers follow, copy link and report;
  - the footer keeps only the `/legal/*` routes;
  - the install button uses the browser's `beforeinstallprompt`;
  - "Updates" and the bell read `/me/notifications`;
  - the sidebar like state comes from `useCurrentTrackLike`, and the Liked Songs count from the
    `tracks/liked` total;
  - the Library gets a sort menu;
  - audio quality and language sync with `/me/settings`, and the player caps the bitrate;
  - recent searches come from the server when signed in;
  - leftover stock images are deleted.
- **New endpoints:** genre charts on the category page, artist top tracks and "Featuring",
  popular artists from `/charts/artists`, saved albums and liked playlists from the server
  (localStorage likes are removed), public-profile playlists, the friends panel, and Connect
  devices with queue sync.
- **Removed:** invented suggestions, "This Is X" / "X Radio", the Download / Invite / Mix
  buttons, the video settings, volume normalization and the equalizer.

## Acceptance criteria

- [x] No production file under `apps/web-player/src` contains hardcoded catalogue content or a
      control without a handler. An audit grep returns no hits outside UI config.
- [x] Every new endpoint has Jest unit and integration specs: auth, pagination, deleted or private
      rows excluded, privacy settings applied.
- [x] Rankings ("popular", "top", monthly listeners) change when `ListeningHistory` changes.
- [ ] Likes for albums and playlists survive a new browser profile.
- [ ] A queue started in one browser continues in another after sign-in.
- [x] A FOLLOW and a NEW_RELEASE notification reach the bell.
- [x] Contracts are regenerated without drift; web-player type checks, unit, integration and the
      affected e2e/screenshot specs pass.

## Results (2026-10-14)

- **API:** every endpoint in the table is built with unit and integration specs; rankings and
  monthly listeners are recomputed from `ListeningHistory` every 15 minutes by a BullMQ job;
  FOLLOW and NEW_RELEASE notifications are produced through the `notifications` queue.
- **Contracts:** regenerated from the running API; 8 routes added, none removed.
- **Web player:** all 24 audit items are either wired to the API or removed. Notable choices:
  - liked playlists from the server carry no track count, so the library shows none for them;
  - notifications link to the follower's profile or the artist (there is no track page);
  - Bitrate Connect saves the playing list (at most 500 ids, the window holding the current
    track) and restores it only into an empty player, paused;
  - the quality cap applies from the next track; a rendition pinned by hand still wins;
  - notification titles and bodies are the server's English copy.
- **Not verified here:** the two cross-browser criteria (likes on a new profile, a queue
  continuing in another browser) were checked through unit tests of the sync logic, not by a
  manual two-browser run.

## Risks

- Ranking SQL on `ListeningHistory` costs time: use the existing indexes and cache it like charts.
- Literal routes (`liked`) shadowed by `:id`: declare them first, covered by integration tests.
- Liked lists going stale: no cache, and invalidate on like/unlike.
- Local likes from before the change: dropped, because the server never had them.
- Fresh databases show many empty sections: each has an honest empty state, or the section hides.

## Alternatives considered

- Keeping the fake sections with a "demo" label: rejected, because the user wants no fake data
  in the player.
