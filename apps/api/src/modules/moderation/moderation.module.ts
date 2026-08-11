import { PrismaModule } from '@infra/prisma/prisma.module'
import { UsersAuthModule } from '@modules/users-auth/users-auth.module'
import { Module } from '@nestjs/common'
import { ModerationController } from './moderation.controller'

@Module({ imports: [PrismaModule, UsersAuthModule], controllers: [ModerationController] })
export class ModerationModule {}
