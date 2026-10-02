import { mkdir, mkdtemp, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { PrismaService } from '@infra/prisma/prisma.service'
import { AUDIO_PROCESSING_QUEUE } from '@infra/queues/audio-processing.queue'
import { STORAGE_SERVICE } from '@infra/storage/storage.constants'
import type { StorageService } from '@infra/storage/storage.types'
import { afterAll, beforeAll, describe, expect, it, jest } from '@jest/globals'
import { runConversionPhases } from '@modules/tracks/audio-processing.phases'
import { getJobScratchBase } from '@modules/tracks/audio-scratch'
import { getQueueToken } from '@nestjs/bullmq'
import type { INestApplicationContext } from '@nestjs/common'
import type { Queue } from 'bullmq'
import { bootstrapWorker } from './bootstrap-worker'

/**
 * The conversion phases are the one seam stubbed here: they need FFmpeg and a real encode, which
 * is not what this spec is about. Everything around them — the Bull connection, the consumer, the
 * recorder, Prisma and storage — is real.
 */
jest.mock('@modules/tracks/audio-processing.phases', () => ({
  runConversionPhases: jest.fn(),
}))

/** Waits until `check` returns a value, or fails with `label` after `timeoutMs`. */
async function eventually<T>(
  label: string,
  check: () => Promise<T | undefined>,
  timeoutMs = 20_000,
) {
  const deadline = Date.now() + timeoutMs
  while (Date.now() < deadline) {
    const value = await check()
    if (value !== undefined) return value
    await new Promise((resolve) => setTimeout(resolve, 100))
  }
  throw new Error(`Timed out waiting for ${label}`)
}

/**
 * Boots the real standalone worker context against real Redis and PostgreSQL (the CI services;
 * see apps/api/test/jest-int.json) and proves it consumes a queued job with no HTTP listener.
 */
describe('transcode worker (int)', () => {
  const savedEnv = { ...process.env }
  const phases = runConversionPhases as jest.MockedFunction<typeof runConversionPhases>
  let context: INestApplicationContext
  let prisma: PrismaService
  let storage: StorageService
  let queue: Queue
  let scratchRoot: string
  const masterKey = `masters/worker-int-${Date.now()}.mp3`
  const sourceFileName = 'worker-int.mp3'
  let artistId: string
  let trackId: string

  beforeAll(async () => {
    scratchRoot = await mkdtemp(join(tmpdir(), 'worker-int-'))
    /**
     * The consumer's orphan cleanup tolerates a missing scratch base by testing
     * `error instanceof Error`, which is false for an fs error under Jest's vm context. Creating
     * the base up front sidesteps that Jest-only quirk; a real process is unaffected.
     */
    await mkdir(getJobScratchBase({ AUDIO_SCRATCH_ROOT: scratchRoot }), { mode: 0o700 })
    Object.assign(process.env, {
      NODE_ENV: 'test',
      STORAGE_DRIVER: 'local',
      WEB_HOST: 'http://localhost:3000',
      JWT_SECRET: 'worker-int-test-secret',
      AUDIO_SCRATCH_ROOT: scratchRoot,
      // The API runs with the consumer disabled; the worker must override that itself.
      AUDIO_PROCESSING_WORKER_ENABLED: 'false',
    })
    process.env.DATABASE_URL ??= 'postgresql://test:test@localhost:5432/test'
    process.env.REDIS_HOST ??= 'localhost'
    process.env.REDIS_PORT ??= '6379'

    phases.mockResolvedValue('PUBLISHED')

    context = await bootstrapWorker()
    prisma = context.get(PrismaService)
    storage = context.get<StorageService>(STORAGE_SERVICE)
    queue = context.get<Queue>(getQueueToken(AUDIO_PROCESSING_QUEUE))

    const artist = await prisma.artist.create({
      data: {
        username: `worker-int-${Date.now()}`,
        email: `worker-int-${Date.now()}@example.test`,
      },
    })
    artistId = artist.id
    const track = await prisma.track.create({
      data: { title: 'Worker int', audioUrl: sourceFileName, artistId },
    })
    trackId = track.id
    await storage.upload(masterKey, Buffer.from('not real audio'), 'audio/mpeg')
  })

  afterAll(async () => {
    await queue?.drain()
    await storage?.deleteObject(masterKey)
    await prisma?.trackProcessingAttempt.deleteMany({ where: { trackId } })
    await prisma?.track.deleteMany({ where: { id: trackId } })
    await prisma?.artist.deleteMany({ where: { id: artistId } })
    await context?.close()
    await rm(scratchRoot, { recursive: true, force: true })
    process.env = { ...savedEnv }
  })

  it('boots with no HTTP listener', () => {
    expect((context as { getHttpServer?: unknown }).getHttpServer).toBeUndefined()
    expect(process.getActiveResourcesInfo()).not.toContain('TCPServerWrap')
  })

  it('consumes an enqueued job even though autorun was configured off', async () => {
    const job = await queue.add(
      'convert-audio',
      {
        trackId,
        artistId,
        sourceFileName,
        masterKey,
        format: 'opus',
        bitrates: ['128k'],
      },
      { attempts: 1 },
    )

    await eventually('the job to complete', async () =>
      (await job.isCompleted()) ? true : undefined,
    )

    expect(phases).toHaveBeenCalledTimes(1)
    expect(phases.mock.calls[0]?.[1]).toMatchObject({ trackId, sourceFileName })
    const attempt = await prisma.trackProcessingAttempt.findFirst({ where: { trackId } })
    expect(attempt?.status).toBe('SUCCEEDED')
  })
})
