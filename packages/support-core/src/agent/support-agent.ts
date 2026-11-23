import type { Citation, ConversationSnapshot, SupportEvent, TokenUsage } from '../domain.js'
import type {
  ChatModel,
  ChatStepInput,
  Embedder,
  KnowledgeIndex,
  ModelMessage,
  ModelToolCall,
} from '../ports.js'
import { buildSystemPrompt } from '../prompts/build-system-prompt.js'
import { FIXED_TEXTS } from '../prompts/fixed-texts.js'
import { SUPPORT_TOOLS } from '../prompts/support-tools.js'
import { transition } from '../conversation/transition.js'
import { DEFAULT_POLICY, type SupportAgentPolicy, toolChoiceForStep } from './policy.js'
import { runToolCall } from './run-tool-call.js'
import type { RetrievalDeps } from './search-knowledge.js'
import { toCitation } from './to-citation.js'
import { toModelMessage } from './to-model-message.js'

export interface SupportAgentDeps {
  chatModel: ChatModel
  embedder: Embedder
  index: KnowledgeIndex
  policy?: Partial<SupportAgentPolicy>
}

export interface RespondInput {
  conversation: ConversationSnapshot
  /** The user's new message. */
  message: string
  signal?: AbortSignal
}

interface StepResult {
  text: string
  calls: ModelToolCall[]
}

const ZERO_USAGE: TokenUsage = { inputTokens: 0, outputTokens: 0 }

/**
 * The support assistant's turn logic: search the knowledge base, answer with citations, or
 * hand the conversation to a person. Persistence, limits and delivery stay with the host;
 * the agent only turns one user message into a stream of `SupportEvent`s.
 */
export class SupportAgent {
  private readonly chatModel: ChatModel
  private readonly retrieval: RetrievalDeps

  constructor({ chatModel, embedder, index, policy }: SupportAgentDeps) {
    const merged = { ...DEFAULT_POLICY, ...policy }
    if (merged.maxSteps < 2) throw new RangeError('SupportAgentPolicy.maxSteps must be ≥ 2')
    this.chatModel = chatModel
    this.retrieval = { embedder, index, policy: merged }
  }

  async *respond({ conversation, message, signal }: RespondInput): AsyncGenerator<SupportEvent> {
    if (transition(conversation.state, 'user-message') !== 'bot') {
      yield { type: 'done', outcome: 'forwarded', grounded: false, usage: ZERO_USAGE }
      return
    }
    if (conversation.state === 'resolved') yield { type: 'state', state: 'bot' }

    const texts = FIXED_TEXTS[conversation.locale]
    const system = buildSystemPrompt(conversation.audience, conversation.locale)
    const messages: ModelMessage[] = [
      ...conversation.history.map(toModelMessage),
      { role: 'user', content: message },
    ]
    const usage = { ...ZERO_USAGE }
    const citations = new Map<string, Citation>()
    const { policy } = this.retrieval

    for (let step = 0; step < policy.maxSteps; step += 1) {
      const toolChoice = toolChoiceForStep(step, policy)
      const { text, calls } = yield* this.streamStep(
        { system, messages, tools: SUPPORT_TOOLS, toolChoice },
        usage,
        signal,
      )
      if (calls.length === 0) {
        if (text.trim() === '') break
        for (const citation of citations.values()) yield { type: 'citation', citation }
        yield { type: 'done', outcome: 'answered', grounded: citations.size > 0, usage }
        return
      }

      messages.push({ role: 'assistant', content: text, toolCalls: calls })
      for (const call of calls) {
        const outcome = await runToolCall(call, conversation, this.retrieval, signal)
        if (outcome.handoffReason !== undefined) {
          const state = transition('bot', 'handoff')
          yield { type: 'state', state, reason: outcome.handoffReason }
          yield { type: 'text-delta', text: texts.handoff }
          yield { type: 'done', outcome: 'handed-off', grounded: false, usage }
          return
        }
        for (const hit of outcome.hits) citations.set(hit.chunkId, toCitation(hit))
        const { id: toolCallId, name: toolName } = call
        messages.push({ role: 'tool', toolCallId, toolName, content: outcome.content })
      }
    }

    // Empty final text. Exhausting the steps cannot happen: the last step forbids tools.
    yield { type: 'text-delta', text: texts.fallback }
    yield { type: 'done', outcome: 'fallback', grounded: false, usage }
  }

  /** Streams one model step's text to the caller; collects its tool calls and usage. */
  private async *streamStep(
    input: ChatStepInput,
    usage: TokenUsage,
    signal: AbortSignal | undefined,
  ): AsyncGenerator<SupportEvent, StepResult> {
    let text = ''
    const calls: ModelToolCall[] = []
    for await (const event of this.chatModel.step(input, signal)) {
      if (event.type === 'text-delta') {
        text += event.text
        yield event
      } else if (event.type === 'tool-call') {
        calls.push(event.call)
      } else {
        usage.inputTokens += event.usage.inputTokens
        usage.outputTokens += event.usage.outputTokens
      }
    }
    return { text, calls }
  }
}
