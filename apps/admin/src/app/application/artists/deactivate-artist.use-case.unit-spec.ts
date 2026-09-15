import { TestBed } from '@angular/core/testing'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
  type Artist,
  ArtistRepository,
  type ListArtistsQuery,
  type SetArtistVerificationInput,
} from '@domain/artist'
import { ActionNotAllowedError, type Page } from '@domain/shared'
import { DeactivateArtistUseCase } from './deactivate-artist.use-case'

const deactivate = vi.fn<(id: string) => Promise<void>>()

/** A stub of the port, which is the whole point of the port existing. */
class StubArtistRepository extends ArtistRepository {
  override list(_query: ListArtistsQuery): Promise<Page<Artist>> {
    throw new Error('not used')
  }

  override setVerification(_input: SetArtistVerificationInput): Promise<Artist> {
    throw new Error('not used')
  }

  override deactivate(id: string): Promise<void> {
    return deactivate(id)
  }
}

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

function create(): DeactivateArtistUseCase {
  TestBed.resetTestingModule()
  TestBed.configureTestingModule({
    providers: [{ provide: ArtistRepository, useClass: StubArtistRepository }],
  })

  return TestBed.inject(DeactivateArtistUseCase)
}

describe('DeactivateArtistUseCase', () => {
  beforeEach(() => {
    deactivate.mockReset()
    deactivate.mockResolvedValue(undefined)
  })

  it('deactivates an active account', async () => {
    await create().execute(artist())

    expect(deactivate).toHaveBeenCalledWith('3f2504e0-4f89-41d3-9a0c-0305e82c3301')
  })

  it('refuses an account that is already deactivated, without calling the API', async () => {
    const already = artist({ deactivatedAt: new Date('2026-09-10T08:00:00.000Z') })

    await expect(create().execute(already)).rejects.toThrow(ActionNotAllowedError)
    expect(deactivate).not.toHaveBeenCalled()
  })
})
