import { beforeEach, describe, expect, it } from '@jest/globals'
import { ProtectedPermissionException, UnknownPermissionException } from '@modules/admin-auth'
import type { TokenService } from '@modules/tokens/token.service'
import { NotFoundException } from '@nestjs/common'
import type { Prisma } from '@prisma/client'
import { type PrismaMock, prismaMock, resetPrismaMock } from '@test/mocks'
import { type DeepMockProxy, mockDeep } from 'jest-mock-extended'
import { buildRawStaff, buildStaffWithRole } from './__tests__/fixtures/admin-staff.fixtures'
import { AdminStaffService } from './admin-staff.service'
import {
  LastAdminException,
  StaffNotFoundException,
  SuperAdminPermissionsException,
} from './errors'

const ACTOR_ID = 'staff-actor-1'

describe('AdminStaffService', () => {
  let service: AdminStaffService
  let prisma: PrismaMock
  let token: DeepMockProxy<TokenService>
  let transaction: DeepMockProxy<Prisma.TransactionClient>

  beforeEach(() => {
    resetPrismaMock()
    prisma = prismaMock
    token = mockDeep<TokenService>()
    token.hashPassword.mockResolvedValue('hashed-password')
    transaction = mockDeep<Prisma.TransactionClient>()
    prisma.$transaction.mockImplementation((callback: unknown) =>
      (callback as (client: Prisma.TransactionClient) => unknown)(transaction),
    )
    service = new AdminStaffService(prisma, token)
  })

  describe('create', () => {
    const dto = {
      email: 'new@bitrate.app',
      username: 'newop',
      password: 'a-strong-password-12',
      roleId: 'role-moderator',
    }

    it('throws when the role does not exist', async () => {
      prisma.role.findUnique.mockResolvedValue(null)

      await expect(service.create(dto as never, ACTOR_ID)).rejects.toThrow(NotFoundException)
    })

    it('throws ConflictException on a duplicate email', async () => {
      prisma.role.findUnique.mockResolvedValue({
        id: 'role-moderator',
        builtIn: true,
        name: 'MODERATOR',
        permissions: ['tracks:read'],
      } as never)
      prisma.staff.findUnique.mockResolvedValueOnce(buildRawStaff() as never)

      await expect(service.create(dto as never, ACTOR_ID)).rejects.toThrow('already in use')
    })

    it('copies the role template when no permissions override is given', async () => {
      prisma.role.findUnique.mockResolvedValue({
        id: 'role-moderator',
        builtIn: false,
        name: 'Support',
        permissions: ['tracks:read', 'users:read'],
      } as never)
      prisma.staff.findUnique.mockResolvedValue(null)
      transaction.staff.create.mockResolvedValue(
        buildRawStaff({ permissions: ['tracks:read', 'users:read'] }) as never,
      )

      await service.create(dto as never, ACTOR_ID)

      expect(transaction.staff.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ permissions: ['tracks:read', 'users:read'] }),
        }),
      )
    })

    it('uses the override when one is given, and rejects a protected id in it', async () => {
      prisma.role.findUnique.mockResolvedValue({
        id: 'role-moderator',
        builtIn: false,
        name: 'Support',
        permissions: ['tracks:read'],
      } as never)
      prisma.staff.findUnique.mockResolvedValue(null)

      await expect(
        service.create({ ...dto, permissions: ['staff:write'] } as never, ACTOR_ID),
      ).rejects.toThrow(ProtectedPermissionException)
    })

    it('grants [] when the assigned role is the built-in ADMIN, regardless of an override', async () => {
      prisma.role.findUnique.mockResolvedValue({
        id: 'role-admin',
        builtIn: true,
        name: 'ADMIN',
        permissions: [],
      } as never)
      prisma.staff.findUnique.mockResolvedValue(null)
      transaction.staff.create.mockResolvedValue(buildRawStaff({ permissions: [] }) as never)

      await service.create({ ...dto, roleId: 'role-admin' } as never, ACTOR_ID)

      expect(transaction.staff.create).toHaveBeenCalledWith(
        expect.objectContaining({ data: expect.objectContaining({ permissions: [] }) }),
      )
    })

    it('writes a detailed audit row with source "creation" and no password anywhere in it', async () => {
      prisma.role.findUnique.mockResolvedValue({
        id: 'role-moderator',
        builtIn: false,
        name: 'Support',
        permissions: ['tracks:read'],
      } as never)
      prisma.staff.findUnique.mockResolvedValue(null)
      transaction.staff.create.mockResolvedValue(
        buildRawStaff({ id: 'new-staff', permissions: ['tracks:read'] }) as never,
      )

      await service.create(dto as never, ACTOR_ID)

      const call = transaction.auditLog.create.mock.calls[0]?.[0]
      expect(call?.data).toMatchObject({
        staffId: ACTOR_ID,
        action: 'admin-staff.permissionsChanged',
        entityType: 'admin-staff',
        entityId: 'new-staff',
        metadata: {
          before: [],
          after: ['tracks:read'],
          added: ['tracks:read'],
          removed: [],
          roleId: 'role-moderator',
          source: 'creation',
        },
      })
      expect(JSON.stringify(call)).not.toMatch(/password/i)
      expect(JSON.stringify(call)).not.toContain('hashed-password')
    })
  })

  describe('assignRole', () => {
    it('throws StaffNotFoundException when the operator does not exist', async () => {
      transaction.staff.findFirst.mockResolvedValue(null)

      await expect(
        service.assignRole('missing', { roleId: 'role-moderator' } as never, ACTOR_ID),
      ).rejects.toThrow(StaffNotFoundException)
    })

    it('throws LastAdminException when reassigning the last active ADMIN away', async () => {
      transaction.staff.findFirst.mockResolvedValue(
        buildStaffWithRole({ id: 'staff-1' }, { name: 'ADMIN', builtIn: true }) as never,
      )
      transaction.role.findUnique.mockResolvedValue({
        id: 'role-moderator',
        builtIn: true,
        name: 'MODERATOR',
        permissions: ['tracks:read'],
      } as never)
      transaction.role.findFirst.mockResolvedValue({ id: 'role-admin' } as never)
      transaction.staff.count.mockResolvedValue(0)

      await expect(
        service.assignRole('staff-1', { roleId: 'role-moderator' } as never, ACTOR_ID),
      ).rejects.toThrow(LastAdminException)
    })

    it('reassigns freely when another active ADMIN remains', async () => {
      transaction.staff.findFirst.mockResolvedValue(
        buildStaffWithRole({ id: 'staff-1' }, { name: 'ADMIN', builtIn: true }) as never,
      )
      transaction.role.findUnique.mockResolvedValue({
        id: 'role-moderator',
        builtIn: true,
        name: 'MODERATOR',
        permissions: ['tracks:read'],
      } as never)
      transaction.role.findFirst.mockResolvedValue({ id: 'role-admin' } as never)
      transaction.staff.count.mockResolvedValue(1)
      transaction.staff.update.mockResolvedValue(buildRawStaff() as never)

      await expect(
        service.assignRole('staff-1', { roleId: 'role-moderator' } as never, ACTOR_ID),
      ).resolves.toBeDefined()
    })
  })

  describe('updatePermissions', () => {
    it('throws ProtectedPermissionException for a protected permission — the per-operator path', async () => {
      await expect(
        service.updatePermissions('staff-1', { permissions: ['staff:write'] } as never, ACTOR_ID),
      ).rejects.toThrow(ProtectedPermissionException)
      expect(transaction.staff.findFirst).not.toHaveBeenCalled()
    })

    it('throws UnknownPermissionException for an id outside the catalogue', async () => {
      await expect(
        service.updatePermissions(
          'staff-1',
          { permissions: ['not:a-permission'] } as never,
          ACTOR_ID,
        ),
      ).rejects.toThrow(UnknownPermissionException)
    })

    it('throws SuperAdminPermissionsException when the target holds the built-in ADMIN role', async () => {
      transaction.staff.findFirst.mockResolvedValue(
        buildStaffWithRole({ id: 'staff-1' }, { name: 'ADMIN', builtIn: true }) as never,
      )

      await expect(
        service.updatePermissions('staff-1', { permissions: ['tracks:read'] } as never, ACTOR_ID),
      ).rejects.toThrow(SuperAdminPermissionsException)
    })

    it('replaces the permission set and writes an audit row with source "manual"', async () => {
      transaction.staff.findFirst.mockResolvedValue(
        buildStaffWithRole(
          { id: 'staff-1', permissions: ['tracks:read'] },
          { name: 'MODERATOR', builtIn: true },
        ) as never,
      )
      transaction.staff.update.mockResolvedValue(
        buildRawStaff({ permissions: ['users:read'] }) as never,
      )

      await service.updatePermissions('staff-1', { permissions: ['users:read'] } as never, ACTOR_ID)

      expect(transaction.auditLog.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          staffId: ACTOR_ID,
          action: 'admin-staff.permissionsChanged',
          entityType: 'admin-staff',
          entityId: 'staff-1',
          metadata: {
            before: ['tracks:read'],
            after: ['users:read'],
            added: ['users:read'],
            removed: ['tracks:read'],
            roleId: 'role-moderator',
            source: 'manual',
          },
        }),
      })
    })
  })

  describe('softDelete', () => {
    it('throws StaffNotFoundException when the operator does not exist', async () => {
      transaction.staff.findFirst.mockResolvedValue(null)

      await expect(service.softDelete('missing')).rejects.toThrow(StaffNotFoundException)
    })

    it('throws LastAdminException when deactivating the last active ADMIN', async () => {
      transaction.staff.findFirst.mockResolvedValue(
        buildStaffWithRole({ id: 'staff-1' }, { name: 'ADMIN', builtIn: true }) as never,
      )
      transaction.role.findFirst.mockResolvedValue({ id: 'role-admin' } as never)
      transaction.staff.count.mockResolvedValue(0)

      await expect(service.softDelete('staff-1')).rejects.toThrow(LastAdminException)
      expect(transaction.staff.update).not.toHaveBeenCalled()
    })

    it('stamps deletedAt and revokes every session in the same transaction', async () => {
      transaction.staff.findFirst.mockResolvedValue(
        buildStaffWithRole({ id: 'staff-1' }, { name: 'MODERATOR', builtIn: true }) as never,
      )
      transaction.staff.update.mockResolvedValue(buildRawStaff({ deletedAt: new Date() }) as never)

      await service.softDelete('staff-1')

      expect(transaction.staff.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'staff-1' },
          data: expect.objectContaining({ deletedAt: expect.any(Date) }),
        }),
      )
      expect(transaction.staffSession.deleteMany).toHaveBeenCalledWith({
        where: { staffId: 'staff-1' },
      })
    })
  })

  describe('findAll', () => {
    it('orders by createdAt desc with an id tie-break when no sort is given', async () => {
      prisma.staff.findMany.mockResolvedValue([] as never)
      prisma.staff.count.mockResolvedValue(0)

      await service.findAll({})

      const call = prisma.staff.findMany.mock.calls[0]?.[0]
      expect(call?.orderBy).toEqual([{ createdAt: 'desc' }, { id: 'desc' }])
    })

    it('orders by the chosen field with a matching-direction id tie-break', async () => {
      prisma.staff.findMany.mockResolvedValue([] as never)
      prisma.staff.count.mockResolvedValue(0)

      await service.findAll({ sort: 'email', order: 'asc' })

      const call = prisma.staff.findMany.mock.calls[0]?.[0]
      expect(call?.orderBy).toEqual([{ email: 'asc' }, { id: 'asc' }])
    })
  })
})
