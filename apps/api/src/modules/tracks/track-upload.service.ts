import { randomUUID } from 'node:crypto'
import { rm, stat } from 'node:fs/promises'
import { extname, join } from 'node:path'
import { RIGHTS_CONFIRMATION_MESSAGE, rightsConfirmationRecord } from '@common/rights-confirmation'
import { resolveSafeMulterPath } from '@common/utils/multer-file'
import { NS } from '@infra/cache/cache.constants'
import { CacheService } from '@infra/cache/cache.service'
import { PrismaService } from '@infra/prisma/prisma.service'
import {
  AUDIO_PROCESSING_JOB_OPTIONS,
  AUDIO_PROCESSING_QUEUE,
  type ConvertAudioJobInputProbe,
} from '@infra/queues/audio-processing.queue'
import {
  removePublicImage,
  storePublicImage,
  validatePublicImage,
} from '@infra/storage/public-images'
import { STORAGE_SERVICE } from '@infra/storage/storage.constants'
import type { StorageService } from '@infra/storage/storage.types'
import type { ArtistEntity } from '@modules/artists'
import { InjectQueue } from '@nestjs/bullmq'
import { BadRequestException, Inject, Injectable, Logger, NotFoundException } from '@nestjs/common'
import type { TrackProcessingTrigger } from '@prisma/client'
import type { Queue } from 'bullmq'
import { downloadObjectToFile, storeMaster } from './audio-master'
import { getUploadTempDir } from './audio-scratch'
import { getMasterKey } from './audio-storage-keys'
import type { CreateTrackDto, UpdateTrackDto } from './dtos'
import type { TrackEntity } from './entities'
import { ProcessingAttemptRecorder } from './processing-attempt.recorder'
import { deleteObjectQuietly } from './storage-cleanup'
import { getTargetBitrates, MAX_COVER_BYTES } from './track-audio.helpers'
import type { AudioMetadata } from './track-media'
import { cleanupUploadedAudio, inspectAudioFile } from './track-media'

/** Where track covers live in storage; the first part of their public `/static/...` URL. */
const COVER_FOLDER = 'tracks/covers'

/** Everything an audio-conversion job needs to transcode one upload. */
type EnqueueConversionInput = {
  trackId: string
  artistId: string
  sourceFileName: string
  bitrates: string[]
  trigger: TrackProcessingTrigger
  input: ConvertAudioJobInputProbe
}

/** Builds the job's input probe from a metadata read plus the source file's byte size. */
function toInputProbe(metadata: AudioMetadata, bytes: number): ConvertAudioJobInputProbe {
  return {
    bytes,
    codec: metadata.codec,
    container: metadata.container,
    bitrateKbps: metadata.bitrate,
    durationSec: metadata.duration,
  }
}

/** Accepts artist uploads, persists them, and queues the transcoding ladder. */
@Injectable()
export class TrackUploadService {
  constructor(
    private readonly prisma: PrismaService,
    @InjectQueue(AUDIO_PROCESSING_QUEUE) private readonly audioQueue: Queue,
    private readonly cache: CacheService,
    private readonly recorder: ProcessingAttemptRecorder,
    @Inject(STORAGE_SERVICE) private readonly storage: StorageService,
  ) {}

  private readonly logger = new Logger(TrackUploadService.name, { timestamp: true })

  /** Queues an audio-conversion job, marking the track FAILED if it cannot be enqueued. */
  private async enqueueAudioConversion({
    trackId,
    artistId,
    sourceFileName,
    bitrates,
    trigger,
    input,
  }: EnqueueConversionInput) {
    const jobId = `convert-audio-${trackId}-${sourceFileName}`
    try {
      await this.audioQueue.add(
        'convert-audio',
        {
          trackId,
          artistId,
          sourceFileName,
          masterKey: getMasterKey(sourceFileName),
          format: 'opus',
          bitrates,
          trigger,
          input,
        },
        { ...AUDIO_PROCESSING_JOB_OPTIONS, jobId },
      )
    } catch (error) {
      await this.prisma.track.update({
        where: { id: trackId },
        data: {
          processingStatus: 'FAILED',
          processingError: error instanceof Error ? error.message : 'Unable to enqueue conversion',
          processingFinishedAt: new Date(),
        },
      })
      await this.recorder.recordEnqueueFailure({ trackId, sourceFileName, jobId, trigger, error })
      throw error
    }
  }

