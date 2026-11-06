import { randomUUID } from 'node:crypto'
import { rm, stat } from 'node:fs/promises'
import { extname, join } from 'node:path'
import { rightsConfirmationRecord } from '@common/rights-confirmation'
import { resolveSafeMulterPath } from '@common/utils/multer-file'
import { CacheService } from '@infra/cache/cache.service'
import { PrismaService } from '@infra/prisma/prisma.service'
import {
  removePublicImage,
  storePublicImage,
  validatePublicImage,
} from '@infra/storage/public-images'
import { STORAGE_SERVICE } from '@infra/storage/storage.constants'
import type { StorageService } from '@infra/storage/storage.types'
import type { ArtistEntity } from '@modules/artists'
import { Inject, Injectable, Logger, NotFoundException } from '@nestjs/common'
import type { CreateTrackDto } from '../dtos'
import type { TrackEntity } from '../entities'
import { AudioConversionProducer, toInputProbe } from '../processing/audio-conversion.producer'
import { downloadObjectToFile, storeMaster } from '../shared/audio-master'
import { getUploadTempDir } from '../shared/audio-scratch'
import { getMasterKey } from '../shared/audio-storage-keys'
import { deleteObjectQuietly } from '../shared/storage-cleanup'
import { getTargetBitrates, MAX_COVER_BYTES } from '../shared/track-audio.helpers'
import { cleanupUploadedAudio, inspectAudioFile } from '../shared/track-media'
import { invalidateTrackCaches } from './track-caches'

/** Where track covers live in storage; the first part of their public `/static/...` URL. */
const COVER_FOLDER = 'tracks/covers'

/**
 * Gets audio into the conversion pipeline: stores a direct upload (master and cover) as a new
 * track, or re-queues a track's stored master. Release tracks go through `ReleaseTrackService`.
 */
@Injectable()
export class TrackIngestService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly cache: CacheService,
    private readonly conversions: AudioConversionProducer,
    @Inject(STORAGE_SERVICE) private readonly storage: StorageService,
  ) {}

  private readonly logger = new Logger(TrackIngestService.name, { timestamp: true })

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

  /** Reads a Multer-written upload's audio metadata. */
  private async inspectUpload(audioFile: Express.Multer.File) {
    return await inspectAudioFile(resolveSafeMulterPath(audioFile, getUploadTempDir()))
  }

  /**
   * Removes everything an upload left behind when its track row was never written: the
   * temp file, a stored cover and, once uploaded, the stored master.
   */
  private async discardUnpersistedUploads(
    audioFile: Express.Multer.File | undefined,
    coverName: string | null | undefined,
    masterStored: boolean,
  ) {
    await cleanupUploadedAudio(audioFile)
    await removePublicImage(this.storage, COVER_FOLDER, coverName)
    if (masterStored && audioFile) await this.discardStoredMaster(audioFile.filename)
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

      const metadata = await this.inspectUpload(audioFile)
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

      await this.conversions.enqueue({
        trackId: track.id,
        artistId,
        sourceFileName: audioFile.filename,
        bitrates,
        trigger: 'UPLOAD',
        input: toInputProbe(metadata, audioFile.size),
      })
      this.logger.log(`Queued audio conversion for track ID: ${track.id}`)
      await invalidateTrackCaches(this.cache)

      return track
    } catch (error) {
      if (!persisted) await this.discardUnpersistedUploads(audioFile, coverName, masterStored)
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

    await this.conversions.enqueue({
      trackId: track.id,
      artistId: track.artistId,
      sourceFileName: track.audioUrl,
      bitrates,
      trigger: 'REPROCESS',
      input: toInputProbe(metadata, bytes),
    })
    await invalidateTrackCaches(this.cache)

    return updated
  }
}
