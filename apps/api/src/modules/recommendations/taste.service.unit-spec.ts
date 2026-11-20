import { beforeEach, describe, expect, it } from '@jest/globals'
import { NotFoundException } from '@nestjs/common'
import { type PrismaMock, prismaMock, resetPrismaMock } from '@test/mocks'
import { RECOMMENDATION_ERRORS } from './errors'
import { TasteService } from './taste.service'

const USER = '0199aee0-0000-7000-8000-000000000001'
const ID = '0199aee0-0000-7000-8000-000000000009'
const CREATED = new Date('2026-11-19T12:00:00.000Z')

describe('TasteService', () => {
  let prisma: PrismaMock
  let service: TasteService

  beforeEach(() => {
    resetPrismaMock()
    prisma = prismaMock
    service = new TasteService(prisma)
  })

  describe('not interested', () => {
    it('hides a track that exists', async () => {
      prisma.track.findFirst.mockResolvedValue({ id: ID } as never)

      await service.markNotInterested(USER, 'TRACK', ID)

      expect(prisma.track.findFirst).toHaveBeenCalledWith({
        where: { id: ID, deletedAt: null },
        select: { id: true },
      })
      expect(prisma.notInterested.upsert).toHaveBeenCalledWith({
        where: { userId_entityType_entityId: { userId: USER, entityType: 'TRACK', entityId: ID } },
        create: { userId: USER, entityType: 'TRACK', entityId: ID },
        update: {},
      })
    })

    it('hides an artist that exists', async () => {
      prisma.artist.findFirst.mockResolvedValue({ id: ID } as never)

      await service.markNotInterested(USER, 'ARTIST', ID)

      expect(prisma.artist.findFirst).toHaveBeenCalledWith({
        where: { id: ID, deletedAt: null },
        select: { id: true },
      })
      expect(prisma.notInterested.upsert).toHaveBeenCalled()
    })

    it('refuses an unknown item and stores nothing', async () => {
      prisma.track.findFirst.mockResolvedValue(null)

      await expect(service.markNotInterested(USER, 'TRACK', ID)).rejects.toEqual(
        new NotFoundException(RECOMMENDATION_ERRORS.ENTITY_NOT_FOUND),
      )
      expect(prisma.notInterested.upsert).not.toHaveBeenCalled()
    })

    it('undoes "Not interested" idempotently', async () => {
      prisma.notInterested.deleteMany.mockResolvedValue({ count: 0 })

      await expect(service.unmarkNotInterested(USER, 'ARTIST', ID)).resolves.toBeUndefined()
      expect(prisma.notInterested.deleteMany).toHaveBeenCalledWith({
        where: { userId: USER, entityType: 'ARTIST', entityId: ID },
      })
    })

    it('lists the listener’s hidden items newest first, one page at a time', async () => {
      prisma.notInterested.findMany.mockResolvedValue([
        { entityType: 'TRACK', entityId: ID, createdAt: CREATED },
      ] as never)
      prisma.notInterested.count.mockResolvedValue(21)

      await expect(service.listNotInterested(USER, 2, 20)).resolves.toEqual({
        data: [{ entityType: 'TRACK', entityId: ID, createdAt: CREATED }],
        total: 21,
        page: 2,
        limit: 20,
      })
      expect(prisma.notInterested.findMany).toHaveBeenCalledWith({
        where: { userId: USER },
        orderBy: [{ createdAt: 'desc' }, { entityId: 'asc' }],
        skip: 20,
        take: 20,
        select: { entityType: true, entityId: true, createdAt: true },
      })
    })

    it('reads the ids a recommendation surface has to leave out', async () => {
      prisma.notInterested.findMany.mockResolvedValue([
        { entityType: 'TRACK', entityId: 'track-1' },
        { entityType: 'ARTIST', entityId: 'artist-1' },
        { entityType: 'TRACK', entityId: 'track-2' },
      ] as never)

      await expect(service.hiddenIds(USER)).resolves.toEqual({
        trackIds: ['track-1', 'track-2'],
        artistIds: ['artist-1'],
      })
    })
  })

  describe('taste exclusions', () => {
    it('excludes a playlist the listener can see', async () => {
      prisma.playlist.findFirst.mockResolvedValue({ id: ID } as never)

      await service.exclude(USER, 'PLAYLIST', ID)

      expect(prisma.playlist.findFirst).toHaveBeenCalledWith({
        where: { id: ID, deletedAt: null, OR: [{ isPublic: true }, { userId: USER }] },
        select: { id: true },
      })
      expect(prisma.tasteExclusion.upsert).toHaveBeenCalledWith({
        where: {
          userId_entityType_entityId: { userId: USER, entityType: 'PLAYLIST', entityId: ID },
        },
        create: { userId: USER, entityType: 'PLAYLIST', entityId: ID },
        update: {},
      })
    })

    it('refuses someone else’s private playlist as if it did not exist', async () => {
      prisma.playlist.findFirst.mockResolvedValue(null)

      await expect(service.exclude(USER, 'PLAYLIST', ID)).rejects.toEqual(
        new NotFoundException(RECOMMENDATION_ERRORS.ENTITY_NOT_FOUND),
      )
      expect(prisma.tasteExclusion.upsert).not.toHaveBeenCalled()
    })

    it('excludes an album and a track that exist', async () => {
      prisma.album.findFirst.mockResolvedValue({ id: ID } as never)
      prisma.track.findFirst.mockResolvedValue({ id: ID } as never)

      await service.exclude(USER, 'ALBUM', ID)
      await service.exclude(USER, 'TRACK', ID)

      expect(prisma.album.findFirst).toHaveBeenCalledWith({
        where: { id: ID, deletedAt: null },
        select: { id: true },
      })
      expect(prisma.tasteExclusion.upsert).toHaveBeenCalledTimes(2)
    })

    it('removes an exclusion idempotently', async () => {
      prisma.tasteExclusion.deleteMany.mockResolvedValue({ count: 1 })

      await service.include(USER, 'ALBUM', ID)

      expect(prisma.tasteExclusion.deleteMany).toHaveBeenCalledWith({
        where: { userId: USER, entityType: 'ALBUM', entityId: ID },
      })
    })

    it('lists exclusions one page at a time', async () => {
      prisma.tasteExclusion.findMany.mockResolvedValue([])
      prisma.tasteExclusion.count.mockResolvedValue(0)

      await expect(service.listExclusions(USER, 1, 20)).resolves.toEqual({
        data: [],
        total: 0,
        page: 1,
        limit: 20,
      })
    })
  })
})
