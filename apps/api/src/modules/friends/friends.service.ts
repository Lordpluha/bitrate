import { isPrismaP2002 } from '@common/utils/prisma'
import { PrismaService } from '@infra/prisma/prisma.service'
import { NotificationsProducer } from '@modules/notifications'
import {
  BadRequestException,
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common'
import type { Prisma } from '@prisma/client'
import { FRIEND_ERRORS } from './errors/friend.errors'
import { derivePresence, type PresenceStatus } from './friends.presence'

/** What a profile shows about a friend or a requester. Mirrors the users module's public select. */
const PUBLIC_USER_SELECT = {
  id: true,
  username: true,
  createdAt: true,
  description: true,
  avatar: true,
  updatedAt: true,
} as const satisfies Prisma.UserSelect

/** A friend plus the player data their presence is derived from. */
const FRIEND_SELECT = {
  ...PUBLIC_USER_SELECT,
  devices: { orderBy: { lastSeenAt: 'desc' }, take: 1, select: { lastSeenAt: true } },
  playerState: {
    select: {
      isPlaying: true,
      updatedAt: true,
      currentTrack: {
        select: {
          id: true,
          title: true,
          cover: true,
          deletedAt: true,
          processingStatus: true,
          publishedAt: true,
          artist: { select: { id: true, username: true } },
        },
      },
    },
  },
  settings: { select: { privateSession: true, showListeningActivity: true } },
} as const satisfies Prisma.UserSelect

/** Friends listed at most; more than this is not a friend list any more. */
const MAX_FRIENDS = 500
const STATUS_ORDER: Record<PresenceStatus, number> = { online: 0, away: 1, offline: 2 }

export type FriendRequestDirection = 'incoming' | 'outgoing'

/** Friendships are stored once, with the smaller id first. */
const orderedPair = (a: string, b: string) =>
  a < b ? { userAId: a, userBId: b } : { userAId: b, userBId: a }

/**
 * Friend requests and friendships. A friendship is mutual and separate from following: either
 * side can follow anyone, and removing a friend leaves follows as they are.
 */
@Injectable()
export class FriendsService {
  private readonly logger = new Logger(FriendsService.name)

  constructor(
    private readonly prisma: PrismaService,
    private readonly notifications: NotificationsProducer,
  ) {}

  /**
   * Sends a request, or accepts theirs when the other person already asked. Sending twice
   * returns the pending request.
   */
  async sendRequest(senderId: string, receiverId: string) {
    if (senderId === receiverId) throw new BadRequestException(FRIEND_ERRORS.SELF)
    const { receiver, friendship, theirs, mine } = await this.requestContext(senderId, receiverId)
    if (!receiver) throw new NotFoundException(FRIEND_ERRORS.USER_NOT_FOUND)
    if (friendship) throw new ConflictException(FRIEND_ERRORS.ALREADY_FRIENDS)

    if (theirs) {
      await this.befriend(senderId, receiverId)
      return { status: 'accepted' as const }
    }

    if (mine) return { request: mine, status: 'pending' as const }
    return { request: await this.createRequest(senderId, receiverId), status: 'pending' as const }
  }

  /** Accepts a request addressed to the caller. */
  async accept(userId: string, requestId: string) {
    const request = await this.prisma.friendRequest.findFirst({
      where: { id: requestId, receiverId: userId, sender: { deletedAt: null } },
      select: { id: true, senderId: true },
    })
    if (!request) throw new NotFoundException(FRIEND_ERRORS.REQUEST_NOT_FOUND)
    await this.befriend(userId, request.senderId)
  }

  /** Declines a request addressed to the caller. */
  async decline(userId: string, requestId: string) {
    const { count } = await this.prisma.friendRequest.deleteMany({
      where: { id: requestId, receiverId: userId },
    })
    if (!count) throw new NotFoundException(FRIEND_ERRORS.REQUEST_NOT_FOUND)
  }

  /** Withdraws a request the caller sent. */
  async cancel(userId: string, requestId: string) {
    const { count } = await this.prisma.friendRequest.deleteMany({
      where: { id: requestId, senderId: userId },
    })
    if (!count) throw new NotFoundException(FRIEND_ERRORS.REQUEST_NOT_FOUND)
  }

  /** Ends a friendship; a no-op when there is none. */
  async removeFriend(userId: string, friendId: string) {
    await this.prisma.friendship.deleteMany({ where: orderedPair(userId, friendId) })
  }

  /** The caller's friends with their presence: listening first, then online, away, offline. */
  async listFriends(userId: string) {
    const friendships = await this.loadFriendships(userId)
    const now = new Date()
    return friendships.map((friendship) => toFriendView(friendship, now)).sort(compareFriends)
  }

  /** Pending requests sent to the caller (`incoming`) or by the caller (`outgoing`), newest first. */
  async listRequests(userId: string, direction: FriendRequestDirection) {
    if (direction === 'incoming') {
      const requests = await this.prisma.friendRequest.findMany({
        where: { receiverId: userId, sender: { deletedAt: null } },
        orderBy: { createdAt: 'desc' },
        take: MAX_FRIENDS,
        select: { createdAt: true, id: true, sender: { select: PUBLIC_USER_SELECT } },
      })
      return requests.map(({ sender, ...request }) => ({ ...request, user: sender }))
    }
    const requests = await this.prisma.friendRequest.findMany({
      where: { senderId: userId, receiver: { deletedAt: null } },
      orderBy: { createdAt: 'desc' },
      take: MAX_FRIENDS,
      select: { createdAt: true, id: true, receiver: { select: PUBLIC_USER_SELECT } },
    })
    return requests.map(({ receiver, ...request }) => ({ ...request, user: receiver }))
  }

  private findPending(senderId: string, receiverId: string) {
    return this.prisma.friendRequest.findUnique({
      where: { senderId_receiverId: { senderId, receiverId } },
      select: { createdAt: true, id: true },
    })
  }

  /** Everything `sendRequest` decides on; independent reads, checked in order by the caller. */
  private async requestContext(senderId: string, receiverId: string) {
    const [receiver, friendship, theirs, mine] = await Promise.all([
      this.prisma.user.findFirst({
        where: { id: receiverId, deletedAt: null },
        select: { id: true },
      }),
      this.prisma.friendship.findUnique({
        where: { userAId_userBId: orderedPair(senderId, receiverId) },
        select: { userAId: true },
      }),
      this.prisma.friendRequest.findUnique({
        where: { senderId_receiverId: { senderId: receiverId, receiverId: senderId } },
        select: { id: true },
      }),
      this.findPending(senderId, receiverId),
    ])
    return { receiver, friendship, theirs, mine }
  }

  /** Creates the pending request and notifies the receiver; a concurrent duplicate is reused. */
  private async createRequest(senderId: string, receiverId: string) {
    try {
      const request = await this.prisma.friendRequest.create({
        data: { receiverId, senderId },
        select: { createdAt: true, id: true },
      })
      await this.queue(() => this.notifications.friendRequested({ requestId: request.id }))
      return request
    } catch (error) {
      if (!isPrismaP2002(error)) throw error
      /* a concurrent call created it first */
      const request = await this.findPending(senderId, receiverId)
      if (!request) throw error
      return request
    }
  }

  /** The oldest `MAX_FRIENDS` friendships with the other person's presence data. */
  private async loadFriendships(userId: string): Promise<FriendshipRecord[]> {
    // A friendship stores the smaller id first, so the caller is on either side. Each query
    // loads only the other person, and deleted accounts are left out before the cap applies.
    const [asUserA, asUserB] = await Promise.all([
      this.prisma.friendship.findMany({
        where: { userAId: userId, userB: { deletedAt: null } },
        orderBy: [{ createdAt: 'asc' }, { userBId: 'asc' }],
        take: MAX_FRIENDS,
        select: { createdAt: true, userB: { select: FRIEND_SELECT } },
      }),
      this.prisma.friendship.findMany({
        where: { userBId: userId, userA: { deletedAt: null } },
        orderBy: [{ createdAt: 'asc' }, { userAId: 'asc' }],
        take: MAX_FRIENDS,
        select: { createdAt: true, userA: { select: FRIEND_SELECT } },
      }),
    ])
    return [
      ...asUserA.map(({ createdAt, userB }) => ({ createdAt, friend: userB })),
      ...asUserB.map(({ createdAt, userA }) => ({ createdAt, friend: userA })),
    ]
      .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime())
      .slice(0, MAX_FRIENDS)
  }

  /** `accepterId` takes up `requesterId`'s request: one friendship, no requests left either way. */
  private async befriend(accepterId: string, requesterId: string) {
    const pair = orderedPair(accepterId, requesterId)
    await this.prisma.$transaction(async (tx) => {
      await tx.friendship.upsert({
        where: { userAId_userBId: pair },
        create: pair,
        update: {},
      })
      await tx.friendRequest.deleteMany({
        where: {
          OR: [
            { receiverId: accepterId, senderId: requesterId },
            { receiverId: requesterId, senderId: accepterId },
          ],
        },
      })
    })
    await this.queue(() => this.notifications.friendAccepted({ accepterId, requesterId }))
  }

  /** Best effort: a queue outage must not undo the friendship change itself. */
  private async queue(enqueue: () => Promise<void>) {
    try {
      await enqueue()
    } catch (error) {
      this.logger.warn(
        `Could not queue a friend notification: ${error instanceof Error ? error.message : String(error)}`,
      )
    }
  }
}

