import { TestBed } from '@angular/core/testing'
import { ActionNotAllowedError, type BatchResult, type Page } from '@domain/shared'
import {
  type ListeningHistoryEntry,
  type ListUsersQuery,
  type User,
  type UserDetail,
  UserRepository,
} from '@domain/user'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { DeactivateUsersBatchUseCase } from './deactivate-users-batch.use-case'

const deactivateMany = vi.fn<(ids: readonly string[]) => Promise<BatchResult>>()

class StubUserRepository extends UserRepository {
  override list(_query: ListUsersQuery): Promise<Page<User>> {
    throw new Error('not used')
  }

  override getById(_id: string): Promise<UserDetail> {
    throw new Error('not used')
  }

  override deactivate(): Promise<void> {
    throw new Error('not used')
  }

  override deactivateMany(ids: readonly string[]): Promise<BatchResult> {
    return deactivateMany(ids)
  }

  override restore(): Promise<void> {
    throw new Error('not used')
  }

  override revokeSessions(): Promise<number> {
    throw new Error('not used')
  }

  override listListeningHistory(): Promise<Page<ListeningHistoryEntry>> {
    throw new Error('not used')
  }
}

function user(overrides: Partial<User> = {}): User {
  return {
    id: '3f2504e0-4f89-41d3-9a0c-0305e82c3301',
    username: 'listener',
    email: 'listener@example.com',
    emailVerifiedAt: null,
    createdAt: new Date('2026-09-01T09:59:00.000Z'),
    deactivatedAt: null,
    ...overrides,
  }
}

const RESULT: BatchResult = { items: [], succeeded: 0, failed: 0 }

describe('DeactivateUsersBatchUseCase', () => {
  let useCase: DeactivateUsersBatchUseCase

  beforeEach(() => {
    deactivateMany.mockReset()
    deactivateMany.mockResolvedValue(RESULT)
    TestBed.resetTestingModule()
    TestBed.configureTestingModule({
      providers: [{ provide: UserRepository, useClass: StubUserRepository }],
    })
    useCase = TestBed.inject(DeactivateUsersBatchUseCase)
  })

  it('sends every selected id in one request and returns the per-row result', async () => {
    const result = await useCase.execute([user({ id: 'a' }), user({ id: 'b' })])

    expect(deactivateMany).toHaveBeenCalledWith(['a', 'b'])
    expect(result).toBe(RESULT)
  })

  it('refuses a selection that includes an already deactivated listener', () => {
    const gone = user({ deactivatedAt: new Date('2026-09-02T00:00:00.000Z') })

    expect(() => useCase.execute([user({ id: 'a' }), gone])).toThrow(ActionNotAllowedError)
    expect(deactivateMany).not.toHaveBeenCalled()
  })

  it('refuses an empty selection and more than 100 rows', () => {
    expect(() => useCase.execute([])).toThrow(ActionNotAllowedError)
    const many = Array.from({ length: 101 }, (_, i) => user({ id: `u${i}` }))
    expect(() => useCase.execute(many)).toThrow(ActionNotAllowedError)
    expect(deactivateMany).not.toHaveBeenCalled()
  })
})
