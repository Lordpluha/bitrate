import { normalizePagination } from '@common/pagination'
import { PrismaService } from '@infra/prisma/prisma.service'
import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common'
import { type Prisma, ReleaseTaskStatus } from '@prisma/client'
import type {
  CreateReleaseTaskDto,
  DeleteReleaseTaskDto,
  ListArtistTasksDto,
  UpdateReleaseTaskDto,
} from './dtos/release-task.dto'
import { RELEASE_ERRORS } from './errors'

/** Upper bound on the tasks one release lists; a planning checklist never needs more. */
const MAX_TASKS_PER_RELEASE = 200

const TASK_SELECT = {
  id: true,
  releaseId: true,
  title: true,
  notes: true,
  status: true,
  dueAt: true,
  completedAt: true,
  createdAt: true,
  updatedAt: true,
  assignee: { select: { id: true, displayName: true } },
} as const satisfies Prisma.ReleaseTaskSelect

/** Open work first, then the nearest deadline, undated tasks last. */
const TASK_ORDER = [
  { status: 'asc' },
  { dueAt: { sort: 'asc', nulls: 'last' } },
  { createdAt: 'asc' },
  { id: 'asc' },
] as const satisfies Prisma.ReleaseTaskOrderByWithRelationInput[]

/**
 * Preparation tasks on an owned release. Tasks are planning notes, not release data: they
 * stay editable after submission and never change the release version or its confirmations.
 * Each task carries its own version for conflict detection.
 */
@Injectable()
export class ReleaseTasksService {
  constructor(private readonly prisma: PrismaService) {}

  async list(ownerArtistId: string, releaseId: string) {
    await this.ownedRelease(ownerArtistId, releaseId)
    const where = { releaseId }
    const [data, total] = await Promise.all([
      this.prisma.releaseTask.findMany({
        where,
        select: TASK_SELECT,
        orderBy: [...TASK_ORDER],
        take: MAX_TASKS_PER_RELEASE,
      }),
      this.prisma.releaseTask.count({ where }),
    ])
    return { data, total }
  }

  async create(ownerArtistId: string, releaseId: string, input: CreateReleaseTaskDto) {
    await this.ownedRelease(ownerArtistId, releaseId)
    if (input.assigneeContributorId) {
      await this.assertAssignee(releaseId, input.assigneeContributorId)
    }
    return this.prisma.releaseTask.create({
      data: {
        releaseId,
        title: input.title,
        notes: input.notes ?? null,
        dueAt: input.dueAt ? new Date(input.dueAt) : null,
        assigneeContributorId: input.assigneeContributorId ?? null,
      },
      select: TASK_SELECT,
    })
  }

  async update(
    ownerArtistId: string,
    releaseId: string,
    taskId: string,
    input: UpdateReleaseTaskDto,
  ) {
    await this.ownedRelease(ownerArtistId, releaseId)
    if (input.assigneeContributorId) {
      await this.assertAssignee(releaseId, input.assigneeContributorId)
    }
    const expected = new Date(input.expectedUpdatedAt)
    const [task] = await this.prisma.releaseTask.updateManyAndReturn({
      where: { id: taskId, releaseId, updatedAt: expected },
      data: {
        ...(input.title === undefined ? {} : { title: input.title }),
        ...(input.notes === undefined ? {} : { notes: input.notes }),
        ...(input.dueAt === undefined
          ? {}
          : { dueAt: input.dueAt === null ? null : new Date(input.dueAt) }),
        ...(input.assigneeContributorId === undefined
          ? {}
          : { assigneeContributorId: input.assigneeContributorId }),
        ...(input.status === undefined
          ? {}
          : {
              status: input.status,
              completedAt: input.status === ReleaseTaskStatus.DONE ? new Date() : null,
            }),
        updatedAt: new Date(Math.max(Date.now(), expected.getTime() + 1)),
      },
      select: { id: true },
    })
    if (!task) await this.missOrConflict(releaseId, taskId)
    return this.read(releaseId, taskId)
  }

  async remove(
    ownerArtistId: string,
    releaseId: string,
    taskId: string,
    input: DeleteReleaseTaskDto,
  ) {
    await this.ownedRelease(ownerArtistId, releaseId)
    const { count } = await this.prisma.releaseTask.deleteMany({
      where: { id: taskId, releaseId, updatedAt: new Date(input.expectedUpdatedAt) },
    })
    if (count === 0) await this.missOrConflict(releaseId, taskId)
    return { id: taskId }
  }

  /** Every task across the artist's active releases, with totals per status for the filters. */
  async listForArtist(ownerArtistId: string, input: ListArtistTasksDto) {
    const { page, limit, skip } = normalizePagination(input.page, input.limit)
    const owned = { release: { ownerArtistId, deletedAt: null } }
    const where: Prisma.ReleaseTaskWhereInput = {
      ...owned,
      ...(input.status === undefined
        ? {}
        : input.status === 'OPEN'
          ? { status: { not: ReleaseTaskStatus.DONE } }
          : { status: input.status }),
    }
    const now = new Date()
    const [data, total, grouped, overdue] = await Promise.all([
      this.prisma.releaseTask.findMany({
        where,
        select: {
          ...TASK_SELECT,
          release: { select: { id: true, title: true, status: true } },
        },
        orderBy: [...TASK_ORDER],
        skip,
        take: limit,
      }),
      this.prisma.releaseTask.count({ where }),
      this.prisma.releaseTask.groupBy({ by: ['status'], where: owned, _count: { _all: true } }),
      this.prisma.releaseTask.count({
        where: { ...owned, status: { not: ReleaseTaskStatus.DONE }, dueAt: { lt: now } },
      }),
    ])
    const counts = { TODO: 0, IN_PROGRESS: 0, DONE: 0, overdue }
    for (const group of grouped) counts[group.status] = group._count._all
    return { data, total, page, limit, counts }
  }

  private async read(releaseId: string, taskId: string) {
    const task = await this.prisma.releaseTask.findFirst({
      where: { id: taskId, releaseId },
      select: TASK_SELECT,
    })
    if (!task) throw new NotFoundException(RELEASE_ERRORS.TASK_NOT_FOUND)
    return task
  }

  private async ownedRelease(ownerArtistId: string, releaseId: string) {
    const release = await this.prisma.release.findFirst({
      where: { id: releaseId, ownerArtistId, deletedAt: null },
      select: { id: true },
    })
    if (!release) throw new NotFoundException(RELEASE_ERRORS.NOT_FOUND)
  }

  private async assertAssignee(releaseId: string, contributorId: string) {
    const credited = await this.prisma.releaseContributor.findFirst({
      where: { id: contributorId, releaseId },
      select: { id: true },
    })
    if (!credited) throw new BadRequestException(RELEASE_ERRORS.TASK_ASSIGNEE_INVALID)
  }

  /** A versioned write that matched nothing: the task is gone (404) or changed meanwhile (409). */
  private async missOrConflict(releaseId: string, taskId: string): Promise<never> {
    const exists = await this.prisma.releaseTask.findFirst({
      where: { id: taskId, releaseId },
      select: { id: true },
    })
    if (!exists) throw new NotFoundException(RELEASE_ERRORS.TASK_NOT_FOUND)
    throw new ConflictException(RELEASE_ERRORS.TASK_CHANGED)
  }
}
