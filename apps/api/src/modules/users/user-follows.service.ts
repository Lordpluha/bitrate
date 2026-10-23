import { normalizePagination } from '@common/pagination'
import { readUserSettings } from '@common/user-settings'
import { PrismaService } from '@infra/prisma/prisma.service'
import { NotificationsProducer } from '@modules/notifications'
import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common'
import { Prisma } from '@prisma/client'
import type { UserEntity } from './entities'
import { USER_ERRORS } from './errors/user.errors'
import { PUBLIC_USER_SELECT } from './users.select'

/** Which side of the follow relation a list shows. */
export type FollowListKind = 'followers' | 'following'

/** A person on a follow list, with when the follow started. */
type FollowedUser = Prisma.UserGetPayload<{ select: typeof PUBLIC_USER_SELECT }> & {
  followedAt: Date
}

const ACTIVITY_WINDOW_DAYS = 7
const ACTIVITY_DEFAULT = 50
const ACTIVITY_MAX = 100

/** Following and unfollowing people, the follow lists and what followed people last played. */
@Injectable()
export class UserFollowsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notifications: NotificationsProducer,
  ) {}

  private readonly logger = new Logger(UserFollowsService.name)

  async followUser(followerId: string, followingId: string) {
    if (followerId === followingId) throw new BadRequestException('You cannot follow yourself')
    const user = await this.prisma.user.findFirst({
      where: { id: followingId, deletedAt: null },
      select: { id: true },
    })
    if (!user) throw new NotFoundException('User not found')
    // An existing follow is skipped, so only a follow this call created is notified.
    const { count } = await this.prisma.userFollow.createMany({
      data: [{ followerId, followingId }],
      skipDuplicates: true,
    })
    if (count === 0) return
    /* best effort: a queue outage must not fail the follow itself */
    try {
      await this.notifications.followed({ followerId, followingId })
    } catch (error) {
      this.logger.warn(
        `Could not queue the follow notification: ${error instanceof Error ? error.message : String(error)}`,
      )
    }
  }

  async unfollowUser(followerId: string, followingId: string) {
    await this.prisma.userFollow.deleteMany({ where: { followerId, followingId } })
  }

  /** Whom the caller follows, newest first; deleted accounts drop out. */
  async getFollowing(userId: UserEntity['id'], page = 1, limit = 20) {
    return await this.followPage('following', userId, page, limit)
  }

  /**
   * Who follows a user, or whom they follow. Other people only see the lists when the owner
   * keeps them visible; the owner always sees their own.
   */
  async listFollows(
    kind: FollowListKind,
    targetId: UserEntity['id'],
    viewerId: UserEntity['id'] | undefined,
    page = 1,
    limit = 20,
  ) {
    const target = await this.prisma.user.findFirst({
      where: { id: targetId, deletedAt: null },
      select: { id: true },
    })
    if (!target) throw new NotFoundException(USER_ERRORS.NOT_FOUND)
    if (viewerId !== targetId) {
      const { followersVisible } = await readUserSettings(this.prisma, targetId)
      if (!followersVisible) throw new ForbiddenException(USER_ERRORS.FOLLOWS_HIDDEN)
    }
    return await this.followPage(kind, targetId, page, limit)
  }

  /**
   * What the people a user follows last played, newest first: one listen per person from the
   * past week, skipping anyone who hides their listening activity. Listens during a private
   * session are never recorded, so they never show here.
   */
  async getFollowingActivity(userId: UserEntity['id'], limit = ACTIVITY_DEFAULT) {
    const rows = await this.latestFollowedListens(
      userId,
      Math.min(ACTIVITY_MAX, Math.max(1, limit)),
    )
    const [users, tracks] = await Promise.all([
      this.prisma.user.findMany({
        where: { id: { in: rows.map((r) => r.userId) }, deletedAt: null },
        select: PUBLIC_USER_SELECT,
      }),
      this.prisma.track.findMany({
        where: {
          id: { in: rows.map((r) => r.trackId) },
          deletedAt: null,
          processingStatus: 'READY',
        },
        include: { artist: { select: { id: true, username: true, avatar: true } } },
      }),
    ])
    const userById = new Map(users.map((u) => [u.id, u]))
    const trackById = new Map(tracks.map((t) => [t.id, t]))
    return rows.flatMap(({ userId: friendId, trackId, listenedAt }) => {
      const user = userById.get(friendId)
      const track = trackById.get(trackId)
      return user && track ? [{ user, track, listenedAt }] : []
    })
  }

  /** The newest shared listen per followed person within the activity window. */
  private latestFollowedListens(userId: UserEntity['id'], take: number) {
    const since = new Date(Date.now() - ACTIVITY_WINDOW_DAYS * 24 * 60 * 60 * 1000)
    return this.prisma.queryRaw<Array<{ userId: string; trackId: string; listenedAt: Date }>>(
      Prisma.sql`
      SELECT latest."userId", latest."trackId", latest."listenedAt"
      FROM (
        SELECT DISTINCT ON (h."userId") h."userId", h."trackId", h."listenedAt"
        FROM "ListeningHistory" h
        JOIN "UserFollow" f ON f."followingId" = h."userId" AND f."followerId" = ${userId}::uuid
        JOIN "User" u ON u.id = h."userId"
        JOIN "Track" t ON t.id = h."trackId"
        LEFT JOIN "UserSettings" s ON s."userId" = h."userId"
        WHERE h."listenedAt" >= ${since}
          AND u."deletedAt" IS NULL
          AND t."deletedAt" IS NULL
          AND t."processingStatus" = 'READY'
          AND COALESCE(s."showListeningActivity", true) = true
        ORDER BY h."userId", h."listenedAt" DESC
      ) latest
      ORDER BY latest."listenedAt" DESC
      LIMIT ${take}
    `,
    )
  }

  /**
   * One page of a user's followers or followings, newest follow first, with the other person's
   * public profile. Soft-deleted accounts are left out of both the page and the total.
   */
  private async followPage(
    kind: FollowListKind,
    userId: UserEntity['id'],
    page: number,
    limit: number,
  ) {
    const pagination = normalizePagination(page, limit)
    const window = { skip: pagination.skip, take: pagination.limit }
    let data: FollowedUser[]
    let total: number
    if (kind === 'followers') {
      const where = { followingId: userId, follower: { deletedAt: null } }
      const [rows, count] = await this.prisma.$transaction([
        this.prisma.userFollow.findMany({
          where,
          orderBy: [{ createdAt: 'desc' }, { followerId: 'asc' }],
          ...window,
          include: { follower: { select: PUBLIC_USER_SELECT } },
        }),
        this.prisma.userFollow.count({ where }),
      ])
      data = rows.map(({ follower, createdAt }) => ({ ...follower, followedAt: createdAt }))
      total = count
    } else {
      const where = { followerId: userId, following: { deletedAt: null } }
      const [rows, count] = await this.prisma.$transaction([
        this.prisma.userFollow.findMany({
          where,
          orderBy: [{ createdAt: 'desc' }, { followingId: 'asc' }],
          ...window,
          include: { following: { select: PUBLIC_USER_SELECT } },
        }),
        this.prisma.userFollow.count({ where }),
      ])
      data = rows.map(({ following, createdAt }) => ({ ...following, followedAt: createdAt }))
      total = count
    }
    return { data, total, page: pagination.page, limit: pagination.limit }
  }
}
