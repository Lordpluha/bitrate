import { provideZonelessChangeDetection } from '@angular/core'
import { TestBed } from '@angular/core/testing'
import { ListArtistAlbumsUseCase } from '@application/artists'
import type { ArtistAlbum } from '@domain/artist'
import type { Page } from '@domain/shared'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { ArtistAlbums } from './artist-albums'
import { TranslocoTestingModule } from '@jsverse/transloco'
import { DEFAULT_LOCALE, LOCALES } from '@presentation/navigation'

function album(overrides: Partial<ArtistAlbum> = {}): ArtistAlbum {
  return {
    id: '9f2504e0-4f89-41d3-9a0c-0305e82c3301',
    title: 'Test Album',
    coverUrl: null,
    type: 'ALBUM',
    totalTracks: 8,
    releaseDate: new Date('2026-01-01T00:00:00.000Z'),
    takenDownAt: null,
    createdAt: new Date('2026-09-01T00:00:00.000Z'),
    ...overrides,
  }
}

const execute = vi.fn<() => Promise<Page<ArtistAlbum>>>()

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
      { provide: ListArtistAlbumsUseCase, useValue: { execute } },
    ],
  })

  const fixture = TestBed.createComponent(ArtistAlbums)
  fixture.componentRef.setInput('artistId', 'a1')
  return fixture
}

describe('ArtistAlbums', () => {
  beforeEach(() => {
    execute.mockReset()
  })

  it('renders a row per album with its type and track count', async () => {
    execute.mockResolvedValue({
      items: [album(), album({ id: 'al2', title: 'Single', type: 'SINGLE', totalTracks: 1 })],
      total: 2,
      page: 1,
      limit: 10,
    })

    const fixture = create()
    await fixture.whenStable()

    const host = fixture.nativeElement as HTMLElement
    expect(host.querySelectorAll('tbody tr')).toHaveLength(2)
    expect(host.textContent).toContain('ALBUM')
    expect(host.textContent).toContain('SINGLE')
  })

  it('shows an em dash for an album with no release date', async () => {
    execute.mockResolvedValue({
      items: [album({ releaseDate: null })],
      total: 1,
      page: 1,
      limit: 10,
    })

    const fixture = create()
    await fixture.whenStable()

    expect((fixture.nativeElement as HTMLElement).textContent).toContain('—')
  })

  it('flags a taken-down album', async () => {
    execute.mockResolvedValue({
      items: [album({ takenDownAt: new Date('2026-09-05T00:00:00.000Z') })],
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
    ).toContain('Could not load albums.')
  })

  it('shows the empty message when the artist has no albums', async () => {
    execute.mockResolvedValue({ items: [], total: 0, page: 1, limit: 10 })

    const fixture = create()
    await fixture.whenStable()

    expect((fixture.nativeElement as HTMLElement).textContent).toContain('No albums published yet.')
  })
})
