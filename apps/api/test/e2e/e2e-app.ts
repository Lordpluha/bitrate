import { appConfigs } from '@common/config'
import { CacheModule } from '@infra/cache/cache.module'
import { MetricsService } from '@infra/observability/metrics.service'
import { PrismaService } from '@infra/prisma/prisma.service'
import { StorageModule } from '@infra/storage/storage.module'
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
import { type INestApplication, Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { Test, type TestingModule } from '@nestjs/testing'
import cookieParser from 'cookie-parser'
import { envSchema } from '../../env.schema'
import { AppController } from '../../src/app.controller'

/** Represents the e2e test module. */
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env.test',
      load: appConfigs,
      validate: (env) => envSchema.parse(env),
    }),
    BullModule.forRoot({
      connection: {
        host: process.env.REDIS_HOST ?? 'localhost',
        port: Number(process.env.REDIS_PORT ?? 6379),
      },
    }),
    UsersAuthModule,
    UsersModule,
    ArtistsModule,
    AlbumsModule,
    ArtistsAuthModule,
    PlaylistsModule,
    TracksModule,
    SearchModule,
    HistoryModule,
    CacheModule,
    StorageModule,
  ],
  controllers: [AppController],
  providers: [MetricsService],
})
class E2eTestModule {}

/** The create e2e app value. */
export const createE2eApp = async () => {
  const moduleFixture: TestingModule = await Test.createTestingModule({
    imports: [E2eTestModule],
  }).compile()

  const app = moduleFixture.createNestApplication()
  app.use(cookieParser())
  await app.init()

  const prisma = app.get(PrismaService)

  return { app, prisma }
}

/** The close e2e app value. */
export const closeE2eApp = async (app?: INestApplication) => {
  if (!app) return
  await app.close()
}

/** Returns the response cookies after validating the header value. */
export const getResponseCookies = (value: unknown): string[] => {
  if (typeof value === 'string') return [value]
  if (Array.isArray(value) && value.every((cookie) => typeof cookie === 'string')) return value

  throw new Error('Response did not include valid set-cookie headers')
}
