import { readdir, rm, stat } from 'node:fs/promises'
import { PrismaService } from '@infra/prisma/prisma.service'
import { STORAGE_SERVICE } from '@infra/storage/storage.constants'
import { beforeEach, describe, expect, it, jest } from '@jest/globals'
import { convertAudio, convertAudioToHls } from '@spotify/converter'
import { type PrismaMock, prismaMock, resetPrismaMock } from '@test/mocks'
import type { Job } from 'bullmq'
import { AudioProcessingConsumer } from './audio-processing.consumer'

jest.mock('@spotify/converter', () => ({
  convertAudio: jest.fn().mockResolvedValue(undefined as never),
  convertAudioToHls: jest.fn().mockResolvedValue(undefined as never),
}))

jest.mock('node:fs', () => ({
  createReadStream: jest.fn().mockReturnValue({ pipe: jest.fn() }),
}))

jest.mock('node:fs/promises', () => ({
  access: jest.fn().mockResolvedValue(undefined as never),
  mkdir: jest.fn().mockResolvedValue(undefined as never),
  readdir: jest.fn().mockResolvedValue(['index.m3u8', 'init_0.mp4', 'segment_00000.m4s'] as never),
  rename: jest.fn().mockResolvedValue(undefined as never),
  rm: jest.fn().mockResolvedValue(undefined as never),
  stat: jest.fn().mockResolvedValue({ size: 2048 } as never),
}))

const convertAudioMock = convertAudio as jest.MockedFunction<typeof convertAudio>
const convertAudioToHlsMock = convertAudioToHls as jest.MockedFunction<typeof convertAudioToHls>
const readdirMock = readdir as jest.MockedFunction<typeof readdir>
const rmMock = rm as jest.MockedFunction<typeof rm>
const statMock = stat as jest.MockedFunction<typeof stat>

const makeJob = (
  name: string,
  data: Record<string, unknown> = {},
  overrides: Partial<Job> = {},
): Job =>
  ({
    id: 'job-1',
    name,
    data,
    attemptsMade: 0,
    opts: { attempts: 5 },
    updateProgress: jest.fn().mockResolvedValue(undefined as never),
    ...overrides,
  }) as Job

const jobData = {
  trackId: 'track-1',
  artistId: 'artist-1',
  sourceFileName: 'track.mp3',
  inputPath: '/storage/track.mp3',
  outputDir: '/storage',
  format: 'opus',
  bitrates: ['128k', '192k'],
}

