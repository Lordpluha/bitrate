import { Readable } from 'node:stream'
import type { StorageService } from '@infra/storage/storage.types'
import { beforeEach, describe, expect, it } from '@jest/globals'
import type { AlbumsService } from '@modules/albums/albums.service'
import type { ReleaseTrackService } from '@modules/tracks/ingest'
import { ConflictException, NotFoundException } from '@nestjs/common'
import type { Prisma } from '@prisma/client'
import { type PrismaMock, prismaMock, resetPrismaMock, untypedSpy } from '@test/mocks'
import { type DeepMockProxy, mockDeep } from 'jest-mock-extended'
import { RELEASE_ERRORS } from './errors'
import { ReleaseChangeReviewService } from './release-change-review.service'

const REQUEST_ID = 'request-1'
const RELEASE_ID = 'release-1'
const ALBUM_ID = 'album-1'
const STAFF_ID = 'staff-1'
const OLD_COVER = '/static/releases/covers/old-cover.jpg'
const PENDING_COVER = 'releases/pending-covers/new-cover.png'
const RELEASED_AT = new Date('2026-11-01T10:00:00Z')

const live = {
  id: RELEASE_ID,
  ownerArtistId: 'artist-1',
  title: 'First light',
  cover: OLD_COVER,
  status: 'RELEASED',
  unpublishedBy: null,
  isDemo: false,
  albumId: ALBUM_ID,
  updatedAt: RELEASED_AT,
}

const pending = {
  title: {
    id: 'change-title',
    field: 'RELEASE_TITLE',
    draftId: null,
    previousValue: 'First light',
    proposedValue: 'Second light',
  },
  cover: {
    id: 'change-cover',
    field: 'RELEASE_COVER',
    draftId: null,
    previousValue: OLD_COVER,
    proposedValue: PENDING_COVER,
  },
  recording: {
    id: 'change-recording',
    field: 'RECORDING_TITLE',
    draftId: 'draft-1',
    previousValue: 'Night drive',
    proposedValue: 'Night drive (Edit)',
  },
} as const

