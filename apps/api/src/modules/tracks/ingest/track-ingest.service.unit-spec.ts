import { rm } from 'node:fs/promises'
import { ARTIST_AGREEMENT_VERSION } from '@common/legal'
import { resolveSafeMulterPath } from '@common/utils/multer-file'
import type { StorageService } from '@infra/storage/storage.types'
import { beforeEach, describe, expect, it, jest } from '@jest/globals'
import { NotFoundException } from '@nestjs/common'
import {
  makeCacheMock,
  makeProcessingAttemptRecorderMock,
  makeQueueMock,
  makeStorageMock,
  type PrismaMock,
  prismaMock,
  resetPrismaMock,
} from '@test/mocks'
import type { Queue } from 'bullmq'
import { parseFile } from 'music-metadata'
import { buildAudioFile, buildCoverFile, buildTrack } from '../__tests__/fixtures/tracks.fixtures'
import type { CreateTrackDto } from '../dtos/create-track.dto'
import { AudioConversionProducer } from '../processing/audio-conversion.producer'
import { downloadObjectToFile, storeMaster } from '../shared/audio-master'
import { getUploadTempDir } from '../shared/audio-scratch'
import { TrackIngestService } from './track-ingest.service'

jest.mock('node:fs/promises', () => ({
  rm: jest.fn().mockResolvedValue(undefined as never),
  stat: jest.fn().mockResolvedValue({ size: 9_000 } as never),
}))

jest.mock('../shared/audio-master', () => ({
  storeMaster: jest.fn().mockResolvedValue(undefined as never),
  downloadObjectToFile: jest.fn().mockResolvedValue(undefined as never),
}))

const rmMock = rm as jest.MockedFunction<typeof rm>
const storeMasterMock = storeMaster as jest.MockedFunction<typeof storeMaster>
const downloadMock = downloadObjectToFile as jest.MockedFunction<typeof downloadObjectToFile>
const parseFileMock = parseFile as jest.MockedFunction<typeof parseFile>

