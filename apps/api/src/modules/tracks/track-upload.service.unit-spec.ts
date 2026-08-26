import { open, rm } from 'node:fs/promises'
import { beforeEach, describe, expect, it, jest } from '@jest/globals'
import { NotFoundException } from '@nestjs/common'
import type { ConfigService } from '@nestjs/config'
import {
  makeCacheMock,
  makeConfigMock,
  makeQueueMock,
  mockTransaction,
  type PrismaMock,
  prismaMock,
  resetPrismaMock,
} from '@test/mocks'
import type { Queue } from 'bullmq'
import { parseFile } from 'music-metadata'
import { buildAudioFile, buildCoverFile, buildTrack } from './__tests__/fixtures/tracks.fixtures'
import type { CreateTrackDto } from './dtos/create-track.dto'
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

const openMock = open as jest.MockedFunction<typeof open>
const rmMock = rm as jest.MockedFunction<typeof rm>
const parseFileMock = parseFile as jest.MockedFunction<typeof parseFile>

describe('TrackUploadService', () => {
  let service: TrackUploadService
  let prisma: PrismaMock
  let queue: jest.Mocked<Queue>
  let config: jest.Mocked<ConfigService>

  beforeEach(() => {
    jest.clearAllMocks()
    resetPrismaMock()
    prisma = prismaMock
    queue = makeQueueMock()
    config = makeConfigMock()
    service = new TrackUploadService(prisma, queue, config, makeCacheMock())
  })

  describe('create', () => {
    it('should create track in transaction and enqueue conversion job', async () => {
      const track = buildTrack()
      const audioFile = buildAudioFile()
      mockTransaction(prisma)
      prisma.track.create.mockResolvedValue(track as never)
      prisma.trackFile.create.mockResolvedValue({ id: 'tf-1' } as never)
      queue.add.mockResolvedValue({} as never)

      const result = await service.create(
        'artist-1',
        { title: 'Track title' } as CreateTrackDto,
        audioFile,
      )

      expect(prisma.track.create).toHaveBeenCalled()
      expect(prisma.trackFile.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ bitrate: 128 }),
        }),
      )
      expect(queue.add).toHaveBeenCalledWith(
        'convert-audio',
        expect.objectContaining({
          bitrates: ['128k'],
          sourceFileName: audioFile.filename,
        }),
        expect.objectContaining({
          attempts: 5,
          backoff: { type: 'exponential', delay: 5_000 },
          jobId: expect.stringContaining(audioFile.filename),
        }),
      )
      expect(result).toBe(track)
    })

    it('should mark the track failed when the queue cannot accept the job', async () => {
      const track = buildTrack()
      const audioFile = buildAudioFile()
      mockTransaction(prisma)
      prisma.track.create.mockResolvedValue(track as never)
      prisma.trackFile.create.mockResolvedValue({ id: 'tf-1' } as never)
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
    })

    it('should set cover to null when no cover file provided', async () => {
      const track = buildTrack()
      const audioFile = buildAudioFile()
      mockTransaction(prisma)
      prisma.track.create.mockResolvedValue(track as never)
      prisma.trackFile.create.mockResolvedValue({ id: 'tf-1' } as never)
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
      expect(rmMock).toHaveBeenCalledWith(audioFile.path, { force: true })
      expect(rmMock).toHaveBeenCalledWith(coverFile.path, { force: true })
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
      expect(rmMock).toHaveBeenCalledWith(audioFile.path, { force: true })
    })
  })

  describe('update', () => {
    it('should update track and enqueue job when audio file provided', async () => {
      const track = buildTrack()
      const audioFile = buildAudioFile()
      mockTransaction(prisma)
      prisma.track.update.mockResolvedValue(track as never)
      prisma.trackFile.upsert.mockResolvedValue({ id: 'tf-1' } as never)
      queue.add.mockResolvedValue({} as never)

      prisma.track.findFirst.mockResolvedValue(track as never)

      const result = await service.update(
        'artist-1',
        'track-1',
        { title: 'Updated' } as CreateTrackDto,
        audioFile,
      )

      expect(prisma.track.update).toHaveBeenCalled()
      expect(queue.add).toHaveBeenCalledWith(
        'convert-audio',
        expect.objectContaining({ sourceFileName: audioFile.filename }),
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

      expect(rmMock).toHaveBeenCalledWith(audioFile.path, { force: true })
      expect(prisma.track.update).not.toHaveBeenCalled()
    })
  })
})
