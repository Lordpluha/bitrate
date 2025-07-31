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

  async findByEmail(email: UserEntity['email']) {
    return await this.prisma.user.findFirst({
      where: {
        email
      }
    })
  }

  async findByUsername(username: UserEntity['username']) {
    return this.prisma.user.findFirst({
      where: {
        username
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
