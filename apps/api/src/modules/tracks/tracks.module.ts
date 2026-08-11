import { CacheModule } from '@infra/cache/cache.module'
import { PrismaModule } from '@infra/prisma/prisma.module'
import {
  AUDIO_PROCESSING_DEAD_LETTER_QUEUE,
  AUDIO_PROCESSING_QUEUE,
} from '@infra/queues/audio-processing.queue'
import { StorageModule } from '@infra/storage/storage.module'
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
    CacheModule,
    UsersAuthModule,
    TokensModule,
    StorageModule,
    BullModule.registerQueue(
      { name: AUDIO_PROCESSING_QUEUE },
      {
        name: AUDIO_PROCESSING_DEAD_LETTER_QUEUE,
        defaultJobOptions: { removeOnComplete: 500, removeOnFail: 1_000 },
      },
    ),
  ],
  exports: [TracksService, AudioGateway],
})
export class TracksModule {}