  /** Uploads a Multer-written audio file to storage as the track's master, then removes the temp file. */
  private async storeUploadedMaster(audioFile: Express.Multer.File) {
    await storeMaster({
      storage: this.storage,
      key: getMasterKey(audioFile.filename),
      filePath: resolveSafeMulterPath(audioFile, getUploadTempDir()),
      contentType: audioFile.mimetype,
    })
  }

  /** Uploads a validated, in-memory cover to storage and returns the generated file name. */
  private async storeCover(coverFile: Express.Multer.File) {
    return await storePublicImage(this.storage, COVER_FOLDER, coverFile, {
      maxBytes: MAX_COVER_BYTES,
    })
  }

  /**
   * Uploads the master and the cover side by side. When either upload fails, the one that
   * succeeded is removed again before the failure is rethrown, so nothing is left in storage.
   * @returns the stored cover's generated name, or null without a cover.
   */
  private async storeUploads(
    audioFile: Express.Multer.File | undefined,
    coverFile: Express.Multer.File | undefined,
  ): Promise<string | null> {
    const [master, cover] = await Promise.allSettled([
      audioFile ? this.storeUploadedMaster(audioFile) : undefined,
      coverFile ? this.storeCover(coverFile) : null,
    ])
    if (master.status === 'fulfilled' && cover.status === 'fulfilled') return cover.value
    if (master.status === 'fulfilled' && audioFile) {
      await this.discardStoredMaster(audioFile.filename)
    }
    if (cover.status === 'fulfilled') {
      await removePublicImage(this.storage, COVER_FOLDER, cover.value)
    }
    const failure = [master, cover].find(
      (result): result is PromiseRejectedResult => result.status === 'rejected',
    )
    throw failure?.reason
  }

  /** Best-effort removal of a master uploaded for a track that was never persisted. */
  private async discardStoredMaster(fileName: string) {
    await deleteObjectQuietly(this.storage, getMasterKey(fileName), this.logger)
  }

  /**
   * Downloads a stored master to a temporary file just long enough to probe it and measure its
   * size, then removes it. Probing needs a file path; the master itself lives only in storage.
   */
  private async inspectStoredMaster(masterKey: string, sourceFileName: string) {
    const tempPath = join(getUploadTempDir(), `probe-${randomUUID()}${extname(sourceFileName)}`)
    try {
      await downloadObjectToFile(this.storage, masterKey, tempPath)
      const [metadata, { size }] = await Promise.all([inspectAudioFile(tempPath), stat(tempPath)])
      return { metadata, bytes: size }
    } finally {
      await rm(tempPath, { force: true })
    }
  }

  /** Drops the caches that any newly created or edited track invalidates. */
  private async invalidateTrackCaches() {
    await Promise.all([this.cache.invalidate(NS.TRACKS), this.cache.invalidate(NS.SEARCH)])
  }

  /** Stores a new upload and queues its conversion. */
  async create(
    artistId: ArtistEntity['id'],
    createTrackDto: CreateTrackDto,
    audioFile: Express.Multer.File,
    coverFile?: Express.Multer.File,
  ) {
    let persisted = false
    let masterStored = false
    let coverName: string | null = null
    try {
      if (coverFile) validatePublicImage(coverFile, { maxBytes: MAX_COVER_BYTES })

      const metadata = await inspectAudioFile(resolveSafeMulterPath(audioFile, getUploadTempDir()))
      const bitrates = getTargetBitrates(metadata.bitrate)

      coverName = await this.storeUploads(audioFile, coverFile)
      masterStored = true

      const track = await this.prisma.track.create({
        data: {
          artistId,
          title: createTrackDto.title,
          audioUrl: audioFile.filename,
          cover: coverName,
          duration: metadata.duration,
          ...rightsConfirmationRecord(),
          processingStatus: 'PROCESSING',
          processingError: null,
          processingAttempts: 0,
          processingStartedAt: null,
          processingFinishedAt: null,
        },
      })
      persisted = true

      await this.enqueueAudioConversion({
        trackId: track.id,
        artistId,
        sourceFileName: audioFile.filename,
        bitrates,
        trigger: 'UPLOAD',
        input: toInputProbe(metadata, audioFile.size),
      })
      this.logger.log(`Queued audio conversion for track ID: ${track.id}`)
      await this.invalidateTrackCaches()

      return track
    } catch (error) {
      if (!persisted) {
        await cleanupUploadedAudio(audioFile)
        await removePublicImage(this.storage, COVER_FOLDER, coverName)
        if (masterStored) await this.discardStoredMaster(audioFile.filename)
      }
      throw error
    }
  }

