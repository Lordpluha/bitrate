import { randomBytes } from 'node:crypto'
import { MailService } from '@infra/mail/mail.service'
import { PrismaService } from '@infra/prisma/prisma.service'
import { UsersPrivateService } from '@modules/users/users.private.service'
import {
  BadRequestException,
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import type { JWTPayload } from '../tokens'
import { TokenService } from '../tokens/token.service'
import { UsersService } from '../users/users.service'
import type { RegistrationDto } from './dtos'
import type { UserSessionEntity } from './entities'

/** Represents the user auth service. */
@Injectable()
export class UserAuthService {
  /** Creates a new instance. */
  constructor(
    private users: UsersService,
    private usersPrivate: UsersPrivateService,
    private jwt: JwtService,
    private prisma: PrismaService,
    private token: TokenService,
    private mail: MailService,
  ) {}

  /** Runs the register user operation. */
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

  /** Runs the login user operation. */
  async loginUser(email: string, password: string) {
    const user = await this.usersPrivate.getByEmail(email)
    const passwordValid =
      user?.password && (await this.token.verifyPassword(password, user.password))
    if (!passwordValid) {
      throw new UnauthorizedException({ message: 'Invalid credentials' })
    }

    if (user.twoFactorEnabled) {
      const pendingToken = await this.token.generateTwoFAPendingToken(user.id)
      return { requires2fa: true as const, pendingToken }
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

  /** Runs the complete two factor login operation. */
  async completeTwoFactorLogin(userId: string) {
    const user = await this.usersPrivate.findById(userId)
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

  /** Runs the refresh operation. */
  async refresh(refresh_token: string) {
    try {
      const payload = await this.jwt.verifyAsync<JWTPayload>(refresh_token, {
        secret: process.env.JWT_SECRET,
      })
      const user = await this.users.findById(payload.sub)
      const access_token = await this.token.generateAccessToken(user.id, user.username)

      const updatedSessions = await this.prisma.userSession.updateMany({
        where: {
          userId: user.id,
          refresh_token: this.token.hashToken(refresh_token),
        },
        data: { access_token: this.token.hashToken(access_token) },
      })

      if (updatedSessions.count !== 1) {
        throw new UnauthorizedException('Invalid refresh token')
      }

      return { access_token }
    } catch {
      throw new UnauthorizedException('Invalid refresh token')
    }
  }

  /** Runs the logout operation. */
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

  /** Runs the forgot password operation. */
  async forgotPassword(email: string) {
    const user = await this.usersPrivate.getByEmail(email)
    if (!user) return // don't reveal whether the email exists

    await this.prisma.userPasswordReset.deleteMany({ where: { userId: user.id } })

    const rawToken = randomBytes(32).toString('hex')
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000) // 1 hour

    await this.prisma.userPasswordReset.create({
      data: { userId: user.id, token: this.token.hashToken(rawToken), expiresAt },
    })

    await this.mail.sendPasswordReset(user.email, rawToken, user.username)
  }

  /** Runs the reset password operation. */
  async resetPassword(rawToken: string, newPassword: string) {
    const hashed = this.token.hashToken(rawToken)
    const reset = await this.prisma.userPasswordReset.findUnique({ where: { token: hashed } })

    if (!reset || reset.expiresAt < new Date()) {
      throw new BadRequestException('Invalid or expired reset token')
    }

    const hashedPassword = await this.token.hashPassword(newPassword)

    await this.prisma.$transaction([
      this.prisma.user.update({ where: { id: reset.userId }, data: { password: hashedPassword } }),
      this.prisma.userPasswordReset.delete({ where: { token: hashed } }),
      this.prisma.userSession.deleteMany({ where: { userId: reset.userId } }),
    ])
  }
}
