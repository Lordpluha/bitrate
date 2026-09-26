import { DEFAULT_LIMIT, DEFAULT_PAGE } from '@common/pagination'
import { buildSortOrderBy, type SortInput } from '@common/sort'
import { PrismaService } from '@infra/prisma/prisma.service'
import { assertGrantable, normalizePermissions, type Permission } from '@modules/admin-auth'
import { TokenService } from '@modules/tokens/token.service'
import { ConflictException, Injectable, NotFoundException } from '@nestjs/common'
import type { Prisma } from '@prisma/client'
import { ADMIN_STAFF_SAFE_SELECT } from './admin-staff.select'
import type {
  ADMIN_STAFF_SORT_FIELDS,
  AssignStaffRoleDto,
  CreateStaffDto,
  UpdateStaffPermissionsDto,
} from './dtos'
import {
  LastAdminException,
  StaffNotFoundException,
  SuperAdminPermissionsException,
} from './errors'

/** One of the operator directory's allowed sort fields. */
type AdminStaffSortField = (typeof ADMIN_STAFF_SORT_FIELDS)[number]

/** Input for listing operators. */
type ListStaffInput = { page?: number; limit?: number } & SortInput<AdminStaffSortField>

/** What decides the set an operator is granted on creation or reassignment. */
type ResolveGrantedPermissionsInput = {
  isSuperAdmin: boolean
  override: Permission[] | undefined
  template: Permission[]
}

/** Where a permission diff came from — recorded on the detailed audit row. */
type AuditSource = 'creation' | 'assignment' | 'manual'

const BUILT_IN_ADMIN_NAME = 'ADMIN'

