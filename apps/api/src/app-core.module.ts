import { REDIS_CLIENT } from '@infra/cache/cache.constants'
import { CacheModule } from '@infra/cache/cache.module'
import { AuditInterceptor } from '@infra/observability/audit.interceptor'
import { loggerOptions } from '@infra/observability/logger.config'
import { MetricsInterceptor } from '@infra/observability/metrics.interceptor'
import { ObservabilityModule } from '@infra/observability/observability.module'
import { RedisThrottlerStorage } from '@infra/observability/redis-throttler.storage'
import { PrismaModule } from '@infra/prisma/prisma.module'
import { bullRootAsyncOptions } from '@infra/queues/bull-root.options'
import { StorageCoreModule } from '@infra/storage/storage-core.module'
import { BullModule } from '@nestjs/bullmq'
import { type MiddlewareConsumer, Module, type NestModule } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core'
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler'
import { SentryModule } from '@sentry/nestjs/setup'
import type { Redis } from 'ioredis'
import { I18nModule } from 'nestjs-i18n'
import { LoggerModule } from 'nestjs-pino'
import { AppController } from './app.controller'
import { PathTraversalMiddleware, RequestIdMiddleware } from './common'
import { API_RATE_LIMITS } from './common/config'
import { appConfigModuleOptions } from './common/config/config-module.options'
import { HttpExceptionFilter } from './common/filters/http-exception.filter'
import { HttpCacheInterceptor } from './common/interceptors/http-cache.interceptor'
import { i18nOptions } from './i18n/i18n.config'

/**
 * Root wiring every HTTP process shares — configuration, logging, i18n, Sentry, throttling, the
 * Redis connection for BullMQ, the database, the cache, metrics, the health/metrics controller and
 * the global guard, interceptors, filter and middleware. `AppModule` (listeners and artists) and
 * `AdminAppModule` (operators) each add their own routes on top (#458).
 */
@Module({
  imports: [
    ObservabilityModule,
    SentryModule.forRoot(),
    LoggerModule.forRoot(loggerOptions),
    I18nModule.forRoot(i18nOptions),
    ConfigModule.forRoot(appConfigModuleOptions),
    ThrottlerModule.forRootAsync({
      imports: [CacheModule],
      inject: [REDIS_CLIENT],
      useFactory: (redis: Redis) => ({
        throttlers: API_RATE_LIMITS,
        storage: new RedisThrottlerStorage(redis),
      }),
    }),
    BullModule.forRootAsync(bullRootAsyncOptions),
    PrismaModule,
    CacheModule,
    StorageCoreModule,
  ],
  controllers: [AppController],
  providers: [
    { provide: APP_GUARD, useClass: ThrottlerGuard },
    { provide: APP_INTERCEPTOR, useClass: MetricsInterceptor },
    { provide: APP_INTERCEPTOR, useClass: HttpCacheInterceptor },
    { provide: APP_INTERCEPTOR, useClass: AuditInterceptor },
    { provide: APP_FILTER, useClass: HttpExceptionFilter },
  ],
})
export class AppCoreModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(RequestIdMiddleware, PathTraversalMiddleware).forRoutes('*path')
  }
}
