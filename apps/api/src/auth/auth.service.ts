import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { PrismaService } from 'src/prisma/prisma.service'
import { UserEntity } from '../users/entities'
import { UsersService } from '../users/users.service'
import { RegistrationDto } from './dtos'
import { SessionEntity } from './entities'
import { TokenService } from './token.service'
import { JWTPayload } from './types'

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private prisma: PrismaService,
    private tokenService: TokenService,
  ) {}

  async registerUser(registrationDto: RegistrationDto) {
    const user = await this.usersService.getByEmail(registrationDto.email)

    if (user) {
      throw new ConflictException('User with this email already exists')
    }

    await this.usersService.create({
      username: registrationDto.username,
      email: registrationDto.email,
      password: registrationDto.password,
      avatar: null,
      description: null,
    })
  }

  async loginUser(email: UserEntity['email'], password: UserEntity['password']) {
    const user = await this.usersService.getByEmail_UNSECURE(email)
    if (!user || user?.password !== password) {
      throw new UnauthorizedException({
        message: 'Invalid credentials',
      })
    }

    const access_token = await this.tokenService.generateAccessToken(user.id, user.username)
    const refresh_token = await this.tokenService.generateRefreshToken(user.id, user.username)

    const session = await this.prisma.session.create({
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
      const payload = await this.jwtService.verifyAsync<JWTPayload>(refresh_token, {
        secret: process.env.REFRESH_TOKEN_SECRET,
      })
      const user = await this.usersService.getByUsername(payload.username)
      if (!user) {
        throw new UnauthorizedException('Invalid refresh token')
      }
      return {
        access_token: await this.tokenService.generateAccessToken(user.id, user.username),
      }
    } catch {
      throw new UnauthorizedException('Invalid refresh token')
    }
  }

  async logout(userId: SessionEntity['userId'], refresh_token: SessionEntity['refresh_token']) {
    const user = await this.usersService.findById(userId)
    if (!user) {
      throw new UnauthorizedException('Invalid access token')
    }
    const session = await this.prisma.session.findFirst({
      where: {
        userId: user.id,
        refresh_token,
      },
    })

    await this.prisma.session.delete({
      where: {
        id: session?.id,
      },
    })
  }
}
