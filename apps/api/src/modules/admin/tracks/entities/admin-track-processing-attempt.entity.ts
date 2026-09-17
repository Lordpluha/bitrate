import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import {
  TrackProcessingAttemptStatus,
  TrackProcessingErrorCode,
  TrackProcessingStep,
  TrackProcessingTrigger,
} from '@prisma/client'

/** One recorded attempt of the audio-processing pipeline for a track. Successes are compact;
 * failures carry the redacted step/error detail the operator panel needs — see ADR-0040. */
export class AdminTrackProcessingAttemptEntity {
  /** The id value. */
  @ApiProperty()
  id: string

  /** The owning track's id. */
  @ApiProperty()
  trackId: string

  /** The generation of the source file this attempt encoded. */
  @ApiProperty()
  sourceFileName: string

  /** The BullMQ job id. */
  @ApiProperty()
  jobId: string

  /** 1-based attempt number for this job. */
  @ApiProperty()
  attempt: number

  /** The maximum number of attempts BullMQ will make for this job. */
  @ApiProperty()
  maxAttempts: number

  /** What triggered this generation's processing. */
  @ApiProperty({ enum: TrackProcessingTrigger, enumName: 'TrackProcessingTrigger' })
  trigger: TrackProcessingTrigger

  /** The outcome of this attempt. */
  @ApiProperty({ enum: TrackProcessingAttemptStatus, enumName: 'TrackProcessingAttemptStatus' })
  status: TrackProcessingAttemptStatus

  /** Whether this attempt failed and BullMQ will retry it. */
  @ApiProperty()
  willRetry: boolean

  /** The dead-letter queue job id, set on the exhausted attempt. */
  @ApiPropertyOptional({ nullable: true })
  deadLetterJobId: string | null

  /** When this attempt started. */
  @ApiProperty()
  startedAt: Date

  /** When this attempt finished, if it has. */
  @ApiPropertyOptional({ nullable: true })
  finishedAt: Date | null

  /** How long this attempt ran, in milliseconds. */
  @ApiPropertyOptional({ nullable: true })
  durationMs: number | null

  /** The last progress percentage reported. */
  @ApiProperty()
  lastProgress: number

  /** The pipeline step that failed, if any. */
  @ApiPropertyOptional({
    enum: TrackProcessingStep,
    enumName: 'TrackProcessingStep',
    nullable: true,
  })
  failedStep: TrackProcessingStep | null

  /** Extra detail about the failed step, e.g. the bitrate being encoded. */
  @ApiPropertyOptional({ nullable: true })
  stepDetail: string | null

  /** The classified error code, if this attempt failed. */
  @ApiPropertyOptional({
    enum: TrackProcessingErrorCode,
    enumName: 'TrackProcessingErrorCode',
    nullable: true,
  })
  errorCode: TrackProcessingErrorCode | null

  /** The error's constructor name. */
  @ApiPropertyOptional({ nullable: true })
  errorName: string | null

  /** The redacted error message. */
  @ApiPropertyOptional({ nullable: true })
  errorMessage: string | null

  /** The redacted error stack trace. */
  @ApiPropertyOptional({ nullable: true })
  errorStack: string | null

  /** Whether the error is believed to be transient. Advisory — see ADR-0040. */
  @ApiPropertyOptional({ nullable: true })
  retryable: boolean | null

  /** The redacted FFmpeg command line, if this attempt ran one. */
  @ApiPropertyOptional({ nullable: true })
  commandSummary: string | null

  /** The redacted tail of FFmpeg's stderr output. */
  @ApiPropertyOptional({ nullable: true })
  stderrTail: string | null

  /** The FFmpeg process exit code, if it exited non-zero. */
  @ApiPropertyOptional({ nullable: true })
  exitCode: number | null

  /** The signal that killed the FFmpeg process, if any. */
  @ApiPropertyOptional({ nullable: true })
  signal: string | null

  /** The input file's size in bytes. */
  @ApiPropertyOptional({ nullable: true })
  inputBytes: number | null

  /** The input file's audio codec. */
  @ApiPropertyOptional({ nullable: true })
  inputCodec: string | null

  /** The input file's container format. */
  @ApiPropertyOptional({ nullable: true })
  inputContainer: string | null

  /** The input file's bitrate in kbps. */
  @ApiPropertyOptional({ nullable: true })
  inputBitrateKbps: number | null

  /** The input file's duration in seconds. */
  @ApiPropertyOptional({ nullable: true })
  inputDurationSec: number | null

  /** The hostname of the worker that ran this attempt. */
  @ApiProperty()
  workerHost: string

  /** The process id of the worker that ran this attempt. */
  @ApiProperty()
  workerPid: number

  /** The worker's release identifier, null outside production. */
  @ApiPropertyOptional({ nullable: true })
  workerRelease: string | null

  /** The created at value. */
  @ApiProperty()
  createdAt: Date
}
