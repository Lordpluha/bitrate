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
      'Built-in operator role. Holds every grantable permission except staff and role administration.',
    permissions: [...MODERATOR_TEMPLATE] as string[],
  },
] as const

/**
 * Idempotently upserts the built-in ADMIN and MODERATOR roles by name, so a restored dump or a
 * freshly migrated database always has both. Safe to call on every boot.
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
      update: {
        description: role.description,
        builtIn: true,
        permissions: role.permissions,
      },
    })
  }
}
