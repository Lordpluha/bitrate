import { afterEach, beforeEach, describe, expect, it, jest } from '@jest/globals'
import { NestFactory } from '@nestjs/core'

/** Records the autorun flag as seen the moment the worker module graph is first loaded. */
const flagSeenWhenGraphLoaded: Array<string | undefined> = []

jest.mock('./worker.module', () => {
  flagSeenWhenGraphLoaded.push(process.env.AUDIO_PROCESSING_WORKER_ENABLED)
  return { WorkerModule: class WorkerModule {} }
})

jest.mock('@nestjs/core', () => ({
  NestFactory: { createApplicationContext: jest.fn() },
}))

import { assertWorkerStorageSupported, bootstrapWorker } from './bootstrap-worker'

describe('assertWorkerStorageSupported', () => {
  it('refuses a production worker on the local storage driver', () => {
    expect(() =>
      assertWorkerStorageSupported({ NODE_ENV: 'production', STORAGE_DRIVER: 'local' }),
    ).toThrow(/STORAGE_DRIVER=local/)
  })

  it('treats an unset driver as local, which is the schema default', () => {
    expect(() => assertWorkerStorageSupported({ NODE_ENV: 'production' })).toThrow(
      /shared filesystem/,
    )
  })

  it('accepts a production worker on s3', () => {
    expect(() =>
      assertWorkerStorageSupported({ NODE_ENV: 'production', STORAGE_DRIVER: 's3' }),
    ).not.toThrow()
  })

  it('allows the local driver outside production, so pnpm dev keeps working', () => {
    expect(() =>
      assertWorkerStorageSupported({ NODE_ENV: 'development', STORAGE_DRIVER: 'local' }),
    ).not.toThrow()
    expect(() => assertWorkerStorageSupported({})).not.toThrow()
  })
})

describe('bootstrapWorker', () => {
  const createContext = NestFactory.createApplicationContext as jest.Mock
  const enableShutdownHooks = jest.fn()
  const useLogger = jest.fn()
  const context = { enableShutdownHooks, useLogger, get: jest.fn() }
  const savedEnv = { ...process.env }

  beforeEach(() => {
    createContext.mockReset().mockResolvedValue(context as never)
    enableShutdownHooks.mockReset()
    useLogger.mockReset()
    flagSeenWhenGraphLoaded.length = 0
    jest.resetModules()
  })

  afterEach(() => {
    process.env = { ...savedEnv }
  })

  it('forces the autorun flag on before the module graph is loaded', async () => {
    process.env.AUDIO_PROCESSING_WORKER_ENABLED = 'false'
    process.env.NODE_ENV = 'test'

    await bootstrapWorker()

    expect(flagSeenWhenGraphLoaded).toEqual(['true'])
  })

  it('creates a standalone context and enables shutdown hooks so BullMQ drains on SIGTERM', async () => {
    process.env.NODE_ENV = 'test'

    const result = await bootstrapWorker()

    expect(createContext).toHaveBeenCalledTimes(1)
    expect(createContext).toHaveBeenCalledWith(expect.any(Function), { bufferLogs: true })
    expect(enableShutdownHooks).toHaveBeenCalledTimes(1)
    expect(result).toBe(context)
  })

  it('refuses to start in production on the local driver and never builds the context', async () => {
    process.env.NODE_ENV = 'production'
    process.env.STORAGE_DRIVER = 'local'

    await expect(bootstrapWorker()).rejects.toThrow(/STORAGE_DRIVER=local/)

    expect(createContext).not.toHaveBeenCalled()
    expect(flagSeenWhenGraphLoaded).toEqual([])
  })
})
