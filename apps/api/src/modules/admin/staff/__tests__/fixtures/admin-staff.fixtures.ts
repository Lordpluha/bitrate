import { MODERATOR_TEMPLATE } from '@modules/admin-auth'
import type { Staff } from '@prisma/client'

/** Builds a raw `Staff` row for tests. */
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

/** Builds a raw staff row with its role relation, as `findFirst({ include: { role } })` returns. */
export const buildStaffWithRole = (
  overrides: Partial<Staff> = {},
  role: { name: string; builtIn: boolean } = { name: 'MODERATOR', builtIn: true },
) => ({
  ...buildRawStaff(overrides),
  role,
})

/** Builds the operator-safe (select-projected) shape of a staff row for tests. */
export const buildAdminStaff = (
  overrides: Partial<Staff> = {},
  role: { id: string; name: string; permissions: string[] } = {
    id: 'role-moderator',
    name: 'MODERATOR',
    permissions: [...MODERATOR_TEMPLATE],
  },
) => {
  const {
    password: _password,
    twoFactorSecret: _twoFactorSecret,
    roleId: _roleId,
    ...safe
  } = buildRawStaff(overrides)
  return { ...safe, role }
}
