import { PrismaModule } from '@infra/prisma/prisma.module'
import { TokensModule } from '@modules/tokens/tokens.module'
import { UsersAuthModule } from '@modules/users-auth/users-auth.module'
import { BullModule } from '@nestjs/bullmq'
import { Module } from '@nestjs/common'
import { PlaybackEventsController } from './playback-events/playback-events.controller'
import { PlaybackEventsService } from './playback-events/playback-events.service'
import {
  PLAYBACK_EVENTS_RETENTION_QUEUE,
  PlaybackEventsRetentionConsumer,
} from './playback-events/playback-events-retention.consumer'
import { NotInterestedController } from './taste/not-interested.controller'
import { NotInterestedService } from './taste/not-interested.service'
import { TasteExclusionsController } from './taste/taste-exclusions.controller'
import { TasteExclusionsService } from './taste/taste-exclusions.service'

/**
 * The recommendation system (docs/specs/recommendations.md, ADR-0080). Stage 1: the signals —
 * finished plays, "Not interested" and taste exclusions — and their retention.
 */
@Module({
  imports: [
    PrismaModule,
    UsersAuthModule,
    TokensModule,
    BullModule.registerQueue({ name: PLAYBACK_EVENTS_RETENTION_QUEUE }),
  ],
  controllers: [PlaybackEventsController, NotInterestedController, TasteExclusionsController],
  providers: [
    PlaybackEventsService,
    PlaybackEventsRetentionConsumer,
    NotInterestedService,
    TasteExclusionsService,
  ],
  exports: [NotInterestedService],
})
export class RecommendationsModule {}
