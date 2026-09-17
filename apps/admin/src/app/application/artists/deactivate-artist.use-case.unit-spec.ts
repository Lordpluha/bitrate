import { TestBed } from '@angular/core/testing'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
  type Artist,
  ArtistRepository,
  type ArtistDetail,
  type ListArtistsQuery,
  type SetArtistVerificationInput,
} from '@domain/artist'
import { ActionNotAllowedError, type Page, type TakeDownInput } from '@domain/shared'
import { DeactivateArtistUseCase } from './deactivate-artist.use-case'

const deactivate = vi.fn<(input: TakeDownInput) => Promise<void>>()

/** A stub of the port, which is the whole point of the port existing. */
class StubArtistRepository extends ArtistRepository {
  override list(_query: ListArtistsQuery): Promise<Page<Artist>> {
    throw new Error('not used')
  }

  override getById(_id: string): Promise<ArtistDetail> {
    throw new Error('not used')
  }

  override setVerification(_input: SetArtistVerificationInput): Promise<Artist> {
    throw new Error('not used')
  }

  override deactivate(input: TakeDownInput): Promise<void> {
    return deactivate(input)
  }

  override restore(_input: TakeDownInput): Promise<void> {
    throw new Error('not used')
  }

  override revokeSessions(_input: TakeDownInput): Promise<number> {
    throw new Error('not used')
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
    await create().execute({ artist: artist(), reason: 'rights claim' })

    expect(deactivate).toHaveBeenCalledWith({
      id: '3f2504e0-4f89-41d3-9a0c-0305e82c3301',
      reason: 'rights claim',
    })
  })

  it('refuses an account that is already deactivated, without calling the API', async () => {
    const already = artist({ deactivatedAt: new Date('2026-09-10T08:00:00.000Z') })

    await expect(create().execute({ artist: already })).rejects.toThrow(ActionNotAllowedError)
    expect(deactivate).not.toHaveBeenCalled()
  })
})
