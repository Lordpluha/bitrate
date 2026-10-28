import { RELEASE_PUBLISHING_JOBS } from '@infra/queues/release-publishing.queue'
import { afterEach, beforeEach, describe, expect, it, jest } from '@jest/globals'
import type { AlbumsService } from '@modules/albums/albums.service'
import type { NotificationsProducer } from '@modules/notifications'
import type {
  AttachReleaseTrack,
  PendingReleaseTrack,
  TrackUploadService,
} from '@modules/tracks/track-upload.service'
import { ConflictException, NotFoundException } from '@nestjs/common'
import type { Prisma } from '@prisma/client'
import { type PrismaMock, prismaMock, resetPrismaMock } from '@test/mocks'
import type { Queue } from 'bullmq'
import { type DeepMockProxy, mockDeep } from 'jest-mock-extended'
import { ReleasePublishingService } from './release-publishing.service'

/** `TrackUploadService` pulls in the ESM-only `music-metadata`, which Jest cannot load. */
jest.mock('music-metadata', () => ({ parseFile: jest.fn() }), { virtual: true })

const OWNER = '0199aee0-0000-7000-8000-0000000000a1'
const RELEASE = '0199aee0-0000-7000-8000-000000000001'
const VERSION = '2026-10-27T10:00:00.000Z'
const NOW = new Date('2026-10-27T12:00:00.000Z')
const SUMMARY = {
  id: RELEASE,
  title: 'Night Signal',
  type: 'EP' as const,
  status: 'PUBLISHING' as const,
  upc: null,
  scheduledAt: null,
  createdAt: NOW,
  updatedAt: NOW,
}

/** What `complete` reads: two recordings, both linked, in running order. */
const completionRecord = (statuses: Array<'PROCESSING' | 'READY' | 'FAILED'>) => ({
  ownerArtistId: OWNER,
  title: 'Night Signal',
  type: 'EP',
  cover: '/static/releases/covers/c.webp',
  _count: { trackDrafts: statuses.length },
  tracks: statuses.map((processingStatus, index) => ({
    trackId: `track-${index}`,
    track: { processingStatus },
  })),
})

