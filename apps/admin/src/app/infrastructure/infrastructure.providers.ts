import { type EnvironmentProviders, makeEnvironmentProviders } from '@angular/core'
import { AlbumRepository } from '@domain/album'
import { ArtistRepository } from '@domain/artist'
import { AuditRepository } from '@domain/audit'
import { GenreRepository } from '@domain/genre'
import { ModerationReportRepository } from '@domain/moderation'
import { OverviewRepository } from '@domain/overview'
import { RoleRepository } from '@domain/role'
import { StaffRepository, StaffSessionRepository } from '@domain/staff'
import { TrackRepository } from '@domain/track'
import { UserRepository } from '@domain/user'
import { HttpAlbumRepository } from './albums'
import { HttpArtistRepository } from './artists'
import { HttpAuditRepository } from './audit'
import { HttpTrackRepository } from './catalog'
import { HttpGenreRepository } from './genres'
import { HttpModerationReportRepository } from './moderation'
import { HttpOverviewRepository } from './overview'
import { HttpRoleRepository } from './roles'
import { HttpStaffRepository, HttpStaffSessionRepository } from './staff'
import { HttpUserRepository } from './users'

/**
 * The composition root's one job: bind every domain port to the HTTP adapter behind it.
 *
 * This is the only file in the app that knows both halves. Swapping an adapter — for an
 * in-memory one in a test, say — is a line here and nothing else.
 */
export function provideAdminInfrastructure(): EnvironmentProviders {
  return makeEnvironmentProviders([
    { provide: AlbumRepository, useClass: HttpAlbumRepository },
    { provide: ArtistRepository, useClass: HttpArtistRepository },
    { provide: AuditRepository, useClass: HttpAuditRepository },
    { provide: GenreRepository, useClass: HttpGenreRepository },
    { provide: ModerationReportRepository, useClass: HttpModerationReportRepository },
    { provide: OverviewRepository, useClass: HttpOverviewRepository },
    { provide: RoleRepository, useClass: HttpRoleRepository },
    { provide: StaffRepository, useClass: HttpStaffRepository },
    { provide: StaffSessionRepository, useClass: HttpStaffSessionRepository },
    { provide: TrackRepository, useClass: HttpTrackRepository },
    { provide: UserRepository, useClass: HttpUserRepository },
  ])
}
