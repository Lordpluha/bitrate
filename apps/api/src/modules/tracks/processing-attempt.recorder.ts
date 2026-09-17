import * as os from 'node:os'
// biome-ignore lint/style/useImportType: constructor-injected — NestJS DI needs the real class reference at runtime, not a type-only import.
import { PrismaService } from '@infra/prisma/prisma.service'
import { Injectable, Logger } from '@nestjs/common'
import type { Prisma, TrackProcessingStep } from '@prisma/client'
import * as Sentry from '@sentry/nestjs'
import type {
  FailProcessingAttemptInput,
  FinalizeProcessingAttemptInput,
  RecordEnqueueFailureInput,
  StartProcessingAttemptInput,
  SucceedProcessingAttemptInput,
  SupersedeProcessingAttemptInput,
} from './processing-attempt.types'
import { classifyProcessingError, errorMessageOf, errorNameOf } from './processing-log/classify'
import { PROCESSING_LOG_LIMITS } from './processing-log/limits'
import { processingLogSuffix } from './processing-log/log-context'
import { redactProcessingText } from './processing-log/redact'

/** Newest attempts kept per track; older rows are pruned in the same transaction. */
const RETAINED_ATTEMPTS_PER_TRACK = 25

/** Redacts a value the field limit allows, or leaves `null` when there is nothing to store. */
function redactOrNull(
  value: string | null | undefined,
  options: { keep: 'head' | 'tail'; maxBytes: number },
): string | null {
  return value ? redactProcessingText(value, options) : null
}

/**
 * Best-effort, append-only log of BullMQ attempts for the audio-processing pipeline.
 *
 * Every public method wraps its Prisma call in try/catch and reports its own failure to
 * the logger and Sentry rather than throwing: a logging failure must never fail or retry
 * an encode. Retention is pruned to the newest {@link RETAINED_ATTEMPTS_PER_TRACK} rows per
 * track, in the same transaction as the terminal write.
 *
 * Attempt numbering: inside `process()` the current attempt is `job.attemptsMade + 1`
 * (BullMQ has not yet incremented it). Inside the `failed` worker event `job.attemptsMade`
 * has already been incremented to include the attempt that just finished, so the caller
 * must pass `job.attemptsMade` (not `+ 1`) there — getting this wrong silently orphans the
 * RUNNING row from `process()` instead of finalizing it.
 */
@Injectable()
export class ProcessingAttemptRecorder {
  private readonly logger = new Logger(ProcessingAttemptRecorder.name, { timestamp: true })
  private readonly workerHost = os.hostname()
  private readonly workerPid = process.pid
  private readonly workerRelease = process.env.SENTRY_RELEASE || null

  /** Creates a new instance. */
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Opens a RUNNING row for one BullMQ attempt.
   *
   * Marks any older RUNNING row for the same job, or the same track generation, as
   * STALLED first — this is what closes the row a worker left open when it died without
   * ever emitting BullMQ's `stalled` event, on the same code path regardless of whether
   * that worker was this process or (once the pipeline is extracted) a different one.
   */
  async start(input: StartProcessingAttemptInput): Promise<void> {
    try {
      await this.prisma.trackProcessingAttempt.updateMany({
        where: {
          status: 'RUNNING',
          OR: [
            { jobId: input.jobId },
            { trackId: input.trackId, sourceFileName: input.sourceFileName },
          ],
        },
        data: { status: 'STALLED', errorCode: 'STALLED', finishedAt: new Date() },
      })

      await this.prisma.trackProcessingAttempt.create({
        data: {
          trackId: input.trackId,
          sourceFileName: input.sourceFileName,
          jobId: input.jobId,
          attempt: input.attempt,
          maxAttempts: input.maxAttempts,
          trigger: input.trigger,
          status: 'RUNNING',
          inputBytes: input.input?.bytes ?? null,
          inputCodec: input.input?.codec ?? null,
          inputContainer: input.input?.container ?? null,
          inputBitrateKbps: input.input?.bitrateKbps ?? null,
          inputDurationSec: input.input?.durationSec ?? null,
          workerHost: this.workerHost,
          workerPid: this.workerPid,
          workerRelease: this.workerRelease,
        },
      })
    } catch (error) {
      this.reportRecorderFailure('start', error, { trackId: input.trackId, jobId: input.jobId })
    }
  }

  /** Finds the RUNNING row this attempt opened, if the recorder ever wrote one. */
  private findRunningRow(
    tx: Prisma.TransactionClient,
    trackId: string,
    jobId: string,
    attempt: number,
  ) {
    return tx.trackProcessingAttempt.findFirst({
      where: { trackId, jobId, attempt, status: 'RUNNING' },
      orderBy: { startedAt: 'desc' },
    })
  }

