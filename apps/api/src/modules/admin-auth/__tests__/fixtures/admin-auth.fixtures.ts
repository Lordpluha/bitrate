import type { Staff, StaffSession } from '@prisma/client'
import { MODERATOR_TEMPLATE } from '../../access'
import type { AuthenticatedStaff } from '../../types'

/** Builds an authenticated staff record — the shape `AdminAuthGuard` attaches to the request. */
export const buildStaff = (overrides: Partial<AuthenticatedStaff> = {}): AuthenticatedStaff => ({
  id: 'staff-1',
  email: 'ops@bitrate.app',
  username: 'ops',
  password: 'hashed-password',
  roleId: 'role-moderator',
  role: { name: 'MODERATOR', builtIn: false },
  permissions: [...MODERATOR_TEMPLATE],
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

/** Builds a raw `Staff` row (no role relation attached) — for service-level tests. */
export const buildRawStaff = (overrides: Partial<Staff> = {}): Staff => ({
  id: 'staff-1',
  email: 'ops@bitrate.app',
  username: 'ops',
  password: 'hashed-password',
  roleId: 'role-moderator',
  permissions: [...MODERATOR_TEMPLATE],
  twoFactorSecret: null,
  twoFactorEnabled: false,
  failedLoginAttempts: 0,
  lockedUntil: null,
  deletedAt: null,
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
})
