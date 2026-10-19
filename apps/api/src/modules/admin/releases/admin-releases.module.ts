import { PrismaModule } from '@infra/prisma/prisma.module'
import { StorageCoreModule } from '@infra/storage/storage-core.module'
import { AdminAuthModule } from '@modules/admin-auth'
import { Module } from '@nestjs/common'
import { AdminReleasesController } from './admin-releases.controller'
import { AdminReleasesService } from './admin-releases.service'

@Module({
  imports: [PrismaModule, StorageCoreModule, AdminAuthModule],
  controllers: [AdminReleasesController],
  providers: [AdminReleasesService],
})
export class AdminReleasesModule {}
