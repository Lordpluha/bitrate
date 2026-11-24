import type { Channel, KnowledgeAudience, Locale, TokenUsage } from './domain.js'

/** JSON Schema of a tool input: an object of string fields. */
export interface ToolInputSchema {
  type: 'object'
  properties: Record<string, { type: 'string'; description: string }>
  required: string[]
  additionalProperties: false
}

export interface ToolSpec {
  name: string
  description: string
  inputSchema: ToolInputSchema
}

export interface ModelToolCall {
  id: string
  name: string
  /** Parsed input as the model sent it; the agent validates it. */
  input: unknown
}

/** Conversation as the model sees it within one turn. */
export type ModelMessage =
  | { role: 'user'; content: string }
  | { role: 'assistant'; content: string; toolCalls?: readonly ModelToolCall[] }
  | { role: 'tool'; toolCallId: string; toolName: string; content: string }

/**
 * `required` forces a tool call, `none` forbids one. The agent forces a knowledge
 * search on the first step and forbids tools on the last, so every turn ends in text.
 */
export type ToolChoice = 'auto' | 'required' | 'none'

export interface ChatStepInput {
  system: string
  messages: readonly ModelMessage[]
  tools: readonly ToolSpec[]
  toolChoice: ToolChoice
}

export type ChatStepEvent =
  | { type: 'text-delta'; text: string }
  | { type: 'tool-call'; call: ModelToolCall }
  | { type: 'finish'; usage: TokenUsage }

/**
 * One model step: stream text and collect tool calls, without executing tools.
 * The agent owns the tool loop, so the core stays independent of any model SDK.
 * Implementations throw when the provider fails.
 */
export interface ChatModel {
  readonly provider: string
  readonly modelId: string
  step(input: ChatStepInput, signal?: AbortSignal): AsyncIterable<ChatStepEvent>
}

export interface Embedder {
  readonly provider: string
  readonly modelId: string
  /** One vector per text, in input order. */
  embed(texts: readonly string[], signal?: AbortSignal): Promise<number[][]>
}

export interface KnowledgeQuery {
  /** Embedding of `text`. */
  vector: readonly number[]
  /** The query text, for indexes that combine vector and keyword search. */
  text: string
  audiences: readonly KnowledgeAudience[]
  /** Omit to search every locale. */
  locale?: Locale
  limit: number
}

export interface KnowledgeHit {
  chunkId: string
  title: string
  url?: string
  text: string
  /** Relevance in [0, 1]; higher is more relevant. */
  score: number
}

export interface KnowledgeIndex {
  search(query: KnowledgeQuery, signal?: AbortSignal): Promise<KnowledgeHit[]>
}

/** Where a channel delivers a message: the channel's own id of the chat or user. */
export interface ChannelRecipient {
  channel: Channel
  externalId: string
}

/**
 * Sends already rendered message parts (see `renderForChannel`) through one channel.
 * Implemented by the host per messenger; the web channel streams instead.
 */
export interface ChannelAdapter {
  readonly channel: Exclude<Channel, 'web'>
  send(recipient: ChannelRecipient, parts: readonly string[]): Promise<void>
}
