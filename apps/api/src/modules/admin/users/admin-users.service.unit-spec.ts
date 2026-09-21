import { beforeEach, describe, expect, it } from '@jest/globals'
import type { Prisma } from '@prisma/client'
import { type PrismaMock, prismaMock, resetPrismaMock } from '@test/mocks'
import { type DeepMockProxy, mockDeep } from 'jest-mock-extended'
import { buildAdminUser, buildUser } from './__tests__/fixtures/admin-users.fixtures'
import { AdminUsersService } from './admin-users.service'
import {
  UserAlreadyDeletedException,
  UserNotDeletedException,
  UserNotFoundException,
} from './errors'

const STAFF_ID = 'staff-1'

describe('AdminUsersService', () => {
  let service: AdminUsersService
  let prisma: PrismaMock
  let transaction: DeepMockProxy<Prisma.TransactionClient>

  beforeEach(() => {
    resetPrismaMock()
    prisma = prismaMock
    transaction = mockDeep<Prisma.TransactionClient>()
    prisma.$transaction.mockImplementation((callback: unknown) =>
      (callback as (client: Prisma.TransactionClient) => unknown)(transaction),
    )
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

    it('orders by createdAt desc with an id tie-break when no sort is given', async () => {
      prisma.user.findMany.mockResolvedValue([] as never)
      prisma.user.count.mockResolvedValue(0)

      await service.findAll({})

      const call = prisma.user.findMany.mock.calls[0]?.[0]
      expect(call?.orderBy).toEqual([{ createdAt: 'desc' }, { id: 'desc' }])
    })

    it('orders by the chosen field with a matching-direction id tie-break', async () => {
      prisma.user.findMany.mockResolvedValue([] as never)
      prisma.user.count.mockResolvedValue(0)

      await service.findAll({ sort: 'username', order: 'desc' })

      const call = prisma.user.findMany.mock.calls[0]?.[0]
      expect(call?.orderBy).toEqual([{ username: 'desc' }, { id: 'desc' }])
    })

    it('status=deactivated filters to only soft-deleted users', async () => {
      prisma.user.findMany.mockResolvedValue([] as never)
      prisma.user.count.mockResolvedValue(0)

      await service.findAll({ status: 'deactivated' })

      const call = prisma.user.findMany.mock.calls[0]?.[0]
      expect(call?.where).toEqual({ deletedAt: { not: null } })
    })

    it('status=all drops the deletedAt filter entirely', async () => {
      prisma.user.findMany.mockResolvedValue([] as never)
      prisma.user.count.mockResolvedValue(0)

      await service.findAll({ status: 'all' })

      const call = prisma.user.findMany.mock.calls[0]?.[0]
      expect(call?.where).toEqual({})
    })
  })

  describe('findById', () => {
    it('throws UserNotFoundException when the user does not exist', async () => {
      prisma.user.findFirst.mockResolvedValue(null)

      await expect(service.findById('missing')).rejects.toThrow(UserNotFoundException)
    })

    it('returns the user with activity counts when found', async () => {
      const user = buildAdminUser()
      prisma.user.findFirst.mockResolvedValue(user as never)
      prisma.playlist.count.mockResolvedValue(2)
      prisma.userLikedTrack.count.mockResolvedValue(10)
      prisma.listeningHistory.count.mockResolvedValue(50)
      prisma.moderationReport.count.mockResolvedValue(1)
      prisma.userSession.count.mockResolvedValue(3)

      const result = await service.findById('user-1')

      expect(result).toMatchObject({
        ...user,
        counts: {
          playlists: 2,
          likedTracks: 10,
          listeningHistory: 50,
          reportsFiled: 1,
          activeSessions: 3,
        },
      })
      expect(prisma.playlist.count).toHaveBeenCalledWith({
        where: { userId: 'user-1', deletedAt: null },
      })
    })

    it('does not filter deletedAt — a deactivated user stays reachable by id', async () => {
      const user = buildAdminUser({ deletedAt: new Date() })
      prisma.user.findFirst.mockResolvedValue(user as never)
      prisma.playlist.count.mockResolvedValue(0)
      prisma.userLikedTrack.count.mockResolvedValue(0)
      prisma.listeningHistory.count.mockResolvedValue(0)
      prisma.moderationReport.count.mockResolvedValue(0)
      prisma.userSession.count.mockResolvedValue(0)

      await service.findById('user-1')

      expect(prisma.user.findFirst).toHaveBeenCalledWith(
        expect.objectContaining({ where: { id: 'user-1' } }),
      )
    })
  })

  describe('findListeningHistory', () => {
    it('throws UserNotFoundException when the user does not exist', async () => {
      prisma.user.findFirst.mockResolvedValue(null)

      await expect(service.findListeningHistory('missing', {})).rejects.toThrow(
        UserNotFoundException,
      )
    })

    it('returns an empty page for a user with no history — not a 404', async () => {
      prisma.user.findFirst.mockResolvedValue(buildUser() as never)
      prisma.listeningHistory.findMany.mockResolvedValue([] as never)
      prisma.listeningHistory.count.mockResolvedValue(0)

      const result = await service.findListeningHistory('user-1', {})

      expect(result).toEqual({ data: [], total: 0, page: 1, limit: 20 })
    })

    it('flattens each row to its track identity, newest first', async () => {
      prisma.user.findFirst.mockResolvedValue(buildUser() as never)
      prisma.listeningHistory.findMany.mockResolvedValue([
        {
          id: 'lh-1',
          listenedAt: new Date('2026-09-17T00:00:00.000Z'),
          track: { id: 'track-1', title: 'Track One', artist: { username: 'artist-one' } },
        },
      ] as never)
      prisma.listeningHistory.count.mockResolvedValue(1)

      const result = await service.findListeningHistory('user-1', { page: 2, limit: 5 })

      expect(result).toEqual({
        data: [
          {
            id: 'lh-1',
            listenedAt: new Date('2026-09-17T00:00:00.000Z'),
            trackId: 'track-1',
            trackTitle: 'Track One',
            artistUsername: 'artist-one',
          },
        ],
        total: 1,
        page: 2,
        limit: 5,
      })
      expect(prisma.listeningHistory.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { userId: 'user-1' },
          skip: 5,
          take: 5,
          orderBy: [{ listenedAt: 'desc' }, { id: 'desc' }],
        }),
      )
    })
  })

  describe('softDelete', () => {
    it('throws UserNotFoundException when the user does not exist', async () => {
      prisma.user.findFirst.mockResolvedValue(null)

      await expect(service.softDelete('missing', STAFF_ID)).rejects.toThrow(UserNotFoundException)
    })

    it('throws UserAlreadyDeletedException when the user is already deleted', async () => {
      prisma.user.findFirst.mockResolvedValue(buildUser({ deletedAt: new Date() }) as never)

      await expect(service.softDelete('user-1', STAFF_ID)).rejects.toThrow(
        UserAlreadyDeletedException,
      )
    })

    /** A second concurrent take-down loses the `updateMany` race and must fail 409 — the same
     * response as an already-deleted user — instead of silently re-deleting. */
    it('throws UserAlreadyDeletedException when a concurrent request wins the race', async () => {
      prisma.user.findFirst.mockResolvedValue(buildUser({ deletedAt: null }) as never)
      transaction.user.updateMany.mockResolvedValue({ count: 0 })

      await expect(service.softDelete('user-1', STAFF_ID)).rejects.toThrow(
        UserAlreadyDeletedException,
      )
      expect(transaction.auditLog.create).not.toHaveBeenCalled()
    })

    it('stamps deletedAt, revokes sessions, and writes an audit row, in one transaction', async () => {
      prisma.user.findFirst.mockResolvedValue(buildUser({ deletedAt: null }) as never)
      transaction.user.updateMany.mockResolvedValue({ count: 1 })
      transaction.userSession.deleteMany.mockResolvedValue({ count: 2 } as never)
      transaction.user.findFirstOrThrow.mockResolvedValue(
        buildAdminUser({ deletedAt: new Date() }) as never,
      )

      await service.softDelete('user-1', STAFF_ID, 'abuse report')

      expect(transaction.user.updateMany).toHaveBeenCalledWith({
        where: { id: 'user-1', deletedAt: null },
        data: { deletedAt: expect.any(Date) },
      })
      expect(transaction.userSession.deleteMany).toHaveBeenCalledWith({
        where: { userId: 'user-1' },
      })
      expect(transaction.auditLog.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            action: 'admin-users.delete',
            metadata: expect.objectContaining({
              reason: 'abuse report',
              after: expect.objectContaining({ sessionsRevoked: 2 }),
            }),
          }),
        }),
      )
    })
  })

  describe('restore', () => {
    it('throws UserNotFoundException when the user does not exist', async () => {
      prisma.user.findFirst.mockResolvedValue(null)

      await expect(service.restore('missing', STAFF_ID)).rejects.toThrow(UserNotFoundException)
    })

    it('throws UserNotDeletedException when the user is not deleted', async () => {
      prisma.user.findFirst.mockResolvedValue(buildUser({ deletedAt: null }) as never)

      await expect(service.restore('user-1', STAFF_ID)).rejects.toThrow(UserNotDeletedException)
    })

    /** A second concurrent restore loses the `updateMany` race and must fail 409, not 404. */
    it('throws UserNotDeletedException when a concurrent request wins the race', async () => {
      prisma.user.findFirst.mockResolvedValue(buildUser({ deletedAt: new Date() }) as never)
      transaction.user.updateMany.mockResolvedValue({ count: 0 })

      await expect(service.restore('user-1', STAFF_ID)).rejects.toThrow(UserNotDeletedException)
      expect(transaction.auditLog.create).not.toHaveBeenCalled()
    })

    it('clears deletedAt', async () => {
      prisma.user.findFirst.mockResolvedValue(buildUser({ deletedAt: new Date() }) as never)
      transaction.user.updateMany.mockResolvedValue({ count: 1 })
      transaction.user.findFirstOrThrow.mockResolvedValue(
        buildAdminUser({ deletedAt: null }) as never,
      )

      await service.restore('user-1', STAFF_ID)

      expect(transaction.user.updateMany).toHaveBeenCalledWith({
        where: { id: 'user-1', deletedAt: { not: null } },
        data: { deletedAt: null },
      })
    })
  })

  describe('revokeSessions', () => {
    it('throws UserNotFoundException when the user does not exist', async () => {
      prisma.user.findFirst.mockResolvedValue(null)

      await expect(service.revokeSessions('missing', STAFF_ID)).rejects.toThrow(
        UserNotFoundException,
      )
    })

    it('deletes every session and returns the revoked count', async () => {
      prisma.user.findFirst.mockResolvedValue(buildUser() as never)
      transaction.userSession.deleteMany.mockResolvedValue({ count: 4 } as never)

      const result = await service.revokeSessions('user-1', STAFF_ID)

      expect(transaction.userSession.deleteMany).toHaveBeenCalledWith({
        where: { userId: 'user-1' },
      })
      expect(result).toEqual({ revoked: 4 })
      expect(transaction.auditLog.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ action: 'admin-users.revoke-sessions' }),
        }),
      )
    })
  })
})
