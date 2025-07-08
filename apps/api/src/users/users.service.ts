import { Injectable } from '@nestjs/common'
import { PrismaService } from 'src/prisma/prisma.service'
import { UserEntity } from './entities'

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async findUserById(id: UserEntity['id']) {
    return await this.prisma.user.findFirstOrThrow({
      where: {
        id
      }
    })
  }

  async findUserByEmail(email: UserEntity['email']) {
    return await this.prisma.user.findFirstOrThrow({
      where: {
        email
      }
    })
  }

  async findUserByUsername(username: UserEntity['username']) {
    return this.prisma.user.findFirstOrThrow({
      where: {
        username
      }
    })
  }

  async createUser(data: Omit<UserEntity, 'id' | 'createdAt'>) {
    return this.prisma.user.create({
      data
    })
  }
}
