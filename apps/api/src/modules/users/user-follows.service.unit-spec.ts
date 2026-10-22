import { beforeEach, describe, expect, it, jest } from '@jest/globals'
import type { NotificationsProducer } from '@modules/notifications'
import { ForbiddenException, NotFoundException } from '@nestjs/common'
import type { Prisma } from '@prisma/client'
import { type PrismaMock, prismaMock, resetPrismaMock } from '@test/mocks'
import { buildUser } from './__tests__/fixtures/users.fixtures'
import { UserFollowsService } from './user-follows.service'
import { PUBLIC_USER_SELECT } from './users.select'

describe('UserFollowsService', () => {
  let service: UserFollowsService
  let prisma: PrismaMock
  let producer: jest.Mocked<NotificationsProducer>

  beforeEach(() => {
    resetPrismaMock()
    prisma = prismaMock
    producer = {
      followed: jest.fn(async () => undefined),
    } as unknown as jest.Mocked<NotificationsProducer>
    service = new UserFollowsService(prisma, producer)
  })

  it('getFollowing pages whom the caller follows, leaving deleted accounts out', async () => {
    const followed = buildUser({ id: 'user-3' })
    const followedAt = new Date('2026-10-01T00:00:00.000Z')
    prisma.$transaction.mockResolvedValue([[{ following: followed, createdAt: followedAt }], 1])

    const result = await service.getFollowing('user-1', 2, 5)

    expect(prisma.userFollow.findMany).toHaveBeenCalledWith({
      where: { followerId: 'user-1', following: { deletedAt: null } },
      orderBy: [{ createdAt: 'desc' }, { followingId: 'asc' }],
      skip: 5,
      take: 5,
      include: { following: { select: PUBLIC_USER_SELECT } },
    })
    expect(result).toEqual({ data: [{ ...followed, followedAt }], total: 1, page: 2, limit: 5 })
  })

  describe('follower lists', () => {
    const target = 'user-2'

    it('lists who follows a user whose lists are visible', async () => {
      prisma.user.findFirst.mockResolvedValue({ id: target } as never)
      prisma.userSettings.findUnique.mockResolvedValue({ followersVisible: true } as never)
      prisma.$transaction.mockResolvedValue([[], 0] as never)

      const result = await service.listFollows('followers', target, 'viewer-1', 1, 20)

      expect(prisma.userFollow.findMany).toHaveBeenCalledWith({
        where: { followingId: target, follower: { deletedAt: null } },
        orderBy: [{ createdAt: 'desc' }, { followerId: 'asc' }],
        skip: 0,
        take: 20,
        include: { follower: { select: PUBLIC_USER_SELECT } },
      })
      expect(result).toEqual({ data: [], total: 0, page: 1, limit: 20 })
    })

    it('lists whom a user follows', async () => {
      prisma.user.findFirst.mockResolvedValue({ id: target } as never)
      prisma.userSettings.findUnique.mockResolvedValue(null)
      prisma.$transaction.mockResolvedValue([[], 0] as never)

      await service.listFollows('following', target, undefined, 1, 20)

      expect(prisma.userFollow.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { followerId: target, following: { deletedAt: null } },
          include: { following: { select: PUBLIC_USER_SELECT } },
        }),
      )
    })

    it('forbids other people from listing hidden followers', async () => {
      prisma.user.findFirst.mockResolvedValue({ id: target } as never)
      prisma.userSettings.findUnique.mockResolvedValue({ followersVisible: false } as never)

      await expect(
        service.listFollows('followers', target, 'viewer-1', 1, 20),
      ).rejects.toBeInstanceOf(ForbiddenException)
      expect(prisma.userFollow.findMany).not.toHaveBeenCalled()
    })

    it('always lets the owner see their own lists', async () => {
      prisma.user.findFirst.mockResolvedValue({ id: target } as never)
      prisma.$transaction.mockResolvedValue([[], 0] as never)

      await service.listFollows('followers', target, target, 1, 20)

      expect(prisma.userSettings.findUnique).not.toHaveBeenCalled()
      expect(prisma.userFollow.findMany).toHaveBeenCalled()
    })

    it('throws NotFound for an unknown or deleted user', async () => {
      prisma.user.findFirst.mockResolvedValue(null)

      await expect(
        service.listFollows('following', target, undefined, 1, 20),
      ).rejects.toBeInstanceOf(NotFoundException)
    })
  })

  describe('friend activity', () => {
    it('returns each followed person latest listen, newest first, from people who share it', async () => {
      const now = Date.UTC(2026, 9, 14, 12)
      jest.spyOn(Date, 'now').mockReturnValue(now)
      const at = (m: number) => new Date(now - m * 60_000)
      prisma.queryRaw.mockResolvedValue([
        { userId: 'friend-1', trackId: 'track-1', listenedAt: at(5) },
        { userId: 'friend-2', trackId: 'track-2', listenedAt: at(1) },
      ] as never)
      prisma.user.findMany.mockResolvedValue([
        { id: 'friend-1', username: 'one' },
        { id: 'friend-2', username: 'two' },
      ] as never)
      prisma.track.findMany.mockResolvedValue([
        { id: 'track-1', title: 'A' },
        { id: 'track-2', title: 'B' },
      ] as never)

      const result = await service.getFollowingActivity('me-1', 10)

      const query = prisma.queryRaw.mock.calls[0]?.[0] as Prisma.Sql
      const sql = query.strings.join(' ')
      expect(sql).toContain('DISTINCT ON (h."userId")')
      expect(sql).toContain('JOIN "UserFollow" f ON f."followingId" = h."userId"')
      expect(sql).toContain('COALESCE(s."showListeningActivity", true)')
      expect(sql).toContain('u."deletedAt" IS NULL')
      expect(sql).toContain('t."processingStatus" = \'READY\'')
      expect(query.values).toContain('me-1')
      expect(query.values).toContainEqual(new Date(now - 7 * 24 * 60 * 60 * 1000))
      expect(query.values).toContain(10)
      expect(result.map(({ user, track }) => [user.id, track.id])).toEqual([
        ['friend-1', 'track-1'],
        ['friend-2', 'track-2'],
      ])
      jest.restoreAllMocks()
    })
  })

  describe('followUser', () => {
    it('notifies the followed user about a new follow', async () => {
      prisma.user.findFirst.mockResolvedValue({ id: 'b' } as never)
      prisma.userFollow.createMany.mockResolvedValue({ count: 1 })

      await service.followUser('a', 'b')

      expect(prisma.user.findFirst).toHaveBeenCalledWith({
        where: { id: 'b', deletedAt: null },
        select: { id: true },
      })
      expect(prisma.userFollow.createMany).toHaveBeenCalledWith({
        data: [{ followerId: 'a', followingId: 'b' }],
        skipDuplicates: true,
      })
      expect(producer.followed).toHaveBeenCalledWith({ followerId: 'a', followingId: 'b' })
    })

    it('does not notify again for a follow that already existed', async () => {
      prisma.user.findFirst.mockResolvedValue({ id: 'b' } as never)
      prisma.userFollow.createMany.mockResolvedValue({ count: 0 })

      await service.followUser('a', 'b')

      expect(producer.followed).not.toHaveBeenCalled()
    })

    it('rejects following a missing or deleted user without writing', async () => {
      prisma.user.findFirst.mockResolvedValue(null)

      await expect(service.followUser('a', 'b')).rejects.toBeInstanceOf(NotFoundException)
      expect(prisma.userFollow.createMany).not.toHaveBeenCalled()
    })

    it('still follows when the notification cannot be queued', async () => {
      prisma.user.findFirst.mockResolvedValue({ id: 'b' } as never)
      prisma.userFollow.createMany.mockResolvedValue({ count: 1 })
      producer.followed.mockRejectedValue(new Error('redis down'))

      await expect(service.followUser('a', 'b')).resolves.toBeUndefined()
      expect(prisma.userFollow.createMany).toHaveBeenCalled()
    })
  })
})
