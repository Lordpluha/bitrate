import { beforeEach, describe, expect, it } from '@jest/globals'
import { ConflictException } from '@nestjs/common'
import type { Prisma } from '@prisma/client'
import { prismaMock, resetPrismaMock } from '@test/mocks'
import { mockDeep, mockReset } from 'jest-mock-extended'
import { assertDistinctCompilationAudio, sourceAvailable } from './compilation-source'
import { AddCompilationTracksSchema } from './dtos/compilation.dto'
import { ReleaseCompilationService } from './release-compilation.service'

const OWNER = '019a0000-0000-7000-8000-000000000001'
const ID = '019a0000-0000-7000-8000-000000000002'
const SOURCE = '019a0000-0000-7000-8000-000000000003'
const VERSION = '2026-11-06T10:00:00.000Z'
const tx = mockDeep<Prisma.TransactionClient>()

describe('owned catalogue compilations', () => {
  let service: ReleaseCompilationService
  beforeEach(() => {
    resetPrismaMock()
    mockReset(tx)
    prismaMock.$transaction.mockImplementation(async (callback) => {
      if (typeof callback !== 'function') throw new Error('Expected transaction')
      return await callback(tx)
    })
    service = new ReleaseCompilationService(prismaMock)
  })

  it('requires unique canonical recording IDs within the batch', () => {
    expect(
      AddCompilationTracksSchema.safeParse({
        expectedUpdatedAt: VERSION,
        trackIds: [SOURCE, SOURCE],
      }).success,
    ).toBe(false)
    expect(
      AddCompilationTracksSchema.safeParse({ expectedUpdatedAt: VERSION, trackIds: [SOURCE] })
        .success,
    ).toBe(true)
  })

  it('does not present revoked, deleted, future or unfinished recordings as playable', () => {
    const ready = {
      publishedAt: new Date('2026-01-01'),
      deletedAt: null,
      moderationBlockedAt: null,
      processingStatus: 'READY',
    }
    expect(sourceAvailable(ready)).toBe(true)
    for (const record of [
      { ...ready, publishedAt: null },
      { ...ready, publishedAt: new Date('2099-01-01') },
      { ...ready, deletedAt: new Date() },
      { ...ready, moderationBlockedAt: new Date() },
      { ...ready, processingStatus: 'FAILED' },
    ])
      expect(sourceAvailable(record)).toBe(false)
  })

  it('does not mix mutable uploaded masters into a compilation', async () => {
    tx.release.updateManyAndReturn.mockResolvedValue([
      { id: ID, type: 'SINGLE', updatedAt: new Date(VERSION) },
    ] as never)
    tx.artistTrackDraft.findMany.mockResolvedValue([{ sourceTrackId: null, position: 0 }] as never)
    await expect(
      service.add(OWNER, ID, { expectedUpdatedAt: VERSION, trackIds: [SOURCE] }),
    ).rejects.toBeInstanceOf(ConflictException)
    expect(tx.artistTrackDraft.create).not.toHaveBeenCalled()
  })

  it('rejects unavailable or foreign sources before creating recording references', async () => {
    tx.release.updateManyAndReturn.mockResolvedValue([
      { id: ID, type: 'SINGLE', updatedAt: new Date(VERSION) },
    ] as never)
    tx.artistTrackDraft.findMany.mockResolvedValue([])
    tx.track.count.mockResolvedValue(0)
    await expect(
      service.add(OWNER, ID, { expectedUpdatedAt: VERSION, trackIds: [SOURCE] }),
    ).rejects.toBeInstanceOf(ConflictException)
    expect(tx.artistTrackDraft.create).not.toHaveBeenCalled()
    expect(tx.track.create).not.toHaveBeenCalled()
  })
  it('rejects identical uploaded bytes even when catalogue recording IDs differ', async () => {
    tx.artistTrackDraft.findMany.mockResolvedValue([
      {
        position: 0,
        audioSha256: 'a'.repeat(64),
        release: { tracks: [{ trackId: SOURCE, position: 1 }] },
      },
      {
        position: 0,
        audioSha256: 'a'.repeat(64),
        release: { tracks: [{ trackId: ID, position: 1 }] },
      },
    ] as never)
    await expect(assertDistinctCompilationAudio(tx, OWNER, [SOURCE, ID])).rejects.toBeInstanceOf(
      ConflictException,
    )
  })
})
