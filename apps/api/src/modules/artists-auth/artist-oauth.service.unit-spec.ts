import type { AppConfig } from '@common/config'
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
    const findOrCreate = Reflect.get(service, 'findOrCreateArtistAndLogin') as (
      provider: string,
      profile: { id: string; email: string; name: string },
    ) => Promise<unknown>

    await expect(
      findOrCreate.call(service, 'google', {
        id: 'provider-1',
        email: artist.email,
        name: artist.username,
      }),
    ).rejects.toThrow(UnauthorizedException)
    expect(prisma.artistSession.create).not.toHaveBeenCalled()
  })
})
