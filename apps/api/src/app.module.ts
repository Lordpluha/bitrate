import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { ServeStaticModule } from '@nestjs/serve-static'
import { join } from 'path'
import { envSchema, envType } from '../env.schema'
import { AppController } from './app.controller'
import { AppService } from './app.service'
import { PrismaModule } from './infra/prisma/prisma.module'
import { AlbumsModule } from './modules/albums/albums.module'
import { ArtistsModule } from './modules/artists/artists.module'
import { AuthModule } from './modules/auth/auth.module'
import { FilesModule } from './modules/files/files.module'
import { PlaylistsModule } from './modules/playlists/playlists.module'
import { TracksModule } from './modules/tracks/tracks.module'
import { UsersModule } from './modules/users/users.module'

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.local', '.env.development', '.env.production'],

      validate: (env: Record<string, unknown>): envType => envSchema.parse(env),
    }),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', '..', 'storage', 'public'),
      serveRoot: '/static',
      exclude: ['/api*', '/swagger*'],
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
