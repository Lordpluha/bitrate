import { beforeEach, describe, expect, it } from '@jest/globals'
import { ProtectedPermissionException, UnknownPermissionException } from '@modules/admin-auth'
import type { Prisma } from '@prisma/client'
import { type PrismaMock, prismaMock, resetPrismaMock } from '@test/mocks'
import { type DeepMockProxy, mockDeep } from 'jest-mock-extended'
import { buildRawStaff, buildStaffWithRole } from './__tests__/fixtures/admin-staff.fixtures'
import { AdminStaffPermissionsService } from './admin-staff-permissions.service'
import {
  LastAdminException,
  StaffNotFoundException,
  SuperAdminPermissionsException,
} from './errors'

const ACTOR_ID = 'staff-actor-1'

describe('AdminStaffPermissionsService', () => {
  let service: AdminStaffPermissionsService
  let prisma: PrismaMock
  let transaction: DeepMockProxy<Prisma.TransactionClient>

  beforeEach(() => {
    resetPrismaMock()
    prisma = prismaMock
    transaction = mockDeep<Prisma.TransactionClient>()
    prisma.$transaction.mockImplementation(async (callback: unknown) =>
      (callback as (client: Prisma.TransactionClient) => unknown)(transaction),
    )
    service = new AdminStaffPermissionsService(prisma)
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
})
