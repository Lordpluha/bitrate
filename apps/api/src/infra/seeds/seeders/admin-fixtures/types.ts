import type { PrismaClient } from '@prisma/client'

/**
 * The Prisma surface every fixture-group seeder needs — never the full `PrismaClient`, the same
 * narrowing `built-in-roles.ts`'s `RoleWriteClient` uses. Lets a unit spec pass a
 * `DeepMockProxy<PrismaService>` (which exposes the same model getters, not `PrismaClient`'s
 * `$transaction`/`$connect`/… surface) without an unsound cast.
 */
export type AdminFixturesPrismaClient = Pick<
  PrismaClient,
  | 'artist'
  | 'track'
  | 'role'
  | 'staff'
  | 'user'
  | 'album'
  | 'playlist'
  | 'genre'
  | 'podcast'
  | 'episode'
  | 'moderationReport'
  | 'auditLog'
>

/** How many rows this run actually inserted, by fixture group — printed by `seed-admin.ts`. */
export type AdminFixturesSummary = {
  roles: number
  staff: number
  users: number
  artists: number
  tracks: number
  albums: number
  playlists: number
  genres: number
  reports: number
  auditLogs: number
}

/** A fresh, all-zero {@link AdminFixturesSummary} — a re-run reports zero everywhere. */
export const emptySummary = (): AdminFixturesSummary => ({
  roles: 0,
  staff: 0,
  users: 0,
  artists: 0,
  tracks: 0,
  albums: 0,
  playlists: 0,
  genres: 0,
  reports: 0,
  auditLogs: 0,
})

/** Ids of the two fixture custom roles {@link import('./roles.seeder').seedRoles} ensures. */
export type FixtureRoleIds = {
  reviewerRoleId: string
  catalogRoleId: string
}

/** Ids {@link import('./staff.seeder').seedStaff} ensures. */
export type FixtureStaffIds = {
  moderatorStaffId: string
}

/** Ids {@link import('./users.seeder').seedUsers} ensures. */
export type FixtureUserIds = {
  reporterUserId: string
  deactivatedUserIds: string[]
}

/** Ids {@link import('./artists.seeder').seedArtists} ensures. */
export type FixtureArtistIds = {
  fixtureArtistId: string
  deactivatedArtistIds: string[]
}

/** Ids {@link import('./tracks.seeder').seedTracks} ensures. */
export type FixtureTrackIds = {
  failedTrackIds: string[]
  stuckTrackIds: string[]
}

/** Ids {@link import('./playlists.seeder').seedPlaylists} ensures. */
export type FixturePlaylistIds = {
  publicPlaylistId: string
  abusivePlaylistId: string
}

/** Every id the report-seeding step needs, gathered from every earlier step. */
export type FixtureIds = FixtureRoleIds &
  FixtureStaffIds &
  FixtureUserIds &
  FixtureArtistIds &
  FixtureTrackIds &
  FixturePlaylistIds & {
    deactivatedAlbumId: string
    unusedGenreId: string
  }
