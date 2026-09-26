import type { ModerationStatus } from '@prisma/client'
import type { ReportEntityType } from './constants'
import type { AdminFixturesPrismaClient, AdminFixturesSummary, FixtureIds } from './types'

/** One report row before `reporterId` is attached. */
type ReportFixture = {
  entityType: ReportEntityType
  entityId: string
  reason: string
  status: ModerationStatus
  details?: string
}

/** Builds the fixed report list — everything except the two base-catalog-dependent entries. */
function buildFixedReports(ids: FixtureIds): ReportFixture[] {
  return [
    {
      entityType: 'album',
      entityId: ids.deactivatedAlbumId,
      status: 'REVIEWING',
      reason: 'Fixture report: rights claim, under review',
    },
    {
      entityType: 'playlist',
      entityId: ids.abusivePlaylistId,
      status: 'OPEN',
      reason: 'Fixture report: spam playlist title',
    },
    {
      entityType: 'playlist',
      entityId: ids.publicPlaylistId,
      reason: 'Fixture report: resolved, playlist renamed',
      status: 'RESOLVED',
      details: 'Owner updated the title after the fixture "resolved" this report.',
    },
    {
      entityType: 'user',
      entityId: ids.deactivatedUserIds[0] ?? ids.reporterUserId,
      status: 'OPEN',
      reason: 'Fixture report: harassment',
    },
    {
      entityType: 'user',
      entityId: ids.deactivatedUserIds[1] ?? ids.reporterUserId,
      status: 'RESOLVED',
      reason: 'Fixture report: resolved after account deactivation',
    },
  ]
}

/** Reports against the real base-catalog track/artist — several per subject, on purpose. */
function buildBaseCatalogReports(
  baseArtist: { id: string },
  baseTrack: { id: string },
): ReportFixture[] {
  return [
    {
      entityType: 'track',
      entityId: baseTrack.id,
      status: 'OPEN',
      reason: 'Fixture report: copyright claim',
    },
    {
      entityType: 'track',
      entityId: baseTrack.id,
      status: 'REVIEWING',
      reason: 'Fixture report: inappropriate lyrics, under review',
    },
    {
      entityType: 'track',
      entityId: baseTrack.id,
      status: 'REJECTED',
      reason: 'Fixture report: no violation found',
    },
    {
      entityType: 'artist',
      entityId: baseArtist.id,
      status: 'OPEN',
      reason: 'Fixture report: impersonation claim',
    },
    {
      entityType: 'artist',
      entityId: baseArtist.id,
      status: 'REVIEWING',
      reason: 'Fixture report: suspicious activity, under review',
    },
    {
      entityType: 'artist',
      entityId: baseArtist.id,
      status: 'REJECTED',
      reason: 'Fixture report: reviewed and rejected',
    },
  ]
}

/**
 * Reports across every {@link ReportEntityType} value and every {@link ModerationStatus}. Real
 * base-catalog rows are reused as the subject for `track`/`artist` reports (several pointing at
 * the same subject, so a subject page has siblings to show); every other entity type points at a
 * row this seeder owns. `podcast`/`episode` are skipped when the base catalog has none yet — this
 * seeder never creates a podcast of its own.
 */
export async function seedReports(
  prisma: AdminFixturesPrismaClient,
  summary: AdminFixturesSummary,
  ids: FixtureIds,
  baseArtist: { id: string },
  baseTrack: { id: string },
): Promise<void> {
  const podcast = await prisma.podcast.findFirst({
    where: { deletedAt: null },
    orderBy: { createdAt: 'asc' },
    select: { id: true },
  })
  const episode = await prisma.episode.findFirst({
    where: { deletedAt: null },
    orderBy: { createdAt: 'asc' },
    select: { id: true },
  })

  const reports: ReportFixture[] = [
    ...buildBaseCatalogReports(baseArtist, baseTrack),
    ...buildFixedReports(ids),
  ]

  if (podcast) {
    reports.push({
      entityType: 'podcast',
      entityId: podcast.id,
      reason: 'Fixture report: podcast content report',
      status: 'OPEN',
    })
  }
  if (episode) {
    reports.push({
      entityType: 'episode',
      entityId: episode.id,
      reason: 'Fixture report: episode content report',
      status: 'OPEN',
    })
  }

  for (const report of reports) {
    const existing = await prisma.moderationReport.findFirst({
      where: { reporterId: ids.reporterUserId, reason: report.reason },
    })
    if (existing) {
      await prisma.moderationReport.update({
        where: { id: existing.id },
        data: { status: report.status },
      })
      continue
    }

    await prisma.moderationReport.create({ data: { reporterId: ids.reporterUserId, ...report } })
    summary.reports += 1
  }
}
