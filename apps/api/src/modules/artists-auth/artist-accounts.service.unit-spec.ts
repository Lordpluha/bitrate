import { beforeEach, describe, expect, it } from '@jest/globals'
import type { TokenService } from '@modules/tokens/token.service'
import type { Prisma } from '@prisma/client'
import { prismaMock, resetPrismaMock } from '@test/mocks'
import { mockDeep, mockReset } from 'jest-mock-extended'
import { ArtistAccountsService, SAVED_ACCOUNT_LIMIT } from './artist-accounts.service'

const BROWSER = 'b'.repeat(64)
const CURRENT = '019a0000-0000-7000-8000-000000000001'
const TARGET = '019a0000-0000-7000-8000-000000000002'

describe('saved artist accounts', () => {
  const tx = mockDeep<Prisma.TransactionClient>()
  const token = mockDeep<TokenService>()
  let service: ArtistAccountsService

  beforeEach(() => {
    resetPrismaMock()
    mockReset(tx)
    mockReset(token)
    prismaMock.$transaction.mockImplementation(async (callback) => {
      if (typeof callback !== 'function') throw new Error('Expected transaction')
      return await callback(tx)
    })
    token.hashToken.mockImplementation((raw) => `hash:${raw}`)
    token.generateAccessToken.mockResolvedValue('access')
    token.generateRefreshToken.mockResolvedValue('refresh')
    token.getRefreshTokenExpiresAt.mockReturnValue(new Date('2026-12-01'))
    service = new ArtistAccountsService(prismaMock, token)
  })

  describe('switching', () => {
    beforeEach(() => {
      tx.artistAccountLink.findFirst.mockResolvedValue({
        session: { id: 'target-session', refresh_token: 'rt', artist: { username: 'target' } },
      } as never)
      tx.artistSession.findFirst.mockResolvedValue({ id: 'current-session' } as never)
      tx.artistSession.updateMany.mockResolvedValue({ count: 1 })
    })

    it('leaves an account signed in past the limit instead of refusing the switch', async () => {
      tx.artistAccountLink.findUnique.mockResolvedValue(null)
      tx.artistAccountLink.count.mockResolvedValue(SAVED_ACCOUNT_LIMIT)

      await expect(
        service.switchAccount(CURRENT, 'current-access', BROWSER, TARGET, {}),
      ).resolves.toEqual({ access: 'access', refresh: 'refresh' })

      expect(tx.artistAccountLink.upsert).not.toHaveBeenCalled()
      expect(tx.artistSession.deleteMany).toHaveBeenCalledWith({
        where: { id: 'current-session', artistId: CURRENT },
      })
    })

    it('keeps a saved current account in the switcher', async () => {
      tx.artistAccountLink.findUnique.mockResolvedValue({ sessionId: 'current-session' } as never)

      await service.switchAccount(CURRENT, 'current-access', BROWSER, TARGET, {})

      expect(tx.artistAccountLink.upsert).toHaveBeenCalled()
      expect(tx.artistSession.deleteMany).not.toHaveBeenCalled()
    })
  })

  it('still refuses to remember a sixth account explicitly', async () => {
    tx.artistSession.findFirst.mockResolvedValue({ id: 'current-session' } as never)
    tx.artistAccountLink.findUnique.mockResolvedValue(null)
    tx.artistAccountLink.count.mockResolvedValue(SAVED_ACCOUNT_LIMIT)

    await expect(service.remember(CURRENT, 'current-access', BROWSER)).rejects.toMatchObject({
      status: 409,
    })
  })

  describe('forgetting a browser', () => {
    it('revokes every session saved in this browser', async () => {
      tx.artistAccountLink.findMany.mockResolvedValue([
        { sessionId: 'session-a', artistId: CURRENT },
        { sessionId: 'session-b', artistId: TARGET },
      ] as never)

      await service.forgetBrowser(BROWSER)

      expect(tx.artistAccountLink.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: { browserTokenHash: `hash:${BROWSER}` } }),
      )
      expect(tx.artistSession.deleteMany).toHaveBeenCalledWith({
        where: {
          OR: [
            { id: 'session-a', artistId: CURRENT },
            { id: 'session-b', artistId: TARGET },
          ],
        },
      })
    })

    it('does nothing without a well-formed switcher credential', async () => {
      await service.forgetBrowser('not-a-credential')
      await service.forgetBrowser(undefined)
      expect(prismaMock.$transaction).not.toHaveBeenCalled()
    })
  })
})
