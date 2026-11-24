import { inject, Injectable } from '@angular/core'
import { canResolve, type SupportConversation, SupportInboxRepository } from '@domain/support'

@Injectable({ providedIn: 'root' })
export class ResolveSupportConversationUseCase {
  private readonly inbox = inject(SupportInboxRepository)

  /** A resolved conversation comes back untouched, so a double-click writes no second audit entry. */
  execute(conversation: SupportConversation): Promise<SupportConversation> {
    if (!canResolve(conversation)) return Promise.resolve(conversation)
    return this.inbox.resolve(conversation.id)
  }
}
