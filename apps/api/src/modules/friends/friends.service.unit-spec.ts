import { beforeEach, describe, expect, it, jest } from '@jest/globals'
import type { NotificationsProducer } from '@modules/notifications'
import { BadRequestException, ConflictException, NotFoundException } from '@nestjs/common'
import { Prisma } from '@prisma/client'
import { mockTransaction, type PrismaMock, prismaMock, resetPrismaMock } from '@test/mocks'
import { FRIEND_ERRORS } from './errors/friend.errors'
import { FriendsService } from './friends.service'

const ME = 'b0000000-0000-7000-8000-000000000002'
const ANA = 'a0000000-0000-7000-8000-000000000001'
const CAI = 'c0000000-0000-7000-8000-000000000003'
const NOW = new Date('2026-10-19T12:00:00.000Z')

const user = (id: string, username: string) => ({
  avatar: null,
  createdAt: NOW,
  description: null,
  id,
  updatedAt: NOW,
  username,
})

describe('FriendsService', () => {
  let service: FriendsService
  let prisma: PrismaMock
  let producer: jest.Mocked<NotificationsProducer>

  beforeEach(() => {
    resetPrismaMock()
    prisma = prismaMock
    mockTransaction(prisma)
    producer = {
      friendAccepted: jest.fn(async () => undefined),
      friendRequested: jest.fn(async () => undefined),
    } as unknown as jest.Mocked<NotificationsProducer>
    service = new FriendsService(prisma, producer)
  })

  describe('sendRequest', () => {
    const receiverExists = () => prisma.user.findFirst.mockResolvedValue({ id: ANA } as never)

    it('rejects a request to yourself', async () => {
      await expect(service.sendRequest(ME, ME)).rejects.toEqual(
        new BadRequestException(FRIEND_ERRORS.SELF),
      )
    })

    it('rejects a request to a missing or deleted user', async () => {
      prisma.user.findFirst.mockResolvedValue(null)

      await expect(service.sendRequest(ME, ANA)).rejects.toBeInstanceOf(NotFoundException)
      expect(prisma.user.findFirst).toHaveBeenCalledWith({
        where: { id: ANA, deletedAt: null },
        select: { id: true },
      })
    })

    it('rejects a request to an existing friend', async () => {
      receiverExists()
      prisma.friendship.findUnique.mockResolvedValue({ userAId: ANA } as never)

      await expect(service.sendRequest(ME, ANA)).rejects.toEqual(
        new ConflictException(FRIEND_ERRORS.ALREADY_FRIENDS),
      )
      expect(prisma.friendship.findUnique).toHaveBeenCalledWith({
        where: { userAId_userBId: { userAId: ANA, userBId: ME } },
        select: { userAId: true },
      })
    })

    it('accepts their request instead when they already asked you', async () => {
      receiverExists()
      prisma.friendship.findUnique.mockResolvedValue(null)
      prisma.friendRequest.findUnique.mockImplementation((async (args: {
        where: { senderId_receiverId: { senderId: string } }
      }) =>
        args.where.senderId_receiverId.senderId === ANA
          ? { id: 'r-theirs', receiverId: ME, senderId: ANA }
          : null) as never)

      await expect(service.sendRequest(ME, ANA)).resolves.toEqual({ status: 'accepted' })
      expect(prisma.friendship.upsert).toHaveBeenCalledWith({
        where: { userAId_userBId: { userAId: ANA, userBId: ME } },
        create: { userAId: ANA, userBId: ME },
        update: {},
      })
      expect(producer.friendAccepted).toHaveBeenCalledWith({ accepterId: ME, requesterId: ANA })
      expect(prisma.friendRequest.create).not.toHaveBeenCalled()
    })

    it('returns the pending request when you already sent one', async () => {
      receiverExists()
      prisma.friendship.findUnique.mockResolvedValue(null)
      const mine = { createdAt: NOW, id: 'r-mine' }
      prisma.friendRequest.findUnique.mockImplementation((async (args: {
        where: { senderId_receiverId: { senderId: string } }
      }) => (args.where.senderId_receiverId.senderId === ME ? mine : null)) as never)

      await expect(service.sendRequest(ME, ANA)).resolves.toEqual({
        request: { createdAt: NOW, id: 'r-mine' },
        status: 'pending',
      })
      expect(prisma.friendRequest.create).not.toHaveBeenCalled()
      expect(producer.friendRequested).not.toHaveBeenCalled()
    })

    it('creates a request and queues its notification', async () => {
      receiverExists()
      prisma.friendship.findUnique.mockResolvedValue(null)
      prisma.friendRequest.findUnique.mockResolvedValue(null)
      prisma.friendRequest.create.mockResolvedValue({ createdAt: NOW, id: 'r-new' } as never)

      await expect(service.sendRequest(ME, ANA)).resolves.toEqual({
        request: { createdAt: NOW, id: 'r-new' },
        status: 'pending',
      })
      expect(prisma.friendRequest.create).toHaveBeenCalledWith({
        data: { receiverId: ANA, senderId: ME },
        select: { createdAt: true, id: true },
      })
      expect(producer.friendRequested).toHaveBeenCalledWith({ requestId: 'r-new' })
    })

    it('keeps the request when the notification queue is down', async () => {
      receiverExists()
      prisma.friendship.findUnique.mockResolvedValue(null)
      prisma.friendRequest.findUnique.mockResolvedValue(null)
      prisma.friendRequest.create.mockResolvedValue({ createdAt: NOW, id: 'r-new' } as never)
      producer.friendRequested.mockRejectedValue(new Error('redis down'))

      await expect(service.sendRequest(ME, ANA)).resolves.toMatchObject({ status: 'pending' })
    })

    it('returns the request a concurrent call created first', async () => {
      receiverExists()
      prisma.friendship.findUnique.mockResolvedValue(null)
      prisma.friendRequest.findUnique
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce({ createdAt: NOW, id: 'r-race' } as never)
      prisma.friendRequest.create.mockRejectedValue(
        new Prisma.PrismaClientKnownRequestError('Unique constraint failed', {
          clientVersion: 'test',
          code: 'P2002',
        }),
      )

      await expect(service.sendRequest(ME, ANA)).resolves.toEqual({
        request: { createdAt: NOW, id: 'r-race' },
        status: 'pending',
      })
    })
  })

  describe('answering requests', () => {
    it('accepts a request sent to you: befriends, clears both directions, notifies', async () => {
      prisma.friendRequest.findFirst.mockResolvedValue({ id: 'r1', senderId: ANA } as never)

      await service.accept(ME, 'r1')

      expect(prisma.friendRequest.findFirst).toHaveBeenCalledWith({
        where: { id: 'r1', receiverId: ME, sender: { deletedAt: null } },
        select: { id: true, senderId: true },
      })
      expect(prisma.friendship.upsert).toHaveBeenCalledWith({
        where: { userAId_userBId: { userAId: ANA, userBId: ME } },
        create: { userAId: ANA, userBId: ME },
        update: {},
      })
      expect(prisma.friendRequest.deleteMany).toHaveBeenCalledWith({
        where: {
          OR: [
            { receiverId: ME, senderId: ANA },
            { receiverId: ANA, senderId: ME },
          ],
        },
      })
      expect(producer.friendAccepted).toHaveBeenCalledWith({ accepterId: ME, requesterId: ANA })
    })

    it('does not let you accept a request that is not addressed to you', async () => {
      prisma.friendRequest.findFirst.mockResolvedValue(null)

      await expect(service.accept(ME, 'r1')).rejects.toEqual(
        new NotFoundException(FRIEND_ERRORS.REQUEST_NOT_FOUND),
      )
      expect(prisma.friendship.upsert).not.toHaveBeenCalled()
    })

    it('declines only requests addressed to you', async () => {
      prisma.friendRequest.deleteMany.mockResolvedValue({ count: 0 })

      await expect(service.decline(ME, 'r1')).rejects.toBeInstanceOf(NotFoundException)
      expect(prisma.friendRequest.deleteMany).toHaveBeenCalledWith({
        where: { id: 'r1', receiverId: ME },
      })
    })

    it('cancels only requests you sent', async () => {
      prisma.friendRequest.deleteMany.mockResolvedValue({ count: 1 })

      await service.cancel(ME, 'r1')

      expect(prisma.friendRequest.deleteMany).toHaveBeenCalledWith({
        where: { id: 'r1', senderId: ME },
      })
    })
  })

  it('removes a friendship by its ordered pair', async () => {
    await service.removeFriend(ME, ANA)

    expect(prisma.friendship.deleteMany).toHaveBeenCalledWith({
      where: { userAId: ANA, userBId: ME },
    })
  })

  describe('listFriends', () => {
    const friend = (
      other: ReturnType<typeof user>,
      activity: {
        devices?: Array<{ lastSeenAt: Date }>
        playerState?: unknown
        settings?: unknown
      },
    ) => ({
      ...other,
      devices: activity.devices ?? [],
      playerState: activity.playerState ?? null,
      settings: activity.settings ?? null,
    })

    /** Answers each side's query: rows where the caller is userA carry userB, and vice versa. */
    const friendshipsOf = (
      asUserA: Array<{ createdAt: Date; userB: unknown }>,
      asUserB: Array<{ createdAt: Date; userA: unknown }>,
    ) =>
      prisma.friendship.findMany.mockImplementation(((args: { where: { userAId?: string } }) =>
        Promise.resolve(args.where.userAId ? asUserA : asUserB)) as never)

    it('puts listening friends first, then online, then the rest, with private tracks hidden', async () => {
      jest.useFakeTimers({ now: NOW })
      const track = {
        artist: { id: 'ar1', username: 'Luma Vale' },
        cover: null,
        deletedAt: null,
        id: 't1',
        processingStatus: 'READY',
        publishedAt: new Date('2026-01-01T00:00:00.000Z'),
        title: 'Afterglow',
      }
      // ANA < ME < CAI: the caller is userB of the friendship with Ana, userA of Cai's.
      friendshipsOf(
        [
          {
            createdAt: NOW,
            userB: friend(user(CAI, 'cai'), {
              playerState: { currentTrack: track, isPlaying: true, updatedAt: NOW },
              settings: { privateSession: false, showListeningActivity: true },
            }),
          },
        ],
        [
          {
            createdAt: NOW,
            userA: friend(user(ANA, 'ana'), {
              devices: [{ lastSeenAt: new Date(NOW.getTime() - 3_600_000) }],
            }),
          },
        ],
      )

      const friends = await service.listFriends(ME)

      jest.useRealTimers()
      expect(
        friends.map((f) => [f.user.username, f.presence.status, f.presence.nowPlaying?.id]),
      ).toEqual([
        ['cai', 'online', 't1'],
        ['ana', 'offline', undefined],
      ])
      expect(friends[0]?.user).toEqual(user(CAI, 'cai'))
    })

    it('loads only the other side of each friendship and leaves deleted accounts out in the query', async () => {
      friendshipsOf([], [])

      await service.listFriends(ME)

      expect(prisma.friendship.findMany).toHaveBeenCalledTimes(2)
      expect(prisma.friendship.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { userAId: ME, userB: { deletedAt: null } },
          orderBy: [{ createdAt: 'asc' }, { userBId: 'asc' }],
          select: { createdAt: true, userB: expect.any(Object) },
        }),
      )
      expect(prisma.friendship.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { userBId: ME, userA: { deletedAt: null } },
          orderBy: [{ createdAt: 'asc' }, { userAId: 'asc' }],
          select: { createdAt: true, userA: expect.any(Object) },
        }),
      )
    })
  })

  describe('listRequests', () => {
    it('lists incoming requests with their senders', async () => {
      prisma.friendRequest.findMany.mockResolvedValue([
        { createdAt: NOW, id: 'r1', sender: user(ANA, 'ana') },
      ] as never)

      await expect(service.listRequests(ME, 'incoming')).resolves.toEqual([
        { createdAt: NOW, id: 'r1', user: user(ANA, 'ana') },
      ])
      expect(prisma.friendRequest.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { receiverId: ME, sender: { deletedAt: null } },
        }),
      )
    })
  })
})
