import { randomBytes } from 'node:crypto'
import { MailService } from '@infra/mail/mail.service'
import { PrismaService } from '@infra/prisma/prisma.service'
import { UsersPrivateService } from '@modules/users/users.private.service'
import {
  BadRequestException,
  ConflictException,
  HttpException,
  HttpStatus,
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
  private static readonly MAX_LOGIN_ATTEMPTS = 5
  private static readonly LOCK_DURATION_MS = 15 * 60 * 1000

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

    const createdUser = await this.users.create({
      username: registrationDto.username,
      email: registrationDto.email,
      password: await this.token.hashPassword(registrationDto.password),
      avatar: null,
      description: null,
      updatedAt: new Date(),
    })

    await this.issueEmailVerification(createdUser.id, createdUser.email, createdUser.username)
    return { requiresEmailVerification: true as const }
  }

  /** Runs the login user operation. */
  async loginUser(email: string, password: string) {
    const user = await this.usersPrivate.getByEmail(email)
    if (user?.lockedUntil && user.lockedUntil > new Date()) {
      throw new HttpException('Account is temporarily locked', HttpStatus.TOO_MANY_REQUESTS)
    }

    const passwordValid =
      user?.password && (await this.token.verifyPassword(password, user.password))
    if (!passwordValid) {
      if (user) await this.recordFailedLogin(user.id, user.failedLoginAttempts)
      throw new UnauthorizedException({ message: 'Invalid credentials' })
    }

    if (!user.emailVerifiedAt) {
      throw new UnauthorizedException({ message: 'Email address is not verified' })
    }

    if (user.failedLoginAttempts > 0 || user.lockedUntil) {
      await this.prisma.user.update({
        where: { id: user.id },
        data: { failedLoginAttempts: 0, lockedUntil: null },
      })
    }

    if (user.twoFactorEnabled) {
      const pendingToken = await this.token.generateTwoFAPendingToken(user.id)
      return { requires2fa: true as const, pendingToken }
    }

    const access_token = await this.token.generateAccessToken(user.id, user.username, 'user')
    const refresh_token = await this.token.generateRefreshToken(user.id, user.username, 'user')

    await this.prisma.userSession.create({
      data: {
        access_token: this.token.hashToken(access_token),
        refresh_token: this.token.hashToken(refresh_token),
        userId: user.id,
        expiresAt: this.token.getRefreshTokenExpiresAt(),
      },
    })

    return { access_token, refresh_token }
  }

  /** Runs the complete two factor login operation. */
  async completeTwoFactorLogin(userId: string) {
    const user = await this.usersPrivate.findById(userId)
    const access_token = await this.token.generateAccessToken(user.id, user.username, 'user')
    const refresh_token = await this.token.generateRefreshToken(user.id, user.username, 'user')

    await this.prisma.userSession.create({
      data: {
        access_token: this.token.hashToken(access_token),
        refresh_token: this.token.hashToken(refresh_token),
        userId: user.id,
        expiresAt: this.token.getRefreshTokenExpiresAt(),
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
      const access_token = await this.token.generateAccessToken(user.id, user.username, 'user')
      const next_refresh_token = await this.token.generateRefreshToken(
        user.id,
        user.username,
        'user',
      )

      const updatedSessions = await this.prisma.userSession.updateMany({
        where: {
          userId: user.id,
          refresh_token: this.token.hashToken(refresh_token),
        },
        data: {
          access_token: this.token.hashToken(access_token),
          refresh_token: this.token.hashToken(next_refresh_token),
          expiresAt: this.token.getRefreshTokenExpiresAt(),
        },
      })

      if (updatedSessions.count !== 1) {
        throw new UnauthorizedException('Invalid refresh token')
      }

      return { access_token, refresh_token: next_refresh_token }
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

  /** Verifies an email token once and removes all outstanding tokens for the user. */
  async verifyEmail(rawToken: string) {
    const verification = await this.prisma.userEmailVerification.findUnique({
      where: { token: this.token.hashToken(rawToken) },
    })
    if (!verification || verification.expiresAt < new Date()) {
      throw new BadRequestException('Invalid or expired verification token')
    }

    await this.prisma.$transaction([
      this.prisma.user.update({
        where: { id: verification.userId },
        data: { emailVerifiedAt: new Date() },
      }),
      this.prisma.userEmailVerification.deleteMany({
        where: { userId: verification.userId },
      }),
    ])
  }

  /** Reissues email verification without revealing whether the account exists. */
  async resendEmailVerification(email: string) {
    const user = await this.usersPrivate.getByEmail(email)
    if (!user || user.emailVerifiedAt) return
    await this.issueEmailVerification(user.id, user.email, user.username)
  }

  /** Lists active sessions without exposing token hashes. */
  async getSessions(userId: string, currentAccessToken?: string) {
    const currentHash = currentAccessToken ? this.token.hashToken(currentAccessToken) : null
    const sessions = await this.prisma.userSession.findMany({
      where: { userId, OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }] },
      orderBy: { createdAt: 'desc' },
      select: { id: true, createdAt: true, expiresAt: true, access_token: true },
    })
    return sessions.map(({ access_token, ...session }) => ({
      ...session,
      current: access_token === currentHash,
    }))
  }

  /** Revokes one session owned by the authenticated user. */
  async revokeSession(userId: string, sessionId: string) {
    const result = await this.prisma.userSession.deleteMany({ where: { id: sessionId, userId } })
    if (result.count === 0) throw new BadRequestException('Session not found')
  }

  /** Revokes all sessions except the current one. */
  async revokeOtherSessions(userId: string, accessToken: string) {
    await this.prisma.userSession.deleteMany({
      where: { userId, access_token: { not: this.token.hashToken(accessToken) } },
    })
  }

  private async issueEmailVerification(userId: string, email: string, username: string) {
    const rawToken = randomBytes(32).toString('hex')
    await this.prisma.$transaction([
      this.prisma.userEmailVerification.deleteMany({ where: { userId } }),
      this.prisma.userEmailVerification.create({
        data: {
          userId,
          token: this.token.hashToken(rawToken),
          expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
        },
      }),
    ])
    await this.mail.sendEmailVerification(email, rawToken, username)
  }

  private async recordFailedLogin(userId: string, attempts: number) {
    const nextAttempts = attempts + 1
    await this.prisma.user.update({
      where: { id: userId },
      data: {
        failedLoginAttempts: nextAttempts,
        lockedUntil:
          nextAttempts >= UserAuthService.MAX_LOGIN_ATTEMPTS
            ? new Date(Date.now() + UserAuthService.LOCK_DURATION_MS)
            : null,
      },
    })
  }
}
