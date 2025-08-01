import { Module } from '@nestjs/common'
import { TracksService } from './tracks.service'
import { TracksController } from './tracks.controller'
import { PrismaModule } from 'src/prisma/prisma.module'
import { JwtModule } from '@nestjs/jwt'

@Module({
  providers: [TracksService],
  controllers: [TracksController],
  imports: [PrismaModule, JwtModule],
  exports: [TracksService]
})
export class TracksModule {}
