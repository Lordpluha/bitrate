/**
 * Which API scope may write each Prisma model. Reads stay open to every module; a write from
 * any other scope is reported by `bitrate/prisma-write-ownership`, so cross-module changes go
 * through the owner's service instead of a second copy of its rules.
 *
 * A scope is the folder under `src/modules/` (`tracks`, `users-auth`), an admin sub-folder
 * (`admin/genres`, `admin/staff`), or an `src/infra/` folder (`infra/observability`).
 * Every model in `prisma/schema.prisma` must appear here — `data-ownership.test.mjs` fails otherwise,
 * so a new table is assigned an owner in the same change that adds it.
 */
export const DATA_OWNERS = {
  user: ['users-auth', 'users'],
  userEmailVerification: ['users-auth'],
  userOAuthAccount: ['users-auth'],
  userPasswordReset: ['users-auth'],
  userSession: ['users-auth'],

  artist: ['artists-auth', 'artists', 'artist-profile'],
  artistEmailVerification: ['artists-auth'],
  artistOAuthAccount: ['artists-auth'],
  artistPasswordReset: ['artists-auth'],
  artistSession: ['artists-auth'],

  staff: ['admin-auth', 'admin/staff'],
  staffSession: ['admin-auth'],
  role: ['admin/roles'],

  track: ['tracks'],
  trackFile: ['tracks'],
  trackProcessingAttempt: ['tracks'],
  trackArtist: ['tracks'],
  trackGenre: ['tracks'],
  userLikedTrack: ['tracks'],

  album: ['albums'],
  albumTrack: ['albums'],
  albumGenre: ['albums'],
  userLikedAlbum: ['albums'],

  release: ['releases'],
  releaseContributor: ['releases'],
  releaseDelivery: ['releases'],
  releaseDestination: ['releases'],
  releaseSplit: ['releases'],
  releaseTask: ['releases'],
  releaseTerritory: ['releases'],
  releaseTrack: ['releases'],
  artistTrackDraft: ['releases'],
  artistNotificationPreference: ['releases'],
  artistNotificationState: ['releases'],
  /** Review decisions are made by staff; the artist side only reads them. */
  releaseReview: ['admin/releases'],

  playlist: ['playlists'],
  playlistTrack: ['playlists'],
  userLikedPlaylist: ['playlists'],

  artistGenre: ['artists'],
  userFollowedArtist: ['artists'],
  userLikedArtist: ['artists'],
  userFollow: ['users'],
  /** Requests and friendships change only through the friends service. */
  friendRequest: ['friends'],
  friendship: ['friends'],

  /** The genre catalogue is curated by staff only; no public module edits it. */
  genre: ['admin/genres'],

  podcast: ['podcasts'],
  episode: ['podcasts'],
  userSavedEpisode: ['podcasts'],

  listeningHistory: ['history'],
  searchHistory: ['search'],
  /** `notifications` creates rows from queued domain events; `me` marks them read. */
  notification: ['me', 'notifications'],
  playerDevice: ['me'],
  playerQueueItem: ['me'],
  playerState: ['me'],
  subscription: ['me'],
  userSettings: ['me'],

  moderationReport: ['moderation'],
  /** The request-level interceptor and the admin batch writer — see `SkipAudit`. */
  auditLog: ['infra/observability', 'admin/shared'],
}
