import type { AppConfig } from '@common/config'
import { LegalAcceptanceRequiredError } from '@common/legal'
import type { MailService } from '@infra/mail/mail.service'
import { beforeEach, describe, expect, it } from '@jest/globals'
import { UnauthorizedException } from '@nestjs/common'
import type { ConfigService } from '@nestjs/config'
import type { JwtService } from '@nestjs/jwt'
import { type PrismaMock, prismaMock, resetPrismaMock } from '@test/mocks'
import { mockDeep } from 'jest-mock-extended'
import { buildArtist } from '../artists/__tests__/fixtures/artists.fixtures'
import type { ArtistsPrivateService } from '../artists/artists.private.service'
import type { ArtistsService } from '../artists/artists.service'
import type { TokenService } from '../tokens/token.service'
import type { ArtistEmailCodeService } from './artist-email-code.service'
import { ArtistOAuthService } from './artist-oauth.service'
import { ArtistsAuthService } from './artists-auth.service'

describe('ArtistOAuthService', () => {
  let service: ArtistOAuthService
  let prisma: PrismaMock
  let token: ReturnType<typeof mockDeep<TokenService>>

  const findOrCreate = (
    provider: string,
    profile: { id: string; email: string; name: string },
    acceptance: { acceptLegal: boolean; acceptArtistAgreement: boolean } = {
      acceptLegal: false,
      acceptArtistAgreement: false,
    },
  ) =>
    (
      Reflect.get(service, 'findOrCreateArtistAndLogin') as (
        provider: string,
        profile: { id: string; email: string; name: string },
        acceptance: { acceptLegal: boolean; acceptArtistAgreement: boolean },
      ) => Promise<unknown>
    ).call(service, provider, profile, acceptance)

  beforeEach(() => {
    resetPrismaMock()
    prisma = prismaMock
    token = mockDeep<TokenService>()
    // The real auth service, so the session and 2FA branch are the ones password login uses.
    const auth = new ArtistsAuthService(
      mockDeep<ArtistsService>(),
      mockDeep<ArtistsPrivateService>(),
      mockDeep<JwtService>(),
      prisma,
      token,
      mockDeep<MailService>(),
      mockDeep<ArtistEmailCodeService>(),
    )
    service = new ArtistOAuthService(prisma, auth, mockDeep<ConfigService<AppConfig>>())
  })

  it('opens a session that records the signing-in device', async () => {
    const expiresAt = new Date('2030-01-01T00:00:00.000Z')
    token.generateAccessToken.mockResolvedValue('access-token')
    token.generateRefreshToken.mockResolvedValue('refresh-token')
    token.hashToken.mockImplementation((value) => `hashed-${value}`)
    token.getRefreshTokenExpiresAt.mockReturnValue(expiresAt)
    prisma.artistOAuthAccount.findUnique.mockResolvedValue({
      artist: { id: 'artist-1', username: 'old', twoFactorEnabled: false, deletedAt: null },
    } as never)
    prisma.artistSession.create.mockResolvedValue({} as never)

    const result = await (
      Reflect.get(service, 'findOrCreateArtistAndLogin') as (...args: unknown[]) => Promise<unknown>
    ).call(
      service,
      'google',
      { id: 'provider-1', email: 'old@example.com', name: 'Old' },
      { acceptLegal: false, acceptArtistAgreement: false },
      { userAgent: 'Firefox' },
    )

    expect(prisma.artistSession.create).toHaveBeenCalledWith({
      data: {
        access_token: 'hashed-access-token',
        refresh_token: 'hashed-refresh-token',
        artistId: 'artist-1',
        expiresAt,
        lastUsedAt: expect.any(Date),
        userAgent: 'Firefox',
      },
    })
    expect(result).toEqual({ access_token: 'access-token', refresh_token: 'refresh-token' })
  })

  it('asks a linked artist with 2FA for its code instead of opening a session', async () => {
    token.generateTwoFAPendingToken.mockResolvedValue('pending-token')
    prisma.artistOAuthAccount.findUnique.mockResolvedValue({
      artist: { id: 'artist-2', username: 'old', twoFactorEnabled: true, deletedAt: null },
    } as never)

    const result = await findOrCreate('google', {
      id: 'provider-2',
      email: 'old@example.com',
      name: 'Old',
    })

    expect(result).toEqual({ requires2fa: true, pendingToken: 'pending-token' })
    expect(prisma.artistSession.create).not.toHaveBeenCalled()
  })

  it('rejects an OAuth account whose artist was soft-deleted', async () => {
    const artist = buildArtist({ deletedAt: new Date() })
    prisma.artistOAuthAccount.findUnique.mockResolvedValue({
      id: 'oauth-1',
      artistId: artist.id,
      provider: 'google',
      providerAccountId: 'provider-1',
      createdAt: new Date(),
      artist,
    } as never)
    const failure = findOrCreate('google', {
      id: 'provider-1',
      email: artist.email,
      name: artist.username,
    })
    await expect(failure).rejects.toThrow(UnauthorizedException)
    await expect(failure).rejects.toMatchObject({ reason: 'account_unavailable' })
    expect(prisma.artistSession.create).not.toHaveBeenCalled()
  })

  describe('existing accounts with the same email', () => {
    const profile = { id: 'provider-20', email: 'Owner@Example.com', name: 'Owner' }

    beforeEach(() => {
      prisma.artistOAuthAccount.findUnique.mockResolvedValue(null)
    })

    /** The provider vouches for the address and the artist already proved it owns it. */
    it('links the provider to an artist whose email is verified and signs in', async () => {
      prisma.artist.findFirst.mockResolvedValue(
        buildArtist({ id: 'artist-20', emailVerifiedAt: new Date(), twoFactorEnabled: false }),
      )
      prisma.artistOAuthAccount.create.mockResolvedValue({} as never)
      prisma.artistSession.create.mockResolvedValue({} as never)
      token.generateAccessToken.mockResolvedValue('access-token')
      token.generateRefreshToken.mockResolvedValue('refresh-token')

      await expect(findOrCreate('google', profile)).resolves.toEqual(
        expect.objectContaining({ access_token: 'access-token' }),
      )
      expect(prisma.artistOAuthAccount.create).toHaveBeenCalledWith({
        data: { artistId: 'artist-20', provider: 'google', providerAccountId: 'provider-20' },
      })
      expect(prisma.artist.create).not.toHaveBeenCalled()
    })

    it('keeps 2FA in front of an artist it links by email', async () => {
      prisma.artist.findFirst.mockResolvedValue(
        buildArtist({ id: 'artist-21', emailVerifiedAt: new Date(), twoFactorEnabled: true }),
      )
      prisma.artistOAuthAccount.create.mockResolvedValue({} as never)
      token.generateTwoFAPendingToken.mockResolvedValue('pending-token')

      await expect(findOrCreate('facebook', profile)).resolves.toEqual({
        requires2fa: true,
        pendingToken: 'pending-token',
      })
      expect(prisma.artistSession.create).not.toHaveBeenCalled()
    })

    it('refuses to link an artist whose email is not verified', async () => {
      prisma.artist.findFirst.mockResolvedValue(
        buildArtist({ id: 'artist-22', emailVerifiedAt: null }),
      )

      await expect(findOrCreate('google', profile)).rejects.toMatchObject({
        reason: 'account_exists',
      })
      expect(prisma.artistOAuthAccount.create).not.toHaveBeenCalled()
      expect(prisma.artistSession.create).not.toHaveBeenCalled()
    })

    it('refuses a soft-deleted artist with that email', async () => {
      prisma.artist.findFirst.mockResolvedValue(buildArtist({ deletedAt: new Date() }))

      await expect(findOrCreate('google', profile)).rejects.toMatchObject({
        reason: 'account_unavailable',
      })
      expect(prisma.artistOAuthAccount.create).not.toHaveBeenCalled()
    })
  })

  it('loads only the sign-in fields of a linked artist, never its password hash', async () => {
    prisma.artistOAuthAccount.findUnique.mockResolvedValue({
      artist: { id: 'artist-6', username: 'old', twoFactorEnabled: false, deletedAt: null },
    } as never)
    prisma.artistSession.create.mockResolvedValue({} as never)

    await findOrCreate('google', { id: 'provider-6', email: 'old@example.com', name: 'Old' })

    expect(prisma.artistOAuthAccount.findUnique).toHaveBeenCalledWith({
      where: {
        provider_providerAccountId: { provider: 'google', providerAccountId: 'provider-6' },
      },
      select: {
        artist: { select: { id: true, username: true, twoFactorEnabled: true, deletedAt: true } },
      },
    })
  })

  describe('new accounts', () => {
    const profile = { id: 'provider-2', email: 'new@example.com', name: 'New' }

    beforeEach(() => {
      prisma.artistOAuthAccount.findUnique.mockResolvedValue(null)
      prisma.artist.findFirst.mockResolvedValue(null)
    })

    it('refuses to auto-link an existing account whose address differs only in case', async () => {
      prisma.artist.findFirst.mockResolvedValue({ id: 'artist-1', deletedAt: null } as never)

      await expect(
        findOrCreate(
          'google',
          { ...profile, email: 'New@Example.com' },
          {
            acceptLegal: true,
            acceptArtistAgreement: true,
          },
        ),
      ).rejects.toThrow('already exists')
      await expect(
        findOrCreate('google', { ...profile, email: 'New@Example.com' }),
      ).rejects.toMatchObject({ reason: 'account_exists' })
      expect(prisma.artist.findFirst).toHaveBeenCalledWith({
        where: { email: { equals: 'New@Example.com', mode: 'insensitive' } },
      })
      expect(prisma.artist.create).not.toHaveBeenCalled()
    })

    it.each([
      ['neither document is accepted', { acceptLegal: false, acceptArtistAgreement: false }],
      [
        'only the Terms and Privacy Policy are accepted',
        { acceptLegal: true, acceptArtistAgreement: false },
      ],
      [
        'only the Artist Agreement is accepted',
        { acceptLegal: false, acceptArtistAgreement: true },
      ],
    ])('refuses to create an artist when %s', async (_label, acceptance) => {
      await expect(findOrCreate('google', profile, acceptance)).rejects.toBeInstanceOf(
        LegalAcceptanceRequiredError,
      )
      expect(prisma.artist.create).not.toHaveBeenCalled()
    })

    it('records both accepted revisions and times on the created artist', async () => {
      prisma.artist.create.mockResolvedValue({
        id: 'artist-9',
        username: 'new',
        twoFactorEnabled: false,
      } as never)
      prisma.artistOAuthAccount.create.mockResolvedValue({} as never)
      prisma.artistSession.create.mockResolvedValue({} as never)

      await findOrCreate('google', profile, { acceptLegal: true, acceptArtistAgreement: true })

      expect(prisma.artist.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          email: 'new@example.com',
          legalVersion: expect.stringMatching(/^\d{4}-\d{2}-\d{2}$/),
          legalAcceptedAt: expect.any(Date),
          artistAgreementVersion: expect.stringMatching(/^\d{4}-\d{2}-\d{2}$/),
          artistAgreementAcceptedAt: expect.any(Date),
        }),
      })
    })

    /** A failure after a separate artist write would leave an account no provider can sign in to. */
    it('creates the artist and its OAuth link in one write', async () => {
      prisma.artist.create.mockResolvedValue({
        id: 'artist-10',
        username: 'new',
        twoFactorEnabled: false,
      } as never)
      prisma.artistSession.create.mockResolvedValue({} as never)

      await findOrCreate('google', profile, { acceptLegal: true, acceptArtistAgreement: true })

      expect(prisma.artist.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          oauthAccounts: { create: { provider: 'google', providerAccountId: 'provider-2' } },
        }),
      })
      expect(prisma.artistOAuthAccount.create).not.toHaveBeenCalled()
    })
  })
})