  /** Updates the artist's own track, replacing its audio and/or cover when given. */
  async update(
    artistId: ArtistEntity['id'],
    id: TrackEntity['id'],
    updateTrackDto: UpdateTrackDto,
    audioFile?: Express.Multer.File,
    coverFile?: Express.Multer.File,
  ) {
    let persisted = false
    let masterStored = false
    let coverName: string | undefined
    try {
      const existingTrack = await this.prisma.track.findFirst({
        where: { id, artistId, deletedAt: null },
        select: { audioUrl: true, cover: true },
      })
      if (!existingTrack) {
        throw new NotFoundException('Track not found or does not belong to artist')
      }
      if (audioFile && !updateTrackDto.rightsConfirmed) {
        throw new BadRequestException(RIGHTS_CONFIRMATION_MESSAGE)
      }
      if (coverFile) validatePublicImage(coverFile, { maxBytes: MAX_COVER_BYTES })

      const metadata = audioFile
        ? await inspectAudioFile(resolveSafeMulterPath(audioFile, getUploadTempDir()))
        : null
      const bitrates = metadata ? getTargetBitrates(metadata.bitrate) : null

      coverName = (await this.storeUploads(audioFile, coverFile)) ?? undefined
      masterStored = audioFile !== undefined

      const track = await this.prisma.$transaction(async (tx) => {
        const updated = await tx.track.update({
          where: { id },
          data: {
            title: updateTrackDto.title,
            cover: coverName,
            audioUrl: audioFile?.filename ?? undefined,
            ...(audioFile ? rightsConfirmationRecord() : {}),
            duration: metadata?.duration ?? undefined,
            processingStatus: audioFile ? 'PROCESSING' : undefined,
            processingError: audioFile ? null : undefined,
            processingAttempts: audioFile ? 0 : undefined,
            processingStartedAt: audioFile ? null : undefined,
            processingFinishedAt: audioFile ? null : undefined,
          },
        })

        if (audioFile) {
          // Drops any legacy pre-publication upload row tied to the replaced audioUrl —
          // a bare multer filename is never a valid storage key.
          await tx.trackFile.deleteMany({
            where: { trackId: updated.id, url: existingTrack.audioUrl },
          })
        }

        return updated
      })
      persisted = true

      if (audioFile && metadata && bitrates) {
        await this.discardStoredMaster(existingTrack.audioUrl)
        await this.enqueueAudioConversion({
          trackId: track.id,
          artistId: track.artistId,
          sourceFileName: audioFile.filename,
          bitrates,
          trigger: 'REPLACE',
          input: toInputProbe(metadata, audioFile.size),
        })
      }
      if (coverName && existingTrack.cover !== coverName) {
        await removePublicImage(this.storage, COVER_FOLDER, existingTrack.cover)
      }

      await this.invalidateTrackCaches()

      return track
    } catch (error) {
      if (!persisted) {
        await cleanupUploadedAudio(audioFile)
        await removePublicImage(this.storage, COVER_FOLDER, coverName)
        if (masterStored && audioFile) await this.discardStoredMaster(audioFile.filename)
      }
      throw error
    }
  }

  /**
   * Re-queues an existing track's stored source file for transcoding.
   *
   * Reuses the same audio-processing queue and job shape as a fresh upload —
   * the master in storage is never deleted after a successful conversion, so this
   * re-inspects it and re-enqueues rather than creating a second queue.
   * @throws NotFoundException when the track does not exist or was soft-deleted.
   */
  async reprocess(trackId: TrackEntity['id']) {
    const track = await this.prisma.track.findFirst({
      where: { id: trackId, deletedAt: null },
      select: { id: true, artistId: true, audioUrl: true },
    })
    if (!track) throw new NotFoundException('Track not found')

    const masterKey = getMasterKey(track.audioUrl)
    if (!(await this.storage.exists(masterKey))) {
      throw new NotFoundException('Source audio is missing from storage')
    }
    const { metadata, bytes } = await this.inspectStoredMaster(masterKey, track.audioUrl)
    const bitrates = getTargetBitrates(metadata.bitrate)

    const updated = await this.prisma.track.update({
      where: { id: trackId },
      data: {
        processingStatus: 'PROCESSING',
        processingError: null,
        processingStartedAt: null,
        processingFinishedAt: null,
      },
    })

    await this.enqueueAudioConversion({
      trackId: track.id,
      artistId: track.artistId,
      sourceFileName: track.audioUrl,
      bitrates,
      trigger: 'REPROCESS',
      input: toInputProbe(metadata, bytes),
    })
    await this.invalidateTrackCaches()

    return updated
  }
}
