import { Readable } from 'node:stream'
import type { PrismaService } from '@infra/prisma/prisma.service'
import type { StorageService } from '@infra/storage/storage.types'
import { beforeEach, describe, expect, it, jest } from '@jest/globals'
import type { Prisma } from '@prisma/client'
import { mockDeep } from 'jest-mock-extended'
import * as master from './release-master'
import { ReleaseMediaService } from './release-media.service'

const summary = {
  id: '0199aee0-0000-7000-8000-000000000001',
  title: 'New release',
  type: 'SINGLE' as const,
  status: 'DRAFT' as const,
  upc: null,
  scheduledAt: null,
  createdAt: new Date('2026-11-06T10:00:00Z'),
  updatedAt: new Date('2026-11-06T10:00:01Z'),
}

describe('release recording writes', () => {
  const prisma = mockDeep<PrismaService>()
  const tx = mockDeep<Prisma.TransactionClient>()
  const storage = mockDeep<StorageService>()
  const service = new ReleaseMediaService(prisma, storage)
  const storedMaster = {
    key: 'master/track.wav',
    fileName: 'track.wav',
    contentType: 'audio/wav',
    sizeBytes: 128,
    sha256: 'a'.repeat(64),
    duration: 1,
    waveform: [],
  }

  beforeEach(() => {
    jest.clearAllMocks()
    prisma.artistTrackDraft.findMany.mockResolvedValue([])
    tx.artistTrackDraft.findMany.mockResolvedValue([])
    prisma.$transaction.mockImplementation((operation) => {
      if (typeof operation !== 'function') throw new Error('Expected a transaction')
      return operation(tx)
    })
    tx.release.updateManyAndReturn.mockResolvedValue([summary] as never)
    tx.artistTrackDraft.aggregate.mockResolvedValue({ _max: { position: 3 } } as never)
    tx.artistTrackDraft.create.mockResolvedValue({
      id: 'recording-1',
      title: 'New recording',
    } as never)
    tx.artistTrackDraft.findFirst.mockResolvedValue({ audioKey: null } as never)
    jest.spyOn(master, 'storeReleaseMaster').mockResolvedValue(storedMaster)
  })

  it('rejects an identical master without adding a recording and cleans up only the new upload', async () => {
    tx.artistTrackDraft.findMany.mockResolvedValue([{ id: 'existing-recording' }] as never)
    await expect(
      service.addTrack('owner-1', summary.id, undefined, {
        title: 'Different title',
        expectedUpdatedAt: summary.updatedAt.toISOString(),
      }),
    ).rejects.toMatchObject({ status: 422 })
    expect(tx.artistTrackDraft.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          ownerArtistId: 'owner-1',
          releaseId: summary.id,
          deletedAt: null,
          OR: [{ audioSha256: storedMaster.sha256 }],
        },
      }),
    )
    expect(tx.artistTrackDraft.create).not.toHaveBeenCalled()
    expect(storage.deleteObject).toHaveBeenCalledWith(storedMaster.key)
  })

  it('detects the original bytes of a legacy master regardless of its file name', async () => {
    const sha256 = 'ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad'
    jest
      .spyOn(master, 'storeReleaseMaster')
      .mockResolvedValue({ ...storedMaster, sha256, sizeBytes: 3 })
    prisma.artistTrackDraft.findMany.mockResolvedValue([
      { audioKey: 'legacy/old-name.mp3' },
    ] as never)
    storage.getObjectStream.mockResolvedValue({
      stream: Readable.from([Buffer.from('a'), Buffer.from('bc')]),
    })
    tx.artistTrackDraft.findMany.mockResolvedValue([{ id: 'legacy-recording' }] as never)
    await expect(
      service.addTrack('owner-1', summary.id, undefined, {
        title: 'Renamed audio',
        expectedUpdatedAt: summary.updatedAt.toISOString(),
      }),
    ).rejects.toMatchObject({ status: 422 })
    expect(tx.artistTrackDraft.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          OR: [{ audioSha256: sha256 }, { audioKey: { in: ['legacy/old-name.mp3'] } }],
        }),
      }),
    )
    expect(storage.deleteObject).not.toHaveBeenCalledWith('legacy/old-name.mp3')
  })

  it('allows replacing a recording with its own master and excludes it from the duplicate check', async () => {
    tx.artistTrackDraft.update.mockResolvedValue({ id: 'recording-1' } as never)
    await service.replaceTrackAudio('owner-1', summary.id, 'recording-1', undefined, {
      expectedUpdatedAt: summary.updatedAt.toISOString(),
    })
    expect(tx.artistTrackDraft.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          id: { not: 'recording-1' },
          releaseId: summary.id,
          ownerArtistId: 'owner-1',
        }),
      }),
    )
    expect(tx.artistTrackDraft.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ audioSha256: storedMaster.sha256 }),
      }),
    )
  })

  it.each([
    ['add', 4, 'SINGLE'],
    ['add', 5, 'EP'],
    ['add', 7, 'ALBUM'],
    ['remove', 6, 'EP'],
    ['remove', 4, 'SINGLE'],
    ['remove', 0, 'SINGLE'],
  ] as const)('%s leaves %i active recordings and returns %s', async (action, count, type) => {
    tx.artistTrackDraft.count.mockResolvedValue(count)
    tx.release.update.mockResolvedValue({ ...summary, type } as never)
    const version = { expectedUpdatedAt: summary.createdAt.toISOString() }
    const result =
      action === 'add'
        ? await service.addTrack('owner-1', summary.id, undefined, {
            ...version,
            title: 'New recording',
          })
        : await service.removeTrack('owner-1', summary.id, 'recording-1', version)
    expect(result.release.type).toBe(type)
    expect(tx.artistTrackDraft.count).toHaveBeenCalledWith({
      where: { releaseId: summary.id, deletedAt: null },
    })
    expect(tx.release.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: { type, updatedAt: summary.updatedAt },
      }),
    )
    expect(tx.release.updateManyAndReturn).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ ownerArtistId: 'owner-1', status: 'DRAFT' }),
        data: expect.objectContaining({ accuracyConfirmedAt: null }),
      }),
    )
  })

  it('skips an older master that vanished from storage instead of failing the upload', async () => {
    prisma.artistTrackDraft.findMany.mockResolvedValue([
      { audioKey: 'legacy/missing.wav' },
    ] as never)
    storage.getObjectStream.mockRejectedValue(new Error('NoSuchKey'))
    tx.release.update.mockResolvedValue(summary as never)
    await expect(
      service.addTrack('owner-1', summary.id, undefined, {
        title: 'New recording',
        expectedUpdatedAt: summary.updatedAt.toISOString(),
      }),
    ).resolves.toMatchObject({ track: { id: 'recording-1' } })
    expect(tx.artistTrackDraft.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ OR: [{ audioSha256: storedMaster.sha256 }] }),
      }),
    )
  })

  it('stores the checksum of an older master so it is hashed only once', async () => {
    const sha256 = 'ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad'
    prisma.artistTrackDraft.findMany.mockResolvedValue([{ audioKey: 'legacy/abc.wav' }] as never)
    storage.getObjectStream.mockResolvedValue({ stream: Readable.from([Buffer.from('abc')]) })
    tx.release.update.mockResolvedValue(summary as never)
    await service.addTrack('owner-1', summary.id, undefined, {
      title: 'New recording',
      expectedUpdatedAt: summary.updatedAt.toISOString(),
    })
    expect(prisma.artistTrackDraft.updateMany).toHaveBeenCalledWith({
      where: { audioKey: 'legacy/abc.wav', audioSha256: null },
      data: { audioSha256: sha256 },
    })
  })

  it('accepts an upload into a compilation draft that has no recordings left', async () => {
    tx.release.updateManyAndReturn.mockResolvedValue([{ ...summary, type: 'COMPILATION' }] as never)
    // Recordings before the upload, live after it, catalogue ones after it.
    tx.artistTrackDraft.count
      .mockResolvedValueOnce(0)
      .mockResolvedValueOnce(1)
      .mockResolvedValueOnce(0)
    tx.release.update.mockResolvedValue(summary as never)
    await service.addTrack('owner-1', summary.id, undefined, {
      title: 'Own recording',
      expectedUpdatedAt: summary.updatedAt.toISOString(),
    })
    expect(tx.artistTrackDraft.create).toHaveBeenCalled()
    expect(tx.release.update).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ type: 'SINGLE' }) }),
    )
  })

  it('still keeps own uploads out of a compilation that holds catalogue recordings', async () => {
    tx.release.updateManyAndReturn.mockResolvedValue([{ ...summary, type: 'COMPILATION' }] as never)
    tx.artistTrackDraft.count.mockResolvedValue(2)
    await expect(
      service.addTrack('owner-1', summary.id, undefined, {
        title: 'Own recording',
        expectedUpdatedAt: summary.updatedAt.toISOString(),
      }),
    ).rejects.toMatchObject({ status: 409 })
    expect(tx.artistTrackDraft.create).not.toHaveBeenCalled()
  })

  it('streams a reused recording from the draft its original release published', async () => {
    prisma.artistTrackDraft.findFirst.mockResolvedValue({
      audioKey: null,
      audioContentType: null,
      sourceTrackId: 'source-track',
    } as never)
    prisma.track.findFirst.mockResolvedValue({ id: 'source-track' } as never)
    prisma.releaseTrack.findFirst.mockResolvedValue({
      draft: {
        audioKey: 'master/original.wav',
        audioContentType: 'audio/wav',
        sourceTrackId: null,
        deletedAt: null,
      },
    } as never)
    storage.getObjectStream.mockResolvedValue({ stream: Readable.from([]) })
    await expect(
      service.audioStream('owner-1', summary.id, 'compilation-recording'),
    ).resolves.toMatchObject({ contentType: 'audio/wav' })
    expect(storage.getObjectStream).toHaveBeenCalledWith('master/original.wav', undefined)
    expect(prisma.releaseTrack.findFirst).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ trackId: 'source-track', reused: false }),
      }),
    )
  })

  it('does not stream a removed original recording', async () => {
    prisma.artistTrackDraft.findFirst.mockResolvedValue({
      audioKey: null,
      audioContentType: null,
      sourceTrackId: 'source-track',
    } as never)
    prisma.track.findFirst.mockResolvedValue({ id: 'source-track' } as never)
    prisma.releaseTrack.findFirst.mockResolvedValue({
      draft: {
        audioKey: 'master/original.wav',
        audioContentType: 'audio/wav',
        sourceTrackId: null,
        deletedAt: new Date(),
      },
    } as never)
    await expect(
      service.audioStream('owner-1', summary.id, 'compilation-recording'),
    ).rejects.toMatchObject({ status: 404 })
    expect(storage.getObjectStream).not.toHaveBeenCalled()
  })
})
