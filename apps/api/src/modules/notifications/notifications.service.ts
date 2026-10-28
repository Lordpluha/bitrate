import { PrismaService } from '@infra/prisma/prisma.service'
import { PUBLIC_ALBUM_WHERE } from '@modules/albums/album-visibility'
import { PUBLIC_TRACK_WHERE } from '@modules/tracks/track-visibility'
import { Injectable } from '@nestjs/common'
import type {
  FollowNotificationJob,
  FriendAcceptedNotificationJob,
  FriendRequestNotificationJob,
  NewReleaseNotificationJob,
  ReleasePublishedNotificationJob,
} from './notifications.queue'

/** Rows per insert when a release fans out to many followers. */
const FAN_OUT_CHUNK = 1_000

/** The artist whose followers hear about a release. */
type ReleasingArtist = { id: string; username: string }

/** What one follower's "New release" row says; `dedupe` names the payload key that identifies it. */
type NewReleaseMessage = {
  body: string
  dedupe: 'trackId' | 'albumId'
  payload: { trackId: string; trackTitle: string; albumId?: string; albumTitle?: string }
}

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
        ...PUBLIC_TRACK_WHERE,
        artist: { deletedAt: null },
      },
      select: { id: true, title: true, artist: { select: { id: true, username: true } } },
    })
    if (!track) return
    await this.notifyFollowers(track.artist, {
      body: track.title,
      dedupe: 'trackId',
      payload: { trackId: track.id, trackTitle: track.title },
    })
  }

  /**
   * One "New release from {artist}" per follower when a whole release goes live as `albumId`.
   * The payload keeps the track fields older clients link with, pointing at the first track.
   */
  async notifyReleasePublished({ albumId }: ReleasePublishedNotificationJob) {
    const album = await this.prisma.album.findFirst({
      where: { id: albumId, ...PUBLIC_ALBUM_WHERE, artist: { deletedAt: null } },
      select: {
        id: true,
        title: true,
        artist: { select: { id: true, username: true } },
        tracks: {
          where: { track: PUBLIC_TRACK_WHERE },
          orderBy: [{ discNumber: 'asc' }, { trackNumber: 'asc' }],
          take: 1,
          select: { track: { select: { id: true, title: true } } },
        },
      },
    })
    const first = album?.tracks[0]?.track
    if (!(album && first)) return
    await this.notifyFollowers(album.artist, {
      body: album.title,
      dedupe: 'albumId',
      payload: {
        trackId: first.id,
        trackTitle: first.title,
        albumId: album.id,
        albumTitle: album.title,
      },
    })
  }

  /** Writes the "New release" row for each follower of `artist` who does not have it yet. */
  private async notifyFollowers(artist: ReleasingArtist, message: NewReleaseMessage) {
    const followers = await this.prisma.userFollowedArtist.findMany({
      where: { artistId: artist.id, user: { deletedAt: null } },
      select: { userId: true },
    })
    if (!followers.length) return
    const key = message.payload[message.dedupe]
    if (!key) return
    const already = await this.prisma.notification.findMany({
      where: {
        type: 'NEW_RELEASE',
        userId: { in: followers.map((f) => f.userId) },
        payload: { path: [message.dedupe], equals: key },
      },
      select: { userId: true },
    })
    const notified = new Set(already.map((n) => n.userId))
    const rows = followers
      .filter((f) => !notified.has(f.userId))
      .map((f) => ({
        userId: f.userId,
        type: 'NEW_RELEASE' as const,
        title: `New release from ${artist.username}`,
        body: message.body,
        payload: { ...message.payload, artistId: artist.id, artistName: artist.username },
      }))
    for (let i = 0; i < rows.length; i += FAN_OUT_CHUNK) {
      await this.prisma.notification.createMany({ data: rows.slice(i, i + FAN_OUT_CHUNK) })
    }
  }
}