  /** Deletes every row for `trackId` beyond the newest {@link RETAINED_ATTEMPTS_PER_TRACK}. */
  private async pruneOldAttempts(tx: Prisma.TransactionClient, trackId: string): Promise<void> {
    const stale = await tx.trackProcessingAttempt.findMany({
      where: { trackId },
      orderBy: { startedAt: 'desc' },
      skip: RETAINED_ATTEMPTS_PER_TRACK,
      select: { id: true },
    })
    if (stale.length === 0) return

    await tx.trackProcessingAttempt.deleteMany({
      where: { id: { in: stale.map((row) => row.id) } },
    })
  }

  /** Marks the attempt SUCCEEDED and stamps its duration. */
  async succeed(input: SucceedProcessingAttemptInput): Promise<void> {
    try {
      await this.prisma.$transaction(async (tx) => {
        const row = await this.findRunningRow(tx, input.trackId, input.jobId, input.attempt)
        if (row) {
          await tx.trackProcessingAttempt.update({
            where: { id: row.id },
            data: {
              status: 'SUCCEEDED',
              finishedAt: new Date(),
              durationMs: Date.now() - row.startedAt.getTime(),
            },
          })
        }
        await this.pruneOldAttempts(tx, input.trackId)
      })
    } catch (error) {
      this.reportRecorderFailure('succeed', error, { trackId: input.trackId, jobId: input.jobId })
    }
  }

  /** Marks the attempt SUPERSEDED — a newer upload replaced this generation mid-flight. */
  async supersede(input: SupersedeProcessingAttemptInput): Promise<void> {
    try {
      await this.prisma.$transaction(async (tx) => {
        const row = await this.findRunningRow(tx, input.trackId, input.jobId, input.attempt)
        if (row) {
          await tx.trackProcessingAttempt.update({
            where: { id: row.id },
            data: {
              status: 'SUPERSEDED',
              finishedAt: new Date(),
              durationMs: Date.now() - row.startedAt.getTime(),
              failedStep: input.step,
            },
          })
        }
        await this.pruneOldAttempts(tx, input.trackId)
      })
    } catch (error) {
      this.reportRecorderFailure('supersede', error, { trackId: input.trackId, jobId: input.jobId })
    }
  }

  /** Marks the attempt FAILED, storing redacted diagnostics from the classified error. */
  async fail(input: FailProcessingAttemptInput): Promise<void> {
    try {
      const classified = classifyProcessingError(input.error)
      const errorInstance = input.error instanceof Error ? input.error : null

      await this.prisma.$transaction(async (tx) => {
        const row = await this.findRunningRow(tx, input.trackId, input.jobId, input.attempt)
        if (row) {
          await tx.trackProcessingAttempt.update({
            where: { id: row.id },
            data: {
              status: 'FAILED',
              finishedAt: new Date(),
              durationMs: Date.now() - row.startedAt.getTime(),
              willRetry: input.willRetry,
              failedStep: input.step,
              stepDetail: input.stepDetail ?? null,
              errorCode: classified.code,
              errorName: errorNameOf(input.error),
              errorMessage: redactOrNull(errorMessageOf(input.error), {
                keep: 'head',
                maxBytes: PROCESSING_LOG_LIMITS.errorMessage,
              }),
              errorStack: redactOrNull(errorInstance?.stack, {
                keep: 'head',
                maxBytes: PROCESSING_LOG_LIMITS.errorStack,
              }),
              retryable: classified.retryable,
              commandSummary: redactOrNull(classified.commandSummary, {
                keep: 'head',
                maxBytes: PROCESSING_LOG_LIMITS.commandSummary,
              }),
              stderrTail: redactOrNull(classified.stderrTail, {
                keep: 'tail',
                maxBytes: PROCESSING_LOG_LIMITS.stderrTail,
              }),
              exitCode: classified.exitCode,
              signal: classified.signal,
            },
          })
        }
        await this.pruneOldAttempts(tx, input.trackId)
      })
    } catch (error) {
      this.reportRecorderFailure('fail', error, { trackId: input.trackId, jobId: input.jobId })
    }
  }

