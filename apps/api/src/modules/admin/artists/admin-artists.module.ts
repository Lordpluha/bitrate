import { PrismaModule } from '@infra/prisma/prisma.module'
import { AdminAuthModule } from '@modules/admin-auth'
import { Module } from '@nestjs/common'
import { AdminArtistsController } from './admin-artists.controller'
import { AdminArtistsService } from './admin-artists.service'

@Module({
  imports: [PrismaModule, AdminAuthModule],
  controllers: [AdminArtistsController],
  providers: [AdminArtistsService],
})
export class AdminArtistsModule {}
