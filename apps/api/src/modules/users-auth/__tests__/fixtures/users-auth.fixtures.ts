import type { UserSessionEntity } from '../../entities'

/** The build user session value. */
export const buildUserSession = (
  overrides: Partial<UserSessionEntity> = {},
): UserSessionEntity => ({
  id: 'session-1',
  userId: 'user-1',
  access_token: 'access-token',
  refresh_token: 'refresh-token',
  createdAt: new Date(),
  expiresAt: null,
  ...overrides,
})
