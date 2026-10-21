import { DEFAULT_LIMIT, DEFAULT_PAGE } from '@common/pagination'
import { buildSortOrderBy, type SortInput } from '@common/sort'
import { PrismaService } from '@infra/prisma/prisma.service'
import type { AdminResourceStatus, AuditContextValue } from '@modules/admin/shared'
import {
  runTakeDownTransition,
  statusWhere,
  type TakeDownActor,
  type TakeDownDirection,
} from '@modules/admin/shared'
import { Injectable } from '@nestjs/common'
import type { Prisma } from '@prisma/client'
import type { ADMIN_PODCASTS_SORT_FIELDS } from './dtos'
import type { AdminPodcastEntity, AdminPodcastEpisodeEntity } from './entities'
import {
  EpisodeAlreadyDeletedException,
  EpisodeNotDeletedException,
  EpisodeNotFoundException,
  PodcastAlreadyDeletedException,
  PodcastNotDeletedException,
  PodcastNotFoundException,
} from './errors'

/** One of the podcast list's allowed sort fields. */
type AdminPodcastsSortField = (typeof ADMIN_PODCASTS_SORT_FIELDS)[number]

/** Input for listing operator-facing podcasts. */
type ListPodcastsInput = {
  page?: number
  limit?: number
  status?: AdminResourceStatus
  q?: string
} & SortInput<AdminPodcastsSortField>

/** The columns the list, detail and take-down responses share, with the episode count joined. */
const PODCAST_ROW_SELECT = {
  id: true,
  title: true,
  publisher: true,
  cover: true,
  language: true,
  explicit: true,
  deletedAt: true,
  createdAt: true,
  updatedAt: true,
  _count: { select: { episodes: true } },
} as const satisfies Prisma.PodcastSelect

/** The episode columns an operator sees — never the audio location. */
const EPISODE_ROW_SELECT = {
  id: true,
  podcastId: true,
  title: true,
  duration: true,
  releaseDate: true,
  explicit: true,
  deletedAt: true,
} as const satisfies Prisma.EpisodeSelect

/** The row columns plus the description and every episode — only the detail page shows these. */
const PODCAST_DETAIL_SELECT = {
  ...PODCAST_ROW_SELECT,
  description: true,
  episodes: {
    orderBy: [{ releaseDate: { sort: 'desc', nulls: 'last' } }, { id: 'desc' }],
    select: EPISODE_ROW_SELECT,
  },
} as const satisfies Prisma.PodcastSelect

type PodcastRowRecord = Prisma.PodcastGetPayload<{ select: typeof PODCAST_ROW_SELECT }>
type PodcastDetailRecord = Prisma.PodcastGetPayload<{ select: typeof PODCAST_DETAIL_SELECT }>
type EpisodeRowRecord = Prisma.EpisodeGetPayload<{ select: typeof EPISODE_ROW_SELECT }>

/** Handles the operator-facing podcast catalog and its podcast- and episode-level take-down. */
@Injectable()
export class AdminPodcastsService {
  constructor(private readonly prisma: PrismaService) {}

  /** Builds the shared `where` clause for listing and counting. */
  private buildWhere({ status, q }: Omit<ListPodcastsInput, 'page' | 'limit'>) {
    return {
      ...statusWhere(status),
      ...(q && { title: { contains: q, mode: 'insensitive' } }),
    } satisfies Prisma.PodcastWhereInput
  }

  /** Flattens a podcast (with its episode count joined) into the operator row shape. */
  private toRow({ _count, ...podcast }: PodcastRowRecord): AdminPodcastEntity {
    return { ...podcast, episodeCount: _count.episodes }
  }

  /** Picks the operator-visible episode columns off a record. */
  private toEpisodeRow(episode: EpisodeRowRecord): AdminPodcastEpisodeEntity {
    return {
      id: episode.id,
      podcastId: episode.podcastId,
      title: episode.title,
      duration: episode.duration,
      releaseDate: episode.releaseDate,
      explicit: episode.explicit,
      deletedAt: episode.deletedAt,
    }
  }

  /** Runs the find all operation, paginated, newest first by default. */
  async findAll({
    page = DEFAULT_PAGE,
    limit = DEFAULT_LIMIT,
    status,
    q,
    sort,
    order,
  }: ListPodcastsInput) {
    const where = this.buildWhere({ status, q })
    const orderBy = buildSortOrderBy<Prisma.PodcastOrderByWithRelationInput>({ sort, order }, [
      { createdAt: 'desc' },
      { id: 'desc' },
    ])
    const [rows, total] = await Promise.all([
      this.prisma.podcast.findMany({
        where,
        select: PODCAST_ROW_SELECT,
        skip: (page - 1) * limit,
        take: limit,
        orderBy,
      }),
      this.prisma.podcast.count({ where }),
    ])
    return { data: rows.map((row) => this.toRow(row)), total, page, limit }
  }

