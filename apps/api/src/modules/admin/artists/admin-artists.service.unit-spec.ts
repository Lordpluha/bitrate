import { beforeEach, describe, expect, it } from '@jest/globals'
import type { Prisma } from '@prisma/client'
import { type PrismaMock, prismaMock, resetPrismaMock } from '@test/mocks'
import { type DeepMockProxy, mockDeep } from 'jest-mock-extended'
import { buildAdminArtist, buildArtist } from './__tests__/fixtures/admin-artists.fixtures'
import { AdminArtistsService } from './admin-artists.service'
import {
  ArtistAlreadyDeletedException,
  ArtistNotDeletedException,
  ArtistNotFoundException,
} from './errors'

const STAFF_ID = 'staff-1'

describe('AdminArtistsService', () => {
  let service: AdminArtistsService
  let prisma: PrismaMock
  let transaction: DeepMockProxy<Prisma.TransactionClient>

  beforeEach(() => {
    resetPrismaMock()
    prisma = prismaMock
    transaction = mockDeep<Prisma.TransactionClient>()
    prisma.$transaction.mockImplementation((callback: unknown) =>
      (callback as (client: Prisma.TransactionClient) => unknown)(transaction),
    )
    service = new AdminArtistsService(prisma)
  })

  describe('findAll', () => {
    it('returns a paginated page filtered by verified and q', async () => {
      const artist = buildAdminArtist()
      prisma.artist.findMany.mockResolvedValue([artist] as never)
      prisma.artist.count.mockResolvedValue(1)

      const result = await service.findAll({ page: 2, limit: 5, verified: true, q: 'dj' })

      expect(result).toEqual({ data: [artist], total: 1, page: 2, limit: 5 })
      expect(prisma.artist.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ deletedAt: null, verified: true }),
          skip: 5,
          take: 5,
        }),
      )
    })

    it('excludes soft-deleted artists by default and returns an empty page', async () => {
      prisma.artist.findMany.mockResolvedValue([] as never)
      prisma.artist.count.mockResolvedValue(0)

      const result = await service.findAll({})

      expect(result).toEqual({ data: [], total: 0, page: 1, limit: 20 })
      const call = prisma.artist.findMany.mock.calls[0]?.[0]
      expect(call?.where).toMatchObject({ deletedAt: null })
    })

    it('orders by createdAt desc with an id tie-break when no sort is given', async () => {
      prisma.artist.findMany.mockResolvedValue([] as never)
      prisma.artist.count.mockResolvedValue(0)

      await service.findAll({})

      const call = prisma.artist.findMany.mock.calls[0]?.[0]
      expect(call?.orderBy).toEqual([{ createdAt: 'desc' }, { id: 'desc' }])
    })

    it('orders by the chosen field with a matching-direction id tie-break', async () => {
      prisma.artist.findMany.mockResolvedValue([] as never)
      prisma.artist.count.mockResolvedValue(0)

      await service.findAll({ sort: 'monthlyListeners', order: 'asc' })

      const call = prisma.artist.findMany.mock.calls[0]?.[0]
      expect(call?.orderBy).toEqual([{ monthlyListeners: 'asc' }, { id: 'asc' }])
    })

    it('status=all drops the deletedAt filter entirely', async () => {
      prisma.artist.findMany.mockResolvedValue([] as never)
      prisma.artist.count.mockResolvedValue(0)

      await service.findAll({ status: 'all' })

      const call = prisma.artist.findMany.mock.calls[0]?.[0]
      expect(call?.where).toEqual({})
    })
  })

  describe('findById', () => {
    it('throws ArtistNotFoundException when the artist does not exist', async () => {
      prisma.artist.findFirst.mockResolvedValue(null)

      await expect(service.findById('missing')).rejects.toThrow(ArtistNotFoundException)
    })

    it('returns the artist with tracks/albums/session/report counts when found', async () => {
      const artist = buildAdminArtist()
      prisma.artist.findFirst.mockResolvedValue(artist as never)
      prisma.track.count.mockResolvedValue(5)
      prisma.album.count.mockResolvedValue(2)
      prisma.artistSession.count.mockResolvedValue(1)
      prisma.moderationReport.count.mockResolvedValue(0)

      const result = await service.findById('artist-1')

      expect(result).toMatchObject({
        ...artist,
        counts: { tracks: 5, albums: 2, activeSessions: 1, openReports: 0 },
      })
    })

    it('does not filter deletedAt — a deactivated artist stays reachable by id', async () => {
      const artist = buildAdminArtist({ deletedAt: new Date() })
      prisma.artist.findFirst.mockResolvedValue(artist as never)
      prisma.track.count.mockResolvedValue(0)
      prisma.album.count.mockResolvedValue(0)
      prisma.artistSession.count.mockResolvedValue(0)
      prisma.moderationReport.count.mockResolvedValue(0)

      await service.findById('artist-1')

      expect(prisma.artist.findFirst).toHaveBeenCalledWith(
        expect.objectContaining({ where: { id: 'artist-1' } }),
      )
    })
  })

  describe('updateVerification', () => {
    it('throws ArtistNotFoundException when the artist does not exist', async () => {
      prisma.artist.findFirst.mockResolvedValue(null)

      await expect(service.updateVerification('missing', { verified: true })).rejects.toThrow(
        ArtistNotFoundException,
      )
    })

    it('throws ArtistAlreadyDeletedException for a soft-deleted artist', async () => {
      prisma.artist.findFirst.mockResolvedValue(buildArtist({ deletedAt: new Date() }) as never)

      await expect(service.updateVerification('artist-1', { verified: true })).rejects.toThrow(
        ArtistAlreadyDeletedException,
      )
    })

    it('sets the verified flag', async () => {
      prisma.artist.findFirst.mockResolvedValue(buildArtist() as never)
      prisma.artist.update.mockResolvedValue(buildAdminArtist({ verified: true }) as never)

      await service.updateVerification('artist-1', { verified: true })

      expect(prisma.artist.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'artist-1' },
          data: { verified: true },
        }),
      )
    })
  })

  describe('softDelete', () => {
    it('throws ArtistNotFoundException when the artist does not exist', async () => {
      prisma.artist.findFirst.mockResolvedValue(null)

      await expect(service.softDelete('missing', STAFF_ID)).rejects.toThrow(ArtistNotFoundException)
    })

    it('throws ArtistAlreadyDeletedException when the artist is already deleted', async () => {
      prisma.artist.findFirst.mockResolvedValue(buildArtist({ deletedAt: new Date() }) as never)

      await expect(service.softDelete('artist-1', STAFF_ID)).rejects.toThrow(
        ArtistAlreadyDeletedException,
      )
    })

    /** A second concurrent take-down loses the `updateMany` race and must fail 409 — the same
     * response as an already-deleted artist — instead of silently re-deleting. */
    it('throws ArtistAlreadyDeletedException when a concurrent request wins the race', async () => {
      prisma.artist.findFirst.mockResolvedValue(buildArtist({ deletedAt: null }) as never)
      transaction.artist.updateMany.mockResolvedValue({ count: 0 })

      await expect(service.softDelete('artist-1', STAFF_ID)).rejects.toThrow(
        ArtistAlreadyDeletedException,
      )
      expect(transaction.auditLog.create).not.toHaveBeenCalled()
    })

    it('stamps deletedAt, revokes sessions, and writes an audit row, in one transaction', async () => {
      prisma.artist.findFirst.mockResolvedValue(buildArtist({ deletedAt: null }) as never)
      transaction.artist.updateMany.mockResolvedValue({ count: 1 })
      transaction.artistSession.deleteMany.mockResolvedValue({ count: 3 } as never)
      transaction.artist.findFirstOrThrow.mockResolvedValue(
        buildAdminArtist({ deletedAt: new Date() }) as never,
      )

      await service.softDelete('artist-1', STAFF_ID, 'impersonation')

      expect(transaction.artist.updateMany).toHaveBeenCalledWith({
        where: { id: 'artist-1', deletedAt: null },
        data: { deletedAt: expect.any(Date) },
      })
      expect(transaction.artistSession.deleteMany).toHaveBeenCalledWith({
        where: { artistId: 'artist-1' },
      })
      expect(transaction.auditLog.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            action: 'admin-artists.delete',
            metadata: expect.objectContaining({
              reason: 'impersonation',
              after: expect.objectContaining({ sessionsRevoked: 3 }),
            }),
          }),
        }),
      )
    })
  })

  describe('restore', () => {
    it('throws ArtistNotFoundException when the artist does not exist', async () => {
      prisma.artist.findFirst.mockResolvedValue(null)

      await expect(service.restore('missing', STAFF_ID)).rejects.toThrow(ArtistNotFoundException)
    })

    it('throws ArtistNotDeletedException when the artist is not deleted', async () => {
      prisma.artist.findFirst.mockResolvedValue(buildArtist({ deletedAt: null }) as never)

      await expect(service.restore('artist-1', STAFF_ID)).rejects.toThrow(ArtistNotDeletedException)
    })

    /** A second concurrent restore loses the `updateMany` race and must fail 409, not 404. */
    it('throws ArtistNotDeletedException when a concurrent request wins the race', async () => {
      prisma.artist.findFirst.mockResolvedValue(buildArtist({ deletedAt: new Date() }) as never)
      transaction.artist.updateMany.mockResolvedValue({ count: 0 })

      await expect(service.restore('artist-1', STAFF_ID)).rejects.toThrow(ArtistNotDeletedException)
      expect(transaction.auditLog.create).not.toHaveBeenCalled()
    })

    it('clears deletedAt', async () => {
      prisma.artist.findFirst.mockResolvedValue(buildArtist({ deletedAt: new Date() }) as never)
      transaction.artist.updateMany.mockResolvedValue({ count: 1 })
      transaction.artist.findFirstOrThrow.mockResolvedValue(
        buildAdminArtist({ deletedAt: null }) as never,
      )

      await service.restore('artist-1', STAFF_ID)

      expect(transaction.artist.updateMany).toHaveBeenCalledWith({
        where: { id: 'artist-1', deletedAt: { not: null } },
        data: { deletedAt: null },
      })
    })
  })

  describe('revokeSessions', () => {
    it('throws ArtistNotFoundException when the artist does not exist', async () => {
      prisma.artist.findFirst.mockResolvedValue(null)

      await expect(service.revokeSessions('missing', STAFF_ID)).rejects.toThrow(
        ArtistNotFoundException,
      )
    })

    it('deletes every session and returns the revoked count', async () => {
      prisma.artist.findFirst.mockResolvedValue(buildArtist() as never)
      transaction.artistSession.deleteMany.mockResolvedValue({ count: 2 } as never)

      const result = await service.revokeSessions('artist-1', STAFF_ID)

      expect(transaction.artistSession.deleteMany).toHaveBeenCalledWith({
        where: { artistId: 'artist-1' },
      })
      expect(result).toEqual({ revoked: 2 })
    })
  })
})
