import { access, mkdir, readdir, rename, rm, stat } from 'node:fs/promises'
import { join, parse } from 'node:path'
import * as PrismaServiceModule from '@infra/prisma/prisma.service'
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

/** Describes the prepared variant. */
interface PreparedVariant {
  /** The bitrate value. */
  bitrate: number
  /** The codec value. */
  codec: string | null
  /** The output filename value. */
  outputFilename: string
  /** The temporary audio path value. */
  temporaryAudioPath: string
  /** The temporary hls path value. */
  temporaryHlsPath: string
  /** The size value. */
  size: number
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
  ) {
    super()
  }

  /** The logger value. */
  private readonly logger = new Logger(AudioProcessingConsumer.name, { timestamp: true })

  /** Runs the process operation. */
  async process(job: Job<ConvertAudioJob>) {
    if (job.name !== 'convert-audio') return

    const { trackId, sourceFileName, outputDir, format } = job.data
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
      const preparedVariants = await this.prepareVariants(job, temporaryRoot)

      const currentTrack = await this.prisma.track.findUnique({ where: { id: trackId } })
      if (!currentTrack || currentTrack.audioUrl !== sourceFileName) {
        this.logger.warn(`Discarding stale conversion result from job ${job.id}`)
        return
      }

      await this.publishVariants(outputDir, preparedVariants, String(job.id))

      await this.prisma.$transaction(async (tx) => {
        await tx.trackFile.deleteMany({
          where: {
            trackId,
            format,
            bitrate: { notIn: preparedVariants.map((variant) => variant.bitrate) },
          },
        })

        for (const variant of preparedVariants) {
          await tx.trackFile.upsert({
            where: {
              trackId_format_bitrate: {
                trackId,
                format,
                bitrate: variant.bitrate,
              },
            },
            update: {
              codec: variant.codec,
              url: variant.outputFilename,
              size: variant.size,
            },
            create: {
              trackId,
              format,
              bitrate: variant.bitrate,
              codec: variant.codec,
              url: variant.outputFilename,
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
      this.logger.log(`Audio conversion completed for track ${trackId}, job ${job.id}`)
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

  /** Runs the prepare variants operation. */
  private async prepareVariants(job: Job<ConvertAudioJob>, temporaryRoot: string) {
    const { inputPath, format, bitrates } = job.data
    const { name: baseName } = parse(inputPath)
    const prepared: PreparedVariant[] = []
    const { convertAudio, convertAudioToHls } = await import('@spotify/converter')

    for (const [index, bitrate] of bitrates.entries()) {
      const bitrateValue = Number(bitrate.replace('k', ''))
      if (!Number.isFinite(bitrateValue) || bitrateValue <= 0) {
        throw new Error(`Invalid audio bitrate: ${bitrate}`)
      }

      const outputFilename = `${baseName}_${bitrate}.${format}`
      const temporaryAudioPath = join(temporaryRoot, outputFilename)
      const temporaryHlsPath = `${temporaryAudioPath}.hls`

      await convertAudio({
        input: inputPath,
        output: temporaryAudioPath,
        bitrate,
        vbr: false,
        quality: 10,
        application: 'audio',
        timeoutMs: 600_000,
      })
      await convertAudioToHls({
        input: inputPath,
        outputDir: temporaryHlsPath,
        bitrate,
        segmentDuration: 10,
        timeoutMs: 600_000,
      })

      await this.validateVariant(temporaryAudioPath, temporaryHlsPath)
      const stats = await stat(temporaryAudioPath)
      prepared.push({
        bitrate: bitrateValue,
        codec: format === 'opus' ? 'opus' : null,
        outputFilename,
        temporaryAudioPath,
        temporaryHlsPath,
        size: stats.size,
      })
      await job.updateProgress(Math.round(((index + 1) / bitrates.length) * 90))
    }

    return prepared
  }

  /** Runs the validate variant operation. */
  private async validateVariant(audioPath: string, hlsPath: string) {
    const audioStats = await stat(audioPath)
    if (audioStats.size <= 0) throw new Error(`Converted audio file is empty: ${audioPath}`)

    await access(join(hlsPath, 'index.m3u8'))
    await access(join(hlsPath, 'init.mp4'))
    const assets = await readdir(hlsPath)
    if (!assets.some((asset) => /^segment_\d{5}\.m4s$/.test(asset))) {
      throw new Error(`HLS playlist has no media segments: ${hlsPath}`)
    }
  }

  /** Runs the publish variants operation. */
  private async publishVariants(outputDir: string, variants: PreparedVariant[], jobId: string) {
    await mkdir(outputDir, { recursive: true })

    for (const variant of variants) {
      const finalAudioPath = join(outputDir, variant.outputFilename)
      const finalHlsPath = `${finalAudioPath}.hls`
      const backupHlsPath = `${finalHlsPath}.backup-${jobId}`

      await rename(variant.temporaryAudioPath, finalAudioPath)
      await rm(backupHlsPath, { recursive: true, force: true })

      try {
        await rename(finalHlsPath, backupHlsPath)
      } catch (error) {
        if (!this.isMissingFileError(error)) throw error
      }

      try {
        await rename(variant.temporaryHlsPath, finalHlsPath)
        await rm(backupHlsPath, { recursive: true, force: true })
      } catch (error) {
        try {
          await rename(backupHlsPath, finalHlsPath)
        } catch (restoreError) {
          if (!this.isMissingFileError(restoreError)) throw restoreError
        }
        throw error
      }
    }
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
