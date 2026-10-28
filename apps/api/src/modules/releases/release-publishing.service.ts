import { PrismaService } from '@infra/prisma/prisma.service'
import {
  RELEASE_PUBLISHING_JOB_OPTIONS,
  RELEASE_PUBLISHING_JOBS,
  RELEASE_PUBLISHING_QUEUE,
  type ReleasePublishJob,
} from '@infra/queues/release-publishing.queue'
import { AlbumsService } from '@modules/albums/albums.service'
import { NotificationsProducer } from '@modules/notifications'
import { type PendingReleaseTrack, TrackUploadService } from '@modules/tracks/track-upload.service'
import { InjectQueue } from '@nestjs/bullmq'
import {
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
  type OnApplicationBootstrap,
} from '@nestjs/common'
import { type Prisma, ReleaseStatus, ReleaseUnpublishedBy } from '@prisma/client'
import type { Queue } from 'bullmq'
import type { ReleaseDraftVersionDto } from './dtos/release-media.dto'
import { RELEASE_ERRORS } from './errors'
import { RELEASE_SUMMARY_SELECT } from './releases.select'

/** What turning a release into catalogue tracks reads. */
const PUBLISH_SOURCE_SELECT = {
  ownerArtistId: true,
  cover: true,
  trackDrafts: {
    where: { deletedAt: null },
    orderBy: [{ position: 'asc' }, { createdAt: 'asc' }, { id: 'asc' }],
    select: {
      title: true,
      duration: true,
      isrc: true,
      audioKey: true,
      audioContentType: true,
    },
  },
  contributors: { orderBy: { id: 'asc' }, select: { artistId: true } },
  tracks: {
    select: { position: true, track: { select: { id: true, processingStatus: true } } },
  },
} satisfies Prisma.ReleaseSelect

/** A premiere job may fire this early (clock skew between hosts) and still publish. */
const PREMIERE_EARLY_MS = 5_000

/** One delayed job per release and premiere time, so a re-queue never duplicates it. */
const premiereJobId = (releaseId: string, at: Date | null) =>
  `release-premiere-${releaseId}-${at?.getTime() ?? 0}`

const messageOf = (error: unknown) => (error instanceof Error ? error.message : String(error))

/** An artist-initiated status change, and what it does to listener visibility. */
type ReleaseTransition = {
  from: ReleaseStatus
  to: ReleaseStatus
  conflict: string
  requireUnpublishedBy?: ReleaseUnpublishedBy
  /** Set to change who took the release offline; null clears it. */
  unpublishedBy?: ReleaseUnpublishedBy | null
  /** Set to show (a date) or hide (null) the tracks and album; left out, visibility stays. */
  visibleAt?: Date | null
}

/**
 * Takes an approved release live on Bitrate.
 *
 * Publishing claims the release (READY -> PUBLISHING) and queues a job; the job copies each master
 * into the catalogue as an unpublished track and only then starts every conversion, so a finished
 * conversion always sees the complete set. Each finished conversion re-checks the release: when
 * every track is READY, one transaction publishes the tracks, creates the album and marks the
 * release RELEASED; a track that failed for good makes it PUBLISH_FAILED until Bitrate retries.
 */
@Injectable()
export class ReleasePublishingService implements OnApplicationBootstrap {
  private readonly logger = new Logger(ReleasePublishingService.name)

  constructor(
    private readonly prisma: PrismaService,
    private readonly tracks: TrackUploadService,
    private readonly albums: AlbumsService,
    private readonly notifications: NotificationsProducer,
    @InjectQueue(RELEASE_PUBLISHING_QUEUE) private readonly queue: Queue<ReleasePublishJob>,
  ) {}

  /** Queues premieres whose delayed job was lost, for example while Redis was down. */
  async onApplicationBootstrap() {
    const due = await this.prisma.release.findMany({
      where: { deletedAt: null, status: ReleaseStatus.SCHEDULED, scheduledAt: { lte: new Date() } },
      select: { id: true, scheduledAt: true },
    })
    for (const { id, scheduledAt } of due) {
      try {
        await this.queue.add(
          RELEASE_PUBLISHING_JOBS.PUBLISH,
          { releaseId: id },
          { ...RELEASE_PUBLISHING_JOB_OPTIONS, jobId: premiereJobId(id, scheduledAt) },
        )
      } catch (error) {
        this.logger.warn(`Could not queue the missed premiere of ${id}: ${messageOf(error)}`)
      }
    }
  }

