import { timingSafeEqual } from 'node:crypto'
import type { AppConfig } from '@common/config'
import { CacheService } from '@infra/cache/cache.service'
import { MetricsService, PROMETHEUS_CONTENT_TYPE } from '@infra/observability/metrics.service'
import { PrismaService } from '@infra/prisma/prisma.service'
import { STORAGE_SERVICE } from '@infra/storage/storage.constants'
import type { StorageService } from '@infra/storage/storage.types'
import {
  Controller,
  Get,
  Header,
  Headers,
  Inject,
  Logger,
  NotFoundException,
  ServiceUnavailableException,
  UnauthorizedException,
} from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { ApiTags } from '@nestjs/swagger'
import { SkipThrottle } from '@nestjs/throttler'
import * as Sentry from '@sentry/nestjs'

/** Represents the app controller. */
@ApiTags('Welcome')
@Controller({ version: '1' })
export class AppController {
  private readonly logger = new Logger(AppController.name)

  constructor(
    private readonly prisma: PrismaService,
    private readonly cache: CacheService,
    private readonly metrics: MetricsService,
    @Inject(STORAGE_SERVICE) private readonly storage: StorageService,
    private readonly config: ConfigService<AppConfig>,
  ) {}

  /** Runs the get welcome operation. */
  @Get()
  getWelcome(): string {
    return `Welcome to ${process.env.npm_package_name}!`
  }

  /** Runs the get health operation. */
  @Get('health')
  @SkipThrottle()
  @Header('Cache-Control', 'no-store')
  getHealth() {
    return this.getReadiness()
  }

  /** Returns a dependency-free liveness signal. */
  @Get('health/live')
  @SkipThrottle()
  @Header('Cache-Control', 'no-store')
  getLiveness() {
    return { status: 'ok' as const }
  }

  /** Returns a bounded, topology-free dependency readiness signal. */
  @Get('health/ready')
  @SkipThrottle()
  @Header('Cache-Control', 'no-store')
  async getReadiness() {
    const checks = [
      ['postgres', () => this.prisma.ping()],
      ['redis', () => this.cache.ping()],
      ['storage', () => this.storage.healthCheck()],
    ] as const
    const results = await Promise.allSettled(
      checks.map(([name, check]) => this.runHealthCheck(name, check)),
    )
    const failed = results.flatMap((result, index) =>
      result.status === 'rejected' ? [checks[index]?.[0] ?? 'unknown'] : [],
    )

    if (failed.length > 0) {
      this.logger.error(`Readiness checks failed: ${failed.join(', ')}`)
      throw new ServiceUnavailableException({
        status: 'error',
        message: 'Service is not ready',
      })
    }

    return { status: 'ok' as const }
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
  @SkipThrottle()
  @Header('Content-Type', PROMETHEUS_CONTENT_TYPE)
  @Header('Cache-Control', 'no-store')
  getMetrics(@Headers('authorization') authorization?: string) {
    this.assertMetricsAccess(authorization)
    return this.metrics.render()
  }

  private async runHealthCheck(name: string, check: () => Promise<unknown>) {
    const timeoutMs = this.config.getOrThrow('HEALTH_CHECK_TIMEOUT_MS')
    let timeout: NodeJS.Timeout | undefined

    try {
      await Promise.race([
        Promise.resolve().then(check),
        new Promise<never>((_, reject) => {
          timeout = setTimeout(
            () => reject(new Error(`${name} readiness check timed out`)),
            timeoutMs,
          )
        }),
      ])
    } finally {
      if (timeout) clearTimeout(timeout)
    }
  }

  private assertMetricsAccess(authorization?: string) {
    const expected = this.config.get('METRICS_TOKEN')
    if (!expected) throw new NotFoundException()

    const supplied = authorization?.startsWith('Bearer ') ? authorization.slice(7) : ''
    const expectedBuffer = Buffer.from(expected)
    const suppliedBuffer = Buffer.from(supplied)
    const matches =
      expectedBuffer.length === suppliedBuffer.length &&
      timingSafeEqual(expectedBuffer, suppliedBuffer)

    if (!matches) throw new UnauthorizedException()
  }
}
