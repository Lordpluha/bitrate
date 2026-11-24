import type { SharedV4ProviderOptions } from '@ai-sdk/provider'
import type { ChatModelOptions } from './chat-model-options.js'

/**
 * AI SDK `providerOptions` for one call. Effort maps to Anthropic's `effort`, whose thinking
 * tokens are billed as output; other providers ignore it rather than receive a foreign key.
 */
export function toProviderOptions(
  provider: string,
  options: ChatModelOptions,
): SharedV4ProviderOptions | undefined {
  if (provider === 'anthropic' && options.effort) {
    return { anthropic: { effort: options.effort } }
  }
  return undefined
}
