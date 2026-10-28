import { beforeEach, describe, expect, it } from '@jest/globals'
import { type PrismaMock, prismaMock, resetPrismaMock } from '@test/mocks'
import { NotificationsService } from './notifications.service'

describe('NotificationsService', () => {
  let service: NotificationsService
  let prisma: PrismaMock

  beforeEach(() => {
    resetPrismaMock()
    prisma = prismaMock
    service = new NotificationsService(prisma)
  })

  describe('follow', () => {
    it('tells the followed user who followed them', async () => {
      prisma.userFollow.findUnique.mockResolvedValue({ followerId: 'a' } as never)
      prisma.user.findFirst.mockResolvedValue({ id: 'a', username: 'ana' } as never)
      prisma.notification.findFirst.mockResolvedValue(null)

      await service.notifyFollow({ followerId: 'a', followingId: 'b' })

      expect(prisma.notification.create).toHaveBeenCalledWith({
        data: {
          userId: 'b',
          type: 'FOLLOW',
          title: 'New follower',
          body: 'ana started following you',
          payload: { actorId: 'a', actorUsername: 'ana' },
        },
      })
    })

    it('skips a follow that was undone before the job ran', async () => {
      prisma.userFollow.findUnique.mockResolvedValue(null)

      await service.notifyFollow({ followerId: 'a', followingId: 'b' })

      expect(prisma.notification.create).not.toHaveBeenCalled()
    })

    it('does not repeat an unread follow notification from the same person', async () => {
      prisma.userFollow.findUnique.mockResolvedValue({ followerId: 'a' } as never)
      prisma.user.findFirst.mockResolvedValue({ id: 'a', username: 'ana' } as never)
      prisma.notification.findFirst.mockResolvedValue({ id: 'n1' } as never)

      await service.notifyFollow({ followerId: 'a', followingId: 'b' })

      expect(prisma.notification.findFirst).toHaveBeenCalledWith({
        where: {
          userId: 'b',
          type: 'FOLLOW',
          readAt: null,
          payload: { path: ['actorId'], equals: 'a' },
        },
        select: { id: true },
      })
      expect(prisma.notification.create).not.toHaveBeenCalled()
    })
  })

  describe('new release', () => {
    const track = {
      id: 't1',
      title: 'Night Signal',
      processingStatus: 'READY',
      deletedAt: null,
      artist: { id: 'ar1', username: 'Mira Sol', deletedAt: null },
    }

    it('notifies every follower of the artist who was not notified yet', async () => {
      prisma.track.findFirst.mockResolvedValue(track as never)
      prisma.userFollowedArtist.findMany.mockResolvedValue([
        { userId: 'u1' },
        { userId: 'u2' },
      ] as never)
      prisma.notification.findMany.mockResolvedValue([{ userId: 'u2' }] as never)
      prisma.notification.createMany.mockResolvedValue({ count: 1 })

      await service.notifyNewRelease({ trackId: 't1' })

      expect(prisma.userFollowedArtist.findMany).toHaveBeenCalledWith({
        where: { artistId: 'ar1', user: { deletedAt: null } },
        select: { userId: true },
      })
      expect(prisma.notification.findMany).toHaveBeenCalledWith({
        where: {
          type: 'NEW_RELEASE',
          userId: { in: ['u1', 'u2'] },
          payload: { path: ['trackId'], equals: 't1' },
        },
        select: { userId: true },
      })
      expect(prisma.notification.createMany).toHaveBeenCalledWith({
        data: [
          {
            userId: 'u1',
            type: 'NEW_RELEASE',
            title: 'New release from Mira Sol',
            body: 'Night Signal',
            payload: {
              trackId: 't1',
              trackTitle: 'Night Signal',
              artistId: 'ar1',
              artistName: 'Mira Sol',
            },
          },
        ],
      })
    })

    it('skips a track that is not playable or was removed', async () => {
      prisma.track.findFirst.mockResolvedValue(null)

      await service.notifyNewRelease({ trackId: 't1' })

      expect(prisma.track.findFirst).toHaveBeenCalledWith({
        where: {
          id: 't1',
          processingStatus: 'READY',
          publishedAt: { not: null },
          deletedAt: null,
          artist: { deletedAt: null },
        },
        select: { id: true, title: true, artist: { select: { id: true, username: true } } },
      })
      expect(prisma.notification.createMany).not.toHaveBeenCalled()
    })

    it('does nothing for an artist without followers', async () => {
      prisma.track.findFirst.mockResolvedValue(track as never)
      prisma.userFollowedArtist.findMany.mockResolvedValue([])

      await service.notifyNewRelease({ trackId: 't1' })

      expect(prisma.notification.createMany).not.toHaveBeenCalled()
    })
  })

  describe('friends', () => {
    it('tells the receiver who sent a pending friend request', async () => {
      prisma.friendRequest.findFirst.mockResolvedValue({
        receiverId: 'b',
        sender: { id: 'a', username: 'ana' },
      } as never)
      prisma.notification.findFirst.mockResolvedValue(null)

      await service.notifyFriendRequest({ requestId: 'r1' })

      expect(prisma.notification.create).toHaveBeenCalledWith({
        data: {
          userId: 'b',
          type: 'FRIEND_REQUEST',
          title: 'Friend request',
          body: 'ana wants to be friends',
          payload: { actorId: 'a', actorUsername: 'ana', requestId: 'r1' },
        },
      })
    })

    it('skips a request that was answered or cancelled before the job ran', async () => {
      prisma.friendRequest.findFirst.mockResolvedValue(null)

      await service.notifyFriendRequest({ requestId: 'r1' })

      expect(prisma.notification.create).not.toHaveBeenCalled()
    })

    it('notifies about one request only once', async () => {
      prisma.friendRequest.findFirst.mockResolvedValue({
        receiverId: 'b',
        sender: { id: 'a', username: 'ana' },
      } as never)
      prisma.notification.findFirst.mockResolvedValue({ id: 'n1' } as never)

      await service.notifyFriendRequest({ requestId: 'r1' })

      expect(prisma.notification.create).not.toHaveBeenCalled()
    })

    it('tells the requester their request was accepted, looking the pair up in order', async () => {
      prisma.friendship.findUnique.mockResolvedValue({ userAId: 'a' } as never)
      prisma.user.findFirst.mockResolvedValue({ id: 'b', username: 'bo' } as never)
      prisma.notification.findFirst.mockResolvedValue(null)

      await service.notifyFriendAccepted({ accepterId: 'b', requesterId: 'a' })

      expect(prisma.friendship.findUnique).toHaveBeenCalledWith({
        where: { userAId_userBId: { userAId: 'a', userBId: 'b' } },
        select: { userAId: true },
      })
      expect(prisma.notification.create).toHaveBeenCalledWith({
        data: {
          userId: 'a',
          type: 'FRIEND_ACCEPTED',
          title: 'Friend request accepted',
          body: 'bo accepted your friend request',
          payload: { actorId: 'b', actorUsername: 'bo' },
        },
      })
    })

    it('skips an acceptance when the friendship is already gone', async () => {
      prisma.friendship.findUnique.mockResolvedValue(null)

      await service.notifyFriendAccepted({ accepterId: 'b', requesterId: 'a' })

      expect(prisma.notification.create).not.toHaveBeenCalled()
    })
  })
})