describe('AudioProcessingConsumer', () => {
  it('should expose runtime constructor metadata for Nest dependency injection', () => {
    // The StorageService param is an interface, so it erases to Object at runtime —
    // the actual injection token is asserted separately via self:paramtypes below.
    expect(Reflect.getMetadata('design:paramtypes', AudioProcessingConsumer)).toEqual([
      PrismaService,
      Object,
    ])
    expect(Reflect.getMetadata('self:paramtypes', AudioProcessingConsumer)).toEqual(
      expect.arrayContaining([expect.objectContaining({ index: 1, param: STORAGE_SERVICE })]),
    )
  })

  let consumer: AudioProcessingConsumer
  let prisma: PrismaMock
  const storage = {
    upload: jest.fn().mockResolvedValue('key' as never),
  }

  beforeEach(() => {
    jest.clearAllMocks()
    resetPrismaMock()
    prisma = prismaMock
    consumer = new AudioProcessingConsumer(prisma, storage as never)
    prisma.track.findUnique.mockResolvedValue({ id: 'track-1', audioUrl: 'track.mp3' } as never)
    prisma.track.update.mockResolvedValue({ id: 'track-1' } as never)
    prisma.trackFile.upsert.mockResolvedValue({ id: 'tf-1' } as never)
    prisma.$transaction.mockImplementation(async (callback: unknown) => {
      if (typeof callback === 'function') {
        return await (callback as (tx: PrismaMock) => Promise<unknown>)(prisma)
      }
      return []
    })
    readdirMock.mockImplementation(((_path: never, options?: { withFileTypes?: boolean }) => {
      if (options?.withFileTypes) {
        return Promise.resolve([{ name: 'master.m3u8', isDirectory: () => false }]) as never
      }
      return Promise.resolve(['index.m3u8', 'init_0.mp4', 'segment_00000.m4s']) as never
    }) as never)
    statMock.mockResolvedValue({ size: 2048 } as never)
    convertAudioMock.mockResolvedValue(undefined as never)
    convertAudioToHlsMock.mockResolvedValue(undefined as never)
  })

  it('returns early when job name is not convert-audio', async () => {
    await consumer.process(makeJob('other-job'))

    expect(prisma.track.findUnique).not.toHaveBeenCalled()
  })

  it('skips a stale job when the track points to a newer upload', async () => {
    prisma.track.findUnique.mockResolvedValue({ id: 'track-1', audioUrl: 'new.mp3' } as never)

    await consumer.process(makeJob('convert-audio', jobData))

    expect(convertAudioMock).not.toHaveBeenCalled()
    expect(prisma.track.update).not.toHaveBeenCalled()
  })

  it('prepares every variant, publishes it, and marks the track ready atomically', async () => {
    const job = makeJob('convert-audio', jobData)

    await consumer.process(job)

    expect(convertAudioMock).toHaveBeenCalledTimes(2)
    expect(convertAudioToHlsMock).toHaveBeenCalledTimes(1)
    expect(convertAudioToHlsMock).toHaveBeenCalledWith(
      expect.objectContaining({
        bitrates: ['128k', '192k'],
        segmentDuration: 4,
      }),
    )
    expect(storage.upload).toHaveBeenLastCalledWith(
      'tracks/track-1/hls/master.m3u8',
      expect.anything(),
      'application/vnd.apple.mpegurl',
    )
    expect(prisma.trackFile.upsert).toHaveBeenCalledTimes(2)
    expect(prisma.track.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ processingStatus: 'READY' }),
      }),
    )
    expect(job.updateProgress).toHaveBeenLastCalledWith(100)
    expect(rmMock).toHaveBeenCalledWith(
      expect.stringContaining('/storage/.processing/track-1-job-1-1'),
      { recursive: true, force: true },
    )
  })

  it('records the attempt error, cleans temporary files, and rethrows for BullMQ retry', async () => {
    convertAudioMock.mockRejectedValueOnce(new Error('ffmpeg crashed') as never)
    const job = makeJob('convert-audio', jobData)

    await expect(consumer.process(job)).rejects.toThrow('ffmpeg crashed')

    expect(prisma.track.update).toHaveBeenCalledWith({
      where: { id: 'track-1' },
      data: { processingError: 'ffmpeg crashed' },
    })
    expect(rmMock).toHaveBeenLastCalledWith(
      expect.stringContaining('/storage/.processing/track-1-job-1-1'),
      { recursive: true, force: true },
    )
  })

  it('marks the current upload failed after all attempts are exhausted', async () => {
    const job = makeJob('convert-audio', jobData, {
      attemptsMade: 5,
      opts: { attempts: 5 },
    })

    await consumer.onFailed(job as never, new Error('permanent failure'))

    expect(prisma.track.update).toHaveBeenCalledWith({
      where: { id: 'track-1' },
      data: expect.objectContaining({
        processingStatus: 'FAILED',
        processingError: 'permanent failure',
      }),
    })
  })

  it('does not mark a newer upload failed when an old job exhausts retries', async () => {
    prisma.track.findUnique.mockResolvedValue({ id: 'track-1', audioUrl: 'new.mp3' } as never)
    const job = makeJob('convert-audio', jobData, {
      attemptsMade: 5,
      opts: { attempts: 5 },
    })

    await consumer.onFailed(job as never, new Error('old upload failed'))

    expect(prisma.track.update).not.toHaveBeenCalled()
  })
})
