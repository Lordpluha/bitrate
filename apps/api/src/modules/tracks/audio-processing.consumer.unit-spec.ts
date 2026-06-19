import { beforeEach, describe, expect, it, jest } from '@jest/globals'
import { type PrismaMock, prismaMock, resetPrismaMock } from '@test/mocks'
import type { Job } from 'bullmq'
import { AudioProcessingConsumer } from './audio-processing.consumer'

jest.mock('@spotify/converter', () => ({
  convertAudio: jest.fn().mockResolvedValue(undefined as never),
}))

jest.mock('fs/promises', () => ({
  mkdir: jest.fn().mockResolvedValue(undefined as never),
  stat: jest.fn().mockResolvedValue({ size: 2048 } as never),
}))

const makeJob = (name: string, data: Record<string, unknown> = {}): Job => ({ name, data }) as Job

describe('AudioProcessingConsumer', () => {
  let consumer: AudioProcessingConsumer
  let prisma: PrismaMock

  beforeEach(() => {
    resetPrismaMock()
    prisma = prismaMock
    consumer = new AudioProcessingConsumer(prisma)
  })

  it('should return early when job name is not convert-audio', async () => {
    const job = makeJob('other-job')

    await consumer.process(job)

    expect(prisma.trackFile.create).not.toHaveBeenCalled()
  })

  it('should process convert-audio job and create track files for each bitrate', async () => {
    prisma.trackFile.create.mockResolvedValue({ id: 'tf-1' } as never)

    const job = makeJob('convert-audio', {
      trackId: 'track-1',
      artistId: 'artist-1',
      inputPath: '/storage/track.mp3',
      outputDir: '/storage',
      format: 'opus',
      bitrates: ['128k', '192k'],
    })

    await consumer.process(job)

    expect(prisma.trackFile.create).toHaveBeenCalledTimes(2)
    expect(prisma.trackFile.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ trackId: 'track-1', format: 'opus' }),
      }),
    )
  })
})
