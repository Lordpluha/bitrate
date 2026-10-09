import { PrismaService } from '@infra/prisma/prisma.service'
import { Injectable, NotFoundException } from '@nestjs/common'
import {
  ArtistNotificationCategory,
  type DeliveryDestination,
  DeliveryState,
  ReleaseStatus,
  ReleaseTaskStatus,
} from '@prisma/client'
import type { UpdateNotificationPreferencesDto } from './dtos/notification-preferences.dto'
import { RELEASE_ERRORS } from './errors'

/** Newest items shown; older activity stays reachable from Music and Tasks. */
const NOTIFICATION_LIMIT = 30
/** How far ahead a deadline counts as "due soon". */
const DUE_SOON_MS = 48 * 60 * 60 * 1000
/** How far back status updates are reported. */
const UPDATE_WINDOW_MS = 30 * 24 * 60 * 60 * 1000

type NotificationKind =
  | 'TASK_OVERDUE'
  | 'TASK_DUE_SOON'
  | 'CHANGES_REQUESTED'
  | 'DELIVERY_FAILED'
  | 'RELEASE_SUBMITTED'
  | 'RELEASE_APPROVED'
  | 'RELEASE_RELEASED'
  | 'DELIVERY_LIVE'

/** Which switchable category each derived notification belongs to. */
const CATEGORY_OF = {
  TASK_OVERDUE: ArtistNotificationCategory.TASKS,
  TASK_DUE_SOON: ArtistNotificationCategory.TASKS,
  CHANGES_REQUESTED: ArtistNotificationCategory.REVIEW,
  RELEASE_SUBMITTED: ArtistNotificationCategory.REVIEW,
  RELEASE_APPROVED: ArtistNotificationCategory.REVIEW,
  DELIVERY_FAILED: ArtistNotificationCategory.DELIVERY,
  RELEASE_RELEASED: ArtistNotificationCategory.DELIVERY,
  DELIVERY_LIVE: ArtistNotificationCategory.DELIVERY,
} as const satisfies Record<NotificationKind, ArtistNotificationCategory>

interface ArtistNotification {
  id: string
  kind: NotificationKind
  actionRequired: boolean
  releaseId: string
  releaseTitle: string
  /** Set for task notifications. */
  taskTitle?: string
  /** Set for delivery notifications. */
  destination?: DeliveryDestination
  at: Date
}

/**
 * Notifications derived from saved state rather than stored events, so they can never
 * disagree with it: an overdue task stops notifying once done, a fixed delivery once live.
 * Only the "seen" time is stored, which decides what reads as unread.
 */
@Injectable()
export class ArtistNotificationsService {
  constructor(private readonly prisma: PrismaService) {}

