import type { Page, PageRequest } from '../shared/page'
import type {
  SupportConversation,
  SupportInboxFilter,
  SupportInboxItem,
} from './support-conversation'

export type ListSupportConversationsQuery = PageRequest & {
  filter: SupportInboxFilter
}

export type ReplyToSupportConversationInput = {
  id: string
  text: string
}

/** The port the support inbox talks to. */
export abstract class SupportInboxRepository {
  abstract list(query: ListSupportConversationsQuery): Promise<Page<SupportInboxItem>>
  abstract getById(id: string): Promise<SupportConversation>
  /** Takes the conversation over; the user gets the reply in their channel. */
  abstract reply(input: ReplyToSupportConversationInput): Promise<SupportConversation>
  /** Closes the ticket; the assistant answers the user's next message again. */
  abstract resolve(id: string): Promise<SupportConversation>
}
