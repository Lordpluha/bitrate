import { createReadStream } from 'node:fs'
import { access, mkdir, readdir, rm, stat } from 'node:fs/promises'
import { extname, join } from 'node:path'
import * as PrismaServiceModule from '@infra/prisma/prisma.service'
import { STORAGE_SERVICE } from '@infra/storage/storage.constants'
import type { StorageService } from '@infra/storage/storage.types'
import { OnWorkerEvent, Processor, WorkerHost } from '@nestjs/bullmq'
import { Inject, Logger } from '@nestjs/common'
import type { Job } from 'bullmq'

/** Describes the convert audio job. */
interface ConvertAudioJob {
  /** The track id value. */
  trackId: string
  /** The artist id value. */
  artistId: string
  /** The source file name value. */
  sourceFileName: string
  /** The input path value. */
  inputPath: string
  /** The output dir value. */
  outputDir: string
  /** The format value. */
  format: string
  /** The bitrates value. */
  bitrates: string[]
}

/** Describes a single prepared bitrate variant before S3 upload. */
interface PreparedVariant {
  /** Bitrate in kbps. */
  bitrate: number
  /** Opus codec identifier. */
  codec: string | null
  /** S3 key for the progressive audio file. */
  audioKey: string
  /** Absolute local path to the converted Opus file. */
  temporaryAudioPath: string
  /** File size of the converted Opus file in bytes. */
  size: number
}

/** CONTENT-TYPE map for file extensions. */
const CONTENT_TYPES: Record<string, string> = {
  '.opus': 'audio/ogg',
  '.m3u8': 'application/vnd.apple.mpegurl',
  '.mp4': 'video/mp4',
  '.m4s': 'video/iso.segment',
}

/** Returns the MIME type for a file based on its extension. */
function contentTypeFor(filePath: string): string {
  return CONTENT_TYPES[extname(filePath).toLowerCase()] ?? 'application/octet-stream'
}

/** Represents the audio processing consumer. */
@Processor('audio-processing', {
  concurrency: 2,
  lockDuration: 600_000,
  stalledInterval: 30_000,
  maxStalledCount: 2,
})
export class AudioProcessingConsumer extends WorkerHost {
  /** Creates a new instance. */
  constructor(
    @Inject(PrismaServiceModule.PrismaService)
    private readonly prisma: PrismaServiceModule.PrismaService,
    @Inject(STORAGE_SERVICE)
    private readonly storage: StorageService,
  ) {
    super()
  }

  /** The logger value. */
  private readonly logger = new Logger(AudioProcessingConsumer.name, { timestamp: true })

  /** Runs the process operation. */
  async process(job: Job<ConvertAudioJob>) {
    if (job.name !== 'convert-audio') return

    const { trackId, sourceFileName, outputDir, format, bitrates } = job.data
    const track = await this.prisma.track.findUnique({ where: { id: trackId } })

    if (!track || track.audioUrl !== sourceFileName) {
      this.logger.warn(`Skipping stale audio conversion job ${job.id} for track ${trackId}`)
      return
    }

    await this.prisma.track.update({
      where: { id: trackId },
      data: {
        processingStatus: 'PROCESSING',
        processingError: null,
        processingAttempts: { increment: 1 },
        processingStartedAt: new Date(),
        processingFinishedAt: null,
      },
    })

    const processingRoot = join(outputDir, '.processing')
    const temporaryRoot = join(
      processingRoot,
      `${trackId}-${String(job.id)}-${job.attemptsMade + 1}`,
    )

    await this.cleanupOrphanedTemporaryDirs(processingRoot, trackId, String(job.id))
    await rm(temporaryRoot, { recursive: true, force: true })
    await mkdir(temporaryRoot, { recursive: true })

    try {
      // Phase 1: encode progressive Opus variants.
      const preparedVariants = await this.prepareVariants(job, temporaryRoot)

      const currentTrack = await this.prisma.track.findUnique({ where: { id: trackId } })
      if (!currentTrack || currentTrack.audioUrl !== sourceFileName) {
        this.logger.warn(`Discarding stale conversion result from job ${job.id}`)
        return
      }

      // Phase 2: generate one aligned multi-bitrate HLS package.
      const temporaryHlsPath = join(temporaryRoot, 'hls')
      await this.generateHls(job, temporaryHlsPath, bitrates)
      await this.validateHls(temporaryHlsPath, bitrates)
      await job.updateProgress(94)

      // Phase 3: upload the progressive fallback and HLS package to storage.
      await this.uploadToStorage(trackId, preparedVariants, temporaryHlsPath)
      await job.updateProgress(98)

      // Phase 4: persist TrackFile records + mark READY
      await this.prisma.$transaction(async (tx) => {
        await tx.trackFile.deleteMany({
          where: {
            trackId,
            format,
            bitrate: { notIn: preparedVariants.map((v) => v.bitrate) },
          },
        })

        for (const variant of preparedVariants) {
          await tx.trackFile.upsert({
            where: { trackId_format_bitrate: { trackId, format, bitrate: variant.bitrate } },
            update: { codec: variant.codec, url: variant.audioKey, size: variant.size },
            create: {
              trackId,
              format,
              bitrate: variant.bitrate,
              codec: variant.codec,
              url: variant.audioKey,
              size: variant.size,
            },
          })
        }

        await tx.track.update({
          where: { id: trackId },
          data: {
            processingStatus: 'READY',
            processingError: null,
            processingFinishedAt: new Date(),
          },
        })
      })

      await job.updateProgress(100)
      this.logger.log(
        `Audio conversion + storage upload completed for track ${trackId}, job ${job.id}`,
      )
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown conversion error'
      await this.markAttemptFailed(job, message)
      throw error
    } finally {
      await rm(temporaryRoot, { recursive: true, force: true })
    }
  }

