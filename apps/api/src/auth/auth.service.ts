import {
  ConflictException,
  Injectable,
  UnauthorizedException
} from '@nestjs/common'
import { UsersService } from '../users/users.service'
import { JwtService } from '@nestjs/jwt'
import { UserEntity } from '../users/entities'
import { JWTPayload } from './types'
import { PrismaService } from 'src/prisma/prisma.service'
import { SessionEntity } from './entities'

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private prismaService: PrismaService
  ) {}

  async registration(registrationDto: Pick<UserEntity, 'email' | 'password'>) {
    const user = await this.usersService.findUserByEmail(registrationDto.email)

    if (user) {
      throw new ConflictException('User with this email already exists')
    }

    await this.usersService.createUser({
      username: registrationDto.email,
      email: registrationDto.email,
      password: registrationDto.password,
      avatar: null,
      description: null
    })
  }

  async login(email: UserEntity['email'], password: UserEntity['password']) {
    const user = await this.usersService.findUserByEmail(email)
    if (user?.password !== password) {
      throw new UnauthorizedException()
    }

    const access_token = await this.jwtService.signAsync(
      {
        username: user.username
      },
      {
        subject: user.id,
        expiresIn: process.env.JWT_ACCESS_EXPIRES_IN
      }
    )
    const refresh_token = await this.jwtService.signAsync(
      {
        username: user.username
      },
      {
        subject: user.id,
        expiresIn: process.env.JWT_REFRESH_EXPIRES_IN
      }
    )

    const session = await this.prismaService.session.create({
      data: {
        access_token,
        userId: user.id,
        refresh_token
      }
    })

    return {
      access_token: session.access_token,
      refresh_token: session.refresh_token
    }
  }

  async refresh(refresh_token: string) {
    try {
      const payload = await this.jwtService.verifyAsync<JWTPayload>(
        refresh_token,
        {
          secret: process.env.REFRESH_TOKEN_SECRET
        }
      )
      const user = await this.usersService.findUserByUsername(payload.username)
      if (!user) {
        throw new UnauthorizedException('User not found')
      }
      return {
        access_token: await this.jwtService.signAsync(
          {
            username: user.username
          },
          {
            subject: user.id
          }
        )
      }
    } catch {
      throw new UnauthorizedException('Invalid refresh token')
    }
  }

  async logout(
    userId: SessionEntity['userId'],
    refresh_token: SessionEntity['refresh_token']
  ) {
    const session = await this.prismaService.session.findFirst({
      where: {
        userId,
        refresh_token
      }
    })

    await this.prismaService.session.delete({
      where: {
        id: session?.id
      }
    })
  }
}
