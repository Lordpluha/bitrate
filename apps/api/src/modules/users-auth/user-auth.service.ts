import { PrismaService } from '@infra/prisma/prisma.service'
import { UsersPrivateService } from '@modules/users/users.private.service'
import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { JWTPayload } from '../tokens'
import { TokenService } from '../tokens/token.service'
import { UserEntity } from '../users/entities'
import { UsersService } from '../users/users.service'
import { RegistrationDto } from './dtos'
import { UserSessionEntity } from './entities'

@Injectable()
export class UserAuthService {
  constructor(
    private users: UsersService,
    private usersPrivate: UsersPrivateService,
    private jwt: JwtService,
    private prisma: PrismaService,
    private token: TokenService,
  ) {}

  async registerUser(registrationDto: RegistrationDto) {
    const user = await this.users.getByEmail(registrationDto.email)

    if (user) {
      throw new ConflictException('User with this email already exists')
    }

    await this.users.create({
      username: registrationDto.username,
      email: registrationDto.email,
      password: registrationDto.password,
      avatar: null,
      description: null,
      updatedAt: new Date(),
    })
  }

  async loginUser(email: UserEntity['email'], password: UserEntity['password']) {
    const user = await this.usersPrivate.getByEmail(email)
    if (!user || user?.password !== password) {
      throw new UnauthorizedException({
        message: 'Invalid credentials',
      })
    }

    const access_token = await this.token.generateAccessToken(user.id, user.username)
    const refresh_token = await this.token.generateRefreshToken(user.id, user.username)

    const session = await this.prisma.userSession.create({
      data: {
        access_token,
        userId: user.id,
        refresh_token,
      },
    })

    return {
      access_token: session.access_token,
      refresh_token: session.refresh_token,
    }
  }

  async refresh(refresh_token: string) {
    try {
      const payload = await this.jwt.verifyAsync<JWTPayload>(refresh_token, {
        secret: process.env.REFRESH_TOKEN_SECRET,
      })
      const user = await this.users.getByUsername(payload.username)
      if (!user) {
        throw new UnauthorizedException('Invalid refresh token')
      }

      const access_token = await this.token.generateAccessToken(user.id, user.username)

      // Обновляем сессию с новым access_token
      await this.prisma.userSession.updateMany({
        where: {
          userId: user.id,
          refresh_token,
        },
        data: {
          access_token,
        },
      })

      return {
        access_token,
      }
    } catch {
      throw new UnauthorizedException('Invalid refresh token')
    }
  }

  async logout(
    userId: UserSessionEntity['userId'],
    refresh_token: UserSessionEntity['refresh_token'],
  ) {
    const user = await this.users.findById(userId)
    if (!user) {
      throw new UnauthorizedException('Invalid access token')
    }
    const session = await this.prisma.userSession.findFirst({
      where: {
        userId: user.id,
        refresh_token,
      },
    })

    await this.prisma.userSession.delete({
      where: {
        id: session?.id,
      },
    })
  }
}
