/**
 * Vercel AI SDK implementations of the core's model ports (ADR-0074). Kept behind the
 * `@bitrate/support-core/ai-sdk` entry so the core itself depends on no model SDK.
 */
export { aiSdkChatModel } from './ai-sdk-chat-model.js'
export { aiSdkEmbedder } from './ai-sdk-embedder.js'
export {
  createSupportModels,
  type SupportModelKeys,
  type SupportModels,
} from './create-support-models.js'
export { SupportModelConfigError } from './support-model-config-error.js'
export { SupportModelError } from './support-model-error.js'
