import { provideZonelessChangeDetection } from '@angular/core'
import { TestBed } from '@angular/core/testing'
import { ListProcessingAttemptsUseCase } from '@application/catalog'
import type { Page } from '@domain/shared'
import type { ProcessingAttempt } from '@domain/track'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { ProcessingHistory } from './processing-history'
import { TranslocoTestingModule } from '@jsverse/transloco'
import { DEFAULT_LOCALE, LOCALES } from '@presentation/navigation'

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
    workerHost: 'api-1',
    workerPid: 42,
    workerRelease: null,
    createdAt: new Date('2026-09-01T10:00:00.000Z'),
    ...overrides,
  }
}

const execute = vi.fn<() => Promise<Page<ProcessingAttempt>>>()

function create() {
  TestBed.resetTestingModule()
  TestBed.configureTestingModule({
    imports: [
      TranslocoTestingModule.forRoot({
        langs: { en: {}, uk: {} },
        translocoConfig: { availableLangs: [...LOCALES], defaultLang: DEFAULT_LOCALE },
      }),
    ],
    providers: [
      provideZonelessChangeDetection(),
      { provide: ListProcessingAttemptsUseCase, useValue: { execute } },
    ],
  })

  const fixture = TestBed.createComponent(ProcessingHistory)
  fixture.componentRef.setInput('trackId', 't1')
  return fixture
}

describe('ProcessingHistory', () => {
  beforeEach(() => {
    execute.mockReset()
  })

  it('renders a row per attempt with its outcome badge', async () => {
    execute.mockResolvedValue({
      items: [attempt(), attempt({ id: 'a2', attempt: 2, status: 'FAILED', errorCode: 'TIMEOUT' })],
      total: 2,
      page: 1,
      limit: 10,
    })

    const fixture = create()
    await fixture.whenStable()

    const host = fixture.nativeElement as HTMLElement
    const rows = host.querySelectorAll('tbody tr')
    expect(rows).toHaveLength(2)
    expect(host.textContent).toContain('Succeeded')
    expect(host.textContent).toContain('Failed')
    expect(host.textContent).toContain('TIMEOUT')
  })

  it('shows a failed row"s diagnostics disclosure and hides it for a clean success', async () => {
    execute.mockResolvedValue({
      items: [
        attempt(),
        attempt({
          id: 'a2',
          attempt: 2,
          status: 'FAILED',
          errorCode: 'TIMEOUT',
          commandSummary: 'ffmpeg …',
        }),
      ],
      total: 2,
      page: 1,
      limit: 10,
    })

    const fixture = create()
    await fixture.whenStable()

    const host = fixture.nativeElement as HTMLElement
    expect(host.querySelectorAll('app-processing-attempt-diagnostics')).toHaveLength(1)
  })

  it('shows the collection error state when the request rejects', async () => {
    execute.mockRejectedValue(new Error('network down'))

    const fixture = create()
    await fixture.whenStable()

    const host = fixture.nativeElement as HTMLElement
    expect(host.querySelector('[role="alert"]')?.textContent).toContain(
      'Could not load processing history.',
    )
  })

  it('shows the legacy pre-history message when there are no attempts and the track failed', async () => {
    execute.mockResolvedValue({ items: [], total: 0, page: 1, limit: 10 })

    const fixture = create()
    fixture.componentRef.setInput('legacyStatus', 'FAILED')
    fixture.componentRef.setInput('legacyError', 'ffmpeg exited with 1')
    await fixture.whenStable()

    const host = fixture.nativeElement as HTMLElement
    expect(host.textContent).toContain('Last recorded error (before history was kept)')
    expect(host.textContent).toContain('ffmpeg exited with 1')
  })

  it('shows the plain empty message when there is no legacy error to fall back to', async () => {
    execute.mockResolvedValue({ items: [], total: 0, page: 1, limit: 10 })

    const fixture = create()
    await fixture.whenStable()

    const host = fixture.nativeElement as HTMLElement
    expect(host.textContent).toContain('No processing attempts recorded yet.')
    expect(host.textContent).not.toContain('Last recorded error')
  })

  it('reload() re-fetches the current page', async () => {
    execute.mockResolvedValue({ items: [attempt()], total: 1, page: 1, limit: 10 })

    const fixture = create()
    await fixture.whenStable()
    expect(execute).toHaveBeenCalledTimes(1)

    await fixture.componentInstance.reload()

    expect(execute).toHaveBeenCalledTimes(2)
  })
})
