import { inject, Injectable } from '@angular/core'
import { type SupportConversation, SupportInboxRepository } from '@domain/support'

@Injectable({ providedIn: 'root' })
export class GetSupportConversationUseCase {
  private readonly inbox = inject(SupportInboxRepository)

  execute(id: string): Promise<SupportConversation> {
    return this.inbox.getById(id)
  }
}
