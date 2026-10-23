import { beforeEach, describe, expect, it } from '@jest/globals'
import { ProtectedPermissionException } from '@modules/admin-auth'
import type { TokenService } from '@modules/tokens/token.service'
import { ConflictException, NotFoundException } from '@nestjs/common'
import { Prisma } from '@prisma/client'
import { type PrismaMock, prismaMock, resetPrismaMock } from '@test/mocks'
import { type DeepMockProxy, mockDeep } from 'jest-mock-extended'
import { buildRawStaff, buildStaffWithRole } from './__tests__/fixtures/admin-staff.fixtures'
import { AdminStaffService } from './admin-staff.service'
import { LastAdminException, StaffNotFoundException } from './errors'

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
    prisma.$transaction.mockImplementation(async (callback: unknown) =>
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

    it('maps a unique-constraint race on insert to ConflictException, not a 500', async () => {
      prisma.role.findUnique.mockResolvedValue({
        id: 'role-moderator',
        builtIn: false,
        name: 'Support',
        permissions: ['tracks:read'],
      } as never)
      prisma.staff.findUnique.mockResolvedValue(null)
      transaction.staff.create.mockRejectedValue(
        new Prisma.PrismaClientKnownRequestError('Unique constraint failed', {
          code: 'P2002',
          clientVersion: 'test',
        }),
      )

      await expect(service.create(dto as never, ACTOR_ID)).rejects.toThrow(ConflictException)
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
