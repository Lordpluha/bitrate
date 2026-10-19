import type { PrismaService } from '@infra/prisma/prisma.service'
import type { AccountAuthStore, SessionTokens } from '@modules/auth-core'
import type { UsersPrivateService } from '@modules/users/users.private.service'
import type { UsersService } from '@modules/users/users.service'
import type { User } from '@prisma/client'

/** Listener sessions record nothing about the signing-in device. */
export type UserSessionClient = undefined

/** The listener account, session and token tables behind the shared auth core. */
export class UserAuthStore implements AccountAuthStore<User, UserSessionClient> {
  /** Creates a store over the listener tables. */
  constructor(
    private readonly prisma: PrismaService,
    private readonly users: UsersService,
    private readonly usersPrivate: UsersPrivateService,
  ) {}

  findByEmail(email: string) {
    return this.usersPrivate.getByEmail(email)
  }

  findForTwoFactorLogin(id: string) {
    return this.usersPrivate.findById(id)
  }

  findForSession(id: string) {
    return this.users.findById(id)
  }

  resetFailedLogins(id: string) {
    return this.prisma.user.update({
      where: { id },
      data: { failedLoginAttempts: 0, lockedUntil: null },
    })
  }

  async incrementFailedLogins(id: string) {
    const [updated] = await this.prisma.user.updateManyAndReturn({
      where: { id },
      data: { failedLoginAttempts: { increment: 1 } },
      select: { failedLoginAttempts: true, lockedUntil: true },
    })
    return updated
  }

  setLockedUntil(id: string, lockedUntil: Date | null) {
    return this.prisma.user.updateMany({ where: { id }, data: { lockedUntil } })
  }

  createSession(userId: string, tokens: SessionTokens) {
    return this.prisma.userSession.create({ data: { ...tokens, userId } })
  }

  rotateSession(userId: string, refreshTokenHash: string, next: SessionTokens) {
    return this.prisma.userSession.updateMany({
      where: { userId, refresh_token: refreshTokenHash },
      data: next,
    })
  }

  deleteSession(userId: string, accessTokenHash: string) {
    return this.prisma.userSession.deleteMany({
      where: { userId, access_token: accessTokenHash },
    })
  }

  async replacePasswordReset(userId: string, token: string, expiresAt: Date) {
    await this.prisma.userPasswordReset.deleteMany({ where: { userId } })
    await this.prisma.userPasswordReset.create({ data: { userId, token, expiresAt } })
  }

  async findPasswordReset(token: string) {
    const reset = await this.prisma.userPasswordReset.findUnique({ where: { token } })
    return reset && { accountId: reset.userId, expiresAt: reset.expiresAt }
  }

  applyPasswordReset(userId: string, token: string, password: string) {
    return this.prisma.$transaction([
      this.prisma.user.update({ where: { id: userId }, data: { password } }),
      this.prisma.userPasswordReset.delete({ where: { token } }),
      this.prisma.userSession.deleteMany({ where: { userId } }),
    ])
  }

  replaceEmailVerification(userId: string, token: string, expiresAt: Date) {
    return this.prisma.$transaction([
      this.prisma.userEmailVerification.deleteMany({ where: { userId } }),
      this.prisma.userEmailVerification.create({ data: { userId, token, expiresAt } }),
    ])
  }

  async findEmailVerification(token: string) {
    const verification = await this.prisma.userEmailVerification.findUnique({ where: { token } })
    return verification && { accountId: verification.userId, expiresAt: verification.expiresAt }
  }

  markEmailVerified(userId: string) {
    return this.prisma.$transaction([
      this.prisma.user.update({ where: { id: userId }, data: { emailVerifiedAt: new Date() } }),
      this.prisma.userEmailVerification.deleteMany({ where: { userId } }),
    ])
  }
}
