import type { Citation, ConversationState, SupportEvent, TokenUsage } from '@bitrate/support-core'
import { Inject, Injectable, Logger } from '@nestjs/common'
import type { SupportConversationRow } from './support-conversation-row'
import { SUPPORT_TURN_DEPS, type SupportTurnDeps } from './support-turn-deps'

/** Why a turn went to an operator without (or despite) the model. */
export type HandoffCause =
  | 'assistant_unavailable'
  | 'budget_exhausted'
  | 'conversation_limit'
  | 'assistant_failed'

const NO_USAGE: TokenUsage = { inputTokens: 0, outputTokens: 0 }

/**
 * One user message → one turn: stores the message, runs the assistant within the budget and
 * the conversation's allowance, streams its events and persists the result. Whenever the
 * assistant cannot answer, the conversation goes to an operator instead of failing.
 */
@Injectable()
export class SupportTurnService {
  private readonly logger = new Logger(SupportTurnService.name)

  constructor(@Inject(SUPPORT_TURN_DEPS) private readonly deps: SupportTurnDeps) {}

  async *run(
    conversation: SupportConversationRow,
    text: string,
    signal?: AbortSignal,
  ): AsyncGenerator<SupportEvent> {
    const { store } = this.deps
    await store.addUserMessage(conversation.id, text)

    if (conversation.state === 'waiting_operator' || conversation.state === 'operator') {
      await store.touch(conversation.id)
      yield { type: 'done', outcome: 'forwarded', grounded: false, usage: NO_USAGE }
      return
    }

    const blocked = await this.blockedBy(conversation)
    if (blocked) {
      yield* this.handOff(conversation, blocked, NO_USAGE)
      return
    }

    yield* this.answer(conversation, text, signal)
  }

  private async *answer(
    conversation: SupportConversationRow,
    text: string,
    signal: AbortSignal | undefined,
  ): AsyncGenerator<SupportEvent> {
    const { store, budget, responder } = this.deps
    if (!responder) return
    const history = await store.history(conversation.id)
    let answer = ''
    const citations: Citation[] = []
    let state: ConversationState = conversation.state === 'resolved' ? 'bot' : conversation.state
    let ticketReason: string | undefined

    try {
      for await (const event of responder.respond({
        conversation: { ...conversation, history },
        message: text,
        ...(signal ? { signal } : {}),
      })) {
        if (event.type === 'text-delta') answer += event.text
        if (event.type === 'citation') citations.push(event.citation)
        if (event.type === 'state') {
          state = event.state
          if (event.state === 'waiting_operator') ticketReason = event.reason ?? 'handed off'
        }
        if (event.type === 'done') {
          await budget.record(event.usage)
          await store.completeTurn(conversation.id, {
            ...(answer === '' ? {} : { assistantText: answer }),
            citations,
            state,
            usage: event.usage,
            ...(ticketReason === undefined ? {} : { ticketReason }),
          })
        }
        yield event
      }
    } catch (error: unknown) {
      // The model call failed (or the client went away). Never log the message text.
      this.logger.warn(`Support turn ${conversation.id} failed: ${describe(error)}`)
      if (signal?.aborted) return
      yield* this.handOff(conversation, 'assistant_failed', NO_USAGE)
    }
  }

  private async blockedBy(conversation: SupportConversationRow): Promise<HandoffCause | undefined> {
    if (!this.deps.responder) return 'assistant_unavailable'
    if (conversation.inputTokens + conversation.outputTokens >= this.deps.conversationTokenCap) {
      return 'conversation_limit'
    }
    if (!(await this.deps.budget.canSpend())) return 'budget_exhausted'
    return undefined
  }

  private async *handOff(
    conversation: SupportConversationRow,
    cause: HandoffCause,
    usage: TokenUsage,
  ): AsyncGenerator<SupportEvent> {
    const text = await this.deps.handoffText(conversation.locale)
    await this.deps.store.completeTurn(conversation.id, {
      assistantText: text,
      citations: [],
      state: 'waiting_operator',
      usage,
      ticketReason: cause,
    })
    yield { type: 'state', state: 'waiting_operator', reason: cause }
    yield { type: 'text-delta', text }
    yield { type: 'done', outcome: 'handed-off', grounded: false, usage }
  }
}

function describe(error: unknown): string {
  return error instanceof Error ? error.name : 'unknown error'
}
