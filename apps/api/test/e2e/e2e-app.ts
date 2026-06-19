import { appConfigs } from '@common/config'
import { PrismaService } from '@infra/prisma/prisma.service'
import { AlbumsModule } from '@modules/albums/albums.module'
import { ArtistsModule } from '@modules/artists/artists.module'
import { ArtistsAuthModule } from '@modules/artists-auth/artists-auth.module'
import { PlaylistsModule } from '@modules/playlists/playlists.module'
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
  ],
  controllers: [AppController],
})
class E2eTestModule {}

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

export const closeE2eApp = async (app?: INestApplication) => {
  if (!app) return
  await app.close()
}