describe('ReleaseChangeReviewService', () => {
  let service: ReleaseChangeReviewService
  let prisma: PrismaMock
  let tx: DeepMockProxy<Prisma.TransactionClient>
  let storage: DeepMockProxy<StorageService>
  let albums: DeepMockProxy<AlbumsService>
  let tracks: DeepMockProxy<ReleaseTrackService>

  const decide = (decisions: object[], message?: string) =>
    service.decide(REQUEST_ID, STAFF_ID, { decisions, message } as never)

  /** The changes the request still has pending, in the order the reviewer decides them. */
  const stillPending = (...changes: object[]) =>
    tx.releaseChange.findMany.mockResolvedValue(changes as never)

  beforeEach(() => {
    resetPrismaMock()
    prisma = prismaMock
    tx = mockDeep<Prisma.TransactionClient>()
    storage = mockDeep<StorageService>()
    albums = mockDeep<AlbumsService>()
    tracks = mockDeep<ReleaseTrackService>()
    prisma.$transaction.mockImplementation(async (callback: unknown) =>
      (callback as (client: Prisma.TransactionClient) => unknown)(tx),
    )
    tx.releaseChangeRequest.findUnique.mockResolvedValue({
      id: REQUEST_ID,
      releaseId: RELEASE_ID,
    } as never)
    tx.$queryRaw.mockResolvedValue([live] as never)
    tx.releaseChange.count.mockResolvedValue(0)
    tx.releaseChangeRequest.update.mockResolvedValue({ id: REQUEST_ID } as never)
    prisma.releaseChange.findMany.mockResolvedValue([])
    storage.getObjectStream.mockResolvedValue({
      stream: Readable.from([Buffer.from('png')]),
      contentType: 'image/png',
    })
    service = new ReleaseChangeReviewService(prisma, storage, albums, tracks)
  })

  it('renames the live release and its album without bumping the release version', async () => {
    stillPending(pending.title)
    await decide([{ changeId: pending.title.id, decision: 'APPROVE' }])

    // Keeping `updatedAt` stops the "release is live" notification from firing again.
    expect(tx.release.update).toHaveBeenCalledWith({
      where: { id: RELEASE_ID },
      data: { title: 'Second light', updatedAt: RELEASED_AT },
    })
    expect(untypedSpy(albums.updateReleaseAlbumDetails)).toHaveBeenCalledWith(tx, ALBUM_ID, {
      title: 'Second light',
    })
    expect(tx.releaseChange.update).toHaveBeenCalledWith({
      where: { id: pending.title.id },
      data: expect.objectContaining({
        status: 'APPROVED',
        pendingTarget: null,
        staffId: STAFF_ID,
        decidedAt: expect.any(Date),
      }),
    })
    expect(albums.invalidateCatalogueCaches).toHaveBeenCalled()
    expect(tracks.invalidateCatalogueCaches).toHaveBeenCalled()
  })

  it('publishes an approved cover to the release, its album and its own tracks', async () => {
    stillPending(pending.cover)
    prisma.releaseChange.findMany.mockResolvedValue([pending.cover] as never)
    tx.releaseTrack.findMany.mockResolvedValue([
      { trackId: 'track-1' },
      { trackId: 'track-2' },
    ] as never)

    await decide([{ changeId: pending.cover.id, decision: 'APPROVE' }])

    const [publicKey] = storage.upload.mock.calls[0] as [string, unknown, string]
    expect(publicKey).toMatch(/^releases\/covers\/[\w-]+\.png$/)
    const path = `/static/${publicKey}`
    expect(tx.release.update).toHaveBeenCalledWith({
      where: { id: RELEASE_ID },
      data: { cover: path, updatedAt: RELEASED_AT },
    })
    expect(untypedSpy(albums.updateReleaseAlbumDetails)).toHaveBeenCalledWith(tx, ALBUM_ID, {
      cover: path,
    })
    // Compilations reuse recordings under their own artwork, so only native tracks change.
    expect(tx.releaseTrack.findMany).toHaveBeenCalledWith({
      where: { releaseId: RELEASE_ID, reused: false },
      select: { trackId: true },
    })
    expect(untypedSpy(tracks.updateReleaseTrackDetails)).toHaveBeenCalledWith(
      tx,
      ['track-1', 'track-2'],
      {
        cover: path,
      },
    )
    expect(tx.releaseChange.update).toHaveBeenCalledWith({
      where: { id: pending.cover.id },
      data: expect.objectContaining({ status: 'APPROVED', proposedValue: path }),
    })
    // The private proposal and the replaced public cover are removed after commit.
    expect(storage.deleteObject).toHaveBeenCalledWith(PENDING_COVER)
    expect(storage.deleteObject).toHaveBeenCalledWith('releases/covers/old-cover.jpg')
  })

  it('renames a recording and its catalogue track everywhere it appears', async () => {
    stillPending(pending.recording)
    tx.releaseTrack.findUnique.mockResolvedValue({ trackId: 'track-1' } as never)

    await decide([{ changeId: pending.recording.id, decision: 'APPROVE' }])

    expect(tx.artistTrackDraft.update).toHaveBeenCalledWith({
      where: { id: 'draft-1' },
      data: { title: 'Night drive (Edit)' },
    })
    expect(untypedSpy(tracks.updateReleaseTrackDetails)).toHaveBeenCalledWith(tx, ['track-1'], {
      title: 'Night drive (Edit)',
    })
    expect(tx.release.update).not.toHaveBeenCalled()
  })

  it('rejects with a reason, leaves the catalogue alone and drops a proposed cover', async () => {
    stillPending(pending.cover)

    await decide([{ changeId: pending.cover.id, decision: 'REJECT', reason: 'Blurry' }])

    expect(tx.releaseChange.update).toHaveBeenCalledWith({
      where: { id: pending.cover.id },
      data: expect.objectContaining({ status: 'REJECTED', reason: 'Blurry', pendingTarget: null }),
    })
    expect(tx.release.update).not.toHaveBeenCalled()
    expect(storage.upload).not.toHaveBeenCalled()
    expect(storage.deleteObject).toHaveBeenCalledWith(PENDING_COVER)
    expect(albums.invalidateCatalogueCaches).not.toHaveBeenCalled()
  })

  it('approves some changes and rejects others in one decision', async () => {
    stillPending(pending.title, pending.recording)
    tx.releaseTrack.findUnique.mockResolvedValue({ trackId: 'track-1' } as never)

    await decide(
      [
        { changeId: pending.title.id, decision: 'APPROVE' },
        { changeId: pending.recording.id, decision: 'REJECT', reason: 'Keep the old one' },
      ],
      'Thanks!',
    )

    expect(tx.release.update).toHaveBeenCalled()
    expect(tracks.updateReleaseTrackDetails).not.toHaveBeenCalled()
    expect(tx.releaseChangeRequest.update).toHaveBeenCalledWith(
      expect.objectContaining({ data: { message: 'Thanks!', closedAt: expect.any(Date) } }),
    )
  })

  it('keeps the request open while other changes still wait', async () => {
    stillPending(pending.title)
    tx.releaseChange.count.mockResolvedValue(1)

    await decide([{ changeId: pending.title.id, decision: 'APPROVE' }])

    expect(tx.releaseChangeRequest.update).toHaveBeenCalledWith(
      expect.objectContaining({ data: { closedAt: null } }),
    )
  })

  it('refuses a change that was already decided or withdrawn and unpublishes nothing', async () => {
    stillPending()
    prisma.releaseChange.findMany.mockResolvedValue([pending.cover] as never)

    const result = decide([{ changeId: pending.cover.id, decision: 'APPROVE' }])

    await expect(result).rejects.toThrow(new ConflictException(RELEASE_ERRORS.CHANGE_NOT_PENDING))
    // The copy made before the transaction is removed again.
    const [publicKey] = storage.upload.mock.calls[0] as [string, unknown, string]
    expect(storage.deleteObject).toHaveBeenCalledWith(publicKey)
    expect(storage.deleteObject).not.toHaveBeenCalledWith(PENDING_COVER)
  })

  it('refuses decisions once the release no longer takes changes', async () => {
    tx.$queryRaw.mockResolvedValue([
      { ...live, status: 'UNPUBLISHED', unpublishedBy: 'ADMIN' },
    ] as never)
    stillPending(pending.title)

    await expect(decide([{ changeId: pending.title.id, decision: 'APPROVE' }])).rejects.toThrow(
      new ConflictException(RELEASE_ERRORS.CHANGES_NOT_ALLOWED),
    )
  })

  it('reports an unknown request', async () => {
    tx.releaseChangeRequest.findUnique.mockResolvedValue(null)

    await expect(decide([{ changeId: pending.title.id, decision: 'APPROVE' }])).rejects.toThrow(
      NotFoundException,
    )
  })
})
