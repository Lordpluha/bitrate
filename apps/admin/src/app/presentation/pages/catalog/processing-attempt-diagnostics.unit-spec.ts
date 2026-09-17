import { provideZonelessChangeDetection } from '@angular/core'
import { TestBed } from '@angular/core/testing'
import type { ProcessingAttempt } from '@domain/track'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { ProcessingAttemptDiagnostics } from './processing-attempt-diagnostics'

function attempt(overrides: Partial<ProcessingAttempt> = {}): ProcessingAttempt {
  return {
    id: '9f2504e0-4f89-41d3-9a0c-0305e82c3301',
    trackId: '9f2504e0-4f89-41d3-9a0c-0305e82c3302',
    sourceFileName: 'source.wav',
    jobId: 'job-1',
    attempt: 3,
    maxAttempts: 5,
    trigger: 'UPLOAD',
    status: 'FAILED',
    willRetry: true,
    deadLetterJobId: null,
    startedAt: new Date('2026-09-01T10:00:00.000Z'),
    finishedAt: new Date('2026-09-01T10:10:00.000Z'),
    durationMs: 600_000,
    lastProgress: 40,
    failedStep: 'HLS_ENCODE',
    stepDetail: '192k',
    errorCode: 'TIMEOUT',
    errorName: 'FfmpegError',
    errorMessage: 'ffmpeg timed out',
    errorStack: 'FfmpegError: timed out',
    retryable: false,
    commandSummary: 'ffmpeg -i <tracks>/source.wav',
    stderrTail: 'frame=100',
    exitCode: null,
    signal: null,
    inputBytes: null,
    inputCodec: null,
    inputContainer: null,
    inputBitrateKbps: null,
    inputDurationSec: null,
    workerHost: 'api-1',
    workerPid: 42,
    workerRelease: null,
    createdAt: new Date('2026-09-01T10:00:00.000Z'),
    ...overrides,
  }
}

function create(a: ProcessingAttempt) {
  TestBed.resetTestingModule()
  TestBed.configureTestingModule({ providers: [provideZonelessChangeDetection()] })

  const fixture = TestBed.createComponent(ProcessingAttemptDiagnostics)
  fixture.componentRef.setInput('attempt', a)
  return fixture
}

describe('ProcessingAttemptDiagnostics', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('starts collapsed with aria-expanded false and no content in the DOM', async () => {
    const fixture = create(attempt())
    await fixture.whenStable()

    const host = fixture.nativeElement as HTMLElement
    const trigger = host.querySelector('button') as HTMLButtonElement
    expect(trigger.getAttribute('aria-expanded')).toBe('false')
    expect(host.querySelector('pre')).toBeNull()
  })

  it('expands on click, exposing aria-controls pointing at the revealed content id', async () => {
    const fixture = create(attempt())
    await fixture.whenStable()

    const host = fixture.nativeElement as HTMLElement
    const trigger = host.querySelector('button') as HTMLButtonElement
    trigger.click()
    await fixture.whenStable()

    expect(trigger.getAttribute('aria-expanded')).toBe('true')
    const controlsId = trigger.getAttribute('aria-controls')
    expect(controlsId).toBeTruthy()
    expect(host.querySelector(`#${controlsId}`)).not.toBeNull()
    expect(host.querySelector('pre')?.textContent).toContain('ffmpeg -i')
  })

  it('is keyboard-operable because it is a native button', async () => {
    const fixture = create(attempt())
    await fixture.whenStable()

    const trigger = (fixture.nativeElement as HTMLElement).querySelector(
      'button',
    ) as HTMLButtonElement
    expect(trigger.tagName).toBe('BUTTON')
    expect(trigger.type).toBe('button')
  })

  it('copies the diagnostics text to the clipboard and announces success', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined)
    vi.stubGlobal('navigator', { clipboard: { writeText } })

    const fixture = create(attempt())
    await fixture.whenStable()

    const host = fixture.nativeElement as HTMLElement
    host.querySelector('button')?.click()
    await fixture.whenStable()

    const copyButton = Array.from(host.querySelectorAll('button')).find((b) =>
      b.textContent?.includes('Copy diagnostics'),
    )
    copyButton?.click()
    await fixture.whenStable()

    expect(writeText).toHaveBeenCalledWith(expect.stringContaining('ffmpeg -i'))
    expect(host.querySelector('[aria-live="polite"]')?.textContent).toContain('Copied')
  })

  it('announces a graceful failure when the clipboard is unavailable', async () => {
    const writeText = vi.fn().mockRejectedValue(new Error('denied'))
    vi.stubGlobal('navigator', { clipboard: { writeText } })

    const fixture = create(attempt())
    await fixture.whenStable()

    const host = fixture.nativeElement as HTMLElement
    host.querySelector('button')?.click()
    await fixture.whenStable()

    const copyButton = Array.from(host.querySelectorAll('button')).find((b) =>
      b.textContent?.includes('Copy diagnostics'),
    )
    copyButton?.click()
    await fixture.whenStable()

    expect(host.querySelector('[aria-live="polite"]')?.textContent).toContain('Could not copy')
  })
})