  /** Marks every RUNNING row for `jobId` STALLED — BullMQ reported the job as stalled. */
  async markStalledByJob(jobId: string): Promise<void> {
    try {
      await this.prisma.trackProcessingAttempt.updateMany({
        where: { jobId, status: 'RUNNING' },
        data: { status: 'STALLED', errorCode: 'STALLED', finishedAt: new Date() },
      })
    } catch (error) {
      this.reportRecorderFailure('markStalledByJob', error, { jobId })
    }
  }

  /**
   * Closes out the attempt BullMQ has now given up on permanently.
   *
   * When the row from `fail()` exists, this only stamps `deadLetterJobId` onto it. When it
   * does not — a job stalled past `maxStalledCount` without ever running `process()` again,
   * or the worker crashed before `start()` ran — this inserts a synthetic FAILED row so the
   * permanent failure is still visible in the log.
   *
   * @returns the attempt's `failedStep` (`null` for a synthetic row, `undefined` if the
   * recorder itself failed), for the caller's Sentry fingerprint.
   */
  async finalize(
    input: FinalizeProcessingAttemptInput,
  ): Promise<TrackProcessingStep | null | undefined> {
    try {
      return await this.prisma.$transaction(async (tx) => {
        const row = await tx.trackProcessingAttempt.findFirst({
          where: { trackId: input.trackId, jobId: input.jobId, attempt: input.attempt },
          orderBy: { startedAt: 'desc' },
        })

        if (row) {
          await tx.trackProcessingAttempt.update({
            where: { id: row.id },
            data: {
              status: 'FAILED',
              willRetry: false,
              deadLetterJobId: input.deadLetterJobId,
              finishedAt: row.finishedAt ?? new Date(),
            },
          })
          await this.pruneOldAttempts(tx, input.trackId)
          return row.failedStep
        }

        const isStalledMessage = /stalled/i.test(input.error.message)
        await tx.trackProcessingAttempt.create({
          data: {
            trackId: input.trackId,
            sourceFileName: input.sourceFileName,
            jobId: input.jobId,
            attempt: input.attempt,
            maxAttempts: input.attempt,
            trigger: 'UPLOAD',
            status: 'FAILED',
            willRetry: false,
            deadLetterJobId: input.deadLetterJobId,
            finishedAt: new Date(),
            errorCode: isStalledMessage ? 'STALLED' : 'UNKNOWN',
            errorName: errorNameOf(input.error),
            errorMessage: redactOrNull(errorMessageOf(input.error), {
              keep: 'head',
              maxBytes: PROCESSING_LOG_LIMITS.errorMessage,
            }),
            workerHost: this.workerHost,
            workerPid: this.workerPid,
            workerRelease: this.workerRelease,
          },
        })
        await this.pruneOldAttempts(tx, input.trackId)
        return null
      })
    } catch (error) {
      this.reportRecorderFailure('finalize', error, { trackId: input.trackId, jobId: input.jobId })
      return undefined
    }
  }

  /** Records a job that could not even be enqueued — attempt 0, no BullMQ job ever existed. */
  async recordEnqueueFailure(input: RecordEnqueueFailureInput): Promise<void> {
    try {
      const classified = classifyProcessingError(input.error)

      await this.prisma.$transaction(async (tx) => {
        await tx.trackProcessingAttempt.create({
          data: {
            trackId: input.trackId,
            sourceFileName: input.sourceFileName,
            jobId: input.jobId,
            attempt: 0,
            maxAttempts: 0,
            trigger: input.trigger,
            status: 'FAILED',
            willRetry: false,
            finishedAt: new Date(),
            failedStep: 'CLAIM',
            errorCode: classified.code,
            errorName: errorNameOf(input.error),
            errorMessage: redactOrNull(errorMessageOf(input.error), {
              keep: 'head',
              maxBytes: PROCESSING_LOG_LIMITS.errorMessage,
            }),
            retryable: classified.retryable,
            workerHost: this.workerHost,
            workerPid: this.workerPid,
            workerRelease: this.workerRelease,
          },
        })
        await this.pruneOldAttempts(tx, input.trackId)
      })
    } catch (error) {
      this.reportRecorderFailure('recordEnqueueFailure', error, {
        trackId: input.trackId,
        jobId: input.jobId,
      })
    }
  }

  /** Logs and reports a recorder-internal failure; never rethrown. */
  private reportRecorderFailure(
    operation: string,
    error: unknown,
    context: { trackId?: string; jobId?: string },
  ): void {
    this.logger.error(
      `ProcessingAttemptRecorder.${operation} failed ${processingLogSuffix(context)}`,
      error instanceof Error ? error.stack : undefined,
    )
    Sentry.captureException(error, {
      tags: { subsystem: 'processing-log', operation, ...context },
    })
  }
}
