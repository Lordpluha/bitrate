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
import { ArtistsModule } from './artists/artists.module'
import { ArtistsController } from './artists/artists.controller'
import { TracksController } from './tracks/tracks.controller'
import { PlaylistsController } from './playlists/playlists.controller'
import { AuthController } from './auth/auth.controller'
import { PlaylistsService } from './playlists/playlists.service'
import { TracksService } from './tracks/tracks.service'
import { ArtistsService } from './artists/artists.service'
import { AuthService } from './auth/auth.service'

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.local', '.env.development', '.env.production'],

      validate: (env: Record<string, unknown>): envType => envSchema.parse(env)
    }),
    PrismaModule,
    AuthModule,
    ArtistsModule,
    UsersModule,
    TracksModule,
    PlaylistsModule,
    AlbumsModule
  ],
  controllers: [
    AppController,
    AlbumsController,
    ArtistsController,
    TracksController,
    PlaylistsController,
    AuthController
  ],
  providers: [
    AppService,
    AlbumsService,
    ArtistsService,
    TracksService,
    PlaylistsService,
    AuthService
  ]
})
export class AppModule {}
