import { Module } from '@nestjs/common'
import { AppController } from './app.controller'
import { AppService } from './app.service'
import { AuthModule } from './auth/auth.module'
import { UsersModule } from './users/users.module'
import { ConfigModule } from '@nestjs/config'
import { envSchema, envType } from '../env.schema'
import { PrismaModule } from './prisma/prisma.module'
import { TracksModule } from './tracks/tracks.module'
import { PlaylistsModule } from './playlists/playlists.module'
import { AlbumsService } from './albums/albums.service'
import { AlbumsController } from './albums/albums.controller'
import { AlbumsModule } from './albums/albums.module'

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.local', '.env.development', '.env.production'],

      validate: (env: Record<string, unknown>): envType => envSchema.parse(env)
    }),
    PrismaModule,
    AuthModule,
    UsersModule,
    TracksModule,
    PlaylistsModule,
    AlbumsModule
  ],
  controllers: [AppController, AlbumsController],
  providers: [AppService, AlbumsService]
})
export class AppModule {}
