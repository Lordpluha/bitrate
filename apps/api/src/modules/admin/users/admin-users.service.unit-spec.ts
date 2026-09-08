import { beforeEach, describe, expect, it } from '@jest/globals'
import { type PrismaMock, prismaMock, resetPrismaMock } from '@test/mocks'
import { buildAdminUser, buildUser } from './__tests__/fixtures/admin-users.fixtures'
import { AdminUsersService } from './admin-users.service'
import { UserNotFoundException } from './errors'

describe('AdminUsersService', () => {
  let service: AdminUsersService
  let prisma: PrismaMock

  beforeEach(() => {
    resetPrismaMock()
    prisma = prismaMock
    service = new AdminUsersService(prisma)
  })

  describe('findAll', () => {
    it('returns a paginated page filtered by q', async () => {
      const user = buildAdminUser()
      prisma.user.findMany.mockResolvedValue([user] as never)
      prisma.user.count.mockResolvedValue(1)

      const result = await service.findAll({ page: 2, limit: 5, q: 'listen' })

      expect(result).toEqual({ data: [user], total: 1, page: 2, limit: 5 })
      expect(prisma.user.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ deletedAt: null }),
          skip: 5,
          take: 5,
        }),
      )
    })

    it('returns an empty page when nothing matches', async () => {
      prisma.user.findMany.mockResolvedValue([] as never)
      prisma.user.count.mockResolvedValue(0)

      const result = await service.findAll({})

      expect(result).toEqual({ data: [], total: 0, page: 1, limit: 20 })
    })
  })

  describe('findById', () => {
    it('throws UserNotFoundException when the user does not exist', async () => {
      prisma.user.findFirst.mockResolvedValue(null)

      await expect(service.findById('missing')).rejects.toThrow(UserNotFoundException)
    })

    it('returns the user when found', async () => {
      const user = buildAdminUser()
      prisma.user.findFirst.mockResolvedValue(user as never)

      await expect(service.findById('user-1')).resolves.toEqual(user)
    })
  })

  describe('softDelete', () => {
    it('throws UserNotFoundException when the user does not exist', async () => {
      prisma.user.findFirst.mockResolvedValue(null)

      await expect(service.softDelete('missing')).rejects.toThrow(UserNotFoundException)
    })

    it('stamps deletedAt instead of physically deleting', async () => {
      prisma.user.findFirst.mockResolvedValue(buildUser() as never)
      prisma.user.update.mockResolvedValue(buildAdminUser({ deletedAt: new Date() }) as never)

      await service.softDelete('user-1')

      const call = prisma.user.update.mock.calls[0]?.[0]
      expect(call?.where).toEqual({ id: 'user-1' })
      expect(call?.data.deletedAt).toBeInstanceOf(Date)
    })
  })
})
