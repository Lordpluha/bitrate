import { PrismaModule } from '@infra/prisma/prisma.module'
import { StorageCoreModule } from '@infra/storage/storage-core.module'
import { AdminAuthModule } from '@modules/admin-auth'
import { ReleaseChangeReviewModule, ReleasePublishingCoreModule } from '@modules/releases'
import { Module } from '@nestjs/common'
import { AdminReleaseChangesController } from './admin-release-changes.controller'
import { AdminReleasesController } from './admin-releases.controller'
import { AdminReleasesService } from './admin-releases.service'

@Module({
  imports: [
    PrismaModule,
    StorageCoreModule,
    AdminAuthModule,
    ReleasePublishingCoreModule,
    ReleaseChangeReviewModule,
  ],
  controllers: [AdminReleasesController, AdminReleaseChangesController],
  providers: [AdminReleasesService],
})
export class AdminReleasesModule {}
