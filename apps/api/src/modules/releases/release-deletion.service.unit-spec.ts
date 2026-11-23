import { beforeEach, describe, expect, it } from '@jest/globals'
import type { AlbumsService } from '@modules/albums/albums.service'
import type { ReleaseTrackDeletionService } from '@modules/tracks/release-track-deletion.service'
import { ConflictException } from '@nestjs/common'
import type { Prisma } from '@prisma/client'
import { prismaMock, resetPrismaMock, untypedSpy } from '@test/mocks'
import { mockDeep, mockReset } from 'jest-mock-extended'
import { RELEASE_ERRORS } from './errors'
import type { ReleaseChangesService } from './release-changes.service'
import { ReleaseDeletionService } from './release-deletion.service'

const OWNER = '019a0000-0000-7000-8000-000000000001'
const ID = '019a0000-0000-7000-8000-000000000002'
const TRACK = '019a0000-0000-7000-8000-000000000003'
const VERSION = { expectedUpdatedAt: '2026-11-09T10:00:00.000Z' }

describe('release deletion', () => {
  const tx = mockDeep<Prisma.TransactionClient>()
  const tracks = mockDeep<ReleaseTrackDeletionService>()
  const albums = mockDeep<AlbumsService>()
  const changes = mockDeep<ReleaseChangesService>()
  let service: ReleaseDeletionService

  beforeEach(() => {
    resetPrismaMock()
    mockReset(tx)
    mockReset(tracks)
    mockReset(albums)
    mockReset(changes)
    prismaMock.$transaction.mockImplementation(async (callback) => {
      if (typeof callback !== 'function') throw new Error('Expected transaction')
      return await callback(tx)
    })
    tx.release.updateMany.mockResolvedValue({ count: 1 })
    tx.release.findUniqueOrThrow.mockResolvedValue({
      albumId: null,
      tracks: [{ trackId: TRACK }],
    } as never)
    service = new ReleaseDeletionService(prismaMock, tracks, albums, changes)
  })

  it('refuses while a compilation draft still uses one of its recordings', async () => {
    tx.artistTrackDraft.count.mockResolvedValue(1)
    await expect(service.remove(OWNER, ID, VERSION)).rejects.toEqual(
      new ConflictException(RELEASE_ERRORS.USED_IN_COMPILATION),
    )
    expect(tx.artistTrackDraft.count).toHaveBeenCalledWith({
      where: {
        sourceTrackId: { in: [TRACK] },
        deletedAt: null,
        releaseId: { not: ID },
        release: { deletedAt: null },
      },
    })
    expect(tracks.remove).not.toHaveBeenCalled()
  })

  it('locks the recordings before checking, so a concurrent compilation add is serialized', async () => {
    tx.artistTrackDraft.count.mockResolvedValue(0)
    await service.remove(OWNER, ID, VERSION)
    expect(tx.$queryRaw).toHaveBeenCalled()
    expect(tx.$queryRaw.mock.invocationCallOrder[0]).toBeLessThan(
      tx.artistTrackDraft.count.mock.invocationCallOrder[0] ?? 0,
    )
    expect(untypedSpy(tracks.remove)).toHaveBeenCalledWith(tx, [TRACK], expect.any(Date))
  })

  it('cancels changes waiting for review and discards their proposed covers after commit', async () => {
    tx.artistTrackDraft.count.mockResolvedValue(0)
    changes.cancelPending.mockResolvedValue(['releases/pending-covers/new.png'])

    await service.remove(OWNER, ID, VERSION)

    expect(untypedSpy(changes.cancelPending)).toHaveBeenCalledWith(tx, ID)
    expect(changes.discardCovers).toHaveBeenCalledWith(['releases/pending-covers/new.png'])
  })
})
