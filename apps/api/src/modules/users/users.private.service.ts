import { PrismaService } from '@infra/prisma/prisma.service'
import { Injectable } from '@nestjs/common'
import type { Prisma } from '@prisma/client'
import { UserEntity } from './entities'

/** Represents the users private service. */
@Injectable()
export class UsersPrivateService {
  /** Creates a new instance. */
  constructor(private readonly prisma: PrismaService) {}

  /** Runs the find by id operation. */
  async findById(id: UserEntity['id']) {
    return await this.prisma.user.findUniqueOrThrow({
      where: {
        id,
      },
    })
  }

  /** Runs the get by email operation. */
  async getByEmail(email: UserEntity['email']) {
    return await this.prisma.user.findFirst({
      where: {
        email,
      },
    })
  }

  /** Runs the get by username operation. */
  async getByUsername(username: UserEntity['username']) {
    return await this.prisma.user.findFirst({
      where: {
        username,
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
