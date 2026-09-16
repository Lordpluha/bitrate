import { type EnvironmentProviders, makeEnvironmentProviders } from '@angular/core'
import { ArtistRepository } from '@domain/artist'
import { AuditRepository } from '@domain/audit'
import { ModerationReportRepository } from '@domain/moderation'
import { RoleRepository } from '@domain/role'
import { StaffSessionRepository } from '@domain/staff'
import { TrackRepository } from '@domain/track'
import { UserRepository } from '@domain/user'
import { HttpArtistRepository } from './artists'
import { HttpAuditRepository } from './audit'
import { HttpTrackRepository } from './catalog'
import { HttpModerationReportRepository } from './moderation'
import { HttpRoleRepository } from './roles'
import { HttpStaffSessionRepository } from './staff'
import { HttpUserRepository } from './users'

/**
 * The composition root's one job: bind every domain port to the HTTP adapter behind it.
 *
 * This is the only file in the app that knows both halves. Swapping an adapter — for an
 * in-memory one in a test, say — is a line here and nothing else.
 */
export function provideAdminInfrastructure(): EnvironmentProviders {
  return makeEnvironmentProviders([
    { provide: ArtistRepository, useClass: HttpArtistRepository },
    { provide: AuditRepository, useClass: HttpAuditRepository },
    { provide: ModerationReportRepository, useClass: HttpModerationReportRepository },
    { provide: RoleRepository, useClass: HttpRoleRepository },
    { provide: StaffSessionRepository, useClass: HttpStaffSessionRepository },
    { provide: TrackRepository, useClass: HttpTrackRepository },
    { provide: UserRepository, useClass: HttpUserRepository },
  ])
}
