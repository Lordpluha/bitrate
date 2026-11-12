import type { Page, PageRequest } from '../shared'
import type {
  ReleaseChangeDecision,
  ReleaseChangeQueueStatus,
  ReleaseChangeRequestDetail,
  ReleaseChangeRequestRow,
} from './release-change'

export type ListReleaseChangeRequestsQuery = PageRequest & { status: ReleaseChangeQueueStatus }

export type DecideReleaseChangesRequest = {
  id: string
  decisions: ReleaseChangeDecision[]
  message?: string
}

/** The port the change review screens talk to; failures are `ReleaseReviewError`s. */
export abstract class ReleaseChangeRepository {
  abstract list(query: ListReleaseChangeRequestsQuery): Promise<Page<ReleaseChangeRequestRow>>
  abstract openCount(): Promise<number>
  abstract getById(id: string): Promise<ReleaseChangeRequestDetail>
  /** @throws {ReleaseReviewError} */
  abstract decide(input: DecideReleaseChangesRequest): Promise<ReleaseChangeRequestDetail>
}
