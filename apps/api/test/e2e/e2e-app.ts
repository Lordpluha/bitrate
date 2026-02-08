import { appConfigs } from '@common/config'
import { PrismaService } from '@infra/prisma/prisma.service'
import { AlbumsModule } from '@modules/albums/albums.module'
import { ArtistsModule } from '@modules/artists/artists.module'
import { ArtistsAuthModule } from '@modules/artists-auth/artists-auth.module'
import { UsersModule } from '@modules/users/users.module'
import { UsersAuthModule } from '@modules/users-auth/users-auth.module'
import { INestApplication, Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { Test, TestingModule } from '@nestjs/testing'
import * as cookieParser from 'cookie-parser'
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
    UsersAuthModule,
    UsersModule,
    ArtistsModule,
    AlbumsModule,
    ArtistsAuthModule,
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
