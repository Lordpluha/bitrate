import { readdir, rm, stat } from 'node:fs/promises'
import { convertAudio, convertAudioToCmaf, convertAudioToHls } from '@bitrate/converter'
import { PrismaService } from '@infra/prisma/prisma.service'
import { STORAGE_SERVICE } from '@infra/storage/storage.constants'
import { beforeEach, describe, expect, it, jest } from '@jest/globals'
import { type PrismaMock, prismaMock, resetPrismaMock } from '@test/mocks'
import { buildJob, cmafResult, jobData } from './__tests__/fixtures/audio-processing.fixtures'
import { AudioProcessingConsumer } from './audio-processing.consumer'

jest.mock('@bitrate/converter', () => ({
  convertAudio: jest.fn().mockResolvedValue(undefined as never),
  convertAudioToHls: jest.fn().mockResolvedValue(undefined as never),
  convertAudioToCmaf: jest.fn(),
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
const convertAudioToCmafMock = convertAudioToCmaf as jest.MockedFunction<typeof convertAudioToCmaf>

const readdirMock = readdir as jest.MockedFunction<typeof readdir>
const rmMock = rm as jest.MockedFunction<typeof rm>
const statMock = stat as jest.MockedFunction<typeof stat>

describe('AudioProcessingConsumer', () => {
  it('should expose runtime constructor metadata for Nest dependency injection', () => {
    // The StorageService param is an interface, so it erases to Object at runtime —
    // the actual injection token is asserted separately via self:paramtypes below.
    expect(Reflect.getMetadata('design:paramtypes', AudioProcessingConsumer)).toEqual([
      PrismaService,
      Object,
      Function,
    ])
    expect(Reflect.getMetadata('self:paramtypes', AudioProcessingConsumer)).toEqual(
      expect.arrayContaining([expect.objectContaining({ index: 1, param: STORAGE_SERVICE })]),
    )
  })

  let consumer: AudioProcessingConsumer
  let prisma: PrismaMock
  const storage = {
    upload: jest.fn().mockResolvedValue('key' as never),
    deletePrefix: jest.fn().mockResolvedValue(undefined as never),
  }
  const deadLetterQueue = {
    add: jest.fn().mockResolvedValue(undefined as never),
  }

  beforeEach(() => {
    jest.clearAllMocks()
    resetPrismaMock()
    prisma = prismaMock
    consumer = new AudioProcessingConsumer(prisma, storage as never, deadLetterQueue as never)
    prisma.track.findUnique.mockResolvedValue({ id: 'track-1', audioUrl: 'track.mp3' } as never)
    prisma.track.update.mockResolvedValue({ id: 'track-1' } as never)
    prisma.track.updateMany.mockResolvedValue({ count: 1 } as never)
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
    convertAudioToCmafMock.mockResolvedValue(cmafResult as never)
  })

  it('returns early when job name is not convert-audio', async () => {
    await consumer.process(buildJob('other-job'))

    expect(prisma.track.findUnique).not.toHaveBeenCalled()
  })

  it('skips a stale job when the track points to a newer upload', async () => {
    prisma.track.findUnique.mockResolvedValue({ id: 'track-1', audioUrl: 'new.mp3' } as never)

    await consumer.process(buildJob('convert-audio', jobData))

    expect(convertAudioMock).not.toHaveBeenCalled()
    expect(prisma.track.updateMany).not.toHaveBeenCalled()
  })

  it('prepares every variant, publishes it, and marks the track ready atomically', async () => {
    const job = buildJob('convert-audio', jobData)

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
      expect.stringMatching(/^tracks\/track-1\/generations\/[a-f0-9]{16}\/hls\/master\.m3u8$/),
      expect.anything(),
      'application/vnd.apple.mpegurl',
    )
    expect(prisma.trackFile.upsert).toHaveBeenCalledTimes(4)
    expect(prisma.track.updateMany).toHaveBeenCalledWith(
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

  it('encodes CMAF renditions once and stores their byte index', async () => {
    await consumer.process(buildJob('convert-audio', jobData))

    expect(convertAudioToCmafMock).toHaveBeenCalledTimes(1)
    expect(convertAudioToCmafMock).toHaveBeenCalledWith(
      expect.objectContaining({ bitrates: [128, 192] }),
    )

    const cmafUpsert = prisma.trackFile.upsert.mock.calls.find(
      ([call]) => (call as { create?: { format?: string } }).create?.format === 'cmaf',
    )

    expect(cmafUpsert?.[0]).toMatchObject({
      create: expect.objectContaining({
        format: 'cmaf',
        codec: 'mp4a.40.2',
        initRangeStart: 0,
        initRangeEnd: 707,
        url: expect.stringMatching(/^tracks\/track-1\/generations\/[a-f0-9]{16}\/cmaf\/128\.m4a$/),
        fragments: [
          [0, 195_584, 929, 66_238],
          [195_584, 196_608, 67_167, 66_419],
        ],
      }),
    })
  })

  it('marks the track as playbackVersion 2 with its fragment timescale', async () => {
    await consumer.process(buildJob('convert-audio', jobData))

    expect(prisma.track.updateMany).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          playbackVersion: 2,
          fragmentTimescale: 48_000,
          durationTicks: 2_880_000,
        }),
      }),
    )
  })

  it('never marks a track ready when renditions are not spliceable', async () => {
    convertAudioToCmafMock.mockRejectedValueOnce(
      new Error('Rendition 192 fragment 3 is 195584:196607, expected 195584:196608') as never,
    )
    const job = buildJob('convert-audio', jobData)

    await expect(consumer.process(job)).rejects.toThrow(/fragment 3/)

    expect(prisma.track.updateMany).not.toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ processingStatus: 'READY' }),
      }),
    )
  })

  it('records the attempt error, cleans temporary files, and rethrows for BullMQ retry', async () => {
    convertAudioMock.mockRejectedValueOnce(new Error('ffmpeg crashed') as never)
    const job = buildJob('convert-audio', jobData)

    await expect(consumer.process(job)).rejects.toThrow('ffmpeg crashed')

    expect(prisma.track.updateMany).toHaveBeenCalledWith({
      where: { id: 'track-1', audioUrl: 'track.mp3' },
      data: { processingError: 'ffmpeg crashed' },
    })
    expect(deadLetterQueue.add).not.toHaveBeenCalled()
    expect(rmMock).toHaveBeenLastCalledWith(
      expect.stringContaining('/storage/.processing/track-1-job-1-1'),
      { recursive: true, force: true },
    )
  })

  it('removes uploaded immutable objects when a newer source wins before publish', async () => {
    prisma.track.findUnique
      .mockResolvedValueOnce({ id: 'track-1', audioUrl: 'track.mp3' } as never)
      .mockResolvedValueOnce({ id: 'track-1', audioUrl: 'track.mp3' } as never)
      .mockResolvedValueOnce({ id: 'track-1', audioUrl: 'new.mp3' } as never)

    await consumer.process(buildJob('convert-audio', jobData))

    expect(storage.deletePrefix).toHaveBeenCalledWith(
      expect.stringMatching(/^tracks\/track-1\/generations\/[a-f0-9]{16}$/),
    )
    expect(prisma.trackFile.upsert).not.toHaveBeenCalled()
    expect(prisma.track.updateMany).not.toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ processingStatus: 'READY' }) }),
    )
  })

  it('uses a conditional publish so a source changed during the transaction cannot become ready', async () => {
    prisma.track.updateMany
      .mockResolvedValueOnce({ count: 1 } as never)
      .mockResolvedValueOnce({ count: 0 } as never)

    await consumer.process(buildJob('convert-audio', jobData))

    expect(storage.deletePrefix).toHaveBeenCalledWith(
      expect.stringMatching(/^tracks\/track-1\/generations\/[a-f0-9]{16}$/),
    )
    expect(deadLetterQueue.add).not.toHaveBeenCalled()
  })

  it('marks the current upload failed after all attempts are exhausted', async () => {
    const job = buildJob('convert-audio', jobData, {
      attemptsMade: 5,
      opts: { attempts: 5 },
    })

    await consumer.onFailed(job as never, new Error('permanent failure'))

    expect(prisma.track.updateMany).toHaveBeenCalledWith({
      where: { id: 'track-1', audioUrl: 'track.mp3' },
      data: expect.objectContaining({
        processingStatus: 'FAILED',
        processingError: 'permanent failure',
      }),
    })
    expect(deadLetterQueue.add).toHaveBeenCalledWith(
      'convert-audio-failed',
      jobData,
      expect.objectContaining({ jobId: 'failed-job-1-5' }),
    )
    expect(storage.deletePrefix).toHaveBeenCalledWith(
      expect.stringMatching(/^tracks\/track-1\/generations\/[a-f0-9]{16}$/),
    )
  })

  it('does not mark a newer upload failed when an old job exhausts retries', async () => {
    prisma.track.updateMany.mockResolvedValue({ count: 0 } as never)
    const job = buildJob('convert-audio', jobData, {
      attemptsMade: 5,
      opts: { attempts: 5 },
    })

    await consumer.onFailed(job as never, new Error('old upload failed'))

    expect(deadLetterQueue.add).not.toHaveBeenCalled()
    expect(storage.deletePrefix).not.toHaveBeenCalled()
  })
})
