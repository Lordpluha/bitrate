import { provideZonelessChangeDetection } from '@angular/core'
import { TestBed } from '@angular/core/testing'
import { provideRouter } from '@angular/router'
import { ListListeningHistoryUseCase } from '@application/users'
import type { Page } from '@domain/shared'
import type { ListeningHistoryEntry } from '@domain/user'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { ListeningHistory } from './listening-history'
import { TranslocoTestingModule } from '@jsverse/transloco'
import { DEFAULT_LOCALE, LOCALES } from '@presentation/navigation'

function entry(overrides: Partial<ListeningHistoryEntry> = {}): ListeningHistoryEntry {
  return {
    id: '9f2504e0-4f89-41d3-9a0c-0305e82c3301',
    listenedAt: new Date('2026-09-17T12:00:00.000Z'),
    trackId: '9f2504e0-4f89-41d3-9a0c-0305e82c3302',
    trackTitle: 'Test Track',
    artistUsername: 'dj-test',
    ...overrides,
  }
}

const execute = vi.fn<() => Promise<Page<ListeningHistoryEntry>>>()

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
      provideRouter([]),
      { provide: ListListeningHistoryUseCase, useValue: { execute } },
    ],
  })

  const fixture = TestBed.createComponent(ListeningHistory)
  fixture.componentRef.setInput('userId', 'u1')
  return fixture
}

describe('ListeningHistory', () => {
  beforeEach(() => {
    execute.mockReset()
  })

  it('renders a row per listen, newest first, linking to the played track', async () => {
    execute.mockResolvedValue({ items: [entry()], total: 1, page: 1, limit: 10 })

    const fixture = create()
    await fixture.whenStable()

    const host = fixture.nativeElement as HTMLElement
    expect(host.querySelectorAll('tbody tr')).toHaveLength(1)
    expect(host.textContent).toContain('Test Track')
    expect(host.querySelector('a')?.getAttribute('href')).toBe(
      '/catalog/9f2504e0-4f89-41d3-9a0c-0305e82c3302',
    )
  })

  it('shows the collection error state when the request rejects', async () => {
    execute.mockRejectedValue(new Error('network down'))

    const fixture = create()
    await fixture.whenStable()

    const host = fixture.nativeElement as HTMLElement
    expect(host.querySelector('[role="alert"]')?.textContent).toContain(
      'Could not load listening history.',
    )
  })

  it('shows the empty message when the listener has no history', async () => {
    execute.mockResolvedValue({ items: [], total: 0, page: 1, limit: 10 })

    const fixture = create()
    await fixture.whenStable()

    const host = fixture.nativeElement as HTMLElement
    expect(host.textContent).toContain('No listening history recorded yet.')
  })

  it('re-fetches the next page when the paginator advances', async () => {
    execute.mockResolvedValue({ items: [entry()], total: 25, page: 1, limit: 10 })

    const fixture = create()
    await fixture.whenStable()
    expect(execute).toHaveBeenCalledTimes(1)

    const host = fixture.nativeElement as HTMLElement
    const nextButton = Array.from(host.querySelectorAll('button')).find(
      (button) => button.textContent?.trim() === 'Next',
    )
    nextButton?.click()
    await fixture.whenStable()

    expect(execute).toHaveBeenCalledTimes(2)
    expect(execute).toHaveBeenLastCalledWith({ userId: 'u1', page: 2 })
  })
})
