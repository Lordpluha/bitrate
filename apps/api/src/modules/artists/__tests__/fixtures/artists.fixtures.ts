import type { ArtistEntity } from '../../entities'

/** The build artist value. */
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
  emailVerifiedAt: new Date(),
  failedLoginAttempts: 0,
  lockedUntil: null,
  verified: false,
  monthlyListeners: 0,
  country: null,
  socials: null,
  deletedAt: null,
  ...overrides,
})
