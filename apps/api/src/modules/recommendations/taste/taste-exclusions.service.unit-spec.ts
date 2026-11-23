import { beforeEach, describe, expect, it } from '@jest/globals'
import { NotFoundException } from '@nestjs/common'
import { type PrismaMock, prismaMock, resetPrismaMock } from '@test/mocks'
import { RECOMMENDATION_ERRORS } from '../errors'
import { TasteExclusionsService } from './taste-exclusions.service'

const USER = '0199aee0-0000-7000-8000-000000000001'
const ID = '0199aee0-0000-7000-8000-000000000009'

describe('TasteExclusionsService', () => {
  let prisma: PrismaMock
  let service: TasteExclusionsService

  beforeEach(() => {
    resetPrismaMock()
    prisma = prismaMock
    service = new TasteExclusionsService(prisma)
  })

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

    await expect(service.list(USER, 1, 20)).resolves.toEqual({
      data: [],
      total: 0,
      page: 1,
      limit: 20,
    })
  })
})
