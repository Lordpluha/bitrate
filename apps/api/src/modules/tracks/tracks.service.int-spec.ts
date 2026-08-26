import type { AppConfig } from '@common/config'
import { CacheService } from '@infra/cache/cache.service'
import { PrismaService } from '@infra/prisma/prisma.service'
import { STORAGE_SERVICE } from '@infra/storage/storage.constants'
import { afterAll, beforeAll, beforeEach, describe, expect, it, jest } from '@jest/globals'
import { getQueueToken } from '@nestjs/bullmq'
import { NotFoundException } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { Test, type TestingModule } from '@nestjs/testing'
import { prismaMock, resetPrismaMock } from '@test/mocks'
import type { Queue } from 'bullmq'
import { buildAudioFile, buildTrack } from './__tests__/fixtures/tracks.fixtures'
import { TrackStreamingService } from './track-streaming.service'
import { TrackUploadService } from './track-upload.service'
import { TracksService } from './tracks.service'

const makeQueueMock = () =>
  ({
    add: jest.fn(),
  }) as unknown as jest.Mocked<Queue>

const makeConfigMock = () =>
  ({
    getOrThrow: jest.fn().mockReturnValue({
      getTracksDir: (filename?: string) => (filename ? `/storage/${filename}` : '/storage'),
    }),
  }) as unknown as jest.Mocked<ConfigService<AppConfig>>

jest.mock(
  'music-metadata',
  () => ({
    parseFile: jest.fn().mockResolvedValue({ format: { duration: 100, bitrate: 128000 } } as never),
  }),
  { virtual: true },
)

jest.mock('node:fs', () => ({
  createReadStream: jest.fn().mockReturnValue({ pipe: jest.fn() }),
  promises: {
    stat: jest.fn().mockResolvedValue({ size: 1024 * 1024 } as never),
  },
}))

describe('TracksService (int)', () => {
  let service: TracksService
  let uploadService: TrackUploadService
  let streamingService: TrackStreamingService
  let module: TestingModule
  let queueMock: jest.Mocked<Queue>
  let configMock: jest.Mocked<ConfigService<AppConfig>>

  beforeAll(async () => {
    queueMock = makeQueueMock()
    configMock = makeConfigMock()

    module = await Test.createTestingModule({
      providers: [
        TracksService,
        TrackUploadService,
        TrackStreamingService,
        { provide: PrismaService, useValue: prismaMock },
        { provide: getQueueToken('audio-processing'), useValue: queueMock },
        { provide: ConfigService, useValue: configMock },
        {
          provide: CacheService,
          useValue: {
            wrap: jest
              .fn()
              .mockImplementation((...args: unknown[]) => (args[3] as () => unknown)()),
            invalidate: jest.fn(),
          },
        },
        {
          provide: STORAGE_SERVICE,
          useValue: {
            getObjectStream: jest.fn(),
            exists: jest.fn(),
            getPresignedUrl: jest.fn(),
          },
        },
      ],
    }).compile()

    service = module.get(TracksService)
    uploadService = module.get(TrackUploadService)
    streamingService = module.get(TrackStreamingService)
  })

  afterAll(() => module?.close())

  beforeEach(() => {
    resetPrismaMock()
    queueMock.add.mockReset()
    configMock.getOrThrow.mockReturnValue({
      getTracksDir: (filename?: string) => (filename ? `/storage/${filename}` : '/storage'),
    })
  })

  it('should be defined via DI', () => {
    expect(service).toBeDefined()
    expect(uploadService).toBeDefined()
    expect(streamingService).toBeDefined()
  })

  it('findAll should return paginated data', async () => {
    const tracks = [buildTrack()]
    prismaMock.$transaction.mockResolvedValue([tracks, 1] as never)

    const result = await service.findAll({ page: 1, limit: 10 })

    expect(prismaMock.$transaction).toHaveBeenCalled()
    expect(result).toEqual({ data: tracks, total: 1, page: 1, limit: 10 })
  })

  it('findTrackById should return track from DB', async () => {
    const track = buildTrack()
    prismaMock.track.findFirst.mockResolvedValue(track as never)

    const result = await service.findTrackById('track-1')

    expect(result).toEqual(track)
  })

  it('getTrackStream should throw NotFoundException when track not found', async () => {
    prismaMock.track.findFirst.mockResolvedValue(null)

    await expect(streamingService.getTrackStream('nonexistent')).rejects.toThrow(NotFoundException)
  })

  it('create should call prisma in transaction and enqueue job', async () => {
    const track = buildTrack()
    const audioFile = buildAudioFile()
    // biome-ignore lint/suspicious/noExplicitAny: test mock callback
    prismaMock.$transaction.mockImplementation((fn: any) => {
      if (typeof fn === 'function') return fn(prismaMock)
    })
    prismaMock.track.create.mockResolvedValue(track as never)
    prismaMock.trackFile.create.mockResolvedValue({ id: 'tf-1' } as never)
    queueMock.add.mockResolvedValue({} as never)

    const result = await uploadService.create('artist-1', { title: 'Track' } as never, audioFile)

    expect(queueMock.add).toHaveBeenCalledWith(
      'convert-audio',
      expect.any(Object),
      expect.objectContaining({ attempts: 5 }),
    )
    expect(result).toEqual(track)
  })
})
