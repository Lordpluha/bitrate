import { DEFAULT_LIMIT, DEFAULT_PAGE } from '@common/pagination'
import { buildSortOrderBy, type SortInput } from '@common/sort'
import { isPrismaP2002 } from '@common/utils/prisma'
import { PrismaService } from '@infra/prisma/prisma.service'
import type { Permission } from '@modules/admin-auth'
import { TokenService } from '@modules/tokens/token.service'
import { ConflictException, Injectable, NotFoundException } from '@nestjs/common'
import type { Prisma } from '@prisma/client'
import {
  ADMIN_STAFF_SAFE_SELECT,
  ROLE_GRANT_SELECT,
  STAFF_ROLE_CHECK_SELECT,
} from './admin-staff.select'
import type { ADMIN_STAFF_SORT_FIELDS, CreateStaffDto } from './dtos'
import { StaffNotFoundException } from './errors'
import {
  assertNotLastActiveAdmin,
  isBuiltInAdmin,
  resolveGrantedPermissions,
  writePermissionAuditRow,
} from './staff-permission-grants'

/** One of the operator directory's allowed sort fields. */
type AdminStaffSortField = (typeof ADMIN_STAFF_SORT_FIELDS)[number]

/** Input for listing operators. */
type ListStaffInput = { page?: number; limit?: number } & SortInput<AdminStaffSortField>

/** An operator as returned to the panel — see {@link ADMIN_STAFF_SAFE_SELECT}. */
type SafeStaff = Prisma.StaffGetPayload<{ select: typeof ADMIN_STAFF_SAFE_SELECT }>

/** The 409 message when a concurrent create claimed the email or username first. */
const EMAIL_OR_USERNAME_TAKEN = 'Email or username is already in use'

/**
 * Handles the operator directory: listing, creation and deactivation. Role reassignment and
 * direct permission grants on an existing operator live in `AdminStaffPermissionsService`.
 */
@Injectable()
export class AdminStaffService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly token: TokenService,
  ) {}

  /** Lists active operators, paginated. */
  async findAll({ page = DEFAULT_PAGE, limit = DEFAULT_LIMIT, sort, order }: ListStaffInput) {
    const where = { deletedAt: null } satisfies Prisma.StaffWhereInput
    const orderBy = buildSortOrderBy<Prisma.StaffOrderByWithRelationInput>({ sort, order }, [
      { createdAt: 'desc' },
      { id: 'desc' },
    ])
    const [data, total] = await Promise.all([
      this.prisma.staff.findMany({
        where,
        select: ADMIN_STAFF_SAFE_SELECT,
        skip: (page - 1) * limit,
        take: limit,
        orderBy,
      }),
      this.prisma.staff.count({ where }),
    ])
    return { data, total, page, limit }
  }

  /** Finds one operator by id. Excludes deactivated operators. */
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
   *
   * The availability checks give a precise message for the common case; two concurrent creates
   * with the same email or username can both pass them, so the insert's unique violation is
   * mapped to the same 409 rather than surfacing as a 500.
   */
  async create(dto: CreateStaffDto, actorStaffId: string) {
    const permissions = await this.resolveCreationGrant(dto)
    const hashedPassword = await this.token.hashPassword(dto.password)

    try {
      return await this.insertWithAudit(dto, permissions, hashedPassword, actorStaffId)
    } catch (error) {
      if (isPrismaP2002(error)) throw new ConflictException(EMAIL_OR_USERNAME_TAKEN)
      throw error
    }
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
        select: STAFF_ROLE_CHECK_SELECT,
      })
      if (!staff) throw new StaffNotFoundException(id)

      if (isBuiltInAdmin(staff.role)) await assertNotLastActiveAdmin(tx, id)

      const updated = await tx.staff.update({
        where: { id },
        data: { deletedAt: new Date() },
        select: ADMIN_STAFF_SAFE_SELECT,
      })
      await tx.staffSession.deleteMany({ where: { staffId: id } })

      return updated
    })
  }

  /** Checks the email/username are free and resolves what the new operator's role grants. */
  private async resolveCreationGrant(dto: CreateStaffDto): Promise<Permission[]> {
    const [role] = await Promise.all([
      this.prisma.role.findUnique({ where: { id: dto.roleId }, select: ROLE_GRANT_SELECT }),
      this.assertEmailAvailable(dto.email),
      this.assertUsernameAvailable(dto.username),
    ])
    if (!role) throw new NotFoundException(`Role ${dto.roleId} not found`)

    return resolveGrantedPermissions({
      isSuperAdmin: isBuiltInAdmin(role),
      override: dto.permissions,
      template: role.permissions as Permission[],
    })
  }

  /** Inserts the operator and its `creation` permission audit row in one transaction. */
  private insertWithAudit(
    dto: CreateStaffDto,
    permissions: Permission[],
    hashedPassword: string,
    actorStaffId: string,
  ): Promise<SafeStaff> {
    return this.prisma.$transaction(async (tx) => {
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

      await writePermissionAuditRow(tx, {
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

  private async assertEmailAvailable(email: string): Promise<void> {
    const existing = await this.prisma.staff.findUnique({
      where: { email },
      select: { id: true },
    })
    if (existing) throw new ConflictException(`Email "${email}" is already in use`)
  }

  private async assertUsernameAvailable(username: string): Promise<void> {
    const existing = await this.prisma.staff.findUnique({
      where: { username },
      select: { id: true },
    })
    if (existing) throw new ConflictException(`Username "${username}" is already in use`)
  }
}
