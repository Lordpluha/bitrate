import type { CacheService } from '@infra/cache/cache.service'
import type { StorageService } from '@infra/storage/storage.types'
import { jest } from '@jest/globals'
import type { ConfigService } from '@nestjs/config'
import type { Queue } from 'bullmq'
import type { PrismaMock } from './prisma.mock'

/** A cache that always misses, so `wrap` runs the wrapped loader on every call. */
export const makeCacheMock = () =>
  ({
    get: jest.fn().mockResolvedValue(null as never),
    set: jest.fn().mockResolvedValue(undefined as never),
    del: jest.fn().mockResolvedValue(undefined as never),
    invalidate: jest.fn().mockResolvedValue(undefined as never),
    wrap: jest.fn().mockImplementation((...args: unknown[]) => (args[3] as () => unknown)()),
  }) as unknown as CacheService

/** A BullMQ queue that accepts every job. */
export const makeQueueMock = () =>
  ({
    add: jest.fn(),
  }) as unknown as jest.Mocked<Queue>

/** A config exposing the storage path helpers the track services read. */
export const makeConfigMock = () =>
  ({
    getOrThrow: jest.fn().mockReturnValue({
      getTracksDir: (filename?: string) => (filename ? `/storage/${filename}` : '/storage'),
      getTracksCoversDir: (filename?: string) =>
        filename ? `/storage/covers/${filename}` : '/storage/covers',
    }),
  }) as unknown as jest.Mocked<ConfigService>

/** Object storage that serves a fixed 2 KB Ogg body for any key. */
export const makeStorageMock = () =>
  ({
    exists: jest.fn().mockResolvedValue(true as never),
    getObjectStream: jest.fn().mockResolvedValue({
      stream: { pipe: jest.fn() },
      contentLength: 2048,
      contentType: 'audio/ogg',
    } as never),
    getPresignedUrl: jest.fn(),
  }) as unknown as jest.Mocked<StorageService>

/** Makes `$transaction(fn)` run its callback against the same Prisma mock. */
export const mockTransaction = (prisma: PrismaMock) =>
  prisma.$transaction.mockImplementation((fn: unknown) => {
    if (typeof fn === 'function') return (fn as (p: typeof prisma) => unknown)(prisma)
  })