  /**
   * The owner publishes an approved release: right away, or as a premiere when its timing is
   * still ahead. The version guard keeps the timing read here the one that is published.
   */
  async publish(ownerArtistId: string, id: string, input: ReleaseDraftVersionDto) {
    const timing = await this.prisma.release.findFirst({
      where: { id, ownerArtistId, deletedAt: null },
      select: { scheduledAt: true },
    })
    if (!timing) throw new NotFoundException(RELEASE_ERRORS.NOT_FOUND)
    const premiere =
      timing.scheduledAt && timing.scheduledAt.getTime() > Date.now() ? timing.scheduledAt : null
    const [claimed] = await this.prisma.release.updateManyAndReturn({
      where: {
        id,
        ownerArtistId,
        deletedAt: null,
        status: ReleaseStatus.READY,
        updatedAt: new Date(input.expectedUpdatedAt),
      },
      data: { status: premiere ? ReleaseStatus.SCHEDULED : ReleaseStatus.PUBLISHING },
      select: RELEASE_SUMMARY_SELECT,
    })
    if (!claimed) throw new ConflictException(RELEASE_ERRORS.CHANGED_OR_NOT_APPROVED)
    await this.enqueueOrRelease(id, ReleaseStatus.READY, premiere)
    return claimed
  }

  /** The owner calls off a premiere; the release is approved again and its timing editable. */
  cancelPremiere(ownerArtistId: string, id: string, input: ReleaseDraftVersionDto) {
    return this.transition(ownerArtistId, id, input, {
      from: ReleaseStatus.SCHEDULED,
      to: ReleaseStatus.READY,
      conflict: RELEASE_ERRORS.CHANGED_OR_NOT_SCHEDULED,
    })
  }

  /** The owner takes a live release offline; listeners can no longer find or play it. */
  unpublish(ownerArtistId: string, id: string, input: ReleaseDraftVersionDto) {
    return this.transition(ownerArtistId, id, input, {
      from: ReleaseStatus.RELEASED,
      to: ReleaseStatus.UNPUBLISHED,
      conflict: RELEASE_ERRORS.CHANGED_OR_NOT_LIVE,
      unpublishedBy: ReleaseUnpublishedBy.ARTIST,
      visibleAt: null,
    })
  }

  /** The owner brings back a release they took offline; no new review, no new notification. */
  republish(ownerArtistId: string, id: string, input: ReleaseDraftVersionDto) {
    return this.transition(ownerArtistId, id, input, {
      from: ReleaseStatus.UNPUBLISHED,
      to: ReleaseStatus.RELEASED,
      conflict: RELEASE_ERRORS.CHANGED_OR_NOT_UNPUBLISHED,
      // Bitrate's takedown stays in place until Bitrate lifts it.
      requireUnpublishedBy: ReleaseUnpublishedBy.ARTIST,
      unpublishedBy: null,
      visibleAt: new Date(),
    })
  }

  /** Bitrate takes a live (or artist-hidden) release offline; the artist cannot undo it. */
  async takeDown(id: string) {
    const release = await this.prisma.$transaction(async (tx) => {
      const [claimed] = await tx.release.updateManyAndReturn({
        where: {
          id,
          deletedAt: null,
          status: { in: [ReleaseStatus.RELEASED, ReleaseStatus.UNPUBLISHED] },
        },
        data: { status: ReleaseStatus.UNPUBLISHED, unpublishedBy: ReleaseUnpublishedBy.ADMIN },
        select: RELEASE_SUMMARY_SELECT,
      })
      if (!claimed) throw new ConflictException(RELEASE_ERRORS.CHANGED_OR_NOT_LIVE)
      await this.setVisibility(tx, id, null)
      return claimed
    })
    await this.dropCatalogueCaches()
    return release
  }

  /** Bitrate retries a release whose publishing failed; already converted tracks are kept. */
  async retry(id: string) {
    const [claimed] = await this.prisma.release.updateManyAndReturn({
      where: { id, deletedAt: null, status: ReleaseStatus.PUBLISH_FAILED },
      data: { status: ReleaseStatus.PUBLISHING },
      select: RELEASE_SUMMARY_SELECT,
    })
    if (!claimed) throw new ConflictException(RELEASE_ERRORS.NOT_PUBLISH_FAILED)
    await this.enqueueOrRelease(id, ReleaseStatus.PUBLISH_FAILED)
    return claimed
  }

