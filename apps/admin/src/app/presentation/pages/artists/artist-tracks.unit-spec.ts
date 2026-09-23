import { provideZonelessChangeDetection } from '@angular/core'
import { TestBed } from '@angular/core/testing'
import { provideRouter } from '@angular/router'
import { ListArtistTracksUseCase } from '@application/artists'
import type { ArtistTrack } from '@domain/artist'
import type { Page } from '@domain/shared'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { ArtistTracks } from './artist-tracks'
import { TranslocoTestingModule } from '@jsverse/transloco'
import { DEFAULT_LOCALE, LOCALES } from '@presentation/navigation'

function track(overrides: Partial<ArtistTrack> = {}): ArtistTrack {
  return {
    id: '9f2504e0-4f89-41d3-9a0c-0305e82c3301',
    title: 'Test Track',
    coverUrl: null,
    processingStatus: 'READY',
    playCount: 12,
    takenDownAt: null,
    createdAt: new Date('2026-09-01T00:00:00.000Z'),
    ...overrides,
  }
}

const execute = vi.fn<() => Promise<Page<ArtistTrack>>>()

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
      { provide: ListArtistTracksUseCase, useValue: { execute } },
    ],
  })

  const fixture = TestBed.createComponent(ArtistTracks)
  fixture.componentRef.setInput('artistId', 'a1')
  return fixture
}

describe('ArtistTracks', () => {
  beforeEach(() => {
    execute.mockReset()
  })

  it('renders a row per track with its processing-status badge', async () => {
    execute.mockResolvedValue({
      items: [track(), track({ id: 't2', title: 'Broken Track', processingStatus: 'FAILED' })],
      total: 2,
      page: 1,
      limit: 10,
    })

    const fixture = create()
    await fixture.whenStable()

    const host = fixture.nativeElement as HTMLElement
    expect(host.querySelectorAll('tbody tr')).toHaveLength(2)
    expect(host.textContent).toContain('READY')
    expect(host.textContent).toContain('FAILED')
  })

  it('flags a taken-down track', async () => {
    execute.mockResolvedValue({
      items: [track({ takenDownAt: new Date('2026-09-05T00:00:00.000Z') })],
      total: 1,
      page: 1,
      limit: 10,
    })

    const fixture = create()
    await fixture.whenStable()

    expect((fixture.nativeElement as HTMLElement).textContent).toContain('taken down')
  })

  it('shows the collection error state when the request rejects', async () => {
    execute.mockRejectedValue(new Error('network down'))

    const fixture = create()
    await fixture.whenStable()

    expect(
      (fixture.nativeElement as HTMLElement).querySelector('[role="alert"]')?.textContent,
    ).toContain('Could not load tracks.')
  })

  it('shows the empty message when the artist has no tracks', async () => {
    execute.mockResolvedValue({ items: [], total: 0, page: 1, limit: 10 })

    const fixture = create()
    await fixture.whenStable()

    expect((fixture.nativeElement as HTMLElement).textContent).toContain('No tracks published yet.')
  })
})
