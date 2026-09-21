import { provideZonelessChangeDetection } from '@angular/core'
import { TestBed } from '@angular/core/testing'
import { provideRouter } from '@angular/router'
import {
  GetTrackUseCase,
  ListProcessingAttemptsUseCase,
  ReprocessTrackUseCase,
  RestoreTrackUseCase,
  TakeDownTrackUseCase,
} from '@application/catalog'
import { SessionStore } from '@application/session'
import { emptyPage, type Page, ResourceWriteError } from '@domain/shared'
import type { ProcessingAttempt, TrackDetail } from '@domain/track'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { TrackDetailPage } from './track-detail'

const ADMIN_STAFF = {
  id: '3f2504e0-4f89-41d3-9a0c-0305e82c3301',
  email: 'ops@bitrate.me',
  username: 'ops',
  roleId: 'c1b1d2e3-4f5a-4b6c-8d7e-9f0a1b2c3d4e',
  roleName: 'ADMIN',
  permissions: [],
}

function detail(overrides: Partial<TrackDetail> = {}): TrackDetail {
  return {
    id: '9f2504e0-4f89-41d3-9a0c-0305e82c3301',
    title: 'Night Drive',
    artistId: '9f2504e0-4f89-41d3-9a0c-0305e82c3302',
    artistUsername: 'dj-test',
    coverUrl: null,
    processingStatus: 'READY',
    processingError: null,
    processingAttempts: 1,
    processingStartedAt: null,
    processingFinishedAt: new Date('2026-09-01T10:02:00.000Z'),
    updatedAt: new Date('2026-09-01T10:02:00.000Z'),
    takenDownAt: null,
    createdAt: new Date('2026-09-01T09:59:00.000Z'),
    audioFiles: [],
    artists: [],
    genres: [],
    albums: [],
    openReportCount: 0,
    ...overrides,
  }
}

const getTrack = vi.fn<() => Promise<TrackDetail>>()
const reprocessTrack = vi.fn<() => Promise<void>>()
const takeDownTrack = vi.fn<() => Promise<void>>()
const restoreTrack = vi.fn<() => Promise<void>>()
const listProcessingAttempts = vi.fn<() => Promise<Page<ProcessingAttempt>>>()

function create(): void {
  TestBed.resetTestingModule()
  TestBed.configureTestingModule({
    providers: [
      provideZonelessChangeDetection(),
      provideRouter([]),
      { provide: GetTrackUseCase, useValue: { execute: getTrack } },
      { provide: ReprocessTrackUseCase, useValue: { execute: reprocessTrack } },
      { provide: TakeDownTrackUseCase, useValue: { execute: takeDownTrack } },
      { provide: RestoreTrackUseCase, useValue: { execute: restoreTrack } },
      { provide: ListProcessingAttemptsUseCase, useValue: { execute: listProcessingAttempts } },
    ],
  })
  /** ADMIN holds every permission by identity — see `hasPermission`. */
  TestBed.inject(SessionStore).set(ADMIN_STAFF)
}

