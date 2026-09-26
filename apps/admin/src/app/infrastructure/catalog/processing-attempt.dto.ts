import type { ApiSchemas } from '@bitrate/contracts'
import { z } from 'zod'
import { contractEnum } from '../http/contract-union'

type Entity = ApiSchemas['AdminTrackProcessingAttemptEntity']

export type WireProcessingAttemptTrigger = Entity['trigger']
export type WireProcessingAttemptStatus = Entity['status']
export type WireProcessingStep = NonNullable<Entity['failedStep']>
export type WireProcessingErrorCode = NonNullable<Entity['errorCode']>

const triggerDto = contractEnum<WireProcessingAttemptTrigger>()(['UPLOAD', 'REPLACE', 'REPROCESS'])

const statusDto = contractEnum<WireProcessingAttemptStatus>()([
  'RUNNING',
  'SUCCEEDED',
  'FAILED',
  'SUPERSEDED',
  'STALLED',
])

const stepDto = contractEnum<WireProcessingStep>()([
  'CLAIM',
  'PREPARE_TEMP',
  'PROGRESSIVE_ENCODE',
  'HLS_ENCODE',
  'HLS_VALIDATE',
  'CMAF_ENCODE',
  'UPLOAD',
  'PUBLISH',
  'CLEANUP',
])

const errorCodeDto = contractEnum<WireProcessingErrorCode>()([
  'FFMPEG_EXIT',
  'FFMPEG_SIGNAL',
  'TIMEOUT',
  'INVALID_INPUT',
  'EMPTY_OUTPUT',
  'STORAGE',
  'DATABASE',
  'STALLED',
  'UNKNOWN',
])

type ContractProcessingAttempt = Pick<
  Entity,
  | 'id'
  | 'trackId'
  | 'sourceFileName'
  | 'jobId'
  | 'attempt'
  | 'maxAttempts'
  | 'trigger'
  | 'status'
  | 'willRetry'
  | 'deadLetterJobId'
  | 'startedAt'
  | 'finishedAt'
  | 'durationMs'
  | 'lastProgress'
  | 'failedStep'
  | 'stepDetail'
  | 'errorCode'
  | 'errorName'
  | 'errorMessage'
  | 'errorStack'
  | 'retryable'
  | 'commandSummary'
  | 'stderrTail'
  | 'exitCode'
  | 'signal'
  | 'inputBytes'
  | 'inputCodec'
  | 'inputContainer'
  | 'inputBitrateKbps'
  | 'inputDurationSec'
  | 'workerHost'
  | 'workerPid'
  | 'workerRelease'
  | 'createdAt'
>

const processingAttemptDto = z.object({
  id: z.uuid(),
  trackId: z.uuid(),
  sourceFileName: z.string(),
  jobId: z.string(),
  attempt: z.number().int(),
  maxAttempts: z.number().int(),
  trigger: triggerDto,
  status: statusDto,
  willRetry: z.boolean(),
  deadLetterJobId: z.string().nullish(),
  startedAt: z.iso.datetime(),
  finishedAt: z.iso.datetime().nullish(),
  durationMs: z.number().int().nullish(),
  lastProgress: z.number().int(),
  failedStep: stepDto.nullish(),
  stepDetail: z.string().nullish(),
  errorCode: errorCodeDto.nullish(),
  errorName: z.string().nullish(),
  errorMessage: z.string().nullish(),
  errorStack: z.string().nullish(),
  retryable: z.boolean().nullish(),
  commandSummary: z.string().nullish(),
  stderrTail: z.string().nullish(),
  exitCode: z.number().int().nullish(),
  signal: z.string().nullish(),
  inputBytes: z.number().int().nullish(),
  inputCodec: z.string().nullish(),
  inputContainer: z.string().nullish(),
  inputBitrateKbps: z.number().int().nullish(),
  inputDurationSec: z.number().int().nullish(),
  workerHost: z.string(),
  workerPid: z.number().int(),
  workerRelease: z.string().nullish(),
  createdAt: z.iso.datetime(),
}) satisfies z.ZodType<ContractProcessingAttempt>

export type ProcessingAttemptDto = z.infer<typeof processingAttemptDto>

type ContractProcessingAttemptPage = Omit<
  ApiSchemas['PaginatedAdminTrackProcessingAttemptsEntity'],
  'data'
> & {
  data: ContractProcessingAttempt[]
}

export const processingAttemptPageDto = z.object({
  data: z.array(processingAttemptDto),
  total: z.number().int(),
  page: z.number().int(),
  limit: z.number().int(),
}) satisfies z.ZodType<ContractProcessingAttemptPage>
