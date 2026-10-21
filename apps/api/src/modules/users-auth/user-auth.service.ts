import type { LoginResult } from '@common/auth.types'
import { LEGAL_VERSION } from '@common/legal'
import { MailService } from '@infra/mail/mail.service'
import {
  DEFAULT_MAIL_LOCALE,
  type MailLocale,
  resolveMailLocale,
} from '@infra/mail/templates/mail-locale'
import { PrismaService } from '@infra/prisma/prisma.service'
import { AccountAuthCore, type SignInAccount } from '@modules/auth-core'
import { UsersPrivateService } from '@modules/users/users.private.service'
import {
  BadRequestException,
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import type { User } from '@prisma/client'
import { TokenService } from '../tokens/token.service'
import { UsersService } from '../users/users.service'
import type { RegistrationDto } from './dtos'
import type { UserSessionEntity } from './entities'
import { UserAuthStore, type UserSessionClient } from './user-auth.store'

/** Represents the user auth service. */
@Injectable()
export class UserAuthService {
  /** Login, lockout, sessions and recovery tokens, shared with artists. */
  private readonly core: AccountAuthCore<User, UserSessionClient>

  /** Creates a new instance. */
  constructor(
    private users: UsersService,
    private usersPrivate: UsersPrivateService,
    jwt: JwtService,
    private prisma: PrismaService,
    private token: TokenService,
    private mail: MailService,
  ) {
    this.core = new AccountAuthCore(new UserAuthStore(prisma, users, usersPrivate), token, jwt, {
      audience: 'user',
      twoFactorAccountMissing: () => new UnauthorizedException({ message: 'Invalid credentials' }),
    })
  }

  /**
   * Runs the register user operation. `acceptLanguage` is the raw request header value —
   * the only point in the account's lifetime this reads it. From here on the stored
   * `locale` column, not a live request, drives every transactional email.
   */
  async registerUser(registrationDto: RegistrationDto, acceptLanguage?: string) {
    const user = await this.users.getByEmail(registrationDto.email)

    if (user) {
      throw new ConflictException('User with this email already exists')
    }

    const locale = resolveMailLocale(acceptLanguage?.split(',')[0]?.split('-')[0])

    const createdUser = await this.users.create({
      username: registrationDto.username,
      email: registrationDto.email,
      password: await this.token.hashPassword(registrationDto.password),
      avatar: null,
      description: null,
      updatedAt: new Date(),
      locale,
      legalVersion: LEGAL_VERSION,
      legalAcceptedAt: new Date(),
    })

    await this.issueEmailVerification(
      createdUser.id,
      createdUser.email,
      createdUser.username,
      locale,
    )
    return { requiresEmailVerification: true as const }
  }

  /** Runs the login user operation. */
  loginUser(email: string, password: string): Promise<LoginResult> {
    return this.core.login(email, password, undefined)
  }

  /** Signs in an account whose identity a social provider proved: 2FA challenge or session. */
  signInVerified(user: SignInAccount): Promise<LoginResult> {
    return this.core.issueSessionOrChallenge(user, undefined)
  }

  /** Runs the complete two factor login operation. */
  completeTwoFactorLogin(userId: string) {
    return this.core.completeTwoFactorLogin(userId, undefined)
  }

  /** Runs the refresh operation. */
  refresh(refresh_token: string) {
    return this.core.refresh(refresh_token, undefined)
  }

  /** Runs the logout operation. */
  logout(userId: UserSessionEntity['userId'], access_token: UserSessionEntity['access_token']) {
    return this.core.logout(userId, access_token)
  }

  /** Runs the forgot password operation. Unknown emails return silently. */
  async forgotPassword(email: string) {
    const reset = await this.core.createPasswordReset(email)
    if (!reset) return

    await this.mail.sendPasswordReset(
      reset.account.email,
      reset.rawToken,
      reset.account.username,
      resolveMailLocale(reset.account.locale),
    )
  }

  /** Runs the reset password operation. */
  resetPassword(rawToken: string, newPassword: string) {
    return this.core.resetPassword(rawToken, newPassword)
  }

  /** Verifies an email token once and removes all outstanding tokens for the user. */
  verifyEmail(rawToken: string) {
    return this.core.verifyEmail(rawToken)
  }

  /** Reissues email verification without revealing whether the account exists. */
  async resendEmailVerification(email: string) {
    const user = await this.usersPrivate.getByEmail(email)
    if (!user || user.emailVerifiedAt) return
    await this.issueEmailVerification(
      user.id,
      user.email,
      user.username,
      resolveMailLocale(user.locale),
    )
  }

  /** Lists active sessions without exposing token hashes. */
  async getSessions(userId: string, currentAccessToken?: string) {
    const currentHash = currentAccessToken ? this.token.hashToken(currentAccessToken) : null
    const sessions = await this.prisma.userSession.findMany({
      where: { userId, expiresAt: { gt: new Date() } },
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

  private async issueEmailVerification(
    userId: string,
    email: string,
    username: string,
    locale: MailLocale = DEFAULT_MAIL_LOCALE,
  ) {
    const rawToken = await this.core.issueEmailVerificationToken(userId)
    await this.mail.sendEmailVerification(email, rawToken, username, locale)
  }
}
