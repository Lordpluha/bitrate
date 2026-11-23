import { TestBed } from '@angular/core/testing'
import {
  type DecideReleaseChangesRequest,
  type ListReleaseChangeRequestsQuery,
  type ReleaseChange,
  ReleaseChangeRepository,
  type ReleaseChangeRequestDetail,
  type ReleaseChangeRequestRow,
} from '@domain/release-review'
import { ActionNotAllowedError, type Page } from '@domain/shared'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { DecideReleaseChangesUseCase } from './release-changes.use-case'

const decide = vi.fn<(input: DecideReleaseChangesRequest) => Promise<ReleaseChangeRequestDetail>>()

class StubChangeRepository extends ReleaseChangeRepository {
  override list(_query: ListReleaseChangeRequestsQuery): Promise<Page<ReleaseChangeRequestRow>> {
    throw new Error('not used')
  }
  override openCount(): Promise<number> {
    throw new Error('not used')
  }
  override getById(_id: string): Promise<ReleaseChangeRequestDetail> {
    throw new Error('not used')
  }
  override decide(input: DecideReleaseChangesRequest): Promise<ReleaseChangeRequestDetail> {
    return decide(input)
  }
}

const change = (id: string, status: ReleaseChange['status'] = 'PENDING'): ReleaseChange => ({
  id,
  field: 'RELEASE_TITLE',
  recordingId: null,
  previousValue: 'First light',
  proposedValue: 'Second light',
  status,
  reason: null,
  decidedAt: null,
  reviewerUsername: null,
})

const request = (...changes: ReleaseChange[]): ReleaseChangeRequestDetail => ({
  id: 'request-1',
  message: null,
  createdAt: new Date('2026-11-12T10:00:00Z'),
  closedAt: null,
  release: {
    id: 'release-1',
    title: 'First light',
    coverUrl: null,
    status: 'RELEASED',
    artistId: 'artist-1',
    artistUsername: 'dj',
  },
  changes,
})

describe('DecideReleaseChangesUseCase', () => {
  let useCase: DecideReleaseChangesUseCase

  beforeEach(() => {
    decide.mockReset()
    decide.mockResolvedValue(request())
    TestBed.configureTestingModule({
      providers: [{ provide: ReleaseChangeRepository, useClass: StubChangeRepository }],
    })
    useCase = TestBed.inject(DecideReleaseChangesUseCase)
  })

  it('sends each outcome with trimmed reasons and comment', async () => {
    await useCase.execute({
      request: request(change('a'), change('b')),
      decisions: [
        { changeId: 'a', decision: 'APPROVE' },
        { changeId: 'b', decision: 'REJECT', reason: '  Too long  ' },
      ],
      message: '  Thanks  ',
    })

    expect(decide).toHaveBeenCalledWith({
      id: 'request-1',
      decisions: [
        { changeId: 'a', decision: 'APPROVE' },
        { changeId: 'b', decision: 'REJECT', reason: 'Too long' },
      ],
      message: 'Thanks',
    })
  })

  it('leaves out an empty comment', async () => {
    await useCase.execute({
      request: request(change('a')),
      decisions: [{ changeId: 'a', decision: 'APPROVE' }],
      message: '   ',
    })

    expect(decide).toHaveBeenCalledWith({
      id: 'request-1',
      decisions: [{ changeId: 'a', decision: 'APPROVE' }],
    })
  })

  it('refuses a rejection without a reason', async () => {
    await expect(
      useCase.execute({
        request: request(change('a')),
        decisions: [{ changeId: 'a', decision: 'REJECT', reason: '  ' }],
      }),
    ).rejects.toThrow(ActionNotAllowedError)
    expect(decide).not.toHaveBeenCalled()
  })

  it('refuses a change that is no longer pending', async () => {
    await expect(
      useCase.execute({
        request: request(change('a', 'APPROVED')),
        decisions: [{ changeId: 'a', decision: 'APPROVE' }],
      }),
    ).rejects.toThrow(ActionNotAllowedError)
  })

  it('refuses an empty decision', async () => {
    await expect(useCase.execute({ request: request(change('a')), decisions: [] })).rejects.toThrow(
      ActionNotAllowedError,
    )
  })
})
