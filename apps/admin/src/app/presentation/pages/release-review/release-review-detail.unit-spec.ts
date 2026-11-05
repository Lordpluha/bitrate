import { provideZonelessChangeDetection } from '@angular/core'
import { TestBed } from '@angular/core/testing'
import { provideRouter } from '@angular/router'
import {
  DecideReleaseUseCase,
  GetReleaseSubmissionUseCase,
  RetryPublishingUseCase,
  TakeDownReleaseUseCase,
} from '@application/release-review'
import { SessionStore } from '@application/session'
import type { Permission } from '@domain/access'
import {
  type ApproveSubmissionInput,
  type ReleaseSubmissionDetail,
  ReleaseReviewError,
  type RequestSubmissionChangesInput,
  type SubmissionReview,
} from '@domain/release-review'
import { ResourceNotFoundError } from '@domain/shared'
import { provideTestTransloco } from '@testing/transloco'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { ReleaseReviewDetailPage } from './release-review-detail'

const getRelease = vi.fn<(id: string) => Promise<ReleaseSubmissionDetail>>()
const approve = vi.fn<(input: ApproveSubmissionInput) => Promise<SubmissionReview>>()
const requestChanges = vi.fn<(input: RequestSubmissionChangesInput) => Promise<SubmissionReview>>()
const retryPublishing = vi.fn<(release: ReleaseSubmissionDetail) => Promise<void>>()
const takeDown = vi.fn<(release: ReleaseSubmissionDetail) => Promise<void>>()

function release(overrides: Partial<ReleaseSubmissionDetail> = {}): ReleaseSubmissionDetail {
  return {
    id: '3f2504e0-4f89-41d3-9a0c-0305e82c3301',
    title: 'Static Lines',
    kind: 'EP',
    status: 'SUBMITTED',
    coverUrl: null,
    submittedAt: new Date('2026-10-20T09:00:00.000Z'),
    updatedAt: new Date('2026-10-20T09:00:00.000Z'),
    artistId: '3f2504e0-4f89-41d3-9a0c-0305e82c3302',
    artistUsername: 'kite.harbor',
    trackCount: 1,
    upc: null,
    scheduledAt: null,
    masterOwnerType: 'ARTIST',
    masterOwnerName: null,
    writersConfirmedAt: new Date('2026-10-19T09:00:00.000Z'),
    accuracyConfirmedAt: null,
    tracks: [
      {
        id: 't1',
        title: 'Ferry Lights',
        durationSeconds: 252,
        isrc: 'USX9P2600012',
        audioFileName: 'ferry-lights.wav',
        hasAudio: false,
      },
    ],
    contributors: [],
    splits: [],
    territories: [],
    destinations: ['SPOTIFY'],
    blockerCodes: ['COVER_MISSING'],
    noticeCodes: [],
    reviews: [],
    ...overrides,
  }
}

const review: SubmissionReview = {
  id: 'r1',
  decision: 'APPROVED',
  message: null,
  createdAt: new Date('2026-10-22T09:00:00.000Z'),
  reviewerUsername: 'mara.ops',
}

function create(permissions: Permission[] = ['releases:read', 'releases:review']): void {
  TestBed.resetTestingModule()
  TestBed.configureTestingModule({
    providers: [
      ...provideTestTransloco(),
      provideZonelessChangeDetection(),
      provideRouter([]),
      {
        provide: GetReleaseSubmissionUseCase,
        useValue: { execute: getRelease, audioUrl: () => '' },
      },
      { provide: DecideReleaseUseCase, useValue: { approve, requestChanges } },
      { provide: RetryPublishingUseCase, useValue: { execute: retryPublishing } },
      { provide: TakeDownReleaseUseCase, useValue: { execute: takeDown } },
    ],
  })
  TestBed.inject(SessionStore).set({
    id: '3f2504e0-4f89-41d3-9a0c-0305e82c3399',
    email: 'ops@bitrate.me',
    username: 'ops',
    roleId: 'c1b1d2e3-4f5a-4b6c-8d7e-9f0a1b2c3d4e',
    roleName: 'CURATOR',
    permissions,
  })
}

async function render() {
  const fixture = TestBed.createComponent(ReleaseReviewDetailPage)
  await fixture.whenStable()
  const host = fixture.nativeElement as HTMLElement
  const button = (root: ParentNode | null, text: string) =>
    Array.from(root?.querySelectorAll<HTMLButtonElement>('button') ?? []).find(
      (candidate) => candidate.textContent?.trim() === text,
    )
  const dialog = () => document.body.querySelector('[data-slot="dialog-content"]')
  return { fixture, host, button, dialog }
}

