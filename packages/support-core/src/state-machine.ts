import type { ConversationState } from './domain.js'

/** Something that happens to a conversation. */
export type ConversationEvent = 'user-message' | 'handoff' | 'operator-reply' | 'resolve'

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

export class InvalidTransitionError extends Error {
  constructor(
    readonly from: ConversationState,
    readonly event: ConversationEvent,
  ) {
    super(`Conversation in state "${from}" cannot accept "${event}"`)
    this.name = 'InvalidTransitionError'
  }
}

/** The state after `event`; throws `InvalidTransitionError` when the event is not allowed. */
export function transition(from: ConversationState, event: ConversationEvent): ConversationState {
  const next = TRANSITIONS[from][event]
  if (!next) throw new InvalidTransitionError(from, event)
  return next
}
