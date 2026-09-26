import { PrismaService } from '@infra/prisma/prisma.service'
import { Injectable } from '@nestjs/common'
import type { Prisma } from '@prisma/client'
import { UserEntity } from './entities'

/** Represents the users private service. */
@Injectable()
export class UsersPrivateService {
  /** Creates a new instance. */
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Runs the find by id operation. Filters `deletedAt` — a soft-deleted user must not be
   * resolvable through this internal lookup, mirroring `ArtistsPrivateService.findById`.
   */
  async findById(id: UserEntity['id']) {
    return await this.prisma.user.findFirst({
      where: { id, deletedAt: null },
    })
  }

  /** Runs the get by email operation. Filters `deletedAt` — see `findById`. Used by login,
   * password reset, and email-verification flows so a soft-deleted account is treated exactly
   * like a nonexistent one, never leaking its take-down state. */
  async getByEmail(email: UserEntity['email']) {
    return await this.prisma.user.findFirst({
      where: { email, deletedAt: null },
    })
  }

  /** Runs the get by username operation. Filters `deletedAt` — see `findById`. */
  async getByUsername(username: UserEntity['username']) {
    return await this.prisma.user.findFirst({
      where: { username, deletedAt: null },
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
    return await this.prisma.user.findMany({
      where: {
        username,
      },
      skip: page ? (page - 1) * limit : undefined,
      take: limit,
    })
  }

  /** Runs the create operation. */
  async create(data: Prisma.UserUncheckedCreateInput) {
    return await this.prisma.user.create({
      data,
    })
  }

  /** Runs the update by id operation. */
  async updateById(id: UserEntity['id'], userData: Partial<Omit<UserEntity, 'id' | ''>>) {
    return await this.prisma.user.update({
      where: { id },
      data: userData,
    })
  }

  /** Runs the upload avatar operation. */
  async uploadAvatar(userId: string, filename: string) {
    const avatarPath = `/static/users/avatars/${filename}`
    return await this.prisma.user.update({
      where: { id: userId },
      data: { avatar: avatarPath },
    })
  }
}
