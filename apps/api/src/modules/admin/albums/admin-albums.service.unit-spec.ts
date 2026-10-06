import { beforeEach, describe, expect, it } from '@jest/globals'
import type { Prisma } from '@prisma/client'
import { type PrismaMock, prismaMock, resetPrismaMock } from '@test/mocks'
import { type DeepMockProxy, mockDeep } from 'jest-mock-extended'
import { buildAlbumWithArtist } from './__tests__/fixtures/admin-albums.fixtures'
import { AdminAlbumsService } from './admin-albums.service'
import {
  AlbumAlreadyDeletedException,
  AlbumNotDeletedException,
  AlbumNotFoundException,
} from './errors'

const STAFF_ID = 'staff-1'

describe('AdminAlbumsService', () => {
  let service: AdminAlbumsService
  let prisma: PrismaMock
  let transaction: DeepMockProxy<Prisma.TransactionClient>

  beforeEach(() => {
    resetPrismaMock()
    prisma = prismaMock
    transaction = mockDeep<Prisma.TransactionClient>()
    prisma.$transaction.mockImplementation((callback: unknown) =>
      (callback as (client: Prisma.TransactionClient) => unknown)(transaction),
    )
    service = new AdminAlbumsService(prisma)
  })

  describe('findAll', () => {
    it('returns a flattened page filtered by q and artistId', async () => {
      prisma.album.findMany.mockResolvedValue([buildAlbumWithArtist()] as never)
      prisma.album.count.mockResolvedValue(1)

      const result = await service.findAll({ page: 2, limit: 5, q: 'night', artistId: 'artist-1' })

      expect(result).toMatchObject({ total: 1, page: 2, limit: 5 })
      expect(result.data[0]).toMatchObject({ id: 'album-1', artistUsername: 'dj-test' })
      expect(result.data[0]).not.toHaveProperty('artist')
      expect(prisma.album.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            deletedAt: null,
            artistId: 'artist-1',
            title: { contains: 'night', mode: 'insensitive' },
          }),
          skip: 5,
          take: 5,
        }),
      )
    })

    it('excludes taken-down albums by default', async () => {
      prisma.album.findMany.mockResolvedValue([] as never)
      prisma.album.count.mockResolvedValue(0)

      await service.findAll({})

      expect(prisma.album.findMany.mock.calls[0]?.[0]?.where).toMatchObject({ deletedAt: null })
    })

    it('status=deactivated lists only taken-down albums', async () => {
      prisma.album.findMany.mockResolvedValue([] as never)
      prisma.album.count.mockResolvedValue(0)

      await service.findAll({ status: 'deactivated' })

      expect(prisma.album.findMany.mock.calls[0]?.[0]?.where).toMatchObject({
        deletedAt: { not: null },
      })
    })

    it('status=all drops the deletedAt filter', async () => {
      prisma.album.findMany.mockResolvedValue([] as never)
      prisma.album.count.mockResolvedValue(0)

      await service.findAll({ status: 'all' })

      expect(prisma.album.findMany.mock.calls[0]?.[0]?.where).not.toHaveProperty('deletedAt')
    })

    it('orders by createdAt desc with an id tie-break when no sort is given', async () => {
      prisma.album.findMany.mockResolvedValue([] as never)
      prisma.album.count.mockResolvedValue(0)

      await service.findAll({})

      expect(prisma.album.findMany.mock.calls[0]?.[0]?.orderBy).toEqual([
        { createdAt: 'desc' },
        { id: 'desc' },
      ])
    })

    it('orders by the chosen field with a matching-direction id tie-break', async () => {
      prisma.album.findMany.mockResolvedValue([] as never)
      prisma.album.count.mockResolvedValue(0)

      await service.findAll({ sort: 'releaseDate', order: 'asc' })

      expect(prisma.album.findMany.mock.calls[0]?.[0]?.orderBy).toEqual([
        { releaseDate: 'asc' },
        { id: 'asc' },
      ])
    })
  })

  describe('findById', () => {
    it('throws AlbumNotFoundException when the album does not exist', async () => {
      prisma.album.findFirst.mockResolvedValue(null)

      await expect(service.findById('missing')).rejects.toThrow(AlbumNotFoundException)
    })

    it('returns a taken-down album with its tracks flattened', async () => {
      prisma.album.findFirst.mockResolvedValue({
        ...buildAlbumWithArtist({ deletedAt: new Date('2026-02-01T00:00:00Z') }),
        tracks: [
          {
            trackNumber: 1,
            discNumber: 1,
            track: {
              id: 'track-1',
              title: 'Intro',
              processingStatus: 'READY',
              deletedAt: null,
            },
          },
        ],
      } as never)

      const result = await service.findById('album-1')

      expect(result.deletedAt).toEqual(new Date('2026-02-01T00:00:00Z'))
      expect(result.tracks).toEqual([
        {
          id: 'track-1',
          title: 'Intro',
          trackNumber: 1,
          discNumber: 1,
          processingStatus: 'READY',
          deletedAt: null,
        },
      ])
    })

    it('does not filter by deletedAt and orders tracks by disc then track number', async () => {
      prisma.album.findFirst.mockResolvedValue({ ...buildAlbumWithArtist(), tracks: [] } as never)

      await service.findById('album-1')

      const call = prisma.album.findFirst.mock.calls[0]?.[0]
      expect(call?.where).toEqual({ id: 'album-1' })
      expect(call?.select).toMatchObject({
        tracks: expect.objectContaining({
          orderBy: [{ discNumber: 'asc' }, { trackNumber: 'asc' }],
        }),
      })
    })
  })

  describe('softDelete', () => {
    it('throws AlbumNotFoundException when the album does not exist', async () => {
      prisma.album.findFirst.mockResolvedValue(null)

      await expect(service.softDelete('missing', STAFF_ID)).rejects.toThrow(AlbumNotFoundException)
    })

    it('throws AlbumAlreadyDeletedException when the album is already taken down', async () => {
      prisma.album.findFirst.mockResolvedValue(
        buildAlbumWithArtist({ deletedAt: new Date() }) as never,
      )

      await expect(service.softDelete('album-1', STAFF_ID)).rejects.toThrow(
        AlbumAlreadyDeletedException,
      )
    })

    it('throws AlbumAlreadyDeletedException when a concurrent request wins the race', async () => {
      prisma.album.findFirst.mockResolvedValue(buildAlbumWithArtist() as never)
      transaction.album.updateMany.mockResolvedValue({ count: 0 })

      await expect(service.softDelete('album-1', STAFF_ID)).rejects.toThrow(
        AlbumAlreadyDeletedException,
      )
      expect(transaction.auditLog.create).not.toHaveBeenCalled()
    })

    /** AC1: the album is stamped and its tracks are left alone. */
    it('stamps deletedAt, audits it, and never touches the album tracks', async () => {
      prisma.album.findFirst.mockResolvedValue(buildAlbumWithArtist() as never)
      transaction.album.updateMany.mockResolvedValue({ count: 1 })
      transaction.album.findFirstOrThrow.mockResolvedValue(
        buildAlbumWithArtist({ deletedAt: new Date() }) as never,
      )

      const result = await service.softDelete('album-1', STAFF_ID, 'rights claim')

      expect(transaction.album.updateMany).toHaveBeenCalledWith({
        where: { id: 'album-1', deletedAt: null },
        data: { deletedAt: expect.any(Date) },
      })
      expect(transaction.track.updateMany).not.toHaveBeenCalled()
      expect(transaction.albumTrack.deleteMany).not.toHaveBeenCalled()
      expect(result.deletedAt).toBeInstanceOf(Date)
      expect(transaction.auditLog.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            action: 'admin-albums.delete',
            entityType: 'admin-albums',
            entityId: 'album-1',
            metadata: expect.objectContaining({ reason: 'rights claim' }),
          }),
        }),
      )
    })
  })

  describe('restore', () => {
    it('throws AlbumNotFoundException when the album does not exist', async () => {
      prisma.album.findFirst.mockResolvedValue(null)

      await expect(service.restore('missing', STAFF_ID)).rejects.toThrow(AlbumNotFoundException)
    })

    it('throws AlbumNotDeletedException when the album is not taken down', async () => {
      prisma.album.findFirst.mockResolvedValue(buildAlbumWithArtist() as never)

      await expect(service.restore('album-1', STAFF_ID)).rejects.toThrow(AlbumNotDeletedException)
    })

    it('throws AlbumNotDeletedException when a concurrent request wins the race', async () => {
      prisma.album.findFirst.mockResolvedValue(
        buildAlbumWithArtist({ deletedAt: new Date() }) as never,
      )
      transaction.album.updateMany.mockResolvedValue({ count: 0 })

      await expect(service.restore('album-1', STAFF_ID)).rejects.toThrow(AlbumNotDeletedException)
      expect(transaction.auditLog.create).not.toHaveBeenCalled()
    })

    /** AC2: restore clears the stamp so the default `status=active` listing includes it. */
    it('clears deletedAt and audits it', async () => {
      prisma.album.findFirst.mockResolvedValue(
        buildAlbumWithArtist({ deletedAt: new Date() }) as never,
      )
      transaction.album.updateMany.mockResolvedValue({ count: 1 })
      transaction.album.findFirstOrThrow.mockResolvedValue(buildAlbumWithArtist() as never)

      const result = await service.restore('album-1', STAFF_ID)

      expect(transaction.album.updateMany).toHaveBeenCalledWith({
        where: { id: 'album-1', deletedAt: { not: null } },
        data: { deletedAt: null },
      })
      expect(result.deletedAt).toBeNull()
      expect(transaction.auditLog.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ action: 'admin-albums.restore' }),
        }),
      )
    })
  })
})