/** Handles the operator directory, role assignment, and permission grants. */
@Injectable()
export class AdminStaffService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly token: TokenService,
  ) {}

  /** Runs the find all operation, paginated. */
  async findAll({ page = DEFAULT_PAGE, limit = DEFAULT_LIMIT, sort, order }: ListStaffInput) {
    const where = { deletedAt: null } satisfies Prisma.StaffWhereInput
    const orderBy = buildSortOrderBy({ sort, order }, [{ createdAt: 'desc' }, { id: 'desc' }])
    const [data, total] = await Promise.all([
      this.prisma.staff.findMany({
        where,
        select: ADMIN_STAFF_SAFE_SELECT,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: orderBy as unknown as Prisma.StaffOrderByWithRelationInput[],
      }),
      this.prisma.staff.count({ where }),
    ])
    return { data, total, page, limit }
  }

  /** Runs the find by id operation. Excludes deactivated operators. */
  async findById(id: string) {
    const staff = await this.prisma.staff.findFirst({
      where: { id, deletedAt: null },
      select: ADMIN_STAFF_SAFE_SELECT,
    })
    if (!staff) throw new StaffNotFoundException(id)
    return staff
  }

  /**
   * Creates an operator. Without a `permissions` override the role's current template is
   * copied onto the operator; with one, the override is validated and used instead. The
   * built-in `ADMIN` role always yields `[]` regardless of any override — its permissions are
   * never consulted, so storing anything else would be misleading.
   */
  async create(dto: CreateStaffDto, actorStaffId: string) {
    const role = await this.prisma.role.findUnique({ where: { id: dto.roleId } })
    if (!role) throw new NotFoundException(`Role ${dto.roleId} not found`)

    await this.assertEmailAvailable(dto.email)
    await this.assertUsernameAvailable(dto.username)

    const isSuperAdmin = role.builtIn && role.name === BUILT_IN_ADMIN_NAME
    const permissions = this.resolveGrantedPermissions({
      isSuperAdmin,
      override: dto.permissions,
      template: role.permissions as Permission[],
    })

    const hashedPassword = await this.token.hashPassword(dto.password)

    return await this.prisma.$transaction(async (tx) => {
      const staff = await tx.staff.create({
        data: {
          email: dto.email,
          username: dto.username,
          password: hashedPassword,
          roleId: dto.roleId,
          permissions,
        },
        select: ADMIN_STAFF_SAFE_SELECT,
      })

      await this.writeAuditRow(tx, {
        actorStaffId,
        targetStaffId: staff.id,
        before: [],
        after: permissions,
        roleId: dto.roleId,
        source: 'creation',
      })

      return staff
    })
  }

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
      const staff = await tx.staff.findFirst({
        where: { id, deletedAt: null },
        include: { role: { select: { name: true, builtIn: true } } },
      })
      if (!staff) throw new StaffNotFoundException(id)

      const newRole = await tx.role.findUnique({ where: { id: dto.roleId } })
      if (!newRole) throw new NotFoundException(`Role ${dto.roleId} not found`)

      const wasSuperAdmin = staff.role.builtIn && staff.role.name === BUILT_IN_ADMIN_NAME
      const isSuperAdmin = newRole.builtIn && newRole.name === BUILT_IN_ADMIN_NAME
      if (wasSuperAdmin && !isSuperAdmin) {
        await this.assertNotLastActiveAdmin(tx, id)
      }

      const before = staff.permissions as Permission[]
      const after = this.resolveGrantedPermissions({
        isSuperAdmin,
        override: dto.permissions,
        template: newRole.permissions as Permission[],
      })

      const updated = await tx.staff.update({
        where: { id },
        data: { roleId: dto.roleId, permissions: after },
        select: ADMIN_STAFF_SAFE_SELECT,
      })

      await this.writeAuditRow(tx, {
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
      const staff = await tx.staff.findFirst({
        where: { id, deletedAt: null },
        include: { role: { select: { name: true, builtIn: true } } },
      })
      if (!staff) throw new StaffNotFoundException(id)
      if (staff.role.builtIn && staff.role.name === BUILT_IN_ADMIN_NAME) {
        throw new SuperAdminPermissionsException(id)
      }

      const before = staff.permissions as Permission[]
      const after = normalizePermissions(dto.permissions as Permission[])

      const updated = await tx.staff.update({
        where: { id },
        data: { permissions: after },
        select: ADMIN_STAFF_SAFE_SELECT,
      })

      await this.writeAuditRow(tx, {
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

  /**
   * Deactivates an operator and revokes every one of its sessions in the same transaction, so
   * a deactivated operator is signed out immediately rather than merely locked out of new
   * logins.
   */
  async softDelete(id: string) {
    return await this.prisma.$transaction(async (tx) => {
      const staff = await tx.staff.findFirst({
        where: { id, deletedAt: null },
        include: { role: { select: { name: true, builtIn: true } } },
      })
      if (!staff) throw new StaffNotFoundException(id)

      const isSuperAdmin = staff.role.builtIn && staff.role.name === BUILT_IN_ADMIN_NAME
      if (isSuperAdmin) await this.assertNotLastActiveAdmin(tx, id)

      const updated = await tx.staff.update({
        where: { id },
        data: { deletedAt: new Date() },
        select: ADMIN_STAFF_SAFE_SELECT,
      })
      await tx.staffSession.deleteMany({ where: { staffId: id } })

      return updated
    })
  }

  /** Resolves the permission set to grant: `[]` for the built-in ADMIN, else override or template. */
  private resolveGrantedPermissions({
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
  private async assertNotLastActiveAdmin(
    tx: Prisma.TransactionClient,
    excludingStaffId: string,
  ): Promise<void> {
    const adminRole = await tx.role.findFirst({
      where: { name: BUILT_IN_ADMIN_NAME, builtIn: true },
    })
    if (!adminRole) return

    const remaining = await tx.staff.count({
      where: { roleId: adminRole.id, deletedAt: null, id: { not: excludingStaffId } },
    })
    if (remaining === 0) throw new LastAdminException()
  }

  private async writeAuditRow(
    tx: Prisma.TransactionClient,
    input: {
      actorStaffId: string
      targetStaffId: string
      before: Permission[]
      after: Permission[]
      roleId?: string
      source: AuditSource
    },
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

  private async assertEmailAvailable(email: string): Promise<void> {
    const existing = await this.prisma.staff.findUnique({ where: { email } })
    if (existing) throw new ConflictException(`Email "${email}" is already in use`)
  }

  private async assertUsernameAvailable(username: string): Promise<void> {
    const existing = await this.prisma.staff.findUnique({ where: { username } })
    if (existing) throw new ConflictException(`Username "${username}" is already in use`)
  }
}
