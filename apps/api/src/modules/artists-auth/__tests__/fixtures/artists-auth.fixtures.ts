import type { ArtistSessionEntity } from '../../entities'

export const buildArtistSession = (
  overrides: Partial<ArtistSessionEntity> = {},
): ArtistSessionEntity => ({
  id: 'session-1',
  artistId: 'artist-1',
  access_token: 'access-token',
  refresh_token: 'refresh-token',
  createdAt: new Date(),
  expiresAt: null,
  ...overrides,
})
