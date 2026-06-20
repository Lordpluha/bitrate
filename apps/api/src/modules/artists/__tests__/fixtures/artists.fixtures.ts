import type { ArtistEntity } from '../../entities'

export const buildArtist = (overrides: Partial<ArtistEntity> = {}): ArtistEntity => ({
  id: 'artist-1',
  username: 'artist',
  email: 'artist@example.com',
  password: 'hashed-password',
  bio: null,
  avatar: null,
  backgroundImage: null,
  twoFactorSecret: null,
  twoFactorEnabled: false,
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
})
