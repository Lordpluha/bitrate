import { PrismaService } from '@infra/prisma/prisma.service'
import { UsersPrivateService } from '@modules/users/users.private.service'
import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import type { JWTPayload } from '../tokens'
import { TokenService } from '../tokens/token.service'
import type { UserEntity } from '../users/entities'
import { UsersService } from '../users/users.service'
import type { RegistrationDto } from './dtos'
import type { UserSessionEntity } from './entities'

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
      password: await this.token.hashPassword(registrationDto.password),
      avatar: null,
      description: null,
      updatedAt: new Date(),
    })
  }

  async loginUser(email: UserEntity['email'], password: UserEntity['password']) {
    const user = await this.usersPrivate.getByEmail(email)
    const passwordValid = user && (await this.token.verifyPassword(password, user.password))
    if (!passwordValid) {
      throw new UnauthorizedException({ message: 'Invalid credentials' })
    }

    const access_token = await this.token.generateAccessToken(user.id, user.username)
    const refresh_token = await this.token.generateRefreshToken(user.id, user.username)

    await this.prisma.userSession.create({
      data: {
        access_token: this.token.hashToken(access_token),
        refresh_token: this.token.hashToken(refresh_token),
        userId: user.id,
      },
    })

    return { access_token, refresh_token }
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

      await this.prisma.userSession.updateMany({
        where: {
          userId: user.id,
          refresh_token: this.token.hashToken(refresh_token),
        },
        data: {
          access_token: this.token.hashToken(access_token),
        },
      })

      return { access_token }
    } catch {
      throw new UnauthorizedException('Invalid refresh token')
    }
  }

  async logout(
    userId: UserSessionEntity['userId'],
    access_token: UserSessionEntity['access_token'],
  ) {
    const user = await this.users.findById(userId)
    if (!user) {
      throw new UnauthorizedException('Invalid access token')
    }

    await this.prisma.userSession.deleteMany({
      where: {
        userId: user.id,
        access_token: this.token.hashToken(access_token),
      },
    })
  }
}
