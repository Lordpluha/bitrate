import { join } from 'node:path'
import { REDIS_CLIENT } from '@infra/cache/cache.constants'
import { CacheModule } from '@infra/cache/cache.module'
import { AuditInterceptor } from '@infra/observability/audit.interceptor'
import { MetricsInterceptor } from '@infra/observability/metrics.interceptor'
import { MetricsService } from '@infra/observability/metrics.service'
import { RedisThrottlerStorage } from '@infra/observability/redis-throttler.storage'
import { PrismaModule } from '@infra/prisma/prisma.module'
import { StorageModule } from '@infra/storage/storage.module'
import { AlbumsModule } from '@modules/albums/albums.module'
import { ArtistsModule } from '@modules/artists/artists.module'
import { ArtistsAuthModule } from '@modules/artists-auth/artists-auth.module'
import { DiscoveryModule } from '@modules/discovery/discovery.module'
import { HistoryModule } from '@modules/history/history.module'
import { MeModule } from '@modules/me/me.module'
import { ModerationModule } from '@modules/moderation/moderation.module'
import { PlaylistsModule } from '@modules/playlists/playlists.module'
import { PodcastsModule } from '@modules/podcasts/podcasts.module'
import { SearchModule } from '@modules/search/search.module'
import { TracksModule } from '@modules/tracks/tracks.module'
import { UsersModule } from '@modules/users/users.module'
import { UsersAuthModule } from '@modules/users-auth/users-auth.module'
import { BullModule } from '@nestjs/bullmq'
import { type MiddlewareConsumer, Module, type NestModule } from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core'
import { ServeStaticModule } from '@nestjs/serve-static'
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler'
import { SentryModule } from '@sentry/nestjs/setup'
import type { Redis } from 'ioredis'
import { envSchema } from '../env.schema'
import { AppController } from './app.controller'
import { PathTraversalMiddleware, RequestIdMiddleware } from './common'
import { API_RATE_LIMITS, appConfigs } from './common/config'
import { HttpCacheInterceptor } from './common/interceptors/http-cache.interceptor'

@Module({
  imports: [
    SentryModule.forRoot(),
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env', '.env.local', '.env.production', '.env.development'],
      load: appConfigs,
      validate: (env) => envSchema.parse(env),
    }),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', '..', 'storage', 'public'),
      serveRoot: '/static',
      serveStaticOptions: {
        index: false,
        fallthrough: false,
        dotfiles: 'deny', // Deny access to hidden files (.env, .git, etc.)
        redirect: false,
        setHeaders: (res) => {
          // Prevent directory listing and sensitive file access
          res.setHeader('X-Content-Type-Options', 'nosniff')
          res.setHeader('X-Frame-Options', 'DENY')

          // Custom error handling for static files
          res.on('finish', () => {
            if (res.statusCode === 404) {
              res.statusMessage = 'Resource not found'
            }
          })
        },
      },
    }),
    ThrottlerModule.forRootAsync({
      imports: [CacheModule],
      inject: [REDIS_CLIENT],
      useFactory: (redis: Redis) => ({
        throttlers: API_RATE_LIMITS,
        storage: new RedisThrottlerStorage(redis),
      }),
    }),
    BullModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        connection: {
          host: config.getOrThrow('REDIS_HOST'),
          port: config.getOrThrow('REDIS_PORT'),
        },
      }),
    }),
    PrismaModule,
    CacheModule,
    StorageModule,
    UsersAuthModule,
    ArtistsModule,
    UsersModule,
    TracksModule,
    PlaylistsModule,
    AlbumsModule,
    ArtistsAuthModule,
    SearchModule,
    HistoryModule,
    DiscoveryModule,
    MeModule,
    PodcastsModule,
    ModerationModule,
  ],
  controllers: [AppController],
  providers: [
    MetricsService,
    { provide: APP_GUARD, useClass: ThrottlerGuard },
    { provide: APP_INTERCEPTOR, useClass: MetricsInterceptor },
    { provide: APP_INTERCEPTOR, useClass: HttpCacheInterceptor },
    { provide: APP_INTERCEPTOR, useClass: AuditInterceptor },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(RequestIdMiddleware, PathTraversalMiddleware).forRoutes('*path')
  }
}
