import { PrismaModule } from '@infra/prisma/prisma.module'
import { UsersAuthModule } from '@modules/users-auth/users-auth.module'
import { Module } from '@nestjs/common'
import { MeController } from './me.controller'
import { MeService } from './me.service'

@Module({
  imports: [PrismaModule, UsersAuthModule],
  controllers: [MeController],
  providers: [MeService],
})
export class MeModule {}
