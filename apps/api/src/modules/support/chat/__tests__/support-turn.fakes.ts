import type { SupportEvent, TokenUsage, TranscriptMessage } from '@bitrate/support-core'
import type { SupportBudget } from '../support-budget'
import type { SupportConversationRow } from '../support-conversation-row'
import type { SupportResponder } from '../support-responder'
import type { SupportTurnStore, TurnUpdate } from '../support-turn-store'

export function conversation(
  overrides: Partial<SupportConversationRow> = {},
): SupportConversationRow {
  return {
    id: 'c1',
    audience: 'listener',
    locale: 'en',
    channel: 'web',
    state: 'bot',
    inputTokens: 0,
    outputTokens: 0,
    ...overrides,
  }
}

/** Records what the turn persisted, in order. */
export class FakeTurnStore implements SupportTurnStore {
  readonly log: string[] = []
  readonly completed: TurnUpdate[] = []

  addUserMessage(_conversationId: string, text: string) {
    this.log.push(`user:${text}`)
    return Promise.resolve()
  }

  history(): Promise<TranscriptMessage[]> {
    return Promise.resolve([])
  }

  completeTurn(_conversationId: string, update: TurnUpdate) {
    this.log.push('complete')
    this.completed.push(update)
    return Promise.resolve()
  }

  touch() {
    this.log.push('touch')
    return Promise.resolve()
  }
}

export class FakeBudget implements SupportBudget {
  readonly recorded: TokenUsage[] = []

  constructor(private readonly available = true) {}

  canSpend() {
    return Promise.resolve(this.available)
  }

  record(usage: TokenUsage) {
    this.recorded.push(usage)
    return Promise.resolve()
  }
}

/** A responder that replays fixed events. */
export function scriptedResponder(events: SupportEvent[]): SupportResponder {
  return {
    async *respond() {
      for (const event of events) yield await Promise.resolve(event)
    },
  }
}
