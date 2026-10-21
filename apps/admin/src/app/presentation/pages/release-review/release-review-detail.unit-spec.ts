import { provideZonelessChangeDetection } from '@angular/core'
import { TestBed } from '@angular/core/testing'
import { provideRouter } from '@angular/router'
import { DecideReleaseUseCase, GetReleaseSubmissionUseCase } from '@application/release-review'
import type { ReleaseSubmissionDetail } from '@domain/release-review'
import { ResourceNotFoundError } from '@domain/shared'
import { TranslocoTestingModule } from '@jsverse/transloco'
import { DEFAULT_LOCALE, LOCALES } from '@presentation/navigation'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { ReleaseReviewDetailPage } from './release-review-detail'

const getRelease = vi.fn<(id: string) => Promise<ReleaseSubmissionDetail>>()

function create(): void {
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
      provideRouter([]),
      {
        provide: GetReleaseSubmissionUseCase,
        useValue: { execute: getRelease, audioUrl: () => '' },
      },
      { provide: DecideReleaseUseCase, useValue: { approve: vi.fn(), requestChanges: vi.fn() } },
    ],
  })
}

async function render(): Promise<HTMLElement> {
  const fixture = TestBed.createComponent(ReleaseReviewDetailPage)
  await fixture.whenStable()
  return fixture.nativeElement as HTMLElement
}

describe('ReleaseReviewDetailPage', () => {
  beforeEach(() => {
    getRelease.mockReset()
  })

  it('shows the not-found message when the release does not exist', async () => {
    getRelease.mockRejectedValue(new ResourceNotFoundError())
    create()

    const host = await render()

    expect(host.querySelector('[role="alert"]')?.textContent).toContain('could not be found')
  })

  it('shows a load failure, not not-found, when the load fails for another reason', async () => {
    getRelease.mockRejectedValue(new Error('500'))
    create()

    const host = await render()

    const alert = host.querySelector('[role="alert"]')
    expect(alert?.textContent).toContain('Could not load this release.')
    expect(alert?.textContent).not.toContain('could not be found')
  })
})
