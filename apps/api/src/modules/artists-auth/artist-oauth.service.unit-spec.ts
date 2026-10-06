import type { AppConfig } from '@common/config'
import { LegalAcceptanceRequiredError } from '@common/legal'
import { beforeEach, describe, expect, it } from '@jest/globals'
import { UnauthorizedException } from '@nestjs/common'
import type { ConfigService } from '@nestjs/config'
import { type PrismaMock, prismaMock, resetPrismaMock } from '@test/mocks'
import { mockDeep } from 'jest-mock-extended'
import { buildArtist } from '../artists/__tests__/fixtures/artists.fixtures'
import type { TokenService } from '../tokens/token.service'
import { ArtistOAuthService } from './artist-oauth.service'

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
    service = new ArtistOAuthService(prisma, token, mockDeep<ConfigService<AppConfig>>())
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
    await expect(
      findOrCreate('google', {
        id: 'provider-1',
        email: artist.email,
        name: artist.username,
      }),
    ).rejects.toThrow(UnauthorizedException)
    expect(prisma.artistSession.create).not.toHaveBeenCalled()
  })

  describe('new accounts', () => {
    const profile = { id: 'provider-2', email: 'new@example.com', name: 'New' }

    beforeEach(() => {
      prisma.artistOAuthAccount.findUnique.mockResolvedValue(null)
      prisma.artist.findUnique.mockResolvedValue(null)
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
  })
})
