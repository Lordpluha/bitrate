import { AdminAuthModule } from '@modules/admin-auth'
import { Module } from '@nestjs/common'
import { AdminModerationModule } from './moderation'

/** Umbrella module for the operator ("admin") surface. Aggregates domain sub-modules. */
@Module({
  imports: [AdminAuthModule, AdminModerationModule],
})
export class AdminModule {}
