import type { Playlist } from '@prisma/client'

/** Builds a full playlist record for tests (mirrors the Prisma model shape). */
export const buildPlaylist = (overrides: Partial<Playlist> = {}): Playlist => ({
  id: 'playlist-1',
  title: 'Night Drive',
  cover: null,
  description: null,
  isPublic: true,
  collaborative: false,
  followersCount: 3,
  deletedAt: null,
  createdAt: new Date('2026-01-01T00:00:00Z'),
  updatedAt: new Date('2026-01-01T00:00:00Z'),
  userId: 'user-1',
  ...overrides,
})

/** Builds a playlist as the admin list/mutation queries return it: owner name and track count joined. */
export const buildPlaylistWithOwner = (overrides: Partial<Playlist> = {}, trackCount = 2) => ({
  ...buildPlaylist(overrides),
  user: { username: 'listener' },
  _count: { tracks: trackCount },
})

/** Builds the flattened operator row the service returns for one playlist. */
export const buildAdminPlaylistRow = (overrides: Partial<Playlist> = {}) => {
  const { id, title, cover, userId, isPublic, followersCount, deletedAt } = buildPlaylist(overrides)
  return {
    id,
    title,
    cover,
    ownerId: userId,
    ownerUsername: 'listener',
    isPublic,
    followersCount,
    trackCount: 2,
    deletedAt,
    createdAt: new Date('2026-01-01T00:00:00Z'),
    updatedAt: new Date('2026-01-01T00:00:00Z'),
  }
}
