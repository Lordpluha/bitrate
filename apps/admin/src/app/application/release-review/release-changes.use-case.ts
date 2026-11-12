import { inject, Injectable } from '@angular/core'
import {
  canDecideChange,
  type ReleaseChangeDecision,
  type ReleaseChangeDecisionInput,
  type ReleaseChangeQueueStatus,
  ReleaseChangeRepository,
  type ReleaseChangeRequestDetail,
  type ReleaseChangeRequestRow,
} from '@domain/release-review'
import { ActionNotAllowedError, DEFAULT_PAGE_SIZE, type Page } from '@domain/shared'

@Injectable({ providedIn: 'root' })
export class ListReleaseChangeRequestsUseCase {
  private readonly changes = inject(ReleaseChangeRepository)

  execute(page: number, status: ReleaseChangeQueueStatus): Promise<Page<ReleaseChangeRequestRow>> {
    return this.changes.list({ page, limit: DEFAULT_PAGE_SIZE, status })
  }

  /** How many requests still have changes awaiting a decision. */
  openCount(): Promise<number> {
    return this.changes.openCount()
  }
}

@Injectable({ providedIn: 'root' })
export class GetReleaseChangeRequestUseCase {
  private readonly changes = inject(ReleaseChangeRepository)

  execute(id: string): Promise<ReleaseChangeRequestDetail> {
    return this.changes.getById(id)
  }
}

@Injectable({ providedIn: 'root' })
export class DecideReleaseChangesUseCase {
  private readonly changes = inject(ReleaseChangeRepository)

  /**
   * @throws {ActionNotAllowedError} When nothing is decided, a change is no longer pending or a
   * rejection gives no reason.
   */
  async execute({ request, decisions, message }: ReleaseChangeDecisionInput) {
    if (decisions.length === 0) throw new ActionNotAllowedError('Decide at least one change.')
    const byId = new Map(request.changes.map((change) => [change.id, change]))
    const cleaned = decisions.map((decision): ReleaseChangeDecision => {
      const change = byId.get(decision.changeId)
      const allowed = change ? canDecideChange(change) : { allowed: false as const, reason: '' }
      if (!allowed.allowed) throw new ActionNotAllowedError(allowed.reason)
      if (decision.decision === 'APPROVE') return decision
      const reason = decision.reason.trim()
      if (!reason) throw new ActionNotAllowedError('Tell the artist why each change was rejected.')
      return { ...decision, reason }
    })
    const comment = message?.trim()
    return this.changes.decide({
      id: request.id,
      decisions: cleaned,
      ...(comment ? { message: comment } : {}),
    })
  }
}
