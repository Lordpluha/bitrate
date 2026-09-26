import { describe, expect, it } from 'vitest'
import {
  attemptOutcomeLabel,
  hasDiagnostics,
  isAttemptRunningTooLong,
  type ProcessingAttempt,
} from './processing-attempt'

function attempt(overrides: Partial<ProcessingAttempt> = {}): ProcessingAttempt {
  return {
    id: '9f2504e0-4f89-41d3-9a0c-0305e82c3301',
    trackId: '9f2504e0-4f89-41d3-9a0c-0305e82c3302',
    sourceFileName: 'source.wav',
    jobId: 'job-1',
    attempt: 1,
    maxAttempts: 5,
    trigger: 'UPLOAD',
    status: 'SUCCEEDED',
    willRetry: false,
    deadLetterJobId: null,
    startedAt: new Date('2026-09-01T10:00:00.000Z'),
    finishedAt: new Date('2026-09-01T10:02:00.000Z'),
    durationMs: 120_000,
    lastProgress: 100,
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
    inputBytes: null,
    inputCodec: null,
    inputContainer: null,
    inputBitrateKbps: null,
    inputDurationSec: null,
    workerHost: 'worker-1',
    workerPid: 42,
    workerRelease: null,
    createdAt: new Date('2026-09-01T10:00:00.000Z'),
    ...overrides,
  }
}

describe('attemptOutcomeLabel', () => {
  it('labels every status', () => {
    expect(attemptOutcomeLabel(attempt({ status: 'RUNNING' }))).toBe('Running')
    expect(attemptOutcomeLabel(attempt({ status: 'SUCCEEDED' }))).toBe('Succeeded')
    expect(attemptOutcomeLabel(attempt({ status: 'FAILED' }))).toBe('Failed')
    expect(attemptOutcomeLabel(attempt({ status: 'SUPERSEDED' }))).toBe('Superseded')
    expect(attemptOutcomeLabel(attempt({ status: 'STALLED' }))).toBe('Stalled')
  })
})

describe('hasDiagnostics', () => {
  it('is false for a clean success with nothing to show', () => {
    expect(hasDiagnostics(attempt())).toBe(false)
  })

  it('is true when a command summary is present', () => {
    expect(hasDiagnostics(attempt({ commandSummary: 'ffmpeg -i in.wav out.opus' }))).toBe(true)
  })

  it('is true when only an error message is present', () => {
    expect(hasDiagnostics(attempt({ errorMessage: 'exit code 1' }))).toBe(true)
  })
})

describe('isAttemptRunningTooLong', () => {
  const now = new Date('2026-09-01T11:00:00.000Z')

  it('is false for a non-RUNNING attempt regardless of age', () => {
    const old = attempt({ status: 'FAILED', startedAt: new Date('2026-09-01T00:00:00.000Z') })

    expect(isAttemptRunningTooLong({ attempt: old, now })).toBe(false)
  })

  it('is false for a RUNNING attempt well within the threshold', () => {
    const recent = attempt({ status: 'RUNNING', startedAt: new Date('2026-09-01T10:55:00.000Z') })

    expect(isAttemptRunningTooLong({ attempt: recent, now })).toBe(false)
  })

  it('is true for a RUNNING attempt started more than 30 minutes ago', () => {
    const stuck = attempt({ status: 'RUNNING', startedAt: new Date('2026-09-01T10:00:00.000Z') })

    expect(isAttemptRunningTooLong({ attempt: stuck, now })).toBe(true)
  })
})
