import type { Album } from '@prisma/client'

/** Builds a full album record for tests (mirrors the Prisma model shape). */
export const buildAlbum = (overrides: Partial<Album> = {}): Album => ({
  id: 'album-1',
  title: 'Night Signal',
  cover: null,
  artistId: 'artist-1',
  description: null,
  releaseDate: new Date('2026-01-01T00:00:00Z'),
  type: 'ALBUM',
  label: null,
  totalTracks: 2,
  copyright: null,
  deletedAt: null,
  rightsConfirmedVersion: null,
  rightsConfirmedAt: null,
  createdAt: new Date('2026-01-01T00:00:00Z'),
  updatedAt: new Date('2026-01-01T00:00:00Z'),
  ...overrides,
})

/** Builds an album as the admin list/take-down queries return it, artist name included. */
export const buildAlbumWithArtist = (overrides: Partial<Album> = {}) => ({
  ...buildAlbum(overrides),
  artist: { username: 'dj-test' },
})

/** Builds the flattened operator row the service returns for one album. */
export const buildAdminAlbumRow = (overrides: Partial<Album> = {}) => {
  const { id, title, cover, artistId, type, totalTracks, releaseDate, deletedAt } =
    buildAlbum(overrides)
  return {
    id,
    title,
    cover,
    artistId,
    artistUsername: 'dj-test',
    type,
    totalTracks,
    releaseDate,
    deletedAt,
    createdAt: new Date('2026-01-01T00:00:00Z'),
    updatedAt: new Date('2026-01-01T00:00:00Z'),
  }
}
