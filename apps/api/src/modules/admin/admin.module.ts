import { AdminAuthModule } from '@modules/admin-auth'
import { Module } from '@nestjs/common'
import { AdminArtistsModule } from './artists'
import { AdminAuditModule } from './audit'
import { AdminModerationModule } from './moderation'
import { AdminRolesModule } from './roles'
import { AdminStaffModule } from './staff'
import { AdminTracksModule } from './tracks'
import { AdminUsersModule } from './users'

/** Umbrella module for the operator ("admin") surface. Aggregates domain sub-modules. */
@Module({
  imports: [
    AdminAuthModule,
    AdminModerationModule,
    AdminArtistsModule,
    AdminUsersModule,
    AdminTracksModule,
    AdminAuditModule,
    AdminRolesModule,
    AdminStaffModule,
  ],
})
export class AdminModule {}
