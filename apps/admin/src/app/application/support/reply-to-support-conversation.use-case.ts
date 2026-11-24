import { inject, Injectable } from '@angular/core'
import {
  type ReplyToSupportConversationInput,
  type SupportConversation,
  SupportInboxRepository,
} from '@domain/support'

@Injectable({ providedIn: 'root' })
export class ReplyToSupportConversationUseCase {
  private readonly inbox = inject(SupportInboxRepository)

  execute({ id, text }: ReplyToSupportConversationInput): Promise<SupportConversation> {
    return this.inbox.reply({ id, text: text.trim() })
  }
}
