import { Location } from '@angular/common'
import { provideLocationMocks } from '@angular/common/testing'
import { provideZonelessChangeDetection } from '@angular/core'
import { TestBed } from '@angular/core/testing'
import { provideRouter, type Routes } from '@angular/router'
import { RouterTestingHarness } from '@angular/router/testing'
import {
  type Artist,
  ArtistRepository,
  type ArtistDetail,
  type ListArtistsQuery,
  type SetArtistVerificationInput,
} from '@domain/artist'
import type { Page, TakeDownInput } from '@domain/shared'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { ArtistsPage } from './artists'

function artist(overrides: Partial<Artist> = {}): Artist {
  return {
    id: '3f2504e0-4f89-41d3-9a0c-0305e82c3301',
    username: 'dj-test',
    email: 'dj@example.com',
    verified: false,
    monthlyListeners: 0,
    country: null,
    createdAt: new Date('2026-09-01T09:59:00.000Z'),
    deactivatedAt: null,
    ...overrides,
  }
}

const list = vi.fn<(query: ListArtistsQuery) => Promise<Page<Artist>>>()

/** A stub of the port — see `deactivate-artist.use-case.unit-spec.ts` for the same shape. */
class StubArtistRepository extends ArtistRepository {
  override list(query: ListArtistsQuery): Promise<Page<Artist>> {
    return list(query)
  }

  override getById(_id: string): Promise<ArtistDetail> {
    throw new Error('not used')
  }

  override setVerification(_input: SetArtistVerificationInput): Promise<Artist> {
    throw new Error('not used')
  }

  override deactivate(_input: TakeDownInput): Promise<void> {
    throw new Error('not used')
  }

  override restore(_input: TakeDownInput): Promise<void> {
    throw new Error('not used')
  }

  override revokeSessions(_input: TakeDownInput): Promise<number> {
    throw new Error('not used')
  }
}

const routes: Routes = [{ path: 'artists', component: ArtistsPage }]

describe('ArtistsPage', () => {
  let harness: RouterTestingHarness

  beforeEach(async () => {
    list.mockReset()
    list.mockResolvedValue({ items: [artist()], total: 1, page: 1, limit: 20 })

    TestBed.resetTestingModule()
    TestBed.configureTestingModule({
      providers: [
        provideZonelessChangeDetection(),
        provideRouter(routes),
        provideLocationMocks(),
        { provide: ArtistRepository, useClass: StubArtistRepository },
      ],
    })
    harness = await RouterTestingHarness.create()
  })

  it('patches the URL with the sort and resets to page one, and reloads with it', async () => {
    await harness.navigateByUrl('/artists?page=3', ArtistsPage)
    await harness.fixture.whenStable()
    expect(list).toHaveBeenCalledTimes(1)

    harness.routeNativeElement?.querySelector<HTMLButtonElement>('app-sort-header button')?.click()
    await harness.fixture.whenStable()

    const location = TestBed.inject(Location)
    expect(location.path()).toBe('/artists?sort=username&dir=asc')
    expect(list).toHaveBeenLastCalledWith(
      expect.objectContaining({
        page: 1,
        filter: expect.objectContaining({ sort: { field: 'username', direction: 'asc' } }),
      }),
    )
  })

  it('clears the sort on a third click, reaching the API with neither sort nor order', async () => {
    await harness.navigateByUrl('/artists', ArtistsPage)
    await harness.fixture.whenStable()

    const button = () =>
      harness.routeNativeElement?.querySelector<HTMLButtonElement>('app-sort-header button')

    button()?.click()
    await harness.fixture.whenStable()
    button()?.click()
    await harness.fixture.whenStable()
    button()?.click()
    await harness.fixture.whenStable()

    const location = TestBed.inject(Location)
    expect(location.path()).toBe('/artists')
    expect(list).toHaveBeenLastCalledWith(
      expect.objectContaining({ filter: expect.objectContaining({ sort: undefined }) }),
    )
  })
})