interface FriendshipRecord {
  createdAt: Date
  friend: Prisma.UserGetPayload<{ select: typeof FRIEND_SELECT }>
}

type FriendView = ReturnType<typeof toFriendView>

/** The public profile plus presence; a removed or unprocessed track is not shown as playing. */
function toFriendView({ createdAt, friend }: FriendshipRecord, now: Date) {
  const { devices, playerState, settings, ...user } = friend
  const track = playerState?.currentTrack
  const playable =
    track && !track.deletedAt && track.processingStatus === 'READY' && track.publishedAt
      ? { artist: track.artist, cover: track.cover, id: track.id, title: track.title }
      : null
  const presence = derivePresence({
    deviceSeenAt: devices[0]?.lastSeenAt ?? null,
    now,
    player: playerState
      ? { isPlaying: playerState.isPlaying, track: playable, updatedAt: playerState.updatedAt }
      : null,
    sharesListening:
      (settings?.showListeningActivity ?? true) && !(settings?.privateSession ?? false),
  })
  return { friendsSince: createdAt, presence, user }
}

/** Listening first, then online, away, offline; most recently active, then by name. */
function compareFriends(a: FriendView, b: FriendView): number {
  return (
    Number(!a.presence.nowPlaying) - Number(!b.presence.nowPlaying) ||
    STATUS_ORDER[a.presence.status] - STATUS_ORDER[b.presence.status] ||
    (b.presence.lastActiveAt?.getTime() ?? 0) - (a.presence.lastActiveAt?.getTime() ?? 0) ||
    a.user.username.localeCompare(b.user.username)
  )
}
