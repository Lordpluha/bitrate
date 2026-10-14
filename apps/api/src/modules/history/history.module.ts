import { PrismaModule } from '@infra/prisma/prisma.module'
import { TokensModule } from '@modules/tokens/tokens.module'
import { UsersAuthModule } from '@modules/users-auth/users-auth.module'
import { BullModule } from '@nestjs/bullmq'
import { Module } from '@nestjs/common'
import { HistoryController } from './history.controller'
import { HistoryService } from './history.service'
import { LISTENING_STATS_QUEUE, ListeningStatsConsumer } from './listening-stats.consumer'
import { ListeningStatsService } from './listening-stats.service'

@Module({
  imports: [
    PrismaModule,
    UsersAuthModule,
    TokensModule,
    BullModule.registerQueue({ name: LISTENING_STATS_QUEUE }),
  ],
  controllers: [HistoryController],
  providers: [HistoryService, ListeningStatsService, ListeningStatsConsumer],
  exports: [HistoryService, ListeningStatsService],
})
export class HistoryModule {}