describe('ReleasePublishingService', () => {
  let prisma: PrismaMock
  let tx: DeepMockProxy<Prisma.TransactionClient>
  let tracks: DeepMockProxy<TrackUploadService>
  let albums: DeepMockProxy<AlbumsService>
  let notifications: DeepMockProxy<NotificationsProducer>
  let queue: DeepMockProxy<Queue>
  let service: ReleasePublishingService

  beforeEach(() => {
    jest.useFakeTimers({ now: NOW })
    resetPrismaMock()
    prisma = prismaMock
    tx = mockDeep<Prisma.TransactionClient>()
    prisma.$transaction.mockImplementation(async (callback: unknown) =>
      (callback as (client: Prisma.TransactionClient) => unknown)(tx),
    )
    tracks = mockDeep<TrackUploadService>()
    albums = mockDeep<AlbumsService>()
    notifications = mockDeep<NotificationsProducer>()
    queue = mockDeep<Queue>()
    service = new ReleasePublishingService(prisma, tracks, albums, notifications, queue)
  })

  afterEach(() => {
    jest.useRealTimers()
  })

  describe('publish', () => {
    it('claims an approved release at the read version and queues it right away', async () => {
      prisma.release.findFirst.mockResolvedValue({ scheduledAt: null } as never)
      prisma.release.updateManyAndReturn.mockResolvedValue([SUMMARY] as never)

      await expect(service.publish(OWNER, RELEASE, { expectedUpdatedAt: VERSION })).resolves.toBe(
        SUMMARY,
      )

      expect(prisma.release.updateManyAndReturn).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            id: RELEASE,
            ownerArtistId: OWNER,
            status: 'READY',
            updatedAt: new Date(VERSION),
          }),
          data: { status: 'PUBLISHING' },
        }),
      )
      expect(queue.add).toHaveBeenCalledWith(
        RELEASE_PUBLISHING_JOBS.PUBLISH,
        { releaseId: RELEASE },
        expect.not.objectContaining({ delay: expect.anything() }),
      )
    })

    it('schedules a premiere still ahead as a delayed job', async () => {
      const premiere = new Date('2026-10-28T18:00:00.000Z')
      prisma.release.findFirst.mockResolvedValue({ scheduledAt: premiere } as never)
      prisma.release.updateManyAndReturn.mockResolvedValue([
        { ...SUMMARY, status: 'SCHEDULED' },
      ] as never)

      await service.publish(OWNER, RELEASE, { expectedUpdatedAt: VERSION })

      expect(prisma.release.updateManyAndReturn).toHaveBeenCalledWith(
        expect.objectContaining({ data: { status: 'SCHEDULED' } }),
      )
      expect(queue.add).toHaveBeenCalledWith(
        RELEASE_PUBLISHING_JOBS.PUBLISH,
        { releaseId: RELEASE },
        expect.objectContaining({
          jobId: `release-premiere-${RELEASE}-${premiere.getTime()}`,
          delay: premiere.getTime() - NOW.getTime(),
        }),
      )
    })

    it('hides a release that is not the artist’s', async () => {
      prisma.release.findFirst.mockResolvedValue(null)
      await expect(
        service.publish(OWNER, RELEASE, { expectedUpdatedAt: VERSION }),
      ).rejects.toBeInstanceOf(NotFoundException)
      expect(queue.add).not.toHaveBeenCalled()
    })

    it('refuses a release that changed or is not approved', async () => {
      prisma.release.findFirst.mockResolvedValue({ scheduledAt: null } as never)
      prisma.release.updateManyAndReturn.mockResolvedValue([])
      await expect(
        service.publish(OWNER, RELEASE, { expectedUpdatedAt: VERSION }),
      ).rejects.toBeInstanceOf(ConflictException)
      expect(queue.add).not.toHaveBeenCalled()
    })

    it('undoes the claim when the job cannot be queued', async () => {
      prisma.release.findFirst.mockResolvedValue({ scheduledAt: null } as never)
      prisma.release.updateManyAndReturn.mockResolvedValue([SUMMARY] as never)
      queue.add.mockRejectedValue(new Error('Redis unavailable'))

      await expect(service.publish(OWNER, RELEASE, { expectedUpdatedAt: VERSION })).rejects.toThrow(
        'Redis unavailable',
      )
      expect(prisma.release.updateMany).toHaveBeenCalledWith({
        where: { id: RELEASE, status: { in: ['PUBLISHING', 'SCHEDULED'] } },
        data: { status: 'READY' },
      })
    })
  })

  describe('materialize', () => {
    it('creates every track before starting any conversion, linking each in running order', async () => {
      const events: string[] = []
      prisma.release.findFirst
        .mockResolvedValueOnce({
          ownerArtistId: OWNER,
          cover: null,
          trackDrafts: [
            {
              title: 'One',
              duration: 60,
              isrc: null,
              audioKey: 'm/1.wav',
              audioContentType: 'audio/wav',
            },
            {
              title: 'Two',
              duration: 70,
              isrc: 'USX9P2600012',
              audioKey: 'm/2.wav',
              audioContentType: 'audio/wav',
            },
          ],
          contributors: [{ artistId: OWNER }, { artistId: 'featured-artist' }, { artistId: null }],
          tracks: [],
        } as never)
        .mockResolvedValueOnce(null)
      tracks.createReleaseTrack.mockImplementation(
        async (_artist, _cover, recording, attach: AttachReleaseTrack) => {
          events.push(`create ${recording.title}`)
          await attach(tx, `track-${recording.title}`)
          return {
            trackId: `track-${recording.title}`,
            conversion: { trackId: recording.title },
          } as unknown as PendingReleaseTrack
        },
      )
      tracks.startReleaseConversion.mockImplementation((conversion) => {
        events.push(`convert ${conversion.trackId}`)
        return Promise.resolve()
      })

      await service.materialize(RELEASE)

      expect(events).toEqual(['create One', 'create Two', 'convert One', 'convert Two'])
      expect(tracks.createReleaseTrack).toHaveBeenCalledWith(
        OWNER,
        null,
        expect.objectContaining({
          title: 'Two',
          isrc: 'USX9P2600012',
          featuredArtistIds: ['featured-artist'],
        }),
        expect.any(Function),
      )
      expect(tx.releaseTrack.create).toHaveBeenCalledWith({
        data: { releaseId: RELEASE, trackId: 'track-Two', position: 2 },
      })
    })

    it('reuses linked tracks and converts again the ones that are not ready', async () => {
      prisma.release.findFirst
        .mockResolvedValueOnce({
          ownerArtistId: OWNER,
          cover: null,
          trackDrafts: [
            {
              title: 'One',
              duration: 60,
              isrc: null,
              audioKey: 'm/1.wav',
              audioContentType: 'audio/wav',
            },
            {
              title: 'Two',
              duration: 70,
              isrc: null,
              audioKey: 'm/2.wav',
              audioContentType: 'audio/wav',
            },
          ],
          contributors: [],
          tracks: [
            { position: 1, track: { id: 'ready-track', processingStatus: 'READY' } },
            { position: 2, track: { id: 'failed-track', processingStatus: 'FAILED' } },
          ],
        } as never)
        .mockResolvedValueOnce(null)

      await service.materialize(RELEASE)

      expect(tracks.createReleaseTrack).not.toHaveBeenCalled()
      expect(tracks.reprocess).toHaveBeenCalledTimes(1)
      expect(tracks.reprocess).toHaveBeenCalledWith('failed-track')
    })

    it('starts a premiere whose time has come before reading the release', async () => {
      prisma.release.findFirst.mockResolvedValue(null)
      await service.materialize(RELEASE)
      expect(prisma.release.updateMany).toHaveBeenCalledWith({
        where: expect.objectContaining({ id: RELEASE, status: 'SCHEDULED' }),
        data: { status: 'PUBLISHING' },
      })
    })
  })

  describe('trackSettled', () => {
    beforeEach(() => {
      prisma.releaseTrack.findFirst.mockResolvedValue({ releaseId: RELEASE } as never)
    })

    it('waits while a track is still converting', async () => {
      prisma.release.findFirst.mockResolvedValue(completionRecord(['READY', 'PROCESSING']) as never)
      await service.trackSettled('track-0')
      expect(prisma.$transaction).not.toHaveBeenCalled()
      expect(prisma.release.updateMany).not.toHaveBeenCalled()
    })

    it('waits while some recordings have no track yet', async () => {
      prisma.release.findFirst.mockResolvedValue({
        ...completionRecord(['READY']),
        _count: { trackDrafts: 2 },
      } as never)
      await service.trackSettled('track-0')
      expect(prisma.$transaction).not.toHaveBeenCalled()
    })

    it('publishes tracks, creates the album and notifies followers once every track is ready', async () => {
      prisma.release.findFirst.mockResolvedValue(completionRecord(['READY', 'READY']) as never)
      tx.release.updateMany.mockResolvedValue({ count: 1 })
      tracks.publishReleaseTracks.mockResolvedValue(2)
      albums.createForRelease.mockResolvedValue('album-1')

      await service.trackSettled('track-1')

      expect(tx.release.updateMany).toHaveBeenCalledWith({
        where: { id: RELEASE, deletedAt: null, status: 'PUBLISHING' },
        data: { status: 'RELEASED', publishedAt: NOW, unpublishedBy: null },
      })
      expect(tracks.publishReleaseTracks).toHaveBeenCalledWith(tx, ['track-0', 'track-1'], NOW)
      expect(albums.createForRelease).toHaveBeenCalledWith(
        tx,
        expect.objectContaining({
          artistId: OWNER,
          trackIds: ['track-0', 'track-1'],
          publishedAt: NOW,
        }),
      )
      expect(tx.release.update).toHaveBeenCalledWith({
        where: { id: RELEASE },
        data: { albumId: 'album-1' },
      })
      expect(notifications.releasePublished).toHaveBeenCalledTimes(1)
      expect(notifications.releasePublished).toHaveBeenCalledWith({ albumId: 'album-1' })
    })

    it('publishes at most once when another event already completed the release', async () => {
      prisma.release.findFirst.mockResolvedValue(completionRecord(['READY', 'READY']) as never)
      tx.release.updateMany.mockResolvedValue({ count: 0 })

      await service.trackSettled('track-1')

      expect(tracks.publishReleaseTracks).not.toHaveBeenCalled()
      expect(albums.createForRelease).not.toHaveBeenCalled()
      expect(notifications.releasePublished).not.toHaveBeenCalled()
    })

    it('rolls back when a track changed meanwhile', async () => {
      prisma.release.findFirst.mockResolvedValue(completionRecord(['READY', 'READY']) as never)
      tx.release.updateMany.mockResolvedValue({ count: 1 })
      tracks.publishReleaseTracks.mockResolvedValue(1)

      await expect(service.trackSettled('track-1')).rejects.toThrow('changed while publishing')
      expect(albums.createForRelease).not.toHaveBeenCalled()
      expect(notifications.releasePublished).not.toHaveBeenCalled()
    })

    it('fails the release when a track failed for good', async () => {
      prisma.release.findFirst.mockResolvedValue(completionRecord(['READY', 'FAILED']) as never)
      await service.trackSettled('track-1')
      expect(prisma.release.updateMany).toHaveBeenCalledWith({
        where: { id: RELEASE, deletedAt: null, status: 'PUBLISHING' },
        data: { status: 'PUBLISH_FAILED' },
      })
      expect(prisma.$transaction).not.toHaveBeenCalled()
    })

    it('ignores a track that belongs to no release', async () => {
      prisma.releaseTrack.findFirst.mockResolvedValue(null)
      await service.trackSettled('standalone-track')
      expect(prisma.release.findFirst).not.toHaveBeenCalled()
    })
  })

  describe('going offline and back', () => {
    beforeEach(() => {
      tx.release.findUniqueOrThrow.mockResolvedValue({
        albumId: 'album-1',
        tracks: [{ trackId: 'track-0' }],
      } as never)
    })

    it('hides the tracks and the album when the artist unpublishes', async () => {
      tx.release.updateManyAndReturn.mockResolvedValue([
        { ...SUMMARY, status: 'UNPUBLISHED' },
      ] as never)

      await service.unpublish(OWNER, RELEASE, { expectedUpdatedAt: VERSION })

      expect(tx.release.updateManyAndReturn).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ status: 'RELEASED', ownerArtistId: OWNER }),
          data: { status: 'UNPUBLISHED', unpublishedBy: 'ARTIST' },
        }),
      )
      expect(tracks.hideReleaseTracks).toHaveBeenCalledWith(tx, ['track-0'])
      expect(albums.setReleaseAlbumVisibility).toHaveBeenCalledWith(tx, 'album-1', null)
      expect(tracks.invalidateCatalogueCaches).toHaveBeenCalled()
    })

    it('republishes only the artist’s own takedown, without notifying followers again', async () => {
      tx.release.updateManyAndReturn.mockResolvedValue([
        { ...SUMMARY, status: 'RELEASED' },
      ] as never)

      await service.republish(OWNER, RELEASE, { expectedUpdatedAt: VERSION })

      expect(tx.release.updateManyAndReturn).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ status: 'UNPUBLISHED', unpublishedBy: 'ARTIST' }),
          data: { status: 'RELEASED', unpublishedBy: null },
        }),
      )
      expect(tracks.publishReleaseTracks).toHaveBeenCalledWith(tx, ['track-0'], NOW)
      expect(albums.setReleaseAlbumVisibility).toHaveBeenCalledWith(tx, 'album-1', NOW)
      expect(notifications.releasePublished).not.toHaveBeenCalled()
    })

    it('refuses to republish a release Bitrate took down', async () => {
      tx.release.updateManyAndReturn.mockResolvedValue([])
      tx.release.findFirst.mockResolvedValue({ id: RELEASE } as never)

      await expect(
        service.republish(OWNER, RELEASE, { expectedUpdatedAt: VERSION }),
      ).rejects.toBeInstanceOf(ConflictException)
      expect(tracks.publishReleaseTracks).not.toHaveBeenCalled()
    })

    it('lets Bitrate take down a live release so the artist cannot undo it', async () => {
      tx.release.updateManyAndReturn.mockResolvedValue([
        { ...SUMMARY, status: 'UNPUBLISHED' },
      ] as never)

      await service.takeDown(RELEASE)

      expect(tx.release.updateManyAndReturn).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ status: { in: ['RELEASED', 'UNPUBLISHED'] } }),
          data: { status: 'UNPUBLISHED', unpublishedBy: 'ADMIN' },
        }),
      )
      expect(tracks.hideReleaseTracks).toHaveBeenCalledWith(tx, ['track-0'])
    })
  })

  describe('retry', () => {
    it('moves only a failed release back to publishing and queues it', async () => {
      prisma.release.updateManyAndReturn.mockResolvedValue([SUMMARY] as never)
      await service.retry(RELEASE)
      expect(prisma.release.updateManyAndReturn).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: RELEASE, deletedAt: null, status: 'PUBLISH_FAILED' },
          data: { status: 'PUBLISHING' },
        }),
      )
      expect(queue.add).toHaveBeenCalled()
    })

    it('refuses a release whose publishing has not failed', async () => {
      prisma.release.updateManyAndReturn.mockResolvedValue([])
      await expect(service.retry(RELEASE)).rejects.toBeInstanceOf(ConflictException)
      expect(queue.add).not.toHaveBeenCalled()
    })
  })
})