describe('TrackIngestService', () => {
  let service: TrackIngestService
  let prisma: PrismaMock
  let queue: jest.Mocked<Queue>
  let storage: jest.Mocked<StorageService>
  const recorder = makeProcessingAttemptRecorderMock()

  beforeEach(() => {
    jest.clearAllMocks()
    resetPrismaMock()
    prisma = prismaMock
    queue = makeQueueMock()
    storage = makeStorageMock()
    storage.deleteObject.mockResolvedValue(undefined as never)
    service = new TrackIngestService(
      prisma,
      makeCacheMock(),
      new AudioConversionProducer(prisma, queue, recorder),
      storage,
    )
  })

  describe('create', () => {
    it('should create track and enqueue conversion job', async () => {
      const track = buildTrack()
      const audioFile = buildAudioFile()
      prisma.track.create.mockResolvedValue(track as never)
      queue.add.mockResolvedValue({} as never)

      const result = await service.create(
        'artist-1',
        { title: 'Track title', rightsConfirmed: true } as CreateTrackDto,
        audioFile,
      )

      expect(prisma.track.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          artistId: 'artist-1',
          title: 'Track title',
          rightsConfirmedVersion: ARTIST_AGREEMENT_VERSION,
          rightsConfirmedAt: expect.any(Date),
          publishedAt: expect.any(Date),
        }),
      })
      expect(queue.add).toHaveBeenCalledWith(
        'convert-audio',
        expect.objectContaining({
          bitrates: ['128k'],
          sourceFileName: audioFile.filename,
          trigger: 'UPLOAD',
          input: expect.objectContaining({
            bytes: audioFile.size,
            bitrateKbps: 128,
            durationSec: 100,
          }),
        }),
        expect.objectContaining({
          attempts: 5,
          backoff: { type: 'exponential', delay: 5_000 },
          jobId: expect.stringContaining(audioFile.filename),
        }),
      )
      expect(result).toBe(track)
    })

    it('stores the master in storage before enqueueing a job that names it by key only', async () => {
      const audioFile = buildAudioFile()
      prisma.track.create.mockResolvedValue(buildTrack() as never)
      queue.add.mockResolvedValue({} as never)

      await service.create('artist-1', { title: 'Track title' } as CreateTrackDto, audioFile)

      expect(storeMasterMock).toHaveBeenCalledWith({
        storage,
        key: `masters/${audioFile.filename}`,
        filePath: resolveSafeMulterPath(audioFile, getUploadTempDir()),
        contentType: 'audio/mpeg',
      })
      expect(storeMasterMock.mock.invocationCallOrder[0]).toBeLessThan(
        queue.add.mock.invocationCallOrder[0] as number,
      )
      const payload = queue.add.mock.calls[0]?.[1] as Record<string, unknown>
      expect(payload.masterKey).toBe(`masters/${audioFile.filename}`)
      expect(payload).not.toHaveProperty('inputPath')
      expect(payload).not.toHaveProperty('outputDir')
    })

    it('does not enqueue and removes the stored master when the track cannot be created', async () => {
      const audioFile = buildAudioFile()
      prisma.track.create.mockRejectedValue(new Error('db down') as never)

      await expect(
        service.create('artist-1', { title: 'Track title' } as CreateTrackDto, audioFile),
      ).rejects.toThrow('db down')

      expect(queue.add).not.toHaveBeenCalled()
      expect(storage.deleteObject).toHaveBeenCalledWith(`masters/${audioFile.filename}`)
    })

    it('does not persist a TrackFile row for the raw upload', async () => {
      const track = buildTrack()
      const audioFile = buildAudioFile()
      prisma.track.create.mockResolvedValue(track as never)
      queue.add.mockResolvedValue({} as never)

      await service.create(
        'artist-1',
        { title: 'Track title', rightsConfirmed: true } as CreateTrackDto,
        audioFile,
      )

      expect(prisma.trackFile.create).not.toHaveBeenCalled()
    })

    it('should mark the track failed when the queue cannot accept the job', async () => {
      const track = buildTrack()
      const audioFile = buildAudioFile()
      prisma.track.create.mockResolvedValue(track as never)
      prisma.track.update.mockResolvedValue(track as never)
      queue.add.mockRejectedValue(new Error('Redis unavailable') as never)

      await expect(
        service.create(
          'artist-1',
          { title: 'Track title', rightsConfirmed: true } as CreateTrackDto,
          audioFile,
        ),
      ).rejects.toThrow('Redis unavailable')

      expect(prisma.track.update).toHaveBeenCalledWith({
        where: { id: track.id },
        data: expect.objectContaining({
          processingStatus: 'FAILED',
          processingError: 'Redis unavailable',
        }),
      })
      expect(recorder.recordEnqueueFailure).toHaveBeenCalledWith(
        expect.objectContaining({
          trackId: track.id,
          trigger: 'UPLOAD',
          jobId: expect.stringContaining(audioFile.filename),
        }),
      )
    })

    it('should set cover to null when no cover file provided', async () => {
      const track = buildTrack()
      const audioFile = buildAudioFile()
      prisma.track.create.mockResolvedValue(track as never)
      queue.add.mockResolvedValue({} as never)

      await service.create(
        'artist-1',
        { title: 'Track title', rightsConfirmed: true } as CreateTrackDto,
        audioFile,
        undefined,
      )

      expect(prisma.track.create).toHaveBeenCalledWith(
        expect.objectContaining({ data: expect.objectContaining({ cover: null }) }),
      )
    })

    it('uploads the cover to storage under tracks/covers and stores only its generated name', async () => {
      const audioFile = buildAudioFile()
      const coverFile = buildCoverFile()
      prisma.track.create.mockResolvedValue(buildTrack() as never)
      queue.add.mockResolvedValue({} as never)

      await service.create(
        'artist-1',
        { title: 'Track title', rightsConfirmed: true } as CreateTrackDto,
        audioFile,
        coverFile,
      )

      const [key, body, contentType] = storage.upload.mock.calls[0] as [string, Buffer, string]
      expect(key).toMatch(/^tracks\/covers\/[0-9a-f-]{36}\.png$/)
      expect(body).toBe(coverFile.buffer)
      expect(contentType).toBe('image/png')
      expect(prisma.track.create).toHaveBeenCalledWith({
        data: expect.objectContaining({ cover: key.replace('tracks/covers/', '') }),
      })
    })

    it('rejects spoofed cover content, uploading no cover and removing the audio temp file', async () => {
      const audioFile = buildAudioFile()
      const coverFile = buildCoverFile({
        originalname: 'payload.html',
        buffer: Buffer.from('<script>bad', 'ascii'),
      })

      await expect(
        service.create(
          'artist-1',
          { title: 'Track title', rightsConfirmed: true } as CreateTrackDto,
          audioFile,
          coverFile,
        ),
      ).rejects.toThrow('Invalid image file content')

      expect(prisma.track.create).not.toHaveBeenCalled()
      expect(storage.upload).not.toHaveBeenCalled()
      expect(rmMock).toHaveBeenCalledWith(resolveSafeMulterPath(audioFile, getUploadTempDir()), {
        force: true,
      })
    })

    it('removes the stored cover and master when the track cannot be created', async () => {
      const audioFile = buildAudioFile()
      prisma.track.create.mockRejectedValue(new Error('db down') as never)

      await expect(
        service.create(
          'artist-1',
          { title: 'Track title' } as CreateTrackDto,
          audioFile,
          buildCoverFile(),
        ),
      ).rejects.toThrow('db down')

      const coverKey = storage.upload.mock.calls[0]?.[0] as string
      expect(storage.deleteObject).toHaveBeenCalledWith(coverKey)
      expect(storage.deleteObject).toHaveBeenCalledWith(`masters/${audioFile.filename}`)
    })

    it('removes the stored master when the cover upload fails alongside it', async () => {
      const audioFile = buildAudioFile()
      storage.upload.mockRejectedValue(new Error('cover upload failed') as never)

      await expect(
        service.create(
          'artist-1',
          { title: 'Track title' } as CreateTrackDto,
          audioFile,
          buildCoverFile(),
        ),
      ).rejects.toThrow('cover upload failed')

      expect(storeMasterMock).toHaveBeenCalled()
      expect(storage.deleteObject).toHaveBeenCalledTimes(1)
      expect(storage.deleteObject).toHaveBeenCalledWith(`masters/${audioFile.filename}`)
      expect(prisma.track.create).not.toHaveBeenCalled()
    })

    it('rejects a source bitrate below the converter minimum before creating a track', async () => {
      const audioFile = buildAudioFile()
      parseFileMock.mockResolvedValueOnce({
        format: { duration: 100, bitrate: 31_000 },
      } as never)

      await expect(
        service.create(
          'artist-1',
          { title: 'Track title', rightsConfirmed: true } as CreateTrackDto,
          audioFile,
        ),
      ).rejects.toThrow('Source audio bitrate must be at least 32 kbps')

      expect(prisma.track.create).not.toHaveBeenCalled()
      expect(queue.add).not.toHaveBeenCalled()
      expect(rmMock).toHaveBeenCalledWith(resolveSafeMulterPath(audioFile, getUploadTempDir()), {
        force: true,
      })
    })
  })

  describe('reprocess', () => {
    it('re-enqueues the stored source with trigger REPROCESS and a fresh input probe', async () => {
      const track = buildTrack()
      prisma.track.findFirst.mockResolvedValue(track as never)
      prisma.track.update.mockResolvedValue(track as never)
      queue.add.mockResolvedValue({} as never)

      const result = await service.reprocess(track.id)

      expect(queue.add).toHaveBeenCalledWith(
        'convert-audio',
        expect.objectContaining({
          sourceFileName: track.audioUrl,
          trigger: 'REPROCESS',
          masterKey: `masters/${track.audioUrl}`,
          input: expect.objectContaining({ bytes: 9_000, bitrateKbps: 128, durationSec: 100 }),
        }),
        expect.objectContaining({ attempts: 5 }),
      )
      expect(storage.getObjectMeta).not.toHaveBeenCalled()
      expect(downloadMock).toHaveBeenCalledWith(
        storage,
        `masters/${track.audioUrl}`,
        expect.any(String),
      )
      expect(result).toBe(track)
    })

    it('replaces a finished job under the same id, so the reprocess actually runs', async () => {
      // BullMQ keeps a failed job for days and silently ignores add() with its id; the
      // reprocess would otherwise flip the track to PROCESSING with nothing queued.
      const track = buildTrack()
      prisma.track.findFirst.mockResolvedValue(track as never)
      prisma.track.update.mockResolvedValue(track as never)
      const finished = {
        getState: jest.fn().mockResolvedValue('failed' as never),
        remove: jest.fn().mockResolvedValue(undefined as never),
      }
      queue.getJob.mockResolvedValue(finished as never)
      queue.add.mockResolvedValue({} as never)

      await service.reprocess(track.id)

      expect(queue.getJob).toHaveBeenCalledWith(`convert-audio-${track.id}-${track.audioUrl}`)
      expect(finished.remove).toHaveBeenCalledTimes(1)
      expect(finished.remove.mock.invocationCallOrder[0]).toBeLessThan(
        queue.add.mock.invocationCallOrder[0] ?? Number.POSITIVE_INFINITY,
      )
    })

    it('keeps a job that is still queued or running instead of replacing it', async () => {
      const track = buildTrack()
      prisma.track.findFirst.mockResolvedValue(track as never)
      prisma.track.update.mockResolvedValue(track as never)
      const live = {
        getState: jest.fn().mockResolvedValue('active' as never),
        remove: jest.fn().mockResolvedValue(undefined as never),
      }
      queue.getJob.mockResolvedValue(live as never)
      queue.add.mockResolvedValue({} as never)

      await service.reprocess(track.id)

      expect(live.remove).not.toHaveBeenCalled()
      expect(queue.add).toHaveBeenCalledTimes(1)
    })

    it('throws when the master is missing from storage', async () => {
      prisma.track.findFirst.mockResolvedValue(buildTrack() as never)
      storage.exists.mockResolvedValue(false as never)

      await expect(service.reprocess('track-1')).rejects.toThrow(NotFoundException)
      expect(queue.add).not.toHaveBeenCalled()
    })

    it('throws when the track does not exist or was soft-deleted', async () => {
      prisma.track.findFirst.mockResolvedValue(null)

      await expect(service.reprocess('missing-track')).rejects.toThrow(NotFoundException)
      expect(queue.add).not.toHaveBeenCalled()
    })
  })
})
