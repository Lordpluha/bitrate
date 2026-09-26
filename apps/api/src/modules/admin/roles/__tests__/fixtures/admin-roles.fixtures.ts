import { MODERATOR_TEMPLATE } from '@modules/admin-auth'
import type { Role } from '@prisma/client'

/** Builds a raw `Role` row for tests. */
export const buildRole = (overrides: Partial<Role> = {}): Role => ({
  id: 'role-1',
  name: 'Support',
  description: null,
  builtIn: false,
  permissions: [],
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
})

/** Builds the built-in ADMIN role row. */
export const buildAdminRole = (overrides: Partial<Role> = {}): Role =>
  buildRole({
    id: 'role-admin',
    name: 'ADMIN',
    description: 'Built-in super role',
    builtIn: true,
    permissions: [],
    ...overrides,
  })

/** Builds the built-in MODERATOR role row. */
export const buildModeratorRole = (overrides: Partial<Role> = {}): Role =>
  buildRole({
    id: 'role-moderator',
    name: 'MODERATOR',
    description: 'Built-in operator role',
    builtIn: true,
    permissions: [...MODERATOR_TEMPLATE],
    ...overrides,
  })
