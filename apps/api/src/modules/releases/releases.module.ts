import { PrismaModule } from '@infra/prisma/prisma.module'
import { StorageCoreModule } from '@infra/storage/storage-core.module'
import { TokensModule } from '@modules/tokens/tokens.module'
import { Module } from '@nestjs/common'
import { ArtistAnalyticsController } from './artist-analytics.controller'
import { ArtistAnalyticsService } from './artist-analytics.service'
import { ArtistDashboardController } from './artist-dashboard.controller'
import { ArtistDashboardService } from './artist-dashboard.service'
import { ArtistMusicController } from './artist-music.controller'
import { ArtistMusicService } from './artist-music.service'
import { ArtistNotificationsController } from './artist-notifications.controller'
import { ArtistNotificationsService } from './artist-notifications.service'
import { ArtistSearchController } from './artist-search.controller'
import { ArtistSearchService } from './artist-search.service'
import {
  DISTRIBUTION_ADAPTER,
  NotConnectedDistributionAdapter,
} from './distribution/distribution-adapter'
import { ReleaseCoverService } from './release-cover.service'
import { ReleaseCreditsService } from './release-credits.service'
import { DistributionController, ReleaseDeliveryController } from './release-delivery.controller'
import { ReleaseDeliveryService } from './release-delivery.service'
import { ReleaseMediaController } from './release-media.controller'
import { ReleaseMediaService } from './release-media.service'
import { ArtistTasksController, ReleaseTasksController } from './release-tasks.controller'
import { ReleaseTasksService } from './release-tasks.service'
import { ReleasesController } from './releases.controller'
import { ReleasesService } from './releases.service'

@Module({
  imports: [PrismaModule, StorageCoreModule, TokensModule],
  controllers: [
    ReleasesController,
    ReleaseMediaController,
    ReleaseTasksController,
    ArtistTasksController,
    ArtistMusicController,
    ArtistDashboardController,
    ReleaseDeliveryController,
    DistributionController,
    ArtistSearchController,
    ArtistNotificationsController,
    ArtistAnalyticsController,
  ],
  providers: [
    ReleasesService,
    ReleaseCreditsService,
    ReleaseMediaService,
    ReleaseCoverService,
    ReleaseTasksService,
    ArtistMusicService,
    ArtistDashboardService,
    ReleaseDeliveryService,
    ArtistSearchService,
    ArtistNotificationsService,
    ArtistAnalyticsService,
    // Replace with the partner's client once a distribution partner is confirmed (#248).
    { provide: DISTRIBUTION_ADAPTER, useClass: NotConnectedDistributionAdapter },
  ],
})
export class ReleasesModule {}