describe('TrackDetailPage', () => {
  beforeEach(() => {
    getTrack.mockReset()
    reprocessTrack.mockReset()
    takeDownTrack.mockReset()
    restoreTrack.mockReset()
    listProcessingAttempts.mockReset()
    listProcessingAttempts.mockResolvedValue(emptyPage())
  })

  it('renders the track title and processing state once loaded', async () => {
    getTrack.mockResolvedValue(detail())
    create()

    const fixture = TestBed.createComponent(TrackDetailPage)
    await fixture.whenStable()

    const host = fixture.nativeElement as HTMLElement
    expect(host.textContent).toContain('Night Drive')
    expect(host.textContent).toContain('READY')
  })

  it('shows the not-found message when the load rejects', async () => {
    getTrack.mockRejectedValue(new Error('404'))
    create()

    const fixture = TestBed.createComponent(TrackDetailPage)
    await fixture.whenStable()

    expect(
      (fixture.nativeElement as HTMLElement).querySelector('[role="alert"]')?.textContent,
    ).toContain('could not be found')
  })

  it('hides the restore button for a track that is not taken down', async () => {
    getTrack.mockResolvedValue(detail())
    create()

    const fixture = TestBed.createComponent(TrackDetailPage)
    await fixture.whenStable()

    const host = fixture.nativeElement as HTMLElement
    const restoreButton = Array.from(host.querySelectorAll('button')).find(
      (b) => b.textContent?.trim() === 'Restore',
    )
    expect(restoreButton).toBeUndefined()
  })

  it('hides Reprocess and Take down once a track is taken down, and shows Restore', async () => {
    getTrack.mockResolvedValue(
      detail({ processingStatus: 'FAILED', takenDownAt: new Date('2026-09-10T08:00:00.000Z') }),
    )
    create()

    const fixture = TestBed.createComponent(TrackDetailPage)
    await fixture.whenStable()

    const host = fixture.nativeElement as HTMLElement
    const labels = Array.from(host.querySelectorAll('button')).map((b) => b.textContent?.trim())
    expect(labels).not.toContain('Reprocess')
    expect(labels).not.toContain('Take down')
    expect(labels).toContain('Restore')
  })

  it('arms and confirms a take-down with the typed reason, then reloads', async () => {
    getTrack.mockResolvedValue(detail())
    takeDownTrack.mockResolvedValue(undefined)
    create()

    const fixture = TestBed.createComponent(TrackDetailPage)
    await fixture.whenStable()

    const host = fixture.nativeElement as HTMLElement
    Array.from(host.querySelectorAll('button'))
      .find((b) => b.textContent?.trim() === 'Take down')
      ?.click()
    await fixture.whenStable()

    const textarea = host.querySelector<HTMLTextAreaElement>('textarea')
    expect(textarea).not.toBeNull()
    if (textarea) {
      textarea.value = 'rights claim'
      textarea.dispatchEvent(new Event('input'))
    }
    await fixture.whenStable()

    Array.from(host.querySelectorAll('button'))
      .find((b) => b.textContent?.includes('Yes, take down'))
      ?.click()
    await fixture.whenStable()

    expect(takeDownTrack).toHaveBeenCalledWith(expect.objectContaining({ reason: 'rights claim' }))
    expect(getTrack).toHaveBeenCalledTimes(2)
  })

  it('reloads and reports a stale-state message on a 409', async () => {
    getTrack.mockResolvedValue(detail())
    takeDownTrack.mockRejectedValue(new ResourceWriteError('already-deactivated'))
    create()

    const fixture = TestBed.createComponent(TrackDetailPage)
    await fixture.whenStable()

    const host = fixture.nativeElement as HTMLElement
    Array.from(host.querySelectorAll('button'))
      .find((b) => b.textContent?.trim() === 'Take down')
      ?.click()
    await fixture.whenStable()
    Array.from(host.querySelectorAll('button'))
      .find((b) => b.textContent?.includes('Yes, take down'))
      ?.click()
    await fixture.whenStable()

    expect(host.querySelector('[role="alert"]')?.textContent).toContain('already taken down')
    expect(getTrack).toHaveBeenCalledTimes(2)
  })

  it('reprocesses without a confirm step', async () => {
    getTrack.mockResolvedValue(detail({ processingStatus: 'FAILED' }))
    reprocessTrack.mockResolvedValue(undefined)
    create()

    const fixture = TestBed.createComponent(TrackDetailPage)
    await fixture.whenStable()

    const host = fixture.nativeElement as HTMLElement
    Array.from(host.querySelectorAll('button'))
      .find((b) => b.textContent?.trim() === 'Reprocess')
      ?.click()
    await fixture.whenStable()

    expect(reprocessTrack).toHaveBeenCalled()
  })

  it('reloads the processing history after a successful reprocess', async () => {
    getTrack.mockResolvedValue(detail({ processingStatus: 'FAILED' }))
    reprocessTrack.mockResolvedValue(undefined)
    create()

    const fixture = TestBed.createComponent(TrackDetailPage)
    await fixture.whenStable()

    const host = fixture.nativeElement as HTMLElement
    const callsBeforeReprocess = listProcessingAttempts.mock.calls.length
    Array.from(host.querySelectorAll('button'))
      .find((b) => b.textContent?.trim() === 'Reprocess')
      ?.click()
    await fixture.whenStable()

    expect(listProcessingAttempts.mock.calls.length).toBeGreaterThan(callsBeforeReprocess)
  })
})
