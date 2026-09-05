import { describe, expect, it, jest } from '@jest/globals'
import {
  NotFoundException,
  ServiceUnavailableException,
  UnauthorizedException,
} from '@nestjs/common'
import type { ConfigService } from '@nestjs/config'
import { AppController } from './app.controller'
import type { AppConfig } from './common/config'
import type { CacheService } from './infra/cache/cache.service'
import type { MetricsService } from './infra/observability/metrics.service'
import type { PrismaService } from './infra/prisma/prisma.service'
import type { StorageService } from './infra/storage/storage.types'

const METRICS_TOKEN = 'm'.repeat(32)

const makeController = (overrides?: {
  postgres?: () => Promise<unknown>
  redis?: () => Promise<unknown>
  storage?: () => Promise<unknown>
  timeoutMs?: number
  metricsToken?: string
}) => {
  const prisma = { ping: overrides?.postgres ?? jest.fn(async () => true) } as PrismaService
  const cache = { ping: overrides?.redis ?? jest.fn(async () => true) } as CacheService
  const storage = {
    healthCheck: overrides?.storage ?? jest.fn(async () => true),
  } as StorageService
  const metrics = { render: jest.fn(() => '# metrics\n') } as unknown as MetricsService
  const config = {
    getOrThrow: jest.fn(() => overrides?.timeoutMs ?? 50),
    get: jest.fn(() => overrides?.metricsToken),
  } as unknown as ConfigService<AppConfig>

  return { controller: new AppController(prisma, cache, metrics, storage, config), metrics }
}

describe('AppController health', () => {
  it('returns a generic liveness response without checking dependencies', () => {
    const postgres = jest.fn(async () => true)
    const { controller } = makeController({ postgres })

    expect(controller.getLiveness()).toEqual({ status: 'ok' })
    expect(postgres).not.toHaveBeenCalled()
  })

  it('returns a generic readiness response when all bounded checks pass', async () => {
    const { controller } = makeController()

    await expect(controller.getReadiness()).resolves.toEqual({ status: 'ok' })
  })

  it('times out a stuck dependency without exposing topology to the client', async () => {
    const { controller } = makeController({
      storage: () => new Promise(() => undefined),
      timeoutMs: 5,
    })
    const logger = Reflect.get(controller, 'logger') as { error: (message: string) => void }
    const logError = jest.spyOn(logger, 'error').mockImplementation(() => undefined)

    const result = controller.getReadiness()

    await expect(result).rejects.toBeInstanceOf(ServiceUnavailableException)
    await result.catch((error: ServiceUnavailableException) => {
      expect(error.getResponse()).toEqual({ status: 'error', message: 'Service is not ready' })
    })
    expect(logError).toHaveBeenCalledWith('Readiness checks failed: storage')
  })
})

describe('AppController metrics', () => {
  it('hides metrics when no scrape token is configured', () => {
    const { controller } = makeController()

    expect(() => controller.getMetrics()).toThrow(NotFoundException)
  })

  it('rejects an invalid scrape token', () => {
    const { controller } = makeController({ metricsToken: METRICS_TOKEN })

    expect(() => controller.getMetrics('Bearer wrong')).toThrow(UnauthorizedException)
  })

  it('renders metrics for the configured bearer token', () => {
    const { controller, metrics } = makeController({ metricsToken: METRICS_TOKEN })

    expect(controller.getMetrics(`Bearer ${METRICS_TOKEN}`)).toBe('# metrics\n')
    expect(metrics.render).toHaveBeenCalledTimes(1)
  })
})
