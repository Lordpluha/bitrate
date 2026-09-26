import { describe, expect, it } from 'vitest'
import type { ProcessingAttemptDto } from './processing-attempt.dto'
import { toProcessingAttempt } from './processing-attempt.mapper'

const dto: ProcessingAttemptDto = {
  id: '3f2504e0-4f89-41d3-9a0c-0305e82c3301',
  trackId: '3f2504e0-4f89-41d3-9a0c-0305e82c3302',
  sourceFileName: 'source.wav',
  jobId: 'job-1',
  attempt: 2,
  maxAttempts: 5,
  trigger: 'REPROCESS',
  status: 'FAILED',
  willRetry: true,
  deadLetterJobId: undefined,
  startedAt: '2026-09-01T10:00:00.000Z',
  finishedAt: '2026-09-01T10:10:00.000Z',
  durationMs: 600_000,
  lastProgress: 40,
  failedStep: 'CMAF_ENCODE',
  stepDetail: '192k',
  errorCode: 'FFMPEG_SIGNAL',
  errorName: 'FfmpegError',
  errorMessage: 'killed',
  errorStack: 'FfmpegError: killed',
  retryable: true,
  commandSummary: 'ffmpeg …',
  stderrTail: 'frame=1',
  exitCode: undefined,
  signal: 'SIGKILL',
  inputBytes: 1024,
  inputCodec: 'pcm_s16le',
  inputContainer: 'wav',
  inputBitrateKbps: 1411,
  inputDurationSec: 180,
  workerHost: 'api-1',
  workerPid: 99,
  workerRelease: 'v1.2.3',
  createdAt: '2026-09-01T10:00:00.000Z',
}

describe('toProcessingAttempt', () => {
  it('maps every enum through its own record rather than passing the wire value through', () => {
    const attempt = toProcessingAttempt(dto)

    expect(attempt.trigger).toBe('REPROCESS')
    expect(attempt.status).toBe('FAILED')
    expect(attempt.failedStep).toBe('CMAF_ENCODE')
    expect(attempt.errorCode).toBe('FFMPEG_SIGNAL')
  })

  it('turns ISO timestamps into Date objects', () => {
    const attempt = toProcessingAttempt(dto)

    expect(attempt.startedAt).toBeInstanceOf(Date)
    expect(attempt.finishedAt).toBeInstanceOf(Date)
    expect(attempt.finishedAt?.toISOString()).toBe('2026-09-01T10:10:00.000Z')
  })

  it('normalises a missing optional field to null rather than undefined', () => {
    const attempt = toProcessingAttempt(dto)

    expect(attempt.deadLetterJobId).toBeNull()
    expect(attempt.exitCode).toBeNull()
  })

  it('leaves finishedAt null for a still-running attempt', () => {
    const attempt = toProcessingAttempt({ ...dto, finishedAt: null, status: 'RUNNING' })

    expect(attempt.finishedAt).toBeNull()
  })
})
