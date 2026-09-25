import { TestBed } from '@angular/core/testing'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { Page } from '@domain/shared'
import { type ListeningHistoryEntry, UserRepository } from '@domain/user'
import { ListListeningHistoryUseCase } from './list-listening-history.use-case'

const listListeningHistory =
  vi.fn<(userId: string, page: number) => Promise<Page<ListeningHistoryEntry>>>()

class StubUserRepository extends UserRepository {
  override list(): Promise<never> {
    throw new Error('not used by this use case')
  }

  override getById(): Promise<never> {
    throw new Error('not used by this use case')
  }

  override deactivate(): Promise<void> {
    throw new Error('not used by this use case')
  }

  override restore(): Promise<void> {
    throw new Error('not used by this use case')
  }

  override revokeSessions(): Promise<number> {
    throw new Error('not used by this use case')
  }

  override listListeningHistory(
    userId: string,
    page: number,
  ): Promise<Page<ListeningHistoryEntry>> {
    return listListeningHistory(userId, page)
  }
}

function page(): Page<ListeningHistoryEntry> {
  return {
    items: [
      {
        id: 'a1b2c3d4-4f89-41d3-9a0c-0305e82c3301',
        listenedAt: new Date('2026-09-17T12:00:00.000Z'),
        trackId: 'a1b2c3d4-4f89-41d3-9a0c-0305e82c3302',
        trackTitle: 'Test Track',
        artistUsername: 'dj-test',
      },
    ],
    total: 1,
    page: 1,
    limit: 10,
  }
}

function create(): ListListeningHistoryUseCase {
  TestBed.resetTestingModule()
  TestBed.configureTestingModule({
    providers: [{ provide: UserRepository, useClass: StubUserRepository }],
  })

  return TestBed.inject(ListListeningHistoryUseCase)
}

describe('ListListeningHistoryUseCase', () => {
  beforeEach(() => {
    listListeningHistory.mockReset()
  })

  it('passes the listener id and page through to the repository', async () => {
    const result = page()
    listListeningHistory.mockResolvedValue(result)

    const response = await create().execute({
      userId: 'a1b2c3d4-4f89-41d3-9a0c-0305e82c3301',
      page: 2,
    })

    expect(listListeningHistory).toHaveBeenCalledWith('a1b2c3d4-4f89-41d3-9a0c-0305e82c3301', 2)
    expect(response).toBe(result)
  })

  it('propagates a repository rejection instead of swallowing it', async () => {
    listListeningHistory.mockRejectedValue(new Error('network down'))

    await expect(create().execute({ userId: 'id', page: 1 })).rejects.toThrow('network down')
  })
})
