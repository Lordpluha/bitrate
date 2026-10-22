import { PrismaService } from '@infra/prisma/prisma.service'
import { assertGrantable, normalizePermissions, type Permission } from '@modules/admin-auth'
import { Injectable, NotFoundException } from '@nestjs/common'
import type { Prisma } from '@prisma/client'
import {
  ADMIN_STAFF_SAFE_SELECT,
  ROLE_GRANT_SELECT,
  STAFF_ROLE_CHECK_SELECT,
} from './admin-staff.select'
import type { AssignStaffRoleDto, UpdateStaffPermissionsDto } from './dtos'
import { StaffNotFoundException, SuperAdminPermissionsException } from './errors'
import {
  assertNotLastActiveAdmin,
  isBuiltInAdmin,
  resolveGrantedPermissions,
  writePermissionAuditRow,
} from './staff-permission-grants'

type StaffRoleCheck = Prisma.StaffGetPayload<{ select: typeof STAFF_ROLE_CHECK_SELECT }>
type RoleGrant = Prisma.RoleGetPayload<{ select: typeof ROLE_GRANT_SELECT }>

/** Handles an existing operator's role assignment and direct permission grants. */
@Injectable()
export class AdminStaffPermissionsService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Reassigns an operator to a different role. Without a `permissions` override the new
   * role's current template is copied onto the operator.
   *
   * Assigning the built-in `ADMIN` role is the one legitimate escalation path in this system,
   * and it is reachable only by callers who already hold `staff:write` — which, because that
   * permission is protected, means only existing ADMINs. Do not narrow this further; that is
   * the intended design, not an oversight.
   */
  async assignRole(id: string, dto: AssignStaffRoleDto, actorStaffId: string) {
    return await this.prisma.$transaction(async (tx) => {
      const staff = await this.findActiveForRoleCheck(tx, id)
      const newRole = await this.findRoleGrant(tx, dto.roleId)

      const isSuperAdmin = isBuiltInAdmin(newRole)
      if (isBuiltInAdmin(staff.role) && !isSuperAdmin) {
        await assertNotLastActiveAdmin(tx, id)
      }

      const before = staff.permissions as Permission[]
      const after = resolveGrantedPermissions({
        isSuperAdmin,
        override: dto.permissions,
        template: newRole.permissions as Permission[],
      })

      const updated = await tx.staff.update({
        where: { id },
        data: { roleId: dto.roleId, permissions: after },
        select: ADMIN_STAFF_SAFE_SELECT,
      })
      await writePermissionAuditRow(tx, {
        actorStaffId,
        targetStaffId: id,
        before,
        after,
        roleId: dto.roleId,
        source: 'assignment',
      })

      return updated
    })
  }

  /**
   * Replaces an operator's own permission set directly, independent of its role's template.
   * Never valid for an operator holding the built-in `ADMIN` role — that role's `permissions`
   * are never consulted, so writing to them would be a silent no-op dressed up as a change.
   */
  async updatePermissions(id: string, dto: UpdateStaffPermissionsDto, actorStaffId: string) {
    assertGrantable(dto.permissions)

    return await this.prisma.$transaction(async (tx) => {
      const staff = await this.findActiveForRoleCheck(tx, id)
      if (isBuiltInAdmin(staff.role)) {
        throw new SuperAdminPermissionsException(id)
      }

      const before = staff.permissions as Permission[]
      const after = normalizePermissions(dto.permissions as Permission[])

      const updated = await tx.staff.update({
        where: { id },
        data: { permissions: after },
        select: ADMIN_STAFF_SAFE_SELECT,
      })
      await writePermissionAuditRow(tx, {
        actorStaffId,
        targetStaffId: id,
        before,
        after,
        roleId: staff.roleId,
        source: 'manual',
      })

      return updated
    })
  }

  /** Reads the active operator's current role and grants, or throws {@link StaffNotFoundException}. */
  private async findActiveForRoleCheck(
    tx: Prisma.TransactionClient,
    id: string,
  ): Promise<StaffRoleCheck> {
    const staff = await tx.staff.findFirst({
      where: { id, deletedAt: null },
      select: STAFF_ROLE_CHECK_SELECT,
    })
    if (!staff) throw new StaffNotFoundException(id)
    return staff
  }

  /** Reads the role's grant template, or throws a 404 for an unknown role. */
  private async findRoleGrant(tx: Prisma.TransactionClient, roleId: string): Promise<RoleGrant> {
    const role = await tx.role.findUnique({ where: { id: roleId }, select: ROLE_GRANT_SELECT })
    if (!role) throw new NotFoundException(`Role ${roleId} not found`)
    return role
  }
}
