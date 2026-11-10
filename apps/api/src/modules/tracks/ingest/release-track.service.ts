import { randomUUID } from 'node:crypto'
import { rm, stat } from 'node:fs/promises'
import { extname, join } from 'node:path'
import { rightsConfirmationRecord } from '@common/rights-confirmation'
import { CacheService } from '@infra/cache/cache.service'
import { PrismaService } from '@infra/prisma/prisma.service'
import { STORAGE_SERVICE } from '@infra/storage/storage.constants'
import type { StorageService } from '@infra/storage/storage.types'
import type { ArtistEntity } from '@modules/artists'
import { Inject, Injectable, Logger } from '@nestjs/common'
import type { Prisma } from '@prisma/client'
import {
  AudioConversionProducer,
  type EnqueueConversionInput,
  toInputProbe,
} from '../processing/audio-conversion.producer'
import { downloadObjectToFile, storeMaster } from '../shared/audio-master'
import { getUploadTempDir } from '../shared/audio-scratch'
import { getMasterKey } from '../shared/audio-storage-keys'
import { deleteObjectQuietly } from '../shared/storage-cleanup'
import { getTargetBitrates } from '../shared/track-audio.helpers'
import { type AudioMetadata, inspectAudioFile } from '../shared/track-media'
import { invalidateTrackCaches } from './track-caches'

/** One recording of an approved release, as the release workflow hands it to the catalogue. */
export type ReleaseRecordingInput = {
  title: string
  duration: number | null
  isrc: string | null
  /** The release draft's private master; it is copied, never moved. */
  sourceKey: string
  contentType: string
  /** Credited Bitrate artists other than the owner, in credit order. */
  featuredArtistIds: string[]
  /** Catalogue genres the artist chose for the recording. */
  genreIds: string[]
}

/** A created, still unpublished release track and the conversion that makes it playable. */
export type PendingReleaseTrack = { trackId: string; conversion: EnqueueConversionInput }

/** Writes the caller's link to a new release track in the transaction that creates it. */
export type AttachReleaseTrack = (tx: Prisma.TransactionClient, trackId: string) => Promise<unknown>

/**
 * The catalogue side of a release: creates its tracks from the release masters, starts their
 * conversion and publishes or hides them when the release goes live or is withdrawn (ADR-0062).
 */
@Injectable()
export class ReleaseTrackService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly cache: CacheService,
    private readonly conversions: AudioConversionProducer,
    @Inject(STORAGE_SERVICE) private readonly storage: StorageService,
  ) {}

  private readonly logger = new Logger(ReleaseTrackService.name, { timestamp: true })

  /**
   * Creates an unpublished catalogue track from a release master: the master is copied to the
   * track pipeline's location, the track row and the caller's link (`attach`) are written in one
   * transaction, and listeners see nothing until {@link publishReleaseTracks}. The conversion is
   * returned instead of queued, so the caller starts it only once the whole release exists.
   */
  async createReleaseTrack(
    artistId: ArtistEntity['id'],
    cover: string | null,
    recording: ReleaseRecordingInput,
    attach: AttachReleaseTrack,
  ): Promise<PendingReleaseTrack> {
    const sourceFileName = `${randomUUID()}${extname(recording.sourceKey)}`
    const tempPath = join(getUploadTempDir(), `release-${sourceFileName}`)
    let metadata: AudioMetadata
    let bytes: number
    try {
      await downloadObjectToFile(this.storage, recording.sourceKey, tempPath)
      const [read, file] = await Promise.all([inspectAudioFile(tempPath), stat(tempPath)])
      metadata = read
      bytes = file.size
      await storeMaster({
        storage: this.storage,
        key: getMasterKey(sourceFileName),
        filePath: tempPath,
        contentType: recording.contentType,
      })
    } finally {
      await rm(tempPath, { force: true })
    }
    try {
      const trackId = await this.prisma.$transaction(async (tx) => {
        const track = await tx.track.create({
          data: {
            artistId,
            title: recording.title,
            audioUrl: sourceFileName,
            cover,
            duration: recording.duration ?? metadata.duration,
            isrc: recording.isrc,
            ...rightsConfirmationRecord(),
            processingStatus: 'PROCESSING',
            publishedAt: null,
            artists: {
              create: [artistId, ...recording.featuredArtistIds].map((id, position) => ({
                artistId: id,
                position,
                isPrimary: position === 0,
              })),
            },
            genres: { create: recording.genreIds.map((genreId) => ({ genreId })) },
          },
          select: { id: true },
        })
        await attach(tx, track.id)
        return track.id
      })
      return {
        trackId,
        conversion: {
          trackId,
          artistId,
          sourceFileName,
          bitrates: getTargetBitrates(metadata.bitrate),
          trigger: 'UPLOAD',
          input: toInputProbe(metadata, bytes),
        },
      }
    } catch (error) {
      await deleteObjectQuietly(this.storage, getMasterKey(sourceFileName), this.logger)
      throw error
    }
  }

  /** Queues the conversion of a track made by {@link createReleaseTrack}. */
  async startReleaseConversion(conversion: EnqueueConversionInput) {
    await this.conversions.enqueue(conversion)
  }

  /**
   * Makes converted release tracks visible to listeners at `publishedAt`, inside the caller's
   * transaction. Returns how many tracks were published; callers drop caches after commit.
   */
  async publishReleaseTracks(
    tx: Prisma.TransactionClient,
    trackIds: string[],
    publishedAt: Date,
  ): Promise<number> {
    const published = await tx.track.updateMany({
      where: {
        id: { in: trackIds },
        processingStatus: 'READY',
        deletedAt: null,
        moderationBlockedAt: null,
      },
      data: { publishedAt },
    })
    return published.count
  }

  /** Hides a release's tracks from listeners inside the caller's transaction; files are kept. */
  async hideReleaseTracks(tx: Prisma.TransactionClient, trackIds: string[]): Promise<void> {
    await tx.track.updateMany({
      where: {
        id: { in: trackIds },
        releases: { none: { release: { deletedAt: null, status: 'RELEASED' } } },
      },
      data: { publishedAt: null },
    })
  }

  /** Restores approved recordings still shared by another live release. */
  async restoreSharedReleaseTracks(tx: Prisma.TransactionClient, trackIds: string[], at: Date) {
    if (trackIds.length === 0) return
    await tx.track.updateMany({
      where: {
        id: { in: trackIds },
        deletedAt: null,
        moderationBlockedAt: null,
        processingStatus: 'READY',
        publishedAt: null,
      },
      data: { publishedAt: at },
    })
  }

  /** A moderation withdrawal blocks the recording across every compilation. */
  async blockReleaseTracks(tx: Prisma.TransactionClient, trackIds: string[]) {
    if (trackIds.length === 0) return
    await tx.track.updateMany({
      where: { id: { in: trackIds } },
      data: { moderationBlockedAt: new Date(), publishedAt: null },
    })
  }

  /** Drops track and search caches after a release changed what listeners can see. */
  async invalidateCatalogueCaches() {
    await invalidateTrackCaches(this.cache)
  }
}
