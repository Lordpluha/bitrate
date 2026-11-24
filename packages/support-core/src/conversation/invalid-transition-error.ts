import type { ConversationState } from '../domain.js'
import type { ConversationEvent } from './conversation-event.js'

export class InvalidTransitionError extends Error {
  constructor(
    readonly from: ConversationState,
    readonly event: ConversationEvent,
  ) {
    super(`Conversation in state "${from}" cannot accept "${event}"`)
    this.name = 'InvalidTransitionError'
  }
}
