import type { AppConfig } from '@common/config'
import { LegalAcceptanceRequiredError } from '@common/legal'
import { beforeEach, describe, expect, it } from '@jest/globals'
import type { ConfigService } from '@nestjs/config'
import { type PrismaMock, prismaMock, resetPrismaMock } from '@test/mocks'
import { mockDeep } from 'jest-mock-extended'
import type { TokenService } from '../tokens/token.service'
import { OAuthService } from './oauth.service'

describe('OAuthService', () => {
  let service: OAuthService
  let prisma: PrismaMock
  let token: ReturnType<typeof mockDeep<TokenService>>

  beforeEach(() => {
    resetPrismaMock()
    prisma = prismaMock
    token = mockDeep<TokenService>()
    service = new OAuthService(prisma, token, mockDeep<ConfigService<AppConfig>>())
  })

  it('persists the refresh-token expiry for OAuth sessions', async () => {
    const expiresAt = new Date('2030-01-01T00:00:00.000Z')
    token.generateAccessToken.mockResolvedValue('access-token')
    token.generateRefreshToken.mockResolvedValue('refresh-token')
    token.hashToken.mockImplementation((value) => `hashed-${value}`)
    token.getRefreshTokenExpiresAt.mockReturnValue(expiresAt)
    prisma.userSession.create.mockResolvedValue({} as never)
    const createSession = Reflect.get(service, 'createSession') as (user: {
      id: string
      username: string
    }) => Promise<unknown>

    await createSession.call(service, { id: 'user-1', username: 'user' })

    expect(prisma.userSession.create).toHaveBeenCalledWith({
      data: {
        access_token: 'hashed-access-token',
        refresh_token: 'hashed-refresh-token',
        userId: 'user-1',
        expiresAt,
      },
    })
  })

  describe('findOrCreateUserAndLogin', () => {
    const call = (
      provider: string,
      profile: { id: string; email: string; name: string },
      acceptance: { acceptLegal: boolean } = { acceptLegal: false },
    ) => {
      const findOrCreateUserAndLogin = Reflect.get(service, 'findOrCreateUserAndLogin') as (
        provider: string,
        profile: { id: string; email: string; name: string },
        acceptance: { acceptLegal: boolean },
      ) => Promise<unknown>
      return findOrCreateUserAndLogin.call(service, provider, profile, acceptance)
    }

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