  /** Runs the on failed operation. */
  @OnWorkerEvent('failed')
  async onFailed(job: Job<ConvertAudioJob> | undefined, error: Error) {
    if (job?.name !== 'convert-audio') return

    const maxAttempts = job.opts.attempts ?? 1
    if (job.attemptsMade < maxAttempts) return

    const track = await this.prisma.track.findUnique({ where: { id: job.data.trackId } })
    if (!track || track.audioUrl !== job.data.sourceFileName) return

    await this.prisma.track.update({
      where: { id: job.data.trackId },
      data: {
        processingStatus: 'FAILED',
        processingError: error.message,
        processingFinishedAt: new Date(),
      },
    })
    this.logger.error(
      `Audio conversion permanently failed for track ${job.data.trackId}`,
      error.stack,
    )
  }

  /** Runs the on stalled operation. */
  @OnWorkerEvent('stalled')
  onStalled(jobId: string) {
    this.logger.warn(`Audio conversion job ${jobId} stalled and will be recovered by BullMQ`)
  }

  /** Encodes progressive Opus fallback files for every requested bitrate. */
  private async prepareVariants(job: Job<ConvertAudioJob>, temporaryRoot: string) {
    const { trackId, inputPath, format, bitrates } = job.data
    const prepared: PreparedVariant[] = []
    const { convertAudio } = await import('@spotify/converter')

    for (const [index, bitrate] of bitrates.entries()) {
      const bitrateValue = Number(bitrate.replace('k', ''))
      if (!Number.isFinite(bitrateValue) || bitrateValue <= 0) {
        throw new Error(`Invalid audio bitrate: ${bitrate}`)
      }

      const outputFilename = `audio_${bitrate}.${format}`
      const temporaryAudioPath = join(temporaryRoot, outputFilename)
      const audioKey = `tracks/${trackId}/audio/${bitrate}.${format}`

      await convertAudio({
        input: inputPath,
        output: temporaryAudioPath,
        bitrate,
        vbr: false,
        quality: 10,
        application: 'audio',
        timeoutMs: 600_000,
      })
      await this.validateAudioVariant(temporaryAudioPath)
      const fileStat = await stat(temporaryAudioPath)
      prepared.push({
        bitrate: bitrateValue,
        codec: format === 'opus' ? 'opus' : null,
        audioKey,
        temporaryAudioPath,
        size: fileStat.size,
      })
      await job.updateProgress(Math.round(((index + 1) / bitrates.length) * 90))
    }

    return prepared
  }

  /** Generates a multi-bitrate HLS package from the original source file. */
  private async generateHls(
    job: Job<ConvertAudioJob>,
    temporaryHlsPath: string,
    bitrates: string[],
  ) {
    const { convertAudioToHls } = await import('@spotify/converter')
    await convertAudioToHls({
      input: job.data.inputPath,
      outputDir: temporaryHlsPath,
      bitrates,
      segmentDuration: 4,
      timeoutMs: 600_000,
    })
  }

