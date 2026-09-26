import { MODERATOR_TEMPLATE } from '@modules/admin-auth'
import type { PrismaClient } from '@prisma/client'

/** The Prisma surface `ensureBuiltInRoles` needs — works with a raw `PrismaClient` or `PrismaService`. */
type RoleWriteClient = Pick<PrismaClient, 'role'>

const BUILT_IN_ROLES = [
  {
    name: 'ADMIN',
    description:
      'Built-in super role. Passes every permission check by identity; its own permissions are not consulted.',
    permissions: [] as string[],
  },
  {
    name: 'MODERATOR',
    description:
      'Built-in operator role. Holds moderation, catalog, and user-management permissions ' +
      '(reports, artists, tracks, users, audit); excludes staff and role administration and the ' +
      'overview dashboard.',
    permissions: [...MODERATOR_TEMPLATE] as string[],
  },
] as const

/**
 * Guarantees the built-in ADMIN and MODERATOR roles exist, so a restored dump or a freshly
 * migrated database always has both. Safe to call on every boot.
 *
 * Only a missing role is seeded with its description and template. An existing role keeps its
 * description and permissions — both are editable through `PATCH /admin/roles/:id`, and
 * rewriting them here would silently revert an administrator's edits on every restart. The
 * update branch only re-asserts `builtIn`, which is the role's identity and not editable.
 * The call qualifies as a Prisma database upsert — one unique field in `where`, the same value in
 * `create`, a flat `update` — so it runs as `INSERT … ON CONFLICT` and two instances booting at
 * once cannot race into a unique-constraint error. Keep it in that shape.
 */
export async function ensureBuiltInRoles(prisma: RoleWriteClient): Promise<void> {
  for (const role of BUILT_IN_ROLES) {
    await prisma.role.upsert({
      where: { name: role.name },
      create: {
        name: role.name,
        description: role.description,
        builtIn: true,
        permissions: role.permissions,
      },
      update: { builtIn: true },
    })
  }
}
