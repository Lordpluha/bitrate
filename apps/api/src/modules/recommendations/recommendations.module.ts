import { PrismaModule } from '@infra/prisma/prisma.module'
import { TokensModule } from '@modules/tokens/tokens.module'
import { UsersAuthModule } from '@modules/users-auth/users-auth.module'
import { BullModule } from '@nestjs/bullmq'
import { Module } from '@nestjs/common'
import { PlaybackEventsController } from './playback-events.controller'
import { PlaybackEventsService } from './playback-events.service'
import {
  PLAYBACK_EVENTS_RETENTION_QUEUE,
  PlaybackEventsRetentionConsumer,
} from './playback-events-retention.consumer'
import { TasteController } from './taste.controller'
import { TasteService } from './taste.service'

/**
 * The recommendation system (docs/specs/recommendations.md, ADR-0077). Stage 1: the signals —
 * finished plays, "Not interested" and taste exclusions — and their retention.
 */
@Module({
  imports: [
    PrismaModule,
    UsersAuthModule,
    TokensModule,
    BullModule.registerQueue({ name: PLAYBACK_EVENTS_RETENTION_QUEUE }),
  ],
  controllers: [PlaybackEventsController, TasteController],
  providers: [PlaybackEventsService, TasteService, PlaybackEventsRetentionConsumer],
  exports: [TasteService],
})
export class RecommendationsModule {}
