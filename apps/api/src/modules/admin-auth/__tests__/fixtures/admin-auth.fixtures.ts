import type { Staff, StaffSession } from '@prisma/client'

/** Builds a staff record for tests. */
export const buildStaff = (overrides: Partial<Staff> = {}): Staff => ({
  id: 'staff-1',
  email: 'ops@bitrate.app',
  username: 'ops',
  password: 'hashed-password',
  role: 'MODERATOR',
  twoFactorSecret: null,
  twoFactorEnabled: false,
  failedLoginAttempts: 0,
  lockedUntil: null,
  deletedAt: null,
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
})

/** Builds a staff session record for tests. */
export const buildStaffSession = (overrides: Partial<StaffSession> = {}): StaffSession => ({
  id: 'session-1',
  staffId: 'staff-1',
  access_token: 'access-token',
  refresh_token: 'refresh-token',
  createdAt: new Date(),
  expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
  ...overrides,
})
