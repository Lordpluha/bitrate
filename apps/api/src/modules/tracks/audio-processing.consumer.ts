import { createReadStream } from 'node:fs'
import { access, mkdir, readdir, rm, stat } from 'node:fs/promises'
import { extname, join } from 'node:path'
import * as PrismaServiceModule from '@infra/prisma/prisma.service'
import {
  AUDIO_PROCESSING_DEAD_LETTER_QUEUE,
  AUDIO_PROCESSING_QUEUE,
  type ConvertAudioJob,
} from '@infra/queues/audio-processing.queue'
import { STORAGE_SERVICE } from '@infra/storage/storage.constants'
import type { StorageService } from '@infra/storage/storage.types'
import { InjectQueue, OnWorkerEvent, Processor, WorkerHost } from '@nestjs/bullmq'
import { Inject, Logger } from '@nestjs/common'
import type { Job, Queue } from 'bullmq'
import { getAudioGenerationRoot } from './audio-storage-keys'

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

/** A CMAF rendition prepared for upload, with its byte-range index (ADR-0020). */
interface PreparedCmafRendition {
  bitrate: number
  audioKey: string
  temporaryPath: string
  size: number
  initRange: [number, number]
  /** [startTicks, durationTicks, offset, length] per fragment. */
  fragments: number[][]
}

/** Everything the manifest endpoint needs after a successful CMAF pass. */
interface PreparedCmafPackage {
  timescale: number
  durationTicks: number
  renditions: PreparedCmafRendition[]
}

/** Format discriminator for CMAF rows in TrackFile. */
const CMAF_FORMAT = 'cmaf'

/** The single audio codec produced by the CMAF pipeline. */
const CMAF_CODEC = 'mp4a.40.2'

/** Maximum number of storage writes started at once by one worker. */
const STORAGE_UPLOAD_CONCURRENCY = 6

/** Signals that another upload became authoritative while this job was running. */
class StaleAudioJobError extends Error {}

/** CONTENT-TYPE map for file extensions. */
const CONTENT_TYPES: Record<string, string> = {
  '.opus': 'audio/ogg',
  '.m3u8': 'application/vnd.apple.mpegurl',
  '.mp4': 'video/mp4',
  '.m4a': 'audio/mp4',
  '.m4s': 'video/iso.segment',
}

/** Returns the MIME type for a file based on its extension. */
function contentTypeFor(filePath: string): string {
  return CONTENT_TYPES[extname(filePath).toLowerCase()] ?? 'application/octet-stream'
}

