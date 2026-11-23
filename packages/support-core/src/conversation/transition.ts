import type { ConversationState } from '../domain.js'
import type { ConversationEvent } from './conversation-event.js'
import { InvalidTransitionError } from './invalid-transition-error.js'

const TRANSITIONS: Record<
  ConversationState,
  Partial<Record<ConversationEvent, ConversationState>>
> = {
  bot: { 'user-message': 'bot', handoff: 'waiting_operator' },
  waiting_operator: {
    'user-message': 'waiting_operator',
    'operator-reply': 'operator',
    resolve: 'resolved',
  },
  operator: { 'user-message': 'operator', 'operator-reply': 'operator', resolve: 'resolved' },
  resolved: { 'user-message': 'bot' },
}

/** The state after `event`; throws `InvalidTransitionError` when the event is not allowed. */
export function transition(from: ConversationState, event: ConversationEvent): ConversationState {
  const next = TRANSITIONS[from][event]
  if (!next) throw new InvalidTransitionError(from, event)
  return next
}
