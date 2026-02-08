import { PrismaModule } from '@infra/prisma/prisma.module'
import { TokensModule } from '@modules/tokens/tokens.module'
import { UsersAuthModule } from '@modules/users-auth/users-auth.module'
import { BullModule } from '@nestjs/bullmq'
import { Module } from '@nestjs/common'
import { AudioGateway } from './audio.gateway'
import { AudioProcessingConsumer } from './audio-processing.consumer'
import { TracksController } from './tracks.controller'
import { TracksService } from './tracks.service'

@Module({
  providers: [TracksService, AudioGateway, AudioProcessingConsumer],
  controllers: [TracksController],
  imports: [
    PrismaModule,
    UsersAuthModule,
    TokensModule,
    BullModule.registerQueue({ name: 'audio-processing' }),
  ],
  exports: [TracksService, AudioGateway],
})
export class TracksModule {}