  /**
   * Creates the release's missing catalogue tracks, then starts their conversions. Safe to run
   * again: existing tracks are reused, and failed or unfinished ones are converted again.
   */
  async materialize(releaseId: string) {
    await this.startPremiere(releaseId)
    const release = await this.prisma.release.findFirst({
      where: { id: releaseId, deletedAt: null, status: ReleaseStatus.PUBLISHING },
      select: PUBLISH_SOURCE_SELECT,
    })
    if (!release) return
    // `ReleaseTrack.position` is the 1-based track number; drafts are indexed from 0.
    const existing = new Map(release.tracks.map(({ position, track }) => [position - 1, track]))
    const featuredArtistIds = [
      ...new Set(
        release.contributors.flatMap(({ artistId }) =>
          artistId && artistId !== release.ownerArtistId ? [artistId] : [],
        ),
      ),
    ]
    const created: PendingReleaseTrack[] = []
    const restart: string[] = []
    for (const [position, draft] of release.trackDrafts.entries()) {
      const track = existing.get(position)
      if (track) {
        if (track.processingStatus !== 'READY') restart.push(track.id)
        continue
      }
      // Submission requires audio on every recording; a missing master is a data error.
      if (!(draft.audioKey && draft.audioContentType)) {
        throw new Error(`Release ${releaseId} has a recording without audio at ${position}`)
      }
      created.push(
        await this.tracks.createReleaseTrack(
          release.ownerArtistId,
          release.cover,
          {
            title: draft.title,
            duration: draft.duration,
            isrc: draft.isrc,
            sourceKey: draft.audioKey,
            contentType: draft.audioContentType,
            featuredArtistIds,
          },
          (tx, trackId) =>
            tx.releaseTrack.create({ data: { releaseId, trackId, position: position + 1 } }),
        ),
      )
    }
    for (const { conversion } of created) await this.tracks.startReleaseConversion(conversion)
    for (const trackId of restart) await this.tracks.reprocess(trackId)
    await this.complete(releaseId)
  }

  /** A conversion finished; re-checks the release that owns the track, if any. */
  async trackSettled(trackId: string) {
    const link = await this.prisma.releaseTrack.findFirst({
      where: { trackId },
      select: { releaseId: true },
    })
    if (link) await this.complete(link.releaseId)
  }

  /** Marks a publishing release failed after its job gave up; a no-op once it moved on. */
  async markFailed(releaseId: string) {
    await this.prisma.release.updateMany({
      where: { id: releaseId, deletedAt: null, status: ReleaseStatus.PUBLISHING },
      data: { status: ReleaseStatus.PUBLISH_FAILED },
    })
  }

  /**
   * Publishes the release once every track converted, or fails it when one failed for good.
   * Waits while tracks are still missing or converting. Concurrent calls publish at most once:
   * the status claim is the transaction's first write.
   */
  private async complete(releaseId: string) {
    const release = await this.prisma.release.findFirst({
      where: { id: releaseId, deletedAt: null, status: ReleaseStatus.PUBLISHING },
      select: {
        ownerArtistId: true,
        title: true,
        type: true,
        cover: true,
        _count: { select: { trackDrafts: { where: { deletedAt: null } } } },
        tracks: {
          orderBy: { position: 'asc' },
          select: { trackId: true, track: { select: { processingStatus: true } } },
        },
      },
    })
    if (!release || release.tracks.length !== release._count.trackDrafts) return
    if (release.tracks.some(({ track }) => track.processingStatus === 'FAILED')) {
      await this.markFailed(releaseId)
      return
    }
    if (!release.tracks.every(({ track }) => track.processingStatus === 'READY')) return

    const trackIds = release.tracks.map(({ trackId }) => trackId)
    const publishedAt = new Date()
    const albumId = await this.prisma.$transaction(async (tx) => {
      const claimed = await tx.release.updateMany({
        where: { id: releaseId, deletedAt: null, status: ReleaseStatus.PUBLISHING },
        data: { status: ReleaseStatus.RELEASED, publishedAt, unpublishedBy: null },
      })
      if (claimed.count !== 1) return null
      const published = await this.tracks.publishReleaseTracks(tx, trackIds, publishedAt)
      // A track deleted or reconverted meanwhile rolls everything back; the next event retries.
      if (published !== trackIds.length)
        throw new Error(`Release ${releaseId} changed while publishing`)
      const album = await this.albums.createForRelease(tx, {
        artistId: release.ownerArtistId,
        title: release.title,
        type: release.type,
        cover: release.cover,
        publishedAt,
        trackIds,
      })
      await tx.release.update({ where: { id: releaseId }, data: { albumId: album } })
      return album
    })
    if (!albumId) return
    this.logger.log(`Release ${releaseId} is live as album ${albumId}`)
    await this.dropCatalogueCaches()
    try {
      await this.notifications.releasePublished({ albumId })
    } catch (error) {
      this.logger.warn(
        `Could not queue the release notification for ${releaseId}: ${messageOf(error)}`,
      )
    }
  }

