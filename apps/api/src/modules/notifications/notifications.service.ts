import { PrismaService } from '@infra/prisma/prisma.service'
import { Injectable } from '@nestjs/common'
import type {
  FollowNotificationJob,
  FriendAcceptedNotificationJob,
  FriendRequestNotificationJob,
  NewReleaseNotificationJob,
} from './notifications.queue'

/** Rows per insert when a release fans out to many followers. */
const FAN_OUT_CHUNK = 1_000

/**
 * Writes notification rows for domain events. Every method is safe to run twice: it re-reads the
 * current state and skips people who already have the notification, so a retried job never
 * duplicates. `title`/`body` are an English fallback; clients render from `type` + `payload`.
 */
@Injectable()
export class NotificationsService {
  constructor(private readonly prisma: PrismaService) {}

  /** "X started following you" — only while the follow still exists, once per unread follow. */
  async notifyFollow({ followerId, followingId }: FollowNotificationJob) {
    const follow = await this.prisma.userFollow.findUnique({
      where: { followerId_followingId: { followerId, followingId } },
      select: { followerId: true },
    })
    if (!follow) return
    const actor = await this.prisma.user.findFirst({
      where: { id: followerId, deletedAt: null },
      select: { id: true, username: true },
    })
    if (!actor) return
    const unread = await this.prisma.notification.findFirst({
      where: {
        userId: followingId,
        type: 'FOLLOW',
        readAt: null,
        payload: { path: ['actorId'], equals: followerId },
      },
      select: { id: true },
    })
    if (unread) return
    await this.prisma.notification.create({
      data: {
        userId: followingId,
        type: 'FOLLOW',
        title: 'New follower',
        body: `${actor.username} started following you`,
        payload: { actorId: actor.id, actorUsername: actor.username },
      },
    })
  }

  /** "X wants to be friends" — only while the request is still pending, once per request. */
  async notifyFriendRequest({ requestId }: FriendRequestNotificationJob) {
    const request = await this.prisma.friendRequest.findFirst({
      where: { id: requestId, sender: { deletedAt: null }, receiver: { deletedAt: null } },
      select: { receiverId: true, sender: { select: { id: true, username: true } } },
    })
    if (!request) return
    const already = await this.prisma.notification.findFirst({
      where: {
        userId: request.receiverId,
        type: 'FRIEND_REQUEST',
        payload: { path: ['requestId'], equals: requestId },
      },
      select: { id: true },
    })
    if (already) return
    await this.prisma.notification.create({
      data: {
        userId: request.receiverId,
        type: 'FRIEND_REQUEST',
        title: 'Friend request',
        body: `${request.sender.username} wants to be friends`,
        payload: {
          actorId: request.sender.id,
          actorUsername: request.sender.username,
          requestId,
        },
      },
    })
  }

  /** "X accepted your friend request" — only while they are still friends, once per unread. */
  async notifyFriendAccepted({ accepterId, requesterId }: FriendAcceptedNotificationJob) {
    /* friendships are stored with the smaller id first */
    const [userAId, userBId] =
      accepterId < requesterId ? [accepterId, requesterId] : [requesterId, accepterId]
    const friendship = await this.prisma.friendship.findUnique({
      where: { userAId_userBId: { userAId, userBId } },
      select: { userAId: true },
    })
    if (!friendship) return
    const actor = await this.prisma.user.findFirst({
      where: { id: accepterId, deletedAt: null },
      select: { id: true, username: true },
    })
    if (!actor) return
    const unread = await this.prisma.notification.findFirst({
      where: {
        userId: requesterId,
        type: 'FRIEND_ACCEPTED',
        readAt: null,
        payload: { path: ['actorId'], equals: accepterId },
      },
      select: { id: true },
    })
    if (unread) return
    await this.prisma.notification.create({
      data: {
        userId: requesterId,
        type: 'FRIEND_ACCEPTED',
        title: 'Friend request accepted',
        body: `${actor.username} accepted your friend request`,
        payload: { actorId: actor.id, actorUsername: actor.username },
      },
    })
  }

  /** "New release from {artist}" for everyone following the track's primary artist. */
  async notifyNewRelease({ trackId }: NewReleaseNotificationJob) {
    const track = await this.prisma.track.findFirst({
      where: {
        id: trackId,
        processingStatus: 'READY',
        deletedAt: null,
        artist: { deletedAt: null },
      },
      select: { id: true, title: true, artist: { select: { id: true, username: true } } },
    })
    if (!track) return
    const followers = await this.prisma.userFollowedArtist.findMany({
      where: { artistId: track.artist.id, user: { deletedAt: null } },
      select: { userId: true },
    })
    if (!followers.length) return
    const already = await this.prisma.notification.findMany({
      where: {
        type: 'NEW_RELEASE',
        userId: { in: followers.map((f) => f.userId) },
        payload: { path: ['trackId'], equals: track.id },
      },
      select: { userId: true },
    })
    const notified = new Set(already.map((n) => n.userId))
    const rows = followers
      .filter((f) => !notified.has(f.userId))
      .map((f) => ({
        userId: f.userId,
        type: 'NEW_RELEASE' as const,
        title: `New release from ${track.artist.username}`,
        body: track.title,
        payload: {
          trackId: track.id,
          trackTitle: track.title,
          artistId: track.artist.id,
          artistName: track.artist.username,
        },
      }))
    for (let i = 0; i < rows.length; i += FAN_OUT_CHUNK) {
      await this.prisma.notification.createMany({ data: rows.slice(i, i + FAN_OUT_CHUNK) })
    }
  }
}
