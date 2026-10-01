import { open, rm } from 'node:fs/promises'
import { resolveSafeMulterPath } from '@common/utils/multer-file'
import type { StorageService } from '@infra/storage/storage.types'
import { beforeEach, describe, expect, it, jest } from '@jest/globals'
import { NotFoundException } from '@nestjs/common'
import type { ConfigService } from '@nestjs/config'
import {
  makeCacheMock,
  makeConfigMock,
  makeProcessingAttemptRecorderMock,
  makeQueueMock,
  makeStorageMock,
  mockTransaction,
  type PrismaMock,
  prismaMock,
  resetPrismaMock,
} from '@test/mocks'
import type { Queue } from 'bullmq'
import { parseFile } from 'music-metadata'
import { buildAudioFile, buildCoverFile, buildTrack } from './__tests__/fixtures/tracks.fixtures'
import { downloadObjectToFile, storeMaster } from './audio-master'
import type { CreateTrackDto } from './dtos/create-track.dto'
import { uploadDestination } from './track-media'
import { TrackUploadService } from './track-upload.service'

jest.mock(
  'music-metadata',
  () => ({
    parseFile: jest.fn().mockResolvedValue({
      format: { duration: 100, bitrate: 128000 },
    } as never),
  }),
  { virtual: true },
)

jest.mock('node:fs/promises', () => ({
  open: jest.fn().mockResolvedValue({
    read: jest.fn().mockImplementation((buf: unknown) => {
      const header = buf as Buffer
      header.set([0x89, 0x50, 0x4e, 0x47])
      return Promise.resolve()
    }),
    close: jest.fn().mockResolvedValue(undefined as never),
  } as never),
  rm: jest.fn().mockResolvedValue(undefined as never),
}))

jest.mock('./audio-master', () => ({
  storeMaster: jest.fn().mockResolvedValue(undefined as never),
  downloadObjectToFile: jest.fn().mockResolvedValue(undefined as never),
}))

const openMock = open as jest.MockedFunction<typeof open>
const rmMock = rm as jest.MockedFunction<typeof rm>
const storeMasterMock = storeMaster as jest.MockedFunction<typeof storeMaster>
const downloadMock = downloadObjectToFile as jest.MockedFunction<typeof downloadObjectToFile>
const parseFileMock = parseFile as jest.MockedFunction<typeof parseFile>