describe('ReleaseReviewDetailPage', () => {
  beforeEach(() => {
    getRelease.mockReset()
    approve.mockReset().mockResolvedValue(review)
    requestChanges.mockReset().mockResolvedValue({ ...review, decision: 'CHANGES_REQUESTED' })
    retryPublishing.mockReset().mockResolvedValue(undefined)
    takeDown.mockReset().mockResolvedValue(undefined)
  })

  it('shows the not-found message when the release does not exist', async () => {
    getRelease.mockRejectedValue(new ResourceNotFoundError())
    create()
    const { host } = await render()

    expect(host.querySelector('[role="alert"]')?.textContent).toContain('Release not found')
  })

  it('shows a load failure, not not-found, when the load fails for another reason', async () => {
    getRelease.mockRejectedValue(new Error('500'))
    create()
    const { host } = await render()

    const alert = host.querySelector('[role="alert"]')
    expect(alert?.textContent).toContain('Couldn’t load this release')
    expect(alert?.textContent).not.toContain('Release not found')
  })

  it('loads again from Try again and drops the failure once it succeeds', async () => {
    getRelease.mockRejectedValueOnce(new Error('500')).mockResolvedValue(release())
    create()
    const { fixture, host, button } = await render()

    button(host, 'Try again')?.click()
    await fixture.whenStable()

    expect(host.querySelector('[role="alert"]')).toBeNull()
    expect(host.querySelector('h1')?.textContent).toContain('Static Lines')
  })

  it('lays out what a reviewer checks: confirmations, blockers and recordings', async () => {
    getRelease.mockResolvedValue(release())
    create()
    const { host } = await render()

    expect(host.textContent).toContain('1 of 2 confirmed')
    expect(host.textContent).toContain('No artwork')
    expect(host.textContent).toContain('Ferry Lights')
    expect(host.textContent).toContain('No audio')
    expect(host.textContent).toContain('Worldwide')
  })

  it('approves after the reviewer confirms, then says so', async () => {
    getRelease.mockResolvedValue(release())
    create()
    const { fixture, host, button, dialog } = await render()

    button(host, 'Approve')?.click()
    await fixture.whenStable()
    expect(dialog()?.textContent).toContain('Approve “Static Lines”?')
    expect(approve).not.toHaveBeenCalled()

    button(dialog(), 'Approve release')?.click()
    await fixture.whenStable()

    expect(approve).toHaveBeenCalledWith(expect.objectContaining({ message: '' }))
    expect(host.querySelector('[role="status"]')?.textContent).toContain(
      '“Static Lines” was approved',
    )
  })

  it('will not send a change request without feedback', async () => {
    getRelease.mockResolvedValue(release())
    create()
    const { fixture, host, button, dialog } = await render()

    button(host, 'Request changes')?.click()
    await fixture.whenStable()
    const send = button(dialog(), 'Send to artist')
    expect(send?.disabled).toBe(true)

    const field = dialog()?.querySelector<HTMLTextAreaElement>('#review-message')
    if (field) {
      field.value = '**Artwork:** replace it'
      field.dispatchEvent(new Event('input'))
    }
    await fixture.whenStable()
    send?.click()
    await fixture.whenStable()

    expect(requestChanges).toHaveBeenCalledWith(
      expect.objectContaining({ message: '**Artwork:** replace it' }),
    )
  })

  it('explains a stale decision and reloads the release', async () => {
    getRelease.mockResolvedValue(release())
    approve.mockRejectedValue(new ReleaseReviewError('stale'))
    create()
    const { fixture, host, button, dialog } = await render()

    button(host, 'Approve')?.click()
    await fixture.whenStable()
    button(dialog(), 'Approve release')?.click()
    await fixture.whenStable()

    expect(host.querySelector('[role="alert"]')?.textContent).toContain(
      'The release changed or was already decided',
    )
    expect(getRelease).toHaveBeenCalledTimes(2)
  })

  it('shows not-found instead of the old release when it was withdrawn during the decision', async () => {
    getRelease.mockResolvedValueOnce(release()).mockRejectedValue(new ResourceNotFoundError())
    approve.mockRejectedValue(new ReleaseReviewError('stale'))
    create()
    const { fixture, host, button, dialog } = await render()

    button(host, 'Approve')?.click()
    await fixture.whenStable()
    button(dialog(), 'Approve release')?.click()
    await fixture.whenStable()

    expect(host.textContent).toContain('Release not found')
    expect(button(host, 'Approve')).toBeUndefined()
    expect(button(host, 'Request changes')).toBeUndefined()
  })

  it('offers no decision without releases:review, and says why', async () => {
    getRelease.mockResolvedValue(release())
    create(['releases:read'])
    const { host, button } = await render()

    expect(button(host, 'Approve')).toBeUndefined()
    expect(host.textContent).toContain('needs the releases:review permission')
  })

  it('offers no decision on a release that is not awaiting review', async () => {
    getRelease.mockResolvedValue(release({ status: 'READY' }))
    create()
    const { host, button } = await render()

    expect(button(host, 'Approve')).toBeUndefined()
    expect(host.textContent).toContain('isn’t awaiting review')
  })

  it('retries a failed publication and says so', async () => {
    const failed = release({ status: 'PUBLISH_FAILED' })
    getRelease.mockResolvedValue(failed)
    create()
    const { fixture, host, button } = await render()

    expect(button(host, 'Take offline')).toBeUndefined()
    button(host, 'Retry publishing')?.click()
    await fixture.whenStable()

    expect(retryPublishing).toHaveBeenCalledWith(failed)
    expect(host.querySelector('[role="status"]')?.textContent).toContain('restarted')
  })

  it('takes a live release offline', async () => {
    const live = release({ status: 'RELEASED' })
    getRelease.mockResolvedValue(live)
    create()
    const { fixture, host, button } = await render()

    expect(button(host, 'Retry publishing')).toBeUndefined()
    button(host, 'Take offline')?.click()
    await fixture.whenStable()

    expect(takeDown).toHaveBeenCalledWith(live)
  })

  it('offers no publication actions without releases:review', async () => {
    getRelease.mockResolvedValue(release({ status: 'PUBLISH_FAILED' }))
    create(['releases:read'])
    const { host, button } = await render()

    expect(button(host, 'Retry publishing')).toBeUndefined()
  })
})
