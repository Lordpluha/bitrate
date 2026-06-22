import { join } from 'node:path'
import { PrismaModule } from '@infra/prisma/prisma.module'
import { AlbumsModule } from '@modules/albums/albums.module'
import { ArtistsModule } from '@modules/artists/artists.module'
import { ArtistsAuthModule } from '@modules/artists-auth/artists-auth.module'
import { HistoryModule } from '@modules/history/history.module'
import { PlaylistsModule } from '@modules/playlists/playlists.module'
import { SearchModule } from '@modules/search/search.module'
import { TracksModule } from '@modules/tracks/tracks.module'
import { UsersModule } from '@modules/users/users.module'
import { UsersAuthModule } from '@modules/users-auth/users-auth.module'
import { BullModule } from '@nestjs/bullmq'
import { type MiddlewareConsumer, Module, type NestModule } from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { ServeStaticModule } from '@nestjs/serve-static'
import { ThrottlerModule } from '@nestjs/throttler'
import { SentryModule } from '@sentry/nestjs/setup'
import { envSchema } from '../env.schema'
import { AppController } from './app.controller'
import { PathTraversalMiddleware } from './common'
import { appConfigs } from './common/config'

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
    ThrottlerModule.forRoot([
      { name: 'auth', ttl: 60_000, limit: 10 },
      { name: 'default', ttl: 60_000, limit: 100 },
    ]),
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
    UsersAuthModule,
    ArtistsModule,
    UsersModule,
    TracksModule,
    PlaylistsModule,
    AlbumsModule,
    ArtistsAuthModule,
    SearchModule,
    HistoryModule,
  ],
  controllers: [AppController],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(PathTraversalMiddleware).forRoutes('*path')
  }
}
