import type { AppConfig } from '@common/config'
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
})
