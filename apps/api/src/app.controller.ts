import { CacheService } from '@infra/cache/cache.service'
import { MetricsService } from '@infra/observability/metrics.service'
import { PrismaService } from '@infra/prisma/prisma.service'
import { STORAGE_SERVICE } from '@infra/storage/storage.constants'
import type { StorageService } from '@infra/storage/storage.types'
import {
  Controller,
  Get,
  Inject,
  NotFoundException,
  ServiceUnavailableException,
} from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'
import * as Sentry from '@sentry/nestjs'

/** Represents the app controller. */
@ApiTags('Welcome')
@Controller({ version: '1' })
export class AppController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly cache: CacheService,
    private readonly metrics: MetricsService,
    @Inject(STORAGE_SERVICE) private readonly storage: StorageService,
  ) {}

  /** Runs the get welcome operation. */
  @Get()
  getWelcome(): string {
    return `Welcome to ${process.env.npm_package_name}!`
  }

  /** Runs the get health operation. */
  @Get('health')
  async getHealth() {
    const checks = await Promise.allSettled([
      this.prisma.ping(),
      this.cache.ping(),
      this.storage.healthCheck(),
    ])
    const dependencies = {
      postgres: checks[0].status === 'fulfilled',
      redis: checks[1].status === 'fulfilled',
      storage: checks[2].status === 'fulfilled',
    }
    if (Object.values(dependencies).some((ready) => !ready)) {
      throw new ServiceUnavailableException({ status: 'error', dependencies })
    }
    return {
      status: 'ok',
      dependencies,
      service: process.env.npm_package_name ?? 'api',
      version: process.env.npm_package_version ?? 'unknown',
      env: process.env.NODE_ENV ?? 'development',
      timestamp: new Date().toISOString(),
      uptimeSeconds: Math.round(process.uptime()),
    }
  }

  /** Runs the get error operation. */
  @Get('/debug-sentry')
  getError() {
    if (process.env.NODE_ENV === 'production') throw new NotFoundException()
    // Send a log before throwing the error
    Sentry.logger.info('User triggered test error', {
      action: 'test_error_endpoint',
    })
    // Send a test metric before throwing the error
    Sentry.metrics.count('test_counter', 1)
    throw new Error('My first Sentry error!')
  }

  /** Returns Prometheus-compatible process metrics. */
  @Get('metrics')
  getMetrics() {
    return this.metrics.render()
  }
}
