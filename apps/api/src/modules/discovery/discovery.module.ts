import { CacheModule } from '@infra/cache/cache.module'
import { PrismaModule } from '@infra/prisma/prisma.module'
import { UsersAuthModule } from '@modules/users-auth/users-auth.module'
import { Module } from '@nestjs/common'
import { DiscoveryController } from './discovery.controller'
import { DiscoveryService } from './discovery.service'
import { PersonalTopService } from './personal-top.service'

@Module({
  imports: [PrismaModule, CacheModule, UsersAuthModule],
  controllers: [DiscoveryController],
  providers: [DiscoveryService, PersonalTopService],
  exports: [DiscoveryService, PersonalTopService],
})
export class DiscoveryModule {}
