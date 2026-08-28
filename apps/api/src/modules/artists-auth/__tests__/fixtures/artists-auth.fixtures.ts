import type { ArtistSessionEntity } from '../../entities'

/** The build artist session value. */
export const buildArtistSession = (
  overrides: Partial<ArtistSessionEntity> = {},
): ArtistSessionEntity => ({
  id: 'session-1',
  artistId: 'artist-1',
  access_token: 'access-token',
  refresh_token: 'refresh-token',
  createdAt: new Date(),
  expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
  ...overrides,
})
