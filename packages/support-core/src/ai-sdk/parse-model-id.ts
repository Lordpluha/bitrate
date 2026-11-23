import { SupportModelConfigError } from './support-model-config-error.js'

/** `provider:model`, as in `SUPPORT_CHAT_MODEL=anthropic:claude-haiku-5-5`. */
interface ParsedModelId {
  provider: string
  modelId: string
}

export function parseModelId(id: string): ParsedModelId {
  const separator = id.indexOf(':')
  const provider = id.slice(0, separator)
  const modelId = id.slice(separator + 1).trim()
  if (separator <= 0 || modelId === '') {
    throw new SupportModelConfigError(`Model id "${id}" must look like "provider:model"`)
  }
  return { provider, modelId }
}
