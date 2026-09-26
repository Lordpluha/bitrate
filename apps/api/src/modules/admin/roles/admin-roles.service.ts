import { PrismaService } from '@infra/prisma/prisma.service'
import {
  assertGrantable,
  normalizePermissions,
  PERMISSIONS,
  type Permission,
  PROTECTED_PERMISSIONS,
} from '@modules/admin-auth'
import { ConflictException, Injectable } from '@nestjs/common'
import { Prisma, type Role } from '@prisma/client'
import type { CreateRoleDto, UpdateRoleDto } from './dtos'
import { BuiltInRoleException, RoleInUseException, RoleNotFoundException } from './errors'

/** Per-role operator counts, joined onto a role row. */
type RoleCounts = { holders: number; divergentHolders: number }
type RoleWithCounts = Role & RoleCounts

/** One row of the permission catalogue. */
type RolePermissionRow = { id: Permission; heldBy: number; protected: boolean }

const PROTECTED_PERMISSION_SET = new Set<string>(PROTECTED_PERMISSIONS)
const BUILT_IN_ADMIN_NAME = 'ADMIN'

/** Handles role templates and the permission catalogue. */
@Injectable()
export class AdminRolesService {
  constructor(private readonly prisma: PrismaService) {}

  /** Lists every role with its operator counts. */
  async findAll(): Promise<RoleWithCounts[]> {
    const roles = await this.prisma.role.findMany({
      orderBy: [{ createdAt: 'asc' }, { id: 'asc' }],
    })
    return await this.attachCounts(roles)
  }

  /** Finds a role by id, with its operator counts. */
  async findById(id: string): Promise<RoleWithCounts> {
    const role = await this.prisma.role.findFirst({ where: { id } })
    if (!role) throw new RoleNotFoundException(id)

    const [withCounts] = await this.attachCounts([role])
    return withCounts as RoleWithCounts
  }

  /**
   * The full permission catalogue, each entry carrying how many active, non-`ADMIN` operators
   * hold it today. Built from {@link PERMISSIONS} rather than the query result, so a
   * permission nobody holds still appears with `heldBy: 0` instead of being silently absent.
   */
  async permissionsCatalogue(): Promise<RolePermissionRow[]> {
    const rows = await this.prisma.queryRaw<{ permission: string; count: bigint }[]>(Prisma.sql`
      SELECT permission, COUNT(*)::bigint AS count
      FROM "Staff" s
      JOIN "Role" r ON r.id = s."roleId"
      CROSS JOIN LATERAL unnest(s.permissions) AS permission
      WHERE s."deletedAt" IS NULL AND NOT (r."builtIn" AND r.name = ${BUILT_IN_ADMIN_NAME})
      GROUP BY permission
    `)

    const heldByPermission = new Map(rows.map((row) => [row.permission, Number(row.count)]))

    return PERMISSIONS.map((permission) => ({
      id: permission,
      heldBy: heldByPermission.get(permission) ?? 0,
      protected: PROTECTED_PERMISSION_SET.has(permission),
    }))
  }

  /** Creates a new (non-built-in) role template. */
  async create(dto: CreateRoleDto): Promise<Role> {
    assertGrantable(dto.permissions)
    await this.assertNameAvailable(dto.name)

    return await this.prisma.role.create({
      data: {
        name: dto.name,
        description: dto.description ?? null,
        builtIn: false,
        permissions: normalizePermissions(dto.permissions),
      },
    })
  }

  /**
   * Edits a role template. The built-in `ADMIN` role's own `permissions` are always `[]` and
   * its identity (name) is load-bearing for {@link hasPermission} and `ensureBuiltInRoles`, so
   * it cannot be edited at all. The built-in `MODERATOR` role may have its description and
   * permissions edited, but not renamed — role identity for a built-in role is its name.
   *
   * Editing a template never reaches operators already assigned it; only the template itself
   * changes, which is why this writes its own detailed audit row alongside the generic one the
   * global interceptor already writes for every PATCH.
   */
  async update(id: string, dto: UpdateRoleDto, actorStaffId: string): Promise<Role> {
    const role = await this.prisma.role.findFirst({ where: { id } })
    if (!role) throw new RoleNotFoundException(id)
    if (role.builtIn && role.name === BUILT_IN_ADMIN_NAME) throw new BuiltInRoleException(role.name)
    if (role.builtIn && dto.name !== undefined && dto.name !== role.name) {
      throw new BuiltInRoleException(role.name)
    }
    if (dto.permissions !== undefined) assertGrantable(dto.permissions)
    if (dto.name !== undefined && dto.name !== role.name) await this.assertNameAvailable(dto.name)

    const before = role.permissions as Permission[]
    const after = (dto.permissions ?? before) as Permission[]

    return await this.prisma.$transaction(async (tx) => {
      const updated = await tx.role.update({
        where: { id },
        data: {
          ...(dto.name !== undefined && { name: dto.name }),
          ...(dto.description !== undefined && { description: dto.description }),
          ...(dto.permissions !== undefined && {
            permissions: normalizePermissions(dto.permissions),
          }),
        },
      })

      if (dto.permissions !== undefined) {
        await tx.auditLog.create({
          data: {
            staffId: actorStaffId,
            action: 'admin-roles.templateChanged',
            entityType: 'admin-roles',
            entityId: id,
            metadata: {
              before,
              after,
              added: after.filter((permission) => !before.includes(permission)),
              removed: before.filter((permission) => !after.includes(permission)),
            },
          },
        })
      }

      return updated
    })
  }

  /** Deletes a non-built-in role that no active operator currently references. */
  async remove(id: string): Promise<Role> {
    const role = await this.prisma.role.findFirst({ where: { id } })
    if (!role) throw new RoleNotFoundException(id)
    if (role.builtIn) throw new BuiltInRoleException(role.name)

    const holders = await this.prisma.staff.count({ where: { roleId: id, deletedAt: null } })
    if (holders > 0) throw new RoleInUseException(id)

    return await this.prisma.role.delete({ where: { id } })
  }

  private async assertNameAvailable(name: string): Promise<void> {
    const existing = await this.prisma.role.findUnique({ where: { name } })
    if (existing) throw new ConflictException(`Role "${name}" already exists`)
  }

  /** Joins active-operator holder/divergence counts onto each role, defaulting to zero. */
  private async attachCounts(roles: Role[]): Promise<RoleWithCounts[]> {
    if (roles.length === 0) return []

    const ids = roles.map((role) => role.id)
    const rows = await this.prisma.queryRaw<
      { roleId: string; holders: bigint; divergentHolders: bigint }[]
    >(Prisma.sql`
      SELECT s."roleId" AS "roleId",
        COUNT(*)::bigint AS holders,
        COUNT(*) FILTER (
          WHERE ARRAY(SELECT DISTINCT p FROM unnest(s.permissions) p ORDER BY p)
            IS DISTINCT FROM ARRAY(SELECT DISTINCT p FROM unnest(r.permissions) p ORDER BY p)
        )::bigint AS "divergentHolders"
      FROM "Staff" s
      JOIN "Role" r ON r.id = s."roleId"
      WHERE s."deletedAt" IS NULL AND s."roleId" IN (${Prisma.join(ids)})
      GROUP BY s."roleId"
    `)

    const countsByRole = new Map<string, RoleCounts>(
      rows.map((row) => [
        row.roleId,
        { holders: Number(row.holders), divergentHolders: Number(row.divergentHolders) },
      ]),
    )

    return roles.map((role) => ({
      ...role,
      ...(countsByRole.get(role.id) ?? { holders: 0, divergentHolders: 0 }),
    }))
  }
}
