import { PrismaModule } from '@infra/prisma/prisma.module'
import { AdminAuthModule } from '@modules/admin-auth'
import { Module } from '@nestjs/common'
import { AdminAlbumsController } from './admin-albums.controller'
import { AdminAlbumsService } from './admin-albums.service'

@Module({
  imports: [PrismaModule, AdminAuthModule],
  controllers: [AdminAlbumsController],
  providers: [AdminAlbumsService],
})
export class AdminAlbumsModule {}
