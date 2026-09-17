import { join } from 'node:path'
import type { PrismaService } from '@infra/prisma/prisma.service'
import type { ConvertAudioJob } from '@infra/queues/audio-processing.queue'
import type { StorageService } from '@infra/storage/storage.types'
import type { TrackProcessingStep } from '@prisma/client'
import type { Job } from 'bullmq'
import { uploadArtifacts } from './audio-artifact-storage'
import { generateCmaf, generateHls, prepareVariants, validateHls } from './audio-encoding'
import { getAudioGenerationRoot } from './audio-storage-keys'
import { publishTrackFiles } from './audio-track-publication'
import type { ProcessingAttemptRecorder } from './processing-attempt.recorder'

/** Progress checkpoints reported once encoding has finished. */
const PROGRESS = { hlsReady: 92, cmafReady: 94, uploaded: 98, done: 100 } as const

/**
 * Mutable step marker the caller reads back after a phase throws — this is how
 * `AudioProcessingConsumer` learns which step a failure happened in without the phase
 * sequence needing to know anything about the recorder's error-classification path.
 */
export type ConversionStepContext = {
  step: TrackProcessingStep
  stepDetail?: string
}

/** Everything one phase run needs, beyond the mutable step context. */
export type RunConversionPhasesInput = {
  job: Job<ConvertAudioJob>
  temporaryRoot: string
  storage: StorageService
  prisma: PrismaService
  recorder: ProcessingAttemptRecorder
  trackId: string
  sourceFileName: string
  jobId: string
  attempt: number
  isStillCurrent: (job: Job<ConvertAudioJob>) => Promise<boolean>
}

/** Whether the conversion finished normally or was abandoned for a newer upload. */
export type ConversionOutcome = 'PUBLISHED' | 'SUPERSEDED'

/**
 * Runs the encode → package → upload → publish sequence for one claimed job, updating
 * `ctx` before each phase so the caller can attribute a thrown error to the right step.
 *
 * Each of the two staleness checkpoints (after progressive encoding, after upload) writes
 * its own SUPERSEDED row and returns rather than throwing — a superseded generation is not
 * a failure. `StaleAudioJobError` from the conditional publish is left to the caller: it
 * needs the storage cleanup that already lived in the consumer's catch block.
 */
export async function runConversionPhases(
  ctx: ConversionStepContext,
  input: RunConversionPhasesInput,
): Promise<ConversionOutcome> {
  const { job, temporaryRoot, storage, prisma, recorder, trackId, sourceFileName, jobId, attempt } =
    input
  const { format, bitrates } = job.data

  ctx.step = 'PROGRESSIVE_ENCODE'
  const variants = await prepareVariants(job, temporaryRoot, (bitrate) => {
    ctx.stepDetail = bitrate
  })
  if (!(await input.isStillCurrent(job))) {
    await recorder.supersede({ trackId, jobId, attempt, step: ctx.step })
    return 'SUPERSEDED'
  }

  /**
   * Generates one aligned multi-bitrate HLS package.
   * Superseded by the CMAF package below; kept until the CMAF path ships. See ADR-0020.
   */
  ctx.step = 'HLS_ENCODE'
  ctx.stepDetail = undefined
  const temporaryHlsPath = join(temporaryRoot, 'hls')
  await generateHls(job, temporaryHlsPath, bitrates)

  ctx.step = 'HLS_VALIDATE'
  await validateHls(temporaryHlsPath, bitrates)
  await job.updateProgress(PROGRESS.hlsReady)

  ctx.step = 'CMAF_ENCODE'
  const generationRoot = getAudioGenerationRoot(trackId, sourceFileName)
  const cmafPackage = await generateCmaf(generationRoot, job, temporaryRoot, bitrates)
  await job.updateProgress(PROGRESS.cmafReady)

  ctx.step = 'UPLOAD'
  await uploadArtifacts({ storage, generationRoot, variants, temporaryHlsPath, cmafPackage })
  await job.updateProgress(PROGRESS.uploaded)

  if (!(await input.isStillCurrent(job))) {
    await storage.deletePrefix(generationRoot)
    await recorder.supersede({ trackId, jobId, attempt, step: ctx.step })
    return 'SUPERSEDED'
  }

  ctx.step = 'PUBLISH'
  await publishTrackFiles({ prisma, trackId, sourceFileName, format, variants, cmafPackage })
  await job.updateProgress(PROGRESS.done)

  return 'PUBLISHED'
}
