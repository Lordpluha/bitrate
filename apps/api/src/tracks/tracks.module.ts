import { Module } from '@nestjs/common'
import { JwtModule } from '@nestjs/jwt'
import { AuthModule } from 'src/auth/auth.module'
import { PrismaModule } from 'src/prisma/prisma.module'
import { AudioGateway } from './audio.gateway'
import { TracksController } from './tracks.controller'
import { TracksService } from './tracks.service'

@Module({
  providers: [TracksService, AudioGateway],
  controllers: [TracksController],
  imports: [PrismaModule, AuthModule, JwtModule],
  exports: [TracksService, AudioGateway],
})
export class TracksModule {}
