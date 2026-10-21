import type { AppConfig } from '@common/config'
import { LegalAcceptanceRequiredError } from '@common/legal'
import type { MailService } from '@infra/mail/mail.service'
import { beforeEach, describe, expect, it } from '@jest/globals'
import type { ConfigService } from '@nestjs/config'
import type { JwtService } from '@nestjs/jwt'
import { type PrismaMock, prismaMock, resetPrismaMock } from '@test/mocks'
import { mockDeep } from 'jest-mock-extended'
import type { TokenService } from '../tokens/token.service'
import type { UsersPrivateService } from '../users/users.private.service'
import type { UsersService } from '../users/users.service'
import { OAuthService } from './oauth.service'
import { UserAuthService } from './user-auth.service'

describe('OAuthService', () => {
  let service: OAuthService
  let prisma: PrismaMock
  let token: ReturnType<typeof mockDeep<TokenService>>

  const callFindOrCreate = (
    provider: string,
    profile: { id: string; email: string; name: string },
    acceptance: { acceptLegal: boolean } = { acceptLegal: false },
  ) =>
    (
      Reflect.get(service, 'findOrCreateUserAndLogin') as (
        provider: string,
        profile: { id: string; email: string; name: string },
        acceptance: { acceptLegal: boolean },
      ) => Promise<unknown>
    ).call(service, provider, profile, acceptance)

  beforeEach(() => {
    resetPrismaMock()
    prisma = prismaMock
    token = mockDeep<TokenService>()
    // The real auth service, so the session and 2FA branch are the ones password login uses.
    const auth = new UserAuthService(
      mockDeep<UsersService>(),
      mockDeep<UsersPrivateService>(),
      mockDeep<JwtService>(),
      prisma,
      token,
      mockDeep<MailService>(),
    )
    service = new OAuthService(prisma, auth, mockDeep<ConfigService<AppConfig>>())
  })

  const linkedAccount = (user: { id: string; twoFactorEnabled: boolean }) =>
    prisma.userOAuthAccount.findUnique.mockResolvedValue({
      user: { ...user, username: 'user', deletedAt: null },
    } as never)

  it('persists the refresh-token expiry for OAuth sessions', async () => {
    const expiresAt = new Date('2030-01-01T00:00:00.000Z')
    token.generateAccessToken.mockResolvedValue('access-token')
    token.generateRefreshToken.mockResolvedValue('refresh-token')
    token.hashToken.mockImplementation((value) => `hashed-${value}`)
    token.getRefreshTokenExpiresAt.mockReturnValue(expiresAt)
    prisma.userSession.create.mockResolvedValue({} as never)
    linkedAccount({ id: 'user-1', twoFactorEnabled: false })

    const result = await callFindOrCreate('google', {
      id: 'google-1',
      email: 'user@example.com',
      name: 'User',
    })

    expect(prisma.userSession.create).toHaveBeenCalledWith({
      data: {
        access_token: 'hashed-access-token',
        refresh_token: 'hashed-refresh-token',
        userId: 'user-1',
        expiresAt,
      },
    })
    expect(result).toEqual({ access_token: 'access-token', refresh_token: 'refresh-token' })
  })

  it('asks a linked account with 2FA for its code instead of opening a session', async () => {
    token.generateTwoFAPendingToken.mockResolvedValue('pending-token')
    linkedAccount({ id: 'user-2', twoFactorEnabled: true })

    const result = await callFindOrCreate('google', {
      id: 'google-2',
      email: 'user@example.com',
      name: 'User',
    })

    expect(result).toEqual({ requires2fa: true, pendingToken: 'pending-token' })
    expect(token.generateTwoFAPendingToken).toHaveBeenCalledWith('user-2')
    expect(prisma.userSession.create).not.toHaveBeenCalled()
  })

  describe('findOrCreateUserAndLogin', () => {
    const call = callFindOrCreate

    /** A linked OAuth account whose user was soft-deleted after the link was created must not
     * be handed a fresh session — the same account state `UserAuthGuard` rejects per request. */
    it('rejects when the linked account is soft-deleted', async () => {
      prisma.userOAuthAccount.findUnique.mockResolvedValue({
        id: 'link-1',
        provider: 'google',
        providerAccountId: 'google-1',
        userId: 'user-1',
        createdAt: new Date(),
        user: { id: 'user-1', username: 'user', twoFactorEnabled: false, deletedAt: new Date() },
      } as never)

      await expect(
        call('google', { id: 'google-1', email: 'user@example.com', name: 'User' }),
      ).rejects.toThrow('Invalid credentials')
      expect(prisma.userSession.create).not.toHaveBeenCalled()
    })

    it('loads only the sign-in fields of a linked account, never its password hash', async () => {
      prisma.userOAuthAccount.findUnique.mockResolvedValue({
        user: { id: 'user-6', username: 'old', twoFactorEnabled: false, deletedAt: null },
      } as never)
      prisma.userSession.create.mockResolvedValue({} as never)

      await call('google', { id: 'google-6', email: 'old@example.com', name: 'Old' })

      expect(prisma.userOAuthAccount.findUnique).toHaveBeenCalledWith({
        where: {
          provider_providerAccountId: { provider: 'google', providerAccountId: 'google-6' },
        },
        select: {
          user: { select: { id: true, username: true, twoFactorEnabled: true, deletedAt: true } },
        },
      })
    })

    /** A soft-deleted account's email is free to re-register through OAuth, matching every
     * other lookup this module makes — it must not be reused as if it were still active. */
    it('excludes a soft-deleted account when checking for an existing email', async () => {
      prisma.userOAuthAccount.findUnique.mockResolvedValue(null)
      prisma.user.findFirst.mockResolvedValue(null)

      await call('google', { id: 'google-2', email: 'user@example.com', name: 'User' }).catch(
        () => undefined,
      )

      expect(prisma.user.findFirst).toHaveBeenCalledWith({
        where: { email: 'user@example.com', deletedAt: null },
      })
    })

    it('refuses to create a new account when the legal documents were not accepted', async () => {
      prisma.userOAuthAccount.findUnique.mockResolvedValue(null)
      prisma.user.findFirst.mockResolvedValue(null)

      await expect(
        call('google', { id: 'google-3', email: 'new@example.com', name: 'New' }),
      ).rejects.toBeInstanceOf(LegalAcceptanceRequiredError)
      expect(prisma.user.create).not.toHaveBeenCalled()
    })

    it('records the accepted revision and time on a newly created account', async () => {
      prisma.userOAuthAccount.findUnique.mockResolvedValue(null)
      prisma.user.findFirst.mockResolvedValue(null)
      prisma.user.create.mockResolvedValue({
        id: 'user-9',
        username: 'new',
        twoFactorEnabled: false,
      } as never)
      prisma.userOAuthAccount.create.mockResolvedValue({} as never)
      prisma.userSession.create.mockResolvedValue({} as never)

      await call(
        'google',
        { id: 'google-4', email: 'new@example.com', name: 'New' },
        { acceptLegal: true },
      )

      expect(prisma.user.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          email: 'new@example.com',
          legalVersion: expect.stringMatching(/^\d{4}-\d{2}-\d{2}$/),
          legalAcceptedAt: expect.any(Date),
        }),
      })
    })

    /** A failure after a separate user write would leave an account no provider can sign in to. */
    it('creates a new user and its OAuth link in one write', async () => {
      prisma.userOAuthAccount.findUnique.mockResolvedValue(null)
      prisma.user.findFirst.mockResolvedValue(null)
      prisma.user.create.mockResolvedValue({
        id: 'user-10',
        username: 'new',
        twoFactorEnabled: false,
      } as never)
      prisma.userSession.create.mockResolvedValue({} as never)

      await call(
        'google',
        { id: 'google-10', email: 'new@example.com', name: 'New' },
        { acceptLegal: true },
      )

      expect(prisma.user.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          oauthAccounts: { create: { provider: 'google', providerAccountId: 'google-10' } },
        }),
      })
      expect(prisma.userOAuthAccount.create).not.toHaveBeenCalled()
    })

    it('links a provider to an existing password-less account', async () => {
      prisma.userOAuthAccount.findUnique.mockResolvedValue(null)
      prisma.user.findFirst.mockResolvedValue({
        id: 'user-11',
        username: 'oauth-only',
        password: null,
        twoFactorEnabled: false,
      } as never)
      prisma.userOAuthAccount.create.mockResolvedValue({} as never)
      prisma.userSession.create.mockResolvedValue({} as never)

      await call('facebook', { id: 'fb-11', email: 'oauth@example.com', name: 'OAuth' })

      expect(prisma.user.create).not.toHaveBeenCalled()
      expect(prisma.userOAuthAccount.create).toHaveBeenCalledWith({
        data: { userId: 'user-11', provider: 'facebook', providerAccountId: 'fb-11' },
      })
    })

    it('still signs in an already linked account without asking for acceptance again', async () => {
      prisma.userOAuthAccount.findUnique.mockResolvedValue({
        id: 'link-2',
        provider: 'google',
        providerAccountId: 'google-5',
        userId: 'user-5',
        createdAt: new Date(),
        user: { id: 'user-5', username: 'old', twoFactorEnabled: false, deletedAt: null },
      } as never)
      prisma.userSession.create.mockResolvedValue({} as never)

      await expect(
        call('google', { id: 'google-5', email: 'old@example.com', name: 'Old' }),
      ).resolves.toBeDefined()
      expect(prisma.user.create).not.toHaveBeenCalled()
    })
  })
})
