import { PrismaService } from '@infra/prisma/prisma.service'
import {
  AUDIO_PROCESSING_DEAD_LETTER_QUEUE,
  AUDIO_PROCESSING_QUEUE,
} from '@infra/queues/audio-processing.queue'
import { afterAll, beforeAll, describe, expect, it, jest } from '@jest/globals'
import { getQueueToken } from '@nestjs/bullmq'
import type { TestingModule } from '@nestjs/testing'
import { Test } from '@nestjs/testing'
import { makeQueueMock, prismaMock } from '@test/mocks'
import { AppModule } from '../../app.module'

/**
 * `music-metadata` ships ESM-only `exports` (no `"require"` condition). Node 24 itself can
 * `require()` it directly, but ts-jest's resolver cannot, so the real `TrackUploadService` →
 * `track-media.ts` → `music-metadata` chain fails to load with "Cannot find module" the moment
 * anything pulls in the real `AppModule` graph unmocked — orthogonal to what this spec checks.
 * `{ virtual: true }` registers a mock for a module Jest cannot resolve at all.
 */
jest.mock('music-metadata', () => ({ parseFile: jest.fn() }), { virtual: true })

/**
 * Compiles the real `AppModule` DI graph so a broken provider fails in seconds instead of at
 * boot in production.
 *
 * `Test.createTestingModule({ imports: [AppModule] }).compile()` instantiates every eager
 * provider in the whole application, which is exactly what surfaces an unresolved dependency —
 * e.g. an injected class imported with `import type` (erased at compile time, so Nest has no
 * runtime reference to construct it from). It deliberately never calls `.init()`, so no
 * lifecycle hook (`onModuleInit`/`onApplicationBootstrap`) runs and nothing here opens a real
 * network connection on its own — see the provider overrides below for the one place that is
 * not naturally true.
 *
 * Providers overridden, and why each one is necessary despite `.compile()` never calling
 * `.init()`:
 * - `PrismaService` — replaced outright so its constructor (which builds a real `pg.Pool` and
 *   `PrismaClient`) never runs. Harmless either way (the pool is lazy and `$connect()` only
 *   happens in `onModuleInit`), but keeping the test independent of a reachable Postgres is
 *   cheap insurance.
 * - The two BullMQ queue tokens (`getQueueToken(...)`) — `@nestjs/bullmq`'s `registerQueue`
 *   provider is a `useFactory` that eagerly constructs a real BullMQ `Queue`, which opens an
 *   ioredis connection **at provider-instantiation time**, i.e. during `.compile()` itself, not
 *   `.init()`. This is the one genuinely network-touching step a bare `.compile()` cannot avoid
 *   on its own, so it is the one override this spec cannot skip.
 *
 * Nothing else needs an override: `CacheModule`'s `REDIS_CLIENT` is constructed with
 * `lazyConnect: true` (connects on first command, never during compile), `MailService` only
 * calls `nodemailer.createTransport(...)` (builds a transporter object, never connects), and
 * `StorageModule` binds the local-disk driver by default.
 */
describe('AppModule DI graph (boot smoke)', () => {
  let moduleRef: TestingModule | undefined

  beforeAll(() => {
    process.env.NODE_ENV = 'test'
    process.env.WEB_HOST = 'http://localhost:3000'
    process.env.JWT_SECRET = 'boot-smoke-test-secret'
    process.env.DATABASE_URL = 'postgresql://user:pass@127.0.0.1:1/unreachable'
    process.env.REDIS_HOST = '127.0.0.1'
    process.env.REDIS_PORT = '1'
    process.env.STORAGE_DRIVER = 'local'
  })

  afterAll(async () => {
    await moduleRef?.close()
  })

  it('resolves every provider in the application without touching the network', async () => {
    moduleRef = await Test.createTestingModule({ imports: [AppModule] })
      .overrideProvider(PrismaService)
      .useValue(prismaMock)
      .overrideProvider(getQueueToken(AUDIO_PROCESSING_QUEUE))
      .useValue(makeQueueMock())
      .overrideProvider(getQueueToken(AUDIO_PROCESSING_DEAD_LETTER_QUEUE))
      .useValue(makeQueueMock())
      .compile()

    expect(moduleRef).toBeDefined()
  })
})
