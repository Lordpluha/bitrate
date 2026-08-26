import type { AppConfig } from '@common/config'
import { NS } from '@infra/cache/cache.constants'
import { CacheService } from '@infra/cache/cache.service'
import { PrismaService } from '@infra/prisma/prisma.service'
import {
  AUDIO_PROCESSING_JOB_OPTIONS,
  AUDIO_PROCESSING_QUEUE,
} from '@infra/queues/audio-processing.queue'
import type { ArtistEntity } from '@modules/artists'
import { InjectQueue } from '@nestjs/bullmq'
import { Injectable, Logger, NotFoundException } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import type { Queue } from 'bullmq'
import type { CreateTrackDto } from './dtos'
import type { TrackEntity } from './entities'
import { getTargetBitrates, resolveAudioFormat } from './track-audio.helpers'
import {
  cleanupUploadedFiles,
  inspectAudioFile,
  removeReplacedFile,
  validateCoverFile,
} from './track-media'

/** Everything an audio-conversion job needs to transcode one upload. */
type EnqueueConversionInput = {
  trackId: string
  artistId: string
  sourceFileName: string
  inputPath: string
  bitrates: string[]
}

/** Accepts artist uploads, persists them, and queues the transcoding ladder. */
@Injectable()
export class TrackUploadService {
  /** Creates a new instance. */
  constructor(
    private readonly prisma: PrismaService,
    @InjectQueue(AUDIO_PROCESSING_QUEUE) private readonly audioQueue: Queue,
    private readonly configService: ConfigService<AppConfig>,
    private readonly cache: CacheService,
  ) {}

  /** The logger value. */
  private readonly logger = new Logger(TrackUploadService.name, { timestamp: true })

  /** Queues an audio-conversion job, marking the track FAILED if it cannot be enqueued. */
  private async enqueueAudioConversion({
    trackId,
    artistId,
    sourceFileName,
    inputPath,
    bitrates,
  }: EnqueueConversionInput) {
    try {
      await this.audioQueue.add(
        'convert-audio',
        {
          trackId,
          artistId,
          sourceFileName,
          inputPath,
          outputDir: this.configService.getOrThrow('storage').getTracksDir(),
          format: 'opus',
          bitrates,
        },
        { ...AUDIO_PROCESSING_JOB_OPTIONS, jobId: `convert-audio-${trackId}-${sourceFileName}` },
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
      throw error
    }
  }

  /** Drops the caches that any newly created or edited track invalidates. */
  private async invalidateTrackCaches() {
    await Promise.all([this.cache.invalidate(NS.TRACKS), this.cache.invalidate(NS.SEARCH)])
  }

  /** Runs the create operation. */
  async create(
    artistId: ArtistEntity['id'],
    createTrackDto: CreateTrackDto,
    audioFile: Express.Multer.File,
    coverFile?: Express.Multer.File,
  ) {
    let persisted = false
    try {
      if (coverFile) await validateCoverFile(coverFile)

      const inputPath = this.configService.getOrThrow('storage').getTracksDir(audioFile.filename)
      const metadata = await inspectAudioFile(inputPath)
      const bitrates = getTargetBitrates(metadata.bitrate)
      const { format, codec } = resolveAudioFormat({
        fileName: audioFile.filename,
        mimetype: audioFile.mimetype,
        container: metadata.container,
        codec: metadata.codec,
      })

      const track = await this.prisma.$transaction(async (tx) => {
        const created = await tx.track.create({
          data: {
            artistId,
            title: createTrackDto.title,
            audioUrl: audioFile.filename,
            cover: coverFile?.filename ?? null,
            duration: metadata.duration,
            processingStatus: 'PROCESSING',
            processingError: null,
            processingAttempts: 0,
            processingStartedAt: null,
            processingFinishedAt: null,
          },
        })

        await tx.trackFile.create({
          data: {
            trackId: created.id,
            format,
            bitrate: metadata.bitrate,
            codec,
            url: audioFile.filename,
            size: audioFile.size,
          },
        })

        return created
      })
      persisted = true

      await this.enqueueAudioConversion({
        trackId: track.id,
        artistId,
        sourceFileName: audioFile.filename,
        inputPath,
        bitrates,
      })
      this.logger.log(`Queued audio conversion for track ID: ${track.id}`)
      await this.invalidateTrackCaches()

      return track
    } catch (error) {
      if (!persisted) await cleanupUploadedFiles([audioFile, coverFile])
      throw error
    }
  }

  /** Runs the update operation. */
  async update(
    artistId: ArtistEntity['id'],
    id: TrackEntity['id'],
    createTrackDto: CreateTrackDto,
    audioFile?: Express.Multer.File,
    coverFile?: Express.Multer.File,
  ) {
    let persisted = false
    try {
      const existingTrack = await this.prisma.track.findFirst({
        where: { id, artistId, deletedAt: null },
      })
      if (!existingTrack) {
        throw new NotFoundException('Track not found or does not belong to artist')
      }
      if (coverFile) await validateCoverFile(coverFile)

      const storageConfig = this.configService.getOrThrow('storage')
      const inputPath = audioFile ? storageConfig.getTracksDir(audioFile.filename) : null
      const metadata = inputPath ? await inspectAudioFile(inputPath) : null
      const bitrates = metadata ? getTargetBitrates(metadata.bitrate) : null
      const audio =
        audioFile && metadata
          ? resolveAudioFormat({
              fileName: audioFile.filename,
              mimetype: audioFile.mimetype,
              container: metadata.container,
              codec: metadata.codec,
            })
          : null

      const track = await this.prisma.$transaction(async (tx) => {
        const updated = await tx.track.update({
          where: { id },
          data: {
            title: createTrackDto.title,
            cover: coverFile?.filename ?? undefined,
            audioUrl: audioFile?.filename ?? undefined,
            duration: metadata?.duration ?? undefined,
            processingStatus: audioFile ? 'PROCESSING' : undefined,
            processingError: audioFile ? null : undefined,
            processingAttempts: audioFile ? 0 : undefined,
            processingStartedAt: audioFile ? null : undefined,
            processingFinishedAt: audioFile ? null : undefined,
          },
        })

        if (audioFile && audio) {
          const bitrate = metadata?.bitrate ?? 0
          await tx.trackFile.deleteMany({
            where: { trackId: updated.id, url: existingTrack.audioUrl },
          })
          await tx.trackFile.upsert({
            where: {
              trackId_format_bitrate: { trackId: updated.id, format: audio.format, bitrate },
            },
            update: { codec: audio.codec, url: audioFile.filename, size: audioFile.size },
            create: {
              trackId: updated.id,
              format: audio.format,
              bitrate,
              codec: audio.codec,
              url: audioFile.filename,
              size: audioFile.size,
            },
          })
        }

        return updated
      })
      persisted = true

      if (audioFile && inputPath && metadata && bitrates) {
        await removeReplacedFile(
          storageConfig.getTracksDir(existingTrack.audioUrl),
          existingTrack.audioUrl,
        )
        await this.enqueueAudioConversion({
          trackId: track.id,
          artistId: track.artistId,
          sourceFileName: audioFile.filename,
          inputPath,
          bitrates,
        })
      }
      if (coverFile && existingTrack.cover !== coverFile.filename) {
        await removeReplacedFile(
          storageConfig.getTracksCoversDir(existingTrack.cover ?? ''),
          existingTrack.cover,
        )
      }

      await this.invalidateTrackCaches()

      return track
    } catch (error) {
      if (!persisted) await cleanupUploadedFiles([audioFile, coverFile])
      throw error
    }
  }
}
