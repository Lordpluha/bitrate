import { describe, expect, it } from 'vitest'
import { processingAttemptPageDto } from './processing-attempt.dto'

const apiRow = {
  id: '3f2504e0-4f89-41d3-9a0c-0305e82c3301',
  trackId: '3f2504e0-4f89-41d3-9a0c-0305e82c3302',
  sourceFileName: 'source.wav',
  jobId: 'job-1',
  attempt: 1,
  maxAttempts: 5,
  trigger: 'UPLOAD',
  status: 'FAILED',
  willRetry: true,
  deadLetterJobId: null,
  startedAt: '2026-09-01T10:00:00.000Z',
  finishedAt: '2026-09-01T10:10:00.000Z',
  durationMs: 600_000,
  lastProgress: 40,
  failedStep: 'HLS_ENCODE',
  stepDetail: '192k',
  errorCode: 'TIMEOUT',
  errorName: 'FfmpegError',
  errorMessage: 'ffmpeg timed out',
  errorStack: 'FfmpegError: timed out\n    at runFfmpeg',
  retryable: false,
  commandSummary: 'ffmpeg -i <tracks>/source.wav -c:a libopus out.opus',
  stderrTail: 'frame= 100',
  exitCode: null,
  signal: null,
  inputBytes: 1_048_576,
  inputCodec: 'pcm_s16le',
  inputContainer: 'wav',
  inputBitrateKbps: 1411,
  inputDurationSec: 180,
  workerHost: 'api-1',
  workerPid: 4242,
  workerRelease: 'v1.2.3',
  createdAt: '2026-09-01T10:00:00.000Z',
}

const apiPage = { data: [apiRow], total: 1, page: 1, limit: 10 }

describe('processingAttemptPageDto', () => {
  it('accepts a full failed row the way the API sends it', () => {
    const parsed = processingAttemptPageDto.parse(apiPage)

    expect(parsed.data[0]?.errorCode).toBe('TIMEOUT')
    expect(parsed.data[0]?.stepDetail).toBe('192k')
  })

  it('accepts a compact successful row with every optional field null', () => {
    const succeeded = {
      ...apiRow,
      status: 'SUCCEEDED',
      willRetry: false,
      deadLetterJobId: null,
      failedStep: null,
      stepDetail: null,
      errorCode: null,
      errorName: null,
      errorMessage: null,
      errorStack: null,
      retryable: null,
      commandSummary: null,
      stderrTail: null,
      exitCode: null,
      signal: null,
    }

    const parsed = processingAttemptPageDto.parse({ ...apiPage, data: [succeeded] })

    expect(parsed.data[0]?.status).toBe('SUCCEEDED')
  })

  it('accepts a row that omits optional fields entirely rather than sending null', () => {
    const { deadLetterJobId: _d, finishedAt: _f, durationMs: _dur, ...rest } = apiRow

    const parsed = processingAttemptPageDto.parse({ ...apiPage, data: [rest] })

    expect(parsed.data[0]?.finishedAt).toBeUndefined()
  })

  it('rejects an unknown status it does not handle', () => {
    const unknown = { ...apiRow, status: 'QUEUED' }

    expect(() => processingAttemptPageDto.parse({ ...apiPage, data: [unknown] })).toThrow()
  })

  it('rejects an unknown error code it does not handle', () => {
    const unknown = { ...apiRow, errorCode: 'MYSTERY' }

    expect(() => processingAttemptPageDto.parse({ ...apiPage, data: [unknown] })).toThrow()
  })

  it('rejects an unknown trigger it does not handle', () => {
    const unknown = { ...apiRow, trigger: 'MANUAL' }

    expect(() => processingAttemptPageDto.parse({ ...apiPage, data: [unknown] })).toThrow()
  })

  it('rejects an unknown failed step it does not handle', () => {
    const unknown = { ...apiRow, failedStep: 'DOWNLOAD' }

    expect(() => processingAttemptPageDto.parse({ ...apiPage, data: [unknown] })).toThrow()
  })
})
