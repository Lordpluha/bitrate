import { Module } from '@nestjs/common'
import { PlaylistsController } from './playlists.controller'
import { PlaylistsService } from './playlists.service'
import { JwtModule } from '@nestjs/jwt'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { PrismaModule } from 'src/prisma/prisma.module'

@Module({
  controllers: [PlaylistsController],
  providers: [PlaylistsService],
  imports: [
    PrismaModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.get<string>('JWT_SECRET'),
        signOptions: { expiresIn: '60s' }
      })
    })
  ],
  exports: [PlaylistsService]
})
export class PlaylistsModule {}
