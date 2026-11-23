export {
  DEFAULT_POLICY,
  type RespondInput,
  SupportAgent,
  type SupportAgentDeps,
  type SupportAgentPolicy,
} from './agent.js'
export {
  CHANNEL_MESSAGE_LIMITS,
  type RenderableMessage,
  renderForChannel,
} from './channels/render.js'
export {
  type Audience,
  type Channel,
  type Citation,
  type ConversationSnapshot,
  type ConversationState,
  isAudience,
  isKnowledgeAudience,
  isLocale,
  type KnowledgeAudience,
  type Locale,
  SUPPORT_CHANNELS,
  SUPPORTED_LOCALES,
  type SupportEvent,
  type TokenUsage,
  type TranscriptMessage,
  type TurnOutcome,
} from './domain.js'
export {
  type ChunkOptions,
  chunkKnowledgeDocument,
  DEFAULT_CHUNK_CHARS,
  type KnowledgeChunk,
  type KnowledgeDocument,
  KnowledgeSourceError,
  parseHelpArticle,
} from './knowledge/chunker.js'
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
export { FIXED_TEXTS, HANDOFF_TOOL, SEARCH_TOOL } from './prompts.js'
export {
  type ConversationEvent,
  InvalidTransitionError,
  transition,
} from './state-machine.js'
