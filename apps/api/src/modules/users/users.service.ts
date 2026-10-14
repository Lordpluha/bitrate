import { isLegalAcceptanceCurrent, LEGAL_VERSION } from '@common/legal'
import { normalizePagination } from '@common/pagination'
import { readUserSettings } from '@common/user-settings'
import { PrismaService } from '@infra/prisma/prisma.service'
import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common'
import { Prisma } from '@prisma/client'
import type { UserEntity } from './entities'
import { USER_ERRORS } from './errors/user.errors'
import { PUBLIC_USER_SELECT, SELF_USER_SELECT } from './users.select'

/** Which side of the follow relation a list shows. */
export type FollowListKind = 'followers' | 'following'

const ACTIVITY_WINDOW_DAYS = 7
const ACTIVITY_DEFAULT = 50
const ACTIVITY_MAX = 100

/** Represents the users service. */
@Injectable()
export class UsersService {
  /** Creates a new instance. */
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Runs the find by id operation. Filters `deletedAt` — a soft-deleted account's public
   * profile is not reachable, mirroring `ArtistsService.findById`.
   */
  async findById(id: UserEntity['id']) {
    return await this.prisma.user.findFirst({
      where: { id, deletedAt: null },
      select: PUBLIC_USER_SELECT,
    })
  }

  /**
   * The signed-in account's own record.
   *
   * Separate from `findById` because settings need the address and two-factor
   * state that the public projection deliberately withholds.
   */
  async findSelfById(id: UserEntity['id']) {
    const user = await this.prisma.user.findUniqueOrThrow({
      where: { id },
      select: SELF_USER_SELECT,
    })
    return { ...user, legalAcceptanceRequired: !isLegalAcceptanceCurrent(user.legalVersion) }
  }

  /**
   * Records that the account accepted the current legal documents, then returns its own record.
   * Accounts created before acceptance was tracked, or before a new revision, are asked once.
   */
  async acceptLegal(id: UserEntity['id']) {
    await this.prisma.user.update({
      where: { id },
      data: { legalVersion: LEGAL_VERSION, legalAcceptedAt: new Date() },
      select: { id: true },
    })
    return await this.findSelfById(id)
  }

  /** Runs the get by email operation. Filters `deletedAt` — see `findById`. */
  async getByEmail(email: UserEntity['email']) {
    return await this.prisma.user.findFirst({
      where: { email, deletedAt: null },
      select: { id: true },
    })
  }

  /** Runs the get by username operation. Filters `deletedAt` — see `findById`. */
  async getByUsername(username: UserEntity['username']) {
    return await this.prisma.user.findFirst({
      where: { username, deletedAt: null },
      select: PUBLIC_USER_SELECT,
    })
  }

  /** Runs the find all operation. */
  async findAll({
    username,
    limit = 10,
    page = 1,
  }: {
    username: UserEntity['username']
    limit?: number
    page?: number
  }) {
    const pagination = normalizePagination(page, limit)
    const where = {
      username: { contains: username, mode: 'insensitive' as const },
      deletedAt: null,
    }
    const [data, total] = await this.prisma.$transaction([
      this.prisma.user.findMany({
        where,
        skip: pagination.skip,
        take: pagination.limit,
        orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
        select: PUBLIC_USER_SELECT,
      }),
      this.prisma.user.count({ where }),
    ])
    return { data, total, page: pagination.page, limit: pagination.limit }
  }

  /** Runs the create operation. */
  async create(data: Prisma.UserUncheckedCreateInput) {
    return await this.prisma.user.create({
      data,
      select: { id: true, email: true, username: true },
    })
  }

  /** Runs the update by id operation. */
  async updateById(id: UserEntity['id'], userData: Partial<Omit<UserEntity, 'id' | ''>>) {
    return await this.prisma.user.update({
      where: { id },
      data: userData,
      select: PUBLIC_USER_SELECT,
    })
  }

  /** Runs the upload avatar operation. */
  async uploadAvatar(userId: string, filename: string) {
    const avatarPath = `/static/users/avatars/${filename}`
    return await this.prisma.user.update({
      where: { id: userId },
      data: { avatar: avatarPath },
      select: PUBLIC_USER_SELECT,
    })
  }

  async followUser(followerId: string, followingId: string) {
    if (followerId === followingId) throw new BadRequestException('You cannot follow yourself')
    const user = await this.prisma.user.findFirst({ where: { id: followingId, deletedAt: null } })
    if (!user) throw new NotFoundException('User not found')
    await this.prisma.userFollow.upsert({
      where: { followerId_followingId: { followerId, followingId } },
      create: { followerId, followingId },
      update: {},
    })
  }

  async unfollowUser(followerId: string, followingId: string) {
    await this.prisma.userFollow.deleteMany({ where: { followerId, followingId } })
  }

  async getFollowing(userId: string, page = 1, limit = 20) {
    const pagination = normalizePagination(page, limit)
    const where = { followerId: userId }
    const [follows, total] = await this.prisma.$transaction([
      this.prisma.userFollow.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: pagination.skip,
        take: pagination.limit,
        include: { following: { select: PUBLIC_USER_SELECT } },
      }),
      this.prisma.userFollow.count({ where }),
    ])
    return {
      data: follows.map(({ following, createdAt }) => ({ ...following, followedAt: createdAt })),
      total,
      page: pagination.page,
      limit: pagination.limit,
    }
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
    const pagination = normalizePagination(page, limit)
    if (kind === 'followers') {
      const where = { followingId: targetId, follower: { deletedAt: null } }
      const [rows, total] = await this.prisma.$transaction([
        this.prisma.userFollow.findMany({
          where,
          orderBy: [{ createdAt: 'desc' }, { followerId: 'asc' }],
          skip: pagination.skip,
          take: pagination.limit,
          include: { follower: { select: PUBLIC_USER_SELECT } },
        }),
        this.prisma.userFollow.count({ where }),
      ])
      return {
        data: rows.map(({ follower, createdAt }) => ({ ...follower, followedAt: createdAt })),
        total,
        page: pagination.page,
        limit: pagination.limit,
      }
    }
    const where = { followerId: targetId, following: { deletedAt: null } }
    const [rows, total] = await this.prisma.$transaction([
      this.prisma.userFollow.findMany({
        where,
        orderBy: [{ createdAt: 'desc' }, { followingId: 'asc' }],
        skip: pagination.skip,
        take: pagination.limit,
        include: { following: { select: PUBLIC_USER_SELECT } },
      }),
      this.prisma.userFollow.count({ where }),
    ])
    return {
      data: rows.map(({ following, createdAt }) => ({ ...following, followedAt: createdAt })),
      total,
      page: pagination.page,
      limit: pagination.limit,
    }
  }

  /**
   * What the people a user follows last played, newest first: one listen per person from the
   * past week, skipping anyone who hides their listening activity. Listens during a private
   * session are never recorded, so they never show here.
   */
  async getFollowingActivity(userId: UserEntity['id'], limit = ACTIVITY_DEFAULT) {
    const take = Math.min(ACTIVITY_MAX, Math.max(1, limit))
    const since = new Date(Date.now() - ACTIVITY_WINDOW_DAYS * 24 * 60 * 60 * 1000)
    const rows = await this.prisma.queryRaw<
      Array<{ userId: string; trackId: string; listenedAt: Date }>
    >(Prisma.sql`
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
    `)
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
}
