import { PrismaModule } from '@infra/prisma/prisma.module'
import { AdminAuthModule } from '@modules/admin-auth'
import { Module } from '@nestjs/common'
import { AdminGenresController } from './admin-genres.controller'
import { AdminGenresService } from './admin-genres.service'

@Module({
  imports: [PrismaModule, AdminAuthModule],
  controllers: [AdminGenresController],
  providers: [AdminGenresService],
})
export class AdminGenresModule {}
