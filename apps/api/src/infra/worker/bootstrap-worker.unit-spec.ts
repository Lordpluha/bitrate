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

import { bootstrapWorker } from './bootstrap-worker'

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

  it('starts in production: object storage is the only backend, so no storage guard remains', async () => {
    process.env.NODE_ENV = 'production'

    await expect(bootstrapWorker()).resolves.toBe(context)

    expect(createContext).toHaveBeenCalledTimes(1)
  })
})
