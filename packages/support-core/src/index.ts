export { DEFAULT_POLICY, type SupportAgentPolicy } from './agent/policy.js'
export {
  type RespondInput,
  SupportAgent,
  type SupportAgentDeps,
} from './agent/support-agent.js'
export { CHANNEL_MESSAGE_LIMITS } from './channels/limits.js'
export { type RenderableMessage, renderForChannel } from './channels/render-for-channel.js'
export {
  type Audience,
  type Channel,
  type Citation,
  type ConversationSnapshot,
  type ConversationState,
  type KnowledgeAudience,
  type Locale,
  SUPPORT_CHANNELS,
  SUPPORTED_LOCALES,
  type SupportEvent,
  type TokenUsage,
  type TranscriptMessage,
  type TurnOutcome,
} from './domain.js'
export { isAudience } from './guards/is-audience.js'
export { isKnowledgeAudience } from './guards/is-knowledge-audience.js'
export { isLocale } from './guards/is-locale.js'
export {
  type ChunkOptions,
  chunkKnowledgeDocument,
  DEFAULT_CHUNK_CHARS,
} from './knowledge/chunk-knowledge-document.js'
export { KnowledgeSourceError } from './knowledge/knowledge-source-error.js'
export { parseHelpArticle } from './knowledge/parse-help-article.js'
export type { KnowledgeChunk, KnowledgeDocument } from './knowledge/types.js'
export type {
  ChannelAdapter,
  ChannelRecipient,
  ChatModel,
  ChatStepEvent,
  ChatStepInput,
  Embedder,
  KnowledgeHit,
  KnowledgeIndex,
  KnowledgeQuery,
  ModelMessage,
  ModelToolCall,
  ToolChoice,
  ToolInputSchema,
  ToolSpec,
} from './ports.js'
export { FIXED_TEXTS } from './prompts/fixed-texts.js'
export { HANDOFF_TOOL, SEARCH_TOOL } from './prompts/support-tools.js'
export type { ConversationEvent } from './conversation/conversation-event.js'
export { InvalidTransitionError } from './conversation/invalid-transition-error.js'
export { transition } from './conversation/transition.js'
