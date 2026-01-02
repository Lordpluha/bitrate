import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { envSchema, envType } from '../env.schema'
import { AlbumsModule } from './albums/albums.module'
import { AppController } from './app.controller'
import { AppService } from './app.service'
import { ArtistsModule } from './artists/artists.module'
import { AuthModule } from './auth/auth.module'
import { FilesModule } from './files/files.module'
import { PlaylistsModule } from './playlists/playlists.module'
import { PrismaModule } from './prisma/prisma.module'
import { TracksModule } from './tracks/tracks.module'
import { UsersModule } from './users/users.module'

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.local', '.env.development', '.env.production'],

      validate: (env: Record<string, unknown>): envType => envSchema.parse(env),
    }),
    PrismaModule,
    AuthModule,
    ArtistsModule,
    UsersModule,
    TracksModule,
    PlaylistsModule,
    AlbumsModule,
    FilesModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
