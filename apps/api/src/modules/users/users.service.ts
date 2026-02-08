import { PrismaService } from '@infra/prisma/prisma.service'
import { Injectable } from '@nestjs/common'
import { UserEntity } from './entities'

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: UserEntity['id']) {
    return await this.prisma.user.findUniqueOrThrow({
      where: {
        id,
      },
      omit: {
        password: true,
        email: true,
      },
    })
  }

  async getByEmail(email: UserEntity['email']) {
    return await this.prisma.user.findFirst({
      where: {
        email,
      },
      omit: {
        password: true,
      },
    })
  }

  async getByUsername(username: UserEntity['username']) {
    return await this.prisma.user.findFirst({
      where: {
        username,
      },
      omit: {
        password: true,
        email: true,
      },
    })
  }

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
      },
    })
  }

  async create(data: Omit<UserEntity, 'id' | 'createdAt'>) {
    return await this.prisma.user.create({
      data,
      omit: {
        password: true,
      },
    })
  }

  async updateById(id: UserEntity['id'], userData: Partial<Omit<UserEntity, 'id' | ''>>) {
    return await this.prisma.user.update({
      where: { id },
      data: userData,
      omit: {
        password: true,
      },
    })
  }

  async uploadAvatar(userId: string, filename: string) {
    const avatarPath = `/static/users/avatars/${filename}`
    return await this.prisma.user.update({
      where: { id: userId },
      data: { avatar: avatarPath },
      omit: { password: true },
    })
  }
}
