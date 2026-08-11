import { normalizePagination } from '@common/pagination'
import { PrismaService } from '@infra/prisma/prisma.service'
import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common'
import type { Prisma } from '@prisma/client'
import type { UserEntity } from './entities'

/** Represents the users service. */
@Injectable()
export class UsersService {
  /** Creates a new instance. */
  constructor(private readonly prisma: PrismaService) {}

  /** Runs the find by id operation. */
  async findById(id: UserEntity['id']) {
    return await this.prisma.user.findUniqueOrThrow({
      where: {
        id,
      },
      omit: {
        password: true,
        email: true,
        twoFactorSecret: true,
      },
    })
  }

  /** Runs the get by email operation. */
  async getByEmail(email: UserEntity['email']) {
    return await this.prisma.user.findFirst({
      where: {
        email,
      },
      omit: {
        password: true,
        twoFactorSecret: true,
      },
    })
  }

  /** Runs the get by username operation. */
  async getByUsername(username: UserEntity['username']) {
    return await this.prisma.user.findFirst({
      where: {
        username,
      },
      omit: {
        password: true,
        email: true,
        twoFactorSecret: true,
      },
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
        omit: {
          password: true,
          email: true,
          twoFactorSecret: true,
        },
      }),
      this.prisma.user.count({ where }),
    ])
    return { data, total, page: pagination.page, limit: pagination.limit }
  }

  /** Runs the create operation. */
  async create(data: Prisma.UserUncheckedCreateInput) {
    return await this.prisma.user.create({
      data,
      omit: {
        password: true,
        twoFactorSecret: true,
      },
    })
  }

  /** Runs the update by id operation. */
  async updateById(id: UserEntity['id'], userData: Partial<Omit<UserEntity, 'id' | ''>>) {
    return await this.prisma.user.update({
      where: { id },
      data: userData,
      omit: {
        password: true,
        twoFactorSecret: true,
      },
    })
  }

  /** Runs the upload avatar operation. */
  async uploadAvatar(userId: string, filename: string) {
    const avatarPath = `/static/users/avatars/${filename}`
    return await this.prisma.user.update({
      where: { id: userId },
      data: { avatar: avatarPath },
      omit: { password: true, email: true, twoFactorSecret: true },
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
        include: { following: { omit: { password: true, email: true, twoFactorSecret: true } } },
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
}
