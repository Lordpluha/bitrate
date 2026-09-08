import type { User } from '@prisma/client'

/** Builds a full user record for tests (mirrors the Prisma model shape). */
export const buildUser = (overrides: Partial<User> = {}): User => ({
  id: 'user-1',
  username: 'listener',
  email: 'listener@bitrate.app',
  password: 'hashed-password',
  avatar: null,
  description: null,
  twoFactorSecret: null,
  twoFactorEnabled: false,
  emailVerifiedAt: null,
  failedLoginAttempts: 0,
  lockedUntil: null,
  deletedAt: null,
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
})

/** Builds the operator-safe (select-projected) shape of a user for tests. */
export const buildAdminUser = (overrides: Partial<User> = {}) => {
  const { password: _password, twoFactorSecret: _twoFactorSecret, ...safe } = buildUser(overrides)
  return safe
}
