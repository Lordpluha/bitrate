import { PrismaModule } from '@infra/prisma/prisma.module'
import { AlbumsModule } from '@modules/albums/albums.module'
import { ArtistsModule } from '@modules/artists/artists.module'
import { AuthModule } from '@modules/auth/auth.module'
import { PlaylistsModule } from '@modules/playlists/playlists.module'
import { TracksModule } from '@modules/tracks/tracks.module'
import { UsersModule } from '@modules/users/users.module'
import { BullModule } from '@nestjs/bullmq'
import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { ServeStaticModule } from '@nestjs/serve-static'
import { join } from 'path'
import { envSchema } from '../env.schema'
import { AppController } from './app.controller'
import { PathTraversalMiddleware } from './common'

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env', '.env.local', '.env.production', '.env.development'],

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
    BullModule.forRoot({
      connection: {
        host: process.env.REDIS_HOST,
        port: Number(process.env.REDIS_PORT),
      },
    }),
    BullModule.registerQueue({
      name: 'audio-processing',
    }),
    PrismaModule,
    AuthModule,
    ArtistsModule,
    UsersModule,
    TracksModule,
    PlaylistsModule,
    AlbumsModule,
  ],
  controllers: [AppController],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(PathTraversalMiddleware).forRoutes('*path')
  }
}
