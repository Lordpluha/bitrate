import { Injectable } from '@nestjs/common'
import { PrismaService } from 'src/prisma/prisma.service'
import { UserEntity } from './entities'

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: UserEntity['id']) {
    return await this.prisma.user.findUniqueOrThrow({
      where: {
        id
      },
      omit: {
        password: true
      }
    })
  }

  async getByEmail(email: UserEntity['email']) {
    return await this.prisma.user.findFirst({
      where: {
        email
      }
    })
  }

  async getByUsername(username: UserEntity['username']) {
    return await this.prisma.user.findFirst({
      where: {
        username
      },
      omit: {
        password: true
      }
    })
  }

  async findByUsername({
    username,
    limit = 10,
    page = 1
  }: {
    username: UserEntity['username']
    limit?: number
    page?: number
  }) {
    return this.prisma.user.findMany({
      where: {
        username
      },
      skip: page ? (page - 1) * limit : undefined,
      take: limit,
      omit: {
        password: true
      }
    })
  }

  async create(data: Omit<UserEntity, 'id' | 'createdAt'>) {
    return this.prisma.user.create({
      data
    })
  }

  async updateById(
    id: UserEntity['id'],
    userData: Partial<Omit<UserEntity, 'id' | ''>>
  ) {
    return this.prisma.user.update({
      where: { id },
      data: userData
    })
  }
}
