import { Module } from '@nestjs/common'
import { TracksService } from './tracks.service'
import { TracksController } from './tracks.controller'
import { PrismaModule } from 'src/prisma/prisma.module'

@Module({
  providers: [TracksService],
  controllers: [TracksController],
  imports: [PrismaModule]
})
export class TracksModule {}
