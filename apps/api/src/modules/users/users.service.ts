import { PrismaService } from '@infra/prisma/prisma.service'
import { Injectable } from '@nestjs/common'
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
    return await this.prisma.user.findMany({
      where: {
        username,
      },
      skip: page ? (page - 1) * limit : undefined,
      take: limit,
      omit: {
        password: true,
        email: true,
        twoFactorSecret: true,
      },
    })
  }

  /** Runs the create operation. */
  async create(
    data: Omit<UserEntity, 'id' | 'createdAt' | 'twoFactorSecret' | 'twoFactorEnabled'>,
  ) {
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
}
