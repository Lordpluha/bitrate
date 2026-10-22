import { assertGrantable, normalizePermissions, type Permission } from '@modules/admin-auth'
import type { Prisma } from '@prisma/client'
import { LastAdminException } from './errors'

const BUILT_IN_ADMIN_NAME = 'ADMIN'

/** The two role columns that identify the built-in super-admin role. */
type RoleIdentity = { name: string; builtIn: boolean }

/** What decides the set an operator is granted on creation or reassignment. */
type ResolveGrantedPermissionsInput = {
  isSuperAdmin: boolean
  override: Permission[] | undefined
  template: Permission[]
}

/** Where a permission diff came from — recorded on the detailed audit row. */
type AuditSource = 'creation' | 'assignment' | 'manual'

/** One operator's permission change, as recorded on the detailed audit row. */
type PermissionChange = {
  actorStaffId: string
  targetStaffId: string
  before: Permission[]
  after: Permission[]
  roleId?: string
  source: AuditSource
}

/** Whether `role` is the built-in `ADMIN` — whose `permissions` are never consulted. */
export function isBuiltInAdmin(role: RoleIdentity): boolean {
  return role.builtIn && role.name === BUILT_IN_ADMIN_NAME
}

/** Resolves the permission set to grant: `[]` for the built-in ADMIN, else override or template. */
export function resolveGrantedPermissions({
  isSuperAdmin,
  override,
  template,
}: ResolveGrantedPermissionsInput): Permission[] {
  if (isSuperAdmin) return []
  if (override) {
    assertGrantable(override)
    return normalizePermissions(override)
  }
  return normalizePermissions(template)
}

/** Throws {@link LastAdminException} if `excludingStaffId` is the last active built-in ADMIN. */
export async function assertNotLastActiveAdmin(
  tx: Prisma.TransactionClient,
  excludingStaffId: string,
): Promise<void> {
  const remaining = await tx.staff.count({
    where: {
      role: { name: BUILT_IN_ADMIN_NAME, builtIn: true },
      deletedAt: null,
      id: { not: excludingStaffId },
    },
  })
  if (remaining === 0) throw new LastAdminException()
}

/** Writes the `admin-staff.permissionsChanged` audit row with the added/removed diff. */
export async function writePermissionAuditRow(
  tx: Prisma.TransactionClient,
  input: PermissionChange,
): Promise<void> {
  await tx.auditLog.create({
    data: {
      staffId: input.actorStaffId,
      action: 'admin-staff.permissionsChanged',
      entityType: 'admin-staff',
      entityId: input.targetStaffId,
      metadata: {
        before: input.before,
        after: input.after,
        added: input.after.filter((permission) => !input.before.includes(permission)),
        removed: input.before.filter((permission) => !input.after.includes(permission)),
        ...(input.roleId && { roleId: input.roleId }),
        source: input.source,
      },
    },
  })
}