  /** Validates that a progressive Opus variant is non-empty. */
  private async validateAudioVariant(audioPath: string) {
    const audioStats = await stat(audioPath)
    if (audioStats.size <= 0) throw new Error(`Converted audio file is empty: ${audioPath}`)
  }

  /** Validates the master playlist and every bitrate rendition. */
  private async validateHls(hlsPath: string, bitrates: string[]) {
    await access(join(hlsPath, 'master.m3u8'))
    for (const bitrate of bitrates) {
      const variantPath = join(hlsPath, bitrate.replace(/k$/, ''))
      await access(join(variantPath, 'index.m3u8'))
      const assets = await readdir(variantPath)
      if (!assets.some((asset) => /^init_\d+\.mp4$/.test(asset))) {
        throw new Error(`HLS playlist has no initialization segment: ${variantPath}`)
      }
      if (!assets.some((asset) => /^segment_\d{5}\.m4s$/.test(asset))) {
        throw new Error(`HLS playlist has no media segments: ${variantPath}`)
      }
    }
  }

  /**
   * Uploads all progressive Opus files and the aligned HLS tree to configured storage.
   * Storage key structure (identical on both the S3 and local drivers):
   *   tracks/{trackId}/audio/{bitrate}k.opus
   *   tracks/{trackId}/hls/master.m3u8
   *   tracks/{trackId}/hls/{bitrate}/{asset}
   */
  private async uploadToStorage(
    trackId: string,
    variants: PreparedVariant[],
    temporaryHlsPath: string,
  ) {
    const uploads: Promise<void>[] = []

    for (const variant of variants) {
      // Progressive Opus file
      uploads.push(
        this.storage
          .upload(variant.audioKey, createReadStream(variant.temporaryAudioPath), 'audio/ogg')
          .then(() => undefined),
      )
    }

    const hlsEntries = await readdir(temporaryHlsPath, { withFileTypes: true })
    for (const entry of hlsEntries) {
      if (!entry.isDirectory()) continue
      uploads.push(
        this.uploadDirectory(
          join(temporaryHlsPath, entry.name),
          `tracks/${trackId}/hls/${entry.name}`,
        ),
      )
    }

    await Promise.all(uploads)
    await this.storage.upload(
      `tracks/${trackId}/hls/master.m3u8`,
      createReadStream(join(temporaryHlsPath, 'master.m3u8')),
      'application/vnd.apple.mpegurl',
    )
    this.logger.log(`Uploaded all audio assets for track ${trackId} to storage`)
  }

  /** Recursively uploads all files in a local directory to a storage key prefix. */
  private async uploadDirectory(localDir: string, keyPrefix: string): Promise<void> {
    const entries = await readdir(localDir, { withFileTypes: true })
    await Promise.all(
      entries.map(async (entry) => {
        const localPath = join(localDir, entry.name)
        if (entry.isDirectory()) {
          await this.uploadDirectory(localPath, `${keyPrefix}/${entry.name}`)
        } else {
          const key = `${keyPrefix}/${entry.name}`
          await this.storage.upload(key, createReadStream(localPath), contentTypeFor(localPath))
        }
      }),
    )
  }

  /** Runs the cleanup orphaned temporary dirs operation. */
  private async cleanupOrphanedTemporaryDirs(
    processingRoot: string,
    trackId: string,
    jobId: string,
  ) {
    try {
      const entries = await readdir(processingRoot)
      const prefix = `${trackId}-${jobId}-`
      await Promise.all(
        entries
          .filter((entry) => entry.startsWith(prefix))
          .map((entry) => rm(join(processingRoot, entry), { recursive: true, force: true })),
      )
    } catch (error) {
      if (!this.isMissingFileError(error)) throw error
    }
  }

  /** Runs the mark attempt failed operation. */
  private async markAttemptFailed(job: Job<ConvertAudioJob>, message: string) {
    const track = await this.prisma.track.findUnique({ where: { id: job.data.trackId } })
    if (!track || track.audioUrl !== job.data.sourceFileName) return

    await this.prisma.track.update({
      where: { id: job.data.trackId },
      data: { processingError: message },
    })
  }

  /** Runs the is missing file error operation. */
  private isMissingFileError(error: unknown): error is NodeJS.ErrnoException {
    return error instanceof Error && 'code' in error && error.code === 'ENOENT'
  }
}
