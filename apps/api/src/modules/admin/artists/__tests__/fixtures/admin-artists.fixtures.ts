import type { Artist } from '@prisma/client'

/** Builds a full artist record for tests (mirrors the Prisma model shape). */
export const buildArtist = (overrides: Partial<Artist> = {}): Artist => ({
  id: 'artist-1',
  username: 'dj-test',
  email: 'dj@bitrate.app',
  password: 'hashed-password',
  bio: null,
  avatar: null,
  backgroundImage: null,
  twoFactorSecret: null,
  twoFactorEnabled: false,
  emailVerifiedAt: null,
  failedLoginAttempts: 0,
  lockedUntil: null,
  verified: false,
  monthlyListeners: 0,
  country: null,
  socials: null,
  deletedAt: null,
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
})

/** Builds the operator-safe (select-projected) shape of an artist for tests. */
export const buildAdminArtist = (overrides: Partial<Artist> = {}) => {
  const {
    password: _password,
    twoFactorSecret: _twoFactorSecret,
    socials: _socials,
    ...safe
  } = buildArtist(overrides)
  return safe
}