  async list(artistId: string) {
    const artist = await this.prisma.artist.findFirst({
      where: { id: artistId, deletedAt: null },
      select: {
        notificationState: { select: { seenAt: true } },
        notificationPreference: { select: { mutedInApp: true } },
      },
    })
    if (!artist) throw new NotFoundException(RELEASE_ERRORS.NOT_FOUND)
    const muted = new Set(artist.notificationPreference?.mutedInApp ?? [])
    const none = <T>(): Promise<T[]> => Promise.resolve([])
    const now = new Date()
    const since = new Date(now.getTime() - UPDATE_WINDOW_MS)
    const owned = { ownerArtistId: artistId, deletedAt: null }
    const release = { select: { id: true, title: true } }

    // A switched-off category is not queried at all.
    const [tasks, releases, deliveries] = await Promise.all([
      muted.has(ArtistNotificationCategory.TASKS)
        ? none<never>()
        : this.prisma.releaseTask.findMany({
            where: {
              release: owned,
              status: { not: ReleaseTaskStatus.DONE },
              dueAt: { not: null, lt: new Date(now.getTime() + DUE_SOON_MS) },
            },
            orderBy: { dueAt: 'asc' },
            take: NOTIFICATION_LIMIT,
            select: { id: true, title: true, dueAt: true, release },
          }),
      muted.has(ArtistNotificationCategory.REVIEW) && muted.has(ArtistNotificationCategory.DELIVERY)
        ? none<never>()
        : this.prisma.release.findMany({
            where: {
              ...owned,
              OR: [
                { status: ReleaseStatus.REJECTED },
                { status: { not: ReleaseStatus.DRAFT }, updatedAt: { gte: since } },
              ],
            },
            orderBy: { updatedAt: 'desc' },
            take: NOTIFICATION_LIMIT,
            select: { id: true, title: true, status: true, submittedAt: true, updatedAt: true },
          }),
      muted.has(ArtistNotificationCategory.DELIVERY)
        ? none<never>()
        : this.prisma.releaseDelivery.findMany({
            where: {
              release: owned,
              OR: [
                { state: DeliveryState.FAILED },
                { state: DeliveryState.LIVE, updatedAt: { gte: since } },
              ],
            },
            orderBy: { updatedAt: 'desc' },
            take: NOTIFICATION_LIMIT,
            select: { releaseId: true, destination: true, state: true, updatedAt: true, release },
          }),
    ])

    const items: ArtistNotification[] = []
    for (const task of tasks) {
      if (!task.dueAt) continue
      const overdue = task.dueAt < now
      items.push({
        id: `task-${task.id}-${overdue ? 'overdue' : 'soon'}`,
        kind: overdue ? 'TASK_OVERDUE' : 'TASK_DUE_SOON',
        actionRequired: true,
        taskTitle: task.title,
        releaseId: task.release.id,
        releaseTitle: task.release.title,
        // A due-soon task notifies from the moment it entered the 48-hour window.
        at: overdue ? task.dueAt : new Date(task.dueAt.getTime() - DUE_SOON_MS),
      })
    }
    for (const item of releases) {
      const base = { releaseId: item.id, releaseTitle: item.title }
      switch (item.status) {
        case ReleaseStatus.REJECTED:
          items.push({
            ...base,
            id: `release-${item.id}-rejected`,
            kind: 'CHANGES_REQUESTED',
            actionRequired: true,
            at: item.updatedAt,
          })
          break
        case ReleaseStatus.SUBMITTED:
          items.push({
            ...base,
            id: `release-${item.id}-submitted`,
            kind: 'RELEASE_SUBMITTED',
            actionRequired: false,
            at: item.submittedAt ?? item.updatedAt,
          })
          break
        case ReleaseStatus.READY:
          items.push({
            ...base,
            id: `release-${item.id}-approved`,
            kind: 'RELEASE_APPROVED',
            actionRequired: false,
            at: item.updatedAt,
          })
          break
        case ReleaseStatus.RELEASED:
          items.push({
            ...base,
            id: `release-${item.id}-released`,
            kind: 'RELEASE_RELEASED',
            actionRequired: false,
            at: item.updatedAt,
          })
          break
      }
    }
    for (const delivery of deliveries) {
      const failed = delivery.state === DeliveryState.FAILED
      items.push({
        id: `delivery-${delivery.releaseId}-${delivery.destination}-${delivery.state}`,
        kind: failed ? 'DELIVERY_FAILED' : 'DELIVERY_LIVE',
        actionRequired: failed,
        destination: delivery.destination,
        releaseId: delivery.release.id,
        releaseTitle: delivery.release.title,
        at: delivery.updatedAt,
      })
    }

    const visible = items.filter((item) => !muted.has(CATEGORY_OF[item.kind]))
    visible.sort((a, b) => b.at.getTime() - a.at.getTime())
    const data = visible.slice(0, NOTIFICATION_LIMIT)
    const seenAt = artist.notificationState?.seenAt ?? null
    return {
      data: data.map((item) => ({ ...item, unread: seenAt === null || item.at > seenAt })),
      unread: data.filter((item) => seenAt === null || item.at > seenAt).length,
      seenAt,
    }
  }

  /** Marks everything derived up to now as read. */
  async markSeen(artistId: string) {
    const seenAt = new Date()
    await this.prisma.artistNotificationState.upsert({
      where: { artistId },
      create: { artistId, seenAt },
      update: { seenAt },
    })
    return { seenAt }
  }

  async preferences(artistId: string) {
    const preference = await this.prisma.artistNotificationPreference.findUnique({
      where: { artistId },
      select: { mutedInApp: true },
    })
    return { mutedInApp: preference?.mutedInApp ?? [] }
  }

  /** Replaces the switched-off categories; the list is the whole preference. */
  async updatePreferences(artistId: string, input: UpdateNotificationPreferencesDto) {
    const { mutedInApp } = await this.prisma.artistNotificationPreference.upsert({
      where: { artistId },
      create: { artistId, mutedInApp: input.mutedInApp },
      update: { mutedInApp: input.mutedInApp },
      select: { mutedInApp: true },
    })
    return { mutedInApp }
  }
}