  /**
   * A premiere whose time came starts publishing. A job that fires for a premiere since cancelled
   * or moved later finds nothing to claim and the release stays as it is.
   */
  private async startPremiere(releaseId: string) {
    await this.prisma.release.updateMany({
      where: {
        id: releaseId,
        deletedAt: null,
        status: ReleaseStatus.SCHEDULED,
        scheduledAt: { lte: new Date(Date.now() + PREMIERE_EARLY_MS) },
      },
      data: { status: ReleaseStatus.PUBLISHING },
    })
  }

  /**
   * Queues the publish job, delayed until `premiere` when there is one; when queueing fails the
   * claim is undone so the action can be repeated.
   */
  private async enqueueOrRelease(
    releaseId: string,
    previous: ReleaseStatus,
    premiere: Date | null = null,
  ) {
    try {
      await this.queue.add(
        RELEASE_PUBLISHING_JOBS.PUBLISH,
        { releaseId },
        {
          ...RELEASE_PUBLISHING_JOB_OPTIONS,
          ...(premiere
            ? { jobId: premiereJobId(releaseId, premiere), delay: premiere.getTime() - Date.now() }
            : { jobId: `release-publish-${releaseId}-${Date.now()}` }),
        },
      )
    } catch (error) {
      await this.prisma.release.updateMany({
        where: {
          id: releaseId,
          status: { in: [ReleaseStatus.PUBLISHING, ReleaseStatus.SCHEDULED] },
        },
        data: { status: previous },
      })
      throw error
    }
  }

  /**
   * Moves an owned release `from` -> `to` at the read version, adjusting what listeners see in the
   * same transaction when `visibleAt` is given; a miss is a 404 or the `conflict` 409.
   */
  private async transition(
    ownerArtistId: string,
    id: string,
    input: ReleaseDraftVersionDto,
    change: ReleaseTransition,
  ) {
    const release = await this.prisma.$transaction(async (tx) => {
      const [claimed] = await tx.release.updateManyAndReturn({
        where: {
          id,
          ownerArtistId,
          deletedAt: null,
          status: change.from,
          updatedAt: new Date(input.expectedUpdatedAt),
          ...(change.requireUnpublishedBy ? { unpublishedBy: change.requireUnpublishedBy } : {}),
        },
        data: {
          status: change.to,
          ...(change.unpublishedBy === undefined ? {} : { unpublishedBy: change.unpublishedBy }),
        },
        select: RELEASE_SUMMARY_SELECT,
      })
      if (!claimed) {
        const visible = await tx.release.findFirst({
          where: { id, ownerArtistId, deletedAt: null },
          select: { id: true },
        })
        if (!visible) throw new NotFoundException(RELEASE_ERRORS.NOT_FOUND)
        throw new ConflictException(change.conflict)
      }
      if (change.visibleAt !== undefined) await this.setVisibility(tx, id, change.visibleAt)
      return claimed
    })
    if (change.visibleAt !== undefined) await this.dropCatalogueCaches()
    return release
  }

  /** Shows (`at`) or hides (null) a live release's tracks and album for listeners. */
  private async setVisibility(tx: Prisma.TransactionClient, releaseId: string, at: Date | null) {
    const release = await tx.release.findUniqueOrThrow({
      where: { id: releaseId },
      select: { albumId: true, tracks: { select: { trackId: true } } },
    })
    const trackIds = release.tracks.map(({ trackId }) => trackId)
    if (at) await this.tracks.publishReleaseTracks(tx, trackIds, at)
    else await this.tracks.hideReleaseTracks(tx, trackIds)
    if (release.albumId) await this.albums.setReleaseAlbumVisibility(tx, release.albumId, at)
  }

  private async dropCatalogueCaches() {
    await Promise.all([
      this.tracks.invalidateCatalogueCaches(),
      this.albums.invalidateCatalogueCaches(),
    ])
  }
}