/** Represents the audio processing consumer. */
@Processor(AUDIO_PROCESSING_QUEUE, {
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
    @InjectQueue(AUDIO_PROCESSING_DEAD_LETTER_QUEUE)
    private readonly deadLetterQueue: Queue<ConvertAudioJob>,
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

    const started = await this.prisma.track.updateMany({
      where: { id: trackId, audioUrl: sourceFileName },
      data: {
        processingStatus: 'PROCESSING',
        processingError: null,
        processingAttempts: { increment: 1 },
        processingStartedAt: new Date(),
        processingFinishedAt: null,
      },
    })

    if (started.count !== 1) {
      this.logger.warn(`Skipping superseded audio conversion job ${job.id} for track ${trackId}`)
      return
    }

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
      // Superseded by the CMAF package below; kept until the CMAF path ships. See ADR-0020.
      const temporaryHlsPath = join(temporaryRoot, 'hls')
      await this.generateHls(job, temporaryHlsPath, bitrates)
      await this.validateHls(temporaryHlsPath, bitrates)
      await job.updateProgress(92)

      // Phase 3: encode the single-file CMAF renditions and build their byte index.
      const generationRoot = getAudioGenerationRoot(trackId, sourceFileName)
      const cmafPackage = await this.generateCmaf(generationRoot, job, temporaryRoot, bitrates)
      await job.updateProgress(94)

      // Phase 4: upload the progressive fallback, HLS package and CMAF renditions.
      await this.uploadToStorage(generationRoot, preparedVariants, temporaryHlsPath, cmafPackage)
      await job.updateProgress(98)

      const trackAfterUpload = await this.prisma.track.findUnique({ where: { id: trackId } })
      if (!trackAfterUpload || trackAfterUpload.audioUrl !== sourceFileName) {
        await this.storage.deletePrefix(generationRoot)
        this.logger.warn(`Removed stale uploaded generation from job ${job.id}`)
        return
      }

      // Phase 5: persist TrackFile records + mark READY
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

        await tx.trackFile.deleteMany({
          where: {
            trackId,
            format: CMAF_FORMAT,
            bitrate: { notIn: cmafPackage.renditions.map((rendition) => rendition.bitrate) },
          },
        })

        for (const rendition of cmafPackage.renditions) {
          const payload = {
            codec: CMAF_CODEC,
            url: rendition.audioKey,
            size: rendition.size,
            initRangeStart: rendition.initRange[0],
            initRangeEnd: rendition.initRange[1],
            fragments: rendition.fragments,
          }

          await tx.trackFile.upsert({
            where: {
              trackId_format_bitrate: {
                trackId,
                format: CMAF_FORMAT,
                bitrate: rendition.bitrate,
              },
            },
            update: payload,
            create: {
              trackId,
              format: CMAF_FORMAT,
              bitrate: rendition.bitrate,
              ...payload,
            },
          })
        }

        const published = await tx.track.updateMany({
          where: { id: trackId, audioUrl: sourceFileName },
          data: {
            processingStatus: 'READY',
            processingError: null,
            processingFinishedAt: new Date(),
            playbackVersion: 2,
            fragmentTimescale: cmafPackage.timescale,
            durationTicks: cmafPackage.durationTicks,
          },
        })

        if (published.count !== 1) throw new StaleAudioJobError()
      })

      await job.updateProgress(100)
      this.logger.log(
        `Audio conversion + storage upload completed for track ${trackId}, job ${job.id}`,
      )
    } catch (error) {
      if (error instanceof StaleAudioJobError) {
        const generationRoot = getAudioGenerationRoot(trackId, sourceFileName)
        await this.storage.deletePrefix(generationRoot)
        this.logger.warn(`Discarded superseded audio generation from job ${job.id}`)
        return
      }

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

    const failed = await this.prisma.track.updateMany({
      where: { id: job.data.trackId, audioUrl: job.data.sourceFileName },
      data: {
        processingStatus: 'FAILED',
        processingError: error.message,
        processingFinishedAt: new Date(),
      },
    })
    if (failed.count !== 1) return

    try {
      await this.storage.deletePrefix(
        getAudioGenerationRoot(job.data.trackId, job.data.sourceFileName),
      )
    } catch (cleanupError) {
      this.logger.error(
        `Unable to clean failed audio generation for track ${job.data.trackId}`,
        cleanupError instanceof Error ? cleanupError.stack : undefined,
      )
    }
    await this.deadLetterQueue.add('convert-audio-failed', job.data, {
      jobId: `failed-${String(job.id)}-${job.attemptsMade}`,
      removeOnComplete: 500,
      removeOnFail: 1_000,
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
    const { inputPath, format, bitrates, sourceFileName, trackId } = job.data
    const prepared: PreparedVariant[] = []
    const { convertAudio } = await import('@spotify/converter')
    const generationRoot = getAudioGenerationRoot(trackId, sourceFileName)

    for (const [index, bitrate] of bitrates.entries()) {
      const bitrateValue = Number(bitrate.replace('k', ''))
      if (!Number.isFinite(bitrateValue) || bitrateValue <= 0) {
        throw new Error(`Invalid audio bitrate: ${bitrate}`)
      }

      const outputFilename = `audio_${bitrate}.${format}`
      const temporaryAudioPath = join(temporaryRoot, outputFilename)
      const audioKey = `${generationRoot}/audio/${bitrate}.${format}`

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

  /**
   * Encodes one CMAF file per bitrate in a single FFmpeg run and reads back the
   * byte index the player needs for Range playback. The converter fails the job
   * when renditions do not share fragment boundaries, so an unspliceable track
   * never reaches READY. See ADR-0020.
   */
  private async generateCmaf(
    generationRoot: string,
    job: Job<ConvertAudioJob>,
    temporaryRoot: string,
    bitrates: string[],
  ): Promise<PreparedCmafPackage> {
    const { convertAudioToCmaf } = await import('@spotify/converter')

    const numericBitrates = bitrates.map((bitrate) => {
      const value = Number(bitrate.replace(/k$/, ''))
      if (!Number.isInteger(value) || value <= 0) {
        throw new Error(`Invalid audio bitrate: ${bitrate}`)
      }
      return value
    })

    const result = await convertAudioToCmaf({
      input: job.data.inputPath,
      outputDir: join(temporaryRoot, CMAF_FORMAT),
      bitrates: numericBitrates,
      timeoutMs: 600_000,
    })

    return {
      timescale: result.timescale,
      durationTicks: result.durationTicks,
      renditions: result.renditions.map((rendition) => ({
        bitrate: rendition.bitrate,
        audioKey: `${generationRoot}/cmaf/${rendition.bitrate}.m4a`,
        temporaryPath: rendition.path,
        size: rendition.size,
        initRange: rendition.initRange,
        fragments: rendition.fragments.map((fragment) => [
          fragment.startTicks,
          fragment.durationTicks,
          fragment.offset,
          fragment.length,
        ]),
      })),
    }
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
   * Uploads all progressive Opus files, the aligned HLS tree and the CMAF
   * renditions to configured storage.
   * Storage key structure (identical on both the S3 and local drivers):
   *   tracks/{trackId}/generations/{generation}/audio/{bitrate}k.opus
   *   tracks/{trackId}/generations/{generation}/hls/master.m3u8
   *   tracks/{trackId}/generations/{generation}/hls/{bitrate}/{asset}
   *   tracks/{trackId}/generations/{generation}/cmaf/{bitrate}.m4a
   */
  private async uploadToStorage(
    generationRoot: string,
    variants: PreparedVariant[],
    temporaryHlsPath: string,
    cmafPackage: PreparedCmafPackage,
  ) {
    const uploads: Array<() => Promise<void>> = []

    for (const rendition of cmafPackage.renditions) {
      uploads.push(async () => {
        await this.storage.upload(
          rendition.audioKey,
          createReadStream(rendition.temporaryPath),
          'audio/mp4',
        )
      })
    }

    for (const variant of variants) {
      // Progressive Opus file
      uploads.push(async () => {
        await this.storage.upload(
          variant.audioKey,
          createReadStream(variant.temporaryAudioPath),
          'audio/ogg',
        )
      })
    }

    const hlsEntries = await readdir(temporaryHlsPath, { withFileTypes: true })
    for (const entry of hlsEntries) {
      if (!entry.isDirectory()) continue
      uploads.push(async () => {
        await this.uploadDirectory(
          join(temporaryHlsPath, entry.name),
          `${generationRoot}/hls/${entry.name}`,
        )
      })
    }

    await this.runWithConcurrency(uploads, STORAGE_UPLOAD_CONCURRENCY)
    await this.storage.upload(
      `${generationRoot}/hls/master.m3u8`,
      createReadStream(join(temporaryHlsPath, 'master.m3u8')),
      'application/vnd.apple.mpegurl',
    )
    this.logger.log(`Uploaded all audio assets under ${generationRoot}`)
  }

  /** Recursively uploads all files in a local directory to a storage key prefix. */
  private async uploadDirectory(localDir: string, keyPrefix: string): Promise<void> {
    const entries = await readdir(localDir, { withFileTypes: true })
    await this.runWithConcurrency(
      entries.map((entry) => async () => {
        const localPath = join(localDir, entry.name)
        if (entry.isDirectory()) {
          await this.uploadDirectory(localPath, `${keyPrefix}/${entry.name}`)
        } else {
          const key = `${keyPrefix}/${entry.name}`
          await this.storage.upload(key, createReadStream(localPath), contentTypeFor(localPath))
        }
      }),
      STORAGE_UPLOAD_CONCURRENCY,
    )
  }

  /** Runs asynchronous storage work without building an unbounded Promise fan-out. */
  private async runWithConcurrency(tasks: Array<() => Promise<void>>, concurrency: number) {
    let nextIndex = 0

    const worker = async () => {
      while (nextIndex < tasks.length) {
        const task = tasks[nextIndex]
        nextIndex += 1
        await task?.()
      }
    }

    await Promise.all(
      Array.from({ length: Math.min(concurrency, tasks.length) }, async () => worker()),
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

  /**
   * Records why one attempt failed, but only while this job's source is still
   * the track's source.
   *
   * The match is part of the write rather than a preceding read: a newer upload
   * can replace `audioUrl` between a read and an update, and a read-then-write
   * would then stamp the stale error onto the newer source.
   */
  private async markAttemptFailed(job: Job<ConvertAudioJob>, message: string) {
    await this.prisma.track.updateMany({
      where: { id: job.data.trackId, audioUrl: job.data.sourceFileName },
      data: { processingError: message },
    })
  }

  /** Runs the is missing file error operation. */
  private isMissingFileError(error: unknown): error is NodeJS.ErrnoException {
    return error instanceof Error && 'code' in error && error.code === 'ENOENT'
  }
}
