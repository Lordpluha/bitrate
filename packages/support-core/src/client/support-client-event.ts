import type { Citation, ConversationState, TurnOutcome } from '../domain.js'

/** An event of `POST /v1/support/conversations/:id/messages`, as a browser receives it. */
export type ClientSupportEvent =
  | { type: 'text-delta'; text: string }
  | { type: 'state'; state: ConversationState; reason?: string }
  | { type: 'citation'; citation: Citation }
  | { type: 'done'; outcome: TurnOutcome; grounded: boolean }
  | { type: 'error'; code: string }
