import { TestBed } from '@angular/core/testing'
import {
  type ListPlaylistsQuery,
  type Playlist,
  type PlaylistDetail,
  PlaylistRepository,
  type SetPlaylistVisibilityInput as RepositoryVisibilityInput,
} from '@domain/playlist'
import { ActionNotAllowedError, type Page, type TakeDownInput } from '@domain/shared'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { RestorePlaylistUseCase } from './restore-playlist.use-case'
import { SetPlaylistVisibilityUseCase } from './set-playlist-visibility.use-case'
import { TakeDownPlaylistUseCase } from './take-down-playlist.use-case'

const setVisibility = vi.fn<(input: RepositoryVisibilityInput) => Promise<void>>()
const takeDown = vi.fn<(input: TakeDownInput) => Promise<void>>()
const restore = vi.fn<(input: TakeDownInput) => Promise<void>>()

class StubPlaylistRepository extends PlaylistRepository {
  override list(_query: ListPlaylistsQuery): Promise<Page<Playlist>> {
    throw new Error('not used')
  }

  override getById(_id: string): Promise<PlaylistDetail> {
    throw new Error('not used')
  }

  override setVisibility(input: RepositoryVisibilityInput): Promise<void> {
    return setVisibility(input)
  }

  override takeDown(input: TakeDownInput): Promise<void> {
    return takeDown(input)
  }

  override restore(input: TakeDownInput): Promise<void> {
    return restore(input)
  }
}

const ID = '3f2504e0-4f89-41d3-9a0c-0305e82c3301'

function playlist(overrides: Partial<Playlist> = {}): Playlist {
  return {
    id: ID,
    title: 'Night Drive',
    ownerId: '9f2504e0-4f89-41d3-9a0c-0305e82c3302',
    ownerUsername: 'listener',
    isPublic: true,
    followersCount: 3,
    trackCount: 2,
    takenDownAt: null,
    createdAt: new Date('2026-09-01T09:59:00.000Z'),
    updatedAt: new Date('2026-09-01T09:59:00.000Z'),
    ...overrides,
  }
}

describe('playlist write use cases', () => {
  beforeEach(() => {
    for (const mock of [setVisibility, takeDown, restore]) {
      mock.mockReset()
      mock.mockResolvedValue(undefined)
    }
    TestBed.resetTestingModule()
    TestBed.configureTestingModule({
      providers: [{ provide: PlaylistRepository, useClass: StubPlaylistRepository }],
    })
  })

  it('hides a public playlist, forwarding the reason', async () => {
    await TestBed.inject(SetPlaylistVisibilityUseCase).execute({
      playlist: playlist(),
      isPublic: false,
      reason: 'misleading',
    })

    expect(setVisibility).toHaveBeenCalledWith({ id: ID, isPublic: false, reason: 'misleading' })
  })

  it('refuses to hide a playlist that is already private, without calling the API', async () => {
    await expect(
      TestBed.inject(SetPlaylistVisibilityUseCase).execute({
        playlist: playlist({ isPublic: false }),
        isPublic: false,
      }),
    ).rejects.toThrow(ActionNotAllowedError)
    expect(setVisibility).not.toHaveBeenCalled()
  })

  it('un-hides a private playlist', async () => {
    await TestBed.inject(SetPlaylistVisibilityUseCase).execute({
      playlist: playlist({ isPublic: false }),
      isPublic: true,
    })

    expect(setVisibility).toHaveBeenCalledWith({ id: ID, isPublic: true, reason: undefined })
  })

  it('refuses to un-hide a playlist that is already public, without calling the API', async () => {
    await expect(
      TestBed.inject(SetPlaylistVisibilityUseCase).execute({
        playlist: playlist(),
        isPublic: true,
      }),
    ).rejects.toThrow(ActionNotAllowedError)
    expect(setVisibility).not.toHaveBeenCalled()
  })

  it('takes down an active playlist, forwarding the reason', async () => {
    await TestBed.inject(TakeDownPlaylistUseCase).execute({
      playlist: playlist(),
      reason: 'spam',
    })

    expect(takeDown).toHaveBeenCalledWith({ id: ID, reason: 'spam' })
  })

  it('refuses to take down a playlist already taken down, without calling the API', async () => {
    await expect(
      TestBed.inject(TakeDownPlaylistUseCase).execute({
        playlist: playlist({ takenDownAt: new Date() }),
      }),
    ).rejects.toThrow(ActionNotAllowedError)
    expect(takeDown).not.toHaveBeenCalled()
  })

  it('restores a taken-down playlist without touching its visibility', async () => {
    await TestBed.inject(RestorePlaylistUseCase).execute({
      playlist: playlist({ isPublic: false, takenDownAt: new Date() }),
      reason: 'appeal upheld',
    })

    expect(restore).toHaveBeenCalledWith({ id: ID, reason: 'appeal upheld' })
    expect(setVisibility).not.toHaveBeenCalled()
  })

  it('refuses to restore a playlist that is not taken down, without calling the API', async () => {
    await expect(
      TestBed.inject(RestorePlaylistUseCase).execute({ playlist: playlist() }),
    ).rejects.toThrow(ActionNotAllowedError)
    expect(restore).not.toHaveBeenCalled()
  })
})
