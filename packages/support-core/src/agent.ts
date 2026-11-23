import type {
  Citation,
  ConversationSnapshot,
  SupportEvent,
  TokenUsage,
  TranscriptMessage,
} from './domain.js'
import type {
  ChatModel,
  Embedder,
  KnowledgeHit,
  KnowledgeIndex,
  ModelMessage,
  ModelToolCall,
  ToolChoice,
} from './ports.js'
import {
  buildSystemPrompt,
  FIXED_TEXTS,
  HANDOFF_TOOL,
  INVALID_INPUT_MARKER,
  NO_RESULTS_MARKER,
  SEARCH_TOOL,
  SUPPORT_TOOLS,
} from './prompts.js'
import { transition } from './state-machine.js'

/** Tuning of retrieval and of the tool loop. */
export interface SupportAgentPolicy {
  /** Model steps per turn, including the final answer. At least 2: search, then answer. */
  maxSteps: number
  /** Hits below this relevance score are treated as not found. */
  minRelevance: number
  /** Articles returned to the model per search. */
  maxHits: number
}

export const DEFAULT_POLICY: SupportAgentPolicy = {
  maxSteps: 4,
  minRelevance: 0.35,
  maxHits: 4,
}

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

/** Result of running one tool call. */
interface ToolOutcome {
  content: string
  /** Relevant hits the model was given. */
  hits: KnowledgeHit[]
  handoffReason?: string
}

const ZERO_USAGE: TokenUsage = { inputTokens: 0, outputTokens: 0 }

/**
 * The support assistant's turn logic: search the knowledge base, answer with citations, or
 * hand the conversation to a person. Persistence, limits and delivery stay with the host;
 * the agent only turns one user message into a stream of `SupportEvent`s.
 */
export class SupportAgent {
  private readonly chatModel: ChatModel
  private readonly embedder: Embedder
  private readonly index: KnowledgeIndex
  private readonly policy: SupportAgentPolicy

  constructor({ chatModel, embedder, index, policy }: SupportAgentDeps) {
    this.chatModel = chatModel
    this.embedder = embedder
    this.index = index
    this.policy = { ...DEFAULT_POLICY, ...policy }
    if (this.policy.maxSteps < 2) throw new RangeError('SupportAgentPolicy.maxSteps must be ≥ 2')
  }

  async *respond({ conversation, message, signal }: RespondInput): AsyncGenerator<SupportEvent> {
    const state = transition(conversation.state, 'user-message')
    if (state !== 'bot') {
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

    for (let step = 0; step < this.policy.maxSteps; step += 1) {
      let text = ''
      const calls: ModelToolCall[] = []
      for await (const event of this.chatModel.step(
        { system, messages, tools: SUPPORT_TOOLS, toolChoice: this.toolChoice(step) },
        signal,
      )) {
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

      if (calls.length === 0) {
        if (text.trim() === '') {
          yield { type: 'text-delta', text: texts.fallback }
          yield { type: 'done', outcome: 'fallback', grounded: false, usage }
          return
        }
        for (const citation of citations.values()) yield { type: 'citation', citation }
        yield { type: 'done', outcome: 'answered', grounded: citations.size > 0, usage }
        return
      }

      messages.push({ role: 'assistant', content: text, toolCalls: calls })
      for (const call of calls) {
        const outcome = await this.runTool(call, conversation, signal)
        if (outcome.handoffReason !== undefined) {
          yield {
            type: 'state',
            state: transition('bot', 'handoff'),
            reason: outcome.handoffReason,
          }
          yield { type: 'text-delta', text: texts.handoff }
          yield { type: 'done', outcome: 'handed-off', grounded: false, usage }
          return
        }
        for (const hit of outcome.hits) citations.set(hit.chunkId, toCitation(hit))
        messages.push({
          role: 'tool',
          toolCallId: call.id,
          toolName: call.name,
          content: outcome.content,
        })
      }
    }

    // Unreachable in practice: the last step forbids tools, so the model must answer in text.
    yield { type: 'text-delta', text: texts.fallback }
    yield { type: 'done', outcome: 'fallback', grounded: false, usage }
  }

  private toolChoice(step: number): ToolChoice {
    if (step === 0) return 'required'
    if (step === this.policy.maxSteps - 1) return 'none'
    return 'auto'
  }

  private async runTool(
    call: ModelToolCall,
    conversation: ConversationSnapshot,
    signal: AbortSignal | undefined,
  ): Promise<ToolOutcome> {
    if (call.name === HANDOFF_TOOL) {
      const reason = readStringField(call.input, 'reason')
      return { content: '', hits: [], handoffReason: reason ?? 'not given' }
    }
    if (call.name === SEARCH_TOOL) {
      const query = readStringField(call.input, 'query')
      if (!query) return invalid('search_knowledge needs a non-empty string "query"')
      const hits = await this.search(query, conversation, signal)
      return { content: formatSearchResult(hits), hits }
    }
    return invalid(`unknown tool "${call.name}"`)
  }

  /** Relevant hits in the user's locale, falling back to every locale. */
  private async search(
    query: string,
    conversation: ConversationSnapshot,
    signal: AbortSignal | undefined,
  ): Promise<KnowledgeHit[]> {
    const [vector] = await this.embedder.embed([query], signal)
    if (!vector) throw new Error('Embedder returned no vector for the search query')
    const base = {
      vector,
      text: query,
      audiences: [conversation.audience, 'all'] as const,
      limit: this.policy.maxHits,
    }
    const relevant = (hits: KnowledgeHit[]) =>
      hits.filter((hit) => hit.score >= this.policy.minRelevance)

    const local = relevant(
      await this.index.search({ ...base, locale: conversation.locale }, signal),
    )
    if (local.length > 0) return local
    return relevant(await this.index.search(base, signal))
  }
}

function toModelMessage(message: TranscriptMessage): ModelMessage {
  return message.role === 'user'
    ? { role: 'user', content: message.text }
    : { role: 'assistant', content: message.text }
}

function toCitation(hit: KnowledgeHit): Citation {
  return hit.url === undefined
    ? { chunkId: hit.chunkId, title: hit.title }
    : { chunkId: hit.chunkId, title: hit.title, url: hit.url }
}

function invalid(detail: string): ToolOutcome {
  return { content: `${INVALID_INPUT_MARKER}: ${detail}`, hits: [] }
}

function readStringField(input: unknown, field: string): string | undefined {
  if (typeof input !== 'object' || input === null || !(field in input)) return undefined
  const value: unknown = Reflect.get(input, field)
  return typeof value === 'string' && value.trim() !== '' ? value.trim() : undefined
}

function formatSearchResult(hits: KnowledgeHit[]): string {
  if (hits.length === 0) return NO_RESULTS_MARKER
  return hits
    .map(
      (hit, position) =>
        `<article index="${position + 1}" title="${escapeAttribute(hit.title)}">\n${hit.text}\n</article>`,
    )
    .join('\n')
}

function escapeAttribute(value: string): string {
  return value.replaceAll('&', '&amp;').replaceAll('"', '&quot;').replaceAll('<', '&lt;')
}
