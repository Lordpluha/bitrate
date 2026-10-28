import { PrismaService } from '@infra/prisma/prisma.service'
import { Injectable } from '@nestjs/common'
import { type Prisma, ReleaseStatus, ReleaseTaskStatus } from '@prisma/client'
import { releaseReadiness } from './release-readiness'
import { readinessFromRecord, releaseReadinessSelect } from './releases.select'

/** Statuses an artist is still acting on; the current release is chosen among them first. */
const ACTIVE_STATUSES = [ReleaseStatus.DRAFT, ReleaseStatus.SUBMITTED, ReleaseStatus.REJECTED]

/** Drafts checked for blockers on the dashboard; older drafts surface from Music instead. */
const ATTENTION_DRAFT_LIMIT = 10
const UPCOMING_LIMIT = 5
const NEXT_TASK_LIMIT = 5

const CURRENT_RELEASE_SELECT = {
  id: true,
  title: true,
  type: true,
  status: true,
  cover: true,
  scheduledAt: true,
  updatedAt: true,
  trackDrafts: {
    where: { deletedAt: null, audioKey: { not: null } },
    orderBy: [{ position: 'asc' }, { createdAt: 'asc' }, { id: 'asc' }],
    take: 1,
    select: { id: true, title: true, duration: true, waveform: true },
  },
} as const satisfies Prisma.ReleaseSelect

type AttentionItem =
  | { kind: 'BLOCKERS'; releaseId: string; releaseTitle: string; count: number }
  | { kind: 'CHANGES_REQUESTED'; releaseId: string; releaseTitle: string }
  | { kind: 'OVERDUE_TASKS'; count: number }

/**
 * One request for the dashboard's returning-artist view, in its decision order: current work,
 * required actions, catalogue, dates and tasks. Everything is read from saved data; nothing
 * external such as streams or revenue is implied.
 */
@Injectable()
export class ArtistDashboardService {
  constructor(private readonly prisma: PrismaService) {}

  async summary(ownerArtistId: string) {
    const owned = { ownerArtistId, deletedAt: null }
    const now = new Date()
    const openTasks = {
      release: owned,
      status: { not: ReleaseTaskStatus.DONE },
    } satisfies Prisma.ReleaseTaskWhereInput

    const [
      byStatus,
      tracks,
      current,
      drafts,
      rejected,
      upcoming,
      taskOpen,
      taskOverdue,
      nextTasks,
    ] = await Promise.all([
      this.prisma.release.groupBy({ by: ['status'], where: owned, _count: { _all: true } }),
      this.prisma.artistTrackDraft.count({ where: owned }),
      this.currentRelease(ownerArtistId),
      this.prisma.release.findMany({
        where: { ...owned, status: ReleaseStatus.DRAFT },
        orderBy: [{ updatedAt: 'desc' }, { id: 'desc' }],
        take: ATTENTION_DRAFT_LIMIT,
        select: { id: true, title: true, ...releaseReadinessSelect(ownerArtistId) },
      }),
      this.prisma.release.findMany({
        where: { ...owned, status: ReleaseStatus.REJECTED },
        orderBy: [{ updatedAt: 'desc' }, { id: 'desc' }],
        take: ATTENTION_DRAFT_LIMIT,
        select: { id: true, title: true },
      }),
      this.prisma.release.findMany({
        where: { ...owned, scheduledAt: { gte: now } },
        orderBy: [{ scheduledAt: 'asc' }, { id: 'asc' }],
        take: UPCOMING_LIMIT,
        select: { id: true, title: true, status: true, scheduledAt: true },
      }),
      this.prisma.releaseTask.count({ where: openTasks }),
      this.prisma.releaseTask.count({ where: { ...openTasks, dueAt: { lt: now } } }),
      this.prisma.releaseTask.findMany({
        where: openTasks,
        orderBy: [{ dueAt: { sort: 'asc', nulls: 'last' } }, { createdAt: 'asc' }, { id: 'asc' }],
        take: NEXT_TASK_LIMIT,
        select: {
          id: true,
          title: true,
          status: true,
          dueAt: true,
          release: { select: { id: true, title: true } },
        },
      }),
    ])

    const statusCount = (status: ReleaseStatus) =>
      byStatus.find((group) => group.status === status)?._count._all ?? 0
    const releases = byStatus.reduce((total, group) => total + group._count._all, 0)

    const blockersById = new Map<string, number>()
    const attention: AttentionItem[] = rejected.map((release) => ({
      kind: 'CHANGES_REQUESTED',
      releaseId: release.id,
      releaseTitle: release.title,
    }))
    for (const draft of drafts) {
      const { blockers } = releaseReadiness(readinessFromRecord(draft))
      blockersById.set(draft.id, blockers.length)
      if (blockers.length > 0) {
        attention.push({
          kind: 'BLOCKERS',
          releaseId: draft.id,
          releaseTitle: draft.title,
          count: blockers.length,
        })
      }
    }
    if (taskOverdue > 0) attention.push({ kind: 'OVERDUE_TASKS', count: taskOverdue })

    return {
      counts: {
        releases,
        drafts: statusCount(ReleaseStatus.DRAFT),
        inReview: statusCount(ReleaseStatus.SUBMITTED),
        released: statusCount(ReleaseStatus.RELEASED),
        tracks,
      },
      currentRelease: current
        ? {
            ...current.summary,
            leadTrack: current.leadTrack,
            blockerCount:
              current.summary.status === ReleaseStatus.DRAFT
                ? (blockersById.get(current.summary.id) ??
                  (await this.blockerCount(ownerArtistId, current.summary.id)))
                : 0,
          }
        : null,
      attention,
      upcoming: upcoming.flatMap(({ scheduledAt, ...release }) =>
        scheduledAt ? [{ ...release, scheduledAt }] : [],
      ),
      tasks: { open: taskOpen, overdue: taskOverdue, next: nextTasks },
    }
  }

  /** The release the artist most recently worked on, preferring one still in progress. */
  private async currentRelease(ownerArtistId: string) {
    const owned = { ownerArtistId, deletedAt: null }
    const record =
      (await this.prisma.release.findFirst({
        where: { ...owned, status: { in: ACTIVE_STATUSES } },
        orderBy: [{ updatedAt: 'desc' }, { id: 'desc' }],
        select: CURRENT_RELEASE_SELECT,
      })) ??
      (await this.prisma.release.findFirst({
        where: owned,
        orderBy: [{ updatedAt: 'desc' }, { id: 'desc' }],
        select: CURRENT_RELEASE_SELECT,
      }))
    if (!record) return null
    const { trackDrafts, ...summary } = record
    return { summary, leadTrack: trackDrafts[0] ?? null }
  }

  private async blockerCount(ownerArtistId: string, id: string): Promise<number> {
    const record = await this.prisma.release.findFirst({
      where: { id, ownerArtistId, deletedAt: null },
      select: releaseReadinessSelect(ownerArtistId),
    })
    return record ? releaseReadiness(readinessFromRecord(record)).blockers.length : 0
  }
}
