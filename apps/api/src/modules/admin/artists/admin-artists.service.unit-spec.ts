import { beforeEach, describe, expect, it } from '@jest/globals'
import { type PrismaMock, prismaMock, resetPrismaMock } from '@test/mocks'
import { buildAdminArtist, buildArtist } from './__tests__/fixtures/admin-artists.fixtures'
import { AdminArtistsService } from './admin-artists.service'
import { ArtistNotFoundException } from './errors'

describe('AdminArtistsService', () => {
  let service: AdminArtistsService
  let prisma: PrismaMock

  beforeEach(() => {
    resetPrismaMock()
    prisma = prismaMock
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
  })

  describe('findById', () => {
    it('throws ArtistNotFoundException when the artist does not exist', async () => {
      prisma.artist.findFirst.mockResolvedValue(null)

      await expect(service.findById('missing')).rejects.toThrow(ArtistNotFoundException)
    })

    it('returns the artist when found', async () => {
      const artist = buildAdminArtist()
      prisma.artist.findFirst.mockResolvedValue(artist as never)

      await expect(service.findById('artist-1')).resolves.toEqual(artist)
    })
  })

  describe('updateVerification', () => {
    it('throws ArtistNotFoundException when the artist does not exist', async () => {
      prisma.artist.findFirst.mockResolvedValue(null)

      await expect(service.updateVerification('missing', { verified: true })).rejects.toThrow(
        ArtistNotFoundException,
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

      await expect(service.softDelete('missing')).rejects.toThrow(ArtistNotFoundException)
    })

    it('stamps deletedAt instead of physically deleting', async () => {
      prisma.artist.findFirst.mockResolvedValue(buildArtist() as never)
      prisma.artist.update.mockResolvedValue(buildAdminArtist({ deletedAt: new Date() }) as never)

      await service.softDelete('artist-1')

      const call = prisma.artist.update.mock.calls[0]?.[0]
      expect(call?.where).toEqual({ id: 'artist-1' })
      expect(call?.data.deletedAt).toBeInstanceOf(Date)
    })
  })
})
