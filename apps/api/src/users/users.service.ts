import { Injectable } from '@nestjs/common'
import { User } from '@prisma/client'
import { PrismaService } from 'src/prisma/prisma.service'

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async findUserById(id: User['id']) {
    return await this.prisma.user.findFirstOrThrow({
      where: {
        id
      }
    })
  }

  async findUserByEmail(email: User['email']) {
    return await this.prisma.user.findFirstOrThrow({
      where: {
        email
      }
    })
  }

  async findUserByUsername(username: User['username']) {
    return this.prisma.user.findFirstOrThrow({
      where: {
        username
      }
    })
  }

  async createUser(data: Omit<User, 'id' | 'createdAt'>) {
    return this.prisma.user.create({
      data
    })
  }
}