describe('TrackUploadService', () => {
  let service: TrackUploadService
  let prisma: PrismaMock
  let queue: jest.Mocked<Queue>
  let config: jest.Mocked<ConfigService>
  let storage: jest.Mocked<StorageService>
  const recorder = makeProcessingAttemptRecorderMock()

  beforeEach(() => {
    jest.clearAllMocks()
    resetPrismaMock()
    prisma = prismaMock
    queue = makeQueueMock()
    config = makeConfigMock()
    storage = makeStorageMock()
    storage.getObjectMeta.mockResolvedValue({ contentLength: 9_000 } as never)
    storage.deleteObject.mockResolvedValue(undefined as never)
    service = new TrackUploadService(prisma, queue, config, makeCacheMock(), recorder, storage)
  })

  describe('create', () => {
    it('should create track and enqueue conversion job', async () => {
      const track = buildTrack()
      const audioFile = buildAudioFile()
      prisma.track.create.mockResolvedValue(track as never)
      queue.add.mockResolvedValue({} as never)

      const result = await service.create(
        'artist-1',
        { title: 'Track title' } as CreateTrackDto,
        audioFile,
      )

      expect(prisma.track.create).toHaveBeenCalled()
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
        filePath: resolveSafeMulterPath(audioFile, uploadDestination(audioFile)),
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

      await service.create('artist-1', { title: 'Track title' } as CreateTrackDto, audioFile)

      expect(prisma.trackFile.create).not.toHaveBeenCalled()
    })

    it('should mark the track failed when the queue cannot accept the job', async () => {
      const track = buildTrack()
      const audioFile = buildAudioFile()
      prisma.track.create.mockResolvedValue(track as never)
      prisma.track.update.mockResolvedValue(track as never)
      queue.add.mockRejectedValue(new Error('Redis unavailable') as never)

      await expect(
        service.create('artist-1', { title: 'Track title' } as CreateTrackDto, audioFile),
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
        { title: 'Track title' } as CreateTrackDto,
        audioFile,
        undefined,
      )

      expect(prisma.track.create).toHaveBeenCalledWith(
        expect.objectContaining({ data: expect.objectContaining({ cover: null }) }),
      )
    })

    it('rejects spoofed cover content and removes every unowned upload', async () => {
      const audioFile = buildAudioFile()
      const coverFile = buildCoverFile({ originalname: 'payload.html', mimetype: 'image/png' })
      openMock.mockResolvedValueOnce({
        read: jest.fn().mockImplementation((buf: unknown) => {
          ;(buf as Buffer).set(Buffer.from('<script>bad', 'ascii'))
          return Promise.resolve()
        }),
        close: jest.fn().mockResolvedValue(undefined as never),
      } as never)

      await expect(
        service.create(
          'artist-1',
          { title: 'Track title' } as CreateTrackDto,
          audioFile,
          coverFile,
        ),
      ).rejects.toThrow('Invalid cover file content')

      expect(prisma.track.create).not.toHaveBeenCalled()
      expect(rmMock).toHaveBeenCalledWith(
        resolveSafeMulterPath(audioFile, uploadDestination(audioFile)),
        { force: true },
      )
      expect(rmMock).toHaveBeenCalledWith(
        resolveSafeMulterPath(coverFile, uploadDestination(coverFile)),
        { force: true },
      )
    })

    it('rejects a source bitrate below the converter minimum before creating a track', async () => {
      const audioFile = buildAudioFile()
      parseFileMock.mockResolvedValueOnce({
        format: { duration: 100, bitrate: 31_000 },
      } as never)

      await expect(
        service.create('artist-1', { title: 'Track title' } as CreateTrackDto, audioFile),
      ).rejects.toThrow('Source audio bitrate must be at least 32 kbps')

      expect(prisma.track.create).not.toHaveBeenCalled()
      expect(queue.add).not.toHaveBeenCalled()
      expect(rmMock).toHaveBeenCalledWith(
        resolveSafeMulterPath(audioFile, uploadDestination(audioFile)),
        { force: true },
      )
    })
  })

  describe('update', () => {
    it('should update track and enqueue job when audio file provided', async () => {
      const track = buildTrack()
      const audioFile = buildAudioFile()
      mockTransaction(prisma)
      prisma.track.update.mockResolvedValue(track as never)
      prisma.trackFile.deleteMany.mockResolvedValue({ count: 1 } as never)
      queue.add.mockResolvedValue({} as never)

      prisma.track.findFirst.mockResolvedValue(track as never)

      const result = await service.update(
        'artist-1',
        'track-1',
        { title: 'Updated' } as CreateTrackDto,
        audioFile,
      )

      expect(storeMasterMock).toHaveBeenCalledWith(
        expect.objectContaining({ key: `masters/${audioFile.filename}` }),
      )
      expect(storage.deleteObject).toHaveBeenCalledWith(`masters/${track.audioUrl}`)
      expect(prisma.track.update).toHaveBeenCalled()
      expect(prisma.trackFile.deleteMany).toHaveBeenCalledWith({
        where: { trackId: track.id, url: track.audioUrl },
      })
      expect(prisma.trackFile.upsert).not.toHaveBeenCalled()
      expect(queue.add).toHaveBeenCalledWith(
        'convert-audio',
        expect.objectContaining({
          sourceFileName: audioFile.filename,
          trigger: 'REPLACE',
          masterKey: `masters/${audioFile.filename}`,
          input: expect.objectContaining({ bytes: audioFile.size }),
        }),
        expect.objectContaining({ attempts: 5 }),
      )
      expect(result).toBe(track)
    })

    it('should update track without queue when no audio file', async () => {
      const track = buildTrack()
      mockTransaction(prisma)
      prisma.track.update.mockResolvedValue(track as never)

      prisma.track.findFirst.mockResolvedValue(track as never)

      await service.update('artist-1', 'track-1', { title: 'Updated' } as never)

      expect(queue.add).not.toHaveBeenCalled()
    })

    it('removes an uploaded replacement when ownership validation fails', async () => {
      const audioFile = buildAudioFile()
      prisma.track.findFirst.mockResolvedValue(null)

      await expect(
        service.update('artist-2', 'track-1', { title: 'Updated' } as never, audioFile),
      ).rejects.toThrow(NotFoundException)

      expect(rmMock).toHaveBeenCalledWith(
        resolveSafeMulterPath(audioFile, uploadDestination(audioFile)),
        { force: true },
      )
      expect(prisma.track.update).not.toHaveBeenCalled()
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
      expect(storage.getObjectMeta).toHaveBeenCalledWith(`masters/${track.audioUrl}`)
      expect(downloadMock).toHaveBeenCalledWith(
        storage,
        `masters/${track.audioUrl}`,
        expect.any(String),
      )
      expect(result).toBe(track)
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