  /**
   * Runs the find by id operation, with every episode of the podcast, newest release first.
   * Deliberately does not filter `deletedAt` on the podcast or its episodes — taken-down items
   * must stay reachable so the operator can review and restore them. Each episode carries its
   * own `deletedAt`: a podcast's take-down never cascades to them.
   */
  async findById(id: string) {
    const podcast = await this.prisma.podcast.findFirst({
      where: { id },
      select: PODCAST_DETAIL_SELECT,
    })
    if (!podcast) throw new PodcastNotFoundException(id)
    return this.toDetail(podcast)
  }

  /** Flattens a podcast with its episodes into the detail response shape. */
  private toDetail({ episodes, description, ...podcast }: PodcastDetailRecord) {
    return {
      ...this.toRow(podcast),
      description,
      episodes: episodes.map((episode) => this.toEpisodeRow(episode)),
    }
  }

  /**
   * Soft-deletes a podcast, recording the operator's stated reason in an audit row. Its episodes
   * are deliberately left untouched — each stays independently manageable. The write is an
   * `updateMany` scoped to `deletedAt: null` so a concurrent take-down loses with a 409.
   */
  softDelete(
    id: string,
    staffId: string,
    reason?: string,
    auditContext: AuditContextValue = {},
  ): Promise<AdminPodcastEntity> {
    return this.transition('take-down', id, { staffId, reason, ...auditContext })
  }

  /** Restores a soft-deleted podcast with the same count-guard pattern as {@link softDelete}. */
  restore(
    id: string,
    staffId: string,
    reason?: string,
    auditContext: AuditContextValue = {},
  ): Promise<AdminPodcastEntity> {
    return this.transition('restore', id, { staffId, reason, ...auditContext })
  }

  /**
   * Soft-deletes one episode of a podcast. The episode must belong to `podcastId`, otherwise it
   * is a 404 — an id pair never reaches an episode of another podcast. Neither the parent
   * podcast nor sibling episodes are touched.
   */
  softDeleteEpisode(
    podcastId: string,
    episodeId: string,
    staffId: string,
    reason?: string,
    auditContext: AuditContextValue = {},
  ): Promise<AdminPodcastEpisodeEntity> {
    return this.transitionEpisode('take-down', podcastId, episodeId, {
      staffId,
      reason,
      ...auditContext,
    })
  }

  /** Restores one soft-deleted episode of a podcast; mirrors {@link softDeleteEpisode}. */
  restoreEpisode(
    podcastId: string,
    episodeId: string,
    staffId: string,
    reason?: string,
    auditContext: AuditContextValue = {},
  ): Promise<AdminPodcastEpisodeEntity> {
    return this.transitionEpisode('restore', podcastId, episodeId, {
      staffId,
      reason,
      ...auditContext,
    })
  }

  /** Takes a podcast down or restores it, with its audit row — see {@link runTakeDownTransition}. */
  private transition(
    direction: TakeDownDirection,
    id: string,
    actor: TakeDownActor,
  ): Promise<AdminPodcastEntity> {
    const takeDown = direction === 'take-down'
    return runTakeDownTransition({
      prisma: this.prisma,
      direction,
      current: () => this.prisma.podcast.findFirst({ where: { id }, select: { deletedAt: true } }),
      mark: (tx, guard, data) => tx.podcast.updateMany({ where: { id, ...guard }, data }),
      load: async (tx) =>
        this.toRow(
          await tx.podcast.findFirstOrThrow({ where: { id }, select: PODCAST_ROW_SELECT }),
        ),
      notFound: () => new PodcastNotFoundException(id),
      conflict: () =>
        takeDown ? new PodcastAlreadyDeletedException(id) : new PodcastNotDeletedException(id),
      audit: { entityType: 'admin-podcasts', entityId: id, ...actor },
    })
  }

  /** Takes one episode of `podcastId` down or restores it — another podcast's episode is a 404. */
  private transitionEpisode(
    direction: TakeDownDirection,
    podcastId: string,
    episodeId: string,
    actor: TakeDownActor,
  ): Promise<AdminPodcastEpisodeEntity> {
    const takeDown = direction === 'take-down'
    const where = { id: episodeId, podcastId }
    return runTakeDownTransition({
      prisma: this.prisma,
      direction,
      current: () => this.prisma.episode.findFirst({ where, select: { deletedAt: true } }),
      mark: (tx, guard, data) => tx.episode.updateMany({ where: { ...where, ...guard }, data }),
      load: async (tx) =>
        this.toEpisodeRow(await tx.episode.findFirstOrThrow({ where, select: EPISODE_ROW_SELECT })),
      notFound: () => new EpisodeNotFoundException(episodeId),
      conflict: () =>
        takeDown
          ? new EpisodeAlreadyDeletedException(episodeId)
          : new EpisodeNotDeletedException(episodeId),
      audit: { entityType: 'admin-podcast-episodes', entityId: episodeId, ...actor },
    })
  }
}
