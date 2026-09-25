import { beforeEach, describe, expect, it } from '@jest/globals'
import { ProtectedPermissionException } from '@modules/admin-auth'
import { ConflictException } from '@nestjs/common'
import type { Prisma } from '@prisma/client'
import { type PrismaMock, prismaMock, resetPrismaMock } from '@test/mocks'
import { type DeepMockProxy, mockDeep } from 'jest-mock-extended'
import {
  buildAdminRole,
  buildModeratorRole,
  buildRole,
} from './__tests__/fixtures/admin-roles.fixtures'
import { AdminRolesService } from './admin-roles.service'
import { BuiltInRoleException, RoleInUseException, RoleNotFoundException } from './errors'

const ACTOR_ID = 'staff-actor-1'

describe('AdminRolesService', () => {
  let service: AdminRolesService
  let prisma: PrismaMock
  let transaction: DeepMockProxy<Prisma.TransactionClient>

  beforeEach(() => {
    resetPrismaMock()
    prisma = prismaMock
    transaction = mockDeep<Prisma.TransactionClient>()
    prisma.$transaction.mockImplementation((callback: unknown) =>
      (callback as (client: Prisma.TransactionClient) => unknown)(transaction),
    )
    service = new AdminRolesService(prisma)
  })

  describe('findAll', () => {
    it('joins holder and divergence counts onto each role, defaulting to zero', async () => {
      const role = buildRole({ id: 'role-1', permissions: ['tracks:read'] })
      prisma.role.findMany.mockResolvedValue([role] as never)
      prisma.queryRaw.mockResolvedValue([
        { roleId: 'role-1', holders: 3n, divergentHolders: 1n },
      ] as never)

      const result = await service.findAll()

      expect(result).toEqual([{ ...role, holders: 3, divergentHolders: 1 }])
    })

    it('returns an empty list without querying counts', async () => {
      prisma.role.findMany.mockResolvedValue([] as never)

      const result = await service.findAll()

      expect(result).toEqual([])
      expect(prisma.queryRaw).not.toHaveBeenCalled()
    })
  })

  describe('findById', () => {
    it('throws RoleNotFoundException when the role does not exist', async () => {
      prisma.role.findFirst.mockResolvedValue(null)

      await expect(service.findById('missing')).rejects.toThrow(RoleNotFoundException)
    })

    it('defaults counts to zero when nobody holds the role', async () => {
      const role = buildRole({ id: 'role-1' })
      prisma.role.findFirst.mockResolvedValue(role as never)
      prisma.queryRaw.mockResolvedValue([] as never)

      const result = await service.findById('role-1')

      expect(result).toEqual({ ...role, holders: 0, divergentHolders: 0 })
    })
  })

  describe('permissionsCatalogue', () => {
    it('includes a permission nobody holds as heldBy: 0, and marks protected ids', async () => {
      prisma.queryRaw.mockResolvedValue([{ permission: 'tracks:read', count: 4n }] as never)

      const catalogue = await service.permissionsCatalogue()

      const tracksRead = catalogue.find((entry) => entry.id === 'tracks:read')
      const staffWrite = catalogue.find((entry) => entry.id === 'staff:write')
      const untouched = catalogue.find((entry) => entry.id === 'artists:delete')

      expect(tracksRead).toEqual({ id: 'tracks:read', heldBy: 4, protected: false })
      expect(staffWrite).toEqual({ id: 'staff:write', heldBy: 0, protected: true })
      expect(untouched).toEqual({ id: 'artists:delete', heldBy: 0, protected: false })
    })
  })

  describe('create', () => {
    it('rejects a protected permission', async () => {
      await expect(
        service.create({ name: 'Support', permissions: ['staff:write'] } as never),
      ).rejects.toThrow(ProtectedPermissionException)
      expect(prisma.role.create).not.toHaveBeenCalled()
    })

    it('rejects a duplicate role name', async () => {
      prisma.role.findUnique.mockResolvedValue(buildRole() as never)

      await expect(service.create({ name: 'Support', permissions: [] } as never)).rejects.toThrow(
        ConflictException,
      )
    })

    it('creates a non-built-in role', async () => {
      prisma.role.findUnique.mockResolvedValue(null)
      const created = buildRole({ name: 'Support', permissions: ['tracks:read'] })
      prisma.role.create.mockResolvedValue(created as never)

      const result = await service.create({
        name: 'Support',
        permissions: ['tracks:read'],
      } as never)

      expect(result).toEqual(created)
      expect(prisma.role.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ builtIn: false, permissions: ['tracks:read'] }),
        }),
      )
    })
  })

  describe('update', () => {
    it('rejects editing the built-in ADMIN role', async () => {
      prisma.role.findFirst.mockResolvedValue(buildAdminRole() as never)

      await expect(
        service.update('role-admin', { permissions: [] } as never, ACTOR_ID),
      ).rejects.toThrow(BuiltInRoleException)
    })

    it('allows editing the built-in MODERATOR role permissions', async () => {
      const moderator = buildModeratorRole()
      prisma.role.findFirst.mockResolvedValue(moderator as never)
      transaction.role.update.mockResolvedValue({
        ...moderator,
        permissions: ['tracks:read'],
      } as never)

      const result = await service.update(
        moderator.id,
        { permissions: ['tracks:read'] } as never,
        ACTOR_ID,
      )

      expect(result.permissions).toEqual(['tracks:read'])
    })

    it('rejects renaming a built-in role', async () => {
      const moderator = buildModeratorRole()
      prisma.role.findFirst.mockResolvedValue(moderator as never)

      await expect(
        service.update(moderator.id, { name: 'Renamed' } as never, ACTOR_ID),
      ).rejects.toThrow(BuiltInRoleException)
    })

    it('rejects a protected permission in the new template', async () => {
      const role = buildRole()
      prisma.role.findFirst.mockResolvedValue(role as never)

      await expect(
        service.update(role.id, { permissions: ['staff:write'] } as never, ACTOR_ID),
      ).rejects.toThrow(ProtectedPermissionException)
    })

    it('writes an audit row with the permission diff', async () => {
      const role = buildRole({ id: 'role-1', permissions: ['tracks:read', 'users:read'] })
      prisma.role.findFirst.mockResolvedValue(role as never)
      transaction.role.update.mockResolvedValue({
        ...role,
        permissions: ['users:read', 'artists:read'],
      } as never)

      await service.update(
        role.id,
        { permissions: ['users:read', 'artists:read'] } as never,
        ACTOR_ID,
      )

      expect(transaction.auditLog.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          staffId: ACTOR_ID,
          action: 'admin-roles.templateChanged',
          entityType: 'admin-roles',
          entityId: 'role-1',
          metadata: {
            before: ['tracks:read', 'users:read'],
            after: ['users:read', 'artists:read'],
            added: ['artists:read'],
            removed: ['tracks:read'],
          },
        }),
      })
    })
  })

  describe('remove', () => {
    it('rejects deleting a built-in role', async () => {
      prisma.role.findFirst.mockResolvedValue(buildModeratorRole() as never)

      await expect(service.remove('role-moderator')).rejects.toThrow(BuiltInRoleException)
    })

    it('rejects deleting a role still assigned to active operators', async () => {
      const role = buildRole()
      prisma.role.findFirst.mockResolvedValue(role as never)
      prisma.staff.count.mockResolvedValue(2)

      await expect(service.remove(role.id)).rejects.toThrow(RoleInUseException)
    })

    it('deletes an unused, non-built-in role', async () => {
      const role = buildRole()
      prisma.role.findFirst.mockResolvedValue(role as never)
      prisma.staff.count.mockResolvedValue(0)
      prisma.role.delete.mockResolvedValue(role as never)

      await expect(service.remove(role.id)).resolves.toEqual(role)
    })
  })
})
