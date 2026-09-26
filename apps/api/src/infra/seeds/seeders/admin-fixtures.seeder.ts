import { Logger } from '@nestjs/common'
import {
  type AdminFixturesPrismaClient,
  type AdminFixturesSummary,
  emptySummary,
  type FixtureIds,
  seedArtists,
  seedAuditLogs,
  seedDeactivatedAlbum,
  seedPlaylists,
  seedReports,
  seedRoles,
  seedStaff,
  seedTracks,
  seedUnusedGenre,
  seedUsers,
} from './admin-fixtures'

export type { AdminFixturesSummary } from './admin-fixtures'

/**
 * Creates the fixture data every admin-panel coverage stage is verified against: stuck/failed
 * tracks, moderation reports across every status and entity type, deactivated accounts, an
 * unreferenced genre, and enough audit history to populate a "recent actions" list.
 *
 * Additive and idempotent. Every row is keyed by a deterministic `fixture-`/`Fixture:` natural
 * key — an email, a username, a track ISRC, a genre slug — so re-running updates those rows in
 * place instead of duplicating them, and nothing this seeder does not own is ever touched or
 * cleared (contrast `SeedService.clearDatabase`, which this script never calls).
 *
 * A thin orchestrator by design — every fixture group's actual create/update logic lives in its
 * own file under `admin-fixtures/`, kept independently testable and each under ~150 lines.
 */
export class AdminFixturesSeeder {
  private readonly logger = new Logger(AdminFixturesSeeder.name, { timestamp: true })

  constructor(private readonly prisma: AdminFixturesPrismaClient) {}

  /**
   * Runs every fixture step in dependency order and returns how many rows each group actually
   * inserted (not updated) this run — a re-run reports zero everywhere.
   *
   * @throws {Error} when no non-deleted artist or track exists yet — the base catalog
   * (`db:seed`) must run first; this seeder only adds to it, never creates a catalog from
   * scratch.
   */
  async run(): Promise<AdminFixturesSummary> {
    const summary = emptySummary()
    const baseArtist = await this.requireBaseArtist()
    const baseTrack = await this.requireBaseTrack()

    const roles = await seedRoles(this.prisma, summary)
    const staff = await seedStaff(this.prisma, summary, roles)
    const users = await seedUsers(this.prisma, summary)
    const artists = await seedArtists(this.prisma, summary)
    const tracks = await seedTracks(this.prisma, summary, artists.fixtureArtistId)
    const deactivatedAlbumId = await seedDeactivatedAlbum(
      this.prisma,
      summary,
      artists.fixtureArtistId,
    )
    const playlists = await seedPlaylists(this.prisma, summary, users.reporterUserId)
    const unusedGenreId = await seedUnusedGenre(this.prisma, summary)

    const ids: FixtureIds = {
      ...roles,
      ...staff,
      ...users,
      ...artists,
      ...tracks,
      ...playlists,
      deactivatedAlbumId,
      unusedGenreId,
    }

    await seedReports(this.prisma, summary, ids, baseArtist, baseTrack)
    await seedAuditLogs(this.prisma, summary, staff.moderatorStaffId)

    this.logger.log(`✅ Admin fixtures ensured: ${JSON.stringify(summary)}`)
    return summary
  }

  private async requireBaseArtist(): Promise<{ id: string }> {
    const artist = await this.prisma.artist.findFirst({
      where: { deletedAt: null },
      orderBy: { createdAt: 'asc' },
      select: { id: true },
    })
    if (!artist) {
      throw new Error(
        'No artist exists yet — run `pnpm --filter @bitrate/api db:seed` before `db:seed:admin`.',
      )
    }
    return artist
  }

  private async requireBaseTrack(): Promise<{ id: string }> {
    const track = await this.prisma.track.findFirst({
      where: { deletedAt: null },
      orderBy: { createdAt: 'asc' },
      select: { id: true },
    })
    if (!track) {
      throw new Error(
        'No track exists yet — run `pnpm --filter @bitrate/api db:seed` before `db:seed:admin`.',
      )
    }
    return track
  }
}
